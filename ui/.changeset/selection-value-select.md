---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 选择器的值可以是任意类型：`value`、`defaultValue` 与 `collection` 里交进来数字、对象都行，`onValueChange`、`v-model`（Vue 的 `update:value`）、默认插槽、条目插槽与 `renderItem` 拿到的是原值，形状照旧（单选也是数组）。Vue 与 React 的 `XhSelectRoot` 按 `value` 或 `collection` 推断值的类型，`v-model:value` 绑数字或对象的数组不必写断言，两处类型对不上即报错；对象值给 `valueKey`（字段名或取值函数）按它认，同一个选项每次都是新对象也选得中，不给按对象身份认。数字转成字符串当键，键也是条目的 `data-value` 与随表单提交的值。Vue 的 `h()` 推断不了泛型，那里按宽松的类型检查，原来写的回调照收；Web Components 经 property 交值，`querySelector<XhSelectElement<V>>('xh-select')` 收窄，标记里另有 `value-key` 属性。

headless 新增选择类共用的值边界：机器与 DOM 照旧只认字符串键，值在 props 进机器前编成键、`onValueChange` 与 api 交出去时解回原值，值全是字符串时不多付开销。`SelectSchema`、`SelectApi` 等带上值类型参数，缺省仍是 string；api 新增 `valueKeys`，条目与标签的元信息新增 `key`；新增 `SelectionValueKey` 类型与 `valueKeyOf`。
