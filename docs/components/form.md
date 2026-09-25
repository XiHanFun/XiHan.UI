# Form 表单

管理一组字段的值、校验、提交和重置。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/form" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/form.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/form" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/form" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/form.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

提交并校验表单

<XhDemo src="form/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="form"`：**`root`** · `field-group` · `error-summary` · `error-summary-item` · `submit-trigger` · `reset-trigger`

## 示例

### 校验时机

在失焦或输入时校验

<XhDemo src="form/02-validate-on" />

### 状态

禁用与只读表单

<XhDemo src="form/03-disabled" />

### 异步校验

提交前检查用户名

<XhDemo src="form/04-async" />

### 声明式规则

配置字段校验规则

<XhDemo src="form/05-rules" />

### 布局

设置纵向、横向、行内或网格布局

<XhDemo src="form/06-layout" />

## 设计指引

### 何时使用

- 多个字段需要一起提交或校验。
- 需要统一管理错误信息和校验时机。

### 何时不用

- 只有一个立即生效的控件时直接处理其值。
- 只需要标签、说明和错误信息时使用[表单字段](./field)。

### 特性

- `validateOn` 设置输入、失焦或提交时校验。
- 支持声明式规则、自定义校验和异步校验。
- 字段值、错误和校验状态均可受控。
- 错误汇总可跳转到对应字段。
- 支持纵向、横向、行内和网格布局。
- 嵌套字段与字段数组使用显式 `FormPath`。

### 组合

- 字段用[表单字段](./field)包裹控件，成组的用[字段集](./fieldset)分区，数量可变的用[字段数组](./field-array)。
- 提交与重置使用[按钮](./button)；错误汇总放在表单顶部，可跳转到对应字段。
- 分步填写时外层使用[步骤条](./steps)。

### 最佳实践

- 首次校验优先放在失焦或提交时。
- 提交失败后聚焦第一个错误字段。
- 异步校验期间显示明确的加载状态。

### 反模式

- 在用户尚未尝试提交时持续显示全部错误。
- 只在前端执行关键业务校验。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-form>` |
| Vue 组件 | `XhFormErrorSummary` `XhFormErrorSummaryItem` `XhFormFieldGroup` `XhFormResetTrigger` `XhFormRoot` `XhFormSubmitTrigger` |
| 组合式函数 | `useForm` |
| 状态机 | `formMachine` |
| 皮肤 | `@xihan-ui/styles/form.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `values` | `FormValues` |  | 受控值表；提供即受控：cell 直读 prop，写入只发 onValuesChange 不落内部值。 |
| `defaultValues` | `FormValues` |  | 非受控初值，同时也是 reset 的落点。 |
| `errors` | `FormErrorPatch` |  | 受控错误表；提供即受控。空串会被清理（空串不是一条错误）。 |
| `defaultErrors` | `FormErrorPatch` |  |  |
| `validate` | `(values: FormValues) => FormErrorPatch \| Promise<FormErrorPatch>` |  | 校验函数。返回字段名 → 错误文案，无错的字段给空串或省略； 允许返回 Promise（远程校验），期间 validating 置真。 与 rules 并用时同字段两边都报错按 rules 的文案计算。 |
| `rules` | `FormRules` |  | 声明式校验规则：字段名 → 一条或一组规则，与 validate 可并用。 |
| `validateMessages` | `FormValidateMessages` |  | 规则文案模板，{name}/{min}/{max} 现场代入；未提供时使用内置英文模板。 |
| `validateOn` | `FormValidateOn` |  | 校验时机，默认 submit。 |
| `layout` | `FormLayout` |  | 排布，默认 vertical。 |
| `columns` | `FormColumns` |  | grid 排布下的列数：1 至 4 的整数，未提供时按一列排列；范围外的值也按一列排列。 也接受断点对象 `{ base, sm, md, lg, xl }`，逐档写各自的列数，未写的档沿用更窄的一档。 其余三档排布下不参与排版。 |
| `labelWidth` | `number \| string` |  | horizontal 下标签列宽（number 视作 px），整表统一、字段据此对齐。 |
| `labelAlign` | `'start' \| 'end'` |  | horizontal 下标签文字的对齐缘，默认 end（贴近控件）。 |
| `disabled` | `boolean` |  | 整个表单禁用：提交、重置、写值一概不发生，两个按钮带原生 disabled。 |
| `readOnly` | `boolean` |  | 只读：写值与重置不发生，但仍可提交。 |
| `onValuesChange` | `(details: FormValuesChangeDetails) => void` |  | 值表变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 |
| `onErrorsChange` | `(details: FormErrorsChangeDetails) => void` |  | 错误表变化意图回调；受控时是唯一出口。 |
| `onSubmit` | `(details: FormSubmitDetails) => void` |  | 校验通过才调用。 |
| `onInvalid` | `(details: FormInvalidDetails) => void` |  | 校验不通过时调用，附带拦截的整张错误表。 |
| `onValidationError` | `(details: FormValidationErrorDetails) => void` |  | 校验器抛错或拒绝 Promise 时调用；不触发 onInvalid 或 onSubmit。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `values-change` | `FormValuesChangeDetails` | 值表变化；detail 为 `{ values }` |
| `errors-change` | `FormErrorsChangeDetails` | 错误表变化；detail 为 `{ errors }` |
| `submit` | `FormSubmitDetails` | 校验通过才派发；detail 为 `{ values }` |
| `invalid` | `FormInvalidDetails` | 校验不通过时派发；detail 为 `{ errors, values }` |
| `validation-error` | `FormValidationErrorDetails` | 校验器执行异常；detail 为 `{ cause, values, field }`，field 为 null 表示整表提交 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFormErrorSummary` | `default` | `FormErrorSummarySlotProps` |  |
| `XhFormErrorSummaryItem` | `default` | `FormErrorSummaryItemSlotProps` |  |
| `XhFormFieldGroup` | `default` | `FormFieldGroupSlotProps` |  |
| `XhFormRoot` | `default` | `FormRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhFormErrorSummary` | `children` | `SlotChildren<FormErrorSummarySlotProps>` |  |  |
| `XhFormErrorSummaryItem` | `name` | `FormPath` | 是 | 该条指向哪个字段路径。 |
| `XhFormErrorSummaryItem` | `children` | `SlotChildren<FormErrorSummaryItemSlotProps>` |  |  |
| `XhFormFieldGroup` | `name` | `FormPath` | 是 | 字段路径；字符串含点仍是单键，数组才表示层级。 |
| `XhFormFieldGroup` | `span` | `FormFieldSpan` |  | grid 排布下该格占多宽：1 至 4 跨相应列数，'full' 占满整行；未写时占一列。 |
| `XhFormFieldGroup` | `children` | `SlotChildren<FormFieldGroupSlotProps>` |  |  |
| `XhFormRoot` | `children` | `SlotChildren<FormRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'invalid' \| 'idle' |
| `error-summary` | 'invalid' \| 'idle' |

以下名称仅用于内部状态机。

**状态**：`idle` · `invalid`

**事件**：`SUBMIT` · `RESET` · `VALIDATION.PASS` · `VALIDATION.FAIL` · `FIELD.SET` · `FIELD.ARRAY.MUTATE` · `FIELD.BLUR` · `ERROR.SET` · `ERRORS.CLEAR` · `ERROR.FOCUS` · `PRESS.START` · `PRESS.END`

**判据**：`isEnabled` · `isEditable` · `isValidationSnapshotCurrent` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `values` | `FormValues` | 当前的值表。 |
| `errors` | `FormErrors` | 当前的错误表（已清理）。 |
| `errorNames` | `FormPath[]` | 出错的字段名，插入顺序。 |
| `errorCount` | `number` |  |
| `invalid` | `boolean` | 错误表非空。与是否提交失败过无关，挂载时作者预置的错误也计入。 |
| `submitFailed` | `boolean` | 上一次提交被拦截：错误摘要据此显示。 |
| `validating` | `boolean` | 异步校验进行中（提交或逐字段都计入）。 |
| `validationError` | `FormValidationErrorDetails \| null` | 校验服务异常；null 表示没有异常，字段错误仍从 errors 读取。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `validateOn` | `FormValidateOn` |  |
| `layout` | `FormLayout` | 当前的排布档。 |
| `getFieldId` | `(name: FormPath) => string` | 字段容器的 DOM id；错误摘要的链接指向它。 |
| `getFieldValue` | `(name: FormPath) => unknown` |  |
| `getFieldError` | `(name: FormPath) => string \| undefined` | 该字段当前的错误文案；无错时为 undefined。 |
| `isFieldInvalid` | `(name: FormPath) => boolean` |  |
| `isFieldRequired` | `(name: FormPath) => boolean` | 该字段的规则中声明了 required：字段的必填标记由此推导。 |
| `setFieldValue` | `(name: FormPath, value: unknown) => void` | 写一个字段的值；禁用或只读时不生效。 |
| `setFieldError` | `(name: FormPath, message?: string) => void` | 写一个字段的错误；未提供文案（或提供空串）即清除该条。 |
| `clearErrors` | `() => void` |  |
| `submit` | `() => void` | 执行完整的校验与提交流程，与用户按提交键走同一路径。 |
| `reset` | `() => void` | 值与错误都回到初始；禁用或只读时不生效。 |
| `getRootProps` | `() => T['element']` |  |
| `getFieldGroupProps` | `(props: FormFieldGroupProps) => T['element']` |  |
| `getErrorSummaryProps` | `() => T['element']` |  |
| `getErrorSummaryItemProps` | `(props: FormErrorSummaryItemProps) => T['element']` |  |
| `getSubmitTriggerProps` | `() => T['button']` |  |
| `getResetTriggerProps` | `() => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | held on submit-trigger / reset-trigger / error-summary-item, not disabled, no async validation in flight | 按住期间该部件投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，异步校验开跑（提交在途）或条目所指字段改好时一并撤下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `error-summary` | `aria-atomic` | 'true' |
| `error-summary` | `aria-live` | 'assertive' |
| `error-summary` | `role` | 'alert' |

## 样式参考

### 皮肤

`@xihan-ui/styles/form.css` 使用 `[data-scope="form"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-columns` | columns.base |
| `root` | `data-columns-lg` | columns.lg |
| `root` | `data-columns-md` | columns.md |
| `root` | `data-columns-sm` | columns.sm |
| `root` | `data-columns-xl` | columns.xl |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-label-align` | props.labelAlign |
| `root` | `data-layout` | props.layout |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-state` | 'invalid' \| 'idle' |
| `field-group` | `data-disabled` | ''（条件成立时才出现） |
| `field-group` | `data-invalid` | ''（条件成立时才出现） |
| `field-group` | `data-readonly` | ''（条件成立时才出现） |
| `field-group` | `data-span` | fieldSpan(field.span) |
| `error-summary` | `data-count` | String(errorCount) |
| `error-summary` | `data-state` | 'invalid' \| 'idle' |
| `error-summary-item` | `data-invalid` | ''（条件成立时才出现） |
| `error-summary-item` | `data-pressed` | ''（条件成立时才出现） |
| `submit-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `submit-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `submit-trigger` | `data-xh-action-control` | '' |
| `submit-trigger` | `data-xh-action-display` | 'always' |
| `submit-trigger` | `data-xh-action-profile` | 'text' |
| `submit-trigger` | `data-xh-action-size` | 'md' |
| `submit-trigger` | `data-xh-action-variant` | 'solid' |
| `reset-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `reset-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `reset-trigger` | `data-xh-action-control` | '' |
| `reset-trigger` | `data-xh-action-display` | 'always' |
| `reset-trigger` | `data-xh-action-profile` | 'text' |
| `reset-trigger` | `data-xh-action-size` | 'md' |
| `reset-trigger` | `data-xh-action-variant` | 'outline' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-form-field-gap` | `field-group` | `gap` | `default` | `--xh-space-1` | form 的 field-group 部件 gap 覆盖槽。 |
| `--xh-form-field-invalid-border` | `field-group` | `border-inline-start` | `invalid` | `--xh-border-invalid` | form 的 field-group 部件 border-inline-start 覆盖槽。 |
| `--xh-form-field-invalid-px` | `field-group` | `padding-inline-start` | `invalid` | `--xh-space-2` | form 的 field-group 部件 padding-inline-start 覆盖槽。 |
| `--xh-form-gap` | `root` | `gap` | `default` | `--xh-stack-gap-md` | form 的 root 部件 gap 覆盖槽。 |
| `--xh-form-inline-gap` | `root` | `column-gap` | `layout=inline` | `--xh-space-4` | form 的 root 部件 column-gap 覆盖槽。 |
| `--xh-form-label-w` | `root` | `grid-template-columns` | `layout=horizontal` | `30%` | form 的 root 部件 grid-template-columns 覆盖槽。 |
| `--xh-form-submit-bg` | `submit-trigger` | `background-color` | `default` | `--xh-_action-variant-bg-rest` | form 的 submit-trigger 部件 background-color 覆盖槽。 |
| `--xh-form-submit-bg-active` | `submit-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | form 的 submit-trigger 部件 background-color 覆盖槽。 |
| `--xh-form-submit-bg-hover` | `submit-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | form 的 submit-trigger 部件 background-color 覆盖槽。 |
| `--xh-form-submit-border` | `submit-trigger` | `border` | `default` | `--xh-_action-variant-border-rest` | form 的 submit-trigger 部件 border 覆盖槽。 |
| `--xh-form-submit-border-active` | `submit-trigger` | `border-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-border-pressed` | form 的 submit-trigger 部件 border-color 覆盖槽。 |
| `--xh-form-submit-border-hover` | `submit-trigger` | `border-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-border-hover` | form 的 submit-trigger 部件 border-color 覆盖槽。 |
| `--xh-form-submit-fg` | `submit-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | form 的 submit-trigger 部件 color 覆盖槽。 |
| `--xh-form-submit-shadow` | `submit-trigger` | `box-shadow` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_highlight-brand` | form 的 submit-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-form-summary-bg` | `error-summary` | `background` | `default` | `--xh-bg-surface` | form 的 error-summary 部件 background 覆盖槽。 |
| `--xh-form-summary-border` | `error-summary` | `border` | `default` | `--xh-border-invalid` | form 的 error-summary 部件 border 覆盖槽。 |
| `--xh-form-summary-fg` | `error-summary` | `color` | `default` | `--xh-fg-danger` | form 的 error-summary 部件 color 覆盖槽。 |
| `--xh-form-summary-font-size` | `error-summary` | `font-size` | `default` | `--xh-text-body-size` | form 的 error-summary 部件 font-size 覆盖槽。 |
| `--xh-form-summary-gap` | `error-summary` | `gap` | `default` | `--xh-space-1_5` | form 的 error-summary 部件 gap 覆盖槽。 |
| `--xh-form-summary-item-bg` | `error-summary-item` | `background` | `default` | `transparent` | form 的 error-summary-item 部件 background 覆盖槽。 |
| `--xh-form-summary-item-bg-hover` | `error-summary-item` | `background` | `hover` | `--xh-bg-subtle` | form 的 error-summary-item 部件 background 覆盖槽。 |
| `--xh-form-summary-item-bg-pressed` | `error-summary-item` | `background` | `is(:active, [data-pressed])`<br>`pressed` | `--xh-bg-subtle-hover` | form 的 error-summary-item 部件 background 覆盖槽。 |
| `--xh-form-summary-item-fg-hover` | `error-summary-item` | `color` | `hover`<br>`is(:active, [data-pressed])`<br>`pressed` | `--xh-fg-danger-hover` | form 的 error-summary-item 部件 color 覆盖槽。 |
| `--xh-form-summary-item-font-size` | `error-summary-item` | `font-size` | `default` | `--xh-text-secondary-size` | form 的 error-summary-item 部件 font-size 覆盖槽。 |
| `--xh-form-summary-item-px` | `error-summary-item` | `padding-inline` | `default` | `--xh-space-1` | form 的 error-summary-item 部件 padding-inline 覆盖槽。 |
| `--xh-form-summary-item-radius` | `error-summary-item` | `border-radius` | `default` | `--xh-shape-control` | form 的 error-summary-item 部件 border-radius 覆盖槽。 |
| `--xh-form-summary-item-underline-offset` | `error-summary-item` | `text-underline-offset` | `default` | `--xh-space-0_5` | form 的 error-summary-item 部件 text-underline-offset 覆盖槽。 |
| `--xh-form-summary-px` | `error-summary` | `padding-inline` | `default` | `--xh-control-px-md` | form 的 error-summary 部件 padding-inline 覆盖槽。 |
| `--xh-form-summary-py` | `error-summary` | `padding-block` | `default` | `--xh-space-3` | form 的 error-summary 部件 padding-block 覆盖槽。 |
| `--xh-form-summary-radius` | `error-summary` | `border-radius` | `default` | `--xh-shape-surface` | form 的 error-summary 部件 border-radius 覆盖槽。 |
| `--xh-form-summary-shadow` | `error-summary` | `box-shadow` | `default` | `none` | form 的 error-summary 部件 box-shadow 覆盖槽。 |
| `--xh-form-trigger-bg` | `reset-trigger` | `background-color` | `default` | `--xh-_action-variant-bg-rest` | form 的 reset-trigger 部件 background-color 覆盖槽。 |
| `--xh-form-trigger-bg-active` | `reset-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | form 的 reset-trigger 部件 background-color 覆盖槽。 |
| `--xh-form-trigger-bg-disabled` | `reset-trigger`<br>`submit-trigger` | `background-color` | `disabled` | `--xh-_action-variant-bg-disabled` | form 的 reset-trigger、submit-trigger 部件 background-color 覆盖槽。 |
| `--xh-form-trigger-bg-hover` | `reset-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | form 的 reset-trigger 部件 background-color 覆盖槽。 |
| `--xh-form-trigger-border` | `reset-trigger` | `border` | `default` | `--xh-_action-variant-border-rest` | form 的 reset-trigger 部件 border 覆盖槽。 |
| `--xh-form-trigger-border-disabled` | `reset-trigger`<br>`submit-trigger` | `border-color` | `disabled` | `--xh-_action-variant-border-disabled` | form 的 reset-trigger、submit-trigger 部件 border-color 覆盖槽。 |
| `--xh-form-trigger-border-hover` | `reset-trigger` | `border-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-border-hover` | form 的 reset-trigger 部件 border-color 覆盖槽。 |
| `--xh-form-trigger-fg` | `reset-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | form 的 reset-trigger 部件 color 覆盖槽。 |
| `--xh-form-trigger-font-size` | `reset-trigger`<br>`submit-trigger` | `font-size` | `default` | `--xh-text-body-size` | form 的 reset-trigger、submit-trigger 部件 font-size 覆盖槽。 |
| `--xh-form-trigger-h` | `reset-trigger`<br>`submit-trigger` | `block-size` | `default` | `--xh-_action-profile-visual-size` | form 的 reset-trigger、submit-trigger 部件 block-size 覆盖槽。 |
| `--xh-form-trigger-px` | `reset-trigger`<br>`submit-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | form 的 reset-trigger、submit-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-form-trigger-radius` | `reset-trigger`<br>`submit-trigger` | `border-radius` | `default` | `--xh-shape-control` | form 的 reset-trigger、submit-trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

共享关键帧 `xh-drop-in` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`background-color` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤按视口分档：`min-width: 1024px` · `min-width: 1280px` · `min-width: 640px` · `min-width: 768px`。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
