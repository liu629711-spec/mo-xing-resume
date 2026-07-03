// 卡带架 · 运营碑石
export function renderGamesWindow(games = []) {
  if (!games.length) {
    return '<div class="retro-empty">卡带架空空如也</div>';
  }

  const cartridges = games.map((g, i) => {
    const color = g.cartridgeColor || '#666';
    const cover = g.cover
      ? `<img class="retro-cartridge__cover" src="${escapeHtml(g.cover)}" alt="${escapeHtml(g.name)}" />`
      : `<div class="retro-cartridge__cover retro-cartridge__cover--placeholder">${escapeHtml((g.name || '?').slice(0, 2))}</div>`;
    return `
      <button type="button" class="retro-cartridge" data-game-idx="${i}" style="--cart-color:${escapeHtml(color)}">
        ${cover}
        <div class="retro-cartridge__label">${escapeHtml(g.name || '')}</div>
        <div class="retro-cartridge__platform">${escapeHtml(g.platform || g.type || '')}</div>
        <div class="retro-cartridge__note">${escapeHtml(g.note || '')}</div>
      </button>
    `;
  }).join('');

  return `<div class="retro-games retro-cartridge-rack">${cartridges}</div>`;
}

export function bindGamesWindow(winEl, games = []) {
  winEl.querySelectorAll('.retro-cartridge').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.gameIdx);
      const g = games[idx];
      if (!g) return;
      const name = g.name || '';
      const desc = g.description || g.note || '';
      alert(`【${name}】\n${desc.replace(/[#*]/g, '')}`);
    });
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
