---
'@xihan-ui/headless': patch
'@xihan-ui/styles': patch
---

Menubar 挂载时已展开某一张（`defaultValue`，或受控 `value` 初值不为空）时直接呈现，那一张 content 投影 `data-instant`、不再在页面载入时播一遍滑入；整条收起照常播退场，之后每一次展开照常进场，换张仍然瞬时。
