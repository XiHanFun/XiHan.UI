---
'@xihan-ui/styles': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

Select、Combobox、TreeSelect 的候选面板与字段盒等宽：长选项在条目里截断，面板不再随最长的一条变宽到 `--xh-overlay-max-w`；字段盒比 `--xh-overlay-menu-min-w` 还窄时取这个下界，比可用区还宽时收成可用宽度。三者的下界与限高统一取列表档（`--xh-overlay-menu-min-w` / `--xh-overlay-menu-max-h`）。Select 与 TreeSelect 的浮层改锚在字段盒（control）上，面板左缘与盒子对齐，不再缩进一截内距；作者没写 control 时退回触发器。`--xh-<c>-content-max-w` 缺省改为不封顶，要封顶时显式写。
