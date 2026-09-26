# CartesianChart 直角坐标图

在直角坐标系里画柱与折线：一根自变量轴（类目、数值或时间），一根数值轴，任意多个系列共用这两根轴。柱状图、条形图、分组与堆叠柱、折线、面积与堆叠面积都是它的不同配置，不是不同的组件。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/cartesian-chart" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/cartesian-chart.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/cartesian-chart" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/cartesian-chart" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/cartesian-chart.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一个柱系列：x 取类目字段，y 取数值字段，悬停或用方向键逐个查看

<XhDemo src="cartesian-chart/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="cartesian-chart"`：**`root`** · `caption` · `legend` · `legend-item` · `legend-swatch` · `legend-label` · **`viewport`** · **`plot`** · `grid` · `grid-line` · `axis` · `axis-line` · `tick` · `tick-label` · `axis-title` · `series` · `bar` · `line` · `area-fill` · `dot` · `point` · `data-label` · `total-label` · `end-label` · `leader-line` · `crosshair` · `focus-ring` · `tooltip` · `tooltip-header` · `tooltip-row` · `tooltip-swatch` · `tooltip-value` · `tooltip-name` · `empty` · `summary` · `table`

## 示例

### 多系列折线

三条折线共用坐标轴，图例点一下隐藏或恢复一个系列，其余系列颜色不变

<XhDemo src="cartesian-chart/02-lines" />

### 堆叠柱

同一个 stack 名的柱系列首尾相接，柱高是各部分之和，相邻两段之间留一道表面缝

<XhDemo src="cartesian-chart/03-stack" />

### 横向条形图

orientation="horizontal" 把整张图转置：类目名竖排可以读全，数值横向延伸

<XhDemo src="cartesian-chart/04-horizontal" />

### 百分比堆叠面积

stackOffset: 'expand' 把每个键归一到 100%，看的是构成随时间的变化而不是总量

<XhDemo src="cartesian-chart/05-share" />

### 时间轴

自变量给 Date，横轴换成时间比例尺：刻度按日期取整，间隔不均的日期按真实间距排开

<XhDemo src="cartesian-chart/06-time" />

### 语义系列

颜色本身带好坏含义时写 tone：收入取成功色、支出取危险色，不再按次序取分类色

<XhDemo src="cartesian-chart/07-tone" />

### 两张图联动

两个量纲不共用一根 y 轴：两张图接到同一个受控的 activeKey，在同一个键上一起指示

<XhDemo src="cartesian-chart/08-linked" />

### 数据更新

换一组数据时柱从当前高度走到新高度；关掉动画后直接画终态

<XhDemo src="cartesian-chart/09-transition" />

### 数据标签与合计

labels="inside" 把每一段的数写在柱内，totals 在整叠外侧写合计；段太矮放不下时不写

<XhDemo src="cartesian-chart/10-labels" />

### 线尾标签

endLabel 把系列名与末值写在线尾，末端挨着时上下推开、用引导线连回线尾；折线不多时读者不用对照图例

<XhDemo src="cartesian-chart/11-end-label" />

## 设计指引

### 何时使用

- 比较若干类目上的数值：各月销售额、各渠道转化量。
- 观察一个量随时间的变化趋势，或几个量的走势是否同步。
- 查看整体由哪几部分构成、各部分占比如何随类目变化（堆叠、百分比堆叠）。
- 类目名较长、或类目较多需要竖向滚读时，用横向的条形图。

### 何时不用

- 只报告一个数，或一个数与它的同比：使用[统计数值](./statistic)。
- 少量类目在整体中的占比：使用饼图。
- 类目多于 7 个且每个都需要读出准确数字：使用[表格](./table)，或表格与图并列。
- 两个量纲（如金额与转化率）：画两张图并用 `activeKey` 联动，不在一张图里放第二根 y 轴。两根 y 轴的刻度零点与比例都可以任意选，读者会把两条线的交叉读成含义，而它只是刻度选择的巧合。
- 看强度分布而不是具体数值：使用[热力图](./heatmap)。

### 特性

- 系列用 `mark` 区分画法，目前有 `bar` 与 `line` 两种。每个系列用字段名把数据的列映射到通道：`x` 是自变量，`y` 是数值。同一张图可以混放柱与折线，它们共用坐标轴。
- 数据是对象数组，组件只读不写。系列 `id` 缺省取 `y` 的字段名，`name` 缺省同 `id`；图例、提示框与数据表显示 `name`，`hiddenSeries` 与部件上的 `data-series-id` 使用 `id`。
- `x` 是自变量轴、`y` 是数值轴，与屏幕方向无关。`orientation="horizontal"` 把整张图转置：自变量竖排、数值横向延伸，即条形图；`xAxis` / `yAxis` 的配置不用跟着对调。
- 比例尺缺省按数据推断：含柱系列或自变量不是数字与日期时为 `band`（类目），自变量是 `Date` 时为 `time`，是数字时为 `linear`；数值轴为 `linear`。`scale` 可显式指定 `band` / `point` / `linear` / `log` / `time` / `utc`。`log` 的定义域必须全为正数，否则报错并在根上写 `data-state="error"`。
- 类目轴的顺序缺省是数据中首次出现的顺序，`xAxis.domain` 可给出显式顺序；只在 `domain` 里、数据中没有的类目也会占位。
- 有柱系列时数值轴强制包含 0：柱的长度就是它编码的量，基线不在 0 时长度之比不再等于数值之比。只有折线时 `zero` 缺省不强制，定义域贴合数据；需要从 0 起时写 `yAxis.zero`。
- 数值轴两端缺省取整到刻度上（`nice`），刻度数量按绘图区长度估算：竖向的数值轴约每 2.5 行字高一个，横向的按最宽的刻度标签加间隙估算；`ticks` 可以给数量提示或显式的刻度值。
- 同一 `stack` 名的系列堆叠在一起：柱逐段累加，折线成为堆叠面积。`stackOffset: 'expand'` 把每个键归一成百分比，数值轴随之换成百分比格式；柱的堆叠含负值时缺省 `diverging`，正值向上、负值向下各自累加。同一堆叠组的 `stackOffset` 必须一致，不一致时报错。
- 多个柱系列不堆叠时并排分组：组内按系列次序排列，柱的厚度不超过 `--xh-chart-bar-max`（缺省 24px），类目很宽时柱不会被拉成大色块，多出的空间留作类目之间的间距。
- 堆叠的相邻两段之间留 `--xh-chart-gap`（2px）的表面缝，靠缝区分而不是靠描边。只有离基线最远的一端有圆角，基线一端始终是直角，读者据此判断柱是从哪里长出来的。
- 折线的 `curve` 缺省 `linear`；`monotone` 平滑且不越过数据点，不会画出数据中没有的峰谷；`step` / `step-before` / `step-after` 画成阶梯，台阶分别落在两点正中、前一点与后一点处，适合价格、库存这类在某一刻跳变的量。`area` 在折线下铺一层系列色的淡洗。缺失值（`null`、`undefined`、`NaN`）处折线断开，`connectNulls` 可改为连上。
- 折线的数据点 `symbols` 缺省 `auto`：相邻点间距不小于 16px 时才画，点密到连成一片时不画。键盘聚焦或悬停到折线上的数据时，那一个点总会画出来作为指示与焦点落点。
- 颜色按系列次序依次取分类色 1–8；`slot` 可把一个系列固定在某一色槽，同一业务实体在不同图表里保持同色。图例把某个系列隐藏后，其余系列的颜色不变。颜色本身带有好坏含义时（收入与支出、达标与超标）改写 `tone`，系列改用语气色；同一张图不混用分类色与语气色。
- 系列多于 8 个时报错：分类色只有 8 个可区分的色槽，第 9 个开始会与前面的系列撞色。需要更多系列时先合并或分成几张图。
- 数据标签由系列的 `labels` 打开：柱写 `inside`（柱内居中）或 `end`（柱的远端外侧，负值翻到另一侧；堆叠中的段写在段内的远端），折线写 `end`（每个点的上方）。柱内的字取与色槽配对的前景色；放不下、与更要紧的标签重叠时不写。柱端外侧的标签写在绘图区里：数值轴两端各收进一截，最高的那根柱上面也有地方写。
- `totals` 让每个堆叠组在整叠外侧写出合计，含负值时正负两端各写一个；百分比堆叠不写合计。
- 折线的 `endLabel` 在线尾写系列名与末值，几条线的末端挤在一起时上下推开，推开的标签用引导线连回线尾，挤不下去掉末值最小的；右边留出它要的地方。
- 标签按重要性落位：合计最先，其次线尾标签，最后逐个数据的标签；它们都只给眼睛看，数值由每个数据的可及名、摘要与数据表承担。
- 提示框缺省 `trigger="axis"`：指针吸附到最近的键，列出该键上全部可见系列；`trigger="item"` 只报告指针命中的那一个数据。键盘聚焦与指针悬停显示同样的内容。`tooltipOrder` 改变提示框里各系列的行序：缺省 `series` 按图例次序，`descending` / `ascending` 按数值排，缺失值排在最后；回调里的 `items` 仍按图例次序。
- 悬停图例项时，其余系列淡出到 `--xh-chart-dim-alpha`，该系列颜色不变；`trigger="item"` 时悬停或聚焦某个数据同样只保留它所在的系列。`axis` 模式不淡出：提示框列出的正是该键上的全部系列。
- 提示框放在根内部，按指针所在的一侧翻转，不越出绘图区；它不进入浮层引擎，不参与浮层的层级与关闭协议。
- 坐标轴标签字体、柱的最大厚度、线宽、点的直径等几何量的真源是 CSS 组件槽：组件从根的计算样式读取它们再计算几何，改写组件槽就能改变几何，不需要布局属性。密度档切换时重新读取。
- 尺寸由视口决定：宽度随容器，高度取 `--xh-cartesian-chart-height`（缺省 `--xh-chart-height`）。视口尺寸变化时重新布局，服务端与首帧只输出空的绘图区、不占位跳动。
- `pending` 表示正在重新取数：保留上一帧、整体降低不透明度并在根上写 `aria-busy`，不闪骨架，也不跳布局。首次取数、手里还没有数据时，空态写 `translations.loadingText`（缺省 Loading…）并转一个圈，取完仍没有数据才写 `emptyText`。
- 首次出现时播放入场：柱沿数值轴从基线长出，折线从头描到尾，数据点等笔尖扫到才出现，面积、坐标轴与标签淡入，多个系列按图例次序错开（至多 5 步）。数据层的标记多于 1000 个时不做几何插值，只淡入淡出。之后的数据变化与图例切换从当前位置插值到新位置：留下的柱原地伸缩，新增的柱从基线长出，隐藏的系列收回基线并淡出后才移除；坐标轴刻度随之移动。标记按自变量的值对齐而不是按位置：类目换了次序时柱滑到新位置，时间序列往后推一格时整条线平移、新点从边上进来。`pending` 结束后到来的新数据按更新处理，不再重播入场。
- `animated={false}`（Web Components 写 `animated="false"`）关闭过渡，数据一变直接画终态。系统开了减弱动效或容器写了 `data-motion="reduce"` 时几何直接到位，只保留淡入淡出。视口尺寸变化与字体加载完成后的重排不播过渡。
- 过渡的快慢由动效令牌决定，组件从绘图区的计算样式读取：入场取 `--xh-motion-duration-reveal`（缺省 640ms），数据更新与图例切换取 `--xh-motion-duration-morph`（缺省 400ms）。在图或它的容器上改写它们，例如 `style="--xh-motion-duration-reveal: 1s"`，只影响这张图；入场的曲线取 `--xh-motion-ease-enter-strong`，更新取 `--xh-motion-ease-continuous`。折线的描出与入场同一个时长。
- 没有数据或全部系列被隐藏时显示空态，文字取 `translations.emptyText`；坐标轴在全部隐藏时保留，图例仍可把系列点回来。
- 多张图接到同一个受控的 `activeKey` 上时，十字准线与提示框在同一个键上一起指示。从外部写入的键不触发 `onDatumActive`，只有本图上的指针与键盘才触发，联动不会来回回调。
- `onDatumPress` 只报告被点击或按下 Enter / Space 的数据，图表不内建选中态。
- 三个适配器的作者侧写法不同，最终 DOM 一致：Vue 与 React 不写默认内容时铺开缺省结构（标题、图例、视口与绘图区、空态、提示框），提示框内容可由作用域插槽 / 函数式 children 替换；Web Components 侧作者写外壳（root、caption、legend、viewport 与其中空的 `<svg>` plot、tooltip，可选 empty），网格、坐标轴、系列、图例项与提示框的缺省内容由元素生成进去，按标记的 key 复用节点。
- Web Components 侧的数据、系列与坐标轴是对象，只走 JS property；朝向、提示框模式、`pending` 与 `locale` 另有同名属性，类目键的 `activeKey` 可写成 `active-key` 属性，数值与日期键走 property。宿主元素缺省是行内元素，放进 flex / grid 时要给它一个宽度，否则图按标题与图例的宽度收窄。
- 摘要与数据表由组件追加在根的末尾，三个适配器都一样，不需要作者放置。

### 最佳实践

- 为图写标题：`caption` 是图的可访问名称，也是读者判断这张图在说什么的第一处。
- 折线不超过 4 条时，用 `endLabel` 把系列名写在线尾，读者不用在图例与线之间来回对照。
- 只在读者要读出准确数字时打开数据标签；每根柱都写数的图更像一张表，这时直接给表格。
- 类目名较长时改用横向条形图，而不是让横轴标签斜着排：竖排的类目名可以完整读出。
- 柱状图的类目顺序本身就是信息：没有自然顺序（如月份）的类目按数值排序后再给组件，组件不排序。
- 一张图的系列保持在 5 个以内，超过时读者需要反复对照图例。系列之间需要逐个比较时考虑分成几张小图。
- 折线图的自变量是时间时给 `Date`，不要先格式化成字符串：字符串会被当成类目，间隔不均匀的日期会被画成等距。
- 堆叠只在各部分之和有意义时使用：堆叠后只有最底下一段和总量能准确比较，中间各段的起点不齐，不适合逐段比较。
- 需要可见的表格视图时，把 `api.table` 交给[表格](./table)组件，而不是在图下方另写一份数据。

### 反模式

- 用双 y 轴在一张图里放两个量纲：两根轴的刻度可以任意选，交叉点没有含义。
- 柱状图的数值轴不从 0 起：组件已强制包含 0，不要用 `min` 把它截掉。
- 用颜色区分同一个系列里的类目：颜色区分的是系列，类目已在坐标轴上。
- 用提示框作为读取数值的唯一途径：提示框对读屏隐藏，数值要能从坐标轴、摘要或数据表读到。
- 把几十个系列放进同一张图，再靠图例逐个点开：这时需要的是表格或筛选。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-cartesian-chart>` |
| Vue 组件 | `XhCartesianChartCaption` `XhCartesianChartEmpty` `XhCartesianChartLegend` `XhCartesianChartPlot` `XhCartesianChartRoot` `XhCartesianChartTooltip` `XhCartesianChartViewport` |
| 组合式函数 | `useCartesianChart` |
| 状态机 | `cartesianChartMachine` |
| 皮肤 | `@xihan-ui/styles/cartesian-chart.css` |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `hidden-series-change` | `ChartHiddenSeriesChangeDetails` | 图例切换显隐；detail 为 `{ hiddenSeries: string[] }` |
| `active-key-change` | `ChartActiveKeyChangeDetails` | 指针或键盘换了激活的键；detail 为 `{ activeKey }`，收起时为 null |
| `datum-active` | `ChartDatumDetails` | 悬停或聚焦到某个数据；detail 为数据详情，收起时为 null |
| `datum-press` | `ChartDatumDetails` | 指针点击、Enter 或 Space 按在某个数据上；detail 为数据详情 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCartesianChartRoot` | `default` | `CartesianChartRootSlotProps` | 自行摆放部件；不写时铺开缺省结构：图例、视口（绘图区与空态）、提示框。 |
| `XhCartesianChartRoot` | `caption` | — | 缺省结构里的标题内容。 |
| `XhCartesianChartRoot` | `tooltip` | `CartesianChartTooltipSlotProps` | 缺省结构里的提示框内容。 |
| `XhCartesianChartRoot` | `empty` | — | 缺省结构里的空态内容。 |
| `XhCartesianChartTooltip` | `default` | `CartesianChartTooltipSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhCartesianChartRoot` | `data` | `readonly ChartRow[]` |  | 数据：对象数组，系列用字段名把列映射到通道。 |
| `XhCartesianChartRoot` | `series` | `readonly CartesianSeries[]` |  |  |
| `XhCartesianChartRoot` | `xAxis` | `CartesianAxis` |  |  |
| `XhCartesianChartRoot` | `yAxis` | `CartesianAxis` |  |  |
| `XhCartesianChartRoot` | `orientation` | `CartesianOrientation` |  | 朝向，缺省 vertical。 |
| `XhCartesianChartRoot` | `trigger` | `CartesianTrigger` |  | 提示框汇报什么，缺省 axis。 |
| `XhCartesianChartRoot` | `totals` | `boolean` |  | 堆叠柱的合计：每个堆叠组在最外端写出合计。 |
| `XhCartesianChartRoot` | `tooltipOrder` | `CartesianTooltipOrder` |  | 提示框里各系列的行序，缺省 series（按图例次序）。 |
| `XhCartesianChartRoot` | `hiddenSeries` | `string[]` |  | 隐藏的系列（受控）。 |
| `XhCartesianChartRoot` | `defaultHiddenSeries` | `string[]` |  | 初始隐藏的系列（非受控）。 |
| `XhCartesianChartRoot` | `activeKey` | `ChartKey \| null` |  | 激活的自变量键（受控）。 |
| `XhCartesianChartRoot` | `pending` | `boolean` |  | 数据重取中：保留上一帧、整体降低不透明度。 |
| `XhCartesianChartRoot` | `animated` | `boolean` |  | 播放过渡动画，缺省 true；false 时直接画终态。 |
| `XhCartesianChartRoot` | `locale` | `string` |  |  |
| `XhCartesianChartRoot` | `translations` | `Partial<CartesianChartTranslations>` |  |  |
| `XhCartesianChartRoot` | `onHiddenSeriesChange` | `CartesianChartProps['onHiddenSeriesChange']` |  |  |
| `XhCartesianChartRoot` | `onActiveKeyChange` | `CartesianChartProps['onActiveKeyChange']` |  |  |
| `XhCartesianChartRoot` | `onDatumActive` | `CartesianChartProps['onDatumActive']` |  |  |
| `XhCartesianChartRoot` | `onDatumPress` | `CartesianChartProps['onDatumPress']` |  |  |
| `XhCartesianChartRoot` | `caption` | `ReactNode` |  | 缺省结构里的标题内容。 |
| `XhCartesianChartRoot` | `renderTooltip` | `(props: CartesianChartTooltipSlotProps) => ReactNode` |  | 缺省结构里的提示框内容。 |
| `XhCartesianChartRoot` | `empty` | `ReactNode` |  | 缺省结构里的空态内容。 |
| `XhCartesianChartRoot` | `children` | `SlotChildren<CartesianChartRootSlotProps>` |  | 自行摆放部件；不写时铺开缺省结构：图例、视口（绘图区与空态）、提示框。 |
| `XhCartesianChartTooltip` | `children` | `SlotChildren<CartesianChartTooltipSlotProps>` |  | 替换缺省内容；函数式 children 拿到激活的数据与缺省的内容模型。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'error' \| undefined |
| `tooltip` | 'visible' \| 'hidden' |
| `empty` | 'loading' \| undefined |

以下名称仅用于内部状态机。

**状态**：`idle`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `model` | `CartesianModel` | 管线产物：比例尺、布局、场景与无障碍模型。 |
| `scene` | `Scene` | 要画的场景；尚未测量时为空场景。 |
| `overlay` | `CartesianOverlay` | 前景层：随激活与聚焦变化的标记。绘图区按 back → under → data → over 的次序画： 十字准线与类目带淡底在数据之下，激活的点与焦点环在数据之上。 |
| `measured` | `boolean` | 视口尚未测量（服务端与首帧）：绘图区只输出空的 svg。 |
| `empty` | `boolean` | 没有可画的数据：空态部件据此显示。 |
| `legendItems` | `readonly CartesianLegendItem[]` |  |
| `active` | `ChartDatumDetails \| null` | 激活的数据；没有时为 null。 |
| `tooltip` | `CartesianTooltipModel \| null` | 提示框内容；收起时为 null。 |
| `summary` | `string` | 摘要文字。 |
| `table` | `TableModel` | 数据表模型：视觉隐藏的数据表用它，也可以喂给 Table 组件做可见的表格视图。 |
| `emptyText` | `string` | 空态文字。 |
| `tableCaption` | `string` | 数据表的标题。 |
| `activeKey` | `ChartKey \| null` | 激活的自变量键。 |
| `hiddenSeries` | `string[]` |  |
| `toggleSeries` | `(id: string) => void` | 切换某个系列的显隐。 |
| `setFocusedDatum` | `(ref: { seriesId: string, index: number } \| null) => void` | 移动键盘锚点。只改锚点不移动 DOM 焦点，也不派发回调； 需要焦点跟随时自行调用元素的 focus()。 |
| `markTag` | `(mark: Mark) => CartesianMarkTag` | 标记画成什么元素。 |
| `getRootProps` | `() => T['element']` |  |
| `getCaptionProps` | `() => T['element']` |  |
| `getLegendProps` | `() => T['element']` |  |
| `getLegendItemProps` | `(item: CartesianLegendItem) => T['button']` |  |
| `getLegendSwatchProps` | `(item: CartesianLegendItem) => T['element']` |  |
| `getLegendLabelProps` | `(item: CartesianLegendItem) => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getPlotProps` | `() => T['element']` |  |
| `getMarkProps` | `(mark: Mark) => T['element']` | 场景里一个标记的属性（含 path 的 d、文字的坐标）。 |
| `getTooltipProps` | `() => T['element']` |  |
| `getTooltipHeaderProps` | `() => T['element']` |  |
| `getTooltipRowProps` | `(row: CartesianTooltipRow) => T['element']` |  |
| `getTooltipSwatchProps` | `(row: CartesianTooltipRow) => T['element']` |  |
| `getTooltipValueProps` | `(row: CartesianTooltipRow) => T['element']` |  |
| `getTooltipNameProps` | `(row: CartesianTooltipRow) => T['element']` |  |
| `getEmptyProps` | `() => T['element']` |  |
| `getSummaryProps` | `() => T['element']` |  |
| `getTableProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | 总是 | 绘图区只占一个 Tab 位：焦点落到锚点数据，首次为第一个可见系列的第一个数据；图例同样只占一个 Tab 位 |
| `ArrowRight` | 焦点在绘图区 | 沿自变量方向移到下一个键（跳过缺失值）；horizontal 时由 ArrowDown 承担；已在末尾则原地不动 |
| `ArrowLeft` | 焦点在绘图区 | 沿自变量方向移到上一个键；horizontal 时由 ArrowUp 承担 |
| `ArrowUp` | 焦点在绘图区 | 在同一个键上换到视觉次序的下一个系列（堆叠自下而上、分组自左而右），跳过隐藏系列与缺失值；horizontal 时由 ArrowRight 承担 |
| `ArrowDown` | 焦点在绘图区 | 在同一个键上换到上一个系列；horizontal 时由 ArrowLeft 承担 |
| `Home` | 焦点在绘图区 | 当前系列的第一个数据 |
| `End` | 焦点在绘图区 | 当前系列的最后一个数据 |
| `PageUp` / `PageDown` | 焦点在绘图区 | 跨 10% 的键，至少 1 个 |
| `Enter` / `Space` | 焦点在绘图区 | 报告聚焦的数据（onDatumPress） |
| `Escape` | 提示框显示着 | 收起提示框，焦点留在原处；按键不拦截，外层浮层的关闭仍归它自己 |
| `ArrowLeft` / `ArrowRight` / `Home` / `End` | 焦点在图例 | 在图例项之间移动，左右键跟随文字方向的视觉次序 |
| `Enter` / `Space` | 焦点在图例项 | 切换该系列的显隐（原生按钮行为） |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `legend` | `aria-label` | translations.legendLabel |
| `legend` | `role` | 'toolbar' |
| `legend-item` | `aria-pressed` | 'false' \| 'true' |
| `legend-swatch` | `aria-hidden` | 'true' |
| `plot` | `aria-describedby` | `summary` 部件的 id |
| `plot` | `aria-labelledby` | `caption` 部件的 id |
| `plot` | `aria-roledescription` | translations.chartRoleDescription |
| `plot` | `role` | 'graphics-document' |
| `tooltip` | `aria-hidden` | 'true' |
| `mark` | `aria-hidden` | mark.exiting \|\| undefined |
| `mark` | `aria-label` | undefined \| spec?.name |
| `mark` | `aria-roledescription` | undefined \| translations.seriesRoleDescription |
| `mark` | `role` | undefined \| 'graphics-object' |

- 根是 `<figure>`，可访问名称来自 `caption`（`<figcaption>`）；不放标题时在根上写 `aria-label`。只有两者都没有时开发期报 `chart.missing-name`。
- 绘图区是 `role="graphics-document"`，`aria-roledescription` 取 `translations.chartRoleDescription`（缺省 chart），`aria-describedby` 指向组件生成的摘要。
- 每个系列是一个 `role="graphics-object"` 的分组，名称是系列名；每根柱、每个焦点代理点是 `role="graphics-symbol"`，名称取 `translations.datumLabel`（缺省“键, 系列名 值”），务必按本地语言改写。
- 坐标轴、网格、十字准线与焦点环一律 `aria-hidden`：它们的信息由每个数据的名称、摘要与数据表承担。
- 组件在根内生成一段摘要与一张数据表，二者视觉隐藏、对读屏可见，服务端即输出。摘要写系列数、自变量的范围以及每个系列的最小值与最大值，模板是 `translations.summary`；数据表首列是自变量，列名缺省取 x 轴标题，其余每个可见系列一列，缺失值写 `translations.missingValue`。
- 绘图区只占一个 Tab 位，进入后焦点落在一个真实的元素上：柱直接获得焦点；折线没有逐点的元素，由绘图区为聚焦的数据生成一个点作为焦点代理，移动时替换并聚焦新点，读屏据此播报新的名称。
- 焦点环是独立的 `focus-ring` 部件，画在标记之外，不依赖 SVG 元素的 outline；只在键盘聚焦时出现。
- 图例是 `role="toolbar"`，名称取 `translations.legendLabel`；每一项是 `<button aria-pressed>`，按下表示系列可见。图例整体只占一个 Tab 位，进入后左右键在项之间移动。
- 提示框 `aria-hidden`：它显示的内容与数据的可访问名称是同一份，读两遍反而干扰。
- Escape 收起提示框但不拦截按键，外层浮层的关闭仍由其自身处理。
- 过渡只改画面：数据的名称、摘要、数据表与焦点次序在数据变化的那一刻就按新数据更新；收场中的标记 `aria-hidden`、不可聚焦，也不响应指针。
- 颜色不是区分系列的唯一线索：图例文字、提示框中的系列名与数据名称都写出系列；折线与柱的色标形状也不同。

## 样式参考

### 皮肤

`@xihan-ui/styles/cartesian-chart.css` 使用 `[data-scope="cartesian-chart"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-orientation` | model.spec.orientation |
| `root` | `data-state` | 'error' \| undefined |
| `legend-item` | `data-pressed` | ''（条件成立时才出现） |
| `legend-item` | `data-tone` | item.tone |
| `legend-item` | `data-value` | item.id |
| `legend-item` | `data-xh-action-control` | '' |
| `legend-item` | `data-xh-action-profile` | 'text' |
| `legend-item` | `data-xh-action-size` | 'xs' |
| `legend-item` | `data-xh-action-variant` | 'ghost' |
| `legend-item` | `data-xh-chart-slot` | undefined \| String(item.slot) |
| `legend-swatch` | `data-mark` | 'line' \| 'bar' |
| `tooltip` | `data-placement` | 'top' \| 'bottom'-'right' \| 'left' \| undefined |
| `tooltip` | `data-state` | 'visible' \| 'hidden' |
| `tooltip-row` | `data-current` | ''（条件成立时才出现） |
| `tooltip-row` | `data-series-id` | row.seriesId |
| `tooltip-row` | `data-tone` | row.tone |
| `tooltip-row` | `data-xh-chart-slot` | undefined \| String(row.slot) |
| `tooltip-swatch` | `data-mark` | 'line' \| 'bar' |
| `empty` | `data-state` | 'loading' \| undefined |
| `mark` | `data-axis` | mark.key.slice('axis:'.length) \| undefined |
| `mark` | `data-dimmed` | ''（条件成立时才出现） |
| `mark` | `data-drawing` | ''（条件成立时才出现） |
| `mark` | `data-mark` | spec?.mark |
| `mark` | `data-placement` | model.scene?.placements.get(mark.key) \| undefined \| undefined |
| `mark` | `data-series-id` | mark.key.slice('series:'.length) |
| `mark` | `data-tone` | spec?.tone |
| `mark` | `data-xh-chart-slot` | undefined \| String(spec.slot) |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-cartesian-chart-bar-max` | `root` | `--xh-_chart-metric-bar-max` | `default` | `--xh-chart-bar-max` | cartesian-chart 的 root 部件 --xh-_chart-metric-bar-max 覆盖槽。 |
| `--xh-cartesian-chart-bar-radius` | `root` | `--xh-_chart-metric-radius` | `default` | `--xh-shape-inset` | cartesian-chart 的 root 部件 --xh-_chart-metric-radius 覆盖槽。 |
| `--xh-cartesian-chart-empty-gap` | `empty` | `gap` | `state=loading` | `--xh-space-2` | cartesian-chart 的 empty 部件 gap 覆盖槽。 |
| `--xh-cartesian-chart-gap` | `root` | `gap` | `default` | `--xh-space-3` | cartesian-chart 的 root 部件 gap 覆盖槽。 |
| `--xh-cartesian-chart-height` | `viewport` | `block-size` | `default` | `--xh-chart-height` | cartesian-chart 的 viewport 部件 block-size 覆盖槽。 |
| `--xh-cartesian-chart-legend-gap` | `legend` | `gap` | `default` | `--xh-space-1` | cartesian-chart 的 legend 部件 gap 覆盖槽。 |
| `--xh-cartesian-chart-legend-swatch-line-radius` | `legend-swatch` | `border-radius` | `mark=line` | `--xh-shape-pill` | cartesian-chart 的 legend-swatch 部件 border-radius 覆盖槽。 |
| `--xh-cartesian-chart-legend-swatch-radius` | `legend-swatch` | `border-radius` | `default` | `--xh-shape-inset` | cartesian-chart 的 legend-swatch 部件 border-radius 覆盖槽。 |
| `--xh-cartesian-chart-line-width` | `line`<br>`root` | `stroke-width` | `default` | `--xh-chart-line-width` | cartesian-chart 的 line、root 部件 stroke-width 覆盖槽。 |
| `--xh-cartesian-chart-point-size` | `root` | `--xh-_chart-metric-point-size` | `default` | `--xh-chart-point-size` | cartesian-chart 的 root 部件 --xh-_chart-metric-point-size 覆盖槽。 |
| `--xh-cartesian-chart-series-color` | `area-fill`<br>`bar`<br>`dot`<br>`legend-swatch`<br>`line`<br>`point`<br>`tooltip-swatch` | `background`<br>`border`<br>`fill`<br>`stroke` | `tone`<br>`xh-chart-slot=1`<br>`xh-chart-slot=2`<br>`xh-chart-slot=3`<br>`xh-chart-slot=4`<br>`xh-chart-slot=5`<br>`xh-chart-slot=6`<br>`xh-chart-slot=7`<br>`xh-chart-slot=8` | `--xh-_tone`<br>`--xh-chart-categorical-1`<br>`--xh-chart-categorical-2`<br>`--xh-chart-categorical-3`<br>`--xh-chart-categorical-4`<br>`--xh-chart-categorical-5`<br>`--xh-chart-categorical-6`<br>`--xh-chart-categorical-7`<br>`--xh-chart-categorical-8` | cartesian-chart 的 area-fill、bar、dot、legend-swatch、line、point、tooltip-swatch 部件 background、border、fill、stroke 覆盖槽。 |
| `--xh-cartesian-chart-tooltip-gap` | `tooltip` | `gap` | `default` | `--xh-space-1` | cartesian-chart 的 tooltip 部件 gap 覆盖槽。 |
| `--xh-cartesian-chart-tooltip-px` | `tooltip` | `padding-inline` | `default` | `--xh-surface-pad-sm` | cartesian-chart 的 tooltip 部件 padding-inline 覆盖槽。 |
| `--xh-cartesian-chart-tooltip-py` | `tooltip` | `padding-block` | `default` | `--xh-surface-pad-sm` | cartesian-chart 的 tooltip 部件 padding-block 覆盖槽。 |
| `--xh-cartesian-chart-tooltip-radius` | `tooltip` | `border-radius` | `default` | `--xh-shape-overlay` | cartesian-chart 的 tooltip 部件 border-radius 覆盖槽。 |
| `--xh-cartesian-chart-tooltip-row-gap` | `tooltip-row` | `gap` | `default` | `--xh-space-2` | cartesian-chart 的 tooltip-row 部件 gap 覆盖槽。 |
| `--xh-cartesian-chart-tooltip-shadow` | `tooltip` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | cartesian-chart 的 tooltip 部件 box-shadow 覆盖槽。 |
| `--xh-cartesian-chart-tooltip-swatch-line-radius` | `tooltip-swatch` | `border-radius` | `mark=line` | `--xh-shape-pill` | cartesian-chart 的 tooltip-swatch 部件 border-radius 覆盖槽。 |
| `--xh-cartesian-chart-tooltip-swatch-radius` | `tooltip-swatch` | `border-radius` | `default` | `--xh-shape-inset` | cartesian-chart 的 tooltip-swatch 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：状态 · 出现 · 循环（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-draw` · `xh-fade-in` · `xh-spin` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`opacity` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 绘图区不随文字方向镜像：坐标系的方向是数据约定，时间在 rtl 页面上同样从左向右，左方向键始终向左。
- 图例、标题与提示框的内容随文字方向排列，图例的左右键跟随视觉次序翻转。
- 横向条形图的类目标签在 rtl 下同样位于左侧，数值轴同样从左向右增长。
