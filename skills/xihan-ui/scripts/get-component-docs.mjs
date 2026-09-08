#!/usr/bin/env node
// 打印一个组件的参考页：解剖部件、Props、事件、状态、键盘、数据属性、CSS 变量与两个适配器的示例。
// 用法：node get-component-docs.mjs <组件标识>
import { join } from "node:path";
import process from "node:process";
import { fail, fetchText, positional, readFirst, repoRoot, run } from "./lib/source.mjs";

await run(async () => {
  const [id] = positional(process.argv);
  if (!id) fail("用法：node get-component-docs.mjs <组件标识>，标识用 list-components.mjs 查");

  const root = await repoRoot();
  // 有检出就只读本地：站点上的那一份示例已内联成代码块，构建过就优先用它
  const hit = root
    ? await readFirst([
        join(root, "docs", ".vitepress", "dist", "components", `${id}.md`),
        join(root, "docs", "components", `${id}.md`),
      ])
    : await fetchText(`/components/${id}.md`).catch(() => null);

  if (!hit) fail(`没有 ${id} 这个组件的参考页；标识用 list-components.mjs 查`);
  process.stdout.write(`${hit.text}\n`);
});
