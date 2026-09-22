---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

ContextMenu 与 Menubar 补上 `item-shortcut` 部件与节点上的 `shortcut`，菜单族三家至此口径一致。

三家的文档都写着"条目可组合图标、文字、说明和快捷键提示"，但谁都没有承载快捷键的部件：示例只能在条目末尾塞一个没有槽位的裸 `<span aria-hidden>`，既不落家族的 shortcut 列，也拿不到那一列的字号与颜色。Menu 已在上一版补齐，这一版补另外两家。

```ts
const commands = [
  { value: 'copy', label: '复制', description: '连同格式', shortcut: '⌘ C' },
]
```

- 新部件 `item-shortcut`（`getItemShortcutProps` / `XhContextMenuItemShortcut` / `XhMenubarItemShortcut` / `data-xh-part="item-shortcut"`）落行尾、跨两行居中，与说明同档同色。
- 带 `aria-hidden`：可及名由条目文字承担；连打检索只取 `item-text`，这串按键记号不进检索串。
- Menubar 的 `shortcut` 与 `description` 一样**只在条目上读取**，顶层入口写了不生效。

示例 `context-menu/03-icon` 与 `menubar/03-icon` 一并改正：图标进 `item-indicator`（此前是裸 `<svg>`，不落 prefix 列），快捷键进 `item-shortcut`。
