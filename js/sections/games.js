// 板块 5：碑林 · 游戏作品墙
export function renderGames(el, games) {
  if (!games.length) {
    el.innerHTML = `<div class="content-wrap"><p class="ink-text" style="opacity:.5">作品内容更新中。</p></div>`;
    return;
  }
  el.innerHTML = `
    <div class="content-wrap">
      <div class="section-head">
        <div class="section-ji">碑 林</div>
        <h2 class="section-title">运营碑石</h2>
      </div>
      <p class="ink-text ink-text-lg" style="margin-bottom:3vh;opacity:.7">点击碑石查看运营心得。</p>
      <div class="stele-grid">
        ${games.map((g, i) => g.nda ? `
          <div class="stele" data-idx="${i}" tabindex="0">
            <div class="stele-cover stele-nda">无字碑</div>
            <div class="stele-name">${escapeHtml(g.name)}</div>
            <div class="stele-meta">${escapeHtml(g.note)}</div>
          </div>
        ` : `
          <div class="stele" data-idx="${i}" tabindex="0" role="button" aria-label="查看 ${escapeHtml(g.name)}">
            <div class="stele-cover" ${g.cover ? `style="background-image:url('${escapeHtml(g.cover)}')"` : ''}></div>
            <div class="stele-name">${escapeHtml(g.name)}</div>
            <div class="stele-meta">${escapeHtml(g.type)} · ${escapeHtml(g.period)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  el.querySelectorAll('.stele').forEach((s) => {
    if (s.querySelector('.stele-nda')) return;
    s.addEventListener('click', () => openGameDetail(games[parseInt(s.dataset.idx, 10)]));
    s.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openGameDetail(games[parseInt(s.dataset.idx, 10)]);
      }
    });
  });
}

function openGameDetail(g) {
  const overlay = document.getElementById('project-detail-overlay');
  if (!overlay) return;
  overlay.innerHTML = `
    <div class="detail-scroll" role="document">
      <button class="detail-close" aria-label="关闭">收卷</button>
      <h3 class="detail-title">${escapeHtml(g.name)}</h3>
      <div class="detail-meta">${escapeHtml(g.type)} · ${escapeHtml(g.period)} · ${escapeHtml(g.role)}</div>
      <div class="detail-section">
        <h4>运营心得</h4>
        <p class="ink-text" style="line-height:1.9">${escapeHtml(g.note)}</p>
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
