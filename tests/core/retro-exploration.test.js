import { describe, it, expect } from 'vitest';
import {
  addVisited,
  isAllVisited,
  getCompletionPercent,
  ALL_SECTIONS,
} from '../../js/themes/retro/exploration.js';

describe('addVisited', () => {
  it('向空集合添加一个板块', () => {
    const result = addVisited(new Set(), 'about');
    expect(result.has('about')).toBe(true);
  });

  it('不修改原集合（返回新集合）', () => {
    const original = new Set(['about']);
    const result = addVisited(original, 'skills');
    expect(original.has('skills')).toBe(false);
    expect(result.has('skills')).toBe(true);
  });

  it('重复添加保持唯一', () => {
    const result = addVisited(addVisited(new Set(), 'about'), 'about');
    expect(result.size).toBe(1);
  });
});

describe('isAllVisited', () => {
  it('全部访问返回 true', () => {
    const visited = new Set(ALL_SECTIONS);
    expect(isAllVisited(visited)).toBe(true);
  });

  it('部分访问返回 false', () => {
    const visited = new Set(['about', 'skills']);
    expect(isAllVisited(visited)).toBe(false);
  });
});

describe('getCompletionPercent', () => {
  it('空集合返回 0', () => {
    expect(getCompletionPercent(new Set())).toBe(0);
  });

  it('全部访问返回 100', () => {
    expect(getCompletionPercent(new Set(ALL_SECTIONS))).toBe(100);
  });

  it('部分访问返回整数百分比', () => {
    const half = Math.ceil(ALL_SECTIONS.length / 2);
    const visited = new Set(ALL_SECTIONS.slice(0, half));
    const pct = getCompletionPercent(visited);
    expect(pct).toBeGreaterThan(0);
    expect(pct).toBeLessThan(100);
    expect(Number.isInteger(pct)).toBe(true);
  });
});
