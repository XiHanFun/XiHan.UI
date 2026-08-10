# 组合框 <Badge type="info" text="combobox" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

过滤由宿主自己算：组件把输入串交给 input-value，筛出哪几条交给 collection 是调用方的事

<XhDemo src="combobox/01-basic" />

### 多选

选完不收起、输入串自动清空，候选立刻回到全集；框里空着时退格删掉最后一个已选项

<XhDemo src="combobox/02-multiple" />

### 允许自由文本

allow-custom-value 让没匹配上候选的输入也能落值，适合标签、邮箱这类开放集合

<XhDemo src="combobox/03-custom-value" />

### 分组

候选分段展示；整段被筛空时连同段标题一起不渲染，列表里不留空壳

<XhDemo src="combobox/04-group" />

### 形态

variant 只改输入行的底色与描边用法，取值、过滤与键盘行为都不变

<XhDemo src="combobox/05-variant" />

### 语气

tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，只看语气这一轴

<XhDemo src="combobox/06-tone" />

### 尺寸

不传 size 即默认档；行高、内边距与字号一起换档，浮层里的候选也跟着变

<XhDemo src="combobox/07-size" />

### 受控展开

传了 open 就由宿主说了算：组件只报展开意图，这里满两个字符才真的把浮层放出来

<XhDemo src="combobox/08-controlled-open" />

### 选中后清空输入

选中值一变就把输入串清掉，候选立刻回到全集，接着挑下一个不用先删字

<XhDemo src="combobox/09-clear-after-select" />

### 校验状态

invalid 让输入行报 aria-invalid、描边转告警色；选出值后判定自己撤掉

<XhDemo src="combobox/10-invalid" />

### 异步候选

输入串每变一次就重新去远端查一遍，等结果的这段时间候选为空、由空态节点顶上

<XhDemo src="combobox/11-async" />

### 候选里的自定义内容

条目内容是插槽：主文本之外还能带副标题与标记，过滤与键盘行为一点不变

<XhDemo src="combobox/12-custom-content" />

### 随表单提交

根插槽把选中值交出来：在根里补一个隐藏输入承接它，值随原生表单一并提交；浮层收起时回车留给表单

<XhDemo src="combobox/13-form" />

### 多行输入宿主

输入框写 as="textarea" 即换成多行；此时不写 role 与 aria-expanded，textarea 保留它自带的 textbox 角色

<XhDemo src="combobox/14-textarea-host" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-combobox>` |
| Vue 组件 | `XhComboboxClearTrigger` `XhComboboxContent` `XhComboboxControl` `XhComboboxEmpty` `XhComboboxInput` `XhComboboxItem` `XhComboboxItemGroup` `XhComboboxItemGroupLabel` `XhComboboxItemIndicator` `XhComboboxItemText` `XhComboboxLabel` `XhComboboxPositioner` `XhComboboxRoot` `XhComboboxTrigger` |
| 组合式函数 | `useCombobox` |
| 状态机 | `comboboxMachine` |
| 皮肤 | `@xihan-ui/styled/combobox.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="combobox"`：`root` · `label` · **`control`** · **`input`** · `trigger` · `clear-trigger` · `positioner` · **`content`** · `item` · `item-text` · `item-indicator` · `item-group` · `item-group-label` · `empty`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `ComboboxNode[]` |  | 候选数据，显示文本与禁用的事实源。过滤仍归调用方：交进来的就是此刻该显示的那几条。 给了它，条目部件只需报 value，显示文本也不再从活 DOM 现查。 缺省即回到「文本写在条目里、现查 DOM」的老路。 |
| `value` | `string \| string[]` |  | 选中值。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 单选写成裸串是简写，内部一律归一成数组。 |
| `defaultValue` | `string \| string[]` |  |  |
| `inputValue` | `string` |  | 输入框里的字符串。给定即受控，与选中值各自独立。 过滤不由组件做：调用方拿这个串去筛条目，把筛完的结果重新渲染进来。 |
| `defaultInputValue` | `string` |  |  |
| `open` | `boolean` |  | 展开态。给定即受控：内部不再自改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `multiple` | `boolean` |  | 多选：选中是集合，选中后列表不收起、输入串清空以便接着筛。 |
| `disabled` | `boolean` |  | 整个控件禁用：输入框与两个按钮都用原生 disabled。 |
| `readOnly` | `boolean` |  | 只读：文字可选可复制，但展开、选中、清空一概不发生。 |
| `invalid` | `boolean` |  | 校验失败：输入框报 aria-invalid，各角色节点带 data-invalid。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `placeholder` | `string` |  | 输入框占位文字。 |
| `allowCustomValue` | `boolean` |  | 允许提交候选列表里没有的值（回车与失焦时把输入串本身收成选中值）。 |
| `openOnClick` | `boolean` |  | 点输入框即展开，默认 false（只有触发按钮与方向键展开）。 |
| `inputBehavior` | `ComboboxInputBehavior` |  | 输入行为，默认 none。 |
| `placement` | `Placement` |  |  |
| `offset` | `number` |  |  |
| `variant` | `string` |  | 形态：outline / subtle / ghost，决定输入行的描边与底色怎么用。 |
| `tone` | `string` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调用哪族颜色。 |
| `size` | `string` |  | 尺寸：sm / md / lg，决定输入行高度、内边距与字号档位。 |
| `onValueChange` | `(details: ComboboxValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onInputValueChange` | `(details: ComboboxInputValueChangeDetails) => void` |  | 输入串变化回调：调用方据此重新过滤候选。 |
| `onOpenChange` | `(details: ComboboxOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

## 状态机

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ESCAPE` · `INPUT.CHANGE` · `INPUT.SET` · `INPUT.BLUR` · `ITEM.HIGHLIGHT` · `ITEM.SELECT` · `VALUE.COMMIT` · `VALUE.SET` · `VALUE.CLEAR` · `ITEMS.SYNC`

**判据**：`isOpenControlled` · `isMultiple` · `hasHighlight`

## connect API

`useCombobox` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `collection` | `readonly ComboboxNodeMeta[]` | collection 推出的候选元信息，按数据顺序排列；没给 collection 即空数组。 |
| `value` | `string[]` | 选中集合；单选模式下长度 ≤ 1，形状不随模式变。 |
| `inputValue` | `string` | 输入框里的字符串。 |
| `valueText` | `string \| null` | 单选选中项的显示文本；无选中或多选时为 null。 |
| `highlightedValue` | `string \| null` | 高亮候选；收起时为 null。焦点不在它身上，只经 aria-activedescendant 上报。 |
| `multiple` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `empty` | `boolean` | 候选为空（已结算且条数为 0）且当前展开：empty 角色节点据此显形。 |
| `canClear` | `boolean` | 清空按钮此刻可不可按。 |
| `isSelected` | `(value: string) => boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string[]) => void` |  |
| `setInputValue` | `(next: string) => void` |  |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getInputProps` | `(props?: ComboboxInputProps) => T['input']` | 不传参即单行 input，产出与加此参数前逐字相同。 |
| `getTriggerProps` | `() => T['button']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getItemGroupProps` | `(props: ComboboxItemGroupProps) => T['element']` |  |
| `getItemGroupLabelProps` | `(props: ComboboxItemGroupProps) => T['element']` |  |
| `getItemProps` | `(props: ComboboxItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: ComboboxItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: ComboboxItemProps) => T['element']` |  |
| `getEmptyProps` | `() => T['element']` |  |

## 键盘

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
| `Escape` | open | 先摘掉高亮；高亮已空时才收起列表，选中值不变 |
| `Alt+ArrowUp` | open | 收起列表，选中值不变 |
| `Tab` / `Shift+Tab` | open | 收起列表且不拦按键，焦点按 Tab 序列自然离开 |
| `Backspace` | multiple, 输入串为空且已有选中 | 删掉最后一个已选项 |
| `可打印字符` | focus in input | 改写输入串并展开列表；过滤由调用方按 onInputValueChange 自己做 |
