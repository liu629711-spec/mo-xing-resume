/**
 * @param {import('./theme-manager.js').ThemeManager} manager
 */
export function initThemeSwitcher(manager) {
  const nav = document.getElementById('theme-switcher');
  if (!nav) return;

  nav.innerHTML = '';
  nav.setAttribute('aria-label', '风格切换');

  const label = document.createElement('span');
  label.className = 'theme-switcher__label';
  label.textContent = '风格';
  nav.appendChild(label);

  manager.getThemeList().forEach((theme) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.theme = theme.id;
    btn.textContent = theme.label;
    btn.className = 'theme-switcher__btn';
    if (theme.id === manager.themeId) {
      btn.classList.add('is-active');
      btn.setAttribute('aria-current', 'true');
    }
    btn.addEventListener('click', () => manager.switchTo(theme.id));
    nav.appendChild(btn);
  });
}
