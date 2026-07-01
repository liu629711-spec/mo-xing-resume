// 板块 3：峰峦叠嶂 · 项目案例（含详情卷 overlay）
export function renderProjects(el, projects) {
  if (!projects.length) {
    el.innerHTML = `<div class="content-wrap"><p class="ink-text" style="opacity:.5">项目内容更新中。</p></div>`;
    return;
  }
  el.innerHTML = `
    <div class="content-wrap">
      <div class="section-head">
        <div class="section-ji">峰 峦 叠 嶂</div>
        <h2 class="section-title">项目如山</h2>
      </div>
      <p class="ink-text ink-text-lg" style="margin-bottom:3vh;opacity:.7">点击山牌，展开项目详情卷。</p>
      <div class="projects-peaks">
        ${projects.map((p, i) => `
          <article class="ink-card peak-card" data-idx="${i}" tabindex="0" role="button" aria-label="查看项目 ${escapeHtml(p.name)}">
            <div class="peak-name">${escapeHtml(p.name)}</div>
            <div class="peak-period">${escapeHtml(p.period)}</div>
            <div class="peak-metrics">
              <div class="peak-metric"><span class="v">${escapeHtml(p.metrics.dau)}</span><span class="l">DAU</span></div>
              <div class="peak-metric"><span class="v">${escapeHtml(p.metrics.retention)}</span><span class="l">留存</span></div>
              <div class="peak-metric"><span class="v">${escapeHtml(p.metrics.revenue)}</span><span class="l">收入</span></div>
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  `;

  el.querySelectorAll('.peak-card').forEach((card) => {
    card.addEventListener('click', () => openProjectDetail(projects[parseInt(card.dataset.idx, 10)]));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openProjectDetail(projects[parseInt(card.dataset.idx, 10)]);
      }
    });
  });
}

function openProjectDetail(p) {
  const overlay = document.getElementById('project-detail-overlay');
  if (!overlay) return;
  overlay.innerHTML = `
    <div class="detail-scroll" role="document">
      <button class="detail-close" aria-label="收卷关闭">收卷</button>
      <h3 class="detail-title">${escapeHtml(p.name)}</h3>
      <div class="detail-meta">${escapeHtml(p.period)} · ${escapeHtml(p.role)}</div>
      <div class="detail-metrics-grid">
        <div class="peak-metric"><span class="v">${escapeHtml(p.metrics.dau)}</span><span class="l">DAU 增长</span></div>
        <div class="peak-metric"><span class="v">${escapeHtml(p.metrics.retention)}</span><span class="l">留存提升</span></div>
        <div class="peak-metric"><span class="v">${escapeHtml(p.metrics.revenue)}</span><span class="l">收入变化</span></div>
      </div>
      <div class="detail-section">
        <h4>职责</h4>
        <ul class="detail-list">${p.duties.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}</ul>
      </div>
      <div class="detail-section">
        <h4>关键举措</h4>
        <ul class="detail-list">${p.actions.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
      </div>
    </div>
  `;
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  const close = () => {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '';
    document.removeEventListener('keydown', onKey);
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  overlay.querySelector('.detail-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
