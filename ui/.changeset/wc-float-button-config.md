---
'@xihan-ui/web-components': patch
---

`<xh-float-button>` 的尺寸与内建文案接上全局配置：放在 `<xh-config size="…">` 里或经 `setXhConfig` 给了 `size`、`translations` 时，按钮与菜单按全局的尺寸与文案渲，与 Vue、React 一致。此前只有写在元素上的 `size` 与 `translations` 生效。
