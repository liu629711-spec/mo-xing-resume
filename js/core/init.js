// 应用入口：主题选择 → ThemeManager 调度
import { ThemeManager, resolveThemeId } from './theme-manager.js';
import { initThemeSwitcher } from './theme-switcher.js';
import { initDisclaimer } from './disclaimer.js';

async function main() {
  const metaRes = await fetch('data/themes.json');
  if (!metaRes.ok) throw new Error('无法加载 data/themes.json');
  const meta = await metaRes.json();
  const allowedIds = meta.themes.map((t) => t.id);
  const themeId = resolveThemeId(location.search, allowedIds, meta.default);

  const manager = new ThemeManager(meta, themeId);
  initThemeSwitcher(manager);
  initDisclaimer();

  await manager.start();
}

main().catch((e) => console.error('[init] 启动失败:', e));
