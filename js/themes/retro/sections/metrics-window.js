// 塞尔达式成就符文 · 数据看板
const RARITY_LABEL = {
  legendary: '传说',
  epic: '史诗',
  rare: '稀有',
  common: '普通',
};

export function renderMetricsWindow(metrics = {}) {
  const highlights = metrics.highlights || [];
  const dauCurve = metrics.dauCurve || [];
  const userSources = metrics.userSources || [];
  const roiBars = metrics.roiBars || [];

  const achievementRunes = highlights.map((h) => {
    const rarity = RARITY_LABEL[h.rarity] || '普通';
    return `
      <div class="retro-rune retro-rune--${escapeHtml(h.rarity || 'common')}" title="${escapeHtml(h.achievementId || '')}">
        <div class="retro-rune__value">${escapeHtml(h.value || '')}<span class="retro-rune__unit">${escapeHtml(h.unit || '')}</span></div>
        <div class="retro-rune__label">${escapeHtml(h.label || '')}</div>
        <div class="retro-rune__rarity">${escapeHtml(rarity)}</div>
      </div>
    `;
  }).join('');

  const maxDau = Math.max(1, ...dauCurve.map((d) => d.dau || 0));
  const dauBars = dauCurve.map((d) => {
    const h = Math.round(((d.dau || 0) / maxDau) * 100);
    return `<div class="retro-bar"><span class="retro-bar__label">${escapeHtml(d.month || '')}</span><div class="retro-bar__track"><div class="retro-bar__fill" style="height:${h}%"></div></div><span class="retro-bar__val">${escapeHtml(String(d.dau ?? ''))}</span></div>`;
  }).join('');

  const maxRoi = Math.max(1, ...roiBars.map((r) => r.roi || 0));
  const roiBarsHtml = roiBars.map((r) => {
    const w = Math.round(((r.roi || 0) / maxRoi) * 100);
    return `<div class="retro-roi"><span class="retro-roi__label">${escapeHtml(r.activity || '')}</span><div class="retro-roi__track"><div class="retro-roi__fill" style="width:${w}%"></div></div><span class="retro-roi__val">${escapeHtml(String(r.roi ?? ''))}</span></div>`;
  }).join('');

  const sourcesHtml = userSources.map((s) => `
    <div class="retro-source"><span class="retro-source__label">${escapeHtml(s.label || '')}</span><span class="retro-source__val">${escapeHtml(String(s.value ?? ''))}%</span></div>
  `).join('');

  return `
    <div class="retro-metrics">
      ${achievementRunes ? `<div class="retro-metrics__runes">${achievementRunes}</div>` : ''}
      ${dauBars ? `<div class="retro-metrics__section"><h4>DAU 成长曲线</h4><div class="retro-dau-chart">${dauBars}</div></div>` : ''}
      ${roiBarsHtml ? `<div class="retro-metrics__section"><h4>活动 ROI</h4>${roiBarsHtml}</div>` : ''}
      ${sourcesHtml ? `<div class="retro-metrics__section"><h4>用户来源</h4><div class="retro-sources">${sourcesHtml}</div></div>` : ''}
    </div>
  `;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
