const THREE = window.THREE;
import { vertexShader } from './shaders/main.vertex.glsl.js';
import { fragmentShader } from './shaders/main.fragment.glsl.js';

function hexToVec3(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return new THREE.Vector3(r, g, b);
}

export function createMonitorScreen(scene, cfg, logoTexture) {
  const anchor = scene.getObjectByName('monitor_screen_anchor');
  const screenPos = anchor ? anchor.position : new THREE.Vector3(0, 1.05, -0.35);

  const geometry = new THREE.PlaneGeometry(0.5, 0.38);
  const uniforms = {
    uTime: { value: 0 },
    uPhase: { value: 0 },
    uPhaseProgress: { value: 0 },
    uEmissive: { value: 1 },
    uLogoTex: { value: logoTexture || new THREE.Texture() },
    uAccentColor: { value: hexToVec3(cfg.accentColor || '#7DD3C0') },
    uBgColor: { value: hexToVec3(cfg.bgColor || '#0a2a25') },
    uProgress: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms, vertexShader, fragmentShader,
    transparent: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(screenPos);
  mesh.name = 'monitor_screen';
  scene.add(mesh);

  // 屏幕外溢光晕（Sprite，dive 阶段随 uEmissive 增强）
  const haloTex = makeHaloTexture();
  const haloMat = new THREE.SpriteMaterial({
    map: haloTex, color: 0xffffff, transparent: true,
    opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const halo = new THREE.Sprite(haloMat);
  halo.scale.set(1.2, 1.2, 1);
  halo.position.copy(screenPos);
  halo.position.z += 0.01;
  scene.add(halo);

  function setPhase(phase, progress = 0) {
    uniforms.uPhase.value = phase;
    uniforms.uPhaseProgress.value = progress;
    if (phase === 3) uniforms.uProgress.value = progress;
  }

  function setEmissive(v) {
    uniforms.uEmissive.value = v;
    haloMat.opacity = Math.max(0, (v - 1) / 9);
  }

  function update(dt) {
    uniforms.uTime.value += dt;
  }

  function dispose() {
    geometry.dispose();
    material.dispose();
    haloMat.dispose();
    haloTex.dispose();
    scene.remove(mesh);
    scene.remove(halo);
  }

  return { mesh, uniforms, setPhase, setEmissive, update, dispose };
}

function makeHaloTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.3)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}
