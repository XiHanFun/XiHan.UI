---
"@xihan-ui/web-components": patch
---

角色节点契约 `PartContract` 新增 `rewired` 登记：作者按本组件的角色名写、接线后 `data-part` 却是同一 scope 里另一个部件的双重身份节点。`<xh-menu submenu>` 登记 `trigger → item`：子菜单的触发器由 Headless 的 `getSubmenuTriggerProps` 铺成父菜单的 `item`（父层方向键、高亮与集合条目皮肤都按它认，三端 DOM 一致），示例门禁不再把它判成接错了名。运行时接线不变。
