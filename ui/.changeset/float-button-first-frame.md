---
'@xihan-ui/headless': patch
'@xihan-ui/styles': patch
---

FloatButton 挂载时已展开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，展开组投影 `data-instant`、里面的动作不再在页面载入时逐条冒出；第一次收起照常逐条缩回，之后每一次展开照常冒出。
