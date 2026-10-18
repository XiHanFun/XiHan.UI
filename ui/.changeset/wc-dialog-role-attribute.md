---
"@xihan-ui/web-components": major
---

`<xh-dialog>`、`<xh-drawer>` 的语义角色改写 `dialog-role`（property `dialogRole`），`role` 不再当作配置。`role` 是 HTML 全局属性，写在宿主上时宿主本身就成了对话框：宿主里的触发钮被读屏读成在对话框里，收起后宿主还是一个没有名字的对话框（对话框服务关掉确认框后就是这样）。现在角色只落在 content 上，宿主不带 `role`。

升级：写过 `role="alertdialog"` 的改成 `dialog-role="alertdialog"`，代码里设 `role` 的改设 `dialogRole`。Vue 与 React 的 `role` 不变。
