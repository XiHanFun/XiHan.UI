---
'@xihan-ui/styles': major
---

**调整** 弹层只有一套进出场：锚定列表与菜单（Menu、Select、Combobox、Cascader、ContextMenu、Menubar、Mention、TreeSelect、ExpressionInput、Date / Time picker、ColorPicker、SideNav 弹出分支、Pagination 页码面板、Tooltip）由「沿落位方向短移、不缩放」改为与锚定面板相同的 `xh-overlay-pop-in` / `xh-pop-out`：淡入 + 从 `--xh-motion-scale-enter` 放大 + 从锚点一侧短移，退场缩小淡出；NavigationMenu、FloatingPanel、FloatButton 列表、BackTop、Log / MessageFeed 回底钮这些不贴锚点的弹层同样改用 `xh-overlay-pop-in`（不写方向，原地淡入放大）。共享关键帧 `xh-overlay-slide-in` / `xh-overlay-slide-out` 删除，覆盖过它们的主题改写 `xh-overlay-pop-in` / `xh-pop-out`；`xh-pop-in` 只留给页内浮现的小件与标签行的加入。
