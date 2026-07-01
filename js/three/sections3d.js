// 七板块 3D 景致总入口：创建各板块 3D group，沿 X 轴定位，统一 tick。
const THREE = window.THREE;

import { createBamboo, tickBamboo } from './bamboo.js';
import { createPavilion } from './pavilion.js';
import { createChessboard, tickChessboard } from './chessboard.js';
import { createProjectPeaks, tickProjectPeaks } from './project-peaks.js';
import { createRiver } from './shaders/river-shader.js';
import { createSteleForest, tickSteleForest } from './stele-forest.js';
import { createTimelinePath, tickTimeline } from './timeline-path.js';
import { createHarbor, tickHarbor } from './harbor.js';

// 每板块 X 位置（长卷沿 X，每 10 单位一板块）
const SECTION_X = {
  about: 0, skills: 10, projects: 20, data: 30, games: 40, timeline: 50, contact: 60,
};

export function createSections3D(scene, data, uniforms) {
  const groups = {};

  // 板块 1：入山亭（墨竹 + 亭子）
  const about = new THREE.Group();
  about.add(createBamboo(uniforms));
  const pav = createPavilion(uniforms);
  pav.position.set(1.5, 0, -0.5);
  about.add(pav);
  about.position.x = SECTION_X.about;
  scene.add(about);
  groups.about = about;

  // 板块 2：星罗棋盘
  const skills = createChessboard(data.skills, uniforms);
  skills.position.set(SECTION_X.skills, 0, 0);
  scene.add(skills);
  groups.skills = skills;

  // 板块 3：峰峦叠嶂
  const projects = createProjectPeaks(data.projects, uniforms);
  projects.position.set(SECTION_X.projects, 0, 0);
  scene.add(projects);
  groups.projects = projects;

  // 板块 4：墨河奔流
  const river = createRiver(uniforms);
  river.scale.set(1, 1, 1.5);
  river.position.set(SECTION_X.data, 0.3, -1);
  scene.add(river);
  groups.data = river;

  // 板块 5：碑林
  const games = createSteleForest(data.games, uniforms);
  games.position.set(SECTION_X.games, 0, 0);
  scene.add(games);
  groups.games = games;

  // 板块 6：山径蜿蜒
  const timeline = createTimelinePath(data.timeline, uniforms);
  timeline.position.set(SECTION_X.timeline, 0, 0);
  scene.add(timeline);
  groups.timeline = timeline;

  // 板块 7：归舟渡口
  const contact = createHarbor(uniforms);
  contact.position.set(SECTION_X.contact, 0, 0);
  scene.add(contact);
  groups.contact = contact;

  return groups;
}

// 统一 tick：更新所有板块 3D 动效
export function tickSections3D(groups, t, dt, scrollProgress) {
  if (groups.about) tickBamboo(groups.about, t);
  if (groups.skills) tickChessboard(groups.skills, t);
  if (groups.projects) tickProjectPeaks(groups.projects, t);
  if (groups.games) tickSteleForest(groups.games, t);
  if (groups.timeline) {
    // 时间轴行旅墨点跟随该板块在整体进度中的位置
    const sectionProgress = clamp((scrollProgress - 5 / 70) * 7, 0, 1);
    tickTimeline(groups.timeline, t, sectionProgress);
  }
  if (groups.contact) tickHarbor(groups.contact, t);
}

function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
