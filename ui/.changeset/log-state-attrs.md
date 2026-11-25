---
'@xihan-ui/headless': major
'@xihan-ui/styles': patch
---

**破坏性** Log 的两个状态属性改名，免得与只差词尾的同族属性混淆：ANSI 暗淡段（SGR 2）从 `data-dim` 改叫 `data-faint`（与图表、Tour 的 `data-dimmed` 只差一个词尾，意思却不同）；接了虚拟滚动的视口从 `data-virtualized` 改叫 `data-xh-virtualized`，与 Listbox、Transfer 同一个名字。自己写选择器读这两位的要跟着改。

| 旧名 | 新名 |
| --- | --- |
| segment 上的 `data-dim` | `data-faint` |
| viewport 上的 `data-virtualized` | `data-xh-virtualized` |
