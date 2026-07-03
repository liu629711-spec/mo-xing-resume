// 一次性迁移：data/ → data/themes/ink/（可重复运行，已存在则跳过）
import { cp, mkdir, access } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'data');
const DEST = join(SRC, 'themes', 'ink');

const SINGLE_FILES = ['profile.json', 'metrics.json', 'contact.json'];
const DIRS = ['skills', 'projects', 'games', 'timeline'];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function copyIfMissing(src, dest) {
  if (await exists(dest)) {
    console.log(`[migrate] 跳过（已存在）: ${dest}`);
    return;
  }
  await cp(src, dest, { recursive: true });
  console.log(`[migrate] 复制: ${src} → ${dest}`);
}

await mkdir(DEST, { recursive: true });

for (const file of SINGLE_FILES) {
  const src = join(SRC, file);
  if (await exists(src)) {
    await copyIfMissing(src, join(DEST, file));
  }
}

for (const dir of DIRS) {
  const src = join(SRC, dir);
  if (await exists(src)) {
    await copyIfMissing(src, join(DEST, dir));
  }
}

console.log('[migrate] 完成');
