---
'@xihan-ui/web-components': minor
---

**新增** `<xh-dialog>` 补上 `close-on-interact-outside`（property 为 `closeOnInteractOutside`）：写 `false` 时点对话框外面不收起，填到一半的表单不会因为误点而丢。不写时照旧跟随 `modal`，`alertdialog` 恒不收起。Vue、React 的 Dialog 与同为 Web Components 的 `<xh-drawer>` 早已有这一项，对话框元素此前把它写死成缺省、没有入口可改。
