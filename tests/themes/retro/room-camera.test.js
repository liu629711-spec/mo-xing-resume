import { describe, it, expect } from 'vitest';
import { CAMERA_KEYS, lerpKey, mapPointer, clamp } from '../../../js/themes/retro/room/room-camera.js';

describe('CAMERA_KEYS', () => {
  it('包含 5 个关键帧', () => {
    expect(CAMERA_KEYS.room).toBeDefined();
    expect(CAMERA_KEYS.desk).toBeDefined();
    expect(CAMERA_KEYS.enter).toBeDefined();
    expect(CAMERA_KEYS.diveStart).toBeDefined();
    expect(CAMERA_KEYS.diveEnd).toBeDefined();
  });
  it('每帧有 pos/look/fov', () => {
    for (const k of Object.values(CAMERA_KEYS)) {
      expect(k.pos).toHaveLength(3);
      expect(k.look).toHaveLength(3);
      expect(typeof k.fov).toBe('number');
    }
  });
});

describe('lerpKey', () => {
  it('t=0 返回起点', () => {
    const r = lerpKey(CAMERA_KEYS.room, CAMERA_KEYS.desk, 0);
    expect(r.pos[0]).toBeCloseTo(CAMERA_KEYS.room.pos[0]);
    expect(r.pos[1]).toBeCloseTo(CAMERA_KEYS.room.pos[1]);
    expect(r.pos[2]).toBeCloseTo(CAMERA_KEYS.room.pos[2]);
    expect(r.fov).toBe(CAMERA_KEYS.room.fov);
  });
  it('t=1 返回终点', () => {
    const r = lerpKey(CAMERA_KEYS.room, CAMERA_KEYS.desk, 1);
    expect(r.pos[0]).toBeCloseTo(CAMERA_KEYS.desk.pos[0]);
    expect(r.pos[1]).toBeCloseTo(CAMERA_KEYS.desk.pos[1]);
    expect(r.pos[2]).toBeCloseTo(CAMERA_KEYS.desk.pos[2]);
  });
  it('t=0.5 返回中点', () => {
    const r = lerpKey(CAMERA_KEYS.room, CAMERA_KEYS.desk, 0.5);
    expect(r.pos[0]).toBeCloseTo((CAMERA_KEYS.room.pos[0] + CAMERA_KEYS.desk.pos[0]) / 2);
    expect(r.fov).toBeCloseTo((CAMERA_KEYS.room.fov + CAMERA_KEYS.desk.fov) / 2);
  });
});

describe('mapPointer', () => {
  it('中心 (0.5,0.5) 无偏移', () => {
    const [ox, oy] = mapPointer(0.5, 0.5);
    expect(ox).toBeCloseTo(0);
    expect(oy).toBeCloseTo(0);
  });
  it('右上角 (1,0) 映射到正边界', () => {
    const [ox, oy] = mapPointer(1, 0);
    expect(ox).toBeCloseTo(0.15);
    expect(oy).toBeCloseTo(0.08);
  });
  it('左下角超出范围被 clamp 到负边界', () => {
    const [ox, oy] = mapPointer(2, 2);
    expect(ox).toBeCloseTo(0.15);
    expect(oy).toBeCloseTo(-0.08);
  });
});

describe('clamp', () => {
  it('低于下限取下限', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });
  it('高于上限取上限', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});
