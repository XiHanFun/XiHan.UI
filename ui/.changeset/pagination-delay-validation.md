---
'@xihan-ui/headless': patch
---

Pagination 省略位浮层的 `openDelay` / `closeDelay` 改经机器的定时原语：负数、NaN 与无穷此前被 `setTimeout` 当成 0 立即触发，现在与 Tooltip、HoverCard 一样报 `INVALID_DELAY`（开发环境抛出，生产环境上报并不起计时）。合法取值的行为不变。
