---
"@xihan-ui/designer-shell": minor
---

**新增** `<xh-designer-frame>` 的窄屏：视口窄于 `--xh-breakpoint-md` 时中间一栏占满整行，左右两侧的区收进从两边滑出的抽屉，缺省收着，由「面板」命令与 `togglePanel` 开关，同时只开一侧，不改 `panels`；面板头的关闭钮与 Esc 只收起抽屉。外框上写 `data-narrow`，只读属性 `narrow` 给出当前是否窄屏。

**修复** 命令工具栏的菜单命令：点了复选条目、菜单仍开着时，按点过之后的状态重算勾选。
