// 屏保：60s 无操作后启动，任意输入退出
const IDLE_MS = 60_000;

/**
 * @param {HTMLElement} host
 * @returns {{ start: Function, dispose: Function }}
 */
export function createScreensaver(host) {
  let overlay = null;
  let timer = 0;
  let active = false;

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'retro-screensaver';
    overlay.innerHTML = `
      <div class="retro-screensaver__float">PRESS ANY KEY</div>
      <div class="retro-screensaver__float retro-screensaver__float--2">SCREENSAVER</div>
    `;
    host.appendChild(overlay);
  }

  function enter() {
    if (active) return;
    active = true;
    buildOverlay();
  }

  function exit() {
    if (!active) return;
    active = false;
    overlay?.remove();
    overlay = null;
    resetTimer();
  }

  function resetTimer() {
    clearTimeout(timer);
    timer = setTimeout(enter, IDLE_MS);
  }

  function onActivity() {
    if (active) {
      exit();
    } else {
      resetTimer();
    }
  }

  function start() {
    resetTimer();
    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach((ev) =>
      document.addEventListener(ev, onActivity, { passive: true }),
    );
  }

  function dispose() {
    clearTimeout(timer);
    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach((ev) =>
      document.removeEventListener(ev, onActivity),
    );
    overlay?.remove();
  }

  return { start, dispose };
}
