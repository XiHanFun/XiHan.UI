#!/usr/bin/env node
// 列出全部组件：标识 · 中文名 · 分类。
// 用法：node list-components.mjs [关键词]
import { join } from "node:path";
import process from "node:process";
import { fetchText, positional, readFirst, repoRoot, run } from "./lib/source.mjs";

/** 仓库检出：组件清单的真源是文档生成器读的那份清单。 */
async function fromRepo() {
  const root = await repoRoot();
  if (!root) return null;
  const hit = await readFirst([join(root, "ui", "scripts", "component-docs.manifest.json")]);
  if (!hit) return null;
  const manifest = JSON.parse(hit.text);
  return {
    source: hit.path,
    rows: manifest.categories.flatMap(category =>
      category.components.map(component => ({
        id: component.id,
        name: component.name,
        category: category.label,
      }))
    ),
  };
}

/** 没有检出时读文档站的索引，组件那一栏每行是 `- [中文名 标识](地址): 描述`。 */
async function fromSite() {
  const hit = await fetchText("/llms.txt");
  const section = hit.text.split(/^## /m).find(block => block.startsWith("组件"));
  if (!section) throw new Error("llms.txt 里没有组件栏目");
  return {
    source: hit.path,
    rows: [...section.matchAll(/^- \[(.+?) ([a-z0-9-]+)\]\(/gm)].map(match => ({
      id: match[2],
      name: match[1],
      category: "—",
    })),
  };
}

await run(async () => {
  const [keyword] = positional(process.argv);
  const result = (await fromRepo()) ?? (await fromSite());
  const rows = keyword
    ? result.rows.filter(row => row.id.includes(keyword) || row.name.includes(keyword))
    : result.rows;

  process.stdout.write(`# 来源：${result.source}\n# 共 ${rows.length} 个\n`);
  for (const row of rows) process.stdout.write(`${row.id}\t${row.name}\t${row.category}\n`);
});
