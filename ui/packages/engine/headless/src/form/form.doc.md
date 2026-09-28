# 表单

管理一组字段的值、校验、提交和重置。

## 何时使用

- 多个字段需要一起提交或校验。
- 需要统一管理错误信息和校验时机。

## 何时不用

- 只有一个立即生效的控件时直接处理其值。
- 只需要标签、说明和错误信息时使用[表单字段](./field)。

## 特性

- `validateOn` 设置输入、失焦或提交时校验。
- 支持声明式规则、自定义校验和异步校验。
- 字段值、错误和校验状态均可受控。
- 错误汇总可跳转到对应字段。
- 支持纵向、横向、行内和网格布局。
- 嵌套字段与字段数组使用显式 `FormPath`。
- 字段级状态：`api.dirty` 与 `isFieldDirty(name)` 相对 `defaultValues` 按结构比（改回原样即不算改过），`isFieldTouched(name)` 记失焦过一次的字段；`resetField(name)` 只把一个字段的值、错误与触碰标记还原。
- 不提交的校验：`validateAll()` 整表校验并整表替换错误表，`validateField(name)` / `validateFields(names)` 只写回涉及的字段；三者都返回 `Promise<{ valid, errors, stale }>`，不触发 onSubmit / onInvalid、不显示错误摘要，也不搬焦点。校验结束前值被改则 `stale` 为真、结果不写回；校验器抛错时 Promise 拒绝，同时照常报 `onValidationError`。
- 字段联动：规则写 `deps: ['password']`，依赖字段一改，本字段在被触碰过（校验时机不是 submit）或正挂着错误时重新校验，validator 的第二个参数读得到依赖字段的新值。
- 提交在途：`onSubmit` 返回 thenable 时 `submitting` 为真直到它落定，期间再提交不发生，提交钮带 `aria-disabled` 与 `data-loading`、表单报 `aria-busy`；拒绝经 `onSubmitError`（三端事件 `submit-error`）报出原始原因。Web Components 的事件拿不到监听函数的返回值，异步提交交给 `submitAction` property。

## 组合

- 字段用[表单字段](./field)包裹控件，成组的用[字段集](./fieldset)分区，数量可变的用[字段数组](./field-array)。
- 提交与重置使用[按钮](./button)；错误汇总放在表单顶部，可跳转到对应字段。
- 分步填写时外层使用[步骤条](./steps)。

## 最佳实践

- 首次校验优先放在失焦或提交时。
- 提交失败后聚焦第一个错误字段。
- 异步校验期间显示明确的加载状态。
- 异步提交让 `onSubmit` 直接返回 Promise，用 `submitting` 改提交钮文字，不另外维护一个加载标志。

## 反模式

- 在用户尚未尝试提交时持续显示全部错误。
- 只在前端执行关键业务校验。
