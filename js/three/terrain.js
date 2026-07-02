// 山峦地形：PlaneGeometry + 噪声位移，应用 ink-shader。
const THREE = window.THREE;

import { inkVertexShader, inkFragmentShader } from './shaders/ink-shader.js';

// 创建单座山：返回 mesh
export function createMountain(opts = {}) {
  const {
    width = 8, depth = 6, height = 3, segX = 48, segY = 32,
    seed = 0, uniforms = null,
  } = opts;

  const geo = new THREE.PlaneGeometry(width, depth, segX, segY);
  geo.rotateX(-Math.PI / 2); // 水平铺开，高度沿 Y

  // 顶点位移：山形 + 噪声起伏
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    // 山形：中心高，边缘低（高斯）
    const ridge = Math.exp(-((x / (width * 0.35)) ** 2) - ((z / (depth * 0.4)) ** 2));
    // 噪声起伏
    const n = noise2(x * 0.4 + seed, z * 0.4 + seed) * 0.4
            + noise2(x * 1.2 + seed, z * 1.2 + seed) * 0.15;
    const y = ridge * height + n * height * 0.3;
    pos.setY(i, Math.max(0, y));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();

  const mat = new THREE.ShaderMaterial({
    vertexShader: inkVertexShader,
    fragmentShader: inkFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: uniforms || {
      uTime: { value: 0 },
      uPaperColor: { value: new THREE.Color(0.93, 0.89, 0.83) },
      uInkColor: { value: new THREE.Color(0.08, 0.08, 0.08) },
      uGoldColor: { value: new THREE.Color(0.83, 0.69, 0.21) },
      uSeasonTint: { value: new THREE.Color(0.71, 0.28, 0.23) },
      uSnowMix: { value: 0 },
    },
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false; // 长卷沿 X，避免误剔除
  return mesh;
}

// 创建山脉阵列：沿 X 排列多座山
export function createMountainRange(opts = {}) {
  const {
    count = 5, xStart = 0, spacing = 10, heightFn = (i) => 2 + Math.sin(i) * 0.8,
    uniforms = null, seedBase = 0,
  } = opts;
  const group = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const m = createMountain({
      width: 7 + Math.random() * 2,
      depth: 6,
      height: heightFn(i),
      seed: seedBase + i * 13,
      uniforms,
    });
    m.position.set(xStart + i * spacing, 0, -2 - (i % 2) * 1.5);
    group.add(m);
  }
  return group;
}

// 简易 2D 噪声（CPU 顶点位移用）
function noise2(x, y) {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
}
