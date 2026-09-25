---
'@xihan-ui/motion': patch
'@xihan-ui/backgrounds': patch
---

`animate()` 与背景层按宿主元素所在的 `data-motion` 作用域判断减弱动效。

局部容器写了 `data-motion="reduce"` 时，其中的 `animate()` 调用（包括 `@xihan-ui/animations` 的预设播放）不再播放中间帧，背景画面冻结；写了 `data-motion="default"` 时，即使应用级偏好要求减弱也照常播放。没有 `data-motion` 的页面行为不变。
