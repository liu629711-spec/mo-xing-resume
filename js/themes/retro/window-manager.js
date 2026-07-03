// Win95 风格窗口管理
import { SFX } from './sound.js';

let zIndex = 100;

/**
 * @param {HTMLElement} windowsRoot
 */
export function createWindowManager(windowsRoot) {
  const stack = [];

  function openWindow({ id, title, contentHtml, width = 420, height = 340 }) {
    const existing = windowsRoot.querySelector(`[data-window-id="${id}"]`);
    if (existing) {
      focusWindow(existing);
      return existing;
    }

    const win = document.createElement('div');
    win.className = 'retro-window';
    win.dataset.windowId = id;
    win.style.width = `${width}px`;
    win.style.height = `${height}px`;
    win.style.zIndex = String(++zIndex);
    win.innerHTML = `
      <div class="retro-window__titlebar">
        <span class="retro-window__title">${escapeHtml(title)}</span>
        <button type="button" class="retro-window__close" aria-label="关闭">✕</button>
      </div>
      <div class="retro-window__body">${contentHtml}</div>
    `;

    const closeBtn = win.querySelector('.retro-window__close');
    closeBtn.addEventListener('click', () => closeWindow(win));

    makeDraggable(win);
    windowsRoot.appendChild(win);
    stack.push(win);
    focusWindow(win);

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(win, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(1.4)' });
    }

    win.addEventListener('mousedown', () => focusWindow(win));
    return win;
  }

  function closeWindow(win) {
    const idx = stack.indexOf(win);
    if (idx >= 0) stack.splice(idx, 1);
    SFX.close();
    if (typeof gsap !== 'undefined') {
      gsap.to(win, {
        scale: 0.9, opacity: 0, duration: 0.15,
        onComplete: () => win.remove(),
      });
    } else {
      win.remove();
    }
  }

  function closeTop() {
    const top = stack[stack.length - 1];
    if (top) closeWindow(top);
  }

  function focusWindow(win) {
    win.style.zIndex = String(++zIndex);
  }

  return { openWindow, closeTop, closeWindow };
}

function makeDraggable(win) {
  const bar = win.querySelector('.retro-window__titlebar');
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let origX = 0;
  let origY = 0;

  bar.addEventListener('mousedown', (e) => {
    if (e.target.closest('.retro-window__close')) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = win.getBoundingClientRect();
    origX = rect.left;
    origY = rect.top;
    win.style.position = 'fixed';
    win.style.left = `${origX}px`;
    win.style.top = `${origY}px`;
    win.style.transform = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    win.style.left = `${origX + e.clientX - startX}px`;
    win.style.top = `${origY + e.clientY - startY}px`;
  });

  document.addEventListener('mouseup', () => { dragging = false; });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
