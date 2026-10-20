---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

Menu、ContextMenu、Menubar、Command、Mention 的选中事件 `select` 改名 `item-select`。原名与原生 `select` 事件同名：输入框、多行文本里选中文字时原生 `select` 会冒泡，包在菜单触发区里的输入框、Mention 与 Command 自己的输入框一选中文字，Web Components 的监听就收到一条不带 `detail` 的「选中」，直接解构 `detail` 会抛错。库的事件名本来一直避开原生名（`value-change`、`open-change`），`select` 是漏下的。

- headless：五个组件的 `onSelect` 改为 `onItemSelect`；详情类型 `MenuSelectDetails`、`ContextMenuSelectDetails`、`MenubarSelectDetails`、`CommandSelectDetails`、`MentionSelectDetails` 改为 `MenuItemSelectDetails`、`ContextMenuItemSelectDetails`、`MenubarItemSelectDetails`、`CommandItemSelectDetails`、`MentionItemSelectDetails`，字段不变。
- Vue：`@select` 改为 `@item-select`；React：`onSelect` 改为 `onItemSelect`，Menubar、ContextMenu、Mention 的根上不再拦原生 `onSelect`，写了就照原生事件透传到根节点；Web Components：监听 `item-select`。
- Command 的 `select(value)` 方法不变。
