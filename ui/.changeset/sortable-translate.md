---
'@xihan-ui/headless': patch
'@xihan-ui/styles': patch
'@xihan-ui/web-components': patch
---

Sortable 条目的让位、跟手与归位位移，以及落点线的位置，由内联 `transform: translate3d(…)` 改为独立的 `translate` 属性；皮肤的让位过渡与归位期间的 `will-change` 随之改到 `translate`。画面不变。
