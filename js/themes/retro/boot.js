// GSAP timeline 驱动 DOM 像素房间开场分镜
// 分镜：走入房间 → 走近书桌 → 低头 → 等 Enter → 按键 → 亮屏 → 吸入屏幕 → 白闪
import { SFX } from './sound.js';

/**
 * @param {ReturnType<import('./room-dom.js').buildRoom>} room
 * @param {object} options
 */
export function playBootSequence(room, options) {
  const { onComplete, reducedMotion, isMobile } = options;
  const { room: roomEl, screen, pcLed, enterKey, prompt, flash } = room;

  let finished = false;
  let tl = null;
  let enterResolver = null;

  function finish() {
    if (finished) return;
    finished = true;
    cleanup();
    onComplete();
  }

  function cleanup() {
    document.removeEventListener('keydown', keyHandler);
    room.skipBtn?.removeEventListener('click', onSkip);
    if (tl) tl.kill();
    prompt?.classList.remove('is-visible', 'is-pulse');
  }

  function onSkip() {
    if (flash && typeof gsap !== 'undefined') gsap.set(flash, { opacity: 0 });
    finish();
  }

  function keyHandler(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onSkip();
      return;
    }
    if (e.key === 'Enter' && enterResolver) {
      e.preventDefault();
      SFX.enter();
      const resolve = enterResolver;
      enterResolver = null;
      resolve();
    }
  }

  document.addEventListener('keydown', keyHandler);
  room.skipBtn?.addEventListener('click', onSkip);

  // reduced-motion / mobile / 无 GSAP：直接进桌面
  if (reducedMotion || isMobile || typeof gsap === 'undefined') {
    setTimeout(onSkip, 200);
    return { skip: onSkip };
  }

  // 初始状态：房间远（scale 0.55），屏幕暗
  gsap.set(roomEl, { scale: 0.55, y: 30, transformOrigin: '50% 60%' });
  gsap.set(screen, { filter: 'brightness(0.08)' });
  gsap.set(prompt, { opacity: 0 });

  tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    onComplete: finish,
  });

  // ── 0 入场：淡入 + 引导 ──
  tl.addLabel('enter')
    .to(roomEl, { autoAlpha: 1, duration: 0.4 }, 'enter')
    .call(() => {
      if (prompt) {
        prompt.textContent = '走入房间...';
        prompt.classList.add('is-visible');
      }
    }, null, 'enter');

  // ── 1 走近书桌：scale 0.55 → 1，镜头推进 ──
  tl.addLabel('approach', '+=0.5')
    .to(roomEl, { scale: 1, y: 0, duration: 2.6, ease: 'power2.out' }, 'approach')
    .to(prompt, { opacity: 0, duration: 0.3 }, 'approach+=1.5');

  // ── 2 低头：整个房间轻微下沉 + 显示器聚焦，Enter 键高亮 ──
  tl.addLabel('headdown', '+=0.1')
    .to(roomEl, { y: 20, duration: 0.6, ease: 'power2.inOut' }, 'headdown')
    .to(enterKey, { scale: 1.15, duration: 0.4, ease: 'back.out(2)' }, 'headdown')
    .call(() => {
      enterKey?.classList.add('is-active');
      if (prompt) {
        prompt.textContent = '按 Enter 开机';
        prompt.classList.add('is-visible', 'is-pulse');
      }
    }, null, 'headdown');

  // ── 3 等待 Enter ──
  tl.call(() => {
    tl.pause();
    enterResolver = () => tl.resume();
  });

  // ── 4 敲击 Enter：键帽下压 ──
  tl.addLabel('press', '+=0.05')
    .call(() => {
      if (prompt) {
        prompt.textContent = '▶ BOOTING...';
        prompt.classList.remove('is-pulse');
      }
    })
    .to(enterKey, { y: 6, duration: 0.08, ease: 'power2.in' })
    .to(enterKey, { y: 0, duration: 0.15, ease: 'back.out(3)' })
    .call(() => {
      pcLed?.classList.add('is-on');
    });

  // ── 5 抬头 + 显示器亮起 ──
  tl.addLabel('poweron', '+=0.1')
    .to(roomEl, { y: 0, duration: 0.7, ease: 'power2.out' }, 'poweron')
    .to(screen, { filter: 'brightness(1)', duration: 0.7, ease: 'power2.out' }, 'poweron')
    .call(() => {
      screen?.classList.add('is-on');
      if (prompt) prompt.classList.remove('is-visible');
    }, null, 'poweron+=0.3');

  // ── 6 吸入屏幕：房间急速放大 ──
  tl.addLabel('dive', '+=0.2')
    .to(roomEl, {
      scale: 4.5,
      duration: 1.1,
      ease: 'power3.in',
      transformOrigin: '50% 42%',
    }, 'dive')
    .to(screen, { filter: 'brightness(2.5)', duration: 1.0, ease: 'power3.in' }, 'dive');

  // ── 7 白闪 ──
  tl.to(flash, { opacity: 1, duration: 0.35, ease: 'power2.in' }, '-=0.25');

  return { skip: onSkip };
}
