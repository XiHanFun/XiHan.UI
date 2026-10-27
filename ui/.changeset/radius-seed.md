---
'@xihan-ui/tokens': major
'@xihan-ui/styles': major
'@xihan-ui/headless': minor
---

**调整** 圆角改由一颗种子派生：新增 `--xh-radius-seed`（缺省 8px），`--xh-radius-2xs / xs / sm / md / lg` 依次是它的 0.25 / 0.5 / 0.75 / 1 / 1.25 倍（2 / 4 / 6 / 8 / 10px），删除 `--xh-radius-xl`；`--xh-radius-sm / md / lg` 的取值由 2 / 4 / 8px 变为 6 / 8 / 10px。形状角色随之变成 inset 4px、control / surface / overlay 8px，并新增 `--xh-shape-sheet`（10px）。换风格只改种子：在根上写 `--xh-radius-seed` 即可，各档按比例一起变。

**调整** 嵌在别的面里的小块按「内层圆角不大于外层减内衬」改取 inset：锚定浮层与候选面板里的选项与菜单项（Menu、ContextMenu、Menubar、Select、Combobox、Cascader、Mention、TreeSelect、ExpressionInput、Command、日期与时间面板的时间列）以及 Transfer 的列表行不再是铺满整行的通栏行，列表两侧各留 4px 内距（`--xh-*-content-px` 等覆盖槽的缺省值由 0 变为 `--xh-space-1`），行取 inset 圆角；Collection Item 配方的缺省圆角由 control 改为 inset；Tabs segment 的标签与滑块、RadioGroup segmented 的段、字段里的已选标签与 TagsInput 的条目改取 inset。Dialog、Drawer 朝向页面的两个角与 Notification 卡片改取 sheet。

**调整** 锚定浮层的箭头端距 `OVERLAY_ARROW_PADDING` 由 4 改为 8，与 8px 的浮层圆角对齐（`@xihan-ui/headless`）。
