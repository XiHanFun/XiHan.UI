---
'@xihan-ui/headless': patch
'@xihan-ui/styles': patch
---

DatePicker 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，带进场的部件投影 `data-instant`、不再在页面载入时播一遍进场；第一次收起照常播退场，之后每一次打开照常进场。
