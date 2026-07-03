// 水墨主题：适配层，封装现有长卷逻辑
import { currentSeason, setSeason, initSeasonSwitcher, onSeasonChange, SEASON_VARS } from '../../core/seasons.js';
import { initPaperBg, refreshPaperBg } from '../../effects/paper-bg.js';
import { initSmoothScroll, getProgress } from '../../core/scroll.js';
import { registerSections, restoreProgress } from '../../core/router.js';
import { state } from '../../core/state.js';
import { playLoadingSequence } from '../../sections/loading.js';
import { renderAbout } from '../../sections/about.js';
import { renderSkills, animateSkillsBars } from '../../sections/skills.js';
import { renderProjects } from '../../sections/projects.js';
import { renderData, drawCharts } from '../../sections/data.js';
import { renderGames } from '../../sections/games.js';
import { renderTimeline, animateTimeline } from '../../sections/timeline.js';
import { renderContact } from '../../sections/contact.js';
import { initThreeScene } from '../../three/scene.js';
import { createWorld } from '../../three/world.js';
import { tickPools } from '../../three/pool.js';
import { createSections3D, tickSections3D } from '../../three/sections3d.js';
import { enhanceTitles } from '../../effects/calligraphy-particles.js';
import { initSeasonParticles, setSeasonParticles } from '../../effects/season-particles.js';
import { playSeasonWave } from '../../effects/season-wave.js';
import { initFreeView } from '../../three/free-view.js';

export const id = 'ink';

/** @type {Record<string, { animateIn?: Function }>} */
let titleControllers = {};

function guardGsap() {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    return true;
  }
  console.warn('[ink] GSAP/ScrollTrigger 未加载，部分动画不可用');
  return false;
}

function bootThree(data) {
  if (state.isMobile || state.reducedMotion) {
    console.log('[ink] 移动端/reduced-motion，采用纯 2D 模式');
    state.has3D = false;
    const host = document.getElementById('three-canvas');
    if (host) host.style.display = 'none';
    return null;
  }
  try {
    const s = initThreeScene();
    const world = createWorld(s.uniforms);
    s.scene.add(world);
    s.world = world;
    s.sections3d = createSections3D(s.scene, data, s.uniforms);
    onSeasonChange((season) => s.applySeason(SEASON_VARS[season]));
    onSeasonChange((season) => s.world?.userData?.setSeason?.(season));
    s.world?.userData?.setSeason?.(currentSeason());
    initFreeView(s);
    let last = performance.now();
    let tAccum = 0;
    function loop(t) {
      const dt = (t - last) / 1000;
      last = t;
      tAccum += dt;
      const progress = getProgress();
      s.update(progress, dt);
      s.world?.userData?.tickDeco?.();
      tickPools(dt);
      tickSections3D(s.sections3d, tAccum, dt, progress);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    state.has3D = true;
    return s;
  } catch (e) {
    console.warn('[ink] 3D 启动失败，降级为纯 2D 模式:', e.message);
    state.has3D = false;
    const host = document.getElementById('three-canvas');
    if (host) host.style.display = 'none';
    return null;
  }
}

function showInkShell() {
  const ids = [
    'paper-bg', 'three-canvas', 'loading-screen', 'scroll-container',
    'kintsugi-overlay', 'ink-ripple-overlay', 'season-switcher', 'explore-progress',
  ];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  });
  document.body.classList.remove('theme-retro-active');
  document.body.classList.add('theme-ink-active');
}

/** @param {{ data: object }} ctx */
export async function init(ctx) {
  showInkShell();
  guardGsap();

  const { data } = ctx;

  setSeason(currentSeason());
  initSeasonSwitcher();
  onSeasonChange(() => refreshPaperBg());
  onSeasonChange((season) => setSeasonParticles(season, true));
  onSeasonChange((_season, _vars, fromEl) => playSeasonWave(fromEl));
  initSeasonParticles();
  setSeasonParticles(currentSeason(), false);

  initPaperBg();

  if (data.profile.pageTitle) {
    document.title = data.profile.pageTitle;
  }

  renderAbout(document.getElementById('sec-about'), data.profile);
  renderSkills(document.getElementById('sec-skills'), data.skills);
  renderProjects(document.getElementById('sec-projects'), data.projects);
  renderData(document.getElementById('sec-data'), data.metrics);
  renderGames(document.getElementById('sec-games'), data.games);
  renderTimeline(document.getElementById('sec-timeline'), data.timeline);
  renderContact(document.getElementById('sec-contact'), data.contact);

  bootThree(data);

  titleControllers = {};
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  const sectionNames = ['about', 'skills', 'projects', 'data', 'games', 'timeline', 'contact'];
  if (!state.reducedMotion) {
    sectionNames.forEach((name) => {
      const el = document.getElementById(`sec-${name}`);
      if (el) titleControllers[name] = enhanceTitles(el);
    });
  }
}

/** @param {{ data: object }} ctx */
export async function boot(ctx) {
  const { data } = ctx;
  const sectionNames = ['about', 'skills', 'projects', 'data', 'games', 'timeline', 'contact'];

  if (state.reducedMotion) {
    const screen = document.getElementById('loading-screen');
    if (screen) screen.style.display = 'none';
  } else {
    await playLoadingSequence(data.profile);
  }

  initSmoothScroll();
  restoreProgress();

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

  requestAnimationFrame(() => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    titleControllers.about?.animateIn();
    animateSkillsBars(document.getElementById('sec-skills'));
    animateTimeline(document.getElementById('sec-timeline'));
  });

  console.log('[ink] 水墨长卷就绪 ·', {
    season: currentSeason(),
    reducedMotion: state.reducedMotion,
    isMobile: state.isMobile,
    has3D: state.has3D,
  });
}
