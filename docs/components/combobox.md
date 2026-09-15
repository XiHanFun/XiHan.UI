# Combobox 组合框 <Badge type="info" text="alpha" />

将输入框与候选列表结合，用于搜索并选择选项。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/combobox" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/combobox.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/combobox" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/combobox" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/combobox.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

搜索并选择城市

<XhDemo src="combobox/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="combobox"`：`root` · `label` · **`control`** · **`input`** · `trigger` · `clear-trigger` · `positioner` · **`content`** · `item` · `item-text` · `item-indicator` · `group` · `group-label` · `empty` · `loading` · `hidden-input`

## 示例

### 多选

选择多个城市

<XhDemo src="combobox/02-multiple" />

### 自定义值

选择候选项或输入新值

<XhDemo src="combobox/03-custom-value" />

### 分组

按分类组织候选项

<XhDemo src="combobox/04-group" />

### 变体

设置输入框外观

<XhDemo src="combobox/05-variant" />

### 校验状态

标记无效输入

<XhDemo src="combobox/06-invalid" />

### 异步候选

查询远程数据

<XhDemo src="combobox/07-async" />

### 自定义内容

在候选项中显示辅助信息

<XhDemo src="combobox/08-custom-content" />

## 设计指引

### 何时使用

- 选项较多，需要通过输入快速筛选。
- 候选来自远程数据或允许输入自定义值。

### 何时不用

- 选项固定且不多时，使用[选择器](./select)。
- 在正文中插入引用时，使用[提及](./mention)。
- 输入一组自由标签时，使用[标签输入](./tags-input)。

### 特性

- 支持单选、多选、分组和自定义值。
- 输入值、选中值与展开状态均可独立受控。
- `loading` 与 `empty` 分别表示加载和空结果。
- 支持自定义过滤、异步候选和自定义条目内容。
- 通过隐藏输入参与原生表单提交。

### 组合

- 放进[表单字段](./field)获得标签、说明与错误信息，字段状态会接到输入框上。
- 候选列表是常驻的[列表框](./listbox)收进浮层的形态；选项固定且不需要输入时换成[选择器](./select)。
- 多选时的已选项可用[标签组](./tag-group)排在输入框前。

### 最佳实践

- 为异步查询提供加载和空结果反馈。
- 远程过滤应使用防抖，并取消过期请求。
- 允许自定义值时，明确提示 Enter 会采用当前输入。
- 使用标签说明字段含义，使用占位文本提示搜索方式。

### 反模式

- 未经说明就接受候选列表之外的值。
- 每次按键都立即发起远程请求。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-combobox>` |
| Vue 组件 | `XhComboboxClearTrigger` `XhComboboxContent` `XhComboboxControl` `XhComboboxEmpty` `XhComboboxGroup` `XhComboboxGroupLabel` `XhComboboxHiddenInput` `XhComboboxInput` `XhComboboxItem` `XhComboboxItemIndicator` `XhComboboxItemText` `XhComboboxLabel` `XhComboboxLoading` `XhComboboxPositioner` `XhComboboxRoot` `XhComboboxTrigger` |
| 组合式函数 | `useCombobox` |
| 状态机 | `comboboxMachine` |
| 皮肤 | `@xihan-ui/styles/combobox.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `ComboboxNode[]` |  | 候选数据，显示文本与禁用的事实源。过滤仍由调用方完成：传入的即当前应显示的候选。 提供后条目部件只需声明 value，显示文本也不再从 DOM 查询。 未提供时回到文本写在条目中、从 DOM 查询的方式。 |
| `value` | `string \| string[]` |  | 选中值。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。 单选写为裸串是简写，内部一律归一为数组。 |
| `defaultValue` | `string \| string[]` |  |  |
| `inputValue` | `string` |  | 输入框中的字符串。提供即受控，与选中值各自独立。 过滤不由组件完成：调用方用该串筛选条目，把筛选结果重新渲染进来。 |
| `defaultInputValue` | `string` |  |  |
| `open` | `boolean` |  | 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `name` | `string` |  | 表单字段名；hidden-input 按选中值逐个生成同名字段，不使用分隔符编码。 |
| `form` | `string` |  | 原生表单 ID；显式关联外部表单，提交与 reset 使用同一所有者。 |
| `multiple` | `boolean` |  |  |
| `disabled` | `boolean` |  | 整个控件禁用：输入框与两个按钮都使用原生 disabled。 |
| `readOnly` | `boolean` |  | 只读：文字可选可复制，但展开、选中、清空一概不发生。 |
| `invalid` | `boolean` |  | 校验失败：输入框报告 aria-invalid，各角色节点带 data-invalid。 |
| `loading` | `boolean` |  | 候选加载中：列表报告 aria-busy，显示在途占位、隐藏空态占位。 |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 true。 |
| `placeholder` | `string` |  | 输入框占位文字。 |
| `translations` | `Partial<ComboboxTranslations>` |  | 读屏文案；未提供的键使用英文默认值。 |
| `allowCustomValue` | `boolean` |  | 允许提交候选列表中没有的值（回车与失焦时把输入串本身收为选中值）。 |
| `openOnClick` | `boolean` |  | 点击输入框即展开，默认 false（只有触发按钮与方向键展开）。 |
| `inputBehavior` | `ComboboxInputBehavior` |  | 输入行为，默认 none。 |
| `placement` | `Placement` |  |  |
| `dir` | `Direction` |  | 文字方向，默认 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  |  |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定输入行的描边与底色使用方式。默认 outline。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定输入行高度、内边距与字号档位。 |
| `onValueChange` | `(details: ComboboxValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 |
| `onInputValueChange` | `(details: ComboboxInputValueChangeDetails) => void` |  | 输入串变化回调：调用方据此重新过滤候选。 |
| `onOpenChange` | `(details: ComboboxOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ComboboxValueChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |
| `input-value-change` | `ComboboxInputValueChangeDetails` | 输入串变化；detail 为 `{ inputValue: string }`，作者据此过滤候选 |
| `open-change` | `ComboboxOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhComboboxRoot` | `default` | `ComboboxRootSlotProps` |  |
| `XhComboboxRoot` | `label` | — |  |
| `XhComboboxRoot` | `empty` | — |  |
| `XhComboboxRoot` | `item` | `ComboboxNodeMeta` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `control` | 'open' \| 'closed' |
| `input` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `empty` | 'open' \| 'closed' |
| `loading` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ESCAPE` · `INPUT.CHANGE` · `INPUT.SET` · `INPUT.BLUR` · `ITEM.HIGHLIGHT` · `HIGHLIGHT.CLEAR` · `ITEM.SELECT` · `VALUE.COMMIT` · `VALUE.SET` · `VALUE.CLEAR` · `ITEMS.SYNC` · `FORM.RESET`

**判据**：`isOpenControlled` · `isMultiple` · `hasHighlight`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `collection` | `readonly ComboboxNodeMeta[]` | 由 collection 推导的候选元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `value` | `string[]` | 选中集合；单选模式下长度 ≤ 1，形状不随模式变化。 |
| `inputValue` | `string` | 输入框中的字符串。 |
| `valueText` | `string \| null` | 单选选中项的显示文本；无选中或多选时为 null。 |
| `highlightedValue` | `string \| null` | 高亮候选；收起时为 null。焦点不在它身上，只经 aria-activedescendant 上报。 |
| `multiple` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `empty` | `boolean` | 候选为空（已结算且条数为 0）且当前展开：empty 角色节点据此显示。 |
| `canClear` | `boolean` | 清空按钮当前是否可按。 |
| `isSelected` | `(value: string) => boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string[]) => void` |  |
| `setInputValue` | `(next: string) => void` |  |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getInputProps` | `(props?: ComboboxInputProps) => T['input']` | 不传参即单行 input，产出与增加此参数前逐字相同。 |
| `getTriggerProps` | `() => T['button']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getGroupProps` | `(props: ComboboxGroupProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: ComboboxGroupProps) => T['element']` |  |
| `getItemProps` | `(props: ComboboxItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: ComboboxItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: ComboboxItemProps) => T['element']` |  |
| `getEmptyProps` | `() => T['element']` |  |
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一位置，两者不同时显示：加载期间显示它，空态让位。 与 content 是兄弟，同样不进入 role=listbox。 |
| `getHiddenInputProps` | `(props: { value: string }) => T['input']` | 单值表单出口；按 api.value 逐个调用并生成同名 input，零选中不生成提交项。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction)

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
| `Escape` | open | 先清除高亮；高亮已空时才收起列表，选中值不变 |
| `Alt+ArrowUp` | open | 收起列表，选中值不变 |
| `Tab` / `Shift+Tab` | open | 收起列表且不拦按键，焦点按 Tab 序列自然离开 |
| `Backspace` | multiple, 输入串为空且已有选中 | 删掉最后一个已选项 |
| `可打印字符` | focus in input | 改写输入串并展开列表；过滤由调用方按 onInputValueChange 自己做 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `input` | `aria-activedescendant` | `item` 部件的 id \| undefined |
| `input` | `aria-autocomplete` | 'both' \| 'list' |
| `input` | `aria-controls` | `content` 部件的 id |
| `input` | `aria-expanded` | undefined \| 'true' \| 'false' |
| `input` | `aria-haspopup` | 'listbox' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-labelledby` | `label` 部件的 id |
| `input` | `role` | undefined \| 'combobox' |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-label` | props.translations.trigger |
| `clear-trigger` | `aria-label` | props.translations.clearTrigger |
| `content` | `aria-busy` | 'true' \| undefined |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-labelledby` | `label` 部件的 id |
| `content` | `aria-multiselectable` | 'true' \| 'false' |
| `content` | `role` | 'listbox' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-indicator` | `aria-hidden` | 'true' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |
| `empty` | `role` | 'status' |
| `loading` | `role` | 'status' |

## 样式参考

### 皮肤

`@xihan-ui/styles/combobox.css` 使用 `[data-scope="combobox"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `control` | `data-state` | 'open' \| 'closed' |
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-invalid` | ''（条件成立时才出现） |
| `input` | `data-multiline` | ''（条件成立时才出现） |
| `input` | `data-readonly` | ''（条件成立时才出现） |
| `input` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `positioner` | `data-variant` | props.variant |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-state` | 'open' \| 'closed' |
| `empty` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-combobox-action-bg` | `clear-trigger`<br>`trigger` | `background` | `default`<br>`disabled` | `transparent` | combobox 的 clear-trigger、trigger 部件 background 覆盖槽。 |
| `--xh-combobox-action-bg-active` | `clear-trigger`<br>`trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-bg-subtle-active` | combobox 的 clear-trigger、trigger 部件 background 覆盖槽。 |
| `--xh-combobox-action-bg-hover` | `clear-trigger`<br>`trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | combobox 的 clear-trigger、trigger 部件 background 覆盖槽。 |
| `--xh-combobox-action-fg` | `clear-trigger`<br>`trigger` | `color` | `default` | `--xh-fg-muted` | combobox 的 clear-trigger、trigger 部件 color 覆盖槽。 |
| `--xh-combobox-action-fg-hover` | `clear-trigger`<br>`trigger` | `color` | `hover`<br>`not(:disabled)` | `--xh-fg-default` | combobox 的 clear-trigger、trigger 部件 color 覆盖槽。 |
| `--xh-combobox-action-font-size` | `clear-trigger`<br>`trigger` | `font-size` | `default` | `--xh-text-secondary-size` | combobox 的 clear-trigger、trigger 部件 font-size 覆盖槽。 |
| `--xh-combobox-action-radius` | `clear-trigger`<br>`trigger` | `border-radius` | `default` | `--xh-shape-control` | combobox 的 clear-trigger、trigger 部件 border-radius 覆盖槽。 |
| `--xh-combobox-action-size` | `clear-trigger`<br>`trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-action-size` | combobox 的 clear-trigger、trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-combobox-content-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-backdrop` | combobox 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-combobox-content-bg` | `content` | `background` | `default` | `--xh-material-frosted-bg` | combobox 的 content 部件 background 覆盖槽。 |
| `--xh-combobox-content-border` | `content` | `border` | `default` | `--xh-material-frosted-border` | combobox 的 content 部件 border 覆盖槽。 |
| `--xh-combobox-content-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | combobox 的 content 部件 color 覆盖槽。 |
| `--xh-combobox-content-gap` | `content` | `gap` | `default` | `--xh-list-option-gap` | combobox 的 content 部件 gap 覆盖槽。 |
| `--xh-combobox-content-highlight` | `content` | `background` | `default` | `--xh-material-frosted-highlight` | combobox 的 content 部件 background 覆盖槽。 |
| `--xh-combobox-content-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-max-h` | combobox 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-combobox-content-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` | combobox 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-combobox-content-min-h` | `content` | `min-block-size` | `default` | `--xh-_combobox-h` | combobox 的 content 部件 min-block-size 覆盖槽。 |
| `--xh-combobox-content-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-min-w` | combobox 的 content 部件 min-inline-size 覆盖槽。 |
| `--xh-combobox-content-px` | `content` | `padding-inline` | `default` | `--xh-space-1` | combobox 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-combobox-content-py` | `content` | `padding-block` | `default` | `--xh-space-1` | combobox 的 content 部件 padding-block 覆盖槽。 |
| `--xh-combobox-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | combobox 的 content 部件 border-radius 覆盖槽。 |
| `--xh-combobox-content-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | combobox 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-combobox-control-bg` | `control` | `background` | `default` | `--xh-_combobox-control-bg` | combobox 的 control 部件 background 覆盖槽。 |
| `--xh-combobox-control-bg-disabled` | `control` | `background` | `disabled` | `--xh-bg-subtle` | combobox 的 control 部件 background 覆盖槽。 |
| `--xh-combobox-control-bg-hover` | `control` | `background` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly])`<br>`readonly` | `--xh-_combobox-control-bg-hover` | combobox 的 control 部件 background 覆盖槽。 |
| `--xh-combobox-control-bg-readonly` | `control` | `background` | `readonly` | `--xh-bg-subtle` | combobox 的 control 部件 background 覆盖槽。 |
| `--xh-combobox-control-border` | `control` | `border` | `default` | `--xh-_combobox-control-border` | combobox 的 control 部件 border 覆盖槽。 |
| `--xh-combobox-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])` | `--xh-_tone` | combobox 的 control 部件 border-color 覆盖槽。 |
| `--xh-combobox-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-invalid])` | `--xh-_combobox-control-border-hover` | combobox 的 control 部件 border-color 覆盖槽。 |
| `--xh-combobox-control-border-invalid` | `control` | `border-color` | `invalid` | `--xh-border-invalid` | combobox 的 control 部件 border-color 覆盖槽。 |
| `--xh-combobox-control-fg` | `control` | `color` | `default` | `--xh-fg-default` | combobox 的 control 部件 color 覆盖槽。 |
| `--xh-combobox-control-gap` | `control` | `gap` | `default` | `--xh-_combobox-gap` | combobox 的 control 部件 gap 覆盖槽。 |
| `--xh-combobox-control-h` | `control` | `block-size` | `default` | `--xh-_combobox-h` | combobox 的 control 部件 block-size 覆盖槽。 |
| `--xh-combobox-control-min-w` | `control`<br>`root` | `min-inline-size` | `default` | `--xh-control-min-w` | combobox 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-combobox-control-px` | `control` | `padding-inline` | `default` | `--xh-_combobox-px` | combobox 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-combobox-control-py` | `control`<br>`input` | `padding-block` | `has([data-part='input'][data-multiline])`<br>`multiline` | `--xh-field-py` | combobox 的 control、input 部件 padding-block 覆盖槽。 |
| `--xh-combobox-control-radius` | `control` | `border-radius` | `default` | `--xh-shape-control` | combobox 的 control 部件 border-radius 覆盖槽。 |
| `--xh-combobox-control-shadow` | `control` | `box-shadow` | `default` | `--xh-_combobox-control-shadow` | combobox 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-combobox-empty-fg` | `empty` | `color` | `default` | `--xh-material-frosted-fg-muted` | combobox 的 empty 部件 color 覆盖槽。 |
| `--xh-combobox-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_combobox-font-size` | combobox 的 empty 部件 font-size 覆盖槽。 |
| `--xh-combobox-empty-px` | `empty` | `padding-inline` | `default` | `--xh-control-px-md` | combobox 的 empty 部件 padding-inline 覆盖槽。 |
| `--xh-combobox-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` | combobox 的 empty 部件 padding-block 覆盖槽。 |
| `--xh-combobox-gap` | `root` | `gap` | `default` | `--xh-space-1` | combobox 的 root 部件 gap 覆盖槽。 |
| `--xh-combobox-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` | combobox 的 group 部件 gap 覆盖槽。 |
| `--xh-combobox-group-label-fg` | `group-label` | `color` | `default` | `--xh-material-frosted-fg-muted` | combobox 的 group-label 部件 color 覆盖槽。 |
| `--xh-combobox-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` | combobox 的 group-label 部件 font-size 覆盖槽。 |
| `--xh-combobox-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` | combobox 的 group-label 部件 font-weight 覆盖槽。 |
| `--xh-combobox-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-control-px-md` | combobox 的 group-label 部件 padding-inline 覆盖槽。 |
| `--xh-combobox-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` | combobox 的 group-label 部件 padding-block 覆盖槽。 |
| `--xh-combobox-group-spacing` | `group` | `margin-block-start` | `default` | `--xh-space-1_5` | combobox 的 group 部件 margin-block-start 覆盖槽。 |
| `--xh-combobox-icon-size` | `positioner`<br>`root` | `--xh-icon-size` | `is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | combobox 的 positioner、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-combobox-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-bg-canvas` | combobox 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-combobox-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-fg-default` | combobox 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-combobox-input-font-size` | `input` | `font-size` | `default` | `--xh-_combobox-font-size` | combobox 的 input 部件 font-size 覆盖槽。 |
| `--xh-combobox-item-bg-hover` | `item` | `background` | `disabled`<br>`highlighted`<br>`not([data-disabled])` | `--xh-bg-subtle` | combobox 的 item 部件 background 覆盖槽。 |
| `--xh-combobox-item-fg` | `item` | `color` | `default`<br>`state=checked` | `--xh-material-frosted-fg` | combobox 的 item 部件 color 覆盖槽。 |
| `--xh-combobox-item-fg-selected` | `item` | `color` | `state=checked` | `--xh-combobox-item-fg` | combobox 的 item 部件 color 覆盖槽。 |
| `--xh-combobox-item-font-size` | `item` | `font-size` | `default` | `--xh-_combobox-font-size` | combobox 的 item 部件 font-size 覆盖槽。 |
| `--xh-combobox-item-font-weight-selected` | `item` | `font-weight` | `state=checked` | `--xh-font-weight-regular` | combobox 的 item 部件 font-weight 覆盖槽。 |
| `--xh-combobox-item-gap` | `item` | `gap` | `default` | `--xh-_combobox-gap` | combobox 的 item 部件 gap 覆盖槽。 |
| `--xh-combobox-item-indicator-fg` | `item-indicator` | `color` | `default` | `--xh-_combobox-accent` | combobox 的 item-indicator 部件 color 覆盖槽。 |
| `--xh-combobox-item-indicator-size` | `item-indicator` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | combobox 的 item-indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-combobox-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` | combobox 的 item 部件 line-height 覆盖槽。 |
| `--xh-combobox-item-px` | `item` | `padding-inline` | `default` | `--xh-_combobox-item-px` | combobox 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-combobox-item-py` | `item` | `padding-block` | `default` | `--xh-_combobox-item-py` | combobox 的 item 部件 padding-block 覆盖槽。 |
| `--xh-combobox-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | combobox 的 item 部件 border-radius 覆盖槽。 |
| `--xh-combobox-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | combobox 的 label 部件 color 覆盖槽。 |
| `--xh-combobox-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | combobox 的 label 部件 color 覆盖槽。 |
| `--xh-combobox-label-font-size` | `label` | `font-size` | `default` | `--xh-_combobox-label-font-size` | combobox 的 label 部件 font-size 覆盖槽。 |
| `--xh-combobox-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | combobox 的 label 部件 font-weight 覆盖槽。 |
| `--xh-combobox-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | combobox 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-combobox-loading-fg` | `loading` | `color` | `default` | `--xh-material-frosted-fg-muted` | combobox 的 loading 部件 color 覆盖槽。 |
| `--xh-combobox-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_combobox-font-size` | combobox 的 loading 部件 font-size 覆盖槽。 |
| `--xh-combobox-loading-px` | `loading` | `padding-inline` | `default` | `--xh-control-px-md` | combobox 的 loading 部件 padding-inline 覆盖槽。 |
| `--xh-combobox-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` | combobox 的 loading 部件 padding-block 覆盖槽。 |
| `--xh-combobox-placeholder-fg` | `input` | `color` | `placeholder` | `--xh-fg-subtle` | combobox 的 input 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `color` · `rotate` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
