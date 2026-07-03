const gsap = window.gsap;
import { CAMERA_KEYS } from '../room/room-camera.js';

export function playDive({ sceneCtx, camera, monitor, sound, durations, onComplete }) {
  const diveDuration = durations?.dive || 1500;
  const tl = gsap.timeline({ onComplete });

  // uEmissive 1 → 10
  const emissiveObj = { v: 1 };
  tl.to(emissiveObj, {
    v: 10, duration: diveDuration / 1000, ease: 'power2.in',
    onUpdate: () => monitor.setEmissive(emissiveObj.v),
  }, 0);

  // Bloom/exposure 拉高
  if (sceneCtx.bloomPass) {
    tl.to(sceneCtx.bloomPass, {
      strength: 4.0, duration: diveDuration / 1000, ease: 'power2.in',
    }, 0);
  } else if (sceneCtx.setExposure) {
    tl.to(sceneCtx, {
      _exposure: 3.0, duration: diveDuration / 1000, ease: 'power2.in',
      onUpdate: () => sceneCtx.setExposure(sceneCtx._exposure),
    }, 0);
    sceneCtx._exposure = 1.1;
  }

  // 相机 dive：diveStart → diveEnd，前慢后快
  const diveObj = { t: 0 };
  tl.to(diveObj, {
    t: 1, duration: diveDuration / 1000, ease: 'power4.in',
    onUpdate: () => {
      // 横向正弦扰动模拟失重晃动
      const wobble = Math.sin(diveObj.t * 8) * 0.002;
      const k = {
        pos: [
          CAMERA_KEYS.diveStart.pos[0] + (CAMERA_KEYS.diveEnd.pos[0] - CAMERA_KEYS.diveStart.pos[0]) * diveObj.t + wobble,
          CAMERA_KEYS.diveStart.pos[1] + (CAMERA_KEYS.diveEnd.pos[1] - CAMERA_KEYS.diveStart.pos[1]) * diveObj.t,
          CAMERA_KEYS.diveStart.pos[2] + (CAMERA_KEYS.diveEnd.pos[2] - CAMERA_KEYS.diveStart.pos[2]) * diveObj.t,
        ],
        look: CAMERA_KEYS.diveEnd.look,
        fov: CAMERA_KEYS.diveStart.fov + (CAMERA_KEYS.diveEnd.fov - CAMERA_KEYS.diveStart.fov) * diveObj.t,
      };
      camera.position.set(k.pos[0], k.pos[1], k.pos[2]);
      camera.lookAt(k.look[0], k.look[1], k.look[2]);
      camera.fov = k.fov;
      camera.updateProjectionMatrix();
      // 后 0.3s 抖动
      if (diveObj.t > 0.7) {
        camera.position.x += (Math.random() - 0.5) * 0.005;
        camera.position.y += (Math.random() - 0.5) * 0.005;
      }
    },
  }, 0.4);

  // 音效
  tl.add(() => { if (sound) sound.dive(); }, 1.2);

  return tl;
}
