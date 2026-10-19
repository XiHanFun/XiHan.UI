---
'@xihan-ui/designer-shell': minor
---

新增设计器外框 `<xh-designer-frame>`：按命名区排出上方一条、中间一行左中右与中间一栏的下方，缺省登记工具栏、物料、画布、属性、问题五个区，产品可经 `regions` 换成自己的区；作者内容用 `slot="<区名>"` 放进对应的区。左、右、下三栏里的区是面板，按布局 `layout` 显示或隐藏，隐藏的面板内容保留；区间用 `<xh-splitter>`，可拖动或用键盘调整，大小记在布局里，调整后派发 `layout-change`。另导出缺省区 `DESIGNER_FRAME_REGIONS`。
