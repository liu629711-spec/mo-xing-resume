import { describe, it, expect } from 'vitest';
import { getSeasonByMonth, SEASON_VARS, applySeasonVars } from '../js/core/seasons.js';

describe('getSeasonByMonth', () => {
  it('3-5 月为春', () => {
    expect(getSeasonByMonth(2)).toBe('spring');
    expect(getSeasonByMonth(3)).toBe('spring');
    expect(getSeasonByMonth(4)).toBe('spring');
  });
  it('6-8 月为夏', () => {
    expect(getSeasonByMonth(5)).toBe('summer');
    expect(getSeasonByMonth(6)).toBe('summer');
    expect(getSeasonByMonth(7)).toBe('summer');
  });
  it('9-11 月为秋', () => {
    expect(getSeasonByMonth(8)).toBe('autumn');
    expect(getSeasonByMonth(9)).toBe('autumn');
    expect(getSeasonByMonth(10)).toBe('autumn');
  });
  it('12,1,2 月为冬', () => {
    expect(getSeasonByMonth(11)).toBe('winter');
    expect(getSeasonByMonth(0)).toBe('winter');
    expect(getSeasonByMonth(1)).toBe('winter');
  });
  it('负数与 >11 取模回正', () => {
    expect(getSeasonByMonth(12)).toBe('winter'); // 12 % 12 === 0 === 一月
    expect(getSeasonByMonth(14)).toBe('spring'); // 14 % 12 === 2 === 三月
    expect(getSeasonByMonth(-1)).toBe('winter'); // -1 % 12 === 11 === 十二月
  });
});

describe('SEASON_VARS', () => {
  it('四季都有 paper/ink/gold/accent 四个色值', () => {
    for (const s of ['spring', 'summer', 'autumn', 'winter']) {
      const v = SEASON_VARS[s];
      expect(v.paper).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(v.ink).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(v.gold).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(v.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe('applySeasonVars', () => {
  it('将季节色值写入 :root CSS 变量', () => {
    applySeasonVars('autumn');
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--paper')).toBe(SEASON_VARS.autumn.paper);
    expect(root.style.getPropertyValue('--ink')).toBe(SEASON_VARS.autumn.ink);
    expect(root.style.getPropertyValue('--gold')).toBe(SEASON_VARS.autumn.gold);
    expect(root.style.getPropertyValue('--accent')).toBe(SEASON_VARS.autumn.accent);
  });
});
