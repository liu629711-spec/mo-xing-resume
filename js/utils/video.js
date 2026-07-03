// 视频链接识别：把作者填的链接转成可嵌入的播放器描述。
// 返回 { type, src? , embed? } 或 null。

const VIDEO_EXT = /\.(mp4|webm|ogg|mov)$/i;

export function resolveVideo(url) {
  if (typeof url !== 'string') return null;
  const u = url.trim();
  if (!u) return null;

  // 1. 直链视频文件
  if (VIDEO_EXT.test(u)) {
    return { type: 'video', src: u };
  }

  // 2. B 站：提取 BV 号
  const bv = u.match(/bilibili\.com\/video\/(BV[\w]+)/i);
  if (bv) {
    const id = bv[1];
    return {
      type: 'bilibili',
      embed: `https://player.bilibili.com/player.html?bvid=${id}&high_quality=1&autoplay=0`,
    };
  }

  // 3. YouTube：普通链接或短链
  const ytLong = u.match(/youtube\.com\/watch\?v=([\w-]+)/i);
  const ytShort = u.match(/youtu\.be\/([\w-]+)/i);
  const ytId = (ytLong && ytLong[1]) || (ytShort && ytShort[1]);
  if (ytId) {
    return {
      type: 'youtube',
      embed: `https://www.youtube.com/embed/${ytId}`,
    };
  }

  return null;
}
