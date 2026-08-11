---
"@xihan-ui/headless": minor
"@xihan-ui/styles": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
---

color-picker 能进 HTML 表单了。

此前它既没有 `name` prop 也没有表单影子——放进 `<form>` 里提交，`FormData` 里没有这个字段。
同仓 11 个组件早就做全了这件事，它是缺口之一。

照仓内既成的形状补：新增 `hidden-input` 部件（`type=hidden`，排在解剖末位）、`name?: string` prop、
`ColorPickerApi.getHiddenInputProps()`。影子产出的属性恰好五条——parts 属性、`type`、`name`、`value`、
`disabled`——`type` 必须排在 `value` 前（改 type 会重置输入的值），`name` 不给就整条不产出、这份输入
不参与提交，禁用时带原生 `disabled` 不提交值，只读照常提交。

**这是纯增量**：影子是作者自己写的可选部件（Vue 侧新增 `XhColorPickerHiddenInput`，WC 侧新增
`::part(hidden-input)`），不写它就不存在，既有 DOM 与皮肤选择器一个字节不变。
