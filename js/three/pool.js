// 简单 3D 对象池：section activate 时 acquire，deactivate 时 release。
// 池化复用，避免频繁创建/销毁。
const THREE = window.THREE;

const pools = new Map(); // key -> { factory, idle: [], active: Set }

export function registerPool(key, factory) {
  pools.set(key, { factory, idle: [], active: new Set() });
}

export function acquire(key, scene, setupOpts) {
  const pool = pools.get(key);
  if (!pool) throw new Error(`Pool not registered: ${key}`);
  let obj = pool.idle.pop();
  if (!obj) obj = pool.factory();
  if (setupOpts && obj.userData.setup) obj.userData.setup(setupOpts);
  scene.add(obj);
  pool.active.add(obj);
  return obj;
}

export function release(key, scene, obj) {
  const pool = pools.get(key);
  if (!pool) return;
  scene.remove(obj);
  pool.active.delete(obj);
  pool.idle.push(obj);
}

export function releaseAll(key, scene) {
  const pool = pools.get(key);
  if (!pool) return;
  for (const obj of [...pool.active]) release(key, scene, obj);
}

// 让池对象随 uTime 更新（如果材质有 uniforms.uTime）
export function tickPools(dt) {
  for (const pool of pools.values()) {
    for (const obj of pool.active) {
      obj.traverse((child) => {
        if (child.material && child.material.uniforms && child.material.uniforms.uTime) {
          child.material.uniforms.uTime.value += dt;
        }
      });
    }
  }
}
