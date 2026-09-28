---
'@xihan-ui/headless': patch
'@xihan-ui/styles': patch
---

NavigationMenu 挂载时已展开某一项（`defaultValue`，或受控 `value` 初值不为空）时直接呈现，那一项 content 投影 `data-instant`、不再在页面载入时播一遍弹出；展开项第一次变化起照常进退场。
