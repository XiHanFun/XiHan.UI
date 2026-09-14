# DatePicker 日期选择器 <Badge type="info" text="alpha" />

将可键入的分段日期框、日历触发器和选择浮层组合成一个字段。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/date-picker" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/date-picker.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/date-picker" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/date-picker" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/date-picker.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

输入或选择日期

<XhDemo src="date-picker/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="date-picker"`：`root` · `label` · **`control`** · `segment-group` · `trigger` · `clear-trigger` · `positioner` · **`content`** · `preset-group` · `preset` · **`calendar`** · `time-column` · `time-item` · `confirm-trigger`

## 示例

### 不可用日期

禁止选择周末

<XhDemo src="date-picker/03-unavailable" />

### 状态

禁用、只读与校验失败

<XhDemo src="date-picker/04-state" />

### 快捷选项

提供常用日期

<XhDemo src="date-picker/05-shortcuts" />

### 日期与时间

同时选择日期和时间

<XhDemo src="date-picker/07-datetime" />

### 周期选择

granularity 决定输入行铺哪几段、浮层铺哪一档格子

<XhDemo src="date-picker/08-granularity" />

## 设计指引

### 何时使用

- 用户需要查看月份和星期信息后选择日期。
- 需要选择日期时间，或一次挑多个不连续的日子。

### 何时不用

- 用户已知确切日期且只需要键盘输入：使用[日期字段](./date-field)。
- 要挑的是一段起止：用[日期范围选择器](./date-range-picker)。
- 只要时间：用[时间选择器](./time-picker)。

### 特性

- `granularity` 支持 day / week / month / quarter / year，`selectionMode` 独立控制单选或多选。
- 周选择直接渲染整周周期格；不再需要 `weekSelection` 特殊开关。
- `min`、`max` 与 `isDateUnavailable` 限制可选日期。
- `presets` 提供常用日期快捷项。
- `showTime` 在 `granularity=day + selectionMode=single` 时让输入行显示完整日期时间，并加入时、分或秒选择列。
- 日期时间组合面板让时间列与日期内容区从同一水平线开始；各时间列只纵向滚动，底部操作独占一行。
- 输入值、展开状态和聚焦日期均可受控。
- 点击输入行可以继续逐段键入，点击日历图标则把焦点送入日历；展开期间输入框保持激活边界。
- 填齐了但越界即整个字段标为不合法，也可以用 `invalid` 显式声明。
- 切换粒度会清空旧选择，输入段、网格和周期边界随后一起切换，不做隐式转换。
- 空值时显示日历入口；有值且渲染了清空按钮时，由清空按钮原位接替日历图标。
- 聚焦边界、段位强调与日期格按压都使用短过渡；减弱动效仍由全局动效轴收敛。

### 组合

- 浮层里内嵌[日历选择器](./calendar-picker)，翻月、钻层与键盘导航都在它身上。
- 输入行内嵌[日期字段](./date-field)的段位，逐段键入与加减走它。

### 最佳实践

- 使用明确的字段标签。
- 标准输入行应同时包含清空按钮与日历图标触发器；二者按值互斥显示。参与表单时同时渲染隐藏输入。
- 默认只展开一个日历面板；需要多面板时显式传 `visibleCount`。
- 需要统一查询值时，使用 `calendarPeriodValue(granularity, 'single', value)` 得到周期首尾与回显键。
- 快速选年可在 `year` 网格中渲染受范围约束的年份集合；网格使用三列紧凑布局与内部滚动，不再靠十年翻页堆叠大块空白。
- 不可用日期应同时提供原因。
- 常用日期优先提供快捷项。

### 反模式

- 未经说明就预先选择今天。
- 让浮层遮挡当前输入值。
- 用多选模拟区间：中间的日子不会自动补齐，也没有拖选与预览。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-date-picker>` |
| Vue 组件 | `XhDatePickerCalendar` `XhDatePickerCell` `XhDatePickerCellTrigger` `XhDatePickerClearTrigger` `XhDatePickerConfirmTrigger` `XhDatePickerContent` `XhDatePickerControl` `XhDatePickerGrid` `XhDatePickerGridBody` `XhDatePickerGridHead` `XhDatePickerHeader` `XhDatePickerHeading` `XhDatePickerHeadingMonthTrigger` `XhDatePickerHeadingYearTrigger` `XhDatePickerHiddenInput` `XhDatePickerLabel` `XhDatePickerNextTrigger` `XhDatePickerNextYearTrigger` `XhDatePickerPositioner` `XhDatePickerPreset` `XhDatePickerPresetGroup` `XhDatePickerPrevTrigger` `XhDatePickerPrevYearTrigger` `XhDatePickerRoot` `XhDatePickerSegment` `XhDatePickerSegmentGroup` `XhDatePickerTimePanel` `XhDatePickerTrigger` `XhDatePickerWeekDay` `XhDatePickerWeekNumber` `XhDatePickerWeekRow` |
| 组合式函数 | `useDatePicker` |
| 状态机 | `datePickerMachine` |
| 皮肤 | `@xihan-ui/styles/date-picker.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| string[]` |  | 选中值，ISO 串。给定即受控：读直取 prop，写只发 onValueChange 不落内部值。 单选可写裸串，内部一律归一成数组。 |
| `defaultValue` | `string \| string[]` |  |  |
| `open` | `boolean` |  | 展开态。给定即受控：内部不再自改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `min` | `string` |  | 可选范围下界（含当天），ISO 串。日历与分段输入共用这一条。 |
| `max` | `string` |  | 可选范围上界（含当天），ISO 串。 |
| `locale` | `string` |  | 决定周首日、月份文案与段位先后（zh-CN 年月日、en-US 月日年）。 不给按宿主语言，宿主也没有时按 en-US。 |
| `timeZone` | `string` |  | 判定「今天」与格式化文案用的时区，默认取宿主本地时区。 |
| `selectionMode` | `CalendarPickerSelectionMode` |  | 选择模式，默认 single。区间选择是另一个组件（日期范围选择器）。 |
| `isDateUnavailable` | `(value: string) => boolean` |  | 不可用判定，收 ISO 串。界外与它判真的日子同等对待。 |
| `disabled` | `boolean` |  | 整个控件禁用：trigger 转原生 disabled，段位退出 Tab 序，日历格子全转 aria-disabled。 |
| `readOnly` | `boolean` |  | 只读：浮层照常展开、日历照常翻月浏览，但选中值改不动。 |
| `invalid` | `boolean` |  | 校验失败：段位报 aria-invalid，各角色节点带 data-invalid。 不给也会自己判：填齐了但越界。 |
| `required` | `boolean` |  | 必填标注，落到每一段的 aria-required 上。 |
| `name` | `string` |  | 表单字段名；给了隐藏输入才带 name，ISO 串随表单一并提交。 |
| `granularity` | `CalendarGranularity` |  | 选择粒度；与 selectionMode 正交。输入行与周期网格都由它决定。 |
| `activeView` | `CalendarView` |  | 面板此刻钻到了哪一层。给定即受控；缺省跟着 granularity，每次展开都回到目标粒度。 点标题里的年 / 月会改它。 没有配套的 defaultActiveView：面板每次展开都会重置这一档，非受控初值没有生效的时刻， 发出去也观察不到任何效果。要改初始层级请用 granularity。 |
| `segments` | `DateSegmentSet` |  | 输入行铺哪几段。不给就按 granularity 推：按周出「2026-33」、按月出「2026-05」、 按季度出「2026-Q2」、按年出「2026」，按天则按 locale 排年月日。 |
| `presets` | `DatePickerPreset[]` |  | 快捷选项（「今天」「明天」这类）。给了就在浮层里多出一列，点一下整份写进选中值。 日子要算好再传：连接层每帧求值，把 `today()` 放进渲染期会跨零点算出两个答案。 与 selectionMode 不配（单选给了多条）、落在 min/max 之外或被 isDateUnavailable 判掉的那条 自动按不下去；showTime 下写进去的日期带上此刻已挑的时间。 |
| `visibleCount` | `number` |  | 展示几个连续日历面板；默认 1。 |
| `fixedWeeks` | `boolean` |  | 日历恒渲染六行，默认开。关掉后网格按当月实际周数收，翻页时浮层高度会跟着变。 |
| `defaultFocusedValue` | `string` |  | 初始聚焦日，ISO 串；它同时决定展开时先落在哪一页。 不给就退回首个选中值，再退回今天。表单重置回到这一份。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定输入行的描边与底色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，输入行与浮层里的日历格一并换档。 |
| `placement` | `Placement` |  |  |
| `dir` | `Direction` |  | 文字方向，缺省 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  |  |
| `translations` | `Partial<DatePickerTranslations>` |  |  |
| `closeOnSelect` | `boolean` |  | 选完即收起，默认 true。多选不收起。 |
| `showTime` | `boolean` |  | 一体化时间：值升格为 'YYYY-MM-DDTHH:mm[:ss]'，面板里多出时间列， 选完日子不收起、由确认按钮收口。只在 day + single 下生效。 |
| `timeGranularity` | `DatePickerTimeGranularity` |  | showTime 的时间段精度，默认 minute。 |
| `onValueChange` | `(details: DatePickerValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onOpenChange` | `(details: DatePickerOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onFocusedValueChange` | `(details: DatePickerFocusChangeDetails) => void` |  | 聚焦日变化（方向键、翻月、展开、段位输入都会发）。 网格由外部渲染，不监听这条日历不会换月。 |
| `onActiveViewChange` | `(details: CalendarViewChangeDetails) => void` |  | 面板钻到了哪一层（点标题钻上、点格子钻下都会发）；受控时是唯一出口。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `DatePickerValueChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |
| `open-change` | `DatePickerOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |
| `focused-value-change` | `DatePickerFocusChangeDetails` | 聚焦日变化（意味着展示月可能换了）；detail 为 `{ focusedValue: string }`，作者据此重画网格 |
| `active-view-change` | `CalendarViewChangeDetails` | 钻到了另一层（点标题钻上、点格子钻下）；detail 为 `{ activeView: 'day'\|'week'\|'month'\|'quarter'\|'year' }`，作者据此重画网格 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhDatePickerPreset` | `default` | — | 条目内容；不写就用数据里的 label。 |
| `XhDatePickerPresetGroup` | `default` | `DatePickerPresetsSlotProps` | 自己铺条目；不写就按 presets 数据自动铺，两者产出的 DOM 一致。 |
| `XhDatePickerRoot` | `default` | `DatePickerRootSlotProps` |  |
| `XhDatePickerSegment` | `default` | `DatePickerSegmentSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `control` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `preset` | 'checked' \| 'unchecked' |
| `calendar` | 'open' \| 'closed' |
| `time-item` | 'checked' \| 'unchecked' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `VALUE.SET` · `VALUE.CLEAR` · `FOCUSED.SET` · `VIEW.SET` · `FORM.RESET`

**判据**：`isOpenControlled` · `closesOnSelect`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `value` | `string[]` | 选中集合，ISO 串；形状不随模式变。 |
| `valueAsString` | `string \| null` | 首个选中值；无选中时为 null。 |
| `selectionMode` | `CalendarPickerSelectionMode` |  |
| `periodValue` | `CalendarPeriodValue \| null` | single 的规范化周期值；multiple 没有连续区间语义，返回 null。 |
| `focusedValue` | `string` | 生效聚焦日（三路收口后的结果），恒非空。日历展示哪个月由它决定。 |
| `granularity` | `CalendarGranularity` | 作者要挑的粒度。 |
| `activeView` | `CalendarView` | 面板此刻钻到了哪一层。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` | 校验失败：作者标的或越界。 |
| `canClear` | `boolean` | 清空按钮此刻可不可按。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string[]) => void` |  |
| `clear` | `() => void` |  |
| `setActiveView` | `(next: CalendarView) => void` | 直接钻到某一层。 |
| `presets` | `readonly DatePickerPresetState[]` | 快捷选项逐条的样子，数据顺序。没给 presets 时为空数组。 |
| `showTime` | `boolean` | showTime 生效（开了且是单选模式）。 |
| `timeColumns` | `readonly TimePickerColumn<DatePickerTimeUnit>[]` | 时间列（时/分[/秒]）；没开 showTime 时为空数组。 |
| `timeValue` | `string \| null` | 当前时间段（'HH:mm[:ss]'）；还没有值时为 null。 |
| `calendar` | `CalendarPickerApi<T>` | 内嵌日历：选日期、翻月、键盘导航都在它身上。 |
| `field` | `DatePickerFieldApi<T>` | 内嵌分段输入。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getSegmentGroupProps` | `() => T['element']` | role=group 的分段容器，段位挂在它里面。 |
| `getTriggerProps` | `() => T['button']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getPresetGroupProps` | `() => T['element']` | 快捷选项列（role=listbox）；没给 presets 时带 hidden。 |
| `getPresetProps` | `(props: DatePickerPresetProps) => T['element']` | 一条快捷选项（role=option）：点按把整份日期写进选中值。 |
| `getCalendarProps` | `() => T['element']` | 内嵌日历的挂载点，同时充当日历的根节点。 |
| `getTimeColumnProps` | `(props: DatePickerTimeColumnProps) => T['element']` | 时间列容器（时/分[/秒]各一列）；没开 showTime 时带 hidden。 |
| `getTimeItemProps` | `(props: DatePickerTimeItemProps) => T['element']` | 时间选项：点按把该单位写进值（没有日期时以聚焦日为日期段起值）。 |
| `getConfirmTriggerProps` | `() => T['button']` | 确认按钮：showTime 的收口；没开 showTime 时带 hidden。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/#kbd_label)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger, closed | 展开日历浮层，焦点落到当前聚焦日那一格 |
| `Enter` / `Space` | focus in trigger, open | 收起浮层，焦点回到 trigger |
| `Escape` | open | 收起浮层并把焦点还给展开前那个控件（通常是 trigger），选中值不变 |
| `Tab` / `Shift+Tab` | open | 不拦按键：焦点按 Tab 序列自然离开，浮层随即收起且不抢回焦点 |
| `Enter` / `Space` | open, focus in grid | 选中聚焦日（由日历完成）；closeOnSelect 时收起浮层，多选不收起 |
| `ArrowUp` / `ArrowDown` / `Home` / `End` | open, focus in 快捷选项列 | 在快捷选项之间移动焦点，到头回绕；不写值 |
| `Enter` / `Space` | open, focus in 某条快捷选项 | 把这条快捷选项整份写进选中值；closeOnSelect 时收起浮层 |
| `Alt+ArrowDown` | focus in 某一段, closed, not disabled | 展开浮层并把焦点送进去；触发钮是可选部件，键盘那条入口不能只挂在它身上 |
| `Enter` | focus in 某一段, open | 收起浮层。段位里敲出来的值不触发「选完即收」（那时人还在打字），这是那条路的收口手势 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `segment-group` | `aria-disabled` | 'true' \| 'false' |
| `segment-group` | `aria-labelledby` | `label` 部件的 id |
| `segment-group` | `role` | 'group' |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `trigger` | `aria-labelledby` | `label` 部件的 id |
| `clear-trigger` | `aria-label` | label.clearTrigger |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-labelledby` | `label` 部件的 id |
| `content` | `aria-modal` | 'false' |
| `content` | `role` | 'dialog' |
| `preset-group` | `aria-disabled` | 'true' \| 'false' |
| `preset-group` | `aria-label` | label.presets |
| `preset-group` | `aria-multiselectable` | 'false' |
| `preset-group` | `aria-orientation` | 'vertical' |
| `preset-group` | `role` | 'listbox' |
| `preset` | `aria-disabled` | 'true' \| 'false' |
| `preset` | `aria-selected` | 'true' \| 'false' |
| `preset` | `role` | 'option' |
| `time-column` | `aria-disabled` | 'true' \| 'false' |
| `time-column` | `aria-label` | label[unit] |
| `time-column` | `aria-multiselectable` | 'false' |
| `time-column` | `aria-orientation` | 'vertical' |
| `time-column` | `role` | 'listbox' |
| `time-item` | `aria-selected` | 'true' \| 'false' |
| `time-item` | `role` | 'option' |

## 样式参考

### 皮肤

`@xihan-ui/styles/date-picker.css` 使用 `[data-scope="date-picker"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

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
| `segment-group` | `data-complete` | ''（条件成立时才出现） |
| `segment-group` | `data-disabled` | ''（条件成立时才出现） |
| `segment-group` | `data-empty` | ''（条件成立时才出现） |
| `segment-group` | `data-invalid` | ''（条件成立时才出现） |
| `segment-group` | `data-out-of-range` | ''（条件成立时才出现） |
| `segment-group` | `data-readonly` | ''（条件成立时才出现） |
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
| `preset` | `data-value` | v |
| `calendar` | `data-disabled` | ''（条件成立时才出现） |
| `calendar` | `data-readonly` | ''（条件成立时才出现） |
| `calendar` | `data-state` | 'open' \| 'closed' |
| `time-column` | `data-unit` | live[at]!.getAttribute('data-unit') as DatePickerTime… |
| `time-item` | `data-state` | 'checked' \| 'unchecked' |
| `time-item` | `data-unit` | live[at]!.getAttribute('data-unit') as DatePickerTime… |
| `time-item` | `data-value` | v |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-date-picker-action-bg` | `clear-trigger`<br>`trigger` | `background` | `default`<br>`disabled` | `transparent` | date-picker 的 clear-trigger、trigger 部件 background 覆盖槽。 |
| `--xh-date-picker-action-bg-active` | `clear-trigger`<br>`trigger` | `background` | `active`<br>`not(:disabled)`<br>`state=open` | `--xh-bg-subtle-active` | date-picker 的 clear-trigger、trigger 部件 background 覆盖槽。 |
| `--xh-date-picker-action-bg-hover` | `clear-trigger`<br>`trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | date-picker 的 clear-trigger、trigger 部件 background 覆盖槽。 |
| `--xh-date-picker-action-fg` | `clear-trigger`<br>`trigger` | `color` | `default` | `--xh-fg-muted` | date-picker 的 clear-trigger、trigger 部件 color 覆盖槽。 |
| `--xh-date-picker-action-fg-hover` | `clear-trigger`<br>`trigger` | `color` | `hover`<br>`not(:disabled)`<br>`state=open` | `--xh-fg-default` | date-picker 的 clear-trigger、trigger 部件 color 覆盖槽。 |
| `--xh-date-picker-action-font-size` | `clear-trigger`<br>`trigger` | `font-size` | `default` | `--xh-text-secondary-size` | date-picker 的 clear-trigger、trigger 部件 font-size 覆盖槽。 |
| `--xh-date-picker-action-radius` | `clear-trigger`<br>`trigger` | `border-radius` | `default` | `--xh-shape-control` | date-picker 的 clear-trigger、trigger 部件 border-radius 覆盖槽。 |
| `--xh-date-picker-action-size` | `clear-trigger`<br>`trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-action-size` | date-picker 的 clear-trigger、trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-date-picker-calendar-gap` | `calendar`<br>`time-column` | `gap`<br>`margin-block-start` | `default` | `--xh-space-2` | date-picker 的 calendar、time-column 部件 gap、margin-block-start 覆盖槽。 |
| `--xh-date-picker-column-divider` | `calendar`<br>`preset-group`<br>`time-column` | `background`<br>`border-block-end`<br>`border-inline-end`<br>`border-inline-start` | `@media (min-width: 768px)`<br>`default`<br>`has(+ [data-part='time-column'])` | `--xh-material-frosted-separator` | date-picker 的 calendar、preset-group、time-column 部件 background、border-block-end、border-inline-end、border-inline-start 覆盖槽。 |
| `--xh-date-picker-confirm-trigger-bg` | `confirm-trigger` | `background` | `default` | `--xh-_date-picker-accent` | date-picker 的 confirm-trigger 部件 background 覆盖槽。 |
| `--xh-date-picker-confirm-trigger-bg-active` | `confirm-trigger` | `background` | `active` | `--xh-_date-picker-accent-active` | date-picker 的 confirm-trigger 部件 background 覆盖槽。 |
| `--xh-date-picker-confirm-trigger-bg-hover` | `confirm-trigger` | `background` | `hover` | `--xh-_date-picker-accent-hover` | date-picker 的 confirm-trigger 部件 background 覆盖槽。 |
| `--xh-date-picker-confirm-trigger-fg` | `confirm-trigger` | `color` | `default` | `--xh-_date-picker-accent-fg` | date-picker 的 confirm-trigger 部件 color 覆盖槽。 |
| `--xh-date-picker-confirm-trigger-h` | `confirm-trigger` | `block-size` | `default` | `--xh-control-h-sm` | date-picker 的 confirm-trigger 部件 block-size 覆盖槽。 |
| `--xh-date-picker-confirm-trigger-px` | `confirm-trigger` | `padding-inline` | `default` | `--xh-control-px-sm` | date-picker 的 confirm-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-date-picker-confirm-trigger-radius` | `confirm-trigger` | `border-radius` | `default` | `--xh-shape-control` | date-picker 的 confirm-trigger 部件 border-radius 覆盖槽。 |
| `--xh-date-picker-confirm-trigger-shadow` | `confirm-trigger` | `box-shadow` | `default` | `--xh-_date-picker-confirm-highlight` | date-picker 的 confirm-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-date-picker-content-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `none` | date-picker 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-date-picker-content-bg` | `content` | `background` | `default` | `--xh-bg-surface` | date-picker 的 content 部件 background 覆盖槽。 |
| `--xh-date-picker-content-border` | `content` | `border` | `default` | `--xh-border-subtle` | date-picker 的 content 部件 border 覆盖槽。 |
| `--xh-date-picker-content-fg` | `content` | `color` | `default` | `--xh-fg-default` | date-picker 的 content 部件 color 覆盖槽。 |
| `--xh-date-picker-content-highlight` | `content` | `background` | `default` | `transparent` | date-picker 的 content 部件 background 覆盖槽。 |
| `--xh-date-picker-content-px` | `content` | `padding-inline` | `@media (width < 768px)`<br>`default` | `--xh-space-2` | date-picker 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-date-picker-content-py` | `content` | `padding-block` | `default` | `--xh-space-2` | date-picker 的 content 部件 padding-block 覆盖槽。 |
| `--xh-date-picker-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | date-picker 的 content 部件 border-radius 覆盖槽。 |
| `--xh-date-picker-content-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | date-picker 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-date-picker-control-bg` | `control` | `background` | `default` | `--xh-_date-picker-control-bg` | date-picker 的 control 部件 background 覆盖槽。 |
| `--xh-date-picker-control-bg-disabled` | `control` | `background` | `disabled` | `--xh-bg-subtle` | date-picker 的 control 部件 background 覆盖槽。 |
| `--xh-date-picker-control-bg-hover` | `control` | `background` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly])`<br>`readonly` | `--xh-_date-picker-control-bg-hover` | date-picker 的 control 部件 background 覆盖槽。 |
| `--xh-date-picker-control-bg-readonly` | `control` | `background` | `readonly` | `--xh-bg-subtle` | date-picker 的 control 部件 background 覆盖槽。 |
| `--xh-date-picker-control-border` | `control` | `border` | `default` | `--xh-_date-picker-control-border` | date-picker 的 control 部件 border 覆盖槽。 |
| `--xh-date-picker-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`state=open` | `--xh-_tone` | date-picker 的 control 部件 border-color 覆盖槽。 |
| `--xh-date-picker-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-invalid])` | `--xh-_date-picker-control-border-hover` | date-picker 的 control 部件 border-color 覆盖槽。 |
| `--xh-date-picker-control-border-invalid` | `control` | `border-color` | `invalid` | `--xh-border-invalid` | date-picker 的 control 部件 border-color 覆盖槽。 |
| `--xh-date-picker-control-fg` | `control` | `color` | `default` | `--xh-fg-default` | date-picker 的 control 部件 color 覆盖槽。 |
| `--xh-date-picker-control-gap` | `control` | `gap` | `default` | `--xh-_date-picker-gap` | date-picker 的 control 部件 gap 覆盖槽。 |
| `--xh-date-picker-control-h` | `control` | `block-size` | `default` | `--xh-_date-picker-control-h` | date-picker 的 control 部件 block-size 覆盖槽。 |
| `--xh-date-picker-control-min-w` | `control`<br>`root` | `min-inline-size` | `default` | `--xh-control-min-w` | date-picker 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-date-picker-control-px` | `control` | `padding-inline` | `default` | `--xh-_date-picker-control-px` | date-picker 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-date-picker-control-radius` | `control` | `border-radius` | `default` | `--xh-shape-surface` | date-picker 的 control 部件 border-radius 覆盖槽。 |
| `--xh-date-picker-control-shadow` | `control` | `box-shadow` | `default` | `--xh-_date-picker-control-shadow` | date-picker 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-date-picker-font-size` | `segment-group` | `font-size` | `default` | `--xh-_date-picker-font-size` | date-picker 的 segment-group 部件 font-size 覆盖槽。 |
| `--xh-date-picker-gap` | `root` | `gap` | `default` | `--xh-space-1` | date-picker 的 root 部件 gap 覆盖槽。 |
| `--xh-date-picker-icon-size` | `positioner`<br>`root` | `--xh-icon-size` | `default`<br>`is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | date-picker 的 positioner、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-date-picker-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | date-picker 的 label 部件 color 覆盖槽。 |
| `--xh-date-picker-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | date-picker 的 label 部件 color 覆盖槽。 |
| `--xh-date-picker-label-font-size` | `label` | `font-size` | `default` | `--xh-_date-picker-label-font-size` | date-picker 的 label 部件 font-size 覆盖槽。 |
| `--xh-date-picker-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | date-picker 的 label 部件 font-weight 覆盖槽。 |
| `--xh-date-picker-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | date-picker 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-date-picker-literal-fg` | `segment-group` | `color` | `not([data-scope])` | `--xh-fg-subtle` | date-picker 的 segment-group 部件 color 覆盖槽。 |
| `--xh-date-picker-max-h` | `content` | `max-block-size` | `default` | `--xh-viewport-h-lg` | date-picker 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-date-picker-panel-divider` | `calendar` | `border-block-start`<br>`border-inline-start` | `@media (min-width: 768px)`<br>`default` | `--xh-material-frosted-separator` | date-picker 的 calendar 部件 border-block-start、border-inline-start 覆盖槽。 |
| `--xh-date-picker-panel-gap` | `calendar`<br>`preset-group` | `padding-block-start`<br>`padding-inline-start` | `@media (min-width: 768px)`<br>`default` | `--xh-space-3` | date-picker 的 calendar、preset-group 部件 padding-block-start、padding-inline-start 覆盖槽。 |
| `--xh-date-picker-preset-bg-hover` | `preset` | `background` | `disabled`<br>`is(:hover, :focus-visible)`<br>`not([data-disabled])` | `--xh-bg-subtle` | date-picker 的 preset 部件 background 覆盖槽。 |
| `--xh-date-picker-preset-check-fg` | `preset` | `background-color` | `default` | `--xh-_date-picker-check-fg` | date-picker 的 preset 部件 background-color 覆盖槽。 |
| `--xh-date-picker-preset-check-size` | `preset` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default` | `--xh-glyph-size-sm` | date-picker 的 preset 部件 block-size、inline-size、padding-inline-end 覆盖槽。 |
| `--xh-date-picker-preset-fg-disabled` | `preset` | `background-color`<br>`color` | `disabled` | `--xh-fg-disabled` | date-picker 的 preset 部件 background-color、color 覆盖槽。 |
| `--xh-date-picker-preset-fg-selected` | `preset` | `color` | `state=checked` | `inherit` | date-picker 的 preset 部件 color 覆盖槽。 |
| `--xh-date-picker-preset-group-gap` | `preset-group` | `gap` | `default` | `--xh-list-option-gap` | date-picker 的 preset-group 部件 gap 覆盖槽。 |
| `--xh-date-picker-preset-group-h` | `preset-group` | `max-block-size` | `default` | `--xh-viewport-h-lg` | date-picker 的 preset-group 部件 max-block-size 覆盖槽。 |
| `--xh-date-picker-preset-group-padding` | `preset-group` | `padding` | `default` | `--xh-space-1` | date-picker 的 preset-group 部件 padding 覆盖槽。 |
| `--xh-date-picker-preset-px` | `preset` | `inset-inline-end`<br>`padding-inline`<br>`padding-inline-end` | `default` | `--xh-space-3` | date-picker 的 preset 部件 inset-inline-end、padding-inline、padding-inline-end 覆盖槽。 |
| `--xh-date-picker-preset-py` | `preset` | `padding-block` | `default` | `--xh-space-1` | date-picker 的 preset 部件 padding-block 覆盖槽。 |
| `--xh-date-picker-preset-radius` | `preset` | `border-radius` | `default` | `--xh-shape-control` | date-picker 的 preset 部件 border-radius 覆盖槽。 |
| `--xh-date-picker-time-column-gap` | `time-column` | `gap` | `default` | `0` | date-picker 的 time-column 部件 gap 覆盖槽。 |
| `--xh-date-picker-time-column-h` | `time-column` | `block-size` | `default` | `--xh-viewport-h-md` | date-picker 的 time-column 部件 block-size 覆盖槽。 |
| `--xh-date-picker-time-column-min-w` | `time-column` | `min-inline-size` | `default` | `--xh-overlay-column-min-w` | date-picker 的 time-column 部件 min-inline-size 覆盖槽。 |
| `--xh-date-picker-time-column-min-w-mobile` | `time-column` | `min-inline-size` | `@media (width < 768px)` | `2.75rem` | date-picker 的 time-column 部件 min-inline-size 覆盖槽。 |
| `--xh-date-picker-time-column-offset` | `time-column` | `margin-block-start` | `default` | `--xh-control-h-sm` | date-picker 的 time-column 部件 margin-block-start 覆盖槽。 |
| `--xh-date-picker-time-column-padding` | `time-column` | `padding-block` | `default` | `--xh-space-1` | date-picker 的 time-column 部件 padding-block 覆盖槽。 |
| `--xh-date-picker-time-column-px` | `time-column` | `padding-inline` | `default` | `0` | date-picker 的 time-column 部件 padding-inline 覆盖槽。 |
| `--xh-date-picker-time-column-px-mobile` | `time-column` | `padding-inline` | `@media (width < 768px)` | `0` | date-picker 的 time-column 部件 padding-inline 覆盖槽。 |
| `--xh-date-picker-time-item-bg-hover` | `time-column`<br>`time-item` | `background` | `is(:hover, :focus-visible)`<br>`not([aria-disabled='true'])` | `--xh-bg-subtle` | date-picker 的 time-column、time-item 部件 background 覆盖槽。 |
| `--xh-date-picker-time-item-check-fg` | `time-item` | `background-color` | `default` | `--xh-_date-picker-check-fg` | date-picker 的 time-item 部件 background-color 覆盖槽。 |
| `--xh-date-picker-time-item-check-size` | `time-item` | `block-size`<br>`inline-size`<br>`inset-inline-end`<br>`padding-inline` | `@media (width < 768px)`<br>`default` | `--xh-_date-picker-time-item-check-size` | date-picker 的 time-item 部件 block-size、inline-size、inset-inline-end、padding-inline 覆盖槽。 |
| `--xh-date-picker-time-item-fg-selected` | `time-item` | `color` | `state=checked` | `--xh-_date-picker-time-item-fg-selected` | date-picker 的 time-item 部件 color 覆盖槽。 |
| `--xh-date-picker-time-item-h` | `time-item` | `block-size` | `default` | `--xh-control-h-sm` | date-picker 的 time-item 部件 block-size 覆盖槽。 |
| `--xh-date-picker-time-item-px` | `time-item` | `inset-inline-end`<br>`padding-inline` | `default` | `--xh-space-0_5` | date-picker 的 time-item 部件 inset-inline-end、padding-inline 覆盖槽。 |
| `--xh-date-picker-time-item-py` | `time-item` | `padding-block` | `default` | `0` | date-picker 的 time-item 部件 padding-block 覆盖槽。 |
| `--xh-date-picker-time-item-radius` | `time-item` | `border-radius` | `default` | `--xh-shape-control` | date-picker 的 time-item 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `color` · `opacity` · `outline-color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤按视口分档：`min-width: 768px` · `width < 768px`。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
