---
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

字段集（Fieldset）的 `aria-describedby` 只引用实际渲染了的说明与错误文案，不再指向页面上不存在的 id（axe 的 aria-valid-attr-value 不再报）。没写说明、或说明读不出一句话（没有文字，或只有对读屏隐藏的内容）时按没写处理，补上内容后接上；invalid 但没写错误文案时只引用说明；两样都没有时不写 `aria-describedby`。

`connectFieldset` 的 props 新增可选的 `parts`（类型 `FieldsetRenderedParts`），由适配器统计，省略即按都在场处理（服务端直出与挂载前），与字段（Field）的 `parts` 同一套机制。
