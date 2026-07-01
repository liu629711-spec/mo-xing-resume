// 墨竹：粒子笔触生成几竿竹子，随风微摆。
const THREE = window.THREE;

export function createBamboo(uniforms) {
  const group = new THREE.Group();
  const inkColor = uniforms ? uniforms.uInkColor.value : new THREE.Color(0.08, 0.08, 0.08);

  const stalks = 3;
  for (let s = 0; s < stalks; s++) {
    const stalk = new THREE.Group();
    const segments = 8;
    const baseX = (s - 1) * 1.5;
    for (let i = 0; i < segments; i++) {
      // 竹节
      const geo = new THREE.CylinderGeometry(0.04 - i * 0.003, 0.05 - i * 0.003, 0.6, 6);
      const mat = new THREE.MeshBasicMaterial({ color: inkColor, transparent: true, opacity: 0.85 - i * 0.05 });
      const seg = new THREE.Mesh(geo, mat);
      seg.position.y = i * 0.6 + 0.3;
      stalk.add(seg);
      // 竹节分支
      if (i > 1 && i < segments - 1 && i % 2 === 0) {
        const leaf = makeLeaf(inkColor);
        leaf.position.set(0.3, i * 0.6 + 0.3, 0);
        leaf.rotation.z = -Math.PI / 4;
        leaf.userData.baseRot = leaf.rotation.z;
        leaf.userData.swayPhase = Math.random() * Math.PI * 2;
        stalk.add(leaf);
      }
    }
    stalk.position.set(baseX, 0, 1);
    stalk.userData.swayPhase = s * 1.3;
    group.add(stalk);
  }
  group.userData.isBamboo = true;
  return group;
}

function makeLeaf(inkColor) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.quadraticCurveTo(0.15, 0.05, 0.4, 0.02);
  shape.quadraticCurveTo(0.15, -0.02, 0, 0);
  const geo = new THREE.ShapeGeometry(shape);
  const mat = new THREE.MeshBasicMaterial({ color: inkColor, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
  return new THREE.Mesh(geo, mat);
}

export function tickBamboo(group, t) {
  group.children.forEach((stalk) => {
    const phase = stalk.userData.swayPhase || 0;
    stalk.rotation.z = Math.sin(t * 0.8 + phase) * 0.03;
    stalk.children.forEach((child) => {
      if (child.userData.baseRot !== undefined) {
        child.rotation.z = child.userData.baseRot + Math.sin(t * 1.2 + child.userData.swayPhase) * 0.08;
      }
    });
  });
}
