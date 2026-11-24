---
'@xihan-ui/styles': minor
---

**改进** 集合里的分组标题与组间隔全家一种长相。

- 分组标题一律说明档 12px、中等字重、所在面的次要字色（frosted 浮层上取材质的 muted）：Menu、ContextMenu、Menubar 的字重从常规升到中等；Cascader、Command、SideNav 的字色从 `--xh-fg-subtle` 换成 `--xh-fg-muted`、字重升到中等——`--xh-fg-subtle` 留给占位字与禁用标签，拿来画标题会与禁用的条目分不开。
- 组与组之间：浮层里的候选面板画线，Combobox 与 Cascader 跟 Select 一样在后继分组顶上画一道面内分隔线、线下留 6px；页内的 Listbox、Transfer 与 Command 不画线，只留 6px（Command 从 8px 收到 6px）。
- 新增使用者槽：`--xh-combobox-group-separator-color`、`--xh-cascader-group-separator-color`（分组分隔线的颜色），SideNav 的分组标题补上 `--xh-side-nav-group-label-fg`、`-font-size`、`-font-weight`，与别家一样可改。
