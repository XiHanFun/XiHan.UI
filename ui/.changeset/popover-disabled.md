---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Popover 新增 `disabled`，与 Tooltip、HoverCard 同名同义：浮层不可打开，触发器转原生 disabled 并投影 `data-disabled`（家族画禁用面、退出 Tab 序列），点按与 `setOpen(true)` 都不展开、不发 `open-change`；展开途中转为禁用即收起（受控时只发收起意图）。
