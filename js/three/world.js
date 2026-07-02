// 常驻长卷世界：沿 X 轴铺开的水墨山脉 + 流动云海 + 山腰云雾 + 季节装饰。
const THREE = window.THREE;

import { createMountainRange } from './terrain.js';
import { createCloudSea } from './clouds.js';
import { createSeasonDeco } from './season-deco.js';

export function createWorld(uniforms) {
  const group = new THREE.Group();
  const decoControllers = [];

  // 近山 + 每座山挂季节装饰
  const nearRange = createMountainRange({
    count: 9, xStart: -5, spacing: 10,
    heightFn: (i) => 2.2 + Math.abs(Math.sin(i * 1.3)) * 1.4,
    uniforms, seedBase: 7,
  });
  nearRange.position.z = -1.5;
  group.add(nearRange);
  nearRange.children.forEach((m, i) => {
    const deco = createSeasonDeco(m, 100 + i * 31);
    decoControllers.push(deco);
  });

  // 远山（不加装饰，太远看不清）
  const farRange = createMountainRange({
    count: 7, xStart: -10, spacing: 13,
    heightFn: (i) => 3.5 + Math.abs(Math.cos(i * 0.9)) * 1.8,
    uniforms, seedBase: 23,
  });
  farRange.position.z = -8;
  group.add(farRange);

  // 云海
  const cloud = createCloudSea({ width: 200, depth: 24, uniforms });
  cloud.position.set(35, 0.3, -3);
  group.add(cloud);

  // 山腰云雾
  for (let i = 0; i < 5; i++) {
    const mist = makeMistBlob(uniforms);
    mist.position.set(i * 15, 1.0, -2.5);
    group.add(mist);
  }

  group.userData.cloud = cloud;
  group.userData.decoControllers = decoControllers;
  group.userData.setSeason = (season) => decoControllers.forEach((d) => d.show(season));
  group.userData.tickDeco = () => decoControllers.forEach((d) => d.tick());
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
