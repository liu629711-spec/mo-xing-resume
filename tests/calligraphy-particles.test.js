import { describe, it, expect } from 'vitest';
import { samplePointsFromImageData } from '../js/effects/calligraphy-particles.js';

// 构造假 ImageData：4x4，alpha 阈值 128
function fakeImageData(width, height, alphaMap) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const a = alphaMap[i] || 0;
    data[i * 4 + 0] = 0;
    data[i * 4 + 1] = 0;
    data[i * 4 + 2] = 0;
    data[i * 4 + 3] = a;
  }
  return { width, height, data };
}

describe('samplePointsFromImageData', () => {
  it('只采样 alpha 超过阈值的像素', () => {
    // 4x4，仅 (0,0) 与 (2,1) alpha=255
    const map = new Array(16).fill(0);
    map[0] = 255;          // (x=0,y=0)
    map[6] = 255;          // x=2, y=1 (index = y*w+x = 1*4+2=6)
    const img = fakeImageData(4, 4, map);
    const pts = samplePointsFromImageData(img, { step: 1, threshold: 128 });
    expect(pts.length).toBe(2);
    expect(pts).toContainEqual({ x: 0, y: 0 });
    expect(pts).toContainEqual({ x: 2, y: 1 });
  });

  it('step=2 时按网格跳采样', () => {
    const map = new Array(16).fill(255);
    const img = fakeImageData(4, 4, map);
    const pts = samplePointsFromImageData(img, { step: 2, threshold: 128 });
    // step=2 采样点：(0,0),(2,0),(0,2),(2,2) = 4 个
    expect(pts.length).toBe(4);
  });

  it('全透明返回空数组', () => {
    const img = fakeImageData(4, 4, new Array(16).fill(0));
    const pts = samplePointsFromImageData(img, { step: 1, threshold: 128 });
    expect(pts).toEqual([]);
  });

  it('每个点有 x,y 数字属性', () => {
    const map = new Array(16).fill(255);
    const img = fakeImageData(4, 4, map);
    const pts = samplePointsFromImageData(img, { step: 2, threshold: 128 });
    expect(typeof pts[0].x).toBe('number');
    expect(typeof pts[0].y).toBe('number');
  });
});
