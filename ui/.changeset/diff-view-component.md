---
"@xihan-ui/tokens": minor
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** `diff-view` 组件：一份改动的逐行呈现，单栏与并排两种形态，Vue 与 Web Components 两侧同时可用。

**两个入口归一到同一个模型**：`computeTextDiff(before, after)` 拿新旧两版全文算（Myers 最短编辑脚本），`parseUnifiedPatch(patch)` 解析统一格式的补丁；组件只认模型，两种输入在 AI 场景里都真实存在。另导出 `diffStats(model)` 数增删。

**着色在建模时一次算好，不在连接层跑。** `computeTextDiff` 手里有两份完整文本，整体切一次再按行取，跨行的块注释与多行字符串才不会着错色；`parseUnifiedPatch` 拿不到完整文件，因此**一律不填着色**——宁可不着色也不错着色，与代码视图「未闭合默认不着色」是同一条取舍。

`maxLines` 是必须有的上限：AI 会吐超大文件，超出即截断并在根上标出来。编辑距离超过内部上限时整段按「全删全增」呈现——那种情况下两份文本几乎没有共同行，逐行对齐既算不快也读不出意义。

表格语义完整：`role=table` 配 `role=row` 与 `role=cell`，带 `aria-rowcount` / `aria-rowindex` / `aria-colcount` / `aria-colindex`。**列数只数真正暴露的内容列**——行号不算列，它不给 role、对读屏隐藏、由皮肤用 `attr()` 画出来，所以复制差异不会带上行号。并排视图里空的那一侧**照发格子**，否则列号会串位。每一行都带一段视觉隐藏的变更类型文字：变更不能只靠颜色传达。

**刻意不采表格那套行级 roving**：只读差异不是网格，给每份差异一个吞方向键的焦点组会把页面滚动抢走，而读屏本来就有表格浏览模式。整份差异只占一个 Tab 停靠点。

`contextLines` 把远离变更的连续上下文折成一格，展开集合可受控。

**新增** 语义令牌 `--xh-diff-added-bg` / `--xh-diff-added-fg` / `--xh-diff-removed-bg` / `--xh-diff-removed-fg`：增删两色随主题明暗切换。
