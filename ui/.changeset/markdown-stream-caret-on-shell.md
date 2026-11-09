---
'@xihan-ui/motion': minor
'@xihan-ui/headless': minor
'@xihan-ui/styles': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

**新增** `animate` 的 `pseudoElement` 选项：关键帧播在元素的伪元素上（如 `'::after'`）。减弱动效与宿主缺失降级时伪元素没有行内样式可写，`fill` 留值不生效。

**新增** `trackMarkdownStreamCaret(root)`：把流式光标贴到正文最后一个字后面，收尾时在原处淡出；返回释放函数。三个适配器的外壳都已接好，自己拼外壳时在挂载后调用。

**修复** MarkdownStream 写完时光标硬切：光标从生长块挪到外壳上（外壳的 `::after`），整段流式期间是同一个。出字后它贴在正文最后一个字后面（落点从字的矩形量出，不往已消毒的 html 里注入节点），块定稿、换到下一块时跟着走、不重播进场；流结束时在最后一个字后面原地淡出（`exit` 档），播完才藏起。光标的字号跟着末字，标题后面的光标跟标题一样高。生长块不再为光标多占一行，收尾时正文不再往上跳一行。

外壳在流式期间带 `data-caret`（原先只在一块都没来时带），一块都没来时带 `data-empty`，闪烁改挂在 `[data-caret][data-empty]` 上；块上不再发 `data-caret`，要认生长块用 `data-live`。

markdown-stream.css 涨了约 650 字节，涨在外壳光标的定位、在场与不在场两态的规则上。
