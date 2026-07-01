// 板块 7：归舟渡口 · 联系方式
export function renderContact(el, contact) {
  el.innerHTML = `
    <div class="content-wrap" style="text-align:center">
      <div class="section-ji">归 舟 渡 口</div>
      <h2 class="contact-title">期待同渡</h2>
      <p class="contact-invite">${escapeHtml(contact.invite)}</p>
      <div class="contact-grid">
        <div class="contact-item" data-action="email" tabindex="0" role="button" aria-label="复制邮箱">
          <div class="icon">✉</div>
          <div class="label">邮箱</div>
          <div class="value">${escapeHtml(contact.email)}</div>
        </div>
        <div class="contact-item" data-action="wechat" tabindex="0" role="button" aria-label="查看微信">
          <div class="icon">✦</div>
          <div class="label">微信</div>
          <div class="value">${escapeHtml(contact.wechat)}</div>
          <div class="contact-qr">
            ${contact.wechatQr ? `<img src="${escapeHtml(contact.wechatQr)}" alt="微信二维码" />` : `<div class="ink-text-sm" style="padding:1rem">扫码加微信</div>`}
          </div>
        </div>
        ${contact.phone ? `
          <div class="contact-item" data-action="phone" tabindex="0" role="button">
            <div class="icon">☎</div>
            <div class="label">电话</div>
            <div class="value">${escapeHtml(contact.phone)}</div>
          </div>` : ''}
        ${contact.maimai ? `
          <div class="contact-item" data-action="maimai" tabindex="0" role="button">
            <div class="icon">◉</div>
            <div class="label">脉脉</div>
            <div class="value">查看主页</div>
          </div>` : ''}
      </div>
    </div>
  `;
  bindContactActions(el, contact);
}

function bindContactActions(el, contact) {
  el.querySelectorAll('.contact-item').forEach((item) => {
    const action = item.dataset.action;
    const handler = () => {
      if (action === 'email') {
        copy(contact.email, '邮箱已折好信封');
      } else if (action === 'wechat') {
        const qr = item.querySelector('.contact-qr');
        if (qr) qr.classList.toggle('is-show');
      } else if (action === 'phone') {
        copy(contact.phone, '电话已记下');
      } else if (action === 'maimai' && contact.maimai) {
        window.open(contact.maimai, '_blank');
      }
    };
    item.addEventListener('click', handler);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
    });
  });
}

function copy(text, toastMsg) {
  if (!text) return;
  navigator.clipboard?.writeText(text).then(() => showToast(toastMsg)).catch(() => showToast('复制失败，请手动复制'));
}

function showToast(msg) {
  let toast = document.querySelector('.ink-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'ink-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('is-show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('is-show'), 2000);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
