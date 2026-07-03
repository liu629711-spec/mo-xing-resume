// 组队招募 · 联系窗口
export function renderContactWindow(contact) {
  return `
    <div class="retro-contact">
      <div class="retro-contact__dialog">
        <p class="retro-contact__npc">系统消息</p>
        <p class="retro-contact__invite">${escapeHtml(contact.invite || '组队招募中…')}</p>
      </div>
      <div class="retro-contact__actions">
        <button type="button" class="retro-btn" data-copy="${escapeHtml(contact.email || '')}" data-label="✉ 复制邮箱">
          ✉ 复制邮箱
        </button>
        ${contact.wechat ? `
          <button type="button" class="retro-btn" data-copy="${escapeHtml(contact.wechat)}" data-label="✦ 复制微信">
            ✦ 复制微信
          </button>` : ''}
      </div>
      <p class="retro-contact__hint">点击按钮复制到剪贴板</p>
    </div>
  `;
}

export function bindContactWindow(winEl) {
  winEl.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = '✓ 已复制';
        const label = btn.dataset.label || btn.textContent;
        setTimeout(() => { btn.textContent = label; }, 1500);
      } catch {
        btn.textContent = text;
      }
    });
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
