// 常驻长卷世界：沿 X 轴铺开的水墨山脉 + 流动云海 + 山腰云雾。
// 这些是全局背景，不随板块卸载。
const THREE = window.THREE;

import { createMountainRange } from './terrain.js';
import { createCloudSea } from './clouds.js';

export function createWorld(uniforms) {
  const group = new THREE.Group();

  // 山脉：沿 X 从 -5 到 75 铺开（长卷总长 70 + 边距）
  const nearRange = createMountainRange({
    count: 9, xStart: -5, spacing: 10,
    heightFn: (i) => 2.2 + Math.abs(Math.sin(i * 1.3)) * 1.4,
    uniforms, seedBase: 7,
  });
  nearRange.position.z = -1.5;
  group.add(nearRange);

  // 远山：更淡更高更远
  const farRange = createMountainRange({
    count: 7, xStart: -10, spacing: 13,
    heightFn: (i) => 3.5 + Math.abs(Math.cos(i * 0.9)) * 1.8,
    uniforms, seedBase: 23,
  });
  farRange.position.z = -8;
  group.add(farRange);

  // 云海（贯穿长卷）
  const cloud = createCloudSea({ width: 200, depth: 24, uniforms });
  cloud.position.set(35, 0.3, -3);
  group.add(cloud);

  // 几处山腰云雾
  for (let i = 0; i < 5; i++) {
    const mist = makeMistBlob(uniforms);
    mist.position.set(i * 15, 1.0, -2.5);
    group.add(mist);
  }

  group.userData.cloud = cloud;
  return group;
}

function makeMistBlob(uniforms) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.25)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({
    map: tex, transparent: true, opacity: 0.25, depthWrite: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(8, 4, 1);
  sprite.userData.baseOpacity = 0.25;
  sprite.userData.isMist = true;
  return sprite;
}
