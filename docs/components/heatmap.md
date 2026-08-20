# 热力图 <Badge type="info" text="heatmap" />

按网格铺开的强度图：一格是一个观测点，颜色深浅表示它的数值落在第几档。三种形态共用同一套分档、色阶、图例与详情条，只是把格子摊开的方式不同——连续周列的一年日历、按自然月分块的月历、行列由作者给的矩阵。

## 何时使用

- 看一段连续日期上「哪几天多、哪几天少」，以及有没有成片的空档。
- 看逐月的分布，月与月之间要能对齐着比。
- 看两条离散坐标交叉出来的强度，比如「星期 × 小时」的活跃度、「品类 × 月份」的销量、相关系数矩阵。
- 强调节奏与分布，而不是某一格的准确数值。

## 何时不用

- 要挑日期、选区间：用[日历](./calendar)，它才有选中语义与表单出口。
- 要读准确数字、要排序筛选：用[表格](./table)。
- 只报一个总量或同比：用[统计数值](./statistic)。

## 特性

- 三种形态由 `variant` 切换，不写即 `calendar`：
  - `calendar` 连续周列 × 星期行，月份名浮在网格上沿当坐标轴，适合看一整年的节奏；
  - `month` 按自然月分块，每块是一张真月历，1 号落在它真实的星期几上，适合看逐月的分布——连续周列看不出月界，这是它存在的理由；
  - `matrix` 行列都由作者用 `rows` / `columns` 给，数据按 `(row, column)` 定位，与日期无关。
- 矩阵形态的格子两向分开量：宽走 `--xh-heatmap-column-w`、高走 `--xh-heatmap-row-h`，两者都不吃日历那把「一天一个小方块」的 `--xh-heatmap-cell-size`——那把尺是按「一年五十几列」定的，矩阵一行左边还挂着行名，格子照它定高就矮过行名，行高由行名的字定、格子在行里摊成一条。行高不写时是格宽尺的两倍（sm 16px / md 20px / lg 24px），每一档都高过行名那行字；列宽不写时取行高，一格缺省就是正方块。行高不接控件高度那把尺：那把尺是给可点可输的控件在一行里排齐用的，矩阵格子不可交互，接上去密度档一换矩阵就跟着变形。
- 数据收两种形状之一，按有没有 `date` 分辨：日期形态写 `{ date, count }`，矩阵形态写 `{ row, column, value }`。同一格出现多次即累加。
- 日期只认 ISO 的 `YYYY-MM-DD` 串，加减以 UTC 计，不引日期库。
- 区间起点不在周首日时会错列，两种日期形态的口径不同：`calendar` 是「排在起点星期几之前的那几行整行往后错一列」，`month` 是「本月首格错到 1 号真实的星期几」。两者都不铺没有日期的占位格。
- 三张网格的推导都是纯函数（`buildHeatmapGrid` / `buildHeatmapMonthGrid` / `buildHeatmapMatrixGrid`），可以脱离组件单独调用来预生成数据。
- 档数可调：不给 `thresholds` 就按网格内的最大值均分，给了就以它为准。
- 悬停或键盘聚焦到某一格就显示详情条，内容由作者写；组件只给身份、位置与这一格的数据（日期或行列、原始值、档位、在色阶里的位置）。
- 语气与尺寸两轴与其余组件同源。
- 两个适配器的作者侧写法不同，最终 DOM 一致：Vue 侧不写默认插槽就按形态自动铺开整棵树，另有 `cell` 插槽往每格里塞内容（三种形态都铺，载荷是日历那一格或矩阵那一格，用 `'date' in cell` 分辨）、`tooltip` 插槽写详情条的内容（写了它才铺出详情条）；Web Components 侧元素不生成任何结构，各部件都要作者写进标记，元素只负责按部件名打属性。铺一整年请自己拿网格推导函数的结果生成节点，两个插槽是 Vue 专属、WC 侧靠 `cell-active` 事件自己填详情条。
- 自己写默认插槽铺网格时，锚点从载荷里的 `focusedCell` / `anchorCell` 读、用 `setFocusedCell` 挪：这一组三形态通用，带 `Date` 的那一组在矩阵形态下恒为 null。

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

### 月历形态

按自然月分块，每块是一张真月历，1 号落在它真实的星期几上

<XhDemo src="heatmap/06-month" />

### 矩阵形态

行列都由作者给，数据按行列定位而不按日期：星期 × 时段的活跃度

<XhDemo src="heatmap/07-matrix" />

### 悬停详情

指针悬停与键盘聚焦走同一条路：详情条跟着那一格走，Escape 收起

<XhDemo src="heatmap/08-detail" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-heatmap>` |
| Vue 组件 | `XhHeatmapCell` `XhHeatmapColumnLabel` `XhHeatmapGrid` `XhHeatmapLegend` `XhHeatmapLegendItem` `XhHeatmapMonthBlock` `XhHeatmapMonthLabel` `XhHeatmapRoot` `XhHeatmapRow` `XhHeatmapRowLabel` `XhHeatmapTooltip` `XhHeatmapWeekDayLabel` |
| 组合式函数 | `useHeatmap` |
| 状态机 | `heatmapMachine` |
| 皮肤 | `@xihan-ui/styles/heatmap.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="heatmap"`：**`root`** · **`grid`** · `month-block` · `row` · `week-day-label` · `month-label` · `row-label` · `column-label` · `cell` · `tooltip` · `legend` · `legend-item`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `variant` | `HeatmapVariant` |  | 形态：calendar 连续周列、month 按自然月分块、matrix 行列由作者给；缺省 calendar。 |
| `value` | `HeatmapValue[]` |  | 数据。日期形态收 { date, count }，矩阵形态收 { row, column, value }；同一格出现多次即累加。 |
| `rows` | `HeatmapAxisInput[]` |  | 矩阵的行，顺序即渲染顺序；只写身份或身份与文本分开写都行。 |
| `columns` | `HeatmapAxisInput[]` |  | 矩阵的列，顺序即渲染顺序。 |
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
| `onCellFocus` | `(details: HeatmapCellFocusDetails) => void` |  | DOM 焦点落到某一格时通知一次；同一格重复聚焦不重复通知。 只由真实的聚焦触发，程序化挪锚点（`setFocusedCell`）不派这个回调。 |
| `onCellActive` | `(details: HeatmapCellDetails \| null) => void` |  | 详情该显示哪一格：指针悬停或键盘聚焦都会走到这里，收起时给 null。 详情条里写什么由作者决定，组件只报是哪一格、数值多少。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `cell-focus` | `HeatmapCellFocusDetails` | 焦点落到某一格；detail 为 `{ date, row, column, count, level, percent }` |
| `cell-active` | `HeatmapCellDetails` | 详情该显示哪一格（悬停或聚焦）；收起时 detail 为 null |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhHeatmapRoot` | `default` | `HeatmapRootSlotProps` |  |
| `XhHeatmapRoot` | `cell` | `HeatmapCellSlotProps` | 铺开网格时每一格的内容插槽，缺省是空格子；三种形态都铺。 |
| `XhHeatmapRoot` | `tooltip` | `HeatmapCellDetails \| null` | 详情条的内容插槽；写了它才会铺出 tooltip 部件。 |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`CELL.FOCUS` · `CELL.BLUR` · `CELL.ENTER` · `CELL.LEAVE` · `DETAIL.DISMISS` · `FOCUS.SET`

## connect API

`useHeatmap` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `variant` | `HeatmapVariant` | 当前形态。 |
| `grid` | `HeatmapGrid` | 日历网格：行是星期几、列是周次，另带月份段、星期名与档位标尺。其余形态下是一张空网格。 |
| `monthGrid` | `HeatmapMonthGrid \| null` | 月历网格：按自然月分块；不是 month 形态时为 null。 |
| `matrixGrid` | `HeatmapMatrixGrid \| null` | 矩阵网格：行列由作者给；不是 matrix 形态时为 null。 |
| `focusedCell` | `HeatmapCellRef \| null` | 最后一次被聚焦的那一格；从没聚焦过时为 null。 |
| `focusedDate` | `string \| null` | 最后一次被聚焦的那一天；矩阵形态下恒为 null。 |
| `anchorCell` | `HeatmapCellRef \| null` | 当下占着 Tab 位的那一格：锚点还在网格里就是它，否则退回文档序头一格。 |
| `anchorDate` | `string \| null` | 当下占着 Tab 位的那一天；矩阵形态下恒为 null。 |
| `activeCell` | `HeatmapCellDetails \| null` | 详情该显示哪一格的数据：身份、原始值、档位与色阶位置；不显示时为 null。 |
| `detailOpen` | `boolean` | 详情条此刻是不是显示着。 |
| `cellAt` | `(date: string) => HeatmapCellMeta \| null` | 按日期取一格；不在区间内给 null。矩阵形态下恒为 null。 |
| `setFocusedCell` | `(cell: HeatmapCellRef \| null) => void` | 挪动锚点。只改锚点不搬 DOM 焦点，也不派 `onCellFocus`； 需要焦点跟着走的自行调用元素的 focus()。 |
| `setFocusedDate` | `(date: string \| null) => void` | 按日期挪动锚点，等同于 `setFocusedCell({ date })`。 |
| `getRootProps` | `() => T['element']` |  |
| `getGridProps` | `() => T['element']` |  |
| `getMonthBlockProps` | `(props: HeatmapMonthBlockProps) => T['element']` |  |
| `getRowProps` | `(props: HeatmapRowProps) => T['element']` |  |
| `getWeekDayLabelProps` | `(props: HeatmapWeekDayLabelProps) => T['element']` |  |
| `getMonthLabelProps` | `(props: HeatmapMonthLabelProps) => T['element']` |  |
| `getRowLabelProps` | `(props: HeatmapRowLabelProps) => T['element']` |  |
| `getColumnLabelProps` | `(props: HeatmapColumnLabelProps) => T['element']` |  |
| `getCellProps` | `(props: HeatmapCellProps) => T['element']` |  |
| `getTooltipProps` | `() => T['element']` |  |
| `getLegendProps` | `() => T['element']` |  |
| `getLegendItemProps` | `(props: HeatmapLegendItemProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/grid/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | 总是 | 整张网格只占一个 Tab 位：焦点落到锚点那一格，一格都没有时落网格自己 |
| `ArrowLeft` | focus in grid | 焦点横着退一格：日历形态是上一周的同一天，月历形态是前一天（跨得过月块），矩阵形态是左边一列；已在头一格则原地不动。dir=rtl 时改由 ArrowRight 承担 |
| `ArrowRight` | focus in grid | 焦点横着进一格：日历形态是下一周的同一天，月历形态是后一天（跨得过月块），矩阵形态是右边一列；已在末一格则原地不动。dir=rtl 时改由 ArrowLeft 承担 |
| `ArrowUp` | focus in grid | 焦点竖着退一格：日历形态是前一天，月历形态是上一周的同一天，矩阵形态是上面一行；走出网格则原地不动 |
| `ArrowDown` | focus in grid | 焦点竖着进一格：日历形态是后一天，月历形态是下一周的同一天，矩阵形态是下面一行；走出网格则原地不动 |
| `Home` | focus in grid | 焦点移到本行头一格：日历形态是这个星期几最早的一天，月历形态是这一周在本月里的头一天，矩阵形态是头一列 |
| `End` | focus in grid | 焦点移到本行末一格：日历形态是这个星期几最晚的一天，月历形态是这一周在本月里的末一天，矩阵形态是末一列 |
| `Ctrl+Home` | focus in grid | 焦点移到整张网格文档序的头一格 |
| `Ctrl+End` | focus in grid | 焦点移到整张网格文档序的末一格 |
| `Escape` | 详情条显示着 | 收起详情条；焦点留在原处，按键不拦截（外层浮层的关闭仍归它自己管） |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `grid` | `aria-colcount` | counts.columns \| undefined |
| `grid` | `aria-label` | translations?.gridLabel |
| `grid` | `aria-readonly` | 'true' |
| `grid` | `aria-rowcount` | counts.rows \| undefined |
| `grid` | `role` | 'grid' |
| `month-block` | `aria-label` | monthBlockOf.get(block.value)?.long |
| `month-block` | `role` | 'rowgroup' |
| `row` | `aria-hidden` | 'true' |
| `row` | `aria-rowindex` | 1 |
| `row` | `role` | 'row' |
| `week-day-label` | `aria-hidden` | 'true' |
| `month-label` | `aria-hidden` | 'true' |
| `row-label` | `aria-colindex` | 1 |
| `row-label` | `aria-hidden` | 'true' |
| `row-label` | `role` | 'rowheader' |
| `column-label` | `aria-colindex` | meta.index + 2 \| undefined |
| `column-label` | `role` | 'columnheader' |
| `cell` | `aria-colindex` | meta.columnIndex + 2 \| undefined |
| `cell` | `aria-label` | matrixCellLabel({ date: '', row, column, count, level… |
| `cell` | `role` | 'gridcell' |
| `tooltip` | `aria-hidden` | 'true' |
| `legend-item` | `aria-hidden` | 'true' |

- 网格是 `role="grid"` 且 `aria-readonly`，每行一个 `role="row"`，每格一个 `role="gridcell"`。
- 月历形态里一个自然月是一个 `role="rowgroup"`，块的可及名字是这个月的长名字；块里那条星期名坐标轴整条 `aria-hidden`，读屏看到的每一块就只剩合法的几行。
- 矩阵形态里行名是 `role="rowheader"`、列名是 `role="columnheader"`，表头行行首那个角落占位 `aria-hidden`；行列总数把两条表头也算进去，读屏报的行列号才对得上。
- 格子里没有文字，可及名字全靠文案拼出来：日期形态走 `translations.cellLabel`（日期 + 数值），矩阵形态走 `translations.matrixCellLabel`（行 + 列 + 数值），务必按本地语言改写它们。
- 星期名、月份名与图例里的色块都是给眼睛看的坐标轴，一律 `aria-hidden`：每格自己就念得出完整身份与数值，再念一遍轴只是噪音。
- 图例容器本身不藏，写在色块旁边的「少 → 多」那句方向说明读屏念得到。
- 详情条 `aria-hidden`：它显示的信息与那一格的可及名字是同一份，念两遍反而吵。**因此详情条里不能出现可及名字里没有的内容**，否则读屏用户就少了一块。
- 各行格子数不一定齐（首行可能少一格），格子上带 `aria-colindex`，读屏报出的列号才对得上。
- 整张网格只占一个 Tab 位，进去以后靠方向键走。键盘聚焦与指针悬停触发的是同一条详情：只做悬停等于把键盘与读屏用户排除在外。
- Escape 收起详情条但不拦截按键：外层浮层的关闭仍归它自己管。

## 样式

默认皮肤 `@xihan-ui/styles/heatmap.css` 按部件选择：`[data-scope="heatmap"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `row` | `data-week` | String(row.week) |
| `row` | `data-week-day` | undefined \| String(row.weekDay) |
| `week-day-label` | `data-week-day` | undefined \| String(label.weekDay) |
| `cell` | `data-level` | String(level) |
| `tooltip` | `data-placement` | undefined \| ((): 'block-start' \| 'block-end' =&gt; { if (activeRef =… |
| `legend-item` | `data-level` | String(item.level) |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-heatmap-block-gap` · `--xh-heatmap-block-inner-gap` · `--xh-heatmap-cell-border` · `--xh-heatmap-cell-radius` · `--xh-heatmap-cell-size` · `--xh-heatmap-column-w` · `--xh-heatmap-empty` · `--xh-heatmap-fg` · `--xh-heatmap-font-size` · `--xh-heatmap-gap` · `--xh-heatmap-grid-gap` · `--xh-heatmap-gutter` · `--xh-heatmap-ink` · `--xh-heatmap-label-fg` · `--xh-heatmap-legend-gap` · `--xh-heatmap-py` · `--xh-heatmap-row-gap` · `--xh-heatmap-row-h` · `--xh-heatmap-title-fg` · `--xh-heatmap-tooltip-bg` · `--xh-heatmap-tooltip-fg` · `--xh-heatmap-tooltip-font-size` · `--xh-heatmap-tooltip-max-w` · `--xh-heatmap-tooltip-px` · `--xh-heatmap-tooltip-py` · `--xh-heatmap-tooltip-radius` · `--xh-heatmap-tooltip-shadow`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 横轴沿 inline 排开，整页切成 rtl 时视觉次序整体翻转，左右方向键的语义跟着翻，上下键不受影响。
- 方向从 DOM 现读，祖先链上任意一处 `dir` 或 CSS `direction` 都算数；`dir` 属性只作显式覆盖。
- 详情条的落点也按逻辑方向量：rtl 下从末缘往回量，样式侧只写一条 `inset-inline-start` 就两向通用。

## 组合

- 详情条不引浮层引擎，也就不参与浮层的层级与关闭协议：它按 root 的内边距盒绝对定位，跟着网格一起横向滚动，摆上边还是摆下边按格子的行序定，因此始终压在网格自己身上。要一条会翻转、会避让视口的真浮层，请自己在格子上挂[提示](./tooltip)。
- 与[日历](./calendar)并排：一个看分布、一个挑日期。

## 最佳实践

- 图例旁边写清「少 → 多」的方向，只给一排色块读者猜不出深色是多还是少；这句话写在 `legend` 部件里、与色块并排，读屏与肉眼都拿得到。
- 深浅不是唯一线索：数值必须在文案里说清楚，否则色觉障碍的用户什么都读不到。
- 数据里出现极端值时自己给 `thresholds`，按最大值均分会把其余格子全压到第 0、1 档，整张图变成一片空白加一个亮点。
- 一屏放不下就让网格自己横向滚动，不要把格子压到看不清。
- 矩阵的列名与它下面那一列的格子同宽：标签长就整体调大 `--xh-heatmap-column-w`，别只把标签撑开——撑开的标签会与格子错位。
- 调宽了列就一并调高行：只给 `--xh-heatmap-column-w` 而不给 `--xh-heatmap-row-h`，格子会横着拉成细条。两个值配到 1.5 : 1 上下最好读，一屏放不下就减列不要压扁行。
- 矩阵的行列顺序就是渲染顺序，按你希望读者阅读的次序给，别指望组件替你排。
- 月历形态里上下键走的是「上一周 / 下一周同一天」，跨得过月块：从一月块最后一行按 ↓ 会落到二月块里，而月块是并排换行的，视觉上像往右上方跳了一下。要按块阅读就用左右键，它逐日走、次序与肉眼一致。矩阵形态没有这回事，它的行列是无序的类目，上下键到边即停。

## 反模式

- 拿它当日期选择器：格子不可点、没有选中语义，点开一个浮层去改值属于另一件事。
- 一次铺好几年：列数上千以后既看不出节奏，键盘也走不到头。
- 只用颜色不给文案：一张没有可及名字的方格阵，对读屏用户等于一片空白。
- 把详情条当唯一的信息出口：它对读屏是藏起来的，只写在那里等于只给鼠标用户看。
- 矩阵形态里指望组件从数据里猜出行列：轴上没有的行列，数据里写了也不进网格。
