// 星罗棋盘：云海之上悬浮的棋盘 + 棋子（按技能类别分区）。
const THREE = window.THREE;

export function createChessboard(skills, uniforms) {
  const group = new THREE.Group();
  const inkColor = uniforms ? uniforms.uInkColor.value : new THREE.Color(0.08, 0.08, 0.08);
  const goldColor = uniforms ? uniforms.uGoldColor.value : new THREE.Color(0.83, 0.69, 0.21);

  // 棋盘平面
  const boardGeo = new THREE.BoxGeometry(8, 0.1, 5);
  const boardMat = new THREE.MeshBasicMaterial({ color: inkColor, transparent: true, opacity: 0.15 });
  const board = new THREE.Mesh(boardGeo, boardMat);
  board.position.y = 1.5;
  group.add(board);

  // 棋盘格线
  const lineMat = new THREE.LineBasicMaterial({ color: inkColor, transparent: true, opacity: 0.3 });
  for (let i = -4; i <= 4; i += 1) {
    const g1 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i, 1.55, -2.5), new THREE.Vector3(i, 1.55, 2.5)]);
    group.add(new THREE.Line(g1, lineMat));
  }
  for (let j = -2; j <= 2; j += 1) {
    const g2 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-4, 1.55, j), new THREE.Vector3(4, 1.55, j)]);
    group.add(new THREE.Line(g2, lineMat));
  }

  // 棋子：按技能类别分区，每类一行
  const pieceGeo = new THREE.SphereGeometry(0.18, 12, 12);
  const pieces = [];
  skills.forEach((cat, ci) => {
    cat.items.forEach((item, ii) => {
      const isGold = ii === 0;
      const mat = new THREE.MeshBasicMaterial({
        color: isGold ? goldColor : inkColor,
        transparent: true,
        opacity: 0.5 + item.level * 0.4,
      });
      const piece = new THREE.Mesh(pieceGeo, mat);
      const x = -3.5 + ii * (7 / Math.max(4, cat.items.length));
      const z = -1.6 + ci * (3.2 / Math.max(4, skills.length));
      piece.position.set(x, 1.6 + item.level * 1.2, z); // 高度=熟练度
      piece.userData.baseY = piece.position.y;
      piece.userData.phase = Math.random() * Math.PI * 2;
      piece.userData.item = item;
      pieces.push(piece);
      group.add(piece);
    });
  });
  group.userData.pieces = pieces;
  group.userData.isChessboard = true;
  return group;
}

export function tickChessboard(group, t) {
  const pieces = group.userData.pieces || [];
  pieces.forEach((p) => {
    p.position.y = p.userData.baseY + Math.sin(t * 1.5 + p.userData.phase) * 0.06;
  });
}
