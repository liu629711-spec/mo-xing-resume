const THREE = window.THREE;

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function randomWarmColor() { return new THREE.Color().setHSL(0.1 + Math.random() * 0.05, 0.5, 0.5); }

export function loadRoomProps(scene, propsData, { onPropClick }) {
  const meshes = [];
  if (!Array.isArray(propsData)) return { meshes, dispose: () => {} };

  for (const prop of propsData) {
    // 找匹配的 anchor：propDesk_1, propWall_1 等
    const samePos = propsData.filter((p) => p.position === prop.position);
    const idx = samePos.indexOf(prop) + 1;
    const anchorName = `prop${cap(prop.position)}_${idx}`;
    const anchor = scene.getObjectByName(anchorName);
    if (!anchor) continue;

    const mesh = createBoxProp(prop);
    mesh.position.copy(anchor.position);
    mesh.userData = { ...prop, isProp: true };
    scene.add(mesh);
    meshes.push(mesh);
  }

  function dispose() {
    meshes.forEach((m) => {
      m.geometry?.dispose();
      m.material?.dispose?.();
      if (m.material?.map) m.material.map.dispose();
      scene.remove(m);
    });
  }

  return { meshes, dispose };
}

function createBoxProp(prop) {
  const geo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
  const mat = new THREE.MeshStandardMaterial({ color: randomWarmColor() });
  return new THREE.Mesh(geo, mat);
}
