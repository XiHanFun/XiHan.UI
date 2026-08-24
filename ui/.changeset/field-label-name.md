---
"@xihan-ui/headless": patch
"@xihan-ui/vue": patch
---

套进表单字段的复合控件念得出字段的标签了。

复合控件的可聚焦部件自带 `aria-labelledby`，指的是它自己的 `label` 部件。套进字段时
作者用的是字段的标签、组件那个 `label` 部件根本没渲染，这条引用于是悬空——按 accname
规则悬空 IDREF 直接跳过；名字也回退不到 `label` 的 `for`，因为 `for` 指的是封装根那个
`div`，只对可标注元素生效。结果是焦点所在的那个控件**一个名字都没有**：下拉只念得出
当前值，输入框连值都没有，读屏进去就是一句「编辑框」。

`FieldApi` 补 `labelId`；Vue 侧新增 `useFieldLabelWiring()`，11 个单一可聚焦控件的封装
在真控件那一层把字段的标签**并进**名字链最前面（不是覆盖：只换上去会挤掉当前值）。
`check-field-wiring` 一并钉住这半边。

Web Components 侧还没有字段接线这一层（状态那半边同样没有），此次不涉及。
