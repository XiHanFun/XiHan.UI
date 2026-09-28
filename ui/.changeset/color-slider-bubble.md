---
'@xihan-ui/styles': patch
---

ColorSlider 的值气泡与 Slider 同一套：拖动时不再跟着拇指放大（按同一比例反向缩回、与拇指同一段过渡）；横排气泡改为起点 50% 加乘 `--xh-direction-sign` 的平移回中——此前两侧 inset 都钉在 50% 再靠自动外边距回中，可用宽度是 0，气泡从拇指中线起排、偏出半个自身宽。
