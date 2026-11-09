---
'@xihan-ui/headless': patch
'@xihan-ui/styles': patch
---

**修复** 网格列表的行增删、换批没有进退场：新到的行直接出现，删掉的行当场消失，留下来的行跳到新位置。现在接上列表动效：首帧就在的行直接呈现，之后新到的行播 `xh-item-in`、同一批按到达顺序错开；删掉的行由替身留在原处淡出，播完即移除；留下来的行从旧位置滑到新位置（`translate`，`move` 档）。根部件带上 `id` 供列表动效找到它，接上之前的首帧带 `data-instant`。修在 Headless 与皮肤，Vue、React 与 Web Components 三端同步生效。

`grid-list.css` 体积基线从 8282 字节升到 9327 字节（去注释压空白后）：涨在行的进场、离场替身两条规则，行过渡补上的 `translate`，以及根上供替身定位的 `position: relative`。
