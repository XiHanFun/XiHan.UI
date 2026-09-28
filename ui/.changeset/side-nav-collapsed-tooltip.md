---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

SideNav 折叠成图标栏后，只剩图标的入口（顶层叶子；`collapsedPopout` 关掉时也含顶层分支）悬停或聚焦时在行尾一侧显示名称提示。提示就是库内的 Tooltip：一台内嵌的 Tooltip 状态机按受控跑，悬停开延时、收起延时、接替窗口、提示组（含 `XhTooltipProvider` / `xh-tooltip-provider`）、定位、Escape 收起与反白外观都随 Tooltip，指针在两片叶子间挪动或焦点逐行移动时原地换锚、不重播进场；弹出分支不叠提示，平铺与折叠进行中不显示，折叠开关一翻即收。提示对读屏隐藏、行上不挂 `aria-describedby`，可及名仍由行文字承担。Headless 新增 `sideNavTooltipProps(service)`（喂给内嵌提示机的 props）、`findSideNavRowEl(service, value)`（提示锚点），`connectSideNav` 新增可选的第三个参数接内嵌提示机，api 新增 `tooltipText`、`getTooltipPositionerProps()` 与 `getTooltipContentProps()`（投影 tooltip 的 positioner 与 content）。Vue / React 新增 `XhSideNavTooltip`（放一个即可，自带定位层与 Portal）；Web Components 新增 `tooltip-positioner` 与 `tooltip` 两个角色（委派给 tooltip 的 scope）。side-nav.css 引入 tooltip.css，单独引入仍成立。
