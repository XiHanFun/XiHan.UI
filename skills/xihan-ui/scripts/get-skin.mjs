#!/usr/bin/env node
// 打印一个组件的默认皮肤源码：想知道某个部件吃哪些槽、哪些 data-* 会被选中，读它最快。
// 用法：node get-skin.mjs <组件标识>
import { join } from "node:path";
import process from "node:process";
import { fail, modulesRoot, positional, readFirst, repoRoot, run } from "./lib/source.mjs";

await run(async () => {
  const [id] = positional(process.argv);
  if (!id) fail("用法：node get-skin.mjs <组件标识>，标识用 list-components.mjs 查");

  const root = await repoRoot();
  const modules = await modulesRoot();
  const hit = await readFirst([
    root && join(root, "ui", "packages", "design", "styles", "css", `${id}.css`),
    modules && join(modules, "styles", "css", `${id}.css`),
  ]);

  if (!hit) {
    fail(
      `没找到 ${id} 的皮肤。皮肤只随 @xihan-ui/styles 发布，不在文档站上：\n`
        + "请在装了这个包的工程里跑，或设 XIHAN_UI_ROOT 指向 XiHan.UI 检出目录。"
    );
  }
  process.stdout.write(`/* 来源：${hit.path} */\n${hit.text}`);
});
