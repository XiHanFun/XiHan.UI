---
'@xihan-ui/headless': minor
---

**新增** 菜单、右键菜单与菜单栏按数据铺时，条目可写 `keyshortcuts`，落成条目的 `aria-keyshortcuts`，读屏念得出快捷键。写法照 ARIA（修饰键在前，如 `Control+S`，几组用空格隔开）。看得见的快捷键提示 `shortcut` 照旧是装饰、读屏不念，两处说的应是同一组键。`MenuNode`、`ContextMenuNode`、`MenubarNode` 新增 `keyshortcuts`，元信息同名一项（没写为 `null`）；手写部件时照旧直接写在条目节点上。
