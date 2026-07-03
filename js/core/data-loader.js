// 数据加载：并行 fetch 所有 JSON，校验失败回退占位。
// list 类数据（skills/projects/games/timeline）用目录式存储：data/<name>/index.json
// 列出文件名，逐个 fetch 后聚合。profile/metrics/contact 仍为单文件。
import {
  validateProfile, validateSkills, validateProjects,
  validateMetrics, validateGames, validateTimeline, validateContact,
} from './data-schema.js';
import { filterDraft } from '../utils/draft.js';

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

// 加载目录式 collection：读 data/<name>/index.json 获取文件列表，逐个 fetch 聚合成数组。
// index.json 不存在时回退到单文件数组 data/<name>.json（向后兼容）。
async function loadDir(name, validator) {
  try {
    const idxRes = await fetch(`data/${name}/index.json`);
    if (idxRes.ok) {
      const files = await idxRes.json();
      const items = await Promise.all(
        files.map((f) => fetch(`data/${name}/${f}`).then((r) => r.json()))
      );
      const arr = items.filter(Boolean);
      if (validator(arr)) return filterDraft(arr);
      console.warn(`[data] ${name}/ 目录数据校验失败，使用占位`);
      return FALLBACK[name];
    }
    // 回退到单文件数组
    const data = await load(name, validator);
    return filterDraft(data);
  } catch (e) {
    console.warn(`[data] 加载 ${name} 目录失败:`, e.message);
    return FALLBACK[name];
  }
}

export async function loadAllData() {
  const [profile, skills, projects, metrics, games, timeline, contact] = await Promise.all([
    load('profile', validateProfile),
    loadDir('skills', validateSkills),
    loadDir('projects', validateProjects),
    load('metrics', validateMetrics),
    loadDir('games', validateGames),
    loadDir('timeline', validateTimeline),
    load('contact', validateContact),
  ]);
  return {
    profile,
    skills,
    projects,
    metrics,
    games,
    timeline,
    contact,
  };
}
