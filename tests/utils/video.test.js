import { describe, it, expect } from 'vitest';
import { resolveVideo } from '../../js/utils/video.js';

describe('resolveVideo', () => {
  it('空字符串返回 null', () => {
    expect(resolveVideo('')).toBeNull();
    expect(resolveVideo('   ')).toBeNull();
  });

  it('mp4 直链返回 type=video', () => {
    const r = resolveVideo('https://oss.example.com/demo.mp4');
    expect(r.type).toBe('video');
    expect(r.src).toBe('https://oss.example.com/demo.mp4');
  });

  it('webm 直链返回 type=video', () => {
    const r = resolveVideo('https://cdn.x.cn/a.webm');
    expect(r.type).toBe('video');
  });

  it('B 站 BV 链接返回 type=bilibili + embed', () => {
    const r = resolveVideo('https://www.bilibili.com/video/BV1xx411c7mD');
    expect(r.type).toBe('bilibili');
    expect(r.embed).toContain('player.bilibili.com');
    expect(r.embed).toContain('BV1xx411c7mD');
  });

  it('B 站短链接 b23.tv 返回 null（无法解析 BV 时降级）', () => {
    expect(resolveVideo('https://b23.tv/abc123')).toBeNull();
  });

  it('YouTube 普通链接返回 type=youtube + embed', () => {
    const r = resolveVideo('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(r.type).toBe('youtube');
    expect(r.embed).toContain('youtube.com/embed/dQw4w9WgXcQ');
  });

  it('YouTube 短链接返回 type=youtube', () => {
    const r = resolveVideo('https://youtu.be/dQw4w9WgXcQ');
    expect(r.type).toBe('youtube');
    expect(r.embed).toContain('youtube.com/embed/dQw4w9WgXcQ');
  });

  it('未知链接返回 null', () => {
    expect(resolveVideo('https://example.com/page')).toBeNull();
  });
});
