const THREE = window.THREE;

// 程序化占位房间：用 BoxGeometry 构造，预留命名 anchor 供后续任务挂载
export function buildFallbackRoom(scene) {
  const meshes = [];

  function addMesh(geometry, material, position, name) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position[0], position[1], position[2]);
    if (name) mesh.name = name;
    scene.add(mesh);
    meshes.push(mesh);
    return mesh;
  }

  function addAnchor(name, position, rotation) {
    const anchor = new THREE.Object3D();
    anchor.name = name;
    anchor.position.set(position[0], position[1], position[2]);
    if (rotation) anchor.rotation.set(rotation[0], rotation[1], rotation[2]);
    scene.add(anchor);
    meshes.push(anchor);
    return anchor;
  }

  // 地板（木色）
  addMesh(
    new THREE.BoxGeometry(6, 0.1, 6),
    new THREE.MeshStandardMaterial({ color: 0x8a6a4a }),
    [0, 0, 0],
  );

  // 三面墙（米色）
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xd9c9b0 });
  // 后墙
  addMesh(new THREE.BoxGeometry(6, 3, 0.1), wallMat, [0, 1.5, -3]);
  // 左墙
  addMesh(new THREE.BoxGeometry(0.1, 3, 6), wallMat, [-3, 1.5, 0]);
  // 右墙
  addMesh(new THREE.BoxGeometry(0.1, 3, 6), wallMat, [3, 1.5, 0]);

  // 书桌（深木色）
  addMesh(
    new THREE.BoxGeometry(1.4, 0.05, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x6a4a3a }),
    [0, 0.75, -0.3],
  );
  // 桌腿（4 根细盒）
  const legMat = new THREE.MeshStandardMaterial({ color: 0x6a4a3a });
  const legPositions = [[-0.65, 0.375, -0.55], [0.65, 0.375, -0.55], [-0.65, 0.375, -0.05], [0.65, 0.375, -0.05]];
  for (const p of legPositions) {
    addMesh(new THREE.BoxGeometry(0.06, 0.75, 0.06), legMat, p);
  }

  // 显示器外壳（深灰）
  addMesh(
    new THREE.BoxGeometry(0.6, 0.4, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x2a2a2a }),
    [0, 1.05, -0.5],
  );
  // 显示器底座
  addMesh(
    new THREE.BoxGeometry(0.2, 0.1, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x2a2a2a }),
    [0, 0.83, -0.4],
  );
  // 显示器屏幕 anchor（屏幕中心，朝 +Z）
  addAnchor('monitor_screen_anchor', [0, 1.05, -0.35]);

  // 键盘（黑色占位）+ Enter 键命名 mesh
  addMesh(
    new THREE.BoxGeometry(0.5, 0.03, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a }),
    [0, 0.78, -0.05],
  );
  // Enter 键（在键盘右侧）
  const enterKey = addMesh(
    new THREE.BoxGeometry(0.08, 0.04, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x3a3a3a }),
    [0.22, 0.79, -0.05],
    'key_Enter',
  );

  // 椅子（深棕）
  // 座位
  addMesh(
    new THREE.BoxGeometry(0.5, 0.06, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x4a3a2a }),
    [0, 0.45, 0.6],
  );
  // 椅背
  addMesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x4a3a2a }),
    [0, 0.75, 0.83],
  );
  // 椅腿
  const chairLegMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a });
  for (const p of [[-0.2, 0.225, 0.4], [0.2, 0.225, 0.4], [-0.2, 0.225, 0.8], [0.2, 0.225, 0.8]]) {
    addMesh(new THREE.BoxGeometry(0.05, 0.45, 0.05), chairLegMat, p);
  }

  // 床（蓝色被子）
  addMesh(
    new THREE.BoxGeometry(1.4, 0.3, 2),
    new THREE.MeshStandardMaterial({ color: 0x3a4a6a }),
    [2, 0.15, -1],
  );
  // 床头
  addMesh(
    new THREE.BoxGeometry(1.4, 0.6, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x6a4a3a }),
    [2, 0.3, -2],
  );

  // 窗户（发光 plane，暖白）
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0xfff4e0,
    emissive: 0xfff4e0,
    emissiveIntensity: 0.8,
    side: THREE.DoubleSide,
  });
  const win = addMesh(
    new THREE.PlaneGeometry(1, 1.2),
    windowMat,
    [-2.95, 1.8, -0.5],
  );
  win.rotation.y = Math.PI / 2; // 朝室内（+X 方向）

  // 海报（紫色 plane，挂在右墙）
  const poster = addMesh(
    new THREE.PlaneGeometry(0.6, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x7a5a9a, side: THREE.DoubleSide }),
    [2.95, 1.7, -1.5],
  );
  poster.rotation.y = -Math.PI / 2; // 朝室内（-X 方向）

  // 摆件 anchor（空 Object3D，供 room-props.js 挂载）
  addAnchor('propDesk_1', [0.5, 0.95, -0.3]);
  addAnchor('propDesk_2', [-0.4, 0.95, -0.3]);
  addAnchor('propWall_1', [-1.5, 1.6, -0.5]);

  function dispose() {
    meshes.forEach((m) => {
      m.geometry?.dispose?.();
      if (m.material) {
        Array.isArray(m.material) ? m.material.forEach((mat) => mat.dispose()) : m.material.dispose();
      }
      scene.remove(m);
    });
  }

  return { dispose };
}
