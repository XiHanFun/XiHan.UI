# 时间选择器 <Badge type="info" text="time-picker" />

带浮层的时间录入：浮层里按时、分、秒分列滚动挑选。

## 何时使用

- 可选时间是离散的（每 15 分钟一档）。
- 需要限制可选时段（营业时间、可预约时段）。

## 何时不用

- 任意时间都可以、用户会直接打字：用[时间输入](./time-field)。

## 特性

- `step` 分列设定各列的步长。
- `max` 直接把界外的格从列里裁掉；分列还会随已选的时再裁一遍。
- `isTimeUnavailable` 逐格判断可选性。
- 浮层里可以放"此刻"与确认按钮。

## 示例

### 基础用法

点输入行任意处即展开，不必再去点小箭头；段位与列写的是同一个值，段上敲、列里挑，另一边当场跟着改口

<XhDemo src="time-picker/01-basic" />

### 分列步长

step=15 只裁浮层里的可选值（分列剩四格），段位上手打的分数不受它限制

<XhDemo src="time-picker/02-step" />

### 12 小时制

时列写的是显示值 01-12，落到哪个真实小时由上下午说了算：输入行里敲、浮层里挑都改它

<XhDemo src="time-picker/03-hour-cycle" />

### 精度到秒

granularity 同时决定输入行显示几段、浮层里排几列

<XhDemo src="time-picker/04-granularity" />

### 禁用 / 只读 / 校验失败

禁用整条退出 Tab 序，只读仍能展开浏览只是改不动值，invalid 只改标注

<XhDemo src="time-picker/05-state" />

### 可选时段

min / max 直接把界外的格从列里裁掉；分列还会随已选的时再裁一遍

<XhDemo src="time-picker/06-range" />

### 浮层里的操作按钮

列表下面这排按钮是作者自己的节点，键盘事件在它这一层收口，不再上交给列表

<XhDemo src="time-picker/07-actions" />

### 自定可选格

列里渲染哪几格由作者决定，午休两格整段拿掉；手打进段位的时被吸到下一个可约小时

<XhDemo src="time-picker/08-predicate" />

### 三轴

variant 决定描边与底怎么画、tone 决定用哪族颜色、size 换几何档；三者只落在 root，浮层里的格子一并跟着换

<XhDemo src="time-picker/09-axes" />

### 可选的触发钮

点输入行本来就展开，这个按钮不是必需的；要它是因为它才带 aria-haspopup / aria-expanded

<XhDemo src="time-picker/10-trigger" />

### 快捷选项

presets 在列旁边多排一列，点一条整份写进值并收起；时刻在组件外算好再传

<XhDemo src="time-picker/11-presets" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-time-picker>` |
| Vue 组件 | `XhTimePickerClearTrigger` `XhTimePickerColumn` `XhTimePickerContent` `XhTimePickerControl` `XhTimePickerHiddenInput` `XhTimePickerItem` `XhTimePickerLabel` `XhTimePickerPositioner` `XhTimePickerPreset` `XhTimePickerPresetGroup` `XhTimePickerRoot` `XhTimePickerSegment` `XhTimePickerSegmentGroup` `XhTimePickerTrigger` |
| 组合式函数 | `useTimePicker` |
| 状态机 | `timePickerMachine` |
| 皮肤 | `@xihan-ui/styles/time-picker.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="time-picker"`：**`root`** · `label` · **`control`** · `segment-group` · **`segment`** · **`trigger`** · `clear-trigger` · `positioner` · **`content`** · `preset-group` · `preset` · `column` · `item` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 受控值，ISO 时间串。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 |
| `defaultValue` | `string` |  |  |
| `open` | `boolean` |  | 展开态。给定即受控：内部不再自改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `min` | `string` |  | 下界（含）。裁掉浮层里落在界外的可选值，并把已填的越界值标注出来（不改写它）。 |
| `max` | `string` |  | 上界（含）。同上。 |
| `locale` | `string` |  | BCP 47 语言标记。决定上午/下午的文字，以及未显式给 hourCycle 时的小时制。 |
| `hourCycle` | `TimeHourCycle` |  | 小时制。不给则按 locale 推断，locale 也没有时用 24。 |
| `granularity` | `TimeGranularity` |  | 值精确到哪一段，默认 minute。它同时决定分段输入显示几段、浮层里排几列。 |
| `step` | `number` |  | 分列的步进（分钟），默认 1。只影响浮层里的可选值，不限制手打进去的分数。 |
| `presets` | `TimePickerPreset[]` |  | 快捷选项（「此刻」「上午 9 点」这类）。给了就在浮层里多出一列，点一下整份写进值并收起。 时刻要算好再传：连接层每帧求值，把`此刻`放进渲染期会每帧算出一个新答案。 解析不了或落在 min/max 之外的那条自动按不下去；带秒的时刻按 granularity 归一后再比对与写入。 |
| `disabled` | `boolean` |  | 禁用：分段输入整组退出 Tab 序列、触发器用原生 disabled，隐藏输入不参与提交。 |
| `readOnly` | `boolean` |  | 只读：浮层照常展开、列表照常浏览，但值改不动也清不掉。 |
| `invalid` | `boolean` |  | 校验失败标注。 |
| `required` | `boolean` |  | 必填标注（落到每段的 aria-required 上）。 |
| `name` | `string` |  | 表单字段名；给了隐藏输入才带 name，值随表单一并提交。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定输入行的描边与底色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，输入行与浮层里的格子一并换档。 |
| `placement` | `Placement` |  |  |
| `dir` | `Direction` |  | 文字方向，缺省 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  |  |
| `isTimeUnavailable` | `(value: string, unit: TimePickerColumnUnit) => boolean` |  | 逐值可选性。收两位补零的值与它所属的列——同一个 '30' 在分钟列与秒列不是一回事。 与 min/max 裁掉的值同等对待：判真的格子仍可聚焦，只是选不中。 连续区间用 min/max 表达即可，这条留给「每隔 15 分钟才可约」这类离散规则。 |
| `translations` | `Partial<TimePickerTranslations>` |  | 段位读屏名的覆盖；不给就用内置英文语义名。 |
| `onValueChange` | `(details: TimePickerValueChangeDetails) => void` |  |  |
| `onOpenChange` | `(details: TimePickerOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TimePickerValueChangeDetails` | 值变化；detail 为 `{ value: string }` |
| `open-change` | `TimePickerOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTimePickerColumn` | `default` | `TimePickerColumnSlotProps` |  |
| `XhTimePickerPreset` | `default` | — | 条目内容；不写就用数据里的 label。 |
| `XhTimePickerPresetGroup` | `default` | `TimePickerPresetsSlotProps` | 自己铺条目；不写就按 presets 数据自动铺，两者产出的 DOM 一致。 |
| `XhTimePickerRoot` | `default` | `TimePickerRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `control` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `preset` | 'checked' \| 'unchecked' |
| `column` | 'open' \| 'closed' |
| `item` | 'checked' \| 'unchecked' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `VALUE.SET` · `VALUE.CLEAR` · `SEGMENT.STEP` · `SEGMENT.DIGIT` · `SEGMENT.CLEAR` · `SEGMENT.PERIOD` · `SEGMENT.FOCUS` · `SEGMENT.BLUR` · `OPTION.FOCUS` · `ITEM.SELECT` · `FORM.RESET`

**判据**：`isOpenControlled` · `canEdit` · `closesOnPreset`

## connect API

`useTimePicker` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `value` | `string` | ISO 时间串；任一必填段为空时是空串。 |
| `empty` | `boolean` | 值为空串（还没填全）。 |
| `outOfRange` | `boolean` | 已填全但落在 min/max 之外。只是标注，不改写值。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `hourCycle` | `TimeHourCycle` | 实际生效的小时制（prop 没给时由 locale 推出来的那个）。 |
| `granularity` | `TimeGranularity` |  |
| `step` | `number` | 实际生效的分列步进。 |
| `segments` | `TimeSegmentType[]` | 此刻参与显示的段，文档序。未列入的段由 connect 打上 hidden 收起。 |
| `focusedSegment` | `TimeSegmentType \| null` | 焦点所在段；焦点在分段输入外时为 null。 |
| `columns` | `TimePickerColumn[]` | 此刻该排哪几列、每列有哪些可选值（已按 step 与 min/max 裁过）。作者据此渲染浮层。 |
| `focusedColumn` | `TimePickerColumnUnit \| null` |  |
| `focusedItem` | `string \| null` |  |
| `presets` | `readonly TimePickerPresetState[]` | 快捷选项逐条的样子，数据顺序。没给 presets 时为空数组。 |
| `canClear` | `boolean` | 清空按钮此刻可不可按。 |
| `getSegmentText` | `(props: TimePickerSegmentProps) => string` | 某一段该显示的文字（空段是占位串）。两个适配器都拿它填文本，保证同构。 |
| `getItemText` | `(props: TimePickerItemProps) => string` | 某一格该显示的文字。数字列就是格子自己的值，上下午列按 locale 给出「上午 / 下午」。 两个适配器都拿它填文本，保证同构。 |
| `isItemSelected` | `(props: TimePickerItemProps) => boolean` |  |
| `isItemDisabled` | `(props: TimePickerItemProps) => boolean` | 落在 min/max 之外（或整个控件禁用）：仍在列表里，但不可选、方向键跳过。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string) => void` |  |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getSegmentGroupProps` | `() => T['element']` | 段位与分隔符的外壳：占满盒里剩下的宽度，把尾部按钮顶到框内末端。 |
| `getSegmentProps` | `(props: TimePickerSegmentProps) => T['element']` | 分段输入：一段一个节点，与 TimeField 的段同构（role=spinbutton + roving tabindex）。 |
| `getTriggerProps` | `() => T['button']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getPresetGroupProps` | `() => T['element']` | 快捷选项列（role=listbox）；没给 presets 时带 hidden。 |
| `getPresetProps` | `(props: TimePickerPresetProps) => T['element']` | 一条快捷选项（role=option）：点按把整份时间写进值并收起浮层。 |
| `getColumnProps` | `(props: TimePickerColumnProps) => T['element']` |  |
| `getItemProps` | `(props: TimePickerItemProps) => T['element']` |  |
| `getHiddenInputProps` | `() => T['input']` | 表单出口：一份 type=hidden 的原生输入，随表单提交 ISO 串。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction)

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
| `ArrowUp` / `ArrowDown` / `Home` / `End` | open, focus in 快捷选项列 | 在快捷选项之间移动焦点，到头回绕；时分秒那几列的处理器在这一列内不参与 |
| `Enter` / `Space` | open, focus in 某条快捷选项, not disabled/readOnly | 把这条快捷选项整份写进值并收起浮层 |
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
| `Alt+ArrowDown` | focus in 某一段, closed, not disabled | 展开浮层并把焦点送进去；触发钮是可选部件，键盘那条入口不能只挂在它身上 |
| `Enter` | focus in 某一段, open | 收起浮层。段位里敲出来的值不触发「选完即收」（那时人还在打字），这是那条路的收口手势 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `control` | `aria-disabled` | 'true' \| 'false' |
| `control` | `aria-invalid` | 'true' \| 'false' |
| `control` | `aria-labelledby` | `label` 部件的 id |
| `control` | `role` | 'group' |
| `segment` | `aria-disabled` | 'true' \| 'false' |
| `segment` | `aria-invalid` | 'true' \| 'false' |
| `segment` | `aria-label` | prop('translations')?.[segment] |
| `segment` | `aria-readonly` | 'true' \| 'false' |
| `segment` | `aria-required` | 'true' \| 'false' |
| `segment` | `aria-valuemax` | range.max |
| `segment` | `aria-valuemin` | range.min |
| `segment` | `aria-valuenow` | segmentNumber(draft, segment, hourCycle) |
| `segment` | `aria-valuetext` | timeSegmentText(draft, segment, { hourCycle, locale }) |
| `segment` | `role` | 'spinbutton' |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `trigger` | `aria-labelledby` | `label` 部件的 id |
| `clear-trigger` | `aria-label` | props.translations.clearTrigger |
| `content` | `aria-labelledby` | `label` 部件的 id |
| `content` | `aria-modal` | 'false' |
| `content` | `role` | 'dialog' |
| `preset-group` | `aria-disabled` | 'true' \| 'false' |
| `preset-group` | `aria-label` | props.translations.presets |
| `preset-group` | `aria-multiselectable` | 'false' |
| `preset-group` | `aria-orientation` | 'vertical' |
| `preset-group` | `role` | 'listbox' |
| `preset` | `aria-disabled` | 'true' \| 'false' |
| `preset` | `aria-selected` | 'true' \| 'false' |
| `preset` | `role` | 'option' |
| `column` | `aria-disabled` | 'true' \| 'false' |
| `column` | `aria-label` | prop('translations')?.[unit] |
| `column` | `aria-multiselectable` | 'false' |
| `column` | `aria-orientation` | 'vertical' |
| `column` | `role` | 'listbox' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |

## 样式

默认皮肤 `@xihan-ui/styles/time-picker.css` 按部件选择：`[data-scope="time-picker"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-out-of-range` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-empty` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `control` | `data-state` | 'open' \| 'closed' |
| `segment-group` | `data-disabled` | ''（条件成立时才出现） |
| `segment-group` | `data-invalid` | ''（条件成立时才出现） |
| `segment-group` | `data-readonly` | ''（条件成立时才出现） |
| `segment` | `data-disabled` | ''（条件成立时才出现） |
| `segment` | `data-focus` | ''（条件成立时才出现） |
| `segment` | `data-invalid` | ''（条件成立时才出现） |
| `segment` | `data-placeholder` | ''（条件成立时才出现） |
| `segment` | `data-readonly` | ''（条件成立时才出现） |
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
| `preset` | `data-disabled` | ''（条件成立时才出现） |
| `preset` | `data-state` | 'checked' \| 'unchecked' |
| `column` | `data-disabled` | ''（条件成立时才出现） |
| `column` | `data-state` | 'open' \| 'closed' |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-highlighted` | ''（条件成立时才出现） |
| `item` | `data-state` | 'checked' \| 'unchecked' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-time-picker-action-bg` · `--xh-time-picker-action-bg-active` · `--xh-time-picker-action-bg-hover` · `--xh-time-picker-action-fg` · `--xh-time-picker-action-fg-hover` · `--xh-time-picker-action-font-size` · `--xh-time-picker-action-radius` · `--xh-time-picker-action-size` · `--xh-time-picker-column-divider` · `--xh-time-picker-column-gap` · `--xh-time-picker-column-h` · `--xh-time-picker-column-min-w` · `--xh-time-picker-column-px` · `--xh-time-picker-content-bg` · `--xh-time-picker-content-border` · `--xh-time-picker-content-fg` · `--xh-time-picker-content-max-h` · `--xh-time-picker-content-px` · `--xh-time-picker-content-py` · `--xh-time-picker-content-radius` · `--xh-time-picker-content-shadow` · `--xh-time-picker-control-bg` · `--xh-time-picker-control-bg-disabled` · `--xh-time-picker-control-bg-hover` · `--xh-time-picker-control-bg-readonly` · `--xh-time-picker-control-border` · `--xh-time-picker-control-border-focus` · `--xh-time-picker-control-border-hover` · `--xh-time-picker-control-border-invalid` · `--xh-time-picker-control-fg` · `--xh-time-picker-control-gap` · `--xh-time-picker-control-h` · `--xh-time-picker-control-min-w` · `--xh-time-picker-control-px` · `--xh-time-picker-control-radius` · `--xh-time-picker-control-shadow` · `--xh-time-picker-font-size` · `--xh-time-picker-gap` · `--xh-time-picker-icon-size` · `--xh-time-picker-item-bg-checked` · `--xh-time-picker-item-bg-checked-hover` · `--xh-time-picker-item-bg-hover` · `--xh-time-picker-item-fg` · `--xh-time-picker-item-fg-checked` · `--xh-time-picker-item-font-size` · `--xh-time-picker-item-px` · `--xh-time-picker-item-py` · `--xh-time-picker-item-radius` · `--xh-time-picker-item-weight-checked` · `--xh-time-picker-label-fg` · `--xh-time-picker-label-fg-disabled` · `--xh-time-picker-label-font-size` · `--xh-time-picker-label-font-weight` · `--xh-time-picker-layer` · `--xh-time-picker-placeholder-fg` · `--xh-time-picker-preset-bg-checked` · `--xh-time-picker-preset-bg-checked-hover` · `--xh-time-picker-preset-bg-hover` · `--xh-time-picker-preset-fg-checked` · `--xh-time-picker-preset-fg-disabled` · `--xh-time-picker-preset-group-gap` · `--xh-time-picker-preset-group-h` · `--xh-time-picker-preset-group-px` · `--xh-time-picker-preset-px` · `--xh-time-picker-preset-py` · `--xh-time-picker-preset-radius` · `--xh-time-picker-segment-bg-focus` · `--xh-time-picker-segment-bg-hover` · `--xh-time-picker-segment-fg-focus` · `--xh-time-picker-segment-px` · `--xh-time-picker-segment-radius`

## 动效

关键帧 `xh-overlay-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[日期选择器](./date-picker)配合组成日期时间选择。

## 最佳实践

- 把不可选的时段裁掉而不是置灰，列会短很多、也更快找到。
- 打开时把浮层滚到当前值那一格。

## 反模式

- 步长设成 1 分钟：一列六十格，滚起来没有尽头。
