# FormatInput 格式输入

编辑一份格式说明：先选种类，再填这一种的参数，下方即时显示样例效果。值就是 `@xihan-ui/expression` 的 `FormatSpec`，交给 `formatValue` 即可按它输出文字。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/format-input" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/format-input.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/format-input" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/format-input" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/format-input.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

先选种类，再填这一种的参数，下方显示样例；派发的值是一份格式说明，交给格式化即可

<XhDemo src="format-input/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="format-input"`：**`root`** · `label` · **`kind`** · `field-group` · `item` · `item-label` · `pattern-description` · `preview` · `error-text`

## 示例

### 限定种类

kinds 只留数字与百分比；连同「不设格式」不超过三项时，种类改用分段切换

<XhDemo src="format-input/02-kinds" />

### 放进表单字段

字段的标题与说明接到组上；日期模式可从预设里挑，也可以自由输入

<XhDemo src="format-input/03-field" />

### 只读与禁用

只读时里面的控件可聚焦、可复制，不可修改；禁用时整组不可操作

<XhDemo src="format-input/04-states" />

## 设计指引

### 何时使用

- 让用户配置数字、百分比、日期、人民币大写或数字字形的显示格式：报表的列与坐标轴、打印的文本元素、列表列的显示格式。
- 只允许一部分种类时传 `kinds`，例如图表数值只给数字与百分比。

### 何时不用

- 只是挑一个固定的显示样式、没有参数可调：用[下拉选择](./select)。
- 要写一段公式算出值：那是表达式，不是格式。

### 特性

- 种类不超过三项（含「不设格式」）时用分段切换，多了用下拉。
- 换种类时参数留在草稿里：数字与百分比互换时小数位、千分位与舍入照旧，人民币大写沿用舍入，换回来还是上次填的。
- 小数位有三种写法：固定位数、位数范围、不舍入；互换时尽量把数字带过去。
- 输入中途的不完整状态（位数清空、范围下限大于上限、日期模式清空）不派发，根标 `aria-invalid`，行内说明进描述链；改回合法后再派发。派发的值都能通过 `checkFormatSpec`。
- 样例是 `role="status"`：停止输入一会儿后才换文字，连续输入时读屏不反复播报；样例值套不上格式时显示说明。
- 不设格式用 `null`；`value` 为 `undefined` 表示非受控。

### 最佳实践

- 放进字段时用字段的标题给整组命名，不另写标题部件；不放进字段时在根上写 `aria-label`。
- 按字段类型给一个贴切的 `sample`，样例才看得出效果。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-format-input>` |
| Vue 组件 | `XhFormatInputErrorText` `XhFormatInputFieldGroup` `XhFormatInputItem` `XhFormatInputItemLabel` `XhFormatInputKind` `XhFormatInputLabel` `XhFormatInputPatternDescription` `XhFormatInputPreview` `XhFormatInputRoot` |
| 组合式函数 | `useFormatInput` |
| 状态机 | `formatInputMachine` |
| 皮肤 | `@xihan-ui/styles/format-input.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `FormatSpec \| null` |  | 受控的格式说明；null 表示不设格式，undefined 表示非受控。 |
| `defaultValue` | `FormatSpec \| null` |  |  |
| `kinds` | `readonly FormatInputKind[]` |  | 可选的种类，缺省全部；与 checkFormatSpec 的同名选项一致。 |
| `clearable` | `boolean` |  | 种类里多一项「不设格式」，选它派发 null；缺省 true。 |
| `datePatterns` | `readonly string[]` |  | 日期模式的预设，缺省 FORMAT_INPUT_DATE_PATTERNS；也可以自由输入。 |
| `sample` | `unknown` |  | 样例的输入值；缺省按种类取。 |
| `locale` | `string` |  | 交给 formatValue，只影响样例。 |
| `timeZone` | `string` |  |  |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `invalid` | `boolean` |  |  |
| `labelled` | `boolean` |  | 作者渲染了 label 部件：根以它为名。 |
| `variant` | `ControlVariant` |  | 视觉轴，传给里面的控件。 |
| `size` | `Size` |  |  |
| `translations` | `Partial<FormatInputTranslations>` |  |  |
| `onValueChange` | `(details: FormatInputValueChangeDetails) => void` |  | 合法的格式说明变了时通知；输入中途不完整时不派发。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `FormatInputValueChangeDetails` | 合法的格式说明变了；detail 为 `{ value: FormatSpec \| null }`。输入中途不完整时不派发 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFormatInputRoot` | `default` | `FormatInputRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhFormatInputItem` | `value` | `FormatInputOption` | 是 | 参数名：decimals-mode、decimals、min-decimals、max-decimals、grouping、rounding、pattern、numeral-style。 |
| `XhFormatInputItemLabel` | `value` | `FormatInputOption \| 'kind'` | 是 | 名字所属的那一行：参数名，或 kind。 |
| `XhFormatInputRoot` | `children` | `SlotChildren<FormatInputRootSlotProps>` |  |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle` · `settling`

**事件**：`KIND.SET` · `DECIMALS_MODE.SET` · `DECIMALS.SET` · `GROUPING.SET` · `ROUNDING.SET` · `PATTERN.SET` · `STYLE.SET` · `VALUE.SYNC` · `after.announce`

**判据**：`isEditable`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `FormatSpec \| null` | 当前的格式说明；不设格式时为 null。 |
| `kind` | `FormatInputKind \| null` | 种类；不设格式时为 null。 |
| `draft` | `FormatInputDraft` | 编辑中的草稿。 |
| `issue` | `FormatInputIssueCode \| null` | 草稿不完整、或格式说明不被接受时的问题码。 |
| `issueText` | `string` | 问题的说明文字；没有问题时为空串。 |
| `previewText` | `string` | 样例文字（已带「示例：」前缀）；没有格式时为空串。 |
| `options` | `readonly FormatInputOption[]` | 当前种类用得到的参数行，次序即排布次序。 |
| `kindItems` | `readonly { value: FormatInputKindOption, label: string }[]` | 种类下拉的条目：按 kinds 次序，clearable 时最前面是「不设格式」。 |
| `kindControl` | `'toggle-group' \| 'select'` | 种类控件用分段切换（条目不超过三项）还是下拉。 |
| `setKind` | `(kind: FormatInputKind \| null) => void` |  |
| `setDecimalsMode` | `(mode: FormatInputDecimalsMode) => void` |  |
| `setDecimals` | `(field: FormatInputDecimalsField, text: string) => void` | 改一个小数位输入框的文字；空串表示清空，非整数或越界时草稿不完整。 |
| `setGrouping` | `(value: boolean) => void` |  |
| `setRounding` | `(value: FormatRounding) => void` |  |
| `setPattern` | `(value: string) => void` |  |
| `setNumeralStyle` | `(value: NumeralStyle) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getKindProps` | `() => T['element']` |  |
| `getFieldGroupProps` | `() => T['element']` |  |
| `getItemProps` | `(option: FormatInputOption) => T['element']` |  |
| `getItemLabelProps` | `(option: FormatInputOption \| 'kind') => T['element']` | 参数行（含种类）的名字。 |
| `getPatternDescriptionProps` | `() => T['element']` |  |
| `getPreviewProps` | `() => T['element']` |  |
| `getErrorTextProps` | `() => T['element']` |  |
| `getKindToggleGroupProps` | `() => Partial<StructureInstanceProps['toggle-group']>` | 种类控件的 props，交给组合节点：kindControl 为 toggle-group 时用前者（外包是 fieldset，名字在 legend），否则用后者（标题由下拉自己铺）。 |
| `getKindSelectProps` | `() => Partial<StructureInstanceProps['select']>` |  |
| `getDecimalsModeControlProps` | `() => Partial<StructureInstanceProps['toggle-group']>` |  |
| `getDecimalsControlProps` | `(field: FormatInputDecimalsField) => Partial<StructureInstanceProps['number-field']>` |  |
| `getGroupingControlProps` | `() => Partial<StructureInstanceProps['switch']>` |  |
| `getRoundingControlProps` | `() => Partial<StructureInstanceProps['select']>` |  |
| `getPatternControlProps` | `() => Partial<StructureInstanceProps['combobox']>` |  |
| `getNumeralStyleControlProps` | `() => Partial<StructureInstanceProps['select']>` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus in root | 按种类、参数行的次序经过里面的控件；样例与行内说明不可聚焦；种类一换，参数行随之换，焦点留在种类控件上 |
| `ArrowUp` / `ArrowDown` / `Enter` / `Space` | focus in a control | 交给里面的下拉、分段切换、数字框、开关与组合框各自的键盘行为 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-describedby` | undefined \| `error-text` 部件的 id |
| `root` | `aria-invalid` | 'true' \| undefined |
| `root` | `aria-labelledby` | `label` 部件的 id \| undefined |
| `root` | `role` | 'group' |
| `preview` | `aria-live` | 'polite' |
| `preview` | `role` | 'status' |

## 样式参考

### 皮肤

`@xihan-ui/styles/format-input.css` 按 `[data-scope="format-input"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-format-input` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-kind` | draft.kind |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-variant` | props.variant |
| `item` | `data-value` | option |
| `item-label` | `data-value` | option |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-format-input-error-fg` | `error-text` | `color` | `default` | `--xh-fg-danger` | format-input 的 error-text 部件 color 覆盖槽。 |
| `--xh-format-input-error-font-size` | `error-text` | `font-size` | `default` | `--xh-text-secondary-size` | format-input 的 error-text 部件 font-size 覆盖槽。 |
| `--xh-format-input-field-group-col-w` | `field-group` | `grid-template-columns` | `default` | `--xh-layout-col-min-sm` | format-input 的 field-group 部件 grid-template-columns 覆盖槽。 |
| `--xh-format-input-field-group-gap` | `field-group` | `gap` | `default` | `--xh-space-3` | format-input 的 field-group 部件 gap 覆盖槽。 |
| `--xh-format-input-gap` | `root` | `gap` | `default` | `--xh-space-4` | format-input 的 root 部件 gap 覆盖槽。 |
| `--xh-format-input-item-gap` | `item` | `gap` | `value=grouping` | `--xh-space-3` | format-input 的 item 部件 gap 覆盖槽。 |
| `--xh-format-input-item-label-fg` | `item-label` | `color` | `default` | `--xh-fg-muted` | format-input 的 item-label 部件 color 覆盖槽。 |
| `--xh-format-input-item-label-font-size` | `item-label` | `font-size` | `default` | `--xh-text-label-size` | format-input 的 item-label 部件 font-size 覆盖槽。 |
| `--xh-format-input-item-label-font-weight` | `item-label` | `font-weight` | `default` | `--xh-text-label-weight` | format-input 的 item-label 部件 font-weight 覆盖槽。 |
| `--xh-format-input-item-label-gap` | `item-label` | `margin-block-end` | `where(legend)` | `--xh-space-2` | format-input 的 item-label 部件 margin-block-end 覆盖槽。 |
| `--xh-format-input-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | format-input 的 label 部件 color 覆盖槽。 |
| `--xh-format-input-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | format-input 的 label 部件 font-size 覆盖槽。 |
| `--xh-format-input-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | format-input 的 label 部件 font-weight 覆盖槽。 |
| `--xh-format-input-pattern-description-fg` | `pattern-description` | `color` | `default` | `--xh-fg-muted` | format-input 的 pattern-description 部件 color 覆盖槽。 |
| `--xh-format-input-pattern-description-font-size` | `pattern-description` | `font-size` | `default` | `--xh-text-secondary-size` | format-input 的 pattern-description 部件 font-size 覆盖槽。 |
| `--xh-format-input-preview-fg` | `preview` | `color` | `default` | `--xh-fg-muted` | format-input 的 preview 部件 color 覆盖槽。 |
| `--xh-format-input-preview-font-size` | `preview` | `font-size` | `default` | `--xh-text-body-size` | format-input 的 preview 部件 font-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。
