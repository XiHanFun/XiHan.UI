---
'@xihan-ui/styles': patch
---

transition 列表统一写长名：28 份皮肤里的 `background` 简写换成 `background-color`；Anchor、NavigationMenu、Segmented 的滑动指示器位置由 `transform: translate()` 改为独立的 `translate` 属性（RTL 翻转同改），液态档的挤压 `scale` 不再与位置写在同一个变换里。画面不变，计算样式里的 `transition-property` 随之改名；在 `xihan.overrides` 层覆盖这三个指示器 `transform` 的作者，改写 `translate`。
