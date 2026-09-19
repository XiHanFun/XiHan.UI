---
"@xihan-ui/styles": minor
---

**浮层集合条目回到单行高，图标垂直居中。** Select、Combobox、Cascader、TreeSelect 等浮层里的候选行此前比一行文字高出半个图标（md 档 41–43px，应为 33px），行尾对号、前导图标与树的展开箭头都比文字低 4–5px。

根因在 Collection Item 家族配方：条目是「正文 / 说明」两行网格，prefix、indicator 等图标跨两行居中。各皮肤为了省略号给正文槽写了 `overflow: hidden`，它因此成为滚动容器、自动最小尺寸归 0；网格轨道算法处理跨行图标时把图标高度平均分给两行，没有说明的条目也长出半个图标高的第 2 行。

说明行改为 `minmax(0, max-content)`：最小尺寸钉在 0，不再参与跨行图标的高度分配，只在真有说明时按说明长；上限取 `max-content`，皮肤给条目定死 `block-size` 时多余空间也不会被说明行分走。条目高度 = 上下块内距 + 行高，图标与正文同一中线。
