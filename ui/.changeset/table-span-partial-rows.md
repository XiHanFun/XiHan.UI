---
'@xihan-ui/headless': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

表格（Table）纵向合并（`cellSpan` 的 `rowSpan`）在只渲了一段行时（接了虚拟滚动，或宿主只渲了一页）的修复：合并区的末几行不在 DOM 里时，合并格原先退成一行高，现在铺到区里最后一条在场的行；起点行滚出窗口时，合并区原先整块空白、读屏也读不到，现在由区里第一条在场的行接替起点，露出内容并报剩下的行数作 `aria-rowspan`，`cellSpanOf` 对它报 `covered: false`。被合并掉的格子请照常写内容。
