// 应用入口：初始化顺序编排
import { currentSeason, setSeason, initSeasonSwitcher, onSeasonChange } from './seasons.js';
import { initPaperBg, refreshPaperBg } from '../effects/paper-bg.js';
import { loadAllData } from './data-loader.js';
import { initSmoothScroll } from './scroll.js';
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

function guardGsap() {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    return true;
  }
  console.warn('[init] GSAP/ScrollTrigger 未加载，部分动画不可用');
  return false;
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

  // 5. 开卷仪式 → 启动滚动
  await playLoadingSequence(data.profile);

  // 6. 平滑滚动
  initSmoothScroll();

  // 7. 板块路由与触发器
  registerSections(
    ['about', 'skills', 'projects', 'data', 'games', 'timeline', 'contact'],
    {
      about: { activate() {} },
      skills: { activate() { animateSkillsBars(document.getElementById('sec-skills')); } },
      projects: { activate() {} },
      data: { activate() { drawCharts(document.getElementById('sec-data'), data.metrics); } },
      games: { activate() {} },
      timeline: { activate() { animateTimeline(document.getElementById('sec-timeline')); } },
      contact: { activate() {} },
    },
  );

  // 8. 初始触发首屏板块动画
  requestAnimationFrame(() => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    animateSkillsBars(document.getElementById('sec-skills'));
    animateTimeline(document.getElementById('sec-timeline'));
  });

  console.log('[init] 水墨长卷就绪 ·', { season: currentSeason(), reducedMotion: state.reducedMotion, isMobile: state.isMobile });
}

main().catch((e) => console.error('[init] 启动失败:', e));
