---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

NumberAnimation 的 `easing` 在每轮起跑时解析一次：认下 CSS 缓动函数串（`ease-out`、`steps(4)`、`linear(...)` 等，按 CSS 的曲线播放），认不出的写法在起跑处报错，不再按匀速播放。此前写成 `easing="ease-out"` 一类、实际按匀速播放的，现在按 CSS 的曲线播放；要保持匀速写 `linear`。
