---
'@xihan-ui/web-components': major
---

修正 Web Components 的 Menu、ContextMenu 与 Menubar 多级子菜单组合。

`<xh-menu submenu>` 的触发节点现在由逻辑父宿主显式补齐父层 item 身份，子层仍负责 submenu
trigger 身份；键盘焦点、roving tabindex 与方向键不再依赖外层越过嵌套自定义元素扫描部件。
Menu、ContextMenu、Menubar 三种父宿主使用同一内部 owner 端口。末级选择会沿该逻辑链按
叶到根顺序关闭，并只从根派发一次正确形状的 `select`。

展开的子菜单 positioner 会搬到所属 Document 的默认 Portal 根。每个实例使用独占无盒壳并
桥接来源处的视觉属性，避免父菜单的 `backdrop-filter` 把 fixed 子层困在局部包含块；关闭、
断连或来源换代时精确恢复作者节点的位置。搬运期间的 positioner 及其部件仍由原自定义元素
发现、观察和接线，动态新增条目不会变成死节点；iframe 使用自身 Document 的 Portal。

这是破坏性 DOM 位置变化：展开期间不能再用子菜单宿主的 `querySelector` 查 positioner，
应从 `positioner.ownerDocument` 或已保存的部件引用访问；关闭后节点恢复原位。不保留原地渲染分支。
