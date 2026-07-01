// 应用入口：初始化顺序编排
import { currentSeason, setSeason, initSeasonSwitcher, onSeasonChange, SEASON_VARS } from './seasons.js';
import { initPaperBg, refreshPaperBg } from '../effects/paper-bg.js';
import { loadAllData } from './data-loader.js';
import { initSmoothScroll, getProgress } from './scroll.js';
import { registerSections } from './router.js';
import { state } from './state.js';
import { playLoadingSequence } from '../sections/loading.js';
import { renderAbout } from '../sections/about.js';
import { renderSkills, animateSkillsBars } from '../sections/skills.js';
import { renderProjects } from '../sections/projects.js';
import { renderData, drawCharts } from '../sections/data.js';
import { renderGames } from '../sections/games.js';
import { renderTimeline, animateTimeline } from '../sections/timeline.js';
import { renderContact } from '../sections/contact.js';
import { initThreeScene } from '../three/scene.js';
import { createWorld } from '../three/world.js';
import { tickPools } from '../three/pool.js';
import { enhanceTitles } from '../effects/calligraphy-particles.js';

function guardGsap() {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    return true;
  }
  console.warn('[init] GSAP/ScrollTrigger 未加载，部分动画不可用');
  return false;
}

// 启动 3D 场景；失败则走 2D 降级
function bootThree() {
  try {
    const s = initThreeScene();
    const world = createWorld(s.uniforms);
    s.scene.add(world);
    s.world = world;
    // 季节切换更新 3D uniform
    onSeasonChange((season) => s.applySeason(SEASON_VARS[season]));
    // 渲染循环
    let last = performance.now();
    function loop(t) {
      const dt = (t - last) / 1000;
      last = t;
      const progress = getProgress();
      s.update(progress, dt);
      tickPools(dt);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    state.has3D = true;
    return s;
  } catch (e) {
    console.warn('[init] 3D 启动失败，降级为纯 2D 模式:', e.message);
    state.has3D = false;
    // 隐藏 3D 容器
    const host = document.getElementById('three-canvas');
    if (host) host.style.display = 'none';
    return null;
  }
}

async function main() {
  guardGsap();

  // 1. 四季
  setSeason(currentSeason());
  initSeasonSwitcher();
  onSeasonChange(() => refreshPaperBg());

  // 2. 宣纸底纹
  initPaperBg();

  // 3. 加载数据
  const data = await loadAllData();

  // 4. 渲染各板块内容
  renderAbout(document.getElementById('sec-about'), data.profile);
  renderSkills(document.getElementById('sec-skills'), data.skills);
  renderProjects(document.getElementById('sec-projects'), data.projects);
  renderData(document.getElementById('sec-data'), data.metrics);
  renderGames(document.getElementById('sec-games'), data.games);
  renderTimeline(document.getElementById('sec-timeline'), data.timeline);
  renderContact(document.getElementById('sec-contact'), data.contact);

  // 5. 启动 3D 场景（在 loading 之前，让 loading 背景后已有 3D）
  bootThree();

  // 5.5 等字体加载后增强标题为书法粒子
  const titleControllers = {};
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  const sectionNames = ['about', 'skills', 'projects', 'data', 'games', 'timeline', 'contact'];
  sectionNames.forEach((name) => {
    const el = document.getElementById(`sec-${name}`);
    if (el) titleControllers[name] = enhanceTitles(el);
  });

  // 6. 开卷仪式 → 启动滚动
  await playLoadingSequence(data.profile);

  // 7. 平滑滚动
  initSmoothScroll();

  // 8. 板块路由与触发器
  registerSections(
    sectionNames,
    {
      about: { activate() { titleControllers.about?.animateIn(); } },
      skills: { activate() { titleControllers.skills?.animateIn(); animateSkillsBars(document.getElementById('sec-skills')); } },
      projects: { activate() { titleControllers.projects?.animateIn(); } },
      data: { activate() { titleControllers.data?.animateIn(); drawCharts(document.getElementById('sec-data'), data.metrics); } },
      games: { activate() { titleControllers.games?.animateIn(); } },
      timeline: { activate() { titleControllers.timeline?.animateIn(); animateTimeline(document.getElementById('sec-timeline')); } },
      contact: { activate() { titleControllers.contact?.animateIn(); } },
    },
  );

  // 9. 初始触发首屏板块动画
  requestAnimationFrame(() => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    titleControllers.about?.animateIn();
    animateSkillsBars(document.getElementById('sec-skills'));
    animateTimeline(document.getElementById('sec-timeline'));
  });

  console.log('[init] 水墨长卷就绪 ·', {
    season: currentSeason(),
    reducedMotion: state.reducedMotion,
    isMobile: state.isMobile,
    has3D: state.has3D,
  });
}

main().catch((e) => console.error('[init] 启动失败:', e));
