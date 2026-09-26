---
'@xihan-ui/headless': patch
'@xihan-ui/styles': patch
'@xihan-ui/web-components': patch
---

ImageViewer 图片的平移、旋转与翻转缩放由一条内联 `transform` 拆成独立的 `translate`、`rotate`、`scale` 属性（作用顺序与原来一致，画面不变）；过渡与拖拽、惯性期间的 `will-change` 随之改写。
