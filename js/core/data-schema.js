// 数据 schema 校验：纯函数，供测试与运行时加载校验共用。

const is = {
  obj: (v) => v !== null && typeof v === 'object' && !Array.isArray(v),
  arr: (v) => Array.isArray(v),
  str: (v) => typeof v === 'string',
  num: (v) => typeof v === 'number' && !Number.isNaN(v),
};

export function validateProfile(p) {
  if (!is.obj(p)) return false;
  if (!is.str(p.name) || !p.name) return false;
  if (!is.str(p.tagline)) return false;
  if (!is.arr(p.summary)) return false;
  if (!is.str(p.seal)) return false;
  return true;
}

export function validateSkills(s) {
  if (!is.arr(s) || s.length === 0) return false;
  for (const cat of s) {
    if (!is.obj(cat)) return false;
    if (!is.str(cat.category) || !cat.category) return false;
    if (!is.arr(cat.items) || cat.items.length === 0) return false;
    for (const it of cat.items) {
      if (!is.obj(it)) return false;
      if (!is.str(it.name) || !it.name) return false;
      if (!is.num(it.level) || it.level < 0 || it.level > 1) return false;
      if (!is.str(it.story)) return false;
    }
  }
  return true;
}

export function validateProjects(p) {
  if (!is.arr(p)) return false;
  for (const pr of p) {
    if (!is.obj(pr)) return false;
    if (!is.str(pr.name) || !pr.name) return false;
    if (!is.str(pr.period)) return false;
    if (!is.str(pr.role)) return false;
    if (!is.obj(pr.metrics)) return false;
    if (!is.arr(pr.duties)) return false;
    if (!is.arr(pr.actions)) return false;
    if (!is.str(pr.image)) return false;
    if (!is.num(pr.impact) || pr.impact < 0 || pr.impact > 1) return false;
  }
  return true;
}

export function validateMetrics(m) {
  if (!is.obj(m)) return false;
  if (!is.arr(m.highlights) || m.highlights.length === 0) return false;
  for (const h of m.highlights) {
    if (!is.obj(h)) return false;
    if (!is.str(h.label) || !is.str(h.value)) return false;
    if (!is.str(h.unit)) return false;
  }
  if (!is.arr(m.dauCurve)) return false;
  if (!is.arr(m.userSources)) return false;
  if (!is.arr(m.roiBars)) return false;
  return true;
}

export function validateGames(g) {
  if (!is.arr(g) || g.length === 0) return false;
  for (const game of g) {
    if (!is.obj(game)) return false;
    if (!is.str(game.name) || !game.name) return false;
    if (!is.str(game.type)) return false;
    if (!is.str(game.period)) return false;
    if (!is.str(game.role)) return false;
    if (!is.str(game.cover)) return false;
    if (!is.str(game.note)) return false;
  }
  return true;
}

export function validateTimeline(t) {
  if (!is.arr(t) || t.length === 0) return false;
  for (const n of t) {
    if (!is.obj(n)) return false;
    if (!is.str(n.year) || !n.year) return false;
    if (!is.str(n.title)) return false;
    if (!is.str(n.org)) return false;
    if (!is.str(n.desc)) return false;
    if (!is.str(n.stamp)) return false;
  }
  return true;
}

export function validateContact(c) {
  if (!is.obj(c)) return false;
  if (!is.str(c.email) || !c.email) return false;
  if (!is.str(c.wechat)) return false;
  if (!is.str(c.invite)) return false;
  return true;
}
