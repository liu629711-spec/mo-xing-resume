import { describe, it, expect } from 'vitest';
import { validateBootConfig } from '../../../js/core/data-schema.js';

const valid = {
  pageTitle: '我的一生 · 复古电脑',
  logoText: '我的一生',
  accentColor: '#7DD3C0',
  bgColor: '#0a2a25',
  loadingText: 'LOADING...',
  placeholder: { title: '世界生成中', subtitle: '记忆正在汇集成岛屿...', returnLabel: '返回房间' },
  hints: { room: '点击任意位置继续...', desk: '按 Enter 启动...', deskMobile: '点击屏幕启动...' },
  durations: { roomToDesk: 3000, bootSeq: 2000, dive: 1500 },
};

describe('validateBootConfig', () => {
  it('合法配置通过', () => {
    expect(validateBootConfig(valid)).toBe(true);
  });
  it('非对象返回 false', () => {
    expect(validateBootConfig(null)).toBe(false);
    expect(validateBootConfig('x')).toBe(false);
  });
  it('缺少 logoText 返回 false', () => {
    const { logoText, ...rest } = valid;
    expect(validateBootConfig(rest)).toBe(false);
  });
  it('accentColor 非 hex 返回 false', () => {
    expect(validateBootConfig({ ...valid, accentColor: 'red' })).toBe(false);
    expect(validateBootConfig({ ...valid, accentColor: '#123' })).toBe(false);
  });
  it('durations 超范围返回 false', () => {
    expect(validateBootConfig({ ...valid, durations: { ...valid.durations, roomToDesk: 50 } })).toBe(false);
    expect(validateBootConfig({ ...valid, durations: { ...valid.durations, dive: 99999 } })).toBe(false);
  });
  it('placeholder 缺少 title 返回 false', () => {
    expect(validateBootConfig({ ...valid, placeholder: { ...valid.placeholder, title: '' } })).toBe(false);
  });
});
