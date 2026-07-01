// 数据加载：并行 fetch 所有 JSON，校验失败回退占位。
import {
  validateProfile, validateSkills, validateProjects,
  validateMetrics, validateGames, validateTimeline, validateContact,
} from './data-schema.js';

const FALLBACK = {
  profile: { name: '墨行', tagline: '游戏产品运营', summary: ['内容更新中'], seal: '墨' },
  skills: [{ category: '加载中', items: [{ name: '...', level: 0.5, story: '' }] }],
  projects: [],
  metrics: { highlights: [{ label: '数据', value: '—', unit: '' }], dauCurve: [], userSources: [], roiBars: [] },
  games: [],
  timeline: [],
  contact: { email: '', wechat: '', invite: '内容更新中' },
};

async function load(name, validator) {
  try {
    const res = await fetch(`data/${name}.json`);
    if (!res.ok) throw new Error(`${name}.json HTTP ${res.status}`);
    const data = await res.json();
    if (!validator(data)) {
      console.warn(`[data] ${name}.json schema 校验失败，使用占位`);
      return FALLBACK[name];
    }
    return data;
  } catch (e) {
    console.warn(`[data] 加载 ${name}.json 失败:`, e.message, '，使用占位');
    return FALLBACK[name];
  }
}

export async function loadAllData() {
  const [profile, skills, projects, metrics, games, timeline, contact] = await Promise.all([
    load('profile', validateProfile),
    load('skills', validateSkills),
    load('projects', validateProjects),
    load('metrics', validateMetrics),
    load('games', validateGames),
    load('timeline', validateTimeline),
    load('contact', validateContact),
  ]);
  return { profile, skills, projects, metrics, games, timeline, contact };
}
