// 主题管理：解析、持久化、生命周期调度
import { loadAllData } from './data-loader.js';

export const STORAGE_KEY = 'mx-resume-theme';
const ALLOWED = new Set(['ink', 'retro']);

export function parseThemeFromSearch(search) {
  const id = new URLSearchParams(search).get('theme');
  return id && ALLOWED.has(id) ? id : null;
}

export function resolveThemeId(search, allowedIds, defaultTheme = 'ink') {
  const fromUrl = parseThemeFromSearch(search);
  if (fromUrl && allowedIds.includes(fromUrl)) return fromUrl;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && allowedIds.includes(stored)) return stored;
  return defaultTheme;
}

export class ThemeManager {
  /** @type {string} */
  themeId;

  /** @type {import('./theme-registry.js').ThemeModule\|null} */
  activeTheme = null;

  /** @type {object|null} */
  ctx = null;

  /**
   * @param {{ default: string, themes: Array<{ id: string, label: string }> }} meta
   * @param {string} themeId
   */
  constructor(meta, themeId) {
    this.meta = meta;
    this.themeId = themeId;
  }

  async start() {
    localStorage.setItem(STORAGE_KEY, this.themeId);
    document.documentElement.dataset.theme = this.themeId;

    const data = await loadAllData(this.themeId);
    this.ctx = { data, themeId: this.themeId, manager: this };

    const { getTheme } = await import('./theme-registry.js');
    this.activeTheme = getTheme(this.themeId);
    await this.activeTheme.init(this.ctx);
    await this.activeTheme.boot(this.ctx);
  }

  /** 切换主题：P0 采用整页重载，确保水墨 runtime 完全卸载 */
  switchTo(nextId) {
    if (nextId === this.themeId) return;
    localStorage.setItem(STORAGE_KEY, nextId);
    const url = new URL(window.location.href);
    url.searchParams.set('theme', nextId);
    window.location.href = url.toString();
  }

  getThemeList() {
    return this.meta.themes;
  }
}
