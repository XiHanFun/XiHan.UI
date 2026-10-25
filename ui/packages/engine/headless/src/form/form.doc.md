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
- 必填按空值判定：`undefined`、`null`、只含空白的字符串（含不换行空格与全角空格）、空数组与元素全为空的数组算空，`false` 与 `0` 不算空。「必须勾选同意」这类要求写 `validator`，判断值是否为 `true`。
- `min` / `max` 对字符串按字素计数：组合 emoji、国旗、带变音符的字母各算一个字，与[文本框](./text-field)的计数和 `maxLength` 同一口径，`@xihan-ui/headless` 导出的 `graphemeLength` 就是这把尺子；数组按元素个数，数值比较大小。数据库按列长限制时（如 PostgreSQL 的 `varchar(n)` 按码点计），后端仍要自己校验长度；.NET 端用 `StringInfo.LengthInTextElements` 得到同样的字数。
- 正则以字符串保存时（模板、服务端下发的规则），用 `compileFormPattern(source, { flags?, fullMatch?, maxLength? })` 编译成 `pattern` 所需的 `RegExp`：标志缺省只允许 `imsu`，源码缺省不超过 1000 个字符，失败时返回原因而不抛异常，`fullMatch` 包成整串匹配。它只检查语法，不判断回溯开销，来自不受信方的正则仍要在服务端限时执行。
- 字段值、错误和校验状态均可受控。
- 录入控件放进字段组即按字段名读写值表：控件自己没给值（`value`，开关与复选框是 `checked`，文件上传是 `files`）时，初值取 `defaultValues`（字段有值时控件自己的 `defaultValue` 等初值不生效），改动写回表单，表单重置或 `setFieldValue` 改了这个字段，控件跟着变；禁用、只读、必填与错误态照旧由表单下传。控件自己给了值就一概不接，作用域插槽里的 `value` / `setValue` 手动接法照旧可用。组里有几个控件就都接同一个字段（滑块配一个数字框显示同一个值）；组件内部借来的子控件（颜色选择器里的滑块、分页里的每页条数下拉）与字段边界后面的实例不接。
- 值表变化来自某个字段组的行变更时，`onValuesChange`（事件名 `values-change`）的载荷另带 `arrayMutation: { name, mutation }`：是哪一个字段组、哪一种行变更，与字段组的 `value-change` 同一份。
- 错误汇总可跳转到对应字段。
- 支持纵向、横向、行内和网格布局。
- 嵌套字段与字段数组使用显式 `FormPath`。
- 值类型：根组件按 `defaultValues`（或 `values`）推断整表的值类型，`rules` 与 `validate` 交回的键只能写它的字段，`onSubmit` 拿到的 `values` 与 `setFieldValue(name, value)` 的值都按字段收窄，字段名拼错编译即报错。字段组推断不到根上的值类型：`const { FieldGroup, ErrorSummaryItem } = defineFormFields<SignUp>()`（Vue、React）拿到的就是字段组与错误摘要条目本身，只在类型上收窄，`name` 只能写字段（数组路径逐段检查），插槽里的 `value` 是那个字段的类型。Web Components 写 `querySelector<XhFormElement<SignUp>>('xh-form')`。
- `schema` 收 Standard Schema：zod、valibot、arktype 的 schema 直接交进去，组件只依赖接口、不引入任何校验库。交给它的是嵌套对象（数组路径的字段按段写回原位），它报的问题按 `path` 落到字段上，同一字段只留第一条，没有路径的记在空字段名 `''` 下；同一字段几边都报错时 `rules` 优先、`validate` 其次、`schema` 最后。schema 转换后的输出不用，`onSubmit` 交出的仍是表单的值。
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
