---
'@xihan-ui/styles': patch
---

Slider 的值气泡拖动时不再跟着拇指放大：气泡挂在拇指里，拇指按 `--xh-motion-scale-drag` 放大到 1.12 时连文字一起被放大；现在气泡按同一比例反向缩回、与拇指同一段过渡，缩放原点在贴着拇指那一边。刻度点、刻度文案与值气泡的回中平移改为乘 `--xh-direction-sign` 换向，撤掉四处 `:dir(rtl)`（Chrome 120 起，高于浏览器硬底线）。
