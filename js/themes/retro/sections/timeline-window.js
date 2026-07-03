// DQ 风格时间轴 · 对话框翻页
export function renderTimelineWindow(timeline = []) {
  if (!timeline.length) {
    return '<div class="retro-empty">暂无经历记录</div>';
  }

  const sorted = [...timeline].sort((a, b) => (a.year || '').localeCompare(b.year || ''));
  const first = sorted[0];

  const chapters = sorted.map((n, i) => `
    <button type="button" class="retro-timeline-chapter${i === 0 ? ' is-active' : ''}" data-chapter-idx="${i}">
      <span class="retro-timeline-chapter__year">${escapeHtml(n.year || '')}</span>
      <span class="retro-timeline-chapter__title">${escapeHtml(n.title || '')}</span>
    </button>
  `).join('');

  return `
    <div class="retro-timeline" data-timeline='${escapeAttr(JSON.stringify(sorted))}'>
      <div class="retro-timeline__chapters">${chapters}</div>
      <div class="retro-timeline__dialog" id="retro-timeline-dialog">
        ${renderTimelineDialog(first)}
      </div>
      <div class="retro-timeline__nav">
        <button type="button" class="retro-btn" id="retro-timeline-prev">◀ 上一章</button>
        <button type="button" class="retro-btn" id="retro-timeline-next">下一章 ▶</button>
      </div>
    </div>
  `;
}

export function renderTimelineDialog(n) {
  if (!n) return '<div class="retro-empty">选择章节</div>';
  return `
    <div class="retro-timeline-dialog">
      <p class="retro-timeline-dialog__chapter">${escapeHtml(n.chapterTitle || n.title || '')}</p>
      <p class="retro-timeline-dialog__year">${escapeHtml(n.year || '')} · ${escapeHtml(n.org || '')}</p>
      <p class="retro-timeline-dialog__text">"${escapeHtml(n.dialogue || n.desc || '')}"</p>
      ${n.stamp ? `<span class="retro-timeline-dialog__stamp">${escapeHtml(n.stamp)}</span>` : ''}
    </div>
  `;
}

export function bindTimelineWindow(winEl) {
  const host = winEl.querySelector('.retro-timeline');
  if (!host) return;
  let chapters = [];
  try { chapters = JSON.parse(host.dataset.timeline || '[]'); } catch { chapters = []; }
  let idx = 0;

  const dialogHost = winEl.querySelector('#retro-timeline-dialog');
  const chaptersBtns = winEl.querySelectorAll('.retro-timeline-chapter');

  function render(i) {
    idx = Math.max(0, Math.min(chapters.length - 1, i));
    if (dialogHost) dialogHost.innerHTML = renderTimelineDialog(chapters[idx]);
    chaptersBtns.forEach((b, j) => b.classList.toggle('is-active', j === idx));
  }

  chaptersBtns.forEach((btn, j) => btn.addEventListener('click', () => render(j)));
  winEl.querySelector('#retro-timeline-prev')?.addEventListener('click', () => render(idx - 1));
  winEl.querySelector('#retro-timeline-next')?.addEventListener('click', () => render(idx + 1));
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function escapeAttr(s) {
  return String(s).replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}
