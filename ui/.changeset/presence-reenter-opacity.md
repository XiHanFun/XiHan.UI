---
'@xihan-ui/core': minor
'@xihan-ui/styles': patch
---

浮层退场中途重新打开时，从当前透明度接着淡入，不再先跳回全透明再进场（快速连点触发器时的一次闪断）。

- `PresenceHandle` 新增 `onReenter(fn)`：退场中途被重新打开时同步回调，先于租约结清。
- `attachCssExit` 在退场开始时记下起始透明度、时长与缓动，重开时按已播时间算出此刻的透明度，写进节点的私有槽 `--xh-_enter-from-opacity`；共享进场关键帧（`xh-overlay-slide-in`、`xh-overlay-pop-in`、`xh-pop-in`、`xh-fade-in`、`xh-rise-in`、`xh-item-in`、`xh-drop-in`、`xh-sheet-in`、`xh-slide-fade-in`）与 Toast、Tour 聚光框的进场以它为起点，未写时仍从 0 起。完整关闭后的下一次打开照常从全透明淡入。
