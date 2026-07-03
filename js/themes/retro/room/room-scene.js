const THREE = window.THREE;

export function createRoomScene(canvas, { isMobile = false } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile });
  } catch (e) {
    throw new Error('NO_WEBGL');
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a2a25);
  scene.fog = new THREE.Fog(0x0a2a25, 5, 15);

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 1.6, 3.8);
  camera.lookAt(0, 1.2, 0);

  // Bloom 能力探测
  const hasBloom = typeof THREE.EffectComposer === 'function';
  let composer = null;
  let bloomPass = null;

  if (hasBloom) {
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(1, 1), 0.4, 0.6, 0.85);
    composer.addPass(bloomPass);
  }

  function resize(w, h) {
    renderer.setSize(w, h, false);
    if (composer) composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize(window.innerWidth, window.innerHeight);

  function render() {
    if (composer) composer.render();
    else renderer.render(scene, camera);
  }

  function setExposure(v) {
    renderer.toneMappingExposure = v;
  }

  function dispose() {
    scene.traverse((o) => {
      o.geometry?.dispose?.();
      if (o.material) {
        Array.isArray(o.material) ? o.material.forEach((m) => m.dispose()) : o.material.dispose();
      }
    });
    if (composer) composer.dispose();
    renderer.dispose();
  }

  return { scene, camera, renderer, bloomPass, composer, hasBloom, resize, render, setExposure, dispose };
}
