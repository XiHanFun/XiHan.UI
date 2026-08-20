# 热力图 <Badge type="info" text="heatmap" />

按日历网格铺开的强度图：一格是一天，列是周、行是星期几，颜色深浅表示当天数值落在第几档。一整年的活跃度、提交量、值班密度都能在一屏里看完。

## 何时使用

- 看一段连续日期上「哪几天多、哪几天少」，以及有没有成片的空档。
- 强调节奏与分布，而不是某一天的准确数值。

## 何时不用

- 要挑日期、选区间：用[日历](./calendar)，它才有选中语义与表单出口。
- 要读准确数字、要排序筛选：用[表格](./table)。
- 只报一个总量或同比：用[统计数值](./statistic)。

## 特性

- 日期只认 ISO 的 `YYYY-MM-DD` 串，加减以 UTC 计，不引日期库。
- 摊网格与分档都是纯函数，可以脱离组件单独调用来预生成数据。
- 档数可调：不给 `thresholds` 就按区间内的最大值均分，给了就以它为准。
- 区间起点不在周首日时，排在它前面的几行整行往后错一列，不铺没有日期的占位格。
- 语气与尺寸两轴与其余组件同源。
- 两个适配器的作者侧写法不同，最终 DOM 一致：Vue 侧不写默认插槽就按区间自动铺开整棵树（月份行、七行星期、图例全由组件生成），另有一个 `cell` 插槽往每格里塞内容；Web Components 侧元素不生成任何结构，`root` / `grid` / `row` / `week-day-label` / `month-label` / `cell` / `legend` / `legend-item` 都要作者写进标记，元素只负责按部件名打属性。铺一整年（约 380 个节点）请自己拿 `buildHeatmapGrid` 的结果生成，`cell` 插槽是 Vue 专属、WC 侧没有对应物。

## 示例

### 基础用法

一段日期铺成周列 × 星期行的方格阵，颜色深浅表示当天数值落在第几档

<XhDemo src="heatmap/01-basic" />

### 语气换色

tone 决定用哪族颜色，色阶两端跟着换，格子的分档不变

<XhDemo src="heatmap/02-tone" />

### 尺寸

size 换格子边长与行首星期名的留白，一屏能放下的周数跟着变

<XhDemo src="heatmap/03-size" />

### 档数

levels 决定分几档，图例与格子共用同一条色阶

<XhDemo src="heatmap/04-levels" />

### 焦点明细

焦点落到某一天时报出日期与计数，键盘用户与鼠标用户看到同一份明细

<XhDemo src="heatmap/05-focus" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-heatmap>` |
| Vue 组件 | `XhHeatmapCell` `XhHeatmapGrid` `XhHeatmapLegend` `XhHeatmapLegendItem` `XhHeatmapMonthLabel` `XhHeatmapRoot` `XhHeatmapRow` `XhHeatmapWeekDayLabel` |
| 组合式函数 | `useHeatmap` |
| 状态机 | `heatmapMachine` |
| 皮肤 | `@xihan-ui/styles/heatmap.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="heatmap"`：**`root`** · **`grid`** · `row` · `week-day-label` · `month-label` · `cell` · `legend` · `legend-item`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `HeatmapDatum[]` |  | 数据，一天一条；同一天出现多次即累加，日期串不合法的条目丢掉。 |
| `startDate` | `string` |  | 区间起点（含），ISO YYYY-MM-DD。缺省或非法即空网格。 |
| `endDate` | `string` |  | 区间终点（含）。早于起点即空网格。 |
| `levels` | `number` |  | 档数，缺省 5；给了 thresholds 则档数由它定。 |
| `thresholds` | `number[]` |  | 各档的下界，升序；给了它 levels 不再起作用。 |
| `firstDayOfWeek` | `number` |  | 周首日，0 = 星期日，缺省 1。 |
| `locale` | `string` |  | 月份名与星期名的书写 locale，缺省 zh-CN。 |
| `dir` | `Direction` |  | 文字方向。只作显式覆盖：不写时方向从 DOM 现读， 左右方向键的语义跟着视觉次序走，上下键与它无关。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<HeatmapTranslations>` |  |  |
| `onCellFocus` | `(details: HeatmapCellFocusDetails) => void` |  | DOM 焦点落到某一天时通知一次；同一天重复聚焦不重复通知。 只由真实的聚焦触发，程序化挪锚点（`setFocusedDate`）不派这个回调。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `cell-focus` | `HeatmapCellFocusDetails` | 焦点落到某一天；detail 为 `{ date, count, level }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhHeatmapRoot` | `default` | `HeatmapRootSlotProps` |  |
| `XhHeatmapRoot` | `cell` | `HeatmapCellMeta` | 铺开网格时每一格的内容插槽，缺省是空格子。 |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`CELL.FOCUS` · `FOCUS.SET`

## connect API

`useHeatmap` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `grid` | `HeatmapGrid` | 网格模型：行是星期几、列是周次，另带月份段、星期名与档位标尺。 |
| `focusedDate` | `string \| null` | 最后一次被聚焦的那一天；从没聚焦过时为 null。 |
| `anchorDate` | `string \| null` | 当下占着 Tab 位的那一格：锚点还在区间里就是它，否则退回文档序头一格。 |
| `cellAt` | `(date: string) => HeatmapCellMeta \| null` | 按日期取一格；不在区间内给 null。 |
| `setFocusedDate` | `(date: string \| null) => void` | 挪动锚点。只改锚点不搬 DOM 焦点，也不派 `onCellFocus`； 需要焦点跟着走的自行调用元素的 focus()。 |
| `getRootProps` | `() => T['element']` |  |
| `getGridProps` | `() => T['element']` |  |
| `getRowProps` | `(props: HeatmapRowProps) => T['element']` |  |
| `getWeekDayLabelProps` | `(props: HeatmapWeekDayLabelProps) => T['element']` |  |
| `getMonthLabelProps` | `(props: HeatmapMonthLabelProps) => T['element']` |  |
| `getCellProps` | `(props: HeatmapCellProps) => T['element']` |  |
| `getLegendProps` | `() => T['element']` |  |
| `getLegendItemProps` | `(props: HeatmapLegendItemProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/grid/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | 总是 | 整张网格只占一个 Tab 位：焦点落到锚点那一格，一格都没有时落网格自己 |
| `ArrowLeft` | focus in grid | 焦点移到上一周的同一天；已在头一列则原地不动。dir=rtl 时改由 ArrowRight 承担 |
| `ArrowRight` | focus in grid | 焦点移到下一周的同一天；已在末一列则原地不动。dir=rtl 时改由 ArrowLeft 承担 |
| `ArrowUp` | focus in grid | 焦点上移一行，即前一天；走出区间则原地不动 |
| `ArrowDown` | focus in grid | 焦点下移一行，即后一天；走出区间则原地不动 |
| `Home` | focus in grid | 焦点移到本行头一格，即这个星期几在区间里最早的那一天 |
| `End` | focus in grid | 焦点移到本行末一格，即这个星期几在区间里最晚的那一天 |
| `Ctrl+Home` | focus in grid | 焦点移到整张网格文档序的头一格 |
| `Ctrl+End` | focus in grid | 焦点移到整张网格文档序的末一格 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `grid` | `aria-colcount` | grid.weekCount \| undefined |
| `grid` | `aria-label` | translations?.gridLabel |
| `grid` | `aria-readonly` | 'true' |
| `grid` | `aria-rowcount` | grid.rows.length \| undefined |
| `grid` | `role` | 'grid' |
| `row` | `aria-rowindex` | undefined \| row.weekDay + 1 |
| `row` | `role` | undefined \| 'row' |
| `week-day-label` | `aria-hidden` | 'true' |
| `month-label` | `aria-hidden` | 'true' |
| `cell` | `aria-colindex` | meta.weekIndex + 1 \| undefined |
| `cell` | `aria-label` | cellLabel({ date: cell.date, count, level }) |
| `cell` | `role` | 'gridcell' |
| `legend-item` | `aria-hidden` | 'true' |

- 网格是 `role="grid"` 且 `aria-readonly`，每行一个 `role="row"`，每格一个 `role="gridcell"`。
- 格子里没有文字，可及名字全靠 `translations.cellLabel` 拼出「日期 + 数值」，务必按本地语言改写它。
- 星期名、月份名与图例里的色块都是给眼睛看的坐标轴，一律 `aria-hidden`：每格自己就念得出完整日期与计数，再念一遍轴只是噪音。
- 图例容器本身不藏，写在色块旁边的「少 → 多」那句方向说明读屏念得到。
- 各行格子数不一定齐（首行可能少一格），格子上带 `aria-colindex`，读屏报出的列号才对得上。
- 整张网格只占一个 Tab 位，进去以后靠方向键走；左右键走的是相邻的周，上下键走的才是相邻的一天。

## 样式

默认皮肤 `@xihan-ui/styles/heatmap.css` 按部件选择：`[data-scope="heatmap"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `row` | `data-week-day` | undefined \| String(row.weekDay) |
| `week-day-label` | `data-week-day` | undefined \| String(label.weekDay) |
| `cell` | `data-level` | String(level) |
| `legend-item` | `data-level` | String(item.level) |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-heatmap-cell-border` · `--xh-heatmap-cell-radius` · `--xh-heatmap-cell-size` · `--xh-heatmap-empty` · `--xh-heatmap-fg` · `--xh-heatmap-font-size` · `--xh-heatmap-gap` · `--xh-heatmap-grid-gap` · `--xh-heatmap-gutter` · `--xh-heatmap-ink` · `--xh-heatmap-label-fg` · `--xh-heatmap-legend-gap` · `--xh-heatmap-py` · `--xh-heatmap-row-gap`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 列沿 inline 轴排开，整页切成 rtl 时列的视觉次序整体翻转，左右方向键的语义跟着翻，上下键不受影响。
- 方向从 DOM 现读，祖先链上任意一处 `dir` 或 CSS `direction` 都算数；`dir` 属性只作显式覆盖。

## 组合

- 格子上挂[提示](./tooltip)显示当天明细：把 `onCellFocus` 与自己的指针事件接到同一个提示上，键盘用户才和鼠标用户看到一样的东西。
- 与[日历](./calendar)并排：一个看分布、一个挑日期。

## 最佳实践

- 图例旁边写清「少 → 多」的方向，只给一排色块读者猜不出深色是多还是少；这句话写在 `legend` 部件里、与色块并排，读屏与肉眼都拿得到。
- 深浅不是唯一线索：数值必须在 `cellLabel` 里说清楚，否则色觉障碍的用户什么都读不到。
- 数据里出现极端值时自己给 `thresholds`，按最大值均分会把其余日子全压到第 0、1 档，整张图变成一片空白加一个亮点。
- 一屏放不下一整年就让网格自己横向滚动，不要把格子压到看不清。

## 反模式

- 拿它当日期选择器：格子不可点、没有选中语义，点开一个浮层去改值属于另一件事。
- 一次铺好几年：列数上千以后既看不出节奏，键盘也走不到头。
- 只用颜色不给文案：一张没有可及名字的方格阵，对读屏用户等于一片空白。
