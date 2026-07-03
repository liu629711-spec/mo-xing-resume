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

// ── 交互函数（任务 12-15 编排使用，不参与纯函数测试） ──
const gsap = window.gsap;
const THREE = window.THREE;

// 绑定鼠标受限视角：pointermove → camera look 偏移平滑跟随
// range: 'room' | 'desk'，决定偏移幅度（desk 更小）
export function bindPointerLook(camera, { range = 'room', getEnabled = () => true } = {}) {
  const factor = range === 'desk' ? 0.6 : 1.0;
  let targetOX = 0, targetOY = 0;
  let baseLook = new THREE.Vector3(camera.userData.baseLookX ?? 0, camera.userData.baseLookY ?? 1.05, 0);

  function onMove(e) {
    if (!getEnabled()) return;
    const px = e.clientX / window.innerWidth;
    const py = e.clientY / window.innerHeight;
    const [ox, oy] = mapPointer(px, py);
    targetOX = ox * factor;
    targetOY = oy * factor;
    gsap.to(camera.userData, {
      lookOX: targetOX, lookOY: targetOY,
      duration: 0.6, ease: 'power2.out', overwrite: true,
    });
  }

  window.addEventListener('pointermove', onMove);
  camera.userData.lookOX = 0;
  camera.userData.lookOY = 0;

  function dispose() {
    window.removeEventListener('pointermove', onMove);
  }
  return { dispose };
}

// 呼吸感：每帧 camera.position.y 累加正弦微起伏
export function applyBreathing(camera, { getEnabled = () => true } = {}) {
  let t = 0;
  let baseY = camera.position.y;
  let rafId = null;
  function loop() {
    t += 0.016;
    if (getEnabled()) {
      camera.position.y = baseY + Math.sin(t * 0.5) * 0.01;
    }
    rafId = requestAnimationFrame(loop);
  }
  loop();
  function stop() {
    if (rafId) cancelAnimationFrame(rafId);
    camera.position.y = baseY;
  }
  return { stop };
}

// GSAP timeline 插值 pos/look/fov
export function tweenTo(camera, fromKey, toKey, { duration = 1, ease = 'power2.inOut', onUpdate, onComplete } = {}) {
  const obj = { t: 0 };
  camera.userData.baseLookX = toKey.look[0];
  camera.userData.baseLookY = toKey.look[1];
  const tl = gsap.timeline({ onComplete });
  tl.to(obj, {
    t: 1, duration, ease,
    onUpdate: () => {
      const k = lerpKey(fromKey, toKey, obj.t);
      camera.position.set(k.pos[0], k.pos[1], k.pos[2]);
      camera.lookAt(k.look[0] + (camera.userData.lookOX || 0), k.look[1] + (camera.userData.lookOY || 0), k.look[2]);
      camera.fov = k.fov;
      camera.updateProjectionMatrix();
      if (onUpdate) onUpdate(obj.t);
    },
  });
  return tl;
}

// 绑定 window resize → sceneCtx.resize
export function bindResize(sceneCtx) {
  function onResize() {
    sceneCtx.resize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);
  function dispose() { window.removeEventListener('resize', onResize); }
  return { dispose };
}
