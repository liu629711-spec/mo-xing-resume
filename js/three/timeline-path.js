// 山径蜿蜒：S 形路径投影到 3D 地面，节点是发光小球。
const THREE = window.THREE;

export function createTimelinePath(timeline, uniforms) {
  const group = new THREE.Group();
  const goldColor = uniforms ? uniforms.uGoldColor.value : new THREE.Color(0.83, 0.69, 0.21);
  const inkColor = uniforms ? uniforms.uInkColor.value : new THREE.Color(0.08, 0.08, 0.08);

  if (!timeline || !timeline.length) return group;

  // S 形曲线点
  const pts = [];
  const n = timeline.length;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = (i - (n - 1) / 2) * 1.2;
    const z = Math.sin(t * Math.PI * 2) * 1.5;
    const y = 0.2 + t * 1.2; // 上山
    pts.push(new THREE.Vector3(x, y, z));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const pathGeo = new THREE.TubeGeometry(curve, 64, 0.04, 6, false);
  const pathMat = new THREE.MeshBasicMaterial({ color: goldColor, transparent: true, opacity: 0.6 });
  group.add(new THREE.Mesh(pathGeo, pathMat));

  // 节点
  const nodeGeo = new THREE.SphereGeometry(0.14, 12, 12);
  const nodes = [];
  pts.forEach((p, i) => {
    const mat = new THREE.MeshBasicMaterial({ color: inkColor, transparent: true, opacity: 0.85 });
    const node = new THREE.Mesh(nodeGeo, mat);
    node.position.copy(p);
    node.userData.basePos = p.clone();
    node.userData.phase = i;
    nodes.push(node);
    group.add(node);
  });

  // 行旅墨点（沿路径流动）
  const travelerGeo = new THREE.SphereGeometry(0.1, 8, 8);
  const travelerMat = new THREE.MeshBasicMaterial({ color: goldColor });
  const traveler = new THREE.Mesh(travelerGeo, travelerMat);
  group.add(traveler);

  group.userData.curve = curve;
  group.userData.traveler = traveler;
  group.userData.nodes = nodes;
  group.userData.isTimeline = true;
  return group;
}

export function tickTimeline(group, t, progress) {
  const { traveler, curve, nodes } = group.userData;
  if (traveler && curve) {
    const p = Math.min(1, Math.max(0, progress));
    const pos = curve.getPointAt(p);
    traveler.position.copy(pos);
  }
  if (nodes) {
    nodes.forEach((n, i) => {
      n.scale.setScalar(1 + Math.sin(t * 2 + n.userData.phase) * 0.1);
    });
  }
}
