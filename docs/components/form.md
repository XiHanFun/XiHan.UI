# 表单 <Badge type="info" text="form" />

一整张表的值、校验与提交：字段各自录入，表单负责汇总、校验和拦下不合格的提交。

## 何时使用

- 多个字段需要一起提交，且存在跨字段规则。
- 需要统一的校验时机与错误汇总。

## 何时不用

- 只有一两个立即生效的开关：直接改，别包表单。
- 只是要一格标签加控件：用[表单字段](./field)。

## 特性

- `validateOn` 决定何时校验：输入时、失焦时还是提交时。
- 支持异步校验、跨字段规则与手动触发入口。
- 嵌套模型走路径字段名，字段值表与业务模型形状一致。
- 错误汇总（`error-summary`）把所有错误列在一处，每条都能点回对应字段。
- "提醒但不拦下"是一档独立行为：警告级的问题不阻断提交。

## 示例

### 基础用法

默认只在提交时整表校验：过了发 submit，没过发 invalid、摘要显形并把焦点送到第一个出错的字段

<XhDemo src="form/01-basic" />

### 校验时机

blur 与 change 两种模式下 validate 仍整表跑（校验可能带跨字段规则），但只把当事字段那一条写回错误表

<XhDemo src="form/02-validate-on" />

### 受控值表

传了 values 就由宿主说了算：组件内部不再落值，只发变更通知；页面别处也能直接改这张表

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

validate 拿到的是整张值表，可以写两个字段互相约束的规则；setFieldError 与 clearErrors 随时能单独动一条

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

rules 按字段声明 required/min/max/pattern/type，一个字段多条规则首败即停；文案取 rule.message，再退 validateMessages 模板（{name}/{min}/{max} 现场代入）。组里的字段自取校验态：invalid 与必填星号都不用手接

<XhDemo src="form/12-rules" />

### 排布

layout 三档：vertical 竖排（默认）、horizontal 标签左置两列（labelWidth 统一列宽、labelAlign 换对齐缘）、inline 横排一行流；整表标签对齐一个开关搞定，不必逐字段写栅格

<XhDemo src="form/13-layout" />

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
| `layout` | `FormLayout` |  | 排布，默认 vertical。 |
| `labelWidth` | `number \| string` |  | horizontal 下标签列宽（number 视作 px），整表统一、字段据此对齐。 |
| `labelAlign` | `'start' \| 'end'` |  | horizontal 下标签文字的对齐缘，默认 end（贴着控件）。 |
| `disabled` | `boolean` |  | 整个表单禁用：提交、重置、写值一概不发生，两颗按钮带原生 disabled。 |
| `readOnly` | `boolean` |  | 只读：写值与重置不发生，但仍可提交。 |
| `onValuesChange` | `(details: FormValuesChangeDetails) => void` |  | 值表变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onErrorsChange` | `(details: FormErrorsChangeDetails) => void` |  | 错误表变化意图回调；受控时是唯一出口。 |
| `onSubmit` | `(details: FormSubmitDetails) => void` |  | 校验通过才调。 |
| `onInvalid` | `(details: FormInvalidDetails) => void` |  | 校验不通过时调，带上拦下来的整张错误表。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `values-change` | `FormValuesChangeDetails` | 值表变化；detail 为 `{ values }` |
| `errors-change` | `FormErrorsChangeDetails` | 错误表变化；detail 为 `{ errors }` |
| `submit` | `FormSubmitDetails` | 校验通过才派发；detail 为 `{ values }` |
| `invalid` | `FormInvalidDetails` | 校验不通过时派发；detail 为 `{ errors, values }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFormErrorSummary` | `default` | `FormErrorSummarySlotProps` |  |
| `XhFormErrorSummaryItem` | `default` | `FormErrorSummaryItemSlotProps` |  |
| `XhFormFieldGroup` | `default` | `FormFieldGroupSlotProps` |  |
| `XhFormRoot` | `default` | `FormRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'invalid' \| 'idle' |
| `error-summary` | 'invalid' \| 'idle' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

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
| `layout` | `FormLayout` | 当下的排布档。 |
| `getFieldId` | `(name: string) => string` | 字段容器的 DOM id；错误摘要的链接指向它。 |
| `getFieldValue` | `(name: string) => unknown` |  |
| `getFieldError` | `(name: string) => string \| undefined` | 该字段此刻的错误文案；没错时为 undefined。 |
| `isFieldInvalid` | `(name: string) => boolean` |  |
| `isFieldRequired` | `(name: string) => boolean` | 该字段的规则里声明了 required：字段的必填标记从这里推。 |
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

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `error-summary` | `role` | 'alert' |

## 样式

默认皮肤 `@xihan-ui/styles/form.css` 按部件选择：`[data-scope="form"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-label-align` | props.labelAlign |
| `root` | `data-layout` | props.layout |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-state` | 'invalid' \| 'idle' |
| `field-group` | `data-disabled` | ''（条件成立时才出现） |
| `field-group` | `data-invalid` | ''（条件成立时才出现） |
| `field-group` | `data-readonly` | ''（条件成立时才出现） |
| `error-summary` | `data-count` | String(errorCount) |
| `error-summary` | `data-state` | 'invalid' \| 'idle' |
| `error-summary-item` | `data-invalid` | ''（条件成立时才出现） |
| `submit-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `reset-trigger` | `data-disabled` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-form-field-gap` · `--xh-form-field-invalid-border` · `--xh-form-field-invalid-px` · `--xh-form-gap` · `--xh-form-inline-gap` · `--xh-form-submit-bg` · `--xh-form-submit-bg-active` · `--xh-form-submit-bg-hover` · `--xh-form-submit-border` · `--xh-form-submit-border-active` · `--xh-form-submit-border-hover` · `--xh-form-submit-fg` · `--xh-form-submit-shadow` · `--xh-form-summary-bg` · `--xh-form-summary-border` · `--xh-form-summary-fg` · `--xh-form-summary-font-size` · `--xh-form-summary-gap` · `--xh-form-summary-item-fg-hover` · `--xh-form-summary-item-font-size` · `--xh-form-summary-item-underline-offset` · `--xh-form-summary-px` · `--xh-form-summary-py` · `--xh-form-summary-radius` · `--xh-form-summary-shadow` · `--xh-form-trigger-bg` · `--xh-form-trigger-bg-active` · `--xh-form-trigger-bg-disabled` · `--xh-form-trigger-bg-hover` · `--xh-form-trigger-border` · `--xh-form-trigger-border-disabled` · `--xh-form-trigger-border-hover` · `--xh-form-trigger-fg` · `--xh-form-trigger-font-size` · `--xh-form-trigger-h` · `--xh-form-trigger-px` · `--xh-form-trigger-radius`

## 动效

关键帧 `xh-form-summary-enter` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 每格用[表单字段](./field)；分步表单与[步骤条](./steps)配合；行数可变的段落用[动态录入](./dynamic-input)。

## 最佳实践

- 首次校验放在失焦而不是输入时：边打字边报红会让用户觉得自己一直在犯错。
- 提交失败后把焦点移到错误汇总或第一个出错字段。

## 反模式

- 提交按钮长期禁用直到全部合法：用户不知道还差什么。让他按下去，然后告诉他哪里不对。
- 校验规则只写在前端。
