// 草稿过滤：返回 draft 不为 true 的条目。
// 作者在后台用 draft 开关临时隐藏某条而不删除。
export function filterDraft(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.filter((item) => !item || item.draft !== true);
}
