---
'@xihan-ui/web-components': patch
---

`<xh-grid-list>` 升级后摘掉作者写在行上的原生 `disabled`，禁用态只由 `aria-disabled="true"` 与 `data-disabled` 表达，与 Vue、React 渲染出的行一致。行是 `role="row"` 的非表单元素，`disabled` 在它上面不是有效属性；作者照旧在行上写 `disabled` 声明禁用，读法不变。
