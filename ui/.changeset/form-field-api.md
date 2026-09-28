---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Form 新增字段级接口：`api.dirty` / `isFieldDirty(name)`（相对 defaultValues 按结构比）、`isFieldTouched(name)`（失焦过一次）、`resetField(name)`（只还原一个字段的值、错误与触碰标记）；不提交的校验 `validateAll()` / `validateField(name)` / `validateFields(names)` 返回 `Promise<FormValidateResult>`（`{ valid, errors, stale }`），不触发 onSubmit / onInvalid、不显示错误摘要、不搬焦点，值在校验结束前被改则作废不写回，校验器抛错时拒绝并照常报 onValidationError。规则新增 `deps`：依赖字段一改，本字段在被触碰过（校验时机不是 submit）或正挂着错误时重新校验。`onSubmit` 可返回 thenable：落定前 `api.submitting` 为真、再提交不发生，提交钮带 `aria-disabled` / `aria-busy` / `data-loading`、表单报 `aria-busy`，拒绝经新增的 `onSubmitError`（三端事件 `submit-error`）报出。Vue 的 `@submit` 改为落在 `onSubmit` prop 上以取得返回值，模板写法不变；Web Components 新增 `submitAction` property 承接异步提交，另补 `dirty` / `submitting` 读口与 `validateAll` / `validateField` / `validateFields` / `resetField` / `isFieldDirty` / `isFieldTouched` 方法。新增类型 `FormValidateResult` / `FormSubmitErrorDetails`，错误摘要相关的 `summaryErrors` / `summaryErrorNames` / `summaryErrorCount` / `getSummaryError` 不变。
