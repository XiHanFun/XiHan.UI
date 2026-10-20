---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
'@xihan-ui/styles': major
---

**调整** 菜单、右键菜单与菜单栏的 `item-indicator` 只当对号：只在勾选与单选条目上出现，标准结构里是条目的最后一个部件（正文、说明、快捷键与 `item-suffix` 之后），落 Collection Item 家族的 `indicator` 列（`data-xh-collection-slot="indicator"`），与 Listbox、Tree 的选项一致，读屏也先念正文；手写部件时对号写在哪，皮肤都排到行尾。行首内容全部归 `item-icon`：`item-prefix` 插槽改落 `item-icon`（压过数据里的 `icon`），图标随条目字色走，危险条目随字转红。删去条目数据里的 `indicator` 文字（`MenuNode`、`ContextMenuNode` 与元信息的同名字段）。三份 anatomy 的部件表把 `item-indicator` 排到最后。

迁移：

- `item-prefix` 插槽的内容现在落在 `item-icon`，给它写样式的改按 `item-icon` 选。
- 手写 `ItemIndicator` 当行首图标的，改用 `ItemIcon`（Web Components 写 `data-xh-part="item-icon"`）。
- 给 `item-indicator` 写样式改图标颜色的，改写到 `item-icon`；它本来就随条目字色走，多数时候删掉即可。
- 数据里写 `indicator` 文字的，图标改写 `icon`；要表达选中，改用勾选或单选条目。
- 按位置选部件的（如 `[data-part='item'] > :first-child`），改按 `data-part` 选。
