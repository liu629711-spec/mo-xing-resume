import { describe, it, expect } from 'vitest';
import {
  validateProfile, validateSkills, validateProjects,
  validateMetrics, validateGames, validateTimeline, validateContact,
} from '../js/core/data-schema.js';

const goodProfile = { name: '墨行', tagline: '一句话', summary: ['a', 'b'], seal: '墨行' };
const goodSkillItem = { name: '版本', level: 0.9, story: '...' };
const goodSkills = [{ category: '活动', items: [goodSkillItem] }];
const goodProject = {
  name: 'p', period: '2024', role: 'r', metrics: { dau: '+1' },
  duties: [], actions: [], image: '', impact: 0.5,
};
const goodMetrics = {
  highlights: [{ label: 'l', value: '1', unit: '万' }],
  dauCurve: [], userSources: [], roiBars: [],
};
const goodGame = { name: 'g', type: 'RPG', period: '2024', role: 'r', cover: '', note: 'n' };
const ndaGame = { name: '未上线', type: 'NDA', period: '', role: '', cover: '', note: '', nda: true };
const goodTimeline = [{ year: '2024', title: 't', org: 'o', desc: 'd', stamp: '成' }];
const goodContact = { email: 'a@b.com', wechat: 'x', invite: '聊聊' };

describe('profile schema', () => {
  it('合法数据通过', () => expect(validateProfile(goodProfile)).toBe(true));
  it('缺字段失败', () => expect(validateProfile({ name: '墨行' })).toBe(false));
  it('summary 不是数组失败', () => {
    expect(validateProfile({ name: 'a', tagline: 'b', summary: 'c', seal: 'd' })).toBe(false);
  });
});

describe('skills schema', () => {
  it('合法数据通过', () => expect(validateSkills(goodSkills)).toBe(true));
  it('level 越界失败', () => {
    expect(validateSkills([{ category: '活动', items: [{ name: 'x', level: 1.5, story: 'y' }] }])).toBe(false);
  });
  it('非数组失败', () => expect(validateSkills({})).toBe(false));
});

describe('projects schema', () => {
  it('合法数据通过', () => expect(validateProjects([goodProject])).toBe(true));
  it('缺字段失败', () => expect(validateProjects([{ name: 'p' }])).toBe(false));
  it('非数组失败', () => expect(validateProjects(null)).toBe(false));
});

describe('metrics schema', () => {
  it('合法数据通过', () => expect(validateMetrics(goodMetrics)).toBe(true));
  it('缺 highlights 失败', () => expect(validateMetrics({})).toBe(false));
});

describe('games schema', () => {
  it('合法数据通过', () => expect(validateGames([goodGame])).toBe(true));
  it('NDA 项目通过', () => expect(validateGames([ndaGame])).toBe(true));
  it('非数组失败', () => expect(validateGames([])).toBe(false));
});

describe('timeline schema', () => {
  it('合法数据通过', () => expect(validateTimeline(goodTimeline)).toBe(true));
  it('空数组失败', () => expect(validateTimeline([])).toBe(false));
});

describe('contact schema', () => {
  it('合法数据通过', () => expect(validateContact(goodContact)).toBe(true));
  it('缺 email 失败', () => expect(validateContact({ wechat: 'x' })).toBe(false));
});

describe('games schema 扩展字段', () => {
  const base = { name: 'g', type: 'RPG', period: '2024', role: 'r', cover: '', note: 'n' };

  it('带 video/description/metrics/draft 可选字段通过', () => {
    const g = {
      ...base,
      video: 'https://oss.x.com/a.mp4',
      description: '## 亮点\n运营心得...',
      metrics: [{ label: 'DAU', value: '+120%', unit: '' }],
      draft: false,
    };
    expect(validateGames([g])).toBe(true);
  });

  it('只有基础字段仍通过（向后兼容）', () => {
    expect(validateGames([base])).toBe(true);
  });

  it('video 非字符串失败', () => {
    expect(validateGames([{ ...base, video: 123 }])).toBe(false);
  });

  it('description 非字符串失败', () => {
    expect(validateGames([{ ...base, description: [] }])).toBe(false);
  });

  it('metrics 非数组失败', () => {
    expect(validateGames([{ ...base, metrics: 'x' }])).toBe(false);
  });

  it('draft 非布尔失败', () => {
    expect(validateGames([{ ...base, draft: 'yes' }])).toBe(false);
  });
});
