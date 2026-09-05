// 取数脚本共用的数据源解析：先找仓库检出，再找装好的 npm 包，最后回落到已发布的文档站。
// 四个脚本都只读不写。
import { access, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SITE = process.env.XIHAN_UI_SITE ?? "https://ui.docs.xihanfun.com";

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/** 从若干起点逐级向上找，第一个满足 probe 的目录。 */
async function findUp(probe) {
  const starts = [process.cwd(), dirname(dirname(dirname(fileURLToPath(import.meta.url))))];
  for (const start of starts) {
    let dir = resolve(start);
    for (;;) {
      const hit = await probe(dir);
      if (hit) return dir;
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  return null;
}

/** XiHan.UI 仓库根：env 指定优先，否则向上找 ui/packages 与 docs/components 同时在的那一层。 */
export async function repoRoot() {
  if (process.env.XIHAN_UI_ROOT) return resolve(process.env.XIHAN_UI_ROOT);
  return findUp(async dir =>
    (await exists(join(dir, "ui", "packages", "design", "tokens", "tokens.json"))) ? dir : null
  );
}

/** 装了 @xihan-ui 的 node_modules 目录。 */
export async function modulesRoot() {
  const dir = await findUp(async d =>
    (await exists(join(d, "node_modules", "@xihan-ui", "styles", "index.css"))) ? d : null
  );
  return dir ? join(dir, "node_modules", "@xihan-ui") : null;
}

/** 逐个候选路径读，第一个存在的胜出。 */
export async function readFirst(paths) {
  for (const path of paths) {
    if (path && (await exists(path))) return { path, text: await readFile(path, "utf8") };
  }
  return null;
}

/** 文档站上的一份文本资产。 */
export async function fetchText(path) {
  const url = `${SITE}${path}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`取 ${url} 失败：HTTP ${response.status}`);
  return { path: url, text: await response.text() };
}

/** 命令行位置参数（去掉 --flag）。 */
export function positional(argv) {
  return argv.slice(2).filter(arg => !arg.startsWith("-"));
}

/** 抛出去由 run() 收，只打消息不打栈。 */
export function fail(message) {
  throw new Error(message);
}

/** 脚本入口：报错只打一行消息并给非零退出码，不用 process.exit()（会硬断没收尾的连接）。 */
export async function run(main) {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
