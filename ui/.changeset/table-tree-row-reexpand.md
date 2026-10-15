---
'@xihan-ui/headless': patch
---

Table 树形表的父行收起之后能再展开了：此前状态机收到展开请求时只认行定义上的 `expandable`，而展开把手与方向键按「有子行即可展开」放行，没标 `expandable` 的父行于是只收得起、展不开。现在展开判定与摊平同一口径——有子行或标了 `expandable` 的行都可展开，禁用行仍改不动；把手、左右方向键与 `expandRow` / `toggleExpandRow` 一致。
