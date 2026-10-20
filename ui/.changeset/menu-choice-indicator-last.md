---
'@xihan-ui/headless': major
---

**调整** 菜单、右键菜单与菜单栏的标准结构里，勾选与单选条目的对号（`item-indicator`）挪到正文、说明、快捷键与 `item-suffix` 之后，成为条目的最后一个部件，与 Listbox、Tree 的选项一致，读屏也先念正文；Vue、React 与 Web Components 不写结构时铺出的 DOM 跟着变。对号同时改落 Collection Item 家族的 `indicator` 列（`data-xh-collection-slot="indicator"`），普通条目的标记位照旧在行首、落 `prefix` 列。三份 anatomy 的部件表把 `item-indicator` 排到最后。

迁移：自己照旧结构写样式、按位置选部件（如 `[data-part='item'] > :first-child`）的，改按 `data-part` 选；读 `data-xh-collection-slot="prefix"` 找对号的，改读 `indicator`。手写部件时对号写在哪，皮肤都排到行尾。
