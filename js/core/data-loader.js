// 数据加载：并行 fetch 所有 JSON，校验失败回退占位。
// list 类数据用目录式存储：data/themes/<themeId>/<name>/index.json
import {
  validateProfile, validateSkills, validateProjects,
  validateMetrics, validateGames, validateTimeline, validateContact,
  validateRoomProps,
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
  roomProps: [],
};

function themeBase(themeId) {
  return `data/themes/${themeId}`;
}

async function load(name, validator, themeId) {
  const themedPath = `${themeBase(themeId)}/${name}.json`;
  const paths = themeId === 'ink'
    ? [themedPath, `data/${name}.json`]
    : [themedPath];

  for (const path of paths) {
    try {
      const res = await fetch(path);
      if (!res.ok) continue;
      const data = await res.json();
      if (!validator(data)) {
        console.warn(`[data] ${path} schema 校验失败，使用占位`);
        return FALLBACK[name];
      }
      if (path === `data/${name}.json` && themeId === 'ink') {
        console.warn(`[data] 使用旧路径 data/${name}.json，建议迁移到 ${themedPath}`);
      }
      return data;
    } catch (e) {
      console.warn(`[data] 加载 ${path} 失败:`, e.message);
    }
  }
  console.warn(`[data] ${name} 全部路径失败，使用占位`);
  return FALLBACK[name];
}

async function loadDir(name, validator, themeId) {
  const themedDir = `${themeBase(themeId)}/${name}`;
  const bases = themeId === 'ink'
    ? [themedDir, `data/${name}`]
    : [themedDir];

  for (const base of bases) {
    try {
      const idxRes = await fetch(`${base}/index.json`);
      if (!idxRes.ok) continue;
      const files = await idxRes.json();
      const items = await Promise.all(
        files.map((f) => fetch(`${base}/${f}`).then((r) => r.json())),
      );
      const arr = items.filter(Boolean);
      if (validator(arr)) return filterDraft(arr);
      console.warn(`[data] ${base}/ 目录数据校验失败`);
    } catch (e) {
      console.warn(`[data] 加载 ${base} 目录失败:`, e.message);
    }
  }

  if (name === 'room-props') return FALLBACK.roomProps;

  if (themeId !== 'ink') return FALLBACK[name];

  const data = await load(name, validator, themeId);
  return filterDraft(Array.isArray(data) ? data : FALLBACK[name]);
}

export async function loadAllData(themeId = 'ink') {
  const baseLoaders = [
    load('profile', validateProfile, themeId),
    loadDir('skills', validateSkills, themeId),
    loadDir('projects', validateProjects, themeId),
    load('metrics', validateMetrics, themeId),
    loadDir('games', validateGames, themeId),
    loadDir('timeline', validateTimeline, themeId),
    load('contact', validateContact, themeId),
  ];

  const results = themeId === 'retro'
    ? await Promise.all([...baseLoaders, loadDir('room-props', validateRoomProps, themeId)])
    : await Promise.all(baseLoaders);

  const [profile, skills, projects, metrics, games, timeline, contact] = results;
  const payload = {
    profile,
    skills,
    projects,
    metrics,
    games,
    timeline,
    contact,
  };

  if (themeId === 'retro') {
    payload.roomProps = results[7] || [];
  }

  return payload;
}
