// 复古主题：跳转 samsy-ninja 完整 3D 互动体验（独立 SPA，需 COOP/COEP 头，请用 npm run dev 启动）
export const id = 'retro';

const SAMSY_ENTRY = '/samsy/index.html?forceWebGL=true&cdn=false';

export async function init(ctx) {
  // samsy 必须整页加载（iframe 会导致资源路径 404 + 缺少隔离头）
  if (!window.location.pathname.startsWith('/samsy')) {
    window.location.replace(SAMSY_ENTRY);
    return;
  }

  document.body.classList.remove('theme-ink-active');
  document.body.classList.add('theme-retro-active');

  const cfg = ctx.data.bootConfig || {};
  document.title = cfg.pageTitle || '我的一生 · 复古电脑';
}

export async function boot(ctx) {
  // 已在 /samsy/ 路径时由 samsy SPA 自行运行
}

export async function destroy() {
  document.body.classList.remove('theme-retro-active');
  document.body.classList.add('theme-ink-active');
}
