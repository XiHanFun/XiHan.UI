# GraphChart 关系图 <Badge type="tip" text="new" />

看实体之间的连接关系、聚类与层级结构。同一个组件用五种布局：力导、环形、树、径向树，以及按节点自带坐标摆放的预设布局。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/graph-chart" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/graph-chart.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/graph-chart" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/graph-chart" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/graph-chart.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

缺省是力导布局：连着的节点靠近、互不相连的推开，分组着色；悬停节点时它的邻居与连线留着，拖动节点看邻居跟着动

<XhDemo src="graph-chart/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="graph-chart"`：**`root`** · `caption` · `legend` · `legend-item` · `legend-swatch` · `legend-label` · **`viewport`** · **`plot`** · `link` · `arrow` · `node` · `node-label` · `link-label` · `focus-ring` · `tooltip` · `tooltip-header` · `tooltip-row` · `tooltip-value` · `tooltip-name` · `empty` · `summary` · `table`

## 示例

### 环形

layout="circular" 把节点按分组排在一个圆上：组与组之间有多少连线一眼看得出

<XhDemo src="graph-chart/02-circular" />

### 树

layout="tree" 从没有入边的节点组树，根在最左、自左而右；数据不是树时报错

<XhDemo src="graph-chart/03-tree" />

### 径向树

layout="radial-tree" 让根在圆心、一层一圈：叶子很多时比横排的树省地方

<XhDemo src="graph-chart/04-radial-tree" />

### 有向与节点大小

directed 在连线的目标一端画箭头，提示框分出入；节点的 value 决定面积，连线的 value 决定粗细

<XhDemo src="graph-chart/05-directed" />

### 平移缩放

zoom 打开画布的平移缩放：按住 Ctrl（⌘）滚动缩放，放大后拖动空白处平移，焦点在图上时按 + / − / 0

<XhDemo src="graph-chart/06-zoom" />

### 预设坐标

layout="preset" 按节点上写的 x / y 摆放，整体等比缩放进绘图区：机房拓扑这类位置本身有含义的图用它

<XhDemo src="graph-chart/07-preset" />

### 连线上的字

连线的 label 写在连线中点，描一圈底色压在线上也读得清；和名字压住时不写，数据表里多一列照样读得到

<XhDemo src="graph-chart/08-link-labels" />

### 同步平移缩放

两张图接到同一份受控的 view：在任一张上缩放、平移，另一张跟着到同一处，对照着看两个时段

<XhDemo src="graph-chart/09-controlled-view" />

## 设计指引

### 何时使用

- 数据是一张网：人与人、服务与服务、文献与引用，读者要看谁和谁连着、哪里抱成一团、谁是枢纽。
- 数据是一棵树，但读者关心的是结构（谁在谁下面、分了几层），而不是占比：组织架构、依赖树、分类体系。

### 何时不用

- 要比较每个部分占整体多少：用[层级图](./hierarchy-chart)，面积比连线好读占比。
- 连线带着流量、要看从哪里流到哪里：用[桑基图](./sankey-chart)。
- 节点多到上千个：连线糊成一团，先按分组聚合；多于 2000 个节点时组件不画。
- 用户要在里面选择、展开、导航：那是[树](./tree)控件，不是可视化。

### 特性

- 数据是节点（`nodes`：`id`，可选 `name`、`group`、`value`、`x`、`y`）与连线（`links`：`source`、`target`，可选 `value`、`label`）。节点重复、连线的端点不存在或自环时报 `chart.graph-shape`，根上写 `data-state="error"`；多于 500 个节点时按提醒报 `chart.graph-size`（交互会变慢），多于 2000 个时报错不画。
- `layout` 取 `force`（缺省）、`circular`、`tree` 或 `radial-tree`。力导同步跑到收敛再画，初始位置按叶序排开，同样的数据永远得到同样的布局；环形按分组聚在一起、等角排在圆上，组间多留一份空当；树的根在最左、自左而右，径向树的根在圆心。树与径向树从 `root`（缺省取没有入边的节点）沿连线组树，有节点两个父节点、根有父节点或走不到时报 `chart.graph-shape`。
- `layout="preset"` 按节点上写的 `x` / `y` 摆放：单位随意（经纬度、设计稿像素都行），整体等比缩放进绘图区、四周留出与力导相同的空，纵轴向下为正；只有一个点或全在一条线上时那一向不缩放、摆在正中。有节点缺有限数的 `x` / `y` 时报 `chart.graph-shape`。拓扑图、机房图、地理位置这类坐标本身有含义的场景用它；坐标由数据给定，节点不能拖动。
- 节点按 `group` 第一次出现的先后分配分类色 1–8，没有分组时全部用色槽 1；多于 8 组时报 `chart.too-many-series`。`value` 经平方根比例尺决定节点面积；连线的 `value` 决定线的粗细。`directed` 在连线的目标一端画箭头。
- 名字先量再放：力导与预设写在节点下面，环形与径向树沿半径朝外写，树的叶子写右边、中间节点写左边。名字互相压住时连线多的节点先放，放不下的交给提示框与数据表。
- 连线的 `label` 写在两端节点圆心连线的中点（部件 `link-label`），字的四周描一圈画布底色，压在连线上也读得清。它排在节点名字之后放：和名字或节点压住、越出绘图区时不写，数据表里多出一列照样读得到。关系名短时才写在图上，长句放进提示框或旁边的表。
- 有两组及以上时显示图例，点图例项切换这一组的显隐：隐藏的节点与连着它们的线不画，树布局下连同子孙一起不画；悬停图例项时只留这一组。
- 悬停节点时它、它的邻居与连着它的线留着，线换成它的颜色，其余淡出到 `--xh-chart-dim-alpha`；提示框写数值（有的话）与连线数，有向时分出入。命中区至少 `--xh-chart-hit-min` 见方。
- 力导布局下可以拖动节点（`draggableNodes`，缺省开；不叫 `draggable`：那是 HTML 的原生属性）：拖着时它跟着指针，邻居被连线带着动；松手后模拟冷却到收敛，位置留在那里，直到数据、布局、尺寸或图例显隐变化。拖动过之后补派的 click 不算按下。
- `zoom` 打开画布的平移缩放：按住 Ctrl（⌘）滚动滚轮以指针为锚点缩放，放大后拖动空白处平移，焦点在绘图区时 + / − 缩放、0 回到原样；`api.zoomBy` / `api.resetView` 供作者自己放按钮。缩放只改节点的位置，节点与名字的大小不变，放大后放得下的名字会多写出来。
- 画布视图（`{ k, x, y }`：缩放倍数与平移）可以受控：给了 `view` 即受控，缩放、平移与复位只发 `onViewChange`（Vue 配合 `v-model:view`），由宿主写回。几张图接同一份视图即同步平移缩放；把视图存下来，下次打开时经 `defaultView` 或 `view` 还原。`zoom` 关掉时视图回到原样、不再变化。
- `format` 指定数值格式（数字格式或函数），提示框、可及名与数据表共用。
- 多张图接到同一个受控的 `activeKey` 上时，关系图按节点的身份与其他图对齐。
- `pending` 表示正在重新取数：保留上一帧、整体降低不透明度并在根上写 `aria-busy`。首次取数、手里还没有数据时，空态写 `translations.loadingText` 并转一个圈，取完仍没有节点才写 `emptyText`。
- 首次出现时节点从圆心长出，连线与名字淡入，数据晚于挂载到达（异步取数，或 Web Components 连上之后才赋 `data`）时同样播这段入场；之后的数据变化与图例切换从当前位置插值到新布局。拖动与平移缩放是直接操纵，画面跟手，不播过渡。`animated={false}`（Web Components 写 `animated="false"`）关闭过渡，松开拖动的节点时一次冷却到收敛；系统开了减弱动效或容器写了 `data-motion="reduce"` 时同样不逐帧播放模拟。
- 三个适配器的作者侧写法不同，最终 DOM 一致：Vue 与 React 不写默认内容时铺开缺省结构（标题、图例、视口与绘图区、空态、提示框），提示框内容可由作用域插槽 / 函数式 children 替换；Web Components 侧作者写外壳（root、caption、legend、viewport 与其中空的 `<svg>` plot，可选 empty 与 tooltip），连线、箭头、节点、图例项与提示框的缺省内容由元素生成进去。
- Web Components 侧的节点、连线、数值格式与视图（`view` / `defaultView`）只走 JS property，非受控时此刻的视图从 `currentView` 读；布局、根、有向、拖动（`draggable-nodes`）、缩放与 `active-key` 另有同名属性。宿主元素缺省是行内元素，放进 flex / grid 时要给它一个宽度。

### 最佳实践

- 为图写标题：`caption` 是图的可访问名称，也要说明节点与连线各代表什么。
- 用分组给节点着色：颜色回答「属于哪一类」，位置回答「和谁连着」。
- 节点多于一两百个时先聚合，或者只画一个节点的邻居；力导图的价值在于一眼看出结构，糊成一团就没有了。
- 结构是树时用 `tree` 或 `radial-tree`：力导会把层级打散。
- 需要读出准确的连线时，在旁边放一张[表格](./table)，或把 `api.table` 交给表格组件。

### 反模式

- 用力导的节点位置表达数值：力导布局的坐标没有含义，只有远近与连通；坐标本身有含义时用 `preset`。
- 给每个节点一个颜色：颜色多到分不清，也没有表达任何分组。
- 靠拖动才能读懂的图：缺省布局就该把结构摆清楚，拖动只是辅助。
- 用提示框作为读取数值的唯一途径：提示框对读屏隐藏，数值要能从可及名、摘要或数据表读到。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-graph-chart>` |
| Vue 组件 | `XhGraphChartCaption` `XhGraphChartEmpty` `XhGraphChartLegend` `XhGraphChartPlot` `XhGraphChartRoot` `XhGraphChartTooltip` `XhGraphChartViewport` |
| 组合式函数 | `useGraphChart` |
| 状态机 | `graphChartMachine` |
| 皮肤 | `@xihan-ui/styles/graph-chart.css` |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `view-change` | `GraphViewChangeDetails` | 画布视图变化（缩放、平移、复位）；detail 为 `{ view }`，受控时由宿主写回 view property |
| `hidden-series-change` | `ChartHiddenSeriesChangeDetails` | 图例切换显隐；detail 为 `{ hiddenSeries: string[] }` |
| `active-key-change` | `ChartActiveKeyChangeDetails` | 指针或键盘换了激活的节点；detail 为 `{ activeKey }`，收起时为 null |
| `datum-active` | `ChartDatumDetails` | 悬停或聚焦到某个节点；detail 为节点详情，收起时为 null |
| `datum-press` | `ChartDatumDetails` | 指针点击、Enter 或 Space 按在某个节点上；detail 为节点详情 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhGraphChartRoot` | `default` | `GraphChartRootSlotProps` | 自行摆放部件；不写时铺开缺省结构：图例、视口（绘图区与空态）、提示框。 |
| `XhGraphChartRoot` | `caption` | — | 缺省结构里的标题内容。 |
| `XhGraphChartRoot` | `tooltip` | `GraphChartTooltipSlotProps` | 缺省结构里的提示框内容。 |
| `XhGraphChartRoot` | `empty` | — | 缺省结构里的空态内容。 |
| `XhGraphChartTooltip` | `default` | `GraphChartTooltipSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhGraphChartRoot` | `nodes` | `readonly GraphNodeDatum[]` |  | 节点：身份、名字、分组与数值。 |
| `XhGraphChartRoot` | `links` | `readonly GraphLinkDatum[]` |  | 连线：两端节点的身份与可选的权重。 |
| `XhGraphChartRoot` | `layout` | `GraphLayout` |  | 布局，缺省 force。 |
| `XhGraphChartRoot` | `root` | `string` |  | 树与径向树的根；不写时取没有入边的节点。 |
| `XhGraphChartRoot` | `directed` | `boolean` |  | 有向：连线的目标一端画箭头。 |
| `XhGraphChartRoot` | `draggableNodes` | `boolean` |  | 力导布局下可以拖动节点，缺省 true。 |
| `XhGraphChartRoot` | `zoom` | `boolean` |  | 画布可以平移缩放，缺省 false。 |
| `XhGraphChartRoot` | `view` | `GraphView` |  | 画布视图：给了即受控，写入只发 onViewChange。 |
| `XhGraphChartRoot` | `defaultView` | `GraphView` |  |  |
| `XhGraphChartRoot` | `format` | `NumberFormatSpec \| ((value: number) => string)` |  | 数值格式。 |
| `XhGraphChartRoot` | `hiddenSeries` | `string[]` |  | 隐藏的分组（受控）。 |
| `XhGraphChartRoot` | `defaultHiddenSeries` | `string[]` |  | 初始隐藏的分组（非受控）。 |
| `XhGraphChartRoot` | `activeKey` | `ChartKey \| null` |  | 激活的键（受控）：与别的图联动时是节点的身份。 |
| `XhGraphChartRoot` | `pending` | `boolean` |  | 数据重取中：保留上一帧、整体降低不透明度。 |
| `XhGraphChartRoot` | `animated` | `boolean` |  | 播放过渡动画，缺省 true；false 时直接画终态。 |
| `XhGraphChartRoot` | `locale` | `string` |  |  |
| `XhGraphChartRoot` | `translations` | `Partial<GraphChartTranslations>` |  |  |
| `XhGraphChartRoot` | `onHiddenSeriesChange` | `GraphChartProps['onHiddenSeriesChange']` |  |  |
| `XhGraphChartRoot` | `onActiveKeyChange` | `GraphChartProps['onActiveKeyChange']` |  |  |
| `XhGraphChartRoot` | `onDatumActive` | `GraphChartProps['onDatumActive']` |  |  |
| `XhGraphChartRoot` | `onDatumPress` | `GraphChartProps['onDatumPress']` |  |  |
| `XhGraphChartRoot` | `onViewChange` | `GraphChartProps['onViewChange']` |  | 画布视图变化（缩放、平移、复位）。 |
| `XhGraphChartRoot` | `caption` | `ReactNode` |  | 缺省结构里的标题内容。 |
| `XhGraphChartRoot` | `renderTooltip` | `(props: GraphChartTooltipSlotProps) => ReactNode` |  | 缺省结构里的提示框内容。 |
| `XhGraphChartRoot` | `empty` | `ReactNode` |  | 缺省结构里的空态内容。 |
| `XhGraphChartRoot` | `children` | `SlotChildren<GraphChartRootSlotProps>` |  | 自行摆放部件；不写时铺开缺省结构：图例、视口（绘图区与空态）、提示框。 |
| `XhGraphChartTooltip` | `children` | `SlotChildren<GraphChartTooltipSlotProps>` |  | 替换缺省内容；函数式 children 拿到激活的节点与缺省的内容模型。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'error' \| undefined |
| `tooltip` | 'visible' \| 'hidden' |
| `empty` | 'loading' \| undefined |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `SIM.FRAME` · `VIEW.SET`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `model` | `GraphModel` | 管线产物：图、布局、场景与无障碍模型。 |
| `scene` | `Scene` | 要画的场景；尚未测量时为空场景。 |
| `overlay` | `GraphOverlay` | 前景层：焦点环。 |
| `measured` | `boolean` | 视口尚未测量（服务端与首帧）。 |
| `empty` | `boolean` | 没有可画的节点。 |
| `legendItems` | `readonly GraphLegendItem[]` |  |
| `active` | `ChartDatumDetails \| null` | 激活的节点；没有时为 null。 |
| `tooltip` | `GraphTooltipModel \| null` | 提示框内容；收起时为 null。 |
| `summary` | `string` |  |
| `table` | `TableModel` | 数据表模型：每条连线一行。 |
| `emptyText` | `string` |  |
| `tableCaption` | `string` |  |
| `activeKey` | `ChartKey \| null` |  |
| `hiddenSeries` | `string[]` |  |
| `view` | `GraphView` |  |
| `toggleSeries` | `(id: string) => void` | 切换某个分组的显隐。 |
| `zoomBy` | `(factor: number, at?: { x: number, y: number }) => void` | 按倍数缩放，锚点缺省是绘图区中心；zoom 关掉时不动。 |
| `resetView` | `() => void` | 回到不缩放、不平移。 |
| `setFocusedDatum` | `(ref: { seriesId: string, index: number } \| null) => void` | 移动键盘锚点：只改锚点，不移动 DOM 焦点，也不派发回调。 |
| `markTag` | `(mark: Mark) => GraphMarkTag` |  |
| `getRootProps` | `() => T['element']` |  |
| `getCaptionProps` | `() => T['element']` |  |
| `getLegendProps` | `() => T['element']` |  |
| `getLegendItemProps` | `(item: GraphLegendItem) => T['button']` |  |
| `getLegendSwatchProps` | `(item: GraphLegendItem) => T['element']` |  |
| `getLegendLabelProps` | `(item: GraphLegendItem) => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getPlotProps` | `() => T['element']` |  |
| `getMarkProps` | `(mark: Mark) => T['element']` |  |
| `getTooltipProps` | `() => T['element']` |  |
| `getTooltipHeaderProps` | `() => T['element']` |  |
| `getTooltipRowProps` | `(row: GraphTooltipRow) => T['element']` |  |
| `getTooltipValueProps` | `(row: GraphTooltipRow) => T['element']` |  |
| `getTooltipNameProps` | `(row: GraphTooltipRow) => T['element']` |  |
| `getEmptyProps` | `() => T['element']` |  |
| `getSummaryProps` | `() => T['element']` |  |
| `getTableProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | 总是 | 绘图区只占一个 Tab 位：焦点落到锚点节点，首次为阅读序的第一个节点；图例同样只占一个 Tab 位 |
| `ArrowLeft` / `ArrowRight` / `ArrowUp` / `ArrowDown` | 焦点在绘图区 | 朝这个方向左右各 45° 的锥形里，离得近、偏得少的节点；锥形里没有节点时原地不动 |
| `Home` | 焦点在绘图区 | 阅读序的第一个节点 |
| `End` | 焦点在绘图区 | 阅读序的最后一个节点 |
| `Enter` / `Space` | 焦点在绘图区 | 报告聚焦的节点（onDatumPress） |
| `+` / `-` / `0` | zoom 开着、焦点在绘图区 | 以绘图区中心放大、缩小一档；0 回到不缩放、不平移 |
| `Escape` | 提示框显示着 | 收起提示框，焦点留在原处；按键不拦截，外层浮层的关闭仍归它自己 |
| `ArrowLeft` / `ArrowRight` / `Home` / `End` | 焦点在图例 | 在图例项之间移动，左右键跟随文字方向的视觉次序 |
| `Enter` / `Space` | 焦点在图例项 | 切换该分组的显隐（原生按钮行为） |

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
| `mark` | `aria-hidden` | 'true' |

- 根是 `<figure>`，可访问名称来自 `caption`；不放标题时在根上写 `aria-label`。
- 绘图区是 `role="graphics-document"`，`aria-describedby` 指向组件生成的摘要；每个节点是 `role="graphics-symbol"`，名称取 `translations.datumLabel`（缺省「名字, 数值, 连线数」），务必按本地语言改写。连线与箭头对读屏隐藏，也不占焦点：它们全部在数据表里。
- 节点在 DOM 里按阅读序排列：树与径向树是深度优先的先序，其余按分组再按名字，读屏逐个念时有稳定的次序。
- 绘图区只占一个 Tab 位，焦点落在节点上：方向键朝那个方向左右各 45° 的锥形里找离得近、偏得少的节点，Home / End 到阅读序的头尾；`zoom` 开着时 + / − / 0 缩放。焦点环画在节点之外，只在键盘聚焦时出现。
- 名字、连线上的字与焦点环一律 `aria-hidden`；提示框同样 `aria-hidden`。
- 组件在根内生成一段摘要与一张数据表，视觉隐藏、对读屏可见：摘要写节点数、连线数与连线最多的节点（模板是 `translations.summary`）；数据表每条连线一行，源与目标两列，连线写了 `label` 时多一列关系，有权重时再多一列。
- 图例是 `role="toolbar"`，每一项是 `<button aria-pressed>`，按下表示这一组可见；图例整体只占一个 Tab 位。
- 颜色不是区分分组的唯一线索：节点的名字写在图上，图例写出分组名；强制色下节点画成系统色的面与描边。
- 过渡只改画面：节点的名称、摘要与数据表在数据变化的那一刻就按新数据更新；收场中的节点 `aria-hidden`、不可聚焦。

## 样式参考

### 皮肤

`@xihan-ui/styles/graph-chart.css` 使用 `[data-scope="graph-chart"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-state` | 'error' \| undefined |
| `root` | `data-xh-chart-part` | 'root' |
| `caption` | `data-xh-chart-part` | 'caption' |
| `legend` | `data-xh-chart-part` | 'legend' |
| `legend-item` | `data-pressed` | ''（条件成立时才出现） |
| `legend-item` | `data-value` | item.id |
| `legend-item` | `data-xh-action-control` | '' |
| `legend-item` | `data-xh-action-profile` | 'text' |
| `legend-item` | `data-xh-action-size` | 'xs' |
| `legend-item` | `data-xh-action-variant` | 'ghost' |
| `legend-item` | `data-xh-chart-part` | 'legend-item' |
| `legend-item` | `data-xh-chart-pattern` | String(item.slot) |
| `legend-item` | `data-xh-chart-slot` | String(item.slot) |
| `legend-swatch` | `data-xh-chart-part` | 'legend-swatch' |
| `viewport` | `data-xh-chart-part` | 'viewport' |
| `plot` | `data-draggable` | ''（条件成立时才出现） |
| `plot` | `data-dragging` | ''（条件成立时才出现） |
| `plot` | `data-xh-chart-part` | 'plot' |
| `plot` | `data-zoomed` | ''（条件成立时才出现） |
| `tooltip` | `data-placement` | 'top' \| 'bottom'-'right' \| 'left' \| undefined |
| `tooltip` | `data-state` | 'visible' \| 'hidden' |
| `tooltip` | `data-xh-chart-part` | 'tooltip' |
| `tooltip-header` | `data-xh-chart-part` | 'tooltip-header' |
| `tooltip-row` | `data-xh-chart-part` | 'tooltip-row' |
| `tooltip-value` | `data-xh-chart-part` | 'tooltip-value' |
| `tooltip-name` | `data-xh-chart-part` | 'tooltip-name' |
| `empty` | `data-state` | 'loading' \| undefined |
| `empty` | `data-xh-chart-part` | 'empty' |
| `mark` | `data-dimmed` | ''（条件成立时才出现） |
| `mark` | `data-xh-chart-part` | mark.part \| undefined |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-graph-chart-empty-gap` | `empty` | `gap` | `state=loading` | `--xh-space-2` | graph-chart 的 empty 部件 gap 覆盖槽。 |
| `--xh-graph-chart-gap` | `root` | `gap` | `default` | `--xh-space-3` | graph-chart 的 root 部件 gap 覆盖槽。 |
| `--xh-graph-chart-height` | `viewport` | `block-size` | `default` | `--xh-chart-height` | graph-chart 的 viewport 部件 block-size 覆盖槽。 |
| `--xh-graph-chart-legend-gap` | `legend` | `gap` | `default` | `--xh-space-1` | graph-chart 的 legend 部件 gap 覆盖槽。 |
| `--xh-graph-chart-legend-swatch-radius` | `legend-swatch` | `border-radius` | `default` | `--xh-shape-inset` | graph-chart 的 legend-swatch 部件 border-radius 覆盖槽。 |
| `--xh-graph-chart-link-color` | `arrow`<br>`link` | `fill`<br>`stroke` | `default` | `--xh-fg-subtle` | graph-chart 的 arrow、link 部件 fill、stroke 覆盖槽。 |
| `--xh-graph-chart-link-width` | `link` | `stroke-width` | `default` | `--xh-stroke-thin` | graph-chart 的 link 部件 stroke-width 覆盖槽。 |
| `--xh-graph-chart-node-size` | `legend-swatch`<br>`root`<br>`tooltip-swatch` | `background` | `@media (forced-colors: active)`<br>`@media print`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=1`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns` | `--xh-chart-point-size` | graph-chart 的 legend-swatch、root、tooltip-swatch 部件 background 覆盖槽。 |
| `--xh-graph-chart-series-color` | `arrow`<br>`legend-swatch`<br>`link`<br>`node`<br>`pattern-line`<br>`tooltip-swatch` | `background`<br>`border`<br>`fill`<br>`stroke` | `@media (forced-colors: active)`<br>`@media print`<br>`highlighted`<br>`mark=line`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=1`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns`<br>`xh-chart-slot=1`<br>`xh-chart-slot=2`<br>`xh-chart-slot=3`<br>`xh-chart-slot=4`<br>`xh-chart-slot=5`<br>`xh-chart-slot=6`<br>`xh-chart-slot=7`<br>`xh-chart-slot=8` | `--xh-chart-categorical-1`<br>`--xh-chart-categorical-2`<br>`--xh-chart-categorical-3`<br>`--xh-chart-categorical-4`<br>`--xh-chart-categorical-5`<br>`--xh-chart-categorical-6`<br>`--xh-chart-categorical-7`<br>`--xh-chart-categorical-8` | graph-chart 的 arrow、legend-swatch、link、node、pattern-line、tooltip-swatch 部件 background、border、fill、stroke 覆盖槽。 |
| `--xh-graph-chart-tooltip-gap` | `tooltip` | `gap` | `default` | `--xh-space-1` | graph-chart 的 tooltip 部件 gap 覆盖槽。 |
| `--xh-graph-chart-tooltip-px` | `tooltip` | `padding-inline` | `default` | `--xh-surface-pad-sm` | graph-chart 的 tooltip 部件 padding-inline 覆盖槽。 |
| `--xh-graph-chart-tooltip-py` | `tooltip` | `padding-block` | `default` | `--xh-surface-pad-sm` | graph-chart 的 tooltip 部件 padding-block 覆盖槽。 |
| `--xh-graph-chart-tooltip-radius` | `tooltip` | `border-radius` | `default` | `--xh-shape-overlay` | graph-chart 的 tooltip 部件 border-radius 覆盖槽。 |
| `--xh-graph-chart-tooltip-row-gap` | `tooltip-row` | `gap` | `default` | `--xh-space-2` | graph-chart 的 tooltip-row 部件 gap 覆盖槽。 |
| `--xh-graph-chart-tooltip-shadow` | `tooltip` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | graph-chart 的 tooltip 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：状态 · 出现 · 循环（见[动效规范](../design/motion#角色)）。

`opacity` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：值由内核逐帧算出（`frameLoop`），皮肤里看不到这段；内核按组件所在的作用域判断减弱动效（最近的 `data-motion`、应用级覆盖、系统偏好），据此决定要不要动。

`prefers-reduced-motion: reduce` 下本组件另有降级规则；内核驱动的那段不经令牌层，由内核按元素判断后自行降级。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 绘图区不随文字方向镜像：树的根始终在左，右键始终是屏幕右边。
- 图例、标题与提示框的内容随文字方向排列，图例的左右键跟随视觉次序翻转。
