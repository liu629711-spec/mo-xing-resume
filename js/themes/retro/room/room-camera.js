export const CAMERA_KEYS = {
  room:      { pos: [0, 1.6, 3.8],  look: [0, 1.2, 0],  fov: 55 },
  desk:      { pos: [0, 1.25, 1.2], look: [0, 1.05, 0], fov: 50 },
  enter:     { pos: [0, 1.2, 0.95], look: [0, 1.05, 0], fov: 45 },
  diveStart: { pos: [0, 1.15, 0.6], look: [0, 1.05, 0], fov: 40 },
  diveEnd:   { pos: [0, 1.08, 0.15],look: [0, 1.05, 0], fov: 90 },
};

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function lerpKey(from, to, t) {
  return {
    pos: [lerp(from.pos[0], to.pos[0], t), lerp(from.pos[1], to.pos[1], t), lerp(from.pos[2], to.pos[2], t)],
    look: [lerp(from.look[0], to.look[0], t), lerp(from.look[1], to.look[1], t), lerp(from.look[2], to.look[2], t)],
    fov: lerp(from.fov, to.fov, t),
  };
}

// 鼠标坐标 [0,1] → look 偏移：offsetX ∈ [-0.15, 0.15]，offsetY ∈ [-0.08, 0.08]
// 屏幕Y向下，pointerY=0（顶部）→ +0.08（向上看）
export function mapPointer(px, py) {
  const ox = clamp((px - 0.5) * 0.3, -0.15, 0.15);
  const oy = clamp((0.5 - py) * 0.16, -0.08, 0.08);
  return [ox, oy];
}
