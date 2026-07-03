// 构建期扫描 data/themes/<theme>/<dir>/ 目录，生成 index.json
import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const THEMES = ['ink', 'retro'];
const DIRS = ['skills', 'projects', 'games', 'timeline', 'room-props'];

async function genIndex(relPath) {
  const abs = join(process.cwd(), 'data', relPath);
  let entries;
  try {
    entries = await readdir(abs);
  } catch (e) {
    console.warn(`[gen-index] 跳过 ${relPath}/（目录不存在）: ${e.message}`);
    return;
  }
  const files = entries
    .filter((f) => f.endsWith('.json') && f !== 'index.json')
    .sort();
  await writeFile(join(abs, 'index.json'), JSON.stringify(files, null, 2));
  console.log(`[gen-index] ${relPath}/index.json -> ${files.length} 个文件`);
}

for (const theme of THEMES) {
  for (const dir of DIRS) {
    await genIndex(join('themes', theme, dir));
  }
}

// 向后兼容：旧 data/<dir>/ 路径
for (const dir of ['skills', 'projects', 'games', 'timeline']) {
  await genIndex(dir);
}
