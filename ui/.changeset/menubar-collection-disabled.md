---
'@xihan-ui/web-components': patch
---

**修复** `<xh-menubar>` 按 `collection` 铺结构时，数据里写的 `disabled` 不生效：入口与条目都报 `aria-disabled="false"`，方向键也不跳过。现在没在部件上写禁用时以数据为准，与 `<xh-menu>` 和 Vue / React 一致；换一份数据去掉禁用即恢复。作者手写的部件照旧按部件上的声明。
