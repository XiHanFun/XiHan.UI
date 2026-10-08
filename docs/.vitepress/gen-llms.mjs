// 视图组件站特有的机读资产，接在主题配置的 llms 选项上：
// 单页正文里的示例内联成代码块、组件总览卡片压平成链接，另外写出令牌全表与仓库原生技能包的可下载副本。
// 索引、全站正文、分册与每页 .md 由主题生成。
import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..");
const UI = join(REPO, "ui");
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

/** DTCG 组树展开成 { 令牌名: 类型 }，与令牌生成器同一套命名规则。 */
function flattenTypes(node, path = [], out = {}) {
  if (node && typeof node === "object" && "$value" in node) {
    out[`--xh-${path.join("-").replace(/\./g, "_")}`] = node.$type ?? "";
    return out;
  }
  for (const [key, child] of Object.entries(node ?? {})) {
    if (child && typeof child === "object")
      flattenTypes(child, [...path, key], out);
  }
  return out;
}

/**
 * 令牌全表：名字与取值来自 tokens.json（缺省主题的真源），
 * 类型与「哪几档主题改写过它」来自 DTCG 令牌源。
 */
async function tokensReport() {
  const tokensDir = join(UI, "packages/design/tokens/tokens");
  const values = JSON.parse(await readFile(join(UI, "packages/design/tokens/tokens.json"), "utf8"));

  const types = {};
  const layers = {};
  for (const file of await readdir(tokensDir)) {
    if (!file.endsWith(".json"))
      continue;
    const layer = file.replace(/^semantic\./, "").replace(/\.json$/, "");
    const flat = flattenTypes(JSON.parse(await readFile(join(tokensDir, file), "utf8")));
    for (const [name, type] of Object.entries(flat)) {
      types[name] ??= type;
      (layers[name] ??= []).push(layer);
    }
  }

  const groups = new Map();
  for (const [name, value] of Object.entries(values)) {
    const family = name.split("-")[3] ?? "其他";
    if (!groups.has(family))
      groups.set(family, []);
    groups.get(family).push({ name, value, type: types[name] ?? "", layers: layers[name] ?? [] });
  }
  return { count: Object.keys(values).length, groups };
}

/** 语气轴对外那一族：声明在 tone.css 的 [data-tone] 上，不走令牌管线。 */
async function toneTokenNames() {
  const source = await readFile(join(UI, "packages/design/styles/css/tone.css"), "utf8");
  return [...new Set([...source.matchAll(/^\s*(--xh-tone-[\w-]+):/gm)].map(hit => hit[1]))].sort();
}

function tokensAsset(tokens, toneNames) {
  const lines = [
    "# 曦寒视图组件 · 设计令牌",
    "",
    `共 ${tokens.count} 支。取值是缺省档（浅色 · 舒适 · 基础对比度）下的值；`,
    "「改写档」列出还有哪几份令牌源重新给过它——深色、紧凑、更高对比度、减弱动效、打印各是一档。",
    "",
    "覆盖时在 `:root` 上直接设同名令牌即可，这一层是公开面。带下划线前缀的 `--xh-_*` 是私有槽，不要在外面设。",
    "",
  ];
  for (const [family, list] of tokens.groups) {
    lines.push(`## ${family}`, "", "| 令牌 | 类型 | 缺省值 | 改写档 |", "| --- | --- | --- | --- |");
    for (const token of list) {
      const rewritten = token.layers.filter(layer => layer !== "primitive" && layer !== "base" && layer !== "light");
      lines.push(
        `| \`${token.name}\` | ${token.type} | \`${token.value}\` | ${rewritten.join(" / ") || "—"} |`,
      );
    }
    lines.push("");
  }
  lines.push(
    "## 语气轴对外的一族",
    "",
    "这一族不走令牌管线，声明在皮肤包的语气层上，**只在写了 `data-tone` 的节点及其后代里有取值**——`data-tone` 是它们的开关，不是可选修饰。",
    "",
    "| 令牌 |",
    "| --- |",
    ...toneNames.map(name => `| \`${name}\` |`),
    "",
  );
  return lines.join("\n");
}

// —— 站点特有资产 ——

/** 写出令牌全表与技能包副本，返回登记进 llms.txt 的条目。 */
export async function writeUiAssets({ outDir }) {
  const tokens = await tokensReport();
  await writeFile(join(outDir, "llms-tokens.txt"), tokensAsset(tokens, await toneTokenNames()), "utf8");

  // 按仓库原生分类发布全部技能：站点上取得到，不必先克隆仓库
  const skillFiles = await allFiles(SKILLS);
  for (const rel of skillFiles) {
    const target = join(outDir, "skills", rel);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(join(SKILLS, rel), target);
  }
  if (skillFiles.length)
    await writeFile(join(outDir, "skills", "FILES.txt"), `${skillFiles.join("\n")}\n`, "utf8");

  return [{ name: "llms-tokens.txt", description: `${tokens.count} 支设计令牌的名字、类型与缺省取值` }];
}
