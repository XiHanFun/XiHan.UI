---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

ImageViewer 的平移限定在范围内：按放大、旋转后的外接框超出视口的部分算，图比视口小时只能居中；拖出范围越拉越沉（80px 橡皮筋），松手硬弹簧回弹。单指快甩松手后图片顺着速度惯性滑行、逐渐停下，期间投影 `data-animating`；缩放钮、滚轮与旋转后平移收进新范围。状态机新增上下文 `settling` 与 refs `inertia`，`POINTERS.END` 带 `velocity` 与 `canceled`。
