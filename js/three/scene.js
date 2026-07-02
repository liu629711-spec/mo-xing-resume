// Three.js 场景核心：场景、相机、渲染器、渲染循环。
// 山水长卷沿 X 轴延伸，摄像机随滚动进度沿 X 推进。
// THREE 通过 <script> 全局加载，此处取 window.THREE。

const THREE = window.THREE;

function readVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

let sceneObj = null;

export function initThreeScene() {
  if (!THREE) throw new Error('NO_THREE');
  if (!window.WebGLRenderingContext) throw new Error('NO_WEBGL');

  const host = document.getElementById('three-canvas');
  if (!host) throw new Error('NO_HOST');

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  // 雾：远山朦胧
  const paperRgb = hexToRgb(readVar('--paper', '#EDE4D3'));
  const fogColor = new THREE.Color(paperRgb[0], paperRgb[1], paperRgb[2]);
  scene.fog = new THREE.Fog(fogColor, 12, 38);

  // 相机：沿 X+ 看向远方
  const camera = new THREE.PerspectiveCamera(
    55, window.innerWidth / window.innerHeight, 0.1, 100,
  );
  camera.position.set(0, 2.4, 10);
  camera.lookAt(10, 1.2, 0);

  // 环境光 + 平行光（水墨风，弱化阴影）
  const ambient = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambient);
  const dir = new THREE.DirectionalLight(0xffffff, 0.4);
  dir.position.set(-4, 8, 6);
  scene.add(dir);

  // 全局 uniform（季节切换时更新）
  const uniforms = {
    uTime: { value: 0 },
    uPaperColor: { value: new THREE.Color(...paperRgb) },
    uInkColor: { value: new THREE.Color(...hexToRgb(readVar('--ink', '#141414'))) },
    uGoldColor: { value: new THREE.Color(...hexToRgb(readVar('--gold', '#D4AF37'))) },
    uAccentColor: { value: new THREE.Color(...hexToRgb(readVar('--accent', '#B5483A'))) },
    uSeasonTint: { value: new THREE.Color(...hexToRgb('#B5483A')) },
    uSnowMix: { value: 0 },
  };

  // 摄像机平滑推进
  const camTarget = { x: 0 };
  const camQuickTo = (typeof gsap !== 'undefined')
    ? gsap.quickTo(camera.position, 'x', { duration: 0.6, ease: 'power2.out' })
    : null;

  function update(progress, dt) {
    uniforms.uTime.value += dt;
    // 摄像机 X = progress * 70（长卷总长 70 单位，每板块约 10）
    camTarget.x = progress * 70;
    if (camQuickTo) camQuickTo(camTarget.x);
    else camera.position.x = camTarget.x;
    camera.lookAt(camera.position.x + 10, 1.2, 0);
    renderer.render(scene, camera);
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  // 季节切换更新 uniform + 雾色（GSAP 平滑过渡）
  function applySeason(seasonVars) {
    const p = hexToRgb(seasonVars.paper);
    const i = hexToRgb(seasonVars.ink);
    const g = hexToRgb(seasonVars.gold);
    const a = hexToRgb(seasonVars.accent);
    const t = hexToRgb(seasonVars.tint || '#B5483A');
    const snow = seasonVars.snowMix || 0;
    if (typeof gsap !== 'undefined') {
      gsap.to(uniforms.uPaperColor.value, { r: p[0], g: p[1], b: p[2], duration: 1.2, ease: 'power2.inOut' });
      gsap.to(uniforms.uInkColor.value, { r: i[0], g: i[1], b: i[2], duration: 1.2, ease: 'power2.inOut' });
      gsap.to(uniforms.uGoldColor.value, { r: g[0], g: g[1], b: g[2], duration: 1.2, ease: 'power2.inOut' });
      gsap.to(uniforms.uAccentColor.value, { r: a[0], g: a[1], b: a[2], duration: 1.2, ease: 'power2.inOut' });
      gsap.to(uniforms.uSeasonTint.value, { r: t[0], g: t[1], b: t[2], duration: 1.2, ease: 'power2.inOut' });
      gsap.to(uniforms.uSnowMix, { value: snow, duration: 1.2, ease: 'power2.inOut' });
      gsap.to(scene.fog.color, { r: p[0], g: p[1], b: p[2], duration: 1.2, ease: 'power2.inOut' });
    } else {
      uniforms.uPaperColor.value.setRGB(p[0], p[1], p[2]);
      uniforms.uInkColor.value.setRGB(i[0], i[1], i[2]);
      uniforms.uGoldColor.value.setRGB(g[0], g[1], g[2]);
      uniforms.uAccentColor.value.setRGB(a[0], a[1], a[2]);
      uniforms.uSeasonTint.value.setRGB(t[0], t[1], t[2]);
      uniforms.uSnowMix.value = snow;
      scene.fog.color.setRGB(p[0], p[1], p[2]);
    }
  }

  sceneObj = { renderer, scene, camera, uniforms, update, applySeason, host };
  return sceneObj;
}

export function getScene() { return sceneObj; }
