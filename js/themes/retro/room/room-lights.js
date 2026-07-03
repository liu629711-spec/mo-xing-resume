const THREE = window.THREE;

export function addRoomLights(scene) {
  const lights = [];

  // 阳光（暖白，从窗户斜射）
  const sun = new THREE.DirectionalLight(0xfff4e0, 1.2);
  sun.position.set(-3, 4, 2);
  sun.target.position.set(0, 1, 0);
  scene.add(sun);
  scene.add(sun.target);
  lights.push(sun, sun.target);

  // 天蓝环境填充
  const ambient = new THREE.AmbientLight(0x88aacc, 0.4);
  scene.add(ambient);
  lights.push(ambient);

  // 台灯（暖黄）— RectAreaLight 需要额外加载，用 PointLight fallback
  const deskLamp = new THREE.PointLight(0xffcc88, 0.6, 3, 2);
  deskLamp.position.set(0.3, 1.1, 0.8);
  scene.add(deskLamp);
  lights.push(deskLamp);

  // 体积光柱（CylinderGeometry + additive）
  const beamGeo = new THREE.CylinderGeometry(0.3, 0.5, 4, 12, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xfff4e0, transparent: true, opacity: 0.08,
    side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.set(-2, 2, 0);
  beam.rotation.z = 0.3;
  scene.add(beam);
  lights.push(beam);

  function dispose() {
    lights.forEach((l) => {
      l.geometry?.dispose?.();
      l.material?.dispose?.();
      scene.remove(l);
    });
  }

  return { dispose };
}
