// 四季流转系统：根据本地月份决定季节，提供色值并写入 CSS 变量。

export const SEASON_VARS = {
  spring: { paper: '#F5EFE0', ink: '#1A1A1A', gold: '#C9A961', accent: '#E8B4B8' },
  summer: { paper: '#E8EDE8', ink: '#0D0D0D', gold: '#B89968', accent: '#6B8E7F' },
  autumn: { paper: '#EDE4D3', ink: '#141414', gold: '#D4AF37', accent: '#B5483A' },
  winter: { paper: '#F0F0F2', ink: '#2A2A2A', gold: '#A8A8B0', accent: '#B8C5D6' },
};

export const SEASON_ORDER = ['spring', 'summer', 'autumn', 'winter'];

// monthIndex: 0-11（Date.getMonth() 返回值）
export function getSeasonByMonth(monthIndex) {
  const m = ((monthIndex % 12) + 12) % 12;
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'autumn';
  return 'winter';
}

export function applySeasonVars(season) {
  const v = SEASON_VARS[season];
  if (!v) throw new Error(`Unknown season: ${season}`);
  const root = document.documentElement;
  root.style.setProperty('--paper', v.paper);
  root.style.setProperty('--ink', v.ink);
  root.style.setProperty('--gold', v.gold);
  root.style.setProperty('--accent', v.accent);
  root.dataset.season = season;
}

// 当前季节（按本地月份）
export function currentSeason() {
  return getSeasonByMonth(new Date().getMonth());
}

// 季节切换回调注册（Three.js 着色器 uniform 等可注册此处）
const seasonListeners = new Set();
export function onSeasonChange(fn) {
  seasonListeners.add(fn);
  return () => seasonListeners.delete(fn);
}

function dispatchSeasonChange(season) {
  for (const fn of seasonListeners) {
    try { fn(season, SEASON_VARS[season]); } catch (e) { console.warn(e); }
  }
}

// 平滑切换季节：CSS 变量即时设置，transition 由 CSS 处理；通知监听器
export function setSeason(season) {
  applySeasonVars(season);
  dispatchSeasonChange(season);
  const switcher = document.getElementById('season-switcher');
  if (switcher) {
    switcher.querySelectorAll('button').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.season === season);
    });
  }
}

// 初始化右上角四季切换器
export function initSeasonSwitcher() {
  const switcher = document.getElementById('season-switcher');
  if (!switcher) return;
  switcher.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      setSeason(btn.dataset.season);
    });
  });
  // 标记当前季节
  const cur = currentSeason();
  switcher.querySelectorAll('button').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.season === cur);
  });
}
