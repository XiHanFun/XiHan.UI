---
'@xihan-ui/designer-shell': minor
---

新增设计器外框 `<xh-designer-frame>`：按命名区排出上方一条、中间一行左中右与中间一栏的下方，缺省登记工具栏、物料、画布、属性、问题五个区，产品可经 `regions` 换成自己的区；作者内容用 `slot="<区名>"` 放进对应的区。`panels` 列出要显示的区（空格分隔，不写即全部，写空串只留中间区），收起的区内容保留；区间用 `<xh-splitter>`，可拖动或用键盘调整，`sizes` 恢复上次的大小，调整时派发 `sizes-change`。另导出同一口径的 `parseDesignerPanels` 与缺省区 `DESIGNER_FRAME_REGIONS`。
