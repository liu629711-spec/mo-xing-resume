// 8-bit 角色卡 · 关于窗口
export function renderAboutWindow(profile) {
  const className = profile.className || '冒险者';
  const level = profile.level ?? '?';
  const seal = profile.seal || profile.name?.[0] || '?';
  const summary = Array.isArray(profile.summary) ? profile.summary : [];

  return `
    <div class="retro-about">
      <div class="retro-about__portrait">
        <div class="retro-about__sprite">${escapeHtml(seal)}</div>
        <div class="retro-about__level">Lv.${escapeHtml(String(level))}</div>
      </div>
      <div class="retro-about__stats">
        <h2 class="retro-about__name">${escapeHtml(profile.name || '')}</h2>
        <p class="retro-about__class">${escapeHtml(className)}</p>
        <p class="retro-about__tagline">${escapeHtml(profile.tagline || '')}</p>
        <ul class="retro-about__summary">
          ${summary.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
