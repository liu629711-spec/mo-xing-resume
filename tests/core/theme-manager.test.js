import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseThemeFromSearch,
  resolveThemeId,
  STORAGE_KEY,
} from '../../js/core/theme-manager.js';

describe('parseThemeFromSearch', () => {
  it('?theme=retro 返回 retro', () => {
    expect(parseThemeFromSearch('?theme=retro')).toBe('retro');
  });

  it('无参数返回 null', () => {
    expect(parseThemeFromSearch('')).toBeNull();
  });

  it('非法 id 返回 null', () => {
    expect(parseThemeFromSearch('?theme=unknown')).toBeNull();
  });
});

describe('resolveThemeId', () => {
  beforeEach(() => localStorage.clear());

  it('URL 优先于 localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'ink');
    expect(resolveThemeId('?theme=retro', ['ink', 'retro'])).toBe('retro');
  });

  it('无 URL 时用 localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'ink');
    expect(resolveThemeId('', ['ink', 'retro'])).toBe('ink');
  });

  it('都没有时用 defaultTheme', () => {
    expect(resolveThemeId('', ['ink', 'retro'], 'ink')).toBe('ink');
  });
});
