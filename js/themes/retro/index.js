import { state } from '../../core/state.js';

export const id = 'retro';

let root = null;
let sceneCtx = null;
let bootSequence = null;
let lights = null;
let props = null;
let monitor = null;
let hint = null;
let placeholder = null;
let flash = null;

export async function init(ctx) {
  hideInkShell();
  loadRetroStyles();

  const cfg = ctx.data.bootConfig || {};
  document.title = cfg.pageTitle || '我的一生 · 复古电脑';

  root = ensureRoot();
  root.innerHTML = `
    <div id="retro-loading" class="retro-loading">准备进入房间...</div>
    <canvas id="retro-canvas" class="retro-canvas"></canvas>
    <div id="retro-hint" class="retro-hint" aria-live="polite"></div>
    <div id="retro-white-flash" class="retro-white-flash"></div>
    <div id="retro-placeholder" class="retro-placeholder" hidden></div>
    <button id="retro-skip" class="retro-skip" type="button" aria-label="跳过开场">跳过</button>
  `;
  document.body.classList.remove('theme-ink-active');
  document.body.classList.add('theme-retro-active');
}

export async function boot(ctx) {
  const canvas = root?.querySelector('#retro-canvas');
  const loading = root?.querySelector('#retro-loading');
  if (!canvas) return;

  const cfg = ctx.data.bootConfig || {};

  try {
    const { createRoomScene } = await import('./room/room-scene.js');
    sceneCtx = createRoomScene(canvas, { isMobile: state.isMobile });
  } catch (e) {
    console.error('[retro] WebGL 初始化失败', e);
    if (loading) loading.textContent = 'WebGL 不可用，正在返回水墨主题...';
    setTimeout(() => ctx.manager.switchTo('ink'), 1500);
    return;
  }

  const { addRoomLights } = await import('./room/room-lights.js');
  lights = addRoomLights(sceneCtx.scene);

  try {
    const { buildFallbackRoom } = await import('./room/room-fallback.js');
    buildFallbackRoom(sceneCtx.scene);
  } catch (e) {
    console.warn('[retro] 房间构建失败', e);
  }

  try {
    const { loadRoomProps } = await import('./room/room-props.js');
    props = loadRoomProps(sceneCtx.scene, ctx.data.roomProps || [], { onPropClick: () => {} });
  } catch (e) {
    console.warn('[retro] 摆件加载失败', e);
  }

  let logoTexture = null;
  try {
    const { createLogoTexture } = await import('./monitor/logo-texture.js');
    logoTexture = await createLogoTexture(cfg.logoText || '我的一生', {
      accent: cfg.accentColor, bg: cfg.bgColor,
    });
  } catch (e) {
    console.warn('[retro] LOGO 纹理生成失败', e);
  }
  try {
    const { createMonitorScreen } = await import('./monitor/monitor-screen.js');
    monitor = createMonitorScreen(sceneCtx.scene, cfg, logoTexture);
  } catch (e) {
    console.warn('[retro] 屏幕创建失败', e);
  }

  const { createHintOverlay } = await import('./ui/hint-overlay.js');
  hint = createHintOverlay(root, cfg);

  const { createWhiteFlash } = await import('./transitions/white-flash.js');
  flash = createWhiteFlash(root);

  const { createPlaceholder } = await import('./ui/placeholder-screen.js');
  placeholder = createPlaceholder(root, cfg, { onReturn: () => bootSequence?.resetToRoom?.() });

  if (loading) loading.style.display = 'none';

  const { playBootSequence } = await import('./boot.js');
  bootSequence = playBootSequence({ ctx, root, sceneCtx, monitor, hint, placeholder, flash, cfg, state });
}

export async function destroy() {
  bootSequence?.dispose?.();
  bootSequence = null;
  flash?.dispose?.();
  placeholder?.dispose?.();
  hint?.dispose?.();
  monitor?.dispose?.();
  props?.dispose?.();
  lights?.dispose?.();
  sceneCtx?.dispose?.();
  sceneCtx = null;
  root?.remove();
  root = null;
  document.body.classList.remove('theme-retro-active');
  document.body.classList.add('theme-ink-active');
}

function ensureRoot() {
  let el = document.getElementById('retro-root');
  if (!el) {
    el = document.createElement('div');
    el.id = 'retro-root';
    el.className = 'retro-root';
    document.body.appendChild(el);
  }
  return el;
}

function hideInkShell() {
  ['paper-bg', 'three-canvas', 'loading-screen', 'scroll-container',
   'kintsugi-overlay', 'ink-ripple-overlay', 'season-switcher', 'explore-progress',
   'project-detail-overlay'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function loadRetroStyles() {
  ['css/themes/retro/retro-root.css', 'css/themes/retro/hint-overlay.css', 'css/themes/retro/placeholder.css'].forEach((href) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  });
}
