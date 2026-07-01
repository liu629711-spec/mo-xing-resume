// 开卷仪式 Loading：编排墨滴 → 名字浮现 → 金缮裂纹 → 进入主页。

import { playInkDrop } from '../effects/ink-drop.js';
import { playKintsugiTransition } from '../effects/kintsugi.js';

export function playLoadingSequence(profile) {
  const screen = document.getElementById('loading-screen');
  const skipBtn = document.getElementById('skip-loading');
  if (!screen) return Promise.resolve();

  const name = (profile && profile.name) || '墨行';

  let skipped = false;
  const skip = () => { skipped = true; };

  if (skipBtn) skipBtn.addEventListener('click', skip);

  return new Promise((resolve) => {
    if (skipped) return finish();

    // 名字元素（动态创建在 loading 屏内）
    const nameEl = document.createElement('div');
    nameEl.id = 'loading-name';
    nameEl.textContent = name;
    Object.assign(nameEl.style, {
      position: 'absolute', left: '50%', top: '50%',
      transform: 'translate(-50%, -50%)',
      fontFamily: "var(--font-title)",
      fontSize: 'clamp(3rem, 9vw, 7rem)',
      color: 'var(--ink)',
      opacity: 0,
      letterSpacing: '0.15em',
      pointerEvents: 'none',
      zIndex: 2,
    });
    screen.appendChild(nameEl);

    playInkDrop({
      onRippleComplete() {
        // 墨晕扩散到一半时名字浮现
        if (typeof gsap !== 'undefined' && !skipped) {
          gsap.to(nameEl, { opacity: 1, duration: 0.8, ease: 'power2.out' });
          gsap.fromTo(nameEl, { scale: 1.25 }, { scale: 1, duration: 1.2, ease: 'power3.out' });
        }
      },
    }).then(() => {
      if (skipped) return finish();
      // 金缮裂纹铺满
      return playKintsugiTransition();
    }).then(() => {
      if (skipped) return finish();
      finish();
    });

    function finish() {
      if (skipBtn) skipBtn.removeEventListener('click', skip);
      screen.classList.add('is-done');
      setTimeout(() => {
        screen.style.display = 'none';
        resolve();
      }, 800);
    }
  });
}
