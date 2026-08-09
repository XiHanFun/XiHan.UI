# 数据录入

承载值的组件。取值一律走「受控优先」：传了 `value` 就以外部为准，只传 `defaultValue` 则由组件自持，两者都不传时值为空。变更统一经 `onValueChange` 这类回调回传。

本页 26 个组件：表单字段（`field`）、表单（`form`）、文本输入（`text-field`）、数字输入（`number-field`）、分格输入（`pin-input`）、就地编辑（`editable`）、复选框（`checkbox`）、复选框组（`checkbox-group`）、单选组（`radio-group`）、开关（`switch`）、滑块（`slider`）、评分（`rating`）、选择器（`select`）、列表框（`listbox`）、组合框（`combobox`）、级联选择（`cascader`）、树选择（`tree-select`）、标签输入（`tags-input`）、穿梭框（`transfer`）、日期输入（`date-field`）、日期选择器（`date-picker`）、时间输入（`time-field`）、时间选择器（`time-picker`）、日历（`calendar`）、颜色选择器（`color-picker`）、文件上传（`file-upload`）。

每个组件三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。部件（part）名即 `data-part` 属性值，也是皮肤的选择器；加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

---

## 表单字段 <Badge type="info" text="field" /> {#field}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-field>` |
| Vue 组件 | `XhFieldControl` `XhFieldDescription` `XhFieldErrorText` `XhFieldLabel` `XhFieldRoot` |
| 组合式函数 | `useField` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styled/field.css` |

**解剖**（`data-scope="field"`，加粗为必备部件）

**`root`** · `label` · **`control`** · `description` · `error-text`

**键盘**（规格出处：[W3C APG · names-and-descriptions 实践](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)）

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

---

## 表单 <Badge type="info" text="form" /> {#form}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-form>` |
| Vue 组件 | `XhFormErrorSummary` `XhFormErrorSummaryItem` `XhFormFieldGroup` `XhFormResetTrigger` `XhFormRoot` `XhFormSubmitTrigger` |
| 组合式函数 | `useForm` |
| 状态机 | `formMachine` |
| 皮肤 | `@xihan-ui/styled/form.css` |

**解剖**（`data-scope="form"`，加粗为必备部件）

**`root`** · `field-group` · `error-summary` · `error-summary-item` · `submit-trigger` · `reset-trigger`

**键盘**（规格出处：[HTML 标准](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission)）

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

---

## 文本输入 <Badge type="info" text="text-field" /> {#text-field}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-text-field>` |
| Vue 组件 | `XhTextFieldClearTrigger` `XhTextFieldInput` `XhTextFieldLabel` `XhTextFieldRoot` |
| 组合式函数 | `useTextField` |
| 状态机 | `textFieldMachine` |
| 皮肤 | `@xihan-ui/styled/text-field.css` |

**解剖**（`data-scope="text-field"`，加粗为必备部件）

**`root`** · `label` · **`input`** · `clear-trigger`

**键盘**（规格出处：[HTML 标准](https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search))）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Escape` | focus in input, clearable 且值非空, not disabled/readOnly | 清空值；三个条件缺一即不接管该键，交回给外层与浏览器 |

---

## 数字输入 <Badge type="info" text="number-field" /> {#number-field}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-number-field>` |
| Vue 组件 | `XhNumberFieldDecrementTrigger` `XhNumberFieldIncrementTrigger` `XhNumberFieldInput` `XhNumberFieldLabel` `XhNumberFieldRoot` |
| 组合式函数 | `useNumberField` |
| 状态机 | `numberFieldMachine` |
| 皮肤 | `@xihan-ui/styled/number-field.css` |

**解剖**（`data-scope="number-field"`，加粗为必备部件）

**`root`** · `label` · **`input`** · `increment-trigger` · `decrement-trigger`

**键盘**（规格出处：[W3C APG · spinbutton 模式](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowUp` | focus in input, not disabled/readOnly | 按 step 递增，越界则停在 max |
| `ArrowDown` | focus in input, not disabled/readOnly | 按 step 递减，越界则停在 min |
| `PageUp` | focus in input, not disabled/readOnly | 按 largeStep 递增（默认 10 倍 step） |
| `PageDown` | focus in input, not disabled/readOnly | 按 largeStep 递减 |
| `Home` | focus in input, 指定了 min | 取 min；未指定 min 时不动 |
| `End` | focus in input, 指定了 max | 取 max；未指定 max 时不动 |

---

## 分格输入 <Badge type="info" text="pin-input" /> {#pin-input}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-pin-input>` |
| Vue 组件 | `XhPinInputHiddenInput` `XhPinInputInput` `XhPinInputLabel` `XhPinInputRoot` |
| 组合式函数 | `usePinInput` |
| 状态机 | `pinInputMachine` |
| 皮肤 | `@xihan-ui/styled/pin-input.css` |

**解剖**（`data-scope="pin-input"`，加粗为必备部件）

**`root`** · `label` · **`input`** · `hidden-input`

**键盘**（规格出处：[W3C APG · spinbutton 模式](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#textbox)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` | focus in a box, not disabled | 焦点移到下一格；已在末格则不动，不回绕 |
| `ArrowLeft` | focus in a box, not disabled | 焦点移到上一格；已在首格则不动，不回绕 |
| `Home` | focus in a box, not disabled | 焦点移到首格 |
| `End` | focus in a box, not disabled | 焦点移到末格 |
| `Backspace` | focus in a box, not disabled | 本格有值则清本格；本格为空则退回上一格并清掉上一格 |
| `Delete` | focus in a box, not disabled | 清掉本格，焦点不动 |

---

## 就地编辑 <Badge type="info" text="editable" /> {#editable}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-editable>` |
| Vue 组件 | `XhEditableArea` `XhEditableCancelTrigger` `XhEditableControl` `XhEditableEditTrigger` `XhEditableInput` `XhEditableLabel` `XhEditablePreview` `XhEditableRoot` `XhEditableSubmitTrigger` |
| 组合式函数 | `useEditable` |
| 状态机 | `editableMachine` |
| 皮肤 | `@xihan-ui/styled/editable.css` |

**解剖**（`data-scope="editable"`，加粗为必备部件）

**`root`** · `label` · `area` · **`preview`** · **`input`** · `edit-trigger` · `submit-trigger` · `cancel-trigger` · `control`

**键盘**（规格出处：[HTML 标准](https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search))）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | focus in input, submitMode 为 enter 或 both | 提交当下的值并回到预览态；其余模式不接管该键，交回给浏览器与外层表单 |
| `Escape` | focus in input | 撤销回上一次提交的值并回到预览态 |
| `Tab` / `Shift+Tab` | focus in input | 按 submitMode 收尾（blur/both 提交，enter/none 撤销）；不拦默认行为，焦点照常移出 |

---

## 复选框 <Badge type="info" text="checkbox" /> {#checkbox}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-checkbox>` |
| Vue 组件 | `XhCheckbox` |
| 组合式函数 | `useCheckbox` |
| 状态机 | `checkboxMachine` |
| 皮肤 | `@xihan-ui/styled/checkbox.css` |

**解剖**（`data-scope="checkbox"`，加粗为必备部件）

**`root`** · `indicator`

**键盘**（规格出处：[W3C APG · checkbox 模式](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in root, not disabled | 切换 checked 状态 |

---

## 复选框组 <Badge type="info" text="checkbox-group" /> {#checkbox-group}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-checkbox-group>` |
| Vue 组件 | `XhCheckboxGroupItem` `XhCheckboxGroupItemControl` `XhCheckboxGroupItemText` `XhCheckboxGroupLabel` `XhCheckboxGroupRoot` `XhCheckboxGroupTrigger` |
| 组合式函数 | `useCheckboxGroup` |
| 状态机 | `checkboxGroupMachine` |
| 皮肤 | `@xihan-ui/styled/checkbox-group.css` |

**解剖**（`data-scope="checkbox-group"`，加粗为必备部件）

**`root`** · `label` · **`item`** · `item-control` · `item-text` · `item-hidden-input` · `trigger`

**键盘**（规格出处：[W3C APG · checkbox 模式](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus enters or leaves the group | 组内有几个条目就有几个 Tab 停靠点（禁用条目也留一个），容器自己不占位；单选组的"整组一个停靠点"在这里不成立 |
| `Space` | focus on item, group editable and item not disabled | 翻转该条目的选中态；改不动时放行按键给页面滚动 |
| `Space` | focus on trigger, group editable | 可用条目未全选则一并勾上，已全选则一并取消；禁用条目不受影响 |

---

## 单选组 <Badge type="info" text="radio-group" /> {#radio-group}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-radio-group>` |
| Vue 组件 | `XhRadioGroupItem` `XhRadioGroupItemText` `XhRadioGroupLabel` `XhRadioGroupRoot` |
| 组合式函数 | `useRadioGroup` |
| 状态机 | `radioGroupMachine` |
| 皮肤 | `@xihan-ui/styled/radio-group.css` |

**解剖**（`data-scope="radio-group"`，加粗为必备部件）

`root` · `label` · **`item`** · `item-text` · `indicator` · `hidden-input`

**键盘**（规格出处：[W3C APG · radio 模式](https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the group | 整组只占一个 Tab 位：焦点进入锚点条目，无锚点时进入容器 |
| `ArrowDown` / `ArrowRight` | focus in group, group not disabled | 焦点移到下一个可停留条目并选中，末项回绕到首项；dir=rtl 时改由 ArrowLeft 承担 |
| `ArrowUp` / `ArrowLeft` | focus in group, group not disabled | 焦点移到上一个可停留条目并选中，首项回绕到末项；dir=rtl 时改由 ArrowRight 承担 |
| `Space` | focus on item, item not disabled | 选中当前条目 |

---

## 开关 <Badge type="info" text="switch" /> {#switch}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-switch>` |
| Vue 组件 | `XhSwitch` |
| 组合式函数 | `useSwitch` |
| 状态机 | `switchMachine` |
| 皮肤 | `@xihan-ui/styled/switch.css` |

**解剖**（`data-scope="switch"`，加粗为必备部件）

**`root`** · `thumb`

**键盘**（规格出处：[W3C APG · switch 模式](https://www.w3.org/WAI/ARIA/apg/patterns/switch/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in root, not disabled | 切换 checked 状态 |

---

## 滑块 <Badge type="info" text="slider" /> {#slider}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-slider>` |
| Vue 组件 | `XhSliderControl` `XhSliderHiddenInput` `XhSliderLabel` `XhSliderRange` `XhSliderRoot` `XhSliderThumb` `XhSliderTrack` |
| 组合式函数 | `useSlider` |
| 状态机 | `sliderMachine` |
| 皮肤 | `@xihan-ui/styled/slider.css` |

**解剖**（`data-scope="slider"`，加粗为必备部件）

**`root`** · `label` · **`control`** · **`track`** · `range` · **`thumb`** · `hidden-input`

**键盘**（规格出处：[W3C APG · slider 模式](https://www.w3.org/WAI/ARIA/apg/patterns/slider/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowUp` | focus in thumb, not disabled/readOnly | 按 step 增大；RTL 与竖直排布下按屏幕方向对调，语义恒是"朝 max 走一格" |
| `ArrowLeft` / `ArrowDown` | focus in thumb, not disabled/readOnly | 按 step 减小，同上对调规则 |
| `PageUp` | focus in thumb, not disabled/readOnly | 按 largeStep 增大（默认 10 倍 step） |
| `PageDown` | focus in thumb, not disabled/readOnly | 按 largeStep 减小 |
| `Home` | focus in thumb, not disabled/readOnly | 取 min；多滑块时取自己被邻居允许的下界 |
| `End` | focus in thumb, not disabled/readOnly | 取 max；多滑块时取自己被邻居允许的上界 |

---

## 评分 <Badge type="info" text="rating" /> {#rating}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-rating>` |
| Vue 组件 | `XhRatingControl` `XhRatingHiddenInput` `XhRatingItem` `XhRatingLabel` `XhRatingRoot` |
| 组合式函数 | `useRating` |
| 状态机 | `ratingMachine` |
| 皮肤 | `@xihan-ui/styled/rating.css` |

**解剖**（`data-scope="rating"`，加粗为必备部件）

**`root`** · `label` · **`control`** · **`item`** · `hidden-input`

**键盘**（规格出处：[W3C APG · radio 模式](https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the control | 整条评分带只占一个 Tab 位：焦点进入锚点那颗星，无锚点时进入容器并由它转投首颗 |
| `ArrowRight` / `ArrowUp` | focus in control, not disabled/readOnly | 加一档（allowHalf 时半颗），到顶停在 count；dir=rtl 时改由 ArrowLeft 承担 |
| `ArrowLeft` / `ArrowDown` | focus in control, not disabled/readOnly | 减一档，到底停在最小档，不会退回"还没评"；dir=rtl 时改由 ArrowRight 承担 |
| `Home` | focus in control, not disabled/readOnly | 取最小档（allowHalf 时是半颗，否则一颗） |
| `End` | focus in control, not disabled/readOnly | 取满分（count） |

---

## 选择器 <Badge type="info" text="select" /> {#select}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-select>` |
| Vue 组件 | `XhSelectContent` `XhSelectIndicator` `XhSelectItem` `XhSelectItemIndicator` `XhSelectItemText` `XhSelectLabel` `XhSelectPositioner` `XhSelectRoot` `XhSelectTrigger` `XhSelectValueText` |
| 组合式函数 | `useSelect` |
| 状态机 | `selectMachine` |
| 皮肤 | `@xihan-ui/styled/select.css` |

**解剖**（`data-scope="select"`，加粗为必备部件）

`root` · `label` · **`trigger`** · `value-text` · `indicator` · `positioner` · **`content`** · **`item`** · `item-text` · `item-indicator` · `hidden-select`

**键盘**（规格出处：[W3C APG · listbox 模式](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | closed, focus in trigger | 展开列表并把高亮落到当前选中项（无选中则落首个可用条目） |
| `ArrowDown` | closed, focus in trigger | 展开列表并把高亮落到选中项的下一个可用条目 |
| `ArrowUp` | closed, focus in trigger | 展开列表并把高亮落到选中项的上一个可用条目 |
| `单个可打印字符` | closed, focus in trigger | 连打检索命中的条目直接成为选中值（多选是加进集合，已在集合里则不动），列表不展开 |
| `ArrowDown` | open, focus in content | 高亮移到下一个条目（禁用项跳过、尽头按 loop 回绕） |
| `ArrowUp` | open, focus in content | 高亮移到上一个条目（禁用项跳过、尽头按 loop 回绕） |
| `Home` | open, focus in content | 高亮移到首个可用条目 |
| `End` | open, focus in content | 高亮移到末个可用条目 |
| `单个可打印字符` | open, focus in content | 连打检索移动高亮，不改选中值 |
| `Enter` / `Space` | open, 单选, 高亮条目未禁用 | 选中高亮条目并关闭列表，焦点归还 trigger |
| `Enter` / `Space` | open, 多选, 高亮条目未禁用 | 切换高亮条目的选中态，列表不收起、焦点留在条目上 |
| `Escape` | open | 关闭列表并把焦点归还 trigger，选中值不变 |
| `Tab` / `Shift+Tab` | open | 关闭列表，焦点不归还 trigger，按 Tab 序列自然离开 |

---

## 列表框 <Badge type="info" text="listbox" /> {#listbox}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-listbox>` |
| Vue 组件 | `XhListboxContent` `XhListboxItem` `XhListboxItemGroup` `XhListboxItemGroupLabel` `XhListboxItemIndicator` `XhListboxItemText` `XhListboxLabel` `XhListboxRoot` |
| 组合式函数 | `useListbox` |
| 状态机 | `listboxMachine` |
| 皮肤 | `@xihan-ui/styled/listbox.css` |

**解剖**（`data-scope="listbox"`，加粗为必备部件）

`root` · `label` · **`content`** · **`item`** · `item-text` · `item-indicator` · `item-group` · `item-group-label`

**键盘**（规格出处：[W3C APG · listbox 模式](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the listbox | 整个列表只占一个 Tab 位：焦点进入锚点条目，无锚点时先落容器再由它转投 |
| `ArrowDown` | focus in listbox, orientation=vertical | 焦点移到下一个可停留条目（禁用项跳过、尽头按 loop 回绕）；orientation=horizontal 时改由 ArrowRight 承担，dir=rtl 再对调左右 |
| `ArrowUp` | focus in listbox, orientation=vertical | 焦点移到上一个可停留条目（禁用项跳过、尽头按 loop 回绕）；orientation=horizontal 时改由 ArrowLeft 承担，dir=rtl 再对调左右 |
| `Home` | focus in listbox | 焦点移到首个可停留条目 |
| `End` | focus in listbox | 焦点移到末个可停留条目 |
| `Enter` / `Space` | focus on item, selectionMode 为 single 或 extended | 只选中焦点条目，替换原有选中；条目自报禁用则不认 |
| `Space` / `Enter` / `Ctrl+Space` | focus on item, 可多选（multiple；extended 下须按住 Ctrl/Cmd） | 切换焦点条目的选中态，其余选中不动 |
| `Shift+ArrowDown` / `Shift+ArrowUp` | focus in listbox, 可多选 | 焦点移到相邻条目并切换它的选中态；往回走即把刚扩进来的那个摘掉 |
| `Ctrl+A` / `Cmd+A` | focus in listbox, 可多选 | 选中全部可选条目；已经全选则把它们一并取消（禁用但已选中的不动） |
| `单个可打印字符` | focus in listbox, typeahead 未关 | 连打检索把焦点移到首字母匹配的条目，不改选中值 |

---

## 组合框 <Badge type="info" text="combobox" /> {#combobox}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-combobox>` |
| Vue 组件 | `XhComboboxClearTrigger` `XhComboboxContent` `XhComboboxControl` `XhComboboxEmpty` `XhComboboxInput` `XhComboboxItem` `XhComboboxItemGroup` `XhComboboxItemGroupLabel` `XhComboboxItemIndicator` `XhComboboxItemText` `XhComboboxLabel` `XhComboboxPositioner` `XhComboboxRoot` `XhComboboxTrigger` |
| 组合式函数 | `useCombobox` |
| 状态机 | `comboboxMachine` |
| 皮肤 | `@xihan-ui/styled/combobox.css` |

**解剖**（`data-scope="combobox"`，加粗为必备部件）

`root` · `label` · **`control`** · **`input`** · `trigger` · `clear-trigger` · `positioner` · **`content`** · `item` · `item-text` · `item-indicator` · `item-group` · `item-group-label` · `empty`

**键盘**（规格出处：[W3C APG · combobox 模式](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowDown` | closed, focus in input | 展开候选列表并把高亮落到首个可选候选 |
| `ArrowUp` | closed, focus in input | 展开候选列表并把高亮落到末个可选候选 |
| `Alt+ArrowDown` | closed, focus in input | 展开候选列表但不预选任何候选 |
| `ArrowDown` | open | 高亮移到下一个候选（禁用项跳过、尽头按 loop 回绕），焦点不动 |
| `ArrowUp` | open | 高亮移到上一个候选（禁用项跳过、尽头按 loop 回绕），焦点不动 |
| `Home` | open | 高亮移到首个可选候选；收起态不接管，光标照常跳到行首 |
| `End` | open | 高亮移到末个可选候选；收起态不接管，光标照常跳到行尾 |
| `Enter` | open, 有高亮且未禁用 | 选中高亮候选：单选把输入串换成它的文本并收起，多选把它并入集合、清空输入串且不收起 |
| `Enter` | open, 无高亮且 allowCustomValue | 把输入串本身收成选中值 |
| `Escape` | open | 先摘掉高亮；高亮已空时才收起列表，选中值不变 |
| `Alt+ArrowUp` | open | 收起列表，选中值不变 |
| `Tab` / `Shift+Tab` | open | 收起列表且不拦按键，焦点按 Tab 序列自然离开 |
| `Backspace` | multiple, 输入串为空且已有选中 | 删掉最后一个已选项 |
| `可打印字符` | focus in input | 改写输入串并展开列表；过滤由调用方按 onInputValueChange 自己做 |

---

## 级联选择 <Badge type="info" text="cascader" /> {#cascader}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-cascader>` |
| Vue 组件 | `XhCascaderClearTrigger` `XhCascaderColumn` `XhCascaderContent` `XhCascaderIndicator` `XhCascaderItem` `XhCascaderItemIndicator` `XhCascaderItemText` `XhCascaderLabel` `XhCascaderPositioner` `XhCascaderRoot` `XhCascaderTrigger` `XhCascaderValueText` |
| 组合式函数 | `useCascader` |
| 状态机 | `cascaderMachine` |
| 皮肤 | `@xihan-ui/styled/cascader.css` |

**解剖**（`data-scope="cascader"`，加粗为必备部件）

`root` · `label` · **`trigger`** · `value-text` · `indicator` · `clear-trigger` · `positioner` · **`content`** · **`column`** · **`item`** · `item-text` · `item-indicator`

**键盘**（规格出处：[W3C APG · combobox 模式](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | closed, focus in trigger | 展开浮层并把焦点落到选中路径的末项（无选中或它已禁用则落该列首个可用条目） |
| `ArrowDown` | closed, focus in trigger | 展开浮层并把焦点落到选中条目在它那一列里的下一个可用条目 |
| `ArrowUp` | closed, focus in trigger | 展开浮层并把焦点落到选中条目在它那一列里的上一个可用条目 |
| `ArrowDown` | open, focus in content | 焦点移到当前列的下一个条目（禁用条目跳过；loop 默认开，末项回绕到首项）；别的列不动 |
| `ArrowUp` | open, focus in content | 焦点移到当前列的上一个条目（禁用条目跳过；loop 默认开，首项回绕到末项） |
| `Home` | open, focus in content | 焦点移到当前列的首个可用条目 |
| `End` | open, focus in content | 焦点移到当前列的末个可用条目 |
| `ArrowRight` | open, 焦点条目有子节点（dir=rtl 时改由 ArrowLeft 承担） | 焦点移进右边那一列的首个可用条目；叶子上什么都不做且不吞键 |
| `ArrowLeft` | open, 焦点不在根列（dir=rtl 时改由 ArrowRight 承担） | 焦点退回上一列的父条目，当前这一列随之收起；根列上什么都不做且不吞键 |
| `Enter` / `Space` | open, 焦点条目未禁用 | 叶子：落值并收起浮层、焦点归还 trigger。分支：展开它的子列且浮层不收起，changeOnSelect 打开时同时落值 |
| `Escape` | open | 收起浮层并把焦点归还 trigger，选中值不变 |
| `Tab` / `Shift+Tab` | open | 收起浮层，焦点不归还 trigger，按 Tab 序列自然离开 |

---

## 树选择 <Badge type="info" text="tree-select" /> {#tree-select}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tree-select>` |
| Vue 组件 | `XhTreeSelectBranch` `XhTreeSelectBranchContent` `XhTreeSelectBranchControl` `XhTreeSelectBranchIndicator` `XhTreeSelectBranchText` `XhTreeSelectBranchTrigger` `XhTreeSelectClearTrigger` `XhTreeSelectContent` `XhTreeSelectHiddenInput` `XhTreeSelectIndicator` `XhTreeSelectItem` `XhTreeSelectItemIndicator` `XhTreeSelectItemText` `XhTreeSelectLabel` `XhTreeSelectPositioner` `XhTreeSelectRoot` `XhTreeSelectTree` `XhTreeSelectTrigger` `XhTreeSelectValueText` |
| 组合式函数 | `useTreeSelect` |
| 状态机 | `treeSelectMachine` |
| 皮肤 | `@xihan-ui/styled/tree-select.css` |

**解剖**（`data-scope="tree-select"`，加粗为必备部件）

`root` · `label` · **`trigger`** · `value-text` · `indicator` · `clear-trigger` · `positioner` · **`content`** · **`tree`** · **`item`** · `item-text` · `item-indicator` · `branch` · `branch-control` · `branch-trigger` · `branch-indicator` · `branch-text` · `branch-content` · `hidden-input`

**键盘**（规格出处：[W3C APG · combobox 模式](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | closed, focus in trigger | 展开浮层并把焦点落到选中节点（无选中或它藏在收起的分支里则落首个可用行） |
| `ArrowDown` | closed, focus in trigger | 展开浮层并把焦点落到选中节点的下一个可用行 |
| `ArrowUp` | closed, focus in trigger | 展开浮层并把焦点落到选中节点的上一个可用行 |
| `ArrowDown` | open, focus in tree | 焦点移到下一个可见行（禁用行跳过；loop 默认关，末行不回绕） |
| `ArrowUp` | open, focus in tree | 焦点移到上一个可见行（禁用行跳过；loop 默认关，首行不回绕） |
| `Home` | open, focus in tree | 焦点移到首个可见行 |
| `End` | open, focus in tree | 焦点移到末个可见行（展开着的子树也算行） |
| `ArrowRight` | open, focus on branch（dir=rtl 时改由 ArrowLeft 承担） | 收起的分支就地展开；已展开则把焦点移到首个子节点；叶子上什么都不做且不吞键 |
| `ArrowLeft` | open, focus in tree（dir=rtl 时改由 ArrowRight 承担） | 展开的分支就地收起；收起的分支与叶子则把焦点移到父节点；根层的行什么都不做 |
| `Enter` / `Space` | open, 焦点节点未禁用 | 选中焦点节点：单选替换并收起浮层、焦点归还 trigger；多选切换且浮层不收起 |
| `*` | open, focus in tree | 展开与焦点行同一父级的全部分支（已展开与禁用的不动）；同级没有可展开的分支时不吞这个键 |
| `单个可打印字符` | open, focus in tree | 连打检索在可见行上按 label 首字母搬焦点，不改选中值，也不展开任何分支 |
| `Escape` | open | 收起浮层并把焦点归还 trigger，选中值与展开集合都不变 |
| `Tab` / `Shift+Tab` | open | 收起浮层，焦点不归还 trigger，按 Tab 序列自然离开 |

---

## 标签输入 <Badge type="info" text="tags-input" /> {#tags-input}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tags-input>` |
| Vue 组件 | `XhTagsInputClearTrigger` `XhTagsInputControl` `XhTagsInputHiddenInput` `XhTagsInputInput` `XhTagsInputItem` `XhTagsInputItemDeleteTrigger` `XhTagsInputItemInput` `XhTagsInputItemPreview` `XhTagsInputItemText` `XhTagsInputLabel` `XhTagsInputRoot` |
| 组合式函数 | `useTagsInput` |
| 状态机 | `tagsInputMachine` |
| 皮肤 | `@xihan-ui/styled/tags-input.css` |

**解剖**（`data-scope="tags-input"`，加粗为必备部件）

**`root`** · `label` · **`control`** · **`input`** · `item` · `item-preview` · `item-text` · `item-delete-trigger` · `item-input` · `clear-trigger` · `hidden-input`

**键盘**（规格出处：[W3C APG · names-and-descriptions 实践](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | focus in input, 框里有能成标签的内容, not disabled/readOnly | 把输入框里的文本变成标签（含 delimiter 时一次进多个）；框里只有空白时不接管，Enter 留给表单提交 |
| `delimiter（默认 ,）` | focus in input, not disabled/readOnly | 断词：分隔符之前的每一段各成一个标签，最后一段留在框里接着打 |
| `Backspace` | 输入框为空且没有标签被高亮, 至少有一个标签 | 高亮最后一个标签（这一下不删任何东西） |
| `Backspace` | 输入框为空且已有标签被高亮 | 删掉高亮的标签，光标落到前一个上；删的是第一个就交回输入框 |
| `Delete` | 已有标签被高亮 | 同上，删掉高亮的标签 |
| `ArrowLeft` | focus in input 且光标贴着最左端（无选区）, 至少有一个标签 | 往左走一格；还没走进标签时从最后一个起步，已经在第一个就停住 |
| `ArrowRight` | 已有标签被高亮 | 往右走一格；走出末尾即交回输入框。光标还在框里时不接管 |
| `Home` | 已有标签被高亮 | 跳到第一个标签 |
| `End` | 已有标签被高亮 | 交回输入框 |
| `Escape` | 已有标签被高亮 | 取消高亮，光标交回输入框；没在标签间走时不接管该键 |
| `Enter` | 已有标签被高亮, editable 开着 | 就地编辑这个标签，焦点进编辑框并整段选中 |
| `Enter` | focus in item-input（就地编辑中） | 提交改写；改成空白等于删掉这个标签，改成另一个已有标签则并成一个。焦点交回输入框 |
| `Escape` | focus in item-input（就地编辑中） | 撤销这次改写，标签保持原样，焦点交回输入框 |

---

## 穿梭框 <Badge type="info" text="transfer" /> {#transfer}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-transfer>` |
| Vue 组件 | `XhTransferItem` `XhTransferItemCheckbox` `XhTransferItemText` `XhTransferList` `XhTransferPanelCount` `XhTransferPanelHeader` `XhTransferPanelTitle` `XhTransferRoot` `XhTransferSearch` `XhTransferSelectAllTrigger` `XhTransferSourcePanel` `XhTransferTargetPanel` `XhTransferToSourceTrigger` `XhTransferToTargetTrigger` |
| 组合式函数 | `useTransfer` |
| 状态机 | `transferMachine` |
| 皮肤 | `@xihan-ui/styled/transfer.css` |

**解剖**（`data-scope="transfer"`，加粗为必备部件）

`root` · **`source-panel`** · **`target-panel`** · `panel-header` · `panel-title` · `panel-count` · `search` · **`list`** · `item` · `item-text` · `item-checkbox` · **`to-target-trigger`** · `to-source-trigger` · `select-all-trigger`

**键盘**（规格出处：[W3C APG · listbox 模式](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside a list | 每一侧列表只占一个 Tab 位：焦点进入该侧锚点条目，无锚点时先落列表容器再由它转投；两个搬运按钮与两个全选格各自另占一位，禁用时自动退出 Tab 序列 |
| `ArrowDown` | focus in a list | 焦点移到本侧下一个可停留条目（禁用项跳过、尽头按 loop 回绕）；不会走到对面那一侧去 |
| `ArrowUp` | focus in a list | 焦点移到本侧上一个可停留条目 |
| `Home` | focus in a list | 焦点移到本侧首个可停留条目 |
| `End` | focus in a list | 焦点移到本侧末个可停留条目 |
| `Space` / `Enter` / `Ctrl+Space` | focus on item, 本侧可勾选 | 切换焦点条目的勾选态，其余勾选不动；条目禁用、或已被搜索藏起来则不认 |
| `Shift+ArrowDown` / `Shift+ArrowUp` | focus in a list, 本侧可勾选 | 焦点移到相邻条目并切换它的勾选态；往回走即把刚扩进来的那个摘掉 |
| `Ctrl+A` / `Cmd+A` | focus in a list, 本侧可勾选 | 勾中本侧全部可操作条目（可见且未禁用）；已经全勾则一并取消 |
| `ArrowRight` / `ArrowLeft` | focus in a list, 该方向指向对面且对面搬得动 | 把本侧勾中的条目搬到对面（dir=rtl 时左右语义对调）；搬完焦点落到目的地那一侧的列表上。方向指向本侧、或此刻搬不动时这个键放行给页面 |
| `Enter` / `Space` | focus on to-target-trigger / to-source-trigger | 把对面勾中的条目搬过来（原生按钮的激活行为）；搬完按钮多半随即变禁用，焦点改落到目的地那一侧的列表上 |
| `Enter` / `Space` | focus on select-all-trigger | 全选/取消全选该侧可操作条目（原生按钮的激活行为）；三态经 aria-checked 上报，半选时是 mixed |

---

## 日期输入 <Badge type="info" text="date-field" /> {#date-field}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-date-field>` |
| Vue 组件 | `XhDateFieldControl` `XhDateFieldHiddenInput` `XhDateFieldLabel` `XhDateFieldRoot` `XhDateFieldSegment` |
| 组合式函数 | `useDateField` |
| 状态机 | `dateFieldMachine` |
| 皮肤 | `@xihan-ui/styled/date-field.css` |

**解剖**（`data-scope="date-field"`，加粗为必备部件）

**`root`** · `label` · **`control`** · **`segment`** · `hidden-input`

**键盘**（规格出处：[W3C APG · spinbutton 模式](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowUp` | focus in a segment, not disabled/readOnly | 本段加一，到区间上界回绕到下界；空段则落到今天的对应位 |
| `ArrowDown` | focus in a segment, not disabled/readOnly | 本段减一，到区间下界回绕到上界；空段则落到今天的对应位 |
| `ArrowRight` | focus in a segment, not disabled | 焦点移到下一段（跳过收起的段）；已在末段则不动，不回绕 |
| `ArrowLeft` | focus in a segment, not disabled | 焦点移到上一段；已在首段则不动，不回绕 |
| `Home` | focus in a segment, not disabled | 焦点移到首段 |
| `End` | focus in a segment, not disabled | 焦点移到末段 |
| `Backspace` | focus in a segment, not disabled/readOnly | 清掉本段，焦点不动；整份值随之变成 null |
| `0` / `1` / `2` / `3` / `4` / `5` / `6` / `7` / `8` / `9` | focus in a segment, not disabled/readOnly | 往本段补一位数字；补满（再补一位必溢出或位数用尽）即自动跳下一段 |

---

## 日期选择器 <Badge type="info" text="date-picker" /> {#date-picker}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-date-picker>` |
| Vue 组件 | `XhDatePickerCalendar` `XhDatePickerCell` `XhDatePickerCellTrigger` `XhDatePickerClearTrigger` `XhDatePickerContent` `XhDatePickerControl` `XhDatePickerGrid` `XhDatePickerGridBody` `XhDatePickerGridHead` `XhDatePickerHeader` `XhDatePickerHeading` `XhDatePickerHiddenInput` `XhDatePickerInput` `XhDatePickerLabel` `XhDatePickerNextTrigger` `XhDatePickerPositioner` `XhDatePickerPrevTrigger` `XhDatePickerRoot` `XhDatePickerSegment` `XhDatePickerTrigger` `XhDatePickerWeekDay` `XhDatePickerWeekRow` |
| 组合式函数 | `useDatePicker` |
| 状态机 | `datePickerMachine` |
| 皮肤 | `@xihan-ui/styled/date-picker.css` |

**解剖**（`data-scope="date-picker"`，加粗为必备部件）

`root` · `label` · **`control`** · `input` · `trigger` · `clear-trigger` · `positioner` · **`content`** · **`calendar`**

**键盘**（规格出处：[W3C APG · dialog-modal 模式](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/#kbd_label)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger, closed | 展开日历浮层，焦点落到当前聚焦日那一格 |
| `Enter` / `Space` | focus in trigger, open | 收起浮层，焦点回到 trigger |
| `Escape` | open | 收起浮层并把焦点还给展开前那个控件（通常是 trigger），选中值不变 |
| `Tab` / `Shift+Tab` | open | 不拦按键：焦点按 Tab 序列自然离开，浮层随即收起且不抢回焦点 |
| `Enter` / `Space` | open, focus in grid | 选中聚焦日（由日历完成）；closeOnSelect 时收起浮层——区间要两端都落定才算选完 |

---

## 时间输入 <Badge type="info" text="time-field" /> {#time-field}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-time-field>` |
| Vue 组件 | `XhTimeFieldControl` `XhTimeFieldHiddenInput` `XhTimeFieldLabel` `XhTimeFieldRoot` `XhTimeFieldSegment` |
| 组合式函数 | `useTimeField` |
| 状态机 | `timeFieldMachine` |
| 皮肤 | `@xihan-ui/styled/time-field.css` |

**解剖**（`data-scope="time-field"`，加粗为必备部件）

**`root`** · `label` · **`control`** · **`segment`** · `hidden-input`

**键盘**（规格出处：[W3C APG · spinbutton 模式](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowUp` | focus in a segment, not disabled/readOnly | 本段加一格，到头回绕；空段落到该段下界 |
| `ArrowDown` | focus in a segment, not disabled/readOnly | 本段减一格，到头回绕；空段落到该段上界 |
| `ArrowRight` | focus in a segment, not disabled | 焦点移到下一段；已在末段则不动，不回绕 |
| `ArrowLeft` | focus in a segment, not disabled | 焦点移到上一段；已在首段则不动，不回绕 |
| `Home` | focus in a segment, not disabled | 焦点移到首段 |
| `End` | focus in a segment, not disabled | 焦点移到末段 |
| `0-9` | focus in a 数字段, not disabled/readOnly | 把数字并进本段；本段再吃不下第二位时自动跳到下一段 |
| `Backspace` / `Delete` | focus in a segment, not disabled/readOnly | 清掉本段；小时被清时上下午段仍保留原来的上午/下午 |
| `a` / `p` | focus in 上下午段, 12 小时制, not disabled/readOnly | a 取上午、p 取下午（不区分大小写） |

---

## 时间选择器 <Badge type="info" text="time-picker" /> {#time-picker}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-time-picker>` |
| Vue 组件 | `XhTimePickerClearTrigger` `XhTimePickerColumn` `XhTimePickerContent` `XhTimePickerControl` `XhTimePickerHiddenInput` `XhTimePickerInput` `XhTimePickerLabel` `XhTimePickerOption` `XhTimePickerPositioner` `XhTimePickerRoot` `XhTimePickerTrigger` |
| 组合式函数 | `useTimePicker` |
| 状态机 | `timePickerMachine` |
| 皮肤 | `@xihan-ui/styled/time-picker.css` |

**解剖**（`data-scope="time-picker"`，加粗为必备部件）

**`root`** · `label` · **`control`** · **`input`** · **`trigger`** · `clear-trigger` · `positioner` · **`content`** · `column` · `option` · `hidden-input`

**键盘**（规格出处：[W3C APG · listbox 模式](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowDown` / `ArrowUp` | focus in trigger, closed, not disabled | 展开浮层，焦点落到时列（已选的时仍可选就停在它上面，否则停在首格） |
| `Enter` / `Space` | focus in trigger, not disabled | 按钮的默认激活即展开/收起（不额外拦键，否则会一开一关） |
| `ArrowDown` | open, focus in 某一列 | 列内下移一格，到尾回绕；被 min/max 裁掉的格自动跳过 |
| `ArrowUp` | open, focus in 某一列 | 列内上移一格，到头回绕；被 min/max 裁掉的格自动跳过 |
| `Home` | open, focus in 某一列 | 焦点移到本列首格 |
| `End` | open, focus in 某一列 | 焦点移到本列末格 |
| `ArrowRight` | open | 换到下一列并落在该列的锚点上；已在末列则不动，不回绕 |
| `ArrowLeft` | open | 换到上一列并落在该列的锚点上；已在首列则不动，不回绕 |
| `Enter` / `Space` | open, 焦点停在可选的格上, not disabled/readOnly | 把这一格写进对应的段；浮层不收起（其余列还要接着挑） |
| `Escape` | open | 收起浮层并把焦点归还触发器，值不变 |
| `Tab` / `Shift+Tab` | open | 收起浮层且不拦按键，焦点按 Tab 序列自然离开，不抢回触发器 |
| `ArrowUp` | focus in 某一段, not disabled/readOnly | 本段加一格，到头回绕；空段落到该段下界 |
| `ArrowDown` | focus in 某一段, not disabled/readOnly | 本段减一格，到头回绕；空段落到该段上界 |
| `ArrowRight` | focus in 某一段, not disabled | 焦点移到下一段；已在末段则不动，不回绕 |
| `ArrowLeft` | focus in 某一段, not disabled | 焦点移到上一段；已在首段则不动，不回绕 |
| `Home` | focus in 某一段, not disabled | 焦点移到首段 |
| `End` | focus in 某一段, not disabled | 焦点移到末段 |
| `0-9` | focus in 数字段, not disabled/readOnly | 把数字并进本段；本段再吃不下第二位时自动跳到下一段 |
| `Backspace` / `Delete` | focus in 某一段, not disabled/readOnly | 清掉本段；小时被清时上下午段仍保留原来的上午/下午 |
| `a` / `p` | focus in 上下午段, 12 小时制, not disabled/readOnly | a 取上午、p 取下午（不区分大小写） |

---

## 日历 <Badge type="info" text="calendar" /> {#calendar}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-calendar>` |
| Vue 组件 | `XhButton` `XhButtonIndicator` `XhButtonLabel` `XhButtonPrefix` `XhButtonSuffix } from './components/button'
export {
  XhCalendarCell` `XhCalendarCellTrigger` `XhCalendarGrid` `XhCalendarGridBody` `XhCalendarGridHead` `XhCalendarHeader` `XhCalendarHeading` `XhCalendarNextTrigger` `XhCalendarPrevTrigger` `XhCalendarRoot` `XhCalendarWeekDay` `XhCalendarWeekRow` |
| 组合式函数 | `useCalendar` |
| 状态机 | `calendarMachine` |
| 皮肤 | `@xihan-ui/styled/calendar.css` |

**解剖**（`data-scope="calendar"`，加粗为必备部件）

`root` · `header` · `prev-trigger` · `next-trigger` · `heading` · **`grid`** · `grid-head` · `week-day` · `grid-body` · `week-row` · **`cell`** · **`cell-trigger`**

**键盘**（规格出处：[W3C APG · dialog-modal 模式](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/#kbd_label)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the grid | 整张网格只占一个 Tab 位：焦点进入聚焦日那一格 |
| `ArrowLeft` | focus in grid | 焦点前移一天；越过月首即翻到上一月并落在那一天 |
| `ArrowRight` | focus in grid | 焦点后移一天；越过月末即翻到下一月并落在那一天 |
| `ArrowUp` | focus in grid | 焦点上移一周（减七天），跨月照样翻页 |
| `ArrowDown` | focus in grid | 焦点下移一周（加七天），跨月照样翻页 |
| `Home` | focus in grid | 焦点移到本周第一天；周首日随 locale 变 |
| `End` | focus in grid | 焦点移到本周最后一天 |
| `PageUp` | focus in grid | 退一个月，日号不变（月末日被目标月夹住：3 月 31 日退成 2 月 29 日） |
| `PageDown` | focus in grid | 进一个月，日号不变 |
| `Shift+PageUp` | focus in grid | 退一年 |
| `Shift+PageDown` | focus in grid | 进一年 |
| `Enter` / `Space` | focus in grid, 聚焦日可用且非只读 | 选中聚焦日：单选替换、多选切换、区间先落起点再落终点 |

---

## 颜色选择器 <Badge type="info" text="color-picker" /> {#color-picker}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-color-picker>` |
| Vue 组件 | `XhColorPickerArea` `XhColorPickerAreaThumb` `XhColorPickerChannelInput` `XhColorPickerChannelSlider` `XhColorPickerChannelSliderThumb` `XhColorPickerChannelSliderTrack` `XhColorPickerContent` `XhColorPickerEyeDropperTrigger` `XhColorPickerLabel` `XhColorPickerPositioner` `XhColorPickerRoot` `XhColorPickerSwatch` `XhColorPickerSwatchGroup` `XhColorPickerSwatchItem` `XhColorPickerTrigger` `XhColorPickerValueText` |
| 组合式函数 | `useColorPicker` |
| 状态机 | `colorPickerMachine` |
| 皮肤 | `@xihan-ui/styled/color-picker.css` |

**解剖**（`data-scope="color-picker"`，加粗为必备部件）

`root` · `label` · **`trigger`** · `value-text` · `swatch` · `positioner` · **`content`** · **`area`** · **`area-thumb`** · `channel-slider` · `channel-slider-track` · `channel-slider-thumb` · `channel-input` · `eye-dropper-trigger` · `swatch-group` · `swatch-item`

**键盘**（规格出处：[W3C APG · slider 模式](https://www.w3.org/WAI/ARIA/apg/patterns/slider/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowLeft` | focus in area-thumb, not disabled/readOnly | 按 1 调饱和度；RTL 下左右对调，语义恒是"朝饱和走一格" |
| `ArrowUp` / `ArrowDown` | focus in area-thumb, not disabled/readOnly | 按 1 调明度，屏幕向上恒是变亮，与 dir 无关 |
| `Shift+ArrowRight` / `Shift+ArrowLeft` / `Shift+ArrowUp` / `Shift+ArrowDown` | focus in area-thumb, not disabled/readOnly | 同上，但一步走 10 |
| `Home` / `End` | focus in area-thumb, not disabled/readOnly | 饱和度取 0 / 100（与 aria-valuenow 报的是同一条轴） |
| `ArrowRight` / `ArrowLeft` / `ArrowUp` / `ArrowDown` | focus in channel-slider-thumb, channel enabled | 按 1 调该通道；RTL 下左右对调，上下恒是"朝 max 走" |
| `Shift+ArrowRight` / `Shift+ArrowLeft` / `Shift+ArrowUp` / `Shift+ArrowDown` | focus in channel-slider-thumb, channel enabled | 同上，但一步走 10 |
| `Home` / `End` | focus in channel-slider-thumb, channel enabled | 该通道取 min / max（色相 0-360，透明度 0-100） |
| `Enter` | focus in channel-input | 收下框里的字；收不了（打了一半）就复原成规范文本。一并拦住表单提交 |
| `Escape` | open（本层在层栈顶） | 收起浮层，焦点归还触发器 |

---

## 文件上传 <Badge type="info" text="file-upload" /> {#file-upload}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-file-upload>` |
| Vue 组件 | `XhFileUploadClearTrigger` `XhFileUploadDropzone` `XhFileUploadHiddenInput` `XhFileUploadItem` `XhFileUploadItemDeleteTrigger` `XhFileUploadItemGroup` `XhFileUploadItemName` `XhFileUploadItemPreview` `XhFileUploadItemSizeText` `XhFileUploadLabel` `XhFileUploadRoot` `XhFileUploadTrigger` |
| 组合式函数 | `useFileUpload` |
| 状态机 | `fileUploadMachine` |
| 皮肤 | `@xihan-ui/styled/file-upload.css` |

**解剖**（`data-scope="file-upload"`，加粗为必备部件）

`root` · `label` · `dropzone` · `trigger` · **`hidden-input`** · `item-group` · `item` · `item-name` · `item-size-text` · `item-preview` · `item-delete-trigger` · `clear-trigger`

**键盘**（规格出处：[W3C APG · button 模式](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside / inside the component | 投放区、选择按钮、每条的删除按钮与清空按钮各占一个 Tab 位；禁用时投放区退出 Tab 序列，几个原生按钮带 disabled 本就不可聚焦 |
| `Enter` / `Space` | focus on dropzone | 打开系统文件选择框。投放区是 div，浏览器不会替它把这两个键合成成一次点击，连接层自己接管（并拦下空格滚屏） |
| `Enter` / `Space` | focus on trigger | 打开系统文件选择框（原生 button 的默认激活） |
| `Enter` / `Space` | focus on item-delete-trigger | 把这一条从列表里删掉（原生 button 的默认激活） |
| `Enter` / `Space` | focus on clear-trigger，且列表非空 | 清空整份列表；列表为空时该按钮带原生 disabled，键盘根本到不了它 |
