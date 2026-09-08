#!/usr/bin/env node
// 打印设计令牌的名字与缺省取值，可按前缀过滤。
// 用法：node get-tokens.mjs [名字片段]
import { join } from "node:path";
import process from "node:process";
import { fetchText, modulesRoot, positional, readFirst, repoRoot, run } from "./lib/source.mjs";

const TONE_NOTE = "（只在写了 data-tone 的节点及其后代里有取值）";

/** 语气轴对外那一族不走令牌管线，名字在皮肤包的语气层里。 */
async function toneNames(root, modules) {
  const hit = await readFirst([
    root && join(root, "ui", "packages", "design", "styles", "css", "tone.css"),
    modules && join(modules, "styles", "css", "tone.css"),
  ]);
  if (!hit) return [];
  return [...new Set([...hit.text.matchAll(/^\s*(--xh-tone-[\w-]+):/gm)].map(m => m[1]))].sort();
}

await run(async () => {
  const [keyword] = positional(process.argv);
  const root = await repoRoot();
  const modules = await modulesRoot();
  const local = await readFirst([
    root && join(root, "ui", "packages", "design", "tokens", "tokens.json"),
    modules && join(modules, "tokens", "tokens.json"),
  ]);

  if (local) {
    const tokens = JSON.parse(local.text);
    const rows = Object.entries(tokens).map(([name, value]) => [name, value]);
    const tone = await toneNames(root, modules);
    for (const name of tone) rows.push([name, TONE_NOTE]);
    const hits = rows.filter(([name]) => !keyword || name.includes(keyword));
    const from = tone.length ? `${local.path} 加皮肤包的语气层` : local.path;
    process.stdout.write(`# 来源：${from}\n# 共 ${hits.length} 支\n`);
    for (const [name, value] of hits) process.stdout.write(`${name}\t${value}\n`);
    return;
  }

  // 站点的令牌全表把语气那一族也一并列了
  const hit = await fetchText("/llms-tokens.txt");
  const lines = hit.text.split("\n").filter(line => !keyword || line.includes(keyword));
  process.stdout.write(`# 来源：${hit.path}\n${lines.join("\n")}\n`);
});
