---
'@xihan-ui/headless': patch
'@xihan-ui/styles': patch
---

**修复** 条件编辑器增删条件与子组、上下挪动时全部硬切。现在接上列表动效：首帧就在的直接呈现，之后新加的条件与子组播 `xh-item-in`、同一批按到达顺序错开；留下来的从旧位置滑到新位置（`translate`，`move` 档）；带 `id` 的条件被删时，替身留在原处淡出、播完即移除。

没写 `id` 的条件按位置认身份：删中间一行时视图按位置复用节点，真正卸下的是最后一个，给它放替身会在末尾淡出、像删错了行，所以这类条件与子组被删时不放替身。根部件带上 `id` 供列表动效找到它，接上之前的首帧带 `data-instant`。修在 Headless 与皮肤，Vue、React 与 Web Components 三端同步生效。

`filter-builder.css` 体积基线从 9159 字节升到 10202 字节（去注释压空白后）：涨在条件与子组的进场、离场替身两条规则，两者补上的 `translate` 过渡，以及根上供替身定位的 `position: relative`。
