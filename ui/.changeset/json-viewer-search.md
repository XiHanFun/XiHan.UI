---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

JsonViewer 新增搜索：`search` 标出键名与值里含有搜索词的行（不区分大小写，收起的分支里也找得到），命中行投影 `data-match`，它们的祖先分支自动展开（写进展开集合，之后照常能收起），键名与值里命中的那一段铺成新部件 `mark`（品牌淡底 + 品牌深字，与 Highlight 的命中片段同一身份）。在命中之间逐个走：headless API `searchMatches` / `activeMatch` / `nextMatch()` / `prevMatch()` / `setActiveMatch()`，停住的那一行投影 `data-current`、命中片段换成品牌实心，并被滚进视野；强制色下命中片段画一圈正文色的框，停住的取系统高亮。Vue 新增 `toolbar` 插槽、React 新增 `toolbar`，渲染在根之前、载荷是这四样；Web Components 元素新增 `searchMatches` / `activeMatch` 只读属性与 `nextMatch()` / `prevMatch()` 方法。树容器新增 `id`（机器据此把停住的那一条滚进视野）。headless 另导出 `jsonSearch` / `jsonSearchQuery`。新增公开槽 `--xh-json-viewer-mark-bg` / `-fg` / `-radius` 与停住时的 `--xh-json-viewer-mark-bg-current` / `-fg-current`。Vue 的 `XhJsonViewerRoot` 写了工具条时渲染为片段，作者写在根上的 class 与属性仍落在根上。 皮肤涨在命中片段、停住的那一条与强制色下的三组规则上。
