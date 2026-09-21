---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Tabs 的 `indicator` 部件在 `segment` 变体下成为滑动的白色抬起面：与 Segmented 的滑块同一套（`--xh-bg-surface-raised` 底 + `--xh-border-default` 描边 + `--xh-elevation-raised` 影），切换时整块沿标签带滑到当前标签下；标签带里放了它，选中标签自己透空，没放则面仍长在选中标签身上。连接层改为把选中标签的四个几何量写成私有槽 `--xh-_tabs-indicator-x / -y / -w / -h`（此前只写主轴的内联样式）并在部件上投影 `data-variant`，量的是标签带内衬盒的坐标（扣掉标签带自身的描边）。
