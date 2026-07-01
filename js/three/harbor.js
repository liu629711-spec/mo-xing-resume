// 归舟渡口：水面（着色器波纹）+ 墨舟 + 远处夕阳光晕。
const THREE = window.THREE;
import { createRiver } from './shaders/river-shader.js';

export function createHarbor(uniforms) {
  const group = new THREE.Group();
  const inkColor = uniforms ? uniforms.uInkColor.value : new THREE.Color(0.08, 0.08, 0.08);
  const goldColor = uniforms ? uniforms.uGoldColor.value : new THREE.Color(0.83, 0.69, 0.21);

  // 水面
  const water = createRiver(uniforms);
  water.scale.set(1.2, 1, 1.5);
  water.position.set(0, 0.3, -1);
  group.add(water);

  // 墨舟（简笔：船身 + 桅杆 + 帆）
  const boat = new THREE.Group();
  const hullGeo = new THREE.ConeGeometry(0.3, 0.15, 4);
  hullGeo.rotateX(Math.PI / 2);
  hullGeo.rotateZ(Math.PI / 4);
  const hullMat = new THREE.MeshBasicMaterial({ color: inkColor, transparent: true, opacity: 0.9 });
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.scale.set(1.5, 1, 0.5);
  boat.add(hull);

  const mastGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 5);
  const mast = new THREE.Mesh(mastGeo, hullMat);
  mast.position.set(0, 0.4, 0);
  boat.add(mast);

  const sailGeo = new THREE.PlaneGeometry(0.5, 0.5);
  const sailMat = new THREE.MeshBasicMaterial({ color: goldColor, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
  const sail = new THREE.Mesh(sailGeo, sailMat);
  sail.position.set(0.2, 0.5, 0);
  boat.add(sail);

  boat.position.set(0, 0.5, 0.5);
  boat.userData.baseY = 0.5;
  boat.userData.phase = 0;
  group.add(boat);
  group.userData.boat = boat;

  // 夕阳光晕（sprite）
  const sunTex = makeSunTexture();
  const sunMat = new THREE.SpriteMaterial({ map: sunTex, transparent: true, opacity: 0.7, depthWrite: false });
  const sun = new THREE.Sprite(sunMat);
  sun.scale.set(4, 4, 1);
  sun.position.set(6, 2.5, -8);
  group.add(sun);
  group.userData.isHarbor = true;
  return group;
}

function makeSunTexture() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(212,175,55,0.95)');
  g.addColorStop(0.3, 'rgba(212,175,55,0.5)');
  g.addColorStop(1, 'rgba(212,175,55,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export function tickHarbor(group, t) {
  const boat = group.userData.boat;
  if (boat) {
    boat.position.y = boat.userData.baseY + Math.sin(t * 1.2 + boat.userData.phase) * 0.06;
    boat.rotation.z = Math.sin(t * 1.0) * 0.04;
  }
}
