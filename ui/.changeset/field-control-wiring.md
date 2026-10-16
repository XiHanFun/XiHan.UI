---
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': minor
---

Web Components 的库内控件放进 `<xh-field>` 时，字段的提示、错误文案与标题接到控件真正可聚焦的部件上（输入框、触发钮、组根、拇指），读屏念得到；此前只铺在控件宿主上，焦点所在的节点没有描述也没有字段标题。控件移出字段、跨进 `<xh-field-boundary>` 或字段断开时接线收回。

- headless 新增字段接线函数 `fieldControlWiring`、`fieldStateAttrs`、`fieldGroupAttrs`、`withFieldLabel` 与类型 `FieldControlWiring`；Vue / React 的 `useFieldStateWiring`、`useFieldGroupWiring`、`useFieldLabelWiring` 改为调用它们，导出名与行为不变。
- Web Components 元素新增 `setFieldWiring(wiring)`，由 `<xh-field>` 调用；23 个库内控件各自以静态 `fieldTarget` 声明接线落在哪个部件，与 Vue / React 的落点一致。
