---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 表单的值类型泛型：根组件按 `defaultValues`（或 `values`）推断整表的值类型，`rules` 与 `validate` 交回的键只能写它的字段，字段名拼错编译即报错；`onSubmit`、`onValuesChange` 拿到的 `values` 与插槽（React 是函数式 children）里 `setFieldValue(name, value)` 的值都按字段收窄，数组路径逐段检查。字段组推断不到根上的值类型，新增 `defineFormFields<值类型>()`（Vue、React）：拿到的就是字段组与错误摘要条目本身，只在类型上收窄，`name` 只能写字段，插槽里的 `value` 与 `setValue` 是那个字段的类型。Web Components 写 `querySelector<XhFormElement<值类型>>('xh-form')`。`FormSchema<TValues>`、`FormApi<T, TValues>`、`FormRules<TValues>` 与各回调载荷带上值类型参数，缺省仍是宽松的 `FormValues`。规则另写成常量时标成 `FormRules<值类型>`，另写的 `validate` 参数标成值类型、返回 `FormErrorPatchOf<值类型>`，React 里把插槽载荷另存成变量时标成 `FormRootSlotProps<值类型>`：标成不带参数的宽松类型再配上有具体类型的 `defaultValues` 会被判为字段名不符。headless 新增 `FormFieldName`、`FormFieldPath`、`FormPathValue`、`FormErrorPatchOf` 类型。Vue 在模板里由 Volar 推断，`h()` 推断不了泛型，那里按宽松的值表检查。

**新增** 表单的 `schema`：收 Standard Schema，zod、valibot、arktype 的 schema 直接交进去，组件只依赖接口、不引入任何校验库。交给它的是嵌套对象（数组路径的字段按段写回原位），它报的问题按 `path` 落到字段上，同一字段只留第一条，没有路径的记在空字段名下；同一字段几边都报错时 `rules` 优先、`validate` 其次、`schema` 最后。异步 schema 照常走 `validating`。headless 新增 `FormStandardSchema`、`FormStandardResult`、`FormStandardIssue` 类型。
