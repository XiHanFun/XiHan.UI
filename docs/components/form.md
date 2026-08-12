# 表单 <Badge type="info" text="form" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

默认只在提交时整表校验：过了发 submit，没过发 invalid、摘要显形并把焦点送到第一个出错的字段

<XhDemo src="form/01-basic" />

### 校验时机

blur 与 change 两种模式下 validate 仍整表跑（校验可能带跨字段规则），但只把当事字段那一条写回错误表

<XhDemo src="form/02-validate-on" />

### 受控值表

传了 values 就由宿主说了算：组件内部不再落值，只发 update:values；页面别处也能直接改这张表

<XhDemo src="form/03-controlled" />

### 禁用与只读

disabled 把提交、重置、写值三条路一起封死；read-only 只封写值与重置，提交照发

<XhDemo src="form/04-disabled" />

### 动态字段

字段容器随数组增删，值表的键跟着字段名走；校验只遍历当下这几行，删掉的行不再参与

<XhDemo src="form/05-dynamic" />

### 异步校验

规则里的 validator 直接返回 Promise：提交时机器等它回来再放行或拦下，期间 validating 置真可用来标忙

<XhDemo src="form/06-async" />

### 跨字段规则与手动入口

validate 拿到的是整张值表，可以写两个字段互相约束的规则；插槽里的 setFieldError 与 clearErrors 随时能单独动一条

<XhDemo src="form/07-manual" />

### 提醒但不拦下

可疑的值只在描述里提醒一句，不写进错误表：控件的 aria-invalid 仍是 false，提交照样放行

<XhDemo src="form/08-warning" />

### 分步校验

校验函数每次提交现读一次：闭住当前这一步，提交就只校验这一步的字段；存草稿走的是普通按钮，一条规则都不跑

<XhDemo src="form/09-steps" />

### 嵌套模型与路径字段名

字段名直接写成路径，值仍住在宿主自己的嵌套对象里：表单只管错误、id 与摘要跳转，提交时不用把扁平表折回去

<XhDemo src="form/10-nested" />

### 重置回默认值

复合控件的值攥在组件里，原生重置只还原原生控件——它们各自认这条事件，一起回到 defaultValue

<XhDemo src="form/11-reset" />

### 声明式规则

rules 按字段声明 required/min/max/pattern/type，一个字段多条规则首败即停；文案取 rule.message，再退 validateMessages 模板（{name}/{min}/{max} 现场代入）

<XhDemo src="form/12-rules" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-form>` |
| Vue 组件 | `XhFormErrorSummary` `XhFormErrorSummaryItem` `XhFormFieldGroup` `XhFormResetTrigger` `XhFormRoot` `XhFormSubmitTrigger` |
| 组合式函数 | `useForm` |
| 状态机 | `formMachine` |
| 皮肤 | `@xihan-ui/styles/form.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="form"`：**`root`** · `field-group` · `error-summary` · `error-summary-item` · `submit-trigger` · `reset-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `values` | `FormValues` |  | 受控值表；给定即受控：cell 直读 prop，写只发 onValuesChange 不落内部值。 |
| `defaultValues` | `FormValues` |  | 非受控初值，同时也是 reset 的落点。 |
| `errors` | `FormErrorPatch` |  | 受控错误表；给定即受控。空串会被清理掉（空串不是一条错误）。 |
| `defaultErrors` | `FormErrorPatch` |  |  |
| `validate` | `(values: FormValues) => FormErrorPatch \| Promise<FormErrorPatch>` |  | 校验函数。返回「字段名 → 错误文案」，没错的字段给空串或干脆不写； 允许返回 Promise（远程校验），期间 validating 置真。 与 rules 并用时同字段两边都报错按 rules 的文案算。 |
| `rules` | `FormRules` |  | 声明式校验规则：字段名 → 一条或一组规则，与 validate 可并用。 |
| `validateMessages` | `FormValidateMessages` |  | 规则文案模板，{name}/{min}/{max} 现场代入；缺省用内置英文模板。 |
| `validateOn` | `FormValidateOn` |  | 校验时机，默认 submit。 |
| `disabled` | `boolean` |  | 整个表单禁用：提交、重置、写值一概不发生，两颗按钮带原生 disabled。 |
| `readOnly` | `boolean` |  | 只读：写值与重置不发生，但仍可提交。 |
| `onValuesChange` | `(details: FormValuesChangeDetails) => void` |  | 值表变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onErrorsChange` | `(details: FormErrorsChangeDetails) => void` |  | 错误表变化意图回调；受控时是唯一出口。 |
| `onSubmit` | `(details: FormSubmitDetails) => void` |  | 校验通过才调。 |
| `onInvalid` | `(details: FormInvalidDetails) => void` |  | 校验不通过时调，带上拦下来的整张错误表。 |

## 状态机

**状态**：`idle` · `invalid`

**事件**：`SUBMIT` · `RESET` · `VALIDATION.PASS` · `VALIDATION.FAIL` · `FIELD.SET` · `FIELD.BLUR` · `ERROR.SET` · `ERRORS.CLEAR` · `ERROR.FOCUS`

**判据**：`isEnabled` · `isEditable`

## connect API

`useForm` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `values` | `FormValues` | 当下的值表。 |
| `errors` | `FormErrors` | 当下的错误表（已清理）。 |
| `errorNames` | `string[]` | 出错的字段名，插入顺序。 |
| `errorCount` | `number` |  |
| `invalid` | `boolean` | 错误表非空。与"提交失败过"无关，挂载时作者塞进来的错误也算。 |
| `submitFailed` | `boolean` | 上一次提交被拦下了：错误摘要据此显形。 |
| `validating` | `boolean` | 异步校验进行中（提交或逐字段都算）。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `validateOn` | `FormValidateOn` |  |
| `getFieldId` | `(name: string) => string` | 字段容器的 DOM id；错误摘要的链接指向它。 |
| `getFieldValue` | `(name: string) => unknown` |  |
| `getFieldError` | `(name: string) => string \| undefined` | 该字段此刻的错误文案；没错时为 undefined。 |
| `isFieldInvalid` | `(name: string) => boolean` |  |
| `setFieldValue` | `(name: string, value: unknown) => void` | 写一个字段的值；禁用或只读时不动。 |
| `setFieldError` | `(name: string, message?: string) => void` | 写一个字段的错误；不给文案（或给空串）即清掉这一条。 |
| `clearErrors` | `() => void` |  |
| `submit` | `() => void` | 走完整的校验与提交流程，与用户按提交键同一条路。 |
| `reset` | `() => void` | 值与错误都回到初始；禁用或只读时不动。 |
| `getRootProps` | `() => T['element']` |  |
| `getFieldGroupProps` | `(props: FormFieldGroupProps) => T['element']` |  |
| `getErrorSummaryProps` | `() => T['element']` |  |
| `getErrorSummaryItemProps` | `(props: FormErrorSummaryItemProps) => T['element']` |  |
| `getSubmitTriggerProps` | `() => T['button']` |  |
| `getResetTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
