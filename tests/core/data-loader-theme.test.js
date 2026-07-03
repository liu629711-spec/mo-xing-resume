import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadAllData } from '../../js/core/data-loader.js';

describe('loadAllData theme paths', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('ink 主题优先请求 data/themes/ink/profile.json', async () => {
    const urls = [];
    vi.stubGlobal('fetch', vi.fn((url) => {
      urls.push(url);
      if (url === 'data/themes/ink/profile.json') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            name: '测试', tagline: 't', summary: ['a'], seal: '测',
          }),
        });
      }
      if (url.endsWith('/index.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url.endsWith('.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(getMinimalJson(url)),
        });
      }
      return Promise.resolve({ ok: false });
    }));

    await loadAllData('ink');
    expect(urls.some((u) => u === 'data/themes/ink/profile.json')).toBe(true);
  });
});

function getMinimalJson(url) {
  if (url.includes('metrics')) {
    return {
      highlights: [{ label: 'x', value: '1', unit: '' }],
      dauCurve: [], userSources: [], roiBars: [],
    };
  }
  if (url.includes('contact')) {
    return { email: 'a@b.c', invite: 'hi' };
  }
  return [];
}
