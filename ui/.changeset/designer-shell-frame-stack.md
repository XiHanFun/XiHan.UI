---
'@xihan-ui/designer-shell': minor
---

外框同一位置上下堆叠的区之间加分隔条：缺省等分、每区至少 10%，可拖动或用键盘调整，不再按内容多少分高度（内容多的区不再把同侧的区挤小）。`sizes` 与 `sizes-change` 的形状扩展为新导出的 `DesignerFrameSizes`，新增 `regions`：堆叠区各自占该位置高度的百分比，键为区名；收起其中一个区时其余按比例重分，再展开时恢复。原有的 `start`、`end`、`bottom` 不变。
