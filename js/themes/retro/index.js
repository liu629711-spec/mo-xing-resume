// 复古主题：DOM 像素房间 → GSAP 开场 → Win95 桌面
import { state } from '../../core/state.js';
import { buildRoom } from './room-dom.js';
import { playBootSequence } from './boot.js';
import { createDesktop } from './desktop.js';
import { createScreensaver } from './screensaver.js';
import { showEnding } from './ending.js';
import { SFX, setSoundEnabled, isSoundEnabled } from './sound.js';
import {
  addVisited, isAllVisited, getCompletionPercent,
  loadVisited, saveVisited, ALL_SECTIONS,
} from './exploration.js';

export const id = 'retro';

/** @type {ReturnType<createDesktop>|null} */
let desktop = null;

/** @type {ReturnType<createScreensaver>|null} */
let screensaver = null;

/** @type {ReturnType<buildRoom>|null} */
let room = null;

/** @type {Set<string>} */
let visited = new Set();

let endingShown = false;

/** @param {{ data: object }} ctx */
export async function init(ctx) {
  hideInkShell();
  loadRetroStyles();

  const profile = ctx.data.profile || {};
  document.title = profile.pageTitle || '复古电脑 · 游戏运营简历';

  visited = loadVisited();

  const root = ensureRoot();
  root.innerHTML = `
    <div class="retro-stage" id="retro-stage"></div>
    <div class="retro-desktop-layer" id="retro-desktop-layer"></div>
    <div id="retro-status-bar" class="retro-status-bar">
      <span class="retro-status-bar__explore">探索 <span id="retro-explore-pct">${getCompletionPercent(visited)}%</span></span>
      <button type="button" class="retro-status-bar__sound" id="retro-sound-toggle" aria-label="音效开关">♪</button>
    </div>
  `;

  document.body.classList.remove('theme-ink-active');
  document.body.classList.add('theme-retro-active');

  const desktopLayer = root.querySelector('#retro-desktop-layer');
  desktop = createDesktop(desktopLayer, ctx.data, {
    onOpenSection: (id) => handleVisit(id, ctx),
  });

  bindSoundToggle(root);
  updateExploreDisplay();
}

/** @param {{ data: object }} ctx */
export async function boot(ctx) {
  const root = document.getElementById('retro-root');
  const stage = root?.querySelector('#retro-stage');
  const desktopLayer = root?.querySelector('#retro-desktop-layer');

  function showDesktop() {
    if (stage) stage.style.display = 'none';
    if (desktopLayer) desktopLayer.classList.add('is-visible');
    if (room) {
      room.dispose();
      room = null;
    }
    startScreensaver(root);
    checkEnding(ctx);
  }

  if (!stage) {
    showDesktop();
    return;
  }

  // 构建 DOM 像素房间
  room = buildRoom(stage, ctx.data.roomProps || []);

  // 摆件点击彩蛋
  stage.addEventListener('retro:prop-click', (e) => {
    SFX.easter();
    showPropEasterCard(root, e.detail);
  });

  playBootSequence(room, {
    reducedMotion: state.reducedMotion,
    isMobile: state.isMobile,
    onComplete: showDesktop,
  });
}

export function destroy() {
  screensaver?.dispose();
  screensaver = null;
  desktop?.dispose();
  desktop = null;
  room?.dispose();
  room = null;
  document.getElementById('retro-root')?.remove();
  document.body.classList.remove('theme-retro-active');
}

function handleVisit(sectionId, ctx) {
  if (!ALL_SECTIONS.includes(sectionId)) return;
  const next = addVisited(visited, sectionId);
  if (next.size === visited.size) return;
  visited = next;
  saveVisited(visited);
  updateExploreDisplay();
  SFX.open();
  checkEnding(ctx);
}

function updateExploreDisplay() {
  const el = document.getElementById('retro-explore-pct');
  if (el) el.textContent = `${getCompletionPercent(visited)}%`;
}

function checkEnding(ctx) {
  if (endingShown) return;
  if (!isAllVisited(visited)) return;
  endingShown = true;
  SFX.achievement();
  const root = document.getElementById('retro-root');
  if (root) showEnding(root, ctx.data);
}

function bindSoundToggle(root) {
  const btn = root.querySelector('#retro-sound-toggle');
  if (!btn) return;
  const sync = () => {
    btn.classList.toggle('is-on', isSoundEnabled());
    btn.textContent = isSoundEnabled() ? '♪' : '♪̸';
  };
  sync();
  btn.addEventListener('click', () => {
    setSoundEnabled(!isSoundEnabled());
    sync();
    if (isSoundEnabled()) SFX.open();
  });
}

function startScreensaver(root) {
  if (state.reducedMotion) return;
  screensaver = createScreensaver(root);
  screensaver.start();
}

/** @param {HTMLElement} root @param {object} data */
function showPropEasterCard(root, data) {
  const existing = root.querySelector('.retro-easter');
  existing?.remove();

  const card = document.createElement('div');
  card.className = 'retro-easter';
  card.innerHTML = `
    <div class="retro-easter__card">
      <button type="button" class="retro-easter__close" aria-label="关闭">✕</button>
      <h3 class="retro-easter__game">${escapeHtml(data.gameName)}</h3>
      <p class="retro-easter__prop">${escapeHtml(data.propLabel || '')}</p>
      ${data.tooltip ? `<p class="retro-easter__tip">${escapeHtml(data.tooltip)}</p>` : ''}
      <p class="retro-easter__hint">致敬经典 · 相关版权归原权利人所有</p>
    </div>
  `;
  root.appendChild(card);

  card.querySelector('.retro-easter__close')?.addEventListener('click', () => card.remove());
  card.addEventListener('click', (e) => {
    if (e.target === card) card.remove();
  });

  if (typeof gsap !== 'undefined') {
    gsap.fromTo(card, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 });
    gsap.fromTo(card.querySelector('.retro-easter__card'), { scale: 0.8, rotation: -3 }, { scale: 1, rotation: 0, duration: 0.4, ease: 'back.out(1.6)' });
  }
}

function ensureRoot() {
  let root = document.getElementById('retro-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'retro-root';
    root.className = 'retro-root';
    document.body.appendChild(root);
  }
  return root;
}

function hideInkShell() {
  [
    'paper-bg', 'three-canvas', 'loading-screen', 'scroll-container',
    'kintsugi-overlay', 'ink-ripple-overlay', 'season-switcher', 'explore-progress',
    'project-detail-overlay',
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function loadRetroStyles() {
  [
    'css/themes/retro/room.css',
    'css/themes/retro/desktop.css',
    'css/themes/retro/extras.css',
  ].forEach((href) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
