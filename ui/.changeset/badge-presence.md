---
'@xihan-ui/headless': major
'@xihan-ui/styles': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

Badge 出现与消失补上进退场：计数从无到有时原地弹出（`xh-pop-in`），清零时缩小淡出（`xh-pop-out`），播完才给 indicator 写 `hidden`，退场途中仍显示清零前的数字（此前出现与消失都是硬切）。首帧就在的角标投影 `data-instant` 直接呈现；呼吸的圆点不叠进场；减弱动效下只剩淡变。

- 破坏性：`connectBadge(props, normalize)` 改为 `connectBadge(service, normalize)`，显隐与计数仍由 props 算出，新增的 `badgeMachine` 只管进退场。新增导出 `badgeMachine`、`badgeVisible`、`badgeText`、`BADGE_DEFAULT_MAX` 与类型 `BadgeSchema`。直接调用 `connectBadge` 的作者改为先用 `badgeMachine` 建服务。
- indicator 新增 `id`、`data-state`（`visible` / `hidden`）与 `data-instant`。
- 三端改为经状态机渲染，公开 props、部件与默认值不变。
