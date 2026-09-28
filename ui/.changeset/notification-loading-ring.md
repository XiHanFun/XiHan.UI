---
'@xihan-ui/headless': minor
'@xihan-ui/styles': patch
---

Notification 的加载指示接上加载环家族配方：加载中不再转箭头字形，改画与 Spinner 环档同一副加载环（起始边取指示符的语气色）。item-indicator 新增 `data-xh-loading-ring` 与 `data-loading`；兜底的环与语气字形叠在同一格（`::before` 环、`::after` 字形），加载落定时环停在当前角度淡出、字形淡入。
