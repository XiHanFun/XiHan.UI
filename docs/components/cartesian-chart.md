# CartesianChart 直角坐标图 <Badge type="tip" text="new" />

在直角坐标系里画柱、折线与散点：一根自变量轴（类目、数值或时间），一根数值轴，任意多个系列共用这两根轴。柱状图、条形图、分组与堆叠柱、折线、面积与堆叠面积、散点与气泡都是它的不同配置，不是不同的组件。

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

`data-scope="cartesian-chart"`：**`root`** · `caption` · `legend` · `legend-item` · `legend-swatch` · `legend-label` · `legend-scale` · `legend-scale-name` · `legend-scale-bar` · `legend-scale-value` · **`viewport`** · **`plot`** · `defs` · `pattern` · `pattern-line` · `clip-path` · `clip-rect` · `grid` · `grid-line` · `axis` · `axis-line` · `tick` · `tick-label` · `axis-title` · `series` · `bar` · `stem` · `connector` · `candle` · `wick` · `box` · `whisker` · `median` · `outlier` · `line` · `area-fill` · `dot` · `point` · `data-label` · `total-label` · `end-label` · `leader-line` · `annotation` · `annotation-label` · `brush` · `crosshair` · `focus-ring` · `tooltip` · `tooltip-header` · `tooltip-row` · `tooltip-swatch` · `tooltip-value` · `tooltip-name` · `empty` · `zoom-slider` · `zoom-track` · `zoom-window` · `zoom-handle` · `zoom-preview` · `zoom-preview-line` · `summary` · `table`

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

换一组数据时柱从当前高度走到新高度，柱端的数随之滚动；关掉动画后直接画终态

<XhDemo src="cartesian-chart/09-transition" />

### 数据标签与合计

labels="inside" 把每一段的数写在柱内，totals 在整叠外侧写合计；段太矮放不下时不写

<XhDemo src="cartesian-chart/10-labels" />

### 线尾标签

endLabel 把系列名与末值写在线尾，末端挨着时上下推开、用引导线连回线尾；折线不多时读者不用对照图例

<XhDemo src="cartesian-chart/11-end-label" />

### 纹理

祖先写上 data-xh-chart-patterns，柱改用纹理、折线换线型，图例画成同一副；强制色与打印下总是这样

<XhDemo src="cartesian-chart/12-patterns" />

### 散点

每行一个点，看两个量有没有关系、点在哪里扎堆；两个系列的点形状也不同

<XhDemo src="cartesian-chart/13-scatter" />

### 气泡

size 把第三个量映射到点的面积：面积与数值成正比，读的是大小之比而不是半径之比

<XhDemo src="cartesian-chart/14-bubble" />

### 类目上的分布

散点落在类目轴上时用 jitter 左右散开，看每个类目里的点怎么分布，而不是叠成一条竖线

<XhDemo src="cartesian-chart/15-strip" />

### 按值着色

color 把第三个量映射到顺序色阶，图例末尾多一条色阶；palette 把色阶换到别的色相上

<XhDemo src="cartesian-chart/16-color" />

### 参考线、参考带与极值点

annotations 在数据之外画出目标、正常区间与最高的那一天，读者不用自己去比

<XhDemo src="cartesian-chart/17-annotations" />

### 趋势线

trend 画移动平均或最小二乘直线：看的是走向，不是某一天的起伏

<XhDemo src="cartesian-chart/18-trend" />

### 瀑布

waterfall 让每一步接在上一步的累计值上，涨跌分色；total 为真的行是小计，从 0 画到累计值

<XhDemo src="cartesian-chart/19-waterfall" />

### 直方图

柱的 x 写成 [起, 止] 分箱区间，柱按区间的真实宽度画在数值轴上；分箱用 @xihan-ui/viz 的 bin() 或后端算好

<XhDemo src="cartesian-chart/20-histogram" />

### K 线

mark: 'candlestick' 把开高低收画在同一根上，涨跌分色；style="ohlc" 换成美国线

<XhDemo src="cartesian-chart/21-candlestick" />

### 箱线与小提琴

mark: 'boxplot' 按 x 分组统计原始值，画出中位数、四分位与离群点；style="violin" 画分布的轮廓

<XhDemo src="cartesian-chart/22-boxplot" />

### 哑铃

y 写成 [下, 上] 是区间，棒棒糖形态两头各一个点：一眼看出每一项从哪里变到哪里

<XhDemo src="cartesian-chart/23-dumbbell" />

### 区间带

折线的 y 写成 [下, 上] 只铺一条带：预测值的上下限画成带，实际值照常画成线

<XhDemo src="cartesian-chart/24-band" />

### 流图

折线堆叠写 stackOffset: 'wiggle'：各层以中线上下铺开、整体摆动最小，读的是每层的宽窄与起落

<XhDemo src="cartesian-chart/25-stream" />

### 缩放

zoom 打开自变量轴的缩放：按住 Ctrl（⌘）滚轮以指针为中心缩放，放大后拖动平移，缩放条拖两端改窗口；点多时按像素降采样

<XhDemo src="cartesian-chart/26-zoom" />

### 刷选

brush 打开刷选：在绘图区里拖动框出一块，框外的点淡出，松手派发一次范围与框里的数据；点一下或按 Escape 清掉

<XhDemo src="cartesian-chart/27-brush" />

### 对称对数轴

yAxis.scale 写 symlog：长尾数据跨越正负、含 0 也画得出，0 附近铺得开、尾部压得住；还有 sqrt 与 pow（指数写 exponent）

<XhDemo src="cartesian-chart/28-symlog" />

### 按时区排时间刻度

xAxis.timeZone 写 IANA 名：整点与整天落在那个时区的墙上时间上，刻度标签、提示框与数据表里的日期都按它写

<XhDemo src="cartesian-chart/29-time-zone" />

### 加载态

pending 表示正在取数：首次还没有数据时空态写「加载中」并转圈，之后重取时保留上一帧、整体变淡，取回来再过渡到新值

<XhDemo src="cartesian-chart/30-loading" />

### 下钻

onDatumPress 接住点下的那根柱（Enter / Space 同样）：换成这个地区按月的数据，旁边放一个按钮回到全部地区

<XhDemo src="cartesian-chart/31-drill-down" />

### 刷选联动

onBrushSelectionChange 交出框里的数据：旁边的统计跟着框走，清掉框就回到全部门店

<XhDemo src="cartesian-chart/32-brush-linked" />

## 设计指引

### 何时使用

- 比较若干类目上的数值：各月销售额、各渠道转化量。
- 观察一个量随时间的变化趋势，或几个量的走势是否同步。
- 查看整体由哪几部分构成、各部分占比如何随类目变化（堆叠、百分比堆叠）。
- 类目名较长、或类目较多需要竖向滚读时，用横向的条形图。
- 看两个量之间有没有关系、点在哪里扎堆、有没有离群的点（散点）；再叠一个量用面积表达（气泡）。
- 看价格在每个周期里怎么走（K 线）：开盘、最高、最低、收盘四个价画在同一根上。
- 比较几组数的分布：中位数、四分位与离群点（箱线），或分布的轮廓（小提琴）。
- 看一个量的分布形状（直方图）：柱的 `x` 写成分箱区间，不要把每个取值当成一个类目画柱。

### 何时不用

- 只报告一个数，或一个数与它的同比：使用[统计数值](./statistic)。
- 少量类目在整体中的占比：使用饼图。
- 类目多于 7 个且每个都需要读出准确数字：使用[表格](./table)，或表格与图并列。
- 两个量纲（如金额与转化率）：画两张图并用 `activeKey` 联动，不在一张图里放第二根 y 轴。两根 y 轴的刻度零点与比例都可以任意选，读者会把两条线的交叉读成含义，而它只是刻度选择的巧合。
- 看强度分布而不是具体数值：使用[热力图](./heatmap)。

### 特性

- 系列用 `mark` 区分画法：`bar`、`line` 与 `scatter`。每个系列用字段名把数据的列映射到通道：`x` 是自变量，`y` 是数值。同一张图可以混放不同画法的系列，它们共用坐标轴。
- 数据是对象数组，组件只读不写。系列 `id` 缺省取 `y` 的字段名，`name` 缺省同 `id`；图例、提示框与数据表显示 `name`，`hiddenSeries` 与部件上的 `data-series-id` 使用 `id`。
- `x` 是自变量轴、`y` 是数值轴，与屏幕方向无关。`orientation="horizontal"` 把整张图转置：自变量竖排、数值横向延伸，即条形图；`xAxis` / `yAxis` 的配置不用跟着对调。
- 比例尺缺省按数据推断：含柱系列或自变量不是数字与日期时为 `band`（类目），自变量是 `Date` 时为 `time`，是数字时为 `linear`；数值轴为 `linear`。`scale` 可显式指定 `band` / `point` / `linear` / `log` / `sqrt` / `pow` / `symlog` / `time` / `utc`。`log` 的定义域必须全为正数，否则报错并在根上写 `data-state="error"`。`sqrt` 适合读面积感的量；`pow` 的指数写在 `exponent`（正的有限数，缺省 1）；`symlog` 是对称对数，跨越正负、含 0 的长尾数据也画得出，常数写在 `constant`（正数，缺省 1，越小越接近对数）。参数无效时报 `chart.scale-param`。这些只是同一根轴换一种比例尺，不是另一种图表。
- 时间轴（`time` / `utc`）的 `timeZone` 写一个 IANA 时区名：整点、整天、月初这些刻度落在那个时区的墙上时间上（夏令时的跳变按日期模块的规则处理），刻度标签、提示框、可及名与数据表里的日期都按它写，看的人在哪个时区都一样。缺省 `time` 按运行环境所在时区、`utc` 按 UTC；名字无效时报 `chart.scale-param`。
- 类目轴的顺序缺省是数据中首次出现的顺序，`xAxis.domain` 可给出显式顺序；只在 `domain` 里、数据中没有的类目也会占位。
- 有柱系列时数值轴强制包含 0：柱的长度就是它编码的量，基线不在 0 时长度之比不再等于数值之比。只有折线时 `zero` 缺省不强制，定义域贴合数据；需要从 0 起时写 `yAxis.zero`。
- 数值轴两端缺省取整到刻度上（`nice`），刻度数量按绘图区长度估算：竖向的数值轴约每 2.5 行字高一个，横向的按最宽的刻度标签加间隙估算；`ticks` 可以给数量提示或显式的刻度值。
- 同一 `stack` 名的系列堆叠在一起：柱逐段累加，折线成为堆叠面积。`stackOffset: 'expand'` 把每个键归一成百分比，数值轴随之换成百分比格式；折线另有 `silhouette`（以 0 为中线上下对称）与 `wiggle`（流图：层按峰值出现的先后由内向外排，整体摆动最小），这两种堆叠的纵向位置只表达厚度，读的是每层的宽窄与起落；柱的堆叠含负值时缺省 `diverging`，正值向上、负值向下各自累加。同一堆叠组的 `stackOffset` 必须一致，不一致时报错。
- 多个柱系列不堆叠时并排分组：组内按系列次序排列，柱的厚度不超过 `--xh-chart-bar-max`（缺省 24px），类目很宽时柱不会被拉成大色块，多出的空间留作类目之间的间距。
- 堆叠的相邻两段之间留 `--xh-chart-gap`（2px）的表面缝，靠缝区分而不是靠描边。只有离基线最远的一端有圆角，基线一端始终是直角，读者据此判断柱是从哪里长出来的。
- `mark: 'boxplot'` 画箱线：`y` 写字段名时，同一个 x 上的全部行是一组原始值，按 R-7 求四分位（与 Excel、NumPy 缺省一致），须线到 1.5 倍四分距以内最远的点，其外为离群点（`outliers: false` 时须线直达最小与最大值）；`y` 写成 `{ min, q1, median, q3, max }` 五个字段时每个键一行、直接用算好的统计量，五个数须依次不减，否则报 `chart.invalid-range`。箱铺系列色的淡洗并描出轮廓，中位线加粗，须线两端带短横，离群点是空心小圆；箱宽取键间距的六成、不超过两倍柱厚上限。`style: 'violin'` 用核密度（高斯核，Silverman 带宽）画出每组分布的对称轮廓，宽度按整个系列里最大的密度归一、各组可以比较，要原始值，否则报 `chart.violin-raw`。箱（小提琴轮廓）是可聚焦的数据标记，可及名与提示框按 `translations.boxLabel` 写出五数，数据表五数与离群点各一列（列名 `translations.boxColumns`），锚点落在中位数。
- `mark: 'candlestick'` 画 K 线：`open` / `high` / `low` / `close` 四个字段，系列 `id` 缺省取收盘字段；每个键一根，自变量轴缺省是类目轴，数值轴盖住最低与最高价、不强制含 0。`style` 缺省 `candle`（影线从最低到最高，实体从开盘到收盘，开收相等的十字星也画一像素高的实体），`ohlc` 是美国线（一条竖线加左开右收两道短横）。收盘不低于开盘为涨、低于开盘为跌，取 `--xh-chart-rise` / `--xh-chart-fall`（缺省绿涨红跌，主题可以翻过来）；强制色下涨空心、跌实心。实体宽取键间距的七成、不超过柱厚上限，影线与实体以同一个像素中心对齐。实体是可聚焦的数据标记，可及名与提示框按 `translations.ohlcLabel` 写出四个价，数据表开高低收各一列（列名 `translations.ohlcColumns`），锚点与十字准线落在收盘价。最低价高于开盘或收盘、最高价低于开盘或收盘时报 `chart.ohlc-range`。
- 柱的 `x` 写成二元组 `[起, 止]` 是分箱区间（直方图）：自变量轴是数值轴（或时间轴），定义域盖到最后一箱的止点；柱按区间的真实宽度画，相邻两箱之间留 `--xh-chart-gap` 的表面缝，宽度不等的箱也如实画出。提示框、可及名、数据表与摘要把键写成「起 – 止」。分箱本身不在组件里做：用 `@xihan-ui/viz` 的 `bin()`（箱数、显式边界或 Sturges / Scott / Freedman–Diaconis 规则）或后端算好再给。止点不在起点之后时报 `chart.invalid-range`。
- 柱与折线的 `y` 可写成二元组 `[下, 上]` 表达区间：柱从下端画到上端浮着（浮动柱，数值轴不再强制含 0，比如每月的最低与最高气温）；折线只铺一条区间带、不画线（置信区间、正常范围），锚点与焦点代理落在带的正中。提示框、可及名与数据表写成「下 – 上」，系列 `id` 缺省取上端字段；区间不参与堆叠，下端高于上端时报 `chart.invalid-range`。
- 柱的 `shape: 'lollipop'` 画棒棒糖：一根系列色的细杆（`stem` 部件）顶一个点，类目多、实心柱挤成一片时更轻；`y` 是区间时两头各一个点，即哑铃，只有上端的点可聚焦。色标画成圆。
- 柱的 `waterfall` 画瀑布：每一步接在上一步的累计值上浮着，涨取 `--xh-chart-rise`、跌取 `--xh-chart-fall`（缺省绿涨红跌，主题可以翻过来）；`waterfall.total` 指定小计字段，为真的行从 0 画到当前累计值、保持系列色，它的 `y` 被忽略。相邻两步之间连一道结构色的细线（`connector` 部件），缺失的一步不画、不改累计，连接线跨过它。数据标签与可及名写这一步的增减，小计写累计值。瀑布不参与堆叠。
- 折线的 `curve` 缺省 `linear`；`monotone` 平滑且不越过数据点，不会画出数据中没有的峰谷；`step` / `step-before` / `step-after` 画成阶梯，台阶分别落在两点正中、前一点与后一点处，适合价格、库存这类在某一刻跳变的量。`area` 在折线下铺一层系列色的淡洗。缺失值（`null`、`undefined`、`NaN`）处折线断开，`connectNulls` 可改为连上。
- 折线的数据点 `symbols` 缺省 `auto`：相邻点间距不小于 16px 时才画，点密到连成一片时不画。键盘聚焦或悬停到折线上的数据时，那一个点总会画出来作为指示与焦点落点。
- 颜色按系列次序依次取分类色 1–8；`slot` 可把一个系列固定在某一色槽，同一业务实体在不同图表里保持同色。图例把某个系列隐藏后，其余系列的颜色不变。颜色本身带有好坏含义时（收入与支出、达标与超标）改写 `tone`，系列改用语气色；同一张图不混用分类色与语气色。
- 颜色不可用或不可靠时改用纹理区分系列：强制色与打印下总是开启，作者在任意祖先上写 `data-xh-chart-patterns` 也会开启。柱与面积改用本系列的斜线纹理填充并描出轮廓，折线换成各自的线型（实线、长虚线、点线、点划线……），图例与提示框的色标画成同一副纹理与线型。8 种纹理与色槽一一对应，定义在绘图区的 `<defs>` 里，id 由绘图区的 id 派生，服务端渲染与客户端一致。
- 系列多于 8 个时报错：分类色只有 8 个可区分的色槽，第 9 个开始会与前面的系列撞色。需要更多系列时先合并或分成几张图。
- 数据标签由系列的 `labels` 打开：柱写 `inside`（柱内居中）或 `end`（柱的远端外侧，负值翻到另一侧；堆叠中的段写在段内的远端），折线写 `end`（每个点的上方）。柱内的字取与色槽配对的前景色；放不下、与更要紧的标签重叠时不写。柱端外侧的标签写在绘图区里：数值轴两端各收进一截，最高的那根柱上面也有地方写。
- `totals` 让每个堆叠组在整叠外侧写出合计，含负值时正负两端各写一个；百分比堆叠不写合计。
- 折线的 `endLabel` 在线尾写系列名与末值，几条线的末端挤在一起时上下推开，推开的标签用引导线连回线尾，挤不下去掉末值最小的；右边留出它要的地方。
- `annotations` 画帮读者读数的参照：`line` 参考线（目标、阈值）、`band` 参考带（正常区间、促销期），`axis` 取 `x`（自变量轴）或 `y`（数值轴），与屏幕方向无关；`point` 标出某个系列的最大、最小、最后一个或指定 x 上的数据；`average` 是系列均值处的平均线；`trend` 是最小二乘直线或尾随窗口的移动平均（`window` 缺省 3）。参考线与参考带的值计入所在轴的定义域，数据之外的目标值也看得到；参考带垫在数据之下，其余压在数据之上。参考线是结构色的虚线（虚线表达阈值与推算，不是数据），标出的点、平均线与趋势线取所属系列的颜色、随系列淡出与隐藏。标签缺省写值，平均线写 `translations.averageLabel` 加均值；标签贴着绘图区边缘时翻到线或点的另一侧。指向不存在的系列、不在轴上的类目时报 `chart.annotation-target` 提醒，只少画这一条。
- 标签按重要性落位：注释的标签最先，其次合计、线尾标签，最后逐个数据的标签；它们都只给眼睛看，数值由每个数据的可及名、摘要与数据表承担。
- 散点每行一个点，同一个 `x` 上可以有任意多个点。只有散点时自变量按数据推断为连续轴，两端缺省取整到刻度上，两个方向都画网格。点的形状缺省随色槽依次取圆、方、菱形、三角……颜色分不清时形状还分得开；`symbol` 可指定形状，图例与提示框的色标画成同一个形状。
- 散点的 `size` 把一个字段映射到点的面积（半径取平方根），全部散点系列共用一把尺，最大的点半径等于柱厚上限；大小缺失、为 0 或负数的行不画。大的点先画、小的压在上面。连续轴两端各收进最大半径，贴着定义域端点的气泡也整个落在绘图区里。
- 散点的 `color` 按值着色：点的颜色取这个字段在顺序色阶上的位置，全部按值着色的系列共用一把尺，图例末尾多一条色阶（名字取 `translations.colorLabel`，两端写值域）。这样的系列不再取分类色，图例与提示框的色标取色阶中点或数据自己的颜色；字段缺失的点取色阶中点。点小，色阶最浅的一段压在承载面上看不清，点只用色阶上从 30% 起的一段，图例的渐变按同一段画。色阶的三个锚点缺省取 `--xh-chart-sequential-*`，`palette` 把它换到基础色板里同名的色相上（与热力图的色板同名），起点贴近承载面、终点贴近正文色，亮暗主题下都是值越大越显眼。
- 散点在类目轴上用 `jitter`（类目步长的比例 0–1）左右散开，看一个类目里的分布而不是叠成一条竖线。偏移以点的身份为种子：重渲染不跳。点的身份缺省是「x 与它在同一个 x 上的出现次序」，往后追加数据、改某个点的 `y` 都不换身份；数据会换序时给 `datumId` 指定身份字段。
- `zoom` 打开缩放：`x` 只缩放自变量轴，`y` 只缩放数值轴，`xy` 两根都缩放，缺省 `none`。窗口 `window` / `defaultWindow` 写两根轴各露出的一段、用定义域里的值：`x` 在类目轴上是首尾两个类目（含两端，如 `['三月', '六月']`），在连续轴上是两端的值（时间轴写 `Date`），`y` 是数值轴的 `[下, 上]`，不写或写 `null` 的轴是整条。多张图接到同一份受控窗口上即联动缩放；窗口两端的类目不在数据里时取轴的那一端，数据往后推时窗口照样有效，连续轴越出整条轴的部分夹回来。窗口一变派发 `onWindowChange`，受控时由作者写回。类目轴按窗口露出连续的一段类目，柱照样按露出的类目排满，窗外的数据不画；连续轴与数值轴换成窗口对着的定义域，两端不再取整，刻度在新定义域里重新取，系列与注释按绘图区裁剪。窗口的变化不播过渡，直接画到位。
- 缩放的手势：按住 Ctrl（⌘）滚轮以指针为中心缩放，不按时滚轮照常滚动页面；放大后拖动绘图区平移，内容跟着指针走；触屏双指捏合缩放、单指拖动平移，只在能缩放的方向上拦截，另一个方向照常滚动页面。键盘在绘图区里按 + / − 以聚焦的数据为中心缩放，类目轴上按整个类目增减、每按一次至少多露或少露一个类目；方向键把焦点移出窗口时，窗口平移到以它为中心。窗口最窄到只露出一个类目，连续轴放大到 100 倍为止。
- 自变量轴能缩放、图是竖向时，绘图区下方有一条缩放条（`zoom-slider`）：淡底的轨道对着整条轴，里面一条弱化色的缩略线画出第一个按键排的系列在整条轴上的走势（点多时降采样），窗口是品牌淡底的选中区，两端各一个手柄。拖窗口平移，拖手柄改一端，按轨道空处把窗口移过去。横向条形图不出缩放条，用滚轮、拖动与键盘缩放。Web Components 侧作者在外壳里放一个空的 `zoom-slider`，轨道、窗口与手柄由元素生成。
- 折线的点比绘图区的像素多一倍以上时降采样（Largest-Triangle-Three-Buckets，保留峰谷）：线上的点不超过绘图区的宽度，缩放后只采窗口里的那一段；锚点、焦点、提示框与数据表仍是全部数据。
- `brush` 打开刷选：`x` 沿自变量轴框一段，`y` 沿数值轴框一段，`xy` 框一个矩形，缺省 `none`。开启后在绘图区里拖动即刷选，指针是十字，放大后的平移改用缩放条或键盘。拖着时框已经画出（类目轴取整到首尾类目的整条带），松手才派发一次 `onBrushSelectionChange`，载荷是范围 `selection` 与框里的数据 `data`：锚点（柱顶、点、线上的点、K 线的收盘、箱线的中位数）落在框里即算，按图例次序、再按自变量排。范围 `brushSelection` / `defaultBrushSelection` 的写法同缩放窗口，受控时由作者写回。框垫在数据之下，是选中语义的淡底加一圈聚焦色的细边；框外的柱、点、K 线与箱线淡出到 `--xh-chart-dim-alpha`，折线与面积是整条路径，不分框里框外。点一下（没拖开）或按 Escape 清掉刷选。
- 提示框缺省按系列推断：只有散点时 `item`，否则 `axis`。`axis` 吸附到最近的键，列出该键上全部可见系列（散点在这个 x 上有点才列一行）；`item` 只报告指针命中的那一个数据，命中取离指针最近的标记，不要求指针正中。气泡的行在数值后面跟着大小，名字取 `translations.sizeLabel`。键盘聚焦与指针悬停显示同样的内容。`tooltipOrder` 改变提示框里各系列的行序：缺省 `series` 按图例次序，`descending` / `ascending` 按数值排，缺失值排在最后；回调里的 `items` 仍按图例次序。
- 悬停图例项时，其余系列淡出到 `--xh-chart-dim-alpha`，该系列颜色不变；`trigger="item"` 时悬停或聚焦某个数据同样只保留它所在的系列。`axis` 模式不淡出：提示框列出的正是该键上的全部系列。
- 提示框放在根内部，按指针所在的一侧翻转，不越出绘图区；它不进入浮层引擎，不参与浮层的层级与关闭协议。
- 坐标轴标签字体、柱的最大厚度、线宽、点的直径等几何量的真源是 CSS 组件槽：组件从根的计算样式读取它们再计算几何，改写组件槽就能改变几何，不需要布局属性。密度档切换时重新读取。
- 尺寸由视口决定：宽度随容器，高度取 `--xh-cartesian-chart-height`（缺省 `--xh-chart-height`）。视口尺寸变化时重新布局，服务端与首帧只输出空的绘图区、不占位跳动。
- `pending` 表示正在重新取数：保留上一帧、整体降低不透明度并在根上写 `aria-busy`，不闪骨架，也不跳布局。首次取数、手里还没有数据时，空态写 `translations.loadingText`（缺省 Loading…）并转一个圈，取完仍没有数据才写 `emptyText`。
- 首次出现时播放入场：柱沿数值轴从基线长出，折线从头描到尾，数据点等笔尖扫到才出现，面积、坐标轴与标签淡入，多个系列按图例次序错开（至多 5 步）。数据层的标记多于 1000 个时不做几何插值，只淡入淡出。数据晚于挂载到达（异步取数，或 Web Components 连上之后才赋 `data`）时同样播这段入场，空态里已画出的坐标轴从原处移到新刻度，不重新淡入。之后的数据变化与图例切换从当前位置插值到新位置：留下的柱原地伸缩，新增的柱从基线长出，隐藏的系列收回基线并淡出后才移除；坐标轴刻度随之移动，数据标签、合计与线尾标签上的数从旧值滚到新值。标记按自变量的值对齐而不是按位置：类目换了次序时柱滑到新位置，时间序列往后推一格时整条线平移、新点从边上进来。`pending` 结束后到来的新数据按更新处理，不再重播入场。
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
- 需要可见的表格视图时，把 `api.table` 交给[表格](./table)组件（Vue 与 React 从根的作用域插槽 / 函数式 children 取 `table`，Web Components 读元素的 `table`），而不是在图下方另写一份数据。

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
| Vue 组件 | `XhCartesianChartCaption` `XhCartesianChartEmpty` `XhCartesianChartLegend` `XhCartesianChartPlot` `XhCartesianChartRoot` `XhCartesianChartTooltip` `XhCartesianChartViewport` `XhCartesianChartZoomSlider` |
| 组合式函数 | `useCartesianChart` |
| 状态机 | `cartesianChartMachine` |
| 皮肤 | `@xihan-ui/styles/cartesian-chart.css` |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `hidden-series-change` | `ChartHiddenSeriesChangeDetails` | 图例切换显隐；detail 为 `{ hiddenSeries: string[] }` |
| `active-key-change` | `ChartActiveKeyChangeDetails` | 指针或键盘换了激活的键；detail 为 `{ activeKey }`，收起时为 null |
| `window-change` | `CartesianWindowChangeDetails` | 滚轮、捏合、拖动、键盘或缩放条改了缩放窗口；detail 为 `{ window }` |
| `brush-selection-change` | `CartesianBrushSelectionChangeDetails` | 刷选范围变了（指针松手时一次，键盘每按一次）；detail 为 `{ selection, data }` |
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
| `XhCartesianChartRoot` | `trigger` | `CartesianTrigger` |  | 提示框汇报什么；缺省含柱或折线时 axis，只有散点时 item。 |
| `XhCartesianChartRoot` | `totals` | `boolean` |  | 堆叠柱的合计：每个堆叠组在最外端写出合计。 |
| `XhCartesianChartRoot` | `tooltipOrder` | `CartesianTooltipOrder` |  | 提示框里各系列的行序，缺省 series（按图例次序）。 |
| `XhCartesianChartRoot` | `palette` | `ChartPalette` |  | 顺序色阶的色板：按值着色的点与色阶图例换到这个色相上。 |
| `XhCartesianChartRoot` | `annotations` | `readonly CartesianAnnotation[]` |  | 注释：参考线、参考带、标出的数据、平均线与趋势线。 |
| `XhCartesianChartRoot` | `zoom` | `CartesianZoom` |  | 缩放：x 沿自变量轴、y 沿数值轴、xy 两个方向，缺省 none。 |
| `XhCartesianChartRoot` | `window` | `CartesianWindow` |  | 缩放窗口（受控）。 |
| `XhCartesianChartRoot` | `defaultWindow` | `CartesianWindow` |  | 初始缩放窗口（非受控）。 |
| `XhCartesianChartRoot` | `onWindowChange` | `CartesianChartProps['onWindowChange']` |  |  |
| `XhCartesianChartRoot` | `brush` | `CartesianBrush` |  | 刷选：x 沿自变量轴、y 沿数值轴、xy 框矩形，缺省 none。 |
| `XhCartesianChartRoot` | `brushSelection` | `CartesianBrushSelection \| null` |  | 刷选范围（受控），null 为没有刷选。 |
| `XhCartesianChartRoot` | `defaultBrushSelection` | `CartesianBrushSelection \| null` |  | 初始刷选范围（非受控）。 |
| `XhCartesianChartRoot` | `onBrushSelectionChange` | `CartesianChartProps['onBrushSelectionChange']` |  |  |
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

**事件**：`WINDOW.SET` · `DRAG.START` · `DRAG.END` · `BRUSH.START` · `BRUSH.MOVE` · `BRUSH.END` · `BRUSH.SET` · `BRUSH.ANCHOR`

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
| `legendScale` | `CartesianLegendScale \| null` | 按值着色时图例里的色阶；没有按值着色的系列时为 null。 |
| `patterns` | `readonly ChartPattern[]` | 各系列的纹理：画在绘图区的 defs 里，强制色、打印与环境开启纹理时柱与面积用它填充。 |
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
| `zoom` | `{ readonly x: boolean, readonly y: boolean, readonly window: CartesianWindow, readonly ratio: CartesianWindowRatio }` | 缩放：两个方向能不能缩放、当前的窗口，与它在两根轴上的比例（不能缩放的方向是整条轴）。 |
| `clip` | `{ readonly id: string, readonly x: number, readonly y: number, readonly width: number, readonly height: number } \| null` | 缩放后要裁到的矩形（绘图区）与它在 defs 里的 clipPath id；没缩放连续轴与数值轴时为 null。 |
| `setWindow` | `(window: CartesianWindow) => void` | 设置缩放窗口（定义域里的值）；不能缩放的方向保持整条轴。 |
| `brush` | `{ readonly x: boolean readonly y: boolean readonly selection: CartesianBrushSelection \| null readonly rect: { readonly x: number, readonly y: number, readonly width: number, readonly height: number } \| null }` | 刷选：两个方向能不能刷、当前的范围，与它在绘图区里的矩形（没有刷选为 null）。 |
| `setBrushSelection` | `(selection: CartesianBrushSelection \| null) => void` | 设置刷选范围（定义域里的值），null 清掉；派发 onBrushSelectionChange。 |
| `getRootProps` | `() => T['element']` |  |
| `getCaptionProps` | `() => T['element']` |  |
| `getLegendProps` | `() => T['element']` |  |
| `getLegendItemProps` | `(item: CartesianLegendItem) => T['button']` |  |
| `getLegendSwatchProps` | `(item: CartesianLegendItem) => T['element']` |  |
| `getLegendLabelProps` | `(item: CartesianLegendItem) => T['element']` |  |
| `getLegendScaleProps` | `() => T['element']` | 色阶图例：名字、低端的值、渐变条、高端的值依次排开，只给眼睛看。 |
| `getLegendScaleNameProps` | `() => T['element']` |  |
| `getLegendScaleBarProps` | `() => T['element']` |  |
| `getLegendScaleValueProps` | `(edge: 'min' \| 'max') => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getPlotProps` | `() => T['element']` |  |
| `getDefsProps` | `() => T['element']` | 绘图区的第一个子节点：各系列的纹理定义在这里。 |
| `getPatternProps` | `(pattern: ChartPattern) => T['element']` |  |
| `getPatternLineProps` | `(pattern: ChartPattern) => T['element']` |  |
| `getMarkProps` | `(mark: Mark) => T['element']` | 场景里一个标记的属性（含 path 的 d、文字的坐标）。 |
| `getTooltipProps` | `() => T['element']` |  |
| `getTooltipHeaderProps` | `() => T['element']` |  |
| `getTooltipRowProps` | `(row: CartesianTooltipRow) => T['element']` |  |
| `getTooltipSwatchProps` | `(row: CartesianTooltipRow) => T['element']` |  |
| `getTooltipValueProps` | `(row: CartesianTooltipRow) => T['element']` |  |
| `getTooltipNameProps` | `(row: CartesianTooltipRow) => T['element']` |  |
| `getEmptyProps` | `() => T['element']` |  |
| `getClipPathProps` | `() => T['element']` | 裁剪区：画在绘图区的 defs 里，clip 为 null 时不画。 |
| `getClipRectProps` | `() => T['element']` |  |
| `getZoomSliderProps` | `() => T['element']` | 缩放条：作者放置，轨道、窗口与两端的手柄由组件生成；自变量方向不能缩放时收起。 |
| `getZoomTrackProps` | `() => T['element']` |  |
| `getZoomWindowProps` | `() => T['element']` |  |
| `getZoomHandleProps` | `(edge: 'start' \| 'end') => T['element']` |  |
| `getZoomPreviewProps` | `() => T['element']` | 缩放条轨道里的缩略线：整条轴上的走势，只给眼睛看；轨道里跟在窗口后面，一个 svg 里一条 path。 |
| `getZoomPreviewLineProps` | `() => T['element']` |  |
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
| `+` / `=` | 焦点在绘图区且开了 zoom | 以聚焦的数据为中心放大 1.5 倍；类目轴按整个类目缩放，每按一次至少少露一个类目，最少露出一个 |
| `-` / `_` | 焦点在绘图区且开了 zoom | 以聚焦的数据为中心缩小 1.5 倍，类目轴每按一次至少多露一个类目，到整条轴为止；焦点走出窗口时窗口平移过去 |
| `ArrowLeft` / `ArrowRight` / `ArrowDown` / `ArrowUp` / `PageUp` / `PageDown` / `Home` / `End` | 焦点在缩放条的手柄 | 左右键（下上键同）把这一端移一步：类目轴一个类目，连续轴 1%；按住 Shift 或 PageUp / PageDown 移 10%（至少一个类目），Home / End 把这一端移到能到的最远处；两端之间至少留一个类目或 1% 的轴 |
| `Shift+ArrowRight` / `Shift+ArrowLeft` / `Shift+Home` / `Shift+End` / `Shift+PageUp` / `Shift+PageDown` | 焦点在绘图区且 brush 为 x 或 xy | 从锚点起沿自变量刷到焦点所在的键，每按一次派发 onBrushSelectionChange；锚点是开始按 Shift 时焦点所在的键，松开 Shift 移动焦点后放下，范围留着；horizontal 时由 Shift+ArrowDown / Shift+ArrowUp 承担 |
| `Escape` | 提示框显示着或有刷选范围 | 收起提示框、清掉刷选（派发 onBrushSelectionChange，范围为 null），焦点留在原处；按键不拦截，外层浮层的关闭仍归它自己 |
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
| `legend-scale` | `aria-hidden` | 'true' |
| `plot` | `aria-describedby` | `summary` 部件的 id |
| `plot` | `aria-labelledby` | `caption` 部件的 id |
| `plot` | `aria-roledescription` | translations.chartRoleDescription |
| `plot` | `role` | 'graphics-document' |
| `tooltip` | `aria-hidden` | 'true' |
| `zoom-slider` | `aria-label` | translations.zoomLabel |
| `zoom-slider` | `role` | 'group' |
| `zoom-handle` | `aria-label` | translations.zoomStartLabel \| translations.zoomEndLabel |
| `zoom-handle` | `aria-orientation` | 'horizontal' |
| `zoom-handle` | `aria-valuemax` | 100 |
| `zoom-handle` | `aria-valuemin` | 0 |
| `zoom-handle` | `aria-valuenow` | Math.round(shown.x[edge] * 100) |
| `zoom-handle` | `aria-valuetext` | edgeText(shown.x[edge], edge) |
| `zoom-handle` | `role` | 'slider' |
| `zoom-preview` | `aria-hidden` | 'true' |
| `mark` | `aria-hidden` | mark.exiting \|\| undefined |
| `mark` | `aria-label` | undefined \| spec?.name |
| `mark` | `aria-roledescription` | undefined \| translations.seriesRoleDescription |
| `mark` | `role` | undefined \| 'graphics-object' |

- 根是 `<figure>`，可访问名称来自 `caption`（`<figcaption>`）；不放标题时在根上写 `aria-label`。只有两者都没有时开发期报 `chart.missing-name`。
- 绘图区是 `role="graphics-document"`，`aria-roledescription` 取 `translations.chartRoleDescription`（缺省 chart），`aria-describedby` 指向组件生成的摘要。
- 每个系列是一个 `role="graphics-object"` 的分组，名称是系列名；每根柱、每个散点、每个焦点代理点是 `role="graphics-symbol"`，名称取 `translations.datumLabel`（缺省“键, 系列名 值”），务必按本地语言改写。
- 坐标轴、网格、十字准线、注释与焦点环一律 `aria-hidden`：它们的信息由每个数据的名称、摘要与数据表承担。摘要末尾按 `translations.annotationSummary` 写出参考线、参考带与平均线的名字与值（没写标签的取 `referenceLabel`）；标出的点与趋势线不写，前者的值在数据表里，后者由数据推出。
- 组件在根内生成一段摘要与一张数据表，二者视觉隐藏、对读屏可见，服务端即输出。摘要写系列数、自变量的范围以及每个系列的最小值与最大值，模板是 `translations.summary`；数据表首列是自变量，列名缺省取 x 轴标题，其余每个可见系列一列，缺失值写 `translations.missingValue`。含散点时一个 x 上可以有多个点，数据表改为每个数据一行：系列、x、y 各一列（列名取 `translations.seriesLabel` 与两根轴的标题），有气泡时再加大小一列，按值着色时再加一列。气泡与按值着色的点的缺省名称在末尾补上大小与颜色对应的值；色阶图例只给眼睛看。
- 绘图区只占一个 Tab 位，进入后焦点落在一个真实的元素上：柱与散点直接获得焦点，散点按 x 的次序走，上下键换到另一个系列里 x 最近的点；折线没有逐点的元素，由绘图区为聚焦的数据生成一个点作为焦点代理，移动时替换并聚焦新点，读屏据此播报新的名称。
- 焦点环是独立的 `focus-ring` 部件，画在标记之外，不依赖 SVG 元素的 outline；只在键盘聚焦时出现。
- 图例是 `role="toolbar"`，名称取 `translations.legendLabel`；每一项是 `<button aria-pressed>`，按下表示系列可见。图例整体只占一个 Tab 位，进入后左右键在项之间移动。
- 提示框 `aria-hidden`：它显示的内容与数据的可访问名称是同一份，读两遍反而干扰。
- Escape 收起提示框但不拦截按键，外层浮层的关闭仍由其自身处理。
- 缩放条是 `role="group"`，名称取 `translations.zoomLabel`；两端的手柄是 `role="slider"`，名称取 `zoomStartLabel` / `zoomEndLabel`，值是窗口那一端在整条轴上的百分比，`aria-valuetext` 读出那一端对着的类目或值。缩放后摘要与数据表仍写全部数据，窗口只改画面。
- 开了刷选（`x` 或 `xy`）时，Shift + 方向键从锚点起沿自变量刷到焦点所在的键，每按一次派发一次；读屏照常念出新焦点的名字，框里有什么由作者按需播报。刷选框 `aria-hidden`。
- 过渡只改画面：数据的名称、摘要、数据表与焦点次序在数据变化的那一刻就按新数据更新；收场中的标记 `aria-hidden`、不可聚焦，也不响应指针。
- 颜色不是区分系列的唯一线索：图例文字、提示框中的系列名与数据名称都写出系列；折线与柱的色标形状也不同，散点的形状随色槽轮换；强制色与打印下柱与面积还有各自的纹理，折线还有各自的线型。

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
| `root` | `data-palette` | props.palette |
| `root` | `data-state` | 'error' \| undefined |
| `root` | `data-xh-chart-part` | 'root' |
| `caption` | `data-xh-chart-part` | 'caption' |
| `legend` | `data-xh-chart-part` | 'legend' |
| `legend-item` | `data-pressed` | ''（条件成立时才出现） |
| `legend-item` | `data-tone` | item.tone |
| `legend-item` | `data-value` | item.id |
| `legend-item` | `data-xh-action-control` | '' |
| `legend-item` | `data-xh-action-profile` | 'text' |
| `legend-item` | `data-xh-action-size` | 'xs' |
| `legend-item` | `data-xh-action-variant` | 'ghost' |
| `legend-item` | `data-xh-chart-part` | 'legend-item' |
| `legend-item` | `data-xh-chart-pattern` | patternOf(item.id) |
| `legend-item` | `data-xh-chart-scale` | 'sequential' \| undefined |
| `legend-item` | `data-xh-chart-slot` | undefined \| String(item.slot) |
| `legend-swatch` | `data-mark` | swatchMark(item) |
| `legend-swatch` | `data-symbol` | item.symbol |
| `legend-swatch` | `data-xh-chart-part` | 'legend-swatch' |
| `legend-scale-value` | `data-edge` | edge |
| `viewport` | `data-xh-chart-part` | 'viewport' |
| `plot` | `data-dragging` | ''（条件成立时才出现） |
| `plot` | `data-selectable` | ''（条件成立时才出现） |
| `plot` | `data-touch-axis` | 'both' \| 'horizontal' \| 'vertical' \| undefined |
| `plot` | `data-xh-chart-part` | 'plot' |
| `plot` | `data-zoomed` | ''（条件成立时才出现） |
| `defs` | `data-xh-chart-part` | 'defs' |
| `pattern` | `data-tone` | pattern.tone |
| `pattern` | `data-xh-chart-part` | 'pattern' |
| `pattern` | `data-xh-chart-slot` | undefined \| String(pattern.slot) |
| `pattern-line` | `data-xh-chart-part` | 'pattern-line' |
| `tooltip` | `data-placement` | 'top' \| 'bottom'-'right' \| 'left' \| undefined |
| `tooltip` | `data-state` | 'visible' \| 'hidden' |
| `tooltip` | `data-xh-chart-part` | 'tooltip' |
| `tooltip-header` | `data-xh-chart-part` | 'tooltip-header' |
| `tooltip-row` | `data-current` | ''（条件成立时才出现） |
| `tooltip-row` | `data-series-id` | row.seriesId |
| `tooltip-row` | `data-tone` | row.tone |
| `tooltip-row` | `data-xh-chart-part` | 'tooltip-row' |
| `tooltip-row` | `data-xh-chart-pattern` | patternOf(row.seriesId) |
| `tooltip-row` | `data-xh-chart-scale` | 'sequential' \| undefined |
| `tooltip-row` | `data-xh-chart-slot` | undefined \| String(row.slot) |
| `tooltip-swatch` | `data-mark` | swatchMark(row) |
| `tooltip-swatch` | `data-seg` | undefined \| sequentialStop(row.t).seg |
| `tooltip-swatch` | `data-symbol` | row.symbol |
| `tooltip-swatch` | `data-xh-chart-part` | 'tooltip-swatch' |
| `tooltip-value` | `data-xh-chart-part` | 'tooltip-value' |
| `tooltip-name` | `data-xh-chart-part` | 'tooltip-name' |
| `empty` | `data-loading` | ''（条件成立时才出现） |
| `empty` | `data-state` | 'loading' \| undefined |
| `empty` | `data-xh-chart-part` | 'empty' |
| `empty` | `data-xh-loading-ring` | '' |
| `zoom-slider` | `data-dragging` | ''（条件成立时才出现） |
| `zoom-handle` | `data-placement` | edge |
| `mark` | `data-axis` | mark.key.slice('axis:'.length) \| undefined |
| `mark` | `data-dimmed` | ''（条件成立时才出现） |
| `mark` | `data-drawing` | ''（条件成立时才出现） |
| `mark` | `data-kind` | note?.kind |
| `mark` | `data-mark` | spec?.mark |
| `mark` | `data-placement` | model.scene?.placements.get(mark.key) \| undefined \| undefined |
| `mark` | `data-series-id` | mark.key.slice('series:'.length) |
| `mark` | `data-tone` | spec?.tone |
| `mark` | `data-xh-chart-part` | mark.part \| undefined |
| `mark` | `data-xh-chart-pattern` | patternOf(id) |
| `mark` | `data-xh-chart-scale` | 'sequential' \| undefined |
| `mark` | `data-xh-chart-slot` | undefined \| String(spec.slot) |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-cartesian-chart-bar-max` | `root` | `--xh-_chart-metric-bar-max` | `default` | `--xh-chart-bar-max` | cartesian-chart 的 root 部件 --xh-_chart-metric-bar-max 覆盖槽。 |
| `--xh-cartesian-chart-bar-radius` | `root` | `--xh-_chart-metric-radius` | `default` | `--xh-shape-inset` | cartesian-chart 的 root 部件 --xh-_chart-metric-radius 覆盖槽。 |
| `--xh-cartesian-chart-brush-bg` | `brush` | `fill` | `default` | `--xh-bg-brand-subtle` | cartesian-chart 的 brush 部件 fill 覆盖槽。 |
| `--xh-cartesian-chart-brush-border` | `brush` | `stroke` | `default` | `--xh-border-control-focus` | cartesian-chart 的 brush 部件 stroke 覆盖槽。 |
| `--xh-cartesian-chart-empty-gap` | `empty` | `gap` | `state=loading` | `--xh-space-2` | cartesian-chart 的 empty 部件 gap 覆盖槽。 |
| `--xh-cartesian-chart-gap` | `root` | `gap` | `default` | `--xh-space-3` | cartesian-chart 的 root 部件 gap 覆盖槽。 |
| `--xh-cartesian-chart-height` | `viewport` | `block-size` | `default` | `--xh-chart-height` | cartesian-chart 的 viewport 部件 block-size 覆盖槽。 |
| `--xh-cartesian-chart-legend-gap` | `legend` | `gap` | `default` | `--xh-space-1` | cartesian-chart 的 legend 部件 gap 覆盖槽。 |
| `--xh-cartesian-chart-legend-scale-bar-radius` | `legend-scale-bar` | `border-radius` | `default` | `--xh-shape-inset` | cartesian-chart 的 legend-scale-bar 部件 border-radius 覆盖槽。 |
| `--xh-cartesian-chart-legend-scale-gap` | `legend-scale` | `gap` | `default` | `--xh-space-2` | cartesian-chart 的 legend-scale 部件 gap 覆盖槽。 |
| `--xh-cartesian-chart-legend-scale-width` | `legend-scale-bar` | `inline-size` | `default` | `--xh-chart-legend-scale-width` | cartesian-chart 的 legend-scale-bar 部件 inline-size 覆盖槽。 |
| `--xh-cartesian-chart-legend-swatch-line-radius` | `legend-swatch` | `border-radius` | `mark=line` | `--xh-shape-pill` | cartesian-chart 的 legend-swatch 部件 border-radius 覆盖槽。 |
| `--xh-cartesian-chart-legend-swatch-radius` | `legend-swatch` | `border-radius` | `default` | `--xh-shape-inset` | cartesian-chart 的 legend-swatch 部件 border-radius 覆盖槽。 |
| `--xh-cartesian-chart-line-width` | `annotation`<br>`candle`<br>`legend-swatch`<br>`line`<br>`median`<br>`root`<br>`stem`<br>`tooltip-swatch` | `background`<br>`block-size`<br>`stroke-dasharray`<br>`stroke-width` | `@media (forced-colors: active)`<br>`@media print`<br>`default`<br>`drawing`<br>`kind=trend`<br>`mark=line`<br>`method=moving-average`<br>`not([data-drawing])`<br>`style=ohlc`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns` | `--xh-chart-line-width` | cartesian-chart 的 annotation、candle、legend-swatch、line、median、root、stem、tooltip-swatch 部件 background、block-size、stroke-dasharray、stroke-width 覆盖槽。 |
| `--xh-cartesian-chart-point-size` | `legend-swatch`<br>`root`<br>`tooltip-swatch` | `background` | `@media (forced-colors: active)`<br>`@media print`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=1`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns` | `--xh-chart-point-size` | cartesian-chart 的 legend-swatch、root、tooltip-swatch 部件 background 覆盖槽。 |
| `--xh-cartesian-chart-series-color` | `annotation`<br>`area-fill`<br>`bar`<br>`box`<br>`candle`<br>`dot`<br>`legend-item`<br>`legend-swatch`<br>`line`<br>`median`<br>`outlier`<br>`pattern-line`<br>`point`<br>`stem`<br>`tooltip-swatch`<br>`whisker`<br>`wick` | `background`<br>`border`<br>`fill`<br>`stroke` | `@media (forced-colors: active)`<br>`@media print`<br>`kind=average`<br>`kind=point`<br>`kind=trend`<br>`mark=line`<br>`mark=point`<br>`not([data-symbol='circle'], [data-symbol='square'])`<br>`style=ohlc`<br>`symbol=circle`<br>`symbol=square`<br>`tone`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=1`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns`<br>`xh-chart-slot=1`<br>`xh-chart-slot=2`<br>`xh-chart-slot=3`<br>`xh-chart-slot=4`<br>`xh-chart-slot=5`<br>`xh-chart-slot=6`<br>`xh-chart-slot=7`<br>`xh-chart-slot=8` | `--xh-_tone`<br>`--xh-chart-categorical-1`<br>`--xh-chart-categorical-2`<br>`--xh-chart-categorical-3`<br>`--xh-chart-categorical-4`<br>`--xh-chart-categorical-5`<br>`--xh-chart-categorical-6`<br>`--xh-chart-categorical-7`<br>`--xh-chart-categorical-8` | cartesian-chart 的 annotation、area-fill、bar、box、candle、dot、legend-item、legend-swatch、line、median、outlier、pattern-line、point、stem、tooltip-swatch、whisker、wick 部件 background、border、fill、stroke 覆盖槽。 |
| `--xh-cartesian-chart-tooltip-gap` | `tooltip` | `gap` | `default` | `--xh-space-1` | cartesian-chart 的 tooltip 部件 gap 覆盖槽。 |
| `--xh-cartesian-chart-tooltip-px` | `tooltip` | `padding-inline` | `default` | `--xh-surface-pad-sm` | cartesian-chart 的 tooltip 部件 padding-inline 覆盖槽。 |
| `--xh-cartesian-chart-tooltip-py` | `tooltip` | `padding-block` | `default` | `--xh-surface-pad-sm` | cartesian-chart 的 tooltip 部件 padding-block 覆盖槽。 |
| `--xh-cartesian-chart-tooltip-radius` | `tooltip` | `border-radius` | `default` | `--xh-shape-overlay` | cartesian-chart 的 tooltip 部件 border-radius 覆盖槽。 |
| `--xh-cartesian-chart-tooltip-row-gap` | `tooltip-row` | `gap` | `default` | `--xh-space-2` | cartesian-chart 的 tooltip-row 部件 gap 覆盖槽。 |
| `--xh-cartesian-chart-tooltip-shadow` | `tooltip` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | cartesian-chart 的 tooltip 部件 box-shadow 覆盖槽。 |
| `--xh-cartesian-chart-tooltip-swatch-line-radius` | `tooltip-swatch` | `border-radius` | `mark=line` | `--xh-shape-pill` | cartesian-chart 的 tooltip-swatch 部件 border-radius 覆盖槽。 |
| `--xh-cartesian-chart-tooltip-swatch-radius` | `tooltip-swatch` | `border-radius` | `default` | `--xh-shape-inset` | cartesian-chart 的 tooltip-swatch 部件 border-radius 覆盖槽。 |
| `--xh-cartesian-chart-zoom-h` | `zoom-slider` | `block-size` | `default` | `--xh-space-6` | cartesian-chart 的 zoom-slider 部件 block-size 覆盖槽。 |
| `--xh-cartesian-chart-zoom-handle-bg` | `zoom-handle` | `background` | `default` | `--xh-bg-brand` | cartesian-chart 的 zoom-handle 部件 background 覆盖槽。 |
| `--xh-cartesian-chart-zoom-handle-radius` | `zoom-handle` | `border-radius` | `default` | `--xh-shape-inset` | cartesian-chart 的 zoom-handle 部件 border-radius 覆盖槽。 |
| `--xh-cartesian-chart-zoom-handle-w` | `zoom-handle` | `inline-size` | `default` | `--xh-space-2` | cartesian-chart 的 zoom-handle 部件 inline-size 覆盖槽。 |
| `--xh-cartesian-chart-zoom-preview-color` | `zoom-preview-line` | `stroke` | `default` | `--xh-chart-deemphasis` | cartesian-chart 的 zoom-preview-line 部件 stroke 覆盖槽。 |
| `--xh-cartesian-chart-zoom-track-bg` | `zoom-track` | `background` | `default` | `--xh-bg-subtle` | cartesian-chart 的 zoom-track 部件 background 覆盖槽。 |
| `--xh-cartesian-chart-zoom-track-radius` | `zoom-track` | `border-radius` | `default` | `--xh-shape-inset` | cartesian-chart 的 zoom-track 部件 border-radius 覆盖槽。 |
| `--xh-cartesian-chart-zoom-window-bg` | `zoom-window` | `background` | `default` | `--xh-bg-brand-subtle` | cartesian-chart 的 zoom-window 部件 background 覆盖槽。 |
| `--xh-cartesian-chart-zoom-window-radius` | `zoom-window` | `border-radius` | `default` | `--xh-shape-inset` | cartesian-chart 的 zoom-window 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：状态 · 出现（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-draw` · `xh-fade-in` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`opacity` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

- 绘图区不随文字方向镜像：坐标系的方向是数据约定，时间在 rtl 页面上同样从左向右，左方向键始终向左。
- 图例、标题与提示框的内容随文字方向排列，图例的左右键跟随视觉次序翻转。
- 横向条形图的类目标签在 rtl 下同样位于左侧，数值轴同样从左向右增长。
- 缩放条对着绘图区的横轴，同样不镜像：窗口的起点在左，左方向键把手柄往左移。
