---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 录入控件放进表单字段组即按字段名读写值表：`XhFormFieldGroup`（Web Components 为 `data-xh-part="field-group"`）里的控件自己没给值时，初值取表单的 `defaultValues`，改动写回表单，表单重置或 `setFieldValue` 改了这个字段控件跟着变，不必再写 `v-model`、`value` / `onValueChange` 或监听 `value-change` 后回写，也不必再写 `:invalid="invalid"` 与值的类型断言。值落在哪个 prop 由控件决定（多数是 `value`，开关与复选框是 `checked`，文件上传是 `files`），37 个录入控件已登记。控件自己给了值（`null` 也算）就一概不接，作用域插槽里的 `value` / `setValue` 手动接法照旧可用；组件内部借来跑的子控件与字段边界、浮层 Portal 后面的实例不接。

headless 新增 `formModelOf`、`formFieldModel`、`bindFormModel` 与 `FormModel`、`FormFieldModel` 类型；Vue / React 的 `useMachine` 与 Web Components 的 `MachineController` 新增 `formField` 选项，组件内部借来跑子机器时传 `false`。

**修复** Vue 的 `XhSwitch` 没写 `default-checked` 时不再被归一成 `false`，与复选框、React 与 Web Components 一致：受控的开关放在原生表单里重置时，不再把宿主没说过的 `false` 当成初值报出去。
