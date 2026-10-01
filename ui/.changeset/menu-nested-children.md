---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

Menu、ContextMenu、Menubar 的数据驱动支持多级：节点写 `children`（一组菜单条目）即为子菜单入口，Vue / React 的默认树按 `children` 递归铺出下一层，深度不限，叶子的选中经菜单树汇到根上；Menubar 在条目上读 `children`。入口只能是普通条目，勾选与单选条目带 `children` 直接报错。此前 `MenuNode` 没有 `children`，用数据描述菜单最多两级，路由菜单这类深度不定的场景只能手写 `Sub` 部件。Vue 的 `XhContextMenuSub`（与 React 对齐）与两端的 `XhMenubarSub` 新增 `collection`，供子层取显示文本与禁用。Web Components 由作者写 Light DOM，不读这一项。
