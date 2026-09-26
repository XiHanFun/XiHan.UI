---
'@xihan-ui/styles': patch
---

Toast 叠放的位移与收拢比例由 `transform: translateY() scale()` 拆成独立的 `translate` 与 `scale` 属性，进出场关键帧 `xh-toast-in / xh-toast-out` 同改。两者的作用顺序与原来一致，画面不变；计算样式里的 `transition-property` 由 `transform` 变为 `translate, scale`。
