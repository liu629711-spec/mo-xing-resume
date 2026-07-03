// 构建期扫描 data/<name>/ 目录，生成 index.json 文件列表。
// 让前端 data-loader 能聚合目录式 collection，无需手动维护索引。
import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIRS = ['skills', 'projects', 'games', 'timeline'];

async function genIndex(dir) {
  const abs = join(process.cwd(), 'data', dir);
  let entries;
  try {
    entries = await readdir(abs);
  } catch (e) {
    console.warn(`[gen-index] 跳过 ${dir}/（目录不存在）: ${e.message}`);
    return;
  }
  const files = entries
    .filter((f) => f.endsWith('.json') && f !== 'index.json')
    .sort();
  await writeFile(join(abs, 'index.json'), JSON.stringify(files, null, 2));
  console.log(`[gen-index] ${dir}/index.json -> ${files.length} 个文件`);
}

await Promise.all(DIRS.map(genIndex));
