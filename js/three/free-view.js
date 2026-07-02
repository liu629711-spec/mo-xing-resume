// 3D 自由视角模式：点击空白处进入自由视角，可拖拽旋转摄像机视角，
// 再次点击空白或按 Esc 退出回到展卷视角。
// 滚动驱动 X 推进（展卷），自由视角驱动视角旋转（环顾），两者叠加但不冲突。

const THREE = window.THREE;

export function initFreeView(sceneObj) {
  if (!sceneObj) return;
  const { camera, renderer } = sceneObj;
  const host = renderer.domElement.parentElement; // #three-canvas

  // 自由视角状态
  const view = {
    active: false,
    azimuth: 0,      // 水平旋转角（绕 Y）
    pitch: 0,        // 俯仰角
    targetAzimuth: 0,
    targetPitch: 0,
    dragging: false,
    lastX: 0, lastY: 0,
  };

  // 默认展卷视角偏移
  const DEFAULT_AZ = 0;
  const DEFAULT_PITCH = 0;

  // 摄像机基础参数（展卷视角）：position (x, 2.4, 10)，看向 (x+10, 1.2, 0)
  // 自由视角在基础位置上叠加 azimuth/pitch 旋转
  const BASE_Y = 2.4;
  const BASE_Z = 10;
  const LOOK_OFFSET_X = 10;
  const LOOK_OFFSET_Y = 1.2;

  // 暴露给 scene.update 的视角覆盖
  sceneObj.freeView = view;

  // 覆盖 scene.update 里的 lookAt，加入自由视角旋转
  const origUpdate = sceneObj.update;
  sceneObj.update = function (progress, dt) {
    sceneObj.uniforms.uTime.value += dt;
    // 摄像机 X 由滚动决定
    const camX = progress * 70;
    camera.position.x = camX;
    camera.position.y = BASE_Y + Math.sin(view.pitch) * 4;
    camera.position.z = BASE_Z * Math.cos(view.azimuth) * Math.cos(view.pitch);
    // 视角中心点（带 azimuth 偏移）
    const lookX = camX + LOOK_OFFSET_X * Math.cos(view.azimuth);
    const lookY = LOOK_OFFSET_Y - Math.sin(view.pitch) * 3;
    const lookZ = -LOOK_OFFSET_X * Math.sin(view.azimuth) * 0.3;
    camera.lookAt(lookX, lookY, lookZ);
    renderer.render(sceneObj.scene, camera);
  };

  // 判断点击是否在空白处（非内容元素）
  function isBlank(target) {
    if (!target) return true;
    // 点击 three-canvas 本身或 canvas 即空白
    if (target.id === 'three-canvas' || target.tagName === 'CANVAS') return true;
    if (target.id === 'paper-bg') return true;
    // 点击 section 但非交互元素也算空白（section 是内容容器，但内容卡片应排除）
    if (target.closest('.ink-card, .peak-card, .stele, .contact-item, .skill-item, button, a, input, [role="button"]')) return false;
    if (target.closest('.section')) return true;
    return false;
  }

  function enterFreeView() {
    if (view.active) return;
    view.active = true;
    document.body.classList.add('free-view');
    showHint();
  }
  function exitFreeView() {
    if (!view.active) return;
    view.active = false;
    view.targetAzimuth = DEFAULT_AZ;
    view.targetPitch = DEFAULT_PITCH;
    document.body.classList.remove('free-view');
    hideHint();
  }

  let hintEl = null;
  function showHint() {
    if (hintEl) return;
    hintEl = document.createElement('div');
    hintEl.className = 'free-view-hint';
    hintEl.textContent = '自由视角 · 拖拽环顾山河，再点空白或按 Esc 退出';
    document.body.appendChild(hintEl);
    requestAnimationFrame(() => hintEl.classList.add('is-show'));
  }
  function hideHint() {
    if (!hintEl) return;
    hintEl.classList.remove('is-show');
    const el = hintEl;
    hintEl = null;
    setTimeout(() => el.remove(), 400);
  }

  // 平滑插值视角
  function tickView() {
    view.azimuth += (view.targetAzimuth - view.azimuth) * 0.1;
    view.pitch += (view.targetPitch - view.pitch) * 0.1;
    requestAnimationFrame(tickView);
  }
  tickView();

  // 监听点击（mousedown 判定，mouseup 检测是否拖拽）
  let mouseDownTarget = null;
  let mouseDownPos = null;
  let movedDuringDrag = false;

  document.addEventListener('mousedown', (e) => {
    mouseDownTarget = e.target;
    mouseDownPos = { x: e.clientX, y: e.clientY };
    movedDuringDrag = false;
    if (view.active && isBlank(e.target)) {
      view.dragging = true;
      view.lastX = e.clientX;
      view.lastY = e.clientY;
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (!view.active || !view.dragging) return;
    const dx = e.clientX - view.lastX;
    const dy = e.clientY - view.lastY;
    if (Math.abs(dx) + Math.abs(dy) > 2) movedDuringDrag = true;
    view.targetAzimuth += dx * 0.005;
    view.targetPitch = clamp(view.targetPitch + dy * 0.004, -0.6, 0.6);
    view.lastX = e.clientX;
    view.lastY = e.clientY;
  });

  document.addEventListener('mouseup', (e) => {
    if (view.dragging) {
      view.dragging = false;
      // 如果是拖拽（有移动），不触发进入/退出
      if (movedDuringDrag) {
        mouseDownTarget = null;
        return;
      }
    }
    // 单击空白：切换自由视角
    if (mouseDownTarget && isBlank(mouseDownTarget) && !movedDuringDrag) {
      if (view.active) exitFreeView();
      else enterFreeView();
    }
    mouseDownTarget = null;
  });

  // 触摸支持
  document.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    mouseDownTarget = e.target;
    mouseDownPos = { x: t.clientX, y: t.clientY };
    movedDuringDrag = false;
    if (view.active && isBlank(e.target)) {
      view.dragging = true;
      view.lastX = t.clientX;
      view.lastY = t.clientY;
    }
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (!view.active || !view.dragging) return;
    const t = e.touches[0];
    const dx = t.clientX - view.lastX;
    const dy = t.clientY - view.lastY;
    if (Math.abs(dx) + Math.abs(dy) > 2) movedDuringDrag = true;
    view.targetAzimuth += dx * 0.005;
    view.targetPitch = clamp(view.targetPitch + dy * 0.004, -0.6, 0.6);
    view.lastX = t.clientX;
    view.lastY = t.clientY;
  }, { passive: true });
  document.addEventListener('touchend', () => {
    if (view.dragging) {
      view.dragging = false;
      if (movedDuringDrag) { mouseDownTarget = null; return; }
    }
    if (mouseDownTarget && isBlank(mouseDownTarget) && !movedDuringDrag) {
      if (view.active) exitFreeView();
      else enterFreeView();
    }
    mouseDownTarget = null;
  });

  // Esc 退出
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && view.active) exitFreeView();
  });

  return view;
}

function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
