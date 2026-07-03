// ARPG 技能树 · 分支分组
const BRANCH_LABEL = {
  growth: '增长系',
  combat: '战斗系',
  craft: '工具系',
};

export function renderSkillsWindow(skills = []) {
  if (!skills.length) {
    return '<div class="retro-empty">暂无技能</div>';
  }

  const groups = skills.map((cat) => {
    const branch = BRANCH_LABEL[cat.branch] || '通用';
    const items = (cat.items || []).map((it) => {
      const pct = Math.round((it.level || 0) * 100);
      return `
        <div class="retro-skill-node">
          <div class="retro-skill-node__head">
            <span class="retro-skill-node__name">${escapeHtml(it.name)}</span>
            <span class="retro-skill-node__lvl">Lv.${pct}</span>
          </div>
          <div class="retro-skill-node__bar"><div class="retro-skill-node__fill" style="width:${pct}%"></div></div>
          <p class="retro-skill-node__story">${escapeHtml(it.story || '')}</p>
        </div>
      `;
    }).join('');

    return `
      <div class="retro-skill-branch" data-branch="${escapeHtml(cat.branch || '')}">
        <h3 class="retro-skill-branch__title">${escapeHtml(cat.category)} <span class="retro-skill-branch__tag">${escapeHtml(branch)}</span></h3>
        <div class="retro-skill-branch__nodes">${items}</div>
      </div>
    `;
  }).join('');

  return `<div class="retro-skills">${groups}</div>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
