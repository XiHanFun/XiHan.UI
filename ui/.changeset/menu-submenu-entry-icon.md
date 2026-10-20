---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**修复** 菜单、右键菜单与菜单栏按数据铺时，带 `children` 的条目（子菜单入口）写了 `icon` 却不画图标：入口现在与普通条目一样，图标铺进 `item-icon`、文字铺进 `item-text`，左缘与同层条目对齐。

- **新增** `XhMenuSub`、`XhMenubarSub`、`XhContextMenuSub` 与 `<xh-menu submenu>` 的 `icon`：按数据铺时触发条目的图标，缺省取所属菜单里这一条的 `icon`，与 `label` 同一种写法；`MenuStructureOptions` 新增同名一项。
- 子菜单入口（`XhMenuSubTrigger` 等）给里面的部件提供条目上下文：手写结构时也能在入口里写 `ItemIcon`、`ItemText`。
