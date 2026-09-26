---
'@xihan-ui/headless': patch
'@xihan-ui/styles': patch
'@xihan-ui/web-components': patch
---

Carousel 轨道的位移由内联 `transform: translateX(…)` 改为独立的 `translate` 属性（横排只写横向一支，竖排写 `0px <位移>`），过渡与拖拽、落定期间的 `will-change` 随之改到 `translate`。画面不变；在样式里给轨道写 `transform` 的作者，现在它会与位移叠加而不是被内联值盖掉。
