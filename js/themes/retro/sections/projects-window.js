// FF 风格项目列表 · 副本挑战
export function renderProjectsWindow(projects = []) {
  if (!projects.length) {
    return '<div class="retro-empty">暂无副本记录</div>';
  }

  const sorted = [...projects].sort((a, b) => (b.impact ?? 0) - (a.impact ?? 0));

  const items = sorted.map((p, i) => {
    const clearRate = Math.round((p.clearRate ?? p.impact ?? 0) * 100);
    return `
      <button type="button" class="retro-project-item" data-project-idx="${i}">
        <span class="retro-project-item__icon">📁</span>
        <span class="retro-project-item__name">${escapeHtml(p.name)}</span>
        <span class="retro-project-item__dungeon">${escapeHtml(p.dungeonName || '')}</span>
        <span class="retro-project-item__rate">CLEAR ${clearRate}%</span>
      </button>
    `;
  }).join('');

  const detail = renderProjectDetail(sorted[0]);

  return `
    <div class="retro-projects">
      <div class="retro-projects__list">
        <div class="retro-projects__header">▶ 副本挑战记录</div>
        ${items}
      </div>
      <div class="retro-projects__detail" id="retro-project-detail">
        ${detail}
      </div>
    </div>
  `;
}

export function renderProjectDetail(p) {
  if (!p) return '<div class="retro-empty">选择一个副本查看详情</div>';
  const duties = (p.duties || []).map((d) => `<li>${escapeHtml(d)}</li>`).join('');
  const actions = (p.actions || []).map((a) => `<li>${escapeHtml(a)}</li>`).join('');
  const m = p.metrics || {};
  return `
    <div class="retro-project-detail">
      <h3 class="retro-project-detail__name">${escapeHtml(p.name)}</h3>
      <p class="retro-project-detail__meta">${escapeHtml(p.period || '')} · ${escapeHtml(p.role || '')}</p>
      ${p.dungeonName ? `<p class="retro-project-detail__dungeon">副本：${escapeHtml(p.dungeonName)}</p>` : ''}
      ${p.bossName ? `<p class="retro-project-detail__boss">BOSS：${escapeHtml(p.bossName)}</p>` : ''}
      ${(m.dau || m.retention || m.revenue) ? `
        <div class="retro-project-detail__metrics">
          ${m.dau ? `<span>DAU ${escapeHtml(m.dau)}</span>` : ''}
          ${m.retention ? `<span>留存 ${escapeHtml(m.retention)}</span>` : ''}
          ${m.revenue ? `<span>流水 ${escapeHtml(m.revenue)}</span>` : ''}
        </div>` : ''}
      ${duties ? `<div class="retro-project-detail__section"><h4>职责</h4><ul>${duties}</ul></div>` : ''}
      ${actions ? `<div class="retro-project-detail__section"><h4>关键动作</h4><ul>${actions}</ul></div>` : ''}
    </div>
  `;
}

export function bindProjectsWindow(winEl, projects = []) {
  const detailHost = winEl.querySelector('#retro-project-detail');
  winEl.querySelectorAll('.retro-project-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.projectIdx);
      const p = projects[idx];
      if (!p || !detailHost) return;
      detailHost.innerHTML = renderProjectDetail(p);
      winEl.querySelectorAll('.retro-project-item').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
