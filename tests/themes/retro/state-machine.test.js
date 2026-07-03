import { describe, it, expect } from 'vitest';
import { STATES, canTransition, nextBootState, skipTarget } from '../../../js/themes/retro/state-machine.js';

describe('canTransition', () => {
  it('ROOM→DESK 合法', () => { expect(canTransition('ROOM', 'DESK')).toBe(true); });
  it('完整 boot 链合法', () => {
    expect(canTransition('ROOM', 'DESK')).toBe(true);
    expect(canTransition('DESK', 'ENTER')).toBe(true);
    expect(canTransition('ENTER', 'BOOT_SEQ')).toBe(true);
    expect(canTransition('BOOT_SEQ', 'DIVE')).toBe(true);
    expect(canTransition('DIVE', 'PLACEHOLDER')).toBe(true);
  });
  it('ROOM→DIVE 非法（跳步）', () => { expect(canTransition('ROOM', 'DIVE')).toBe(false); });
  it('PLACEHOLDER→ROOM 合法（返回房间）', () => { expect(canTransition('PLACEHOLDER', 'ROOM')).toBe(true); });
});

describe('nextBootState', () => {
  it('ROOM 的下一个是 DESK', () => { expect(nextBootState('ROOM')).toBe('DESK'); });
  it('PLACEHOLDER 没有下一个（返回 null）', () => { expect(nextBootState('PLACEHOLDER')).toBe(null); });
});

describe('skipTarget', () => {
  it('任意状态跳过都到 PLACEHOLDER', () => {
    for (const s of ['ROOM', 'DESK', 'ENTER', 'BOOT_SEQ', 'DIVE']) {
      expect(skipTarget(s)).toBe('PLACEHOLDER');
    }
  });
});
