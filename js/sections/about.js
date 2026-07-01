// 板块 1：入山亭 · 个人介绍
export function renderAbout(el, profile) {
  el.innerHTML = `
    <div class="content-wrap">
      <div class="section-head">
        <div class="section-ji">入 山</div>
        <h2 class="section-title">展卷识人</h2>
      </div>
      <div class="about-grid">
        <div>
          <div class="ink-text-sm">— 一句话 —</div>
          <h1 class="about-name ink-brush-underline">${escapeHtml(profile.name)}</h1>
          <p class="about-tagline">${escapeHtml(profile.tagline)}</p>
          <ul class="about-summary">
            ${profile.summary.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}
          </ul>
        </div>
        <div class="about-seal-wrap">
          <div class="seal seal-square" title="${escapeHtml(profile.name)}">${escapeHtml(profile.seal)}</div>
          <div class="ink-text-sm">钤印</div>
        </div>
      </div>
    </div>
  `;
  // 笔刷下划线动画
  setTimeout(() => {
    el.querySelector('.ink-brush-underline')?.classList.add('is-drawn');
  }, 400);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
