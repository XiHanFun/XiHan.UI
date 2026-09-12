---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Command 与 Tooltip 现在由 Headless Presence 资源控制器持有真实退场资源：逻辑关闭立即令 content
`inert` 并退出可访问树，Layer、DismissableLayer 及 Command 的 FocusScope、滚动锁与背景失活延后
到全部有限 CSS 退场完成后释放；退场中不重复消解，重开复用原资源。Tooltip 原有开闭延时与
trigger/content 间悬停语义保持不变。
