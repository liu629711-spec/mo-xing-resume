// 碑林：矗立的石碑，碑面贴游戏 icon（占位用纯色+题字 plane）。
const THREE = window.THREE;

export function createSteleForest(games, uniforms) {
  const group = new THREE.Group();
  const inkColor = uniforms ? uniforms.uInkColor.value : new THREE.Color(0.08, 0.08, 0.08);
  const accentColor = uniforms ? uniforms.uAccentColor.value : new THREE.Color(0.71, 0.28, 0.23);

  games.forEach((g, i) => {
    const stele = new THREE.Group();
    const w = 0.9, h = 2.2, d = 0.25;
    const geo = new THREE.BoxGeometry(w, h, d);
    const matColor = g.nda ? 0x999999 : 0x333333;
    const mat = new THREE.MeshBasicMaterial({ color: matColor, transparent: true, opacity: 0.85 });
    const body = new THREE.Mesh(geo, mat);
    body.position.y = h / 2;
    stele.add(body);

    // 碑顶题字板（金/朱）
    const topGeo = new THREE.PlaneGeometry(w * 0.8, 0.4);
    const topMat = new THREE.MeshBasicMaterial({ color: g.nda ? 0xaaaaaa : accentColor, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.set(0, h - 0.3, d / 2 + 0.01);
    stele.add(top);

    stele.position.set((i - (games.length - 1) / 2) * 1.8, 0, -1.5);
    stele.userData.baseRotY = (Math.random() - 0.5) * 0.2;
    stele.rotation.y = stele.userData.baseRotY;
    stele.userData.swayPhase = i * 0.7;
    group.add(stele);
  });
  group.userData.isSteleForest = true;
  return group;
}

export function tickSteleForest(group, t) {
  group.children.forEach((s) => {
    s.rotation.y = s.userData.baseRotY + Math.sin(t * 0.6 + s.userData.swayPhase) * 0.02;
  });
}
