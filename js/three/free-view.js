// 3D 自由飞行视角：点击空白进入，WASD 移动、空格上升、Ctrl 下降，
// 鼠标拖拽转视角，自由穿梭 3D 山水。再次点击空白或 Esc 退出。
// 穿梭时 3D 背景跟随自由位置，HTML 内容层保持展示不受影响。
const THREE = window.THREE;

const MOVE_SPEED = 7;        // 单位/秒
const SPRINT_MULT = 2.2;     // Shift 加速
const YAW_SENS = 0.0035;     // 水平转视角灵敏度
const PITCH_SENS = 0.003;    // 俯仰灵敏度
const PITCH_LIMIT = 1.15;
const BASE_Y = 2.4;
const BASE_Z = 10;

export function initFreeView(sceneObj) {
  if (!sceneObj) return;
  const { camera, renderer } = sceneObj;

  const view = {
    active: false,
    // 自由位置与朝向
    pos: new THREE.Vector3(),
    yaw: 0,
    pitch: 0,
    // 平滑退出目标
    exiting: false,
  };

  const keys = new Set();
  let dragging = false;
  let lastX = 0, lastY = 0;

  // 覆盖 scene.update：自由视角激活时用自由位置，否则用滚动位置
  sceneObj.update = function (progress, dt) {
    sceneObj.uniforms.uTime.value += dt;

    if (view.active || view.exiting) {
      // 自由飞行：位置由 view.pos 控制
      camera.position.copy(view.pos);
      const fwd = forwardVec(view.yaw, view.pitch);
      camera.lookAt(view.pos.x + fwd.x, view.pos.y + fwd.y, view.pos.z + fwd.z);
      if (view.exiting) {
        // 退出过渡：pos 朝滚动位置插值，yaw/pitch 朝 0 插值
        const targetX = progress * 70;
        view.pos.x += (targetX - view.pos.x) * 0.08;
        view.pos.y += (BASE_Y - view.pos.y) * 0.08;
        view.pos.z += (BASE_Z - view.pos.z) * 0.08;
        view.yaw += (0 - view.yaw) * 0.08;
        view.pitch += (0 - view.pitch) * 0.08;
        if (Math.abs(view.pos.x - targetX) < 0.05 && Math.abs(view.yaw) < 0.01) {
          view.exiting = false;
        }
      }
    } else {
      // 展卷模式：摄像机沿 X 推进
      const camX = progress * 70;
      camera.position.set(camX, BASE_Y, BASE_Z);
      camera.lookAt(camX + 10, 1.2, 0);
    }
    renderer.render(sceneObj.scene, camera);
  };

  // 持续 tick：根据按键应用移动
  function tick() {
    if (view.active && !view.exiting) {
      const sprint = keys.has('shift') ? SPRINT_MULT : 1;
      const speed = MOVE_SPEED * sprint * (1 / 60); // 近似 dt
      const fwd = forwardVec(view.yaw, view.pitch);
      const right = rightVec(view.yaw);
      if (keys.has('w')) view.pos.addScaledVector(fwd, speed);
      if (keys.has('s')) view.pos.addScaledVector(fwd, -speed);
      if (keys.has('d')) view.pos.addScaledVector(right, speed);
      if (keys.has('a')) view.pos.addScaledVector(right, -speed);
      if (keys.has('space')) view.pos.y += speed;
      if (keys.has('control')) view.pos.y -= speed;
      // 限制不要飞太远
      view.pos.x = clamp(view.pos.x, -15, 85);
      view.pos.y = clamp(view.pos.y, -3, 12);
      view.pos.z = clamp(view.pos.z, -25, 18);
    }
    requestAnimationFrame(tick);
  }
  tick();

  // --- 进入/退出 ---
  const toggleBtnRef = document.getElementById('free-view-toggle');
  function enterFreeView() {
    if (view.active) return;
    view.active = true;
    view.exiting = false;
    view.pos.copy(camera.position);
    view.yaw = 0;
    view.pitch = 0;
    document.body.classList.add('free-view');
    if (toggleBtnRef) toggleBtnRef.classList.add('is-active');
    showHint();
  }
  function exitFreeView() {
    if (!view.active) return;
    view.active = false;
    view.exiting = true;
    document.body.classList.remove('free-view');
    if (toggleBtnRef) toggleBtnRef.classList.remove('is-active');
    hideHint();
  }

  // --- 提示条 ---
  let hintEl = null;
  function showHint() {
    if (hintEl) return;
    hintEl = document.createElement('div');
    hintEl.className = 'free-view-hint';
    hintEl.innerHTML = `
      <span class="fv-title">自由穿梭</span>
      <span class="fv-keys"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> 移动</span>
      <span class="fv-keys"><kbd>Space</kbd> 上升 · <kbd>Ctrl</kbd> 下降 · <kbd>Shift</kbd> 加速</span>
      <span class="fv-keys">拖拽转视角 · 再点 <kbd>游</kbd> 或 <kbd>Esc</kbd> 退出</span>
    `;
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

  // --- 交互元素白名单（拖拽转视角时判定是否在空白处） ---
  const INTERACTIVE = [
    '.ink-card', '.peak-card', '.stele', '.contact-item',
    '.skill-item', '.skill-category', '.timeline-node',
    'button', 'a', 'input', 'textarea', 'select',
    '[role="button"]', '[tabindex]',
    '#season-switcher', '#project-detail-overlay',
    '.free-view-hint', '#skip-loading', '.detail-close',
  ].join(',');
  function isBlank(target) {
    if (!target) return true;
    if (target.closest && target.closest(INTERACTIVE)) return false;
    return true;
  }

  // --- 开启按钮（四季切换器左侧"游"） ---
  const toggleBtn = document.getElementById('free-view-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (view.active || view.exiting) exitFreeView();
      else enterFreeView();
    });
  }

  // --- 鼠标拖拽转视角（仅激活时） ---
  let mouseDownTarget = null;
  let movedDuringDrag = false;

  document.addEventListener('mousedown', (e) => {
    mouseDownTarget = e.target;
    movedDuringDrag = false;
    if (view.active && isBlank(e.target)) {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (!view.active || !dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    if (Math.abs(dx) + Math.abs(dy) > 2) movedDuringDrag = true;
    view.yaw -= dx * YAW_SENS;
    view.pitch = clamp(view.pitch - dy * PITCH_SENS, -PITCH_LIMIT, PITCH_LIMIT);
    lastX = e.clientX;
    lastY = e.clientY;
  });

  document.addEventListener('mouseup', () => {
    if (dragging) {
      dragging = false;
      mouseDownTarget = null;
    }
  });

  // 触摸
  document.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    mouseDownTarget = e.target;
    movedDuringDrag = false;
    if (view.active && isBlank(e.target)) {
      dragging = true;
      lastX = t.clientX;
      lastY = t.clientY;
    }
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (!view.active || !dragging) return;
    const t = e.touches[0];
    const dx = t.clientX - lastX;
    const dy = t.clientY - lastY;
    if (Math.abs(dx) + Math.abs(dy) > 2) movedDuringDrag = true;
    view.yaw -= dx * YAW_SENS;
    view.pitch = clamp(view.pitch - dy * PITCH_SENS, -PITCH_LIMIT, PITCH_LIMIT);
    lastX = t.clientX;
    lastY = t.clientY;
  }, { passive: true });
  document.addEventListener('touchend', () => {
    if (dragging) {
      dragging = false;
      mouseDownTarget = null;
    }
  });

  // --- 键盘 ---
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (view.active || view.exiting) exitFreeView(); return; }
    if (!view.active) return;
    const k = normalizeKey(e.key);
    if (k) {
      // 阻止空格滚动页面、Ctrl 保存等默认行为
      if (k === 'space' || k === 'control') e.preventDefault();
      keys.add(k);
    }
  });
  document.addEventListener('keyup', (e) => {
    const k = normalizeKey(e.key);
    if (k) keys.delete(k);
  });
  // 窗口失焦清空按键，避免卡键
  window.addEventListener('blur', () => keys.clear());

  return view;
}

function normalizeKey(key) {
  const k = key.toLowerCase();
  if (k === 'w' || k === 'a' || k === 's' || k === 'd') return k;
  if (key === ' ' || k === 'space' || key === 'Spacebar') return 'space';
  if (k === 'control' || k === 'ctrl') return 'control';
  if (k === 'shift') return 'shift';
  return null;
}

function forwardVec(yaw, pitch) {
  return new THREE.Vector3(
    Math.sin(yaw) * Math.cos(pitch),
    Math.sin(pitch),
    -Math.cos(yaw) * Math.cos(pitch),
  );
}
function rightVec(yaw) {
  return new THREE.Vector3(Math.cos(yaw), 0, Math.sin(yaw));
}
function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
