# 组合框 <Badge type="info" text="combobox" />

能打字过滤的选择器：输入框加候选浮层，可以只从候选里选，也可以允许自由文本。

## 何时使用

- 选项多到需要检索（城市、用户、商品）。
- 候选来自远端，随输入变化。
- 允许用户输入清单之外的值（`allowCustomValue`）。

## 何时不用

- 选项固定且不多：用[选择器](./select)。
- 只是在正文里插入引用：用[提及](./mention)。
- 输入的是标签集合：用[标签输入](./tags-input)。

## 特性

- `inputBehavior` 决定输入时是否自动高亮或自动补全首项。
- 多选、分组、异步候选、选中后清空输入都是内置行为。
- `openOnClick` 决定点击输入框是否直接展开候选。
- 输入宿主可以换成多行。

## 示例

### 基础用法

过滤由宿主自己算：组件把输入串交出来，此刻显示哪几条候选由调用方定

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

条目内容由你写：主文本之外还能带副标题与标记，过滤与键盘行为一点不变

<XhDemo src="combobox/12-custom-content" />

### 随表单提交

在根里补一个隐藏输入承接选中值，值随原生表单一并提交；浮层收起时回车留给表单

<XhDemo src="combobox/13-form" />

### 多行输入宿主

输入部件写成 textarea 即多行宿主；此时不写 role 与 aria-expanded，textarea 保留它自带的 textbox 角色

<XhDemo src="combobox/14-textarea-host" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-combobox>` |
| Vue 组件 | `XhComboboxClearTrigger` `XhComboboxContent` `XhComboboxControl` `XhComboboxEmpty` `XhComboboxHiddenInput` `XhComboboxInput` `XhComboboxItem` `XhComboboxItemGroup` `XhComboboxItemGroupLabel` `XhComboboxItemIndicator` `XhComboboxItemText` `XhComboboxLabel` `XhComboboxPositioner` `XhComboboxRoot` `XhComboboxTrigger` |
| 组合式函数 | `useCombobox` |
| 状态机 | `comboboxMachine` |
| 皮肤 | `@xihan-ui/styles/combobox.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="combobox"`：`root` · `label` · **`control`** · **`input`** · `trigger` · `clear-trigger` · `positioner` · **`content`** · `item` · `item-text` · `item-indicator` · `item-group` · `item-group-label` · `empty` · `hidden-input`

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
| `name` | `string` |  | 表单字段名；给了 hidden-input 才带 name 并参与提交。多选按逗号拼成一串。 |
| `multiple` | `boolean` |  |  |
| `disabled` | `boolean` |  | 整个控件禁用：输入框与两个按钮都用原生 disabled。 |
| `readOnly` | `boolean` |  | 只读：文字可选可复制，但展开、选中、清空一概不发生。 |
| `invalid` | `boolean` |  | 校验失败：输入框报 aria-invalid，各角色节点带 data-invalid。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `placeholder` | `string` |  | 输入框占位文字。 |
| `allowCustomValue` | `boolean` |  | 允许提交候选列表里没有的值（回车与失焦时把输入串本身收成选中值）。 |
| `openOnClick` | `boolean` |  | 点输入框即展开，默认 false（只有触发按钮与方向键展开）。 |
| `inputBehavior` | `ComboboxInputBehavior` |  | 输入行为，默认 none。 |
| `placement` | `Placement` |  |  |
| `dir` | `Direction` |  | 文字方向，缺省 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  |  |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定输入行的描边与底色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定输入行高度、内边距与字号档位。 |
| `onValueChange` | `(details: ComboboxValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onInputValueChange` | `(details: ComboboxInputValueChangeDetails) => void` |  | 输入串变化回调：调用方据此重新过滤候选。 |
| `onOpenChange` | `(details: ComboboxOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ComboboxValueChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |
| `input-value-change` | `ComboboxInputValueChangeDetails` | 输入串变化；detail 为 `{ inputValue: string }`，作者据此过滤候选 |
| `open-change` | `ComboboxOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhComboboxRoot` | `default` | `ComboboxRootSlotProps` |  |
| `XhComboboxRoot` | `label` | — |  |
| `XhComboboxRoot` | `empty` | — |  |
| `XhComboboxRoot` | `item` | `ComboboxNodeMeta` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `control` | 'open' \| 'closed' |
| `input` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `empty` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ESCAPE` · `INPUT.CHANGE` · `INPUT.SET` · `INPUT.BLUR` · `ITEM.HIGHLIGHT` · `HIGHLIGHT.CLEAR` · `ITEM.SELECT` · `VALUE.COMMIT` · `VALUE.SET` · `VALUE.CLEAR` · `ITEMS.SYNC` · `FORM.RESET`

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
| `getHiddenInputProps` | `() => T['input']` | 表单影子：选中值随表单提交。给了 name 才带 name，不给就不参与提交。 |

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

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

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
| `clear-trigger` | `aria-hidden` | 'true' |
| `content` | `aria-labelledby` | `label` 部件的 id |
| `content` | `aria-multiselectable` | 'true' \| 'false' |
| `content` | `role` | 'listbox' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-indicator` | `aria-hidden` | 'true' |
| `item-group` | `aria-labelledby` | `group-label` 部件的 id |
| `item-group` | `role` | 'group' |
| `empty` | `role` | 'status' |

## 样式

默认皮肤 `@xihan-ui/styles/combobox.css` 按部件选择：`[data-scope="combobox"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
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
| `clear-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `positioner` | `data-variant` | props.variant |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-state` | 'open' \| 'closed' |
| `empty` | `data-state` | 'open' \| 'closed' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-combobox-action-bg` · `--xh-combobox-action-bg-active` · `--xh-combobox-action-bg-hover` · `--xh-combobox-action-fg` · `--xh-combobox-action-fg-hover` · `--xh-combobox-action-font-size` · `--xh-combobox-action-radius` · `--xh-combobox-action-size` · `--xh-combobox-content-bg` · `--xh-combobox-content-border` · `--xh-combobox-content-fg` · `--xh-combobox-content-max-h` · `--xh-combobox-content-max-w` · `--xh-combobox-content-min-w` · `--xh-combobox-content-px` · `--xh-combobox-content-py` · `--xh-combobox-content-radius` · `--xh-combobox-content-shadow` · `--xh-combobox-control-bg` · `--xh-combobox-control-bg-disabled` · `--xh-combobox-control-bg-readonly` · `--xh-combobox-control-border` · `--xh-combobox-control-border-focus` · `--xh-combobox-control-border-hover` · `--xh-combobox-control-border-invalid` · `--xh-combobox-control-fg` · `--xh-combobox-control-gap` · `--xh-combobox-control-h` · `--xh-combobox-control-min-w` · `--xh-combobox-control-px` · `--xh-combobox-control-radius` · `--xh-combobox-empty-bg` · `--xh-combobox-empty-border` · `--xh-combobox-empty-fg` · `--xh-combobox-empty-font-size` · `--xh-combobox-empty-px` · `--xh-combobox-empty-py` · `--xh-combobox-empty-radius` · `--xh-combobox-empty-shadow` · `--xh-combobox-gap` · `--xh-combobox-group-gap` · `--xh-combobox-group-label-fg` · `--xh-combobox-group-label-font-size` · `--xh-combobox-group-label-font-weight` · `--xh-combobox-group-label-px` · `--xh-combobox-group-label-py` · `--xh-combobox-input-font-size` · `--xh-combobox-item-bg-hover` · `--xh-combobox-item-fg` · `--xh-combobox-item-fg-selected` · `--xh-combobox-item-font-size` · `--xh-combobox-item-font-weight-selected` · `--xh-combobox-item-gap` · `--xh-combobox-item-indicator-fg` · `--xh-combobox-item-indicator-size` · `--xh-combobox-item-leading` · `--xh-combobox-item-px` · `--xh-combobox-item-py` · `--xh-combobox-item-radius` · `--xh-combobox-label-fg` · `--xh-combobox-label-font-size` · `--xh-combobox-label-font-weight` · `--xh-combobox-placeholder-fg`

## 动效

关键帧 `xh-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 外面套[表单字段](./field)。

## 最佳实践

- 异步候选要有在途与空态两种反馈，用户才知道是在找还是没有。
- 高亮匹配片段用[文本高亮](./highlight)，让用户看清为什么这条被选出来。

## 反模式

- 允许自由文本却不告诉用户——他以为自己选中了一条，其实提交了一段文字。
- 输入一个字符就发一次请求。
