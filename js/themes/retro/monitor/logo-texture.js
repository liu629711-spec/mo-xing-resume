const THREE = window.THREE;

export async function createLogoTexture(text, { accent = '#7DD3C0', bg = '#0a2a25' } = {}) {
  // 等字体就绪
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch (e) { /* ignore */ }
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = accent;
  ctx.font = '48px "VT323", "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 中文 fallback：VT323 不支持中文，用 ZCOOL XiaoWei 或 monospace
  const hasChinese = /[\u4e00-\u9fff]/.test(text);
  if (hasChinese) {
    ctx.font = '40px "ZCOOL XiaoWei", "VT323", monospace';
  }

  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  return texture;
}
