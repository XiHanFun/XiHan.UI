// 构建期把文档站落成机读资产：四份 llms 汇编、一份令牌全表、每页一份 .md，
// 外加一份 skills/xihan-ui 的可下载副本。全部内容从本仓现算，没有手写清单。
//
// 站点是纯静态的，没有 route handler，所以产物一律写进 outDir。
import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DOCS = join(HERE, "..");
const REPO = join(DOCS, "..");
const UI = join(REPO, "ui");
const DEMOS = join(HERE, "demos");
const SKILL = join(REPO, "skills", "xihan-ui");

const SITE = "https://ui.docs.xihanfun.com";

/** 顶层目录 → 栏目名。目录没登记时退回目录名本身，新开一册也不会从索引里漏掉。 */
const SECTION_LABELS = {
  ".": "开始",
  "guide": "核心概念",
  "adapters": "适配器",
  "runtime": "服务与运行时",
  "examples": "场景",
  "components": "组件",
};

/** 栏目在索引里的排序，未登记的排在末尾并按目录名排。 */
const SECTION_ORDER = [".", "guide", "adapters", "runtime", "examples", "components"];

// —— 读文件 ——

/** 目录下递归取相对 root 的 .md 路径（posix 分隔），跳过站点自身的目录。 */
async function markdownFiles(root, base = "") {
  const out = [];
  for (const entry of await readdir(join(root, base), { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".vitepress" || entry.name === "public")
      continue;
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory())
      out.push(...(await markdownFiles(root, rel)));
    else if (entry.name.endsWith(".md"))
      out.push(rel);
  }
  return out.sort();
}

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

// —— 页面解析 ——

/** 拆出 frontmatter 与正文，frontmatter 保留原文。 */
function splitFrontmatter(source) {
  const hit = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  return hit
    ? { frontmatter: hit[1], body: source.slice(hit[0].length) }
    : { frontmatter: "", body: source };
}

/** frontmatter 里某个顶层键的标量值。 */
function frontmatterValue(frontmatter, key) {
  const hit = new RegExp(`^${key}:\\s*(.+)$`, "m").exec(frontmatter);
  return hit ? hit[1].trim().replace(/^["']|["']$/g, "") : "";
}

/** 组件页标题后那枚 <Badge text="button" /> 里的组件标识。 */
function badgeText(line) {
  const hit = /<Badge[^>]+\btext="([^"]+)"/.exec(line);
  return hit ? hit[1] : "";
}

/** 正文首个一级标题的纯文本，连带它后面挂的组件标识。 */
function headingOf(body) {
  const hit = /^# +(\S.*)$/m.exec(body);
  if (!hit)
    return { title: "", id: "" };
  return { title: hit[1].replace(/<[^>]+>/g, "").trim(), id: badgeText(hit[1]) };
}

/** 一句话描述：首个一级标题之后的第一段，压成单行并截到一句。 */
function summaryOf(body) {
  const after = body.replace(/^#\s+(?:\S.*|[\t\v\f \xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF])$/m, "");
  for (const block of after.split(/\r?\n\s*\n/)) {
    const text = block.trim();
    if (!text || text.startsWith("#") || text.startsWith("```") || text.startsWith("<"))
      continue;
    const flat = text
      .replace(/\s+/g, " ")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .trim();
    const stop = flat.indexOf("。");
    if (stop !== -1 && stop < 200)
      return flat.slice(0, stop + 1);
    return flat.length > 160 ? `${flat.slice(0, 160)}…` : flat;
  }
  return "";
}

/** 源路径 → 站点地址（cleanUrls，index.md 落在目录上）。 */
function urlOf(rel) {
  const path = rel.replace(/\.md$/, "").replace(/(^|\/)index$/, "$1");
  return `${SITE}/${path}`;
}

// —— 示例内联 ——

/**
 * 把 <XhDemo src="x/y" /> 换成两个适配器的示例源码围栏块。
 * 模型读到的必须是可运行的代码，而不是一个它不认识的标签。
 */
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

/** 示例首行是 `<!-- 标题 | 说明 -->`，那两句在页面正文里已经出现过一次。 */
function stripDemoHeading(source) {
  return source.replace(/^<!--[^\n]*-->\r?\n/, "").trimEnd();
}

/** <Badge text="button" /> 在纯文本里没有意义，压成行内代码保留组件标识。 */
function flattenBadges(body) {
  return body.replace(/<Badge[^>]+\btext="([^"]+)"[^>]*\/>/g, "`$1`");
}

/** 一页的机读正文：去 frontmatter、内联示例、压平站点组件。 */
async function pageText(source) {
  const { frontmatter, body } = splitFrontmatter(source);
  const text = flattenBadges(await inlineDemos(body)).trim();
  // 首页正文是空的，内容全在 frontmatter 的 hero 与 features 里
  if (!text && frontmatter)
    return `\`\`\`yaml\n${frontmatter.trim()}\n\`\`\``;
  return text;
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

// —— 产出 ——

function assetHeader(title, lines) {
  return [`# ${title}`, "", ...lines, ""].join("\n");
}

/** 一页的形态：来源地址 + 正文。正文自带一级标题时不再补一个。 */
function pageBlock(page) {
  const heading = page.text.startsWith("#") ? "" : `# ${page.title}\n\n`;
  return `来源：${page.url}\n\n${heading}${page.text}\n`;
}

export async function writeLlmsAssets(outDir) {
  const files = await markdownFiles(DOCS);
  const pages = [];
  for (const rel of files) {
    const source = await readFile(join(DOCS, rel), "utf8");
    const { frontmatter, body } = splitFrontmatter(source);
    const heading = headingOf(body);
    pages.push({
      rel,
      section: rel.includes("/") ? rel.slice(0, rel.indexOf("/")) : ".",
      url: urlOf(rel),
      id: heading.id,
      title: heading.title || frontmatterValue(frontmatter, "title") || rel,
      summary: summaryOf(body) || frontmatterValue(frontmatter, "titleTemplate"),
      text: await pageText(source),
    });
  }

  const sections = [...new Set(pages.map(page => page.section))].sort((a, b) => {
    const ia = SECTION_ORDER.indexOf(a);
    const ib = SECTION_ORDER.indexOf(b);
    return (ia === -1 ? SECTION_ORDER.length : ia) - (ib === -1 ? SECTION_ORDER.length : ib)
      || a.localeCompare(b);
  });

  const pick = (...names) => pages.filter(page => names.includes(page.section));
  const componentPages = pick("components");
  const guidePages = pick("guide", "adapters", "runtime");
  const tokens = await tokensReport();
  const toneNames = await toneTokenNames();

  await mkdir(outDir, { recursive: true });

  // 每页一份 .md：站点上的「取本页 Markdown」直链指向它，示例已内联成代码块
  for (const page of pages) {
    const target = join(outDir, page.rel);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, pageBlock(page), "utf8");
  }

  // 索引
  const assets = [
    ["llms-full.txt", `全部 ${pages.length} 页正文，示例已内联为代码块`],
    ["llms-components.txt", `${componentPages.length} 页组件参考`],
    ["llms-guide.txt", `${guidePages.length} 页核心概念、适配器与运行时`],
    ["llms-tokens.txt", `${tokens.count} 支设计令牌的名字、类型与缺省取值`],
  ];
  const index = [
    assetHeader("曦寒视图组件", [
      "> 框架无关的设计系统运行时：无头内核提供行为与无障碍，Vue 与 Web Components 两个适配器只负责把属性铺到宿主元素上，纯 CSS 皮肤认 `data-scope` / `data-part` 而不是类名。",
      "",
      "本文件由文档站构建期生成，内容与库同源。",
      "",
      "## 机读资产",
      "",
      ...assets.map(([name, why]) => `- [${name}](${SITE}/${name}): ${why}`),
      `- 每页 Markdown：把站点地址后缀成 \`.md\`，如 ${SITE}/components/button.md`,
    ]),
  ];
  for (const section of sections) {
    index.push(`## ${SECTION_LABELS[section] ?? section}`, "");
    for (const page of pages.filter(page => page.section === section)) {
      const name = page.id ? `${page.title} ${page.id}` : page.title;
      index.push(`- [${name}](${page.url})${page.summary ? `: ${page.summary}` : ""}`);
    }
    index.push("");
  }

  const compile = (title, lines, list) =>
    [assetHeader(title, lines), ...list.map(pageBlock)].join("\n---\n\n");

  await writeFile(join(outDir, "llms.txt"), `${index.join("\n")}`, "utf8");
  await writeFile(
    join(outDir, "llms-full.txt"),
    compile("曦寒视图组件 · 全站正文", [
      `共 ${pages.length} 页。示例已按适配器内联为代码块。`,
      `索引见 ${SITE}/llms.txt`,
    ], pages),
    "utf8",
  );
  await writeFile(
    join(outDir, "llms-components.txt"),
    compile("曦寒视图组件 · 组件参考", [
      `共 ${componentPages.length} 页。每页含解剖部件、Props、事件、状态、键盘、数据属性、CSS 变量与两个适配器的示例源码。`,
      `索引见 ${SITE}/llms.txt`,
    ], componentPages),
    "utf8",
  );
  await writeFile(
    join(outDir, "llms-guide.txt"),
    compile("曦寒视图组件 · 核心概念与运行时", [
      `共 ${guidePages.length} 页：核心概念、两个适配器的接法、以及命令式服务与运行时。`,
      `索引见 ${SITE}/llms.txt`,
    ], guidePages),
    "utf8",
  );
  await writeFile(join(outDir, "llms-tokens.txt"), tokensAsset(tokens, toneNames), "utf8");

  // 技能包副本：站点上取得到，不必先克隆仓库
  const skillFiles = await allFiles(SKILL);
  for (const rel of skillFiles) {
    const target = join(outDir, "skills", "xihan-ui", rel);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(join(SKILL, rel), target);
  }
  if (skillFiles.length) {
    await writeFile(
      join(outDir, "skills", "xihan-ui", "FILES.txt"),
      `${skillFiles.join("\n")}\n`,
      "utf8",
    );
  }

  console.log(
    `[gen-llms] ${pages.length} 页 · 组件 ${componentPages.length} · 概念 ${guidePages.length} · 令牌 ${tokens.count} · 技能包 ${skillFiles.length} 份文件 → ${relative(REPO, outDir).split(sep).join("/")}`,
  );
}

function tokensAsset(tokens, toneNames) {
  const lines = [
    assetHeader("曦寒视图组件 · 设计令牌", [
      `共 ${tokens.count} 支。取值是缺省档（浅色 · 舒适 · 基础对比度）下的值；`,
      "「改写档」列出还有哪几份令牌源重新给过它——深色、紧凑、更高对比度、减弱动效、打印各是一档。",
      "",
      "覆盖时在 `:root` 上直接设同名令牌即可，这一层是公开面。带下划线前缀的 `--xh-_*` 是私有槽，不要在外面设。",
    ]),
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
