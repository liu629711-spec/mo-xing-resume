// 项目山峦：每座山是一个项目案例，山高=影响力。
const THREE = window.THREE;
import { createMountain } from './terrain.js';

export function createProjectPeaks(projects, uniforms) {
  const group = new THREE.Group();
  if (!projects || !projects.length) return group;
  const goldColor = uniforms ? uniforms.uGoldColor.value : new THREE.Color(0.83, 0.69, 0.21);

  projects.forEach((p, i) => {
    const h = 1.5 + (p.impact || 0.5) * 2.5;
    const m = createMountain({
      width: 5 + (p.impact || 0.5) * 2,
      depth: 5,
      height: h,
      seed: 100 + i * 17,
      uniforms,
    });
    m.position.set((i - (projects.length - 1) / 2) * 6, 0, -1);
    group.add(m);

    // 山顶金点（标识）
    const dotGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: goldColor, transparent: true, opacity: 0.9 });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.set((i - (projects.length - 1) / 2) * 6, h + 0.2, -1);
    dot.userData.baseY = h + 0.2;
    dot.userData.phase = i;
    group.add(dot);
  });
  group.userData.isProjectPeaks = true;
  return group;
}

export function tickProjectPeaks(group, t) {
  group.children.forEach((c) => {
    if (c.userData.baseY !== undefined) {
      c.position.y = c.userData.baseY + Math.sin(t * 1.5 + c.userData.phase) * 0.08;
    }
  });
}
