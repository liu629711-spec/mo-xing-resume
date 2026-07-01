// 全局状态：当前板块、滚动进度、季节
export const state = {
  currentSection: null,
  scrollProgress: 0,
  season: null,
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  isMobile: window.matchMedia('(max-width: 768px)').matches,
  activatedSections: new Set(),
};
