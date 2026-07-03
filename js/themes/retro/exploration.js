// 探索度追踪：纯函数 + sessionStorage 持久化
export const ALL_SECTIONS = [
  'about', 'skills', 'projects', 'metrics', 'games', 'timeline', 'contact',
];

const STORAGE_KEY = 'mx-retro-visited';

/** @returns {Set<string>} 新集合，含原集合 + id */
export function addVisited(visited, id) {
  if (!id) return new Set(visited);
  const next = new Set(visited);
  next.add(id);
  return next;
}

/** @returns {boolean} 全部板块都访问过 */
export function isAllVisited(visited) {
  return ALL_SECTIONS.every((s) => visited.has(s));
}

/** @returns {number} 0-100 整数百分比 */
export function getCompletionPercent(visited) {
  if (!visited.size) return 0;
  return Math.round((visited.size / ALL_SECTIONS.length) * 100);
}

/** @returns {Set<string>} 从 sessionStorage 恢复 */
export function loadVisited() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

/** @param {Set<string>} visited */
export function saveVisited(visited) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...visited]));
  } catch {
    /* 忽略隐私模式 */
  }
}

export function resetVisited() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* 忽略 */
  }
}
