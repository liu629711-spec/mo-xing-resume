// 板块 2：星罗棋盘 · 技能矩阵（信息层；3D 棋盘阶段 2/4 接入）
export function renderSkills(el, skills) {
  el.innerHTML = `
    <div class="content-wrap">
      <div class="section-head">
        <div class="section-ji">星 罗 棋 盘</div>
        <h2 class="section-title">技能星罗</h2>
      </div>
      <p class="ink-text ink-text-lg" style="margin-bottom:3vh;opacity:.7">悬停棋子可见熟练度，点击展故事。</p>
      <div class="skills-board">
        ${skills.map((cat) => `
          <div class="skill-category" data-cat="${escapeHtml(cat.category)}">
            <h3>${escapeHtml(cat.category)}</h3>
            ${cat.items.map((it) => `
              <div class="skill-item" data-name="${escapeHtml(it.name)}">
                <div class="skill-item-head">
                  <span>${escapeHtml(it.name)}</span>
                  <span class="num">${Math.round(it.level * 100)}</span>
                </div>
                <div class="skill-bar"><div class="skill-bar-fill" data-level="${it.level}"></div></div>
                <div class="skill-story">${escapeHtml(it.story)}</div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 滚动进入时填充熟练度条
export function animateSkillsBars(el) {
  el.querySelectorAll('.skill-bar-fill').forEach((bar, i) => {
    const level = parseFloat(bar.dataset.level);
    setTimeout(() => {
      bar.style.width = `${Math.round(level * 100)}%`;
    }, i * 60);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
