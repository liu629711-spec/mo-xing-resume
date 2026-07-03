import { describe, it, expect } from 'vitest';
import { renderProjectsWindow } from '../../js/themes/retro/sections/projects-window.js';
import { renderSkillsWindow } from '../../js/themes/retro/sections/skills-window.js';
import { renderTimelineWindow } from '../../js/themes/retro/sections/timeline-window.js';
import { renderMetricsWindow } from '../../js/themes/retro/sections/metrics-window.js';
import { renderGamesWindow } from '../../js/themes/retro/sections/games-window.js';

const PROJECTS = [
  {
    name: '幻境探险', period: '2024.01 - 至今', role: '运营负责人',
    metrics: { dau: '+120%', retention: '+8pp', revenue: '+35%' },
    duties: ['统筹活动'], actions: ['重构新手引导'],
    image: '', impact: 0.95,
    dungeonName: '幻境迷宫', bossName: '版本节奏之龙', clearRate: 0.95,
  },
];

const SKILLS = [
  {
    category: '商业化', branch: 'growth', skillPointCost: 3,
    items: [
      { name: '付费设计', level: 0.75, story: 'ARPU 提升 22%' },
      { name: 'ROI 优化', level: 0.7, story: 'ROI 3.4' },
    ],
  },
];

const TIMELINE = [
  { year: '2020.06', title: '毕业', org: '某大学', desc: '埋下种子', stamp: '悟',
    chapterTitle: '序章', dialogue: '埋下种子' },
  { year: '2024.01', title: '运营负责人', org: '幻境', desc: 'DAU 翻倍', stamp: '成',
    chapterTitle: '第三章', dialogue: 'DAU 翻倍' },
];

const METRICS = {
  highlights: [
    { label: '累计运营用户', value: '1200', unit: '万+' },
  ],
  dauCurve: [{ month: '2024-01', dau: 80 }],
  userSources: [{ label: '自然新增', value: 38 }],
  roiBars: [{ activity: '春节活动', roi: 3.4 }],
};

const GAMES = [
  { name: '幻境探险', type: 'MMORPG', period: '2024', role: '运营负责人',
    note: 'DAU 翻倍', platform: 'Mobile', cartridgeColor: '#4a8', cover: '' },
];

describe('renderProjectsWindow', () => {
  it('渲染项目名与副本名', () => {
    const html = renderProjectsWindow(PROJECTS);
    expect(html).toContain('幻境探险');
    expect(html).toContain('幻境迷宫');
  });

  it('空数组不报错', () => {
    const html = renderProjectsWindow([]);
    expect(typeof html).toBe('string');
  });
});

describe('renderSkillsWindow', () => {
  it('渲染分类与技能名', () => {
    const html = renderSkillsWindow(SKILLS);
    expect(html).toContain('商业化');
    expect(html).toContain('付费设计');
  });

  it('空数组不报错', () => {
    const html = renderSkillsWindow([]);
    expect(typeof html).toBe('string');
  });
});

describe('renderTimelineWindow', () => {
  it('渲染章节标题与对话', () => {
    const html = renderTimelineWindow(TIMELINE);
    expect(html).toContain('序章');
    expect(html).toContain('埋下种子');
  });

  it('空数组不报错', () => {
    const html = renderTimelineWindow([]);
    expect(typeof html).toBe('string');
  });
});

describe('renderMetricsWindow', () => {
  it('渲染高亮指标', () => {
    const html = renderMetricsWindow(METRICS);
    expect(html).toContain('累计运营用户');
    expect(html).toContain('1200');
  });

  it('空 metrics 不报错', () => {
    const html = renderMetricsWindow({});
    expect(typeof html).toBe('string');
  });
});

describe('renderGamesWindow', () => {
  it('渲染游戏名与卡带', () => {
    const html = renderGamesWindow(GAMES);
    expect(html).toContain('幻境探险');
    expect(html.toLowerCase()).toContain('cartridge');
  });

  it('空数组不报错', () => {
    const html = renderGamesWindow([]);
    expect(typeof html).toBe('string');
  });
});
