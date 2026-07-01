// 简笔亭子：基本几何组合。
const THREE = window.THREE;

export function createPavilion(uniforms) {
  const group = new THREE.Group();
  const inkColor = uniforms ? uniforms.uInkColor.value : new THREE.Color(0.08, 0.08, 0.08);
  const mat = new THREE.MeshBasicMaterial({ color: inkColor, transparent: true, opacity: 0.75 });

  // 四柱
  const colGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.6, 6);
  const positions = [[-0.7, 0.8, -0.4], [0.7, 0.8, -0.4], [-0.7, 0.8, 0.4], [0.7, 0.8, 0.4]];
  positions.forEach((p) => {
    const c = new THREE.Mesh(colGeo, mat);
    c.position.set(...p);
    group.add(c);
  });

  // 顶（圆锥+飞檐感用 ConeGeometry）
  const roofGeo = new THREE.ConeGeometry(1.2, 0.6, 4);
  const roof = new THREE.Mesh(roofGeo, mat);
  roof.position.y = 2.0;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);

  // 顶脊（一个扁方块）
  const topGeo = new THREE.BoxGeometry(0.15, 0.3, 0.15);
  const top = new THREE.Mesh(topGeo, mat);
  top.position.y = 2.45;
  group.add(top);

  // 基座
  const baseGeo = new THREE.BoxGeometry(1.8, 0.15, 1.2);
  const base = new THREE.Mesh(baseGeo, mat);
  base.position.y = 0.08;
  group.add(base);

  return group;
}
