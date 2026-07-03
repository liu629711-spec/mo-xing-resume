// 通关结算 overlay · 探索度满后弹出
import { getCompletionPercent } from './exploration.js';

/**
 * @param {HTMLElement} root
 * @param {{ profile?: object, contact?: object }} data
 */
export function showEnding(root, data) {
  const pct = 100;
  const name = data.profile?.name || 'PLAYER';
  const invite = data.contact?.invite || '组队招募中';

  const overlay = document.createElement('div');
  overlay.className = 'retro-ending';
  overlay.id = 'retro-ending';
  overlay.innerHTML = `
    <div class="retro-ending__card">
      <p class="retro-ending__rank">S</p>
      <h2 class="retro-ending__title">CLEAR!</h2>
      <p class="retro-ending__name">${escapeHtml(name)}</p>
      <p class="retro-ending__line">探索完成度 ${pct}%</p>
      <p class="retro-ending__invite">${escapeHtml(invite)}</p>
      <div class="retro-ending__actions">
        <button type="button" class="retro-btn" id="retro-ending-close">继续探索</button>
        <button type="button" class="retro-btn" id="retro-ending-restart">重新开始</button>
      </div>
    </div>
  `;
  root.appendChild(overlay);

  overlay.querySelector('#retro-ending-close')?.addEventListener('click', () => overlay.remove());
  overlay.querySelector('#retro-ending-restart')?.addEventListener('click', () => {
    overlay.remove();
    location.reload();
  });

  if (typeof gsap !== 'undefined') {
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    gsap.fromTo(overlay.querySelector('.retro-ending__card'), { scale: 0.7, y: 30 }, { scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.6)' });
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
