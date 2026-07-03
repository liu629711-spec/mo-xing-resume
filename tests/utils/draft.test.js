import { describe, it, expect } from 'vitest';
import { filterDraft } from '../../js/utils/draft.js';

describe('filterDraft', () => {
  it('过滤掉 draft:true 的条目', () => {
    const arr = [
      { name: 'a', draft: false },
      { name: 'b', draft: true },
      { name: 'c' },
    ];
    expect(filterDraft(arr)).toEqual([
      { name: 'a', draft: false },
      { name: 'c' },
    ]);
  });

  it('全部发布时全部保留', () => {
    const arr = [{ a: 1 }, { a: 2 }];
    expect(filterDraft(arr)).toHaveLength(2);
  });

  it('全部草稿时返回空数组', () => {
    expect(filterDraft([{ x: 1, draft: true }])).toEqual([]);
  });

  it('非数组返回空数组', () => {
    expect(filterDraft(null)).toEqual([]);
    expect(filterDraft(undefined)).toEqual([]);
    expect(filterDraft({})).toEqual([]);
  });

  it('不修改原数组', () => {
    const arr = [{ a: 1, draft: true }, { a: 2 }];
    filterDraft(arr);
    expect(arr).toHaveLength(2);
  });
});
