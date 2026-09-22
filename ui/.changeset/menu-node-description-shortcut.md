---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Menu 新增 `item-shortcut` 部件，`MenuNode` 补上 `indicator` / `description` / `shortcut`——菜单的条目契约至此与 ContextMenu 完全对齐。

文档从一开始就写着"条目可组合图标、文字、说明和快捷键提示"，但 Menu 既没有说明与快捷键的字段，也没有承载快捷键的部件：示例只能在条目末尾塞一个没有槽位的裸 `<span aria-hidden>`，既不落家族的 shortcut 列，也拿不到那一列的字号与颜色。

```ts
const actions = [
  { value: 'duplicate', label: '创建副本', description: '保留当前版本，另存一份', shortcut: '⌘ D' },
  { value: 'archive', label: '归档', description: '移出列表，随时可以恢复', shortcut: '⌘ ⇧ A', separatorBefore: true },
]
```

- **新部件 `item-shortcut`**（`getItemShortcutProps` / `XhMenuItemShortcut` / `data-xh-part="item-shortcut"`）落家族的 shortcut 列：行尾、跨两行居中、排在 `suffix` 之前，与说明同档同色。
- **纯装饰**：带 `aria-hidden`，可及名由条目文字承担；连打检索只取 `item-text`，这串按键记号不进检索串。
- **只为真正注册了的组合写提示**，写一个不存在的比不写更糟。

有一处 DOM 形状变化：代铺的条目此前把 `label` 作为裸文本放进 `item`，现在放进 `item-text` 部件（与 ContextMenu、Menubar 一致）。这修正了两件事——家族的 text 槽此前选不中它，连打检索也会把说明与快捷键的文字一并算进去。手写部件那条路本来就该自己放 `XhMenuItemText`，不受影响。

`item` 插槽（React `renderItem`）的语义不变：它是**整条**的接管口，写了它就由作者全权负责条目内容，代铺的标记位、说明与快捷键都不再出现。这一点与 ContextMenu / Menubar 的同名插槽不同——那两家填的是文字槽。
