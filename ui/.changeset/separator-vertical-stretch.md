---
'@xihan-ui/styles': patch
---

Separator 竖线在横排里铺满行高：此前竖线的高度写成 `100%`，放进工具条这类由内容撑高的横排（父容器没有写死高度）时解析不出来，`align-self: stretch` 随之失效，线只剩 1em 高、贴在行顶，与两侧居中的按钮对不齐。现在高度交给 stretch（`block-size: auto`），铺满这一行；父容器写死高度时同样铺满，下限仍是一行文字高。
