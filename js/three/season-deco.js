// 山间季节装饰层：每座山间散布季节专属 3D 点簇（春樱/夏绿/秋枫/冬雪）。
// 切换季节时平滑显隐对应层。
const THREE = window.THREE;

const SEASON_DECO = {
  spring: { color: 0xE8B4B8, size: 0.18, density: 60, yBias: 0.6 },
  summer: { color: 0x6B8E7F, size: 0.14, density: 50, yBias: 0.8 },
  autumn: { color: 0xB5483A, size: 0.18, density: 70, yBias: 0.5 },
  winter: { color: 0xF0F0F2, size: 0.16, density: 80, yBias: 0.9 },
};

// 为一座山生成季节装饰点（固定种子，让位置稳定）
function makeDecoPoints(seed, count, yMax) {
  const pts = [];
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  for (let i = 0; i < count; i++) {
    pts.push({
      x: (rand() - 0.5) * 5,
      y: rand() * yMax,
      z: (rand() - 0.5) * 3,
    });
  }
  return pts;
}

// 创建四套季节装饰（挂在一座山 group 下），返回控制器
export function createSeasonDeco(mountainGroup, seed) {
  const layers = {};
  for (const season of ['spring', 'summer', 'autumn', 'winter']) {
    const cfg = SEASON_DECO[season];
    const pts = makeDecoPoints(seed + season.charCodeAt(0), cfg.density, 3 * cfg.yBias);
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(pts.length * 3);
    pts.forEach((p, i) => {
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
    });
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: cfg.color,
      size: cfg.size,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const points = new THREE.Points(geo, mat);
    points.userData.targetOpacity = 0;
    mountainGroup.add(points);
    layers[season] = points;
  }
  return {
    show(season) {
      for (const s of Object.keys(layers)) {
        layers[s].userData.targetOpacity = (s === season) ? 0.85 : 0;
      }
    },
    tick() {
      for (const points of Object.values(layers)) {
        const cur = points.material.opacity;
        const target = points.userData.targetOpacity;
        if (Math.abs(cur - target) > 0.001) {
          points.material.opacity = cur + (target - cur) * 0.08;
        }
      }
    },
  };
}
