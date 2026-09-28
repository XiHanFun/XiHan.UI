---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Tooltip 新增提示组与跟随鼠标。`XhTooltipProvider`（Vue / React）与 `<xh-tooltip-provider>` 容器元素（Web Components，`display: contents`）把子树里的提示放进同一组：组内共用接替窗口、同一时刻只开一个，不同组互不接替；组上的 `openDelay` / `closeDelay` / `skipDelayDuration` 作为组内提示的缺省，提示自己写的优先。Headless 导出 `createTooltipGroup` 与 `TooltipGroup` / `TooltipGroupOptions`，没放进 Provider 的提示归页面级的那一组。`followCursor` 让由指针打开的提示锚在指针落点上并随移动重新落位，触屏与键盘聚焦时锚回触发器；跟随中的定位层投影 `data-follow-cursor`，浮层本体不接指针。
