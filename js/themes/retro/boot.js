import { STATES } from './state-machine.js';
import { CAMERA_KEYS, bindPointerLook, applyBreathing, tweenTo, bindResize } from './room/room-camera.js';
import { playDive } from './transitions/dive-animation.js';
import { SFX } from './audio/sound.js';

const gsap = window.gsap;

export function playBootSequence({ ctx, root, sceneCtx, monitor, hint, placeholder, flash, cfg, state }) {
  let currentState = STATES.ROOM;
  let currentTimeline = null;
  let pointerLook = null;
  let breathing = null;
  let resize = null;
  let rafId = null;
  let lastTime = performance.now();
  let stageTimers = [];
  let deskCleanup = null;

  const camera = sceneCtx.camera;
  const canvas = sceneCtx.renderer.domElement;

  function renderLoop(now) {
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    monitor?.update?.(dt);
    sceneCtx.render();
    rafId = requestAnimationFrame(renderLoop);
  }

  function clearStageTimers() {
    stageTimers.forEach((t) => clearTimeout(t));
    stageTimers = [];
  }

  function skip() {
    if (currentTimeline) { currentTimeline.kill(); currentTimeline = null; }
    clearStageTimers();
    deskCleanup?.();
    goToPlaceholder();
  }
  const skipBtn = root.querySelector('#retro-skip');
  skipBtn?.addEventListener('click', skip);
  const onKeyEsc = (e) => { if (e.key === 'Escape') skip(); };
  window.addEventListener('keydown', onKeyEsc);

  function setCameraTo(key) {
    camera.position.set(...key.pos);
    camera.lookAt(key.look[0], key.look[1], key.look[2]);
    camera.fov = key.fov;
    camera.updateProjectionMatrix();
    camera.userData.baseLookX = key.look[0];
    camera.userData.baseLookY = key.look[1];
    camera.userData.lookOX = 0;
    camera.userData.lookOY = 0;
  }

  function enterRoom() {
    currentState = STATES.ROOM;
    setCameraTo(CAMERA_KEYS.room);
    hint.show('room');
    if (!state.reducedMotion) {
      pointerLook = bindPointerLook(camera, { range: 'room', getEnabled: () => currentState === STATES.ROOM || currentState === STATES.DESK });
      breathing = applyBreathing(camera, { getEnabled: () => !state.reducedMotion });
    }
    const onAdvance = () => {
      window.removeEventListener('pointerdown', onAdvance);
      window.removeEventListener('keydown', onRoomKey);
      goToDesk();
    };
    const onRoomKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') { e.preventDefault(); onAdvance(); }
    };
    window.addEventListener('pointerdown', onAdvance);
    window.addEventListener('keydown', onRoomKey);
  }

  function goToDesk() {
    currentState = STATES.DESK;
    hint.hide();
    pointerLook?.dispose?.();
    breathing?.stop?.();
    const dur = (cfg.durations.roomToDesk / 1000) * (state.isMobile ? 1.3 : 1);
    if (state.reducedMotion) {
      setCameraTo(CAMERA_KEYS.desk);
      enterDeskInteractive();
    } else {
      currentTimeline = tweenTo(camera, CAMERA_KEYS.room, CAMERA_KEYS.desk, {
        duration: dur, ease: 'power2.inOut', onComplete: enterDeskInteractive,
      });
    }
  }

  function enterDeskInteractive() {
    currentState = STATES.DESK;
    hint.show('desk', { isMobile: state.isMobile });
    if (!state.reducedMotion) {
      pointerLook = bindPointerLook(camera, { range: 'desk', getEnabled: () => currentState === STATES.DESK });
    }
    const onEnterKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') { e.preventDefault(); triggerEnter(); }
    };
    const onClick = () => triggerEnter();
    window.addEventListener('keydown', onEnterKey);
    window.addEventListener('pointerdown', onClick);
    deskCleanup = () => {
      window.removeEventListener('keydown', onEnterKey);
      window.removeEventListener('pointerdown', onClick);
    };
  }

  function triggerEnter() {
    if (currentState !== STATES.DESK) return;
    deskCleanup?.();
    hint.hide();
    pointerLook?.dispose?.();
    currentState = STATES.ENTER;
    SFX.keypress();

    const keyMesh = sceneCtx.scene.getObjectByName('key_Enter');
    if (keyMesh && !state.reducedMotion) {
      gsap.to(keyMesh.position, { y: '-=0.008', duration: 0.08, ease: 'power2.in', onComplete: () => {
        gsap.to(keyMesh.position, { y: '+=0.008', duration: 0.12, ease: 'back.out(2)' });
      }});
    }

    if (state.reducedMotion) {
      goToBootSeq();
    } else {
      currentTimeline = tweenTo(camera, CAMERA_KEYS.desk, CAMERA_KEYS.enter, {
        duration: 0.4, ease: 'power2.out', onComplete: goToBootSeq,
      });
    }
  }

  function goToBootSeq() {
    currentState = STATES.BOOT_SEQ;
    SFX.crtOn();
    const stages = [
      { phase: 0, dur: 100 },
      { phase: 1, dur: 200 },
      { phase: 2, dur: 500 },
      { phase: 3, dur: 800 },
      { phase: 4, dur: 400 },
    ];
    let acc = 0;
    stages.forEach((s) => {
      const tStart = setTimeout(() => {
        monitor.setPhase(s.phase, 0);
        if (s.phase === 0) SFX.static();
        if (s.phase === 2) SFX.ding();
        if (s.phase === 3) {
          const tickIv = setInterval(() => {
            if (currentState !== STATES.BOOT_SEQ) { clearInterval(tickIv); return; }
            SFX.tick();
          }, 100);
          stageTimers.push(tickIv);
        }
        const obj = { v: 0 };
        gsap.to(obj, {
          v: 1, duration: s.dur / 1000, ease: 'linear',
          onUpdate: () => monitor.setPhase(s.phase, obj.v),
        });
      }, acc);
      acc += s.dur;
      stageTimers.push(tStart);
    });
    const tEnd = setTimeout(goToDive, acc);
    stageTimers.push(tEnd);
  }

  function goToDive() {
    if (currentState === STATES.PLACEHOLDER) return;
    currentState = STATES.DIVE;
    if (state.reducedMotion) {
      flash.flash(0.5, goToPlaceholder);
    } else {
      currentTimeline = playDive({
        sceneCtx, camera, monitor, sound: SFX, durations: cfg.durations,
        onComplete: () => flash.flash(1.5, goToPlaceholder),
      });
    }
  }

  function goToPlaceholder() {
    if (currentState === STATES.PLACEHOLDER) return;
    currentState = STATES.PLACEHOLDER;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    canvas.style.display = 'none';
    hint.hide();
    placeholder.show();
  }

  function resetToRoom() {
    placeholder.hide();
    canvas.style.display = 'block';
    if (monitor) { monitor.setPhase(0, 0); monitor.setEmissive(1); }
    if (sceneCtx.bloomPass) sceneCtx.bloomPass.strength = 0.4;
    else if (sceneCtx.setExposure) sceneCtx.setExposure(1.1);
    lastTime = performance.now();
    if (!rafId) rafId = requestAnimationFrame(renderLoop);
    enterRoom();
  }

  resize = bindResize(sceneCtx);
  rafId = requestAnimationFrame(renderLoop);
  enterRoom();

  return {
    resetToRoom,
    dispose() {
      if (rafId) cancelAnimationFrame(rafId);
      if (currentTimeline) currentTimeline.kill();
      clearStageTimers();
      deskCleanup?.();
      pointerLook?.dispose?.();
      breathing?.stop?.();
      resize?.dispose?.();
      skipBtn?.removeEventListener('click', skip);
      window.removeEventListener('keydown', onKeyEsc);
    },
  };
}
