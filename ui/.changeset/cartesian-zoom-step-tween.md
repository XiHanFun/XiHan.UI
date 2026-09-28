---
'@xihan-ui/headless': minor
---

CartesianChart 一步到位的换窗改为补间：键盘 `+` / `−`、鼠标滚轮一格、点缩放条空处、缩放条手柄的方向键与命令式 `setWindow` 按 move 时长补间过去；拖着平移、捏合、触控板连续滑动与刷选照旧跟手。`WINDOW.SET` 事件新增可选的 `step`。减弱动效下直接落到终态。
