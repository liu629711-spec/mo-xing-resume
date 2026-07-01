// 板块 6：山径蜿蜒 · 时间轴
export function renderTimeline(el, timeline) {
  if (!timeline.length) {
    el.innerHTML = `<div class="content-wrap"><p class="ink-text" style="opacity:.5">经历内容更新中。</p></div>`;
    return;
  }
  el.innerHTML = `
    <div class="content-wrap">
      <div class="section-head">
        <div class="section-ji">山 径 蜿 蜒</div>
        <h2 class="section-title">行旅年轮</h2>
      </div>
      <div class="timeline-path">
        ${timeline.map((n, i) => `
          <div class="timeline-node" data-idx="${i}">
            <div class="timeline-node-head">
              <span class="timeline-year">${escapeHtml(n.year)}</span>
              <span class="timeline-title">${escapeHtml(n.title)}</span>
              <span class="timeline-org">${escapeHtml(n.org)}</span>
              <span class="timeline-stamp">${escapeHtml(n.stamp)}</span>
            </div>
            <p class="timeline-desc">${escapeHtml(n.desc)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 进入视口时逐节点点亮
export function animateTimeline(el) {
  const nodes = el.querySelectorAll('.timeline-node');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  nodes.forEach((n) => io.observe(n));
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
