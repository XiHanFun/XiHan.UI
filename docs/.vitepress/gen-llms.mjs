// 视图组件站特有的机读资产，接在主题配置的 llms 选项上：
// 单页正文里的示例内联成代码块、组件总览卡片压平成链接，另外写出令牌全表、design.md、
// 使用技能与仓库原生技能包的可下载副本。令牌汇总与 design.md 与 @xihan-ui/cli 共用同一份生成器。
// 索引、全站正文、分册与每页 .md 由主题生成。
import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderDesignMd } from "../../ui/packages/tools/cli/build/design-md.mjs";
import { collectTokens } from "../../ui/packages/tools/cli/build/tokens.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..");
const UI = join(REPO, "ui");
const CLI = join(UI, "packages", "tools", "cli");
const DEMOS = join(HERE, "demos");
const SKILLS = join(REPO, ".agents", "skills");

/** 目录下递归取相对 root 的全部文件路径（posix 分隔）。目录不存在时返回空。 */
async function allFiles(root, base = "") {
  let entries;
  try {
    entries = await readdir(join(root, base), { withFileTypes: true });
  }
  catch {
    return [];
  }
  const out = [];
  for (const entry of entries) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory())
      out.push(...(await allFiles(root, rel)));
    else out.push(rel);
  }
  return out.sort();
}

async function readOrNull(path) {
  try {
    return await readFile(path, "utf8");
  }
  catch {
    return null;
  }
}

// —— 单页正文 ——

/** 示例首行是 `<!-- 标题 | 说明 -->`，那两句在页面正文里已经出现过一次。 */
function stripDemoHeading(source) {
  return source
    .replace(/^(<!--[\s\S]*?-->|\/\/[^\n]*)\s*/, "")
    .trimEnd();
}

/** 把 <XhDemo src="x/y" /> 换成两个适配器的示例源码围栏块。 */
async function inlineDemos(body) {
  const hits = [...body.matchAll(/<XhDemo\s+src="([^"]+)"\s*\/>/g)];
  let out = body;
  for (const [tag, src] of hits) {
    const blocks = [];
    for (const [lang, ext] of [
      ["vue", ".vue"],
      ["html", ".html"],
    ]) {
      const source = await readOrNull(join(DEMOS, `${src}${ext}`));
      if (source)
        blocks.push(`\`\`\`${lang}\n${stripDemoHeading(source)}\n\`\`\``);
    }
    out = out.replace(
      tag,
      blocks.length ? blocks.join("\n\n") : `> 示例 \`${src}\` 的源码未随本页发布。`,
    );
  }
  return out;
}

/** 组件总览的预览卡在纯 Markdown 中改为普通链接。 */
function flattenComponentCards(body) {
  return body.replace(
    /<div class="xh-component-grid">([\s\S]*?)<\/div>/g,
    (_, cards) => cards.trim().replace(
      /<XhComponentCard\s+src="[^"]+"\s+name="([^"]+)"\s+label="([^"]+)"\s+href="([^"]+)"(?:\s+renderless)?\s*\/>/g,
      "- [$1 $2]($3)",
    ),
  );
}

/** 单页正文：内联示例、压平组件卡片。 */
export async function transformPage(body) {
  return flattenComponentCards(await inlineDemos(body));
}

// —— 令牌 ——

function tokensAsset({ tokens, tone }) {
  const groups = new Map();
  for (const token of tokens) {
    const family = token.name.split("-")[3] ?? "其他";
    if (!groups.has(family))
      groups.set(family, []);
    groups.get(family).push(token);
  }
  const lines = [
    "# 曦寒视图组件 · 设计令牌",
    "",
    `共 ${tokens.length} 支。取值是缺省档（浅色 · 舒适 · 基础对比度）下的值；`,
    "「改写档」列出还有哪几份令牌源重新给过它——深色、紧凑、更高对比度、减弱动效、打印各是一档。",
    "",
    "覆盖时在 `:root` 上直接设同名令牌即可，这一层是公开面。带下划线前缀的 `--xh-_*` 是私有槽，不要在外面设。",
    "",
  ];
  for (const [family, list] of groups) {
    lines.push(`## ${family}`, "", "| 令牌 | 类型 | 缺省值 | 改写档 |", "| --- | --- | --- | --- |");
    for (const token of list)
      lines.push(`| \`${token.name}\` | ${token.type} | \`${token.value}\` | ${token.layers.join(" / ") || "—"} |`);
    lines.push("");
  }
  lines.push(
    "## 语气轴对外的一族",
    "",
    "这一族不走令牌管线，声明在皮肤包的语气层上，**只在写了 `data-tone` 的节点及其后代里有取值**——`data-tone` 是它们的开关，不是可选修饰。",
    "",
    "| 令牌 |",
    "| --- |",
    ...tone.map(name => `| \`${name}\` |`),
    "",
  );
  return lines.join("\n");
}

// —— 站点特有资产 ——

/** 写出令牌全表、design.md、使用技能与仓库技能包副本，返回登记进 llms.txt 的条目。 */
export async function writeUiAssets({ outDir, site }) {
  const tokenData = await collectTokens(UI);
  await writeFile(join(outDir, "llms-tokens.txt"), tokensAsset(tokenData), "utf8");

  const { version } = JSON.parse(await readFile(join(CLI, "package.json"), "utf8"));
  const values = Object.fromEntries(tokenData.tokens.map(token => [token.name, token.value]));
  await writeFile(join(outDir, "design.md"), renderDesignMd({ version, site, values }), "utf8");

  await mkdir(join(outDir, "ai"), { recursive: true });
  await copyFile(join(CLI, "skills", "xihan-ui", "SKILL.md"), join(outDir, "ai", "SKILL.md"));

  // 按仓库原生分类发布全部技能：站点上取得到，不必先克隆仓库
  const skillFiles = await allFiles(SKILLS);
  for (const rel of skillFiles) {
    const target = join(outDir, "skills", rel);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(join(SKILLS, rel), target);
  }
  if (skillFiles.length)
    await writeFile(join(outDir, "skills", "FILES.txt"), `${skillFiles.join("\n")}\n`, "utf8");

  return [
    { name: "llms-tokens.txt", description: `${tokenData.tokens.length} 支设计令牌的名字、类型与缺省取值` },
    { name: "design.md", description: "缺省主题的设计语言（design.md 格式）：颜色、排版、间距、圆角与组件样式令牌，以及视觉规则" },
    { name: "ai/SKILL.md", description: "给 AI 编程工具的 XiHan.UI 使用规范，可放进项目的技能目录" },
  ];
}
