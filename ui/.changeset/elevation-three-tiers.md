---
'@xihan-ui/tokens': major
---

**调整** 阴影收成三档，按面的类型取：`--xh-elevation-raised`（Card、Tabs segment 滑块、开关拇指等）由 none 改为引 `--xh-shadow-sm`；`--xh-elevation-floating` 与 `--xh-elevation-lifted` 引 `--xh-shadow-md`；`--xh-elevation-sheet` 引 `--xh-shadow-lg`。浮层材质 `--xh-material-frosted-shadow`（含 compact 档）浅色取 md、深色取同样三层的深色投影，模态材质 `--xh-material-elevated-shadow` 浅色取 lg、深色取同样三层的深色投影；原先的单层 `0 4px 10px` / `0 4px 12px` 不再使用。深色档的 `--xh-elevation-lifted` 与 floating 同值。要回到原来的平面卡片，把 `--xh-elevation-raised` 写回 none。
