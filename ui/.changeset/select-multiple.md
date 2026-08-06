---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/wc": major
---

Select 支持多选，选中值由单值改为集合，公开 API 破坏性变更。

多选打开方式是 `multiple`：点中条目即在集合里增删该项，列表不收起；单选行为不变，只是选中值
的容器形状统一成了数组（单选恒为长度 ≤ 1）。

迁移点：

- `SelectValueChangeDetails.value` 由 `string | null` 变 `string[]`。原先判空写 `details.value === null`
  的，改判 `details.value.length === 0`；取单选值写 `details.value[0]`。
- `SelectApi` 的 `value` 与 `valueText` 由单值变数组，两者逐项对应；`setValue` 签名变
  `(next: string | string[]) => void`，裸串按单选简写处理；新增 `multiple`。
  想拿「显示成什么字」不必自己拼，用 `displayText`：有选中取选中项文本（多选按半角逗号加空格连起来），
  否则取 `placeholder`。
- Vue 默认插槽暴露的 `value` 与 `setValue` 随之变化；`update:value` 的载荷由单值变数组，
  因此 `v-model:value` 绑定的变量类型要一并改。`value` / `default-value` 两个 prop 仍接受裸串与 `null`。
- WC `value-change` 事件的 `detail` 由 `{ value: string | null }` 变 `{ value: string[] }`；
  新增 `multiple` 属性。`value` 属性只递得进单值，多选集合请写 property。
  表单影子 `hidden-select` 不再写 `value`，选中态一律由 `option` 的 `selected` 表达（多选时开原生
  `multiple`）—— 靠读 `hidden-select.value` 反查选中项的代码要改成读 `selectedOptions`。
