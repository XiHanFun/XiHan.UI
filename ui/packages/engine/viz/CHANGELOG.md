# @xihan-ui/viz

## 3.1.0

## 3.0.0

### Minor Changes

- ef5c1ea: 直角坐标图补齐行情看板要用的写法，大数据的几条主路径进了性能预算。

  - 坐标轴新增 `minSize`（px）：这根轴至少占这么厚，上下叠放的 K 线与成交量写同一个值，绘图区左边对齐；不是非负有限数时报 `chart.scale-param`。viz 的 `layoutAxis` / `solvePlotRect` 对应新增 `minThickness`。
  - 修正：缩放窗口整段落在自变量轴之外（数据还没到、窗口指着已经挤掉的时段）时不再抛错，自变量轴按整条画；viz 的 `domainToWindow` 这时落成贴着那一端的零宽窗口。
  - 刻度格式器按比例尺只建一次，viz 的 `createTimeFormat` 按语言与时区复用、UTC 不再经 Intl 拆字段：时间轴的一次布局快了一个量级，流式每帧与缩放一帧的耗时随之下降。
  - 列式数据的缩放条缩略线改为按列取最低与最高的一遍扫描。

- 89d611f: `@xihan-ui/viz` 新增无障碍模型：只算事实，文案模板由调用方按语言提供。

  - `buildSummaryModel` / `summarize`：系列数、自变量范围、各系列的最小值与最大值及其位置、首末值与变化率；缺失值不计，最值相同时取先出现的。
  - `buildTableModel`：第一列是自变量、其后每个系列一列，行是全部系列的键按首次出现的次序去重，缺失值显示调用方给的文字；数据表部件与作者自建的表格视图共用。`buildLinkTableModel` 输出 source / target / value 三列。
  - `buildTraversal` / `navigate`：数据层里可聚焦的标记按系列分行、行内按数据位置排序，折线与面积按点展开成遍历项（焦点代理以「标记键:点键」为 id）；系列内移动到头不回绕，换系列保持位置，支持首尾与翻页。

- 29b6d45: 弧的圆角延伸到尖端：内沿收成尖端（实心扇区，或间隙吃掉了内沿）时，尖端按 `cornerRadius` 倒圆，切点不越过外角圆角的起点；扇区不小于半圈时尖端是凹角，保持尖。
- 018c0e1: `@xihan-ui/viz` 新增数组统计与刻度。

  - 统计：`extent`、`sum`（Neumaier 补偿，`0.1` 加十次得 `1`）、`mean`、`median`、`quantile`（R-7，与 Excel `QUANTILE.INC`、NumPy 缺省一致）、`variance` / `deviation`（Welford 单遍，样本方差）、`cumsum`、`range`。`null`、`undefined`、`NaN` 视为缺失，一律跳过，不按 0 处理。
  - 查找与分组：`bisector` 的 `left` / `right` / `center`；`group`、`rollup`、`index`，值相等的 `Date` 键归入同一组，`index` 遇到重复键抛 `XH_VIZ_DUPLICATE_KEY`。
  - 刻度：`ticks`、`tickIncrement`、`tickStep`、`nice`。步长取 1、2、5 × 10 的幂，刻度值由整数下标算出，不出现 `0.30000000000000004`；`nice` 的结果总包含原区间，只要一个刻度又跨过 0 这类不收敛的输入退回第一轮取整，区间不会被越推越大。
  - 分箱：`bin` 支持箱数、显式边界与 Sturges / Scott / Freedman–Diaconis 规则，箱左闭右开，最后一个箱包含右端点。

- 200eccb: `@xihan-ui/viz` 新增坐标轴布局 `layoutAxis` 与绘图区求解 `solvePlotRect`，只算几何、不碰 DOM。

  - 刻度数量按像素密度推导：横轴按相邻标签实际需要的间距收缩刻度数，推导出的数值刻度水平放置也互不重叠；纵轴按 2.5 倍行高。也可以给数量提示或显式刻度值；类目轴每个类目一个刻度，位置在带中心。
  - 横轴标签放不下时按 `labelOverflow` 处理：`auto` 先转 −45°、仍冲突就隔几个显示；`rotate` 只旋转，−45° 放不下转 −90°；`truncate` 截断加「…」；`wrap` 折成至多两行。纵轴标签超宽时截断或折行。刻度线始终全部保留，截断的标签保留完整文字供 `<title>` 与可及名使用。
  - `solvePlotRect`：纵轴标签宽度取决于纵轴刻度、纵轴刻度取决于绘图区高度、高度又取决于横轴厚度，从零厚度出发迭代到稳定（至多 3 轮），同时返回按最终绘图区构造的比例尺。

- 1ce8606: `@xihan-ui/viz` 新增颜色解析、换算、度量与色板校验。

  - `parseColor`：十六进制、`rgb()`、`hsl()`、`oklab()`、`oklch()`，逗号与空格写法都认；越界按 CSS 规则钳制，无法解析返回 `null`，不认颜色关键字。
  - 换算：`toOklab`、`toOklch`、`fromOklch`、`fromOklab`、`formatHex`。OKLab 矩阵与令牌运行时同一组；超出 sRGB 色域时固定明度与色相、降低彩度收回，色相不漂移。
  - 度量：`relativeLuminance`、`contrastRatio`（WCAG 2.x，半透明前景先叠到背景上）、`deltaEOk`（OKLab 欧氏距离 × 100）、`simulateCvd`（Machado–Oliveira–Fernandes 2009，红 / 绿 / 蓝色弱，严重度 0–1）。
  - `validateCategoricalPalette`：分类色板的六项检查——两套色板同一色槽的色相一致、明度带（亮色 0.43–0.77，暗色 0.48–0.67）、彩度 ≥ 0.10、红绿色弱模拟下 ΔE ≥ 8（6–8 需非颜色通道补偿）、正常视觉 ΔE ≥ 15、标记对承载面 ≥ 3:1（不足需标签或数据表补偿）；相邻检查或前 3 个色槽全部两两检查。
  - `validateOrdinalRamp`：有序色阶单色相、明度严格单调、对比度最低的一档对承载面 ≥ 2:1。

- 3536b2b: 新增两条大数据子路径：`@xihan-ui/viz/columns` 与 `@xihan-ui/viz/canvas`，支撑几十万到百万点的行情与采集数据。

  - `createColumnStore({ fields, capacity, columns })`：列式数据仓。每个字段一列 `Float64Array`，缺失写 `NaN`，日期取时间值；`append` / `appendColumns` / `setLast`（改写正在形成的那一行）/ `shift` / `clear`，一次调用只通知一次订阅者。`capacity` 是行数上限：追加超出时从头部挤掉最旧的行，数据段追到尾整段挪回开头，列视图始终连续、零拷贝。只有最后一行可改写，按序号缓存的极值与合并对整块永久有效。数据仓是冻结对象，传进 Vue 的 props 不会被包成响应式代理。
  - `bisectLeft` / `bisectRight` / `nearestIndex` / `isAscending`：有序数值列上的二分与校验。
  - `createExtentIndex(source, low, high)`：分块（1024 行一块，按序号对齐）求区间极值，整块算一次缓存；100 万点首次全段约 1.3 ms，之后的区间查询约 8 µs。
  - `decimateLine(x, y, from, to, pixel, { y2, gaps })`：M4 降采样，每个像素列保留首、末、最小、最大（带 `y2` 时再加它的最小与最大），画出来与全量逐像素相同、尖峰不丢；缺失值写断点。100 万点 → 1000 px 约 6 ms。
  - `bucketSize` / `bucketOhlc` / `bucketPeak`：K 线与柱窄到画不出实体时按 2 的幂根一组合并（K 线开取首、收取末、高取最高、低取最低；柱取绝对值最大的一根），组边界按全局序号对齐，平移时画面不抖。
  - `thinPoints`：散点按像素格稀疏，每格留最上面的点，输出仍按数据次序；100 万点约 6.5 ms。`createPointIndex`：像素网格上的最近点查询。
  - `ordinalTimeTicks`：等距排列（跳过休市、周末）的时间轴刻度，仍落在整点、整天、月初这些边界之后的第一根上。
  - `tracePolyline` / `traceBand`：类型化数组上的像素坐标写成折线、面积与区间带（NaN 断开，含三种阶梯），写进 `PathSink`，Canvas 2D 上下文可直接传入。
  - `parseCssColor` / `mixCssColor` / `formatCssColor` / `formatSrgbColor` / `createColorRamp`：按 CSS `color-mix` 的规则（alpha 预乘、oklch 色相走较短的弧、无色相的一端取另一端的色相）解析与插值计算样式里的颜色，结果写回原空间的函数式；画布不认某种写法时 `formatSrgbColor` 按浏览器在 sRGB 屏上的画法逐通道截断。
  - 两条子路径不从包入口导出，各自计体积：columns 实测 4.8 kB（限额 5.3 kB），canvas 2.55 kB（限额 2.8 kB）。

- f40cf71: 新增 `@xihan-ui/viz`：图表引擎包，零运行时依赖、import 无副作用、不碰 DOM。比例尺、刻度、形状、坐标轴布局、拾取与降采样都以纯函数提供，工厂返回冻结对象。

  - 非法输入立即抛 `VizError`，`code` 以 `XH_VIZ_` 开头，`detail` 带着出问题的原始输入；`isVizError` 在重复安装时也能认出同形错误。
  - `@xihan-ui/headless` 与三个适配器把它列进 `dependencies`，安装适配器时一并装上，不需要单独安装。

- dd883d7: `@xihan-ui/viz` 新增数字、时间与时长格式。

  - `createNumberFormat(locale, spec)`：以 `Intl.NumberFormat` 为底，按参数缓存；支持百分比、货币、单位、紧凑记数（zh-CN 得到「1.2 万」「3.4 亿」，en 得到「12K」）、固定小数位与有效数字。参数不合法（缺货币代码、语言标签非法）抛 `XH_VIZ_INVALID_ARGUMENT`。
  - `tickFormat(step, locale, spec)`：精度由刻度步长推导，同一根轴上的标签小数位一致（`0.0`、`0.5`、`1.0`）；百分比先乘 100 再推导；紧凑记数写到步长最低一位，`12500` 不会被写成「13K」。
  - `roundToTotal(values, total, digits)`：最大余数法，取整后的合计恰为目标，三个三分之一得到 34、33、33。
  - `createTimeFormat(locale, timeZone)`：刻度标签按日期落在的最粗一级边界显示（1 月 1 日显示年份、月初显示月份、零点显示日期）；`full` 给提示框与可及名用，带到指定粒度的全部字段。
  - `createDurationFormat(locale, units)`：从最高的非零单位起连续取两个单位（可调），单位文字由调用方按语言提供。

- 27a61c2: 新增子路径 `@xihan-ui/viz/graph`：关系布局。

  - `forceSimulation(count, links, options, initial?)`：力导模拟。速度 Verlet 积分，α 约 300 轮从 1 衰减到 `alphaMin`；力有连线弹簧（强度缺省 1 / 两端较小的度数）、电荷（四叉树 Barnes–Hut，θ 缺省 0.9）、向心、碰撞（四叉树）与朝 x / y 定位。初始位置按叶序排开，重合时的微扰用种子随机数，同样的输入永远得到同样的布局。
  - `run()` 同步跑到收敛；`tick(n)` 逐轮推进；`fix` / `release` 钉住与松开节点，`reheat` / `setAlphaTarget` 供拖拽时局部重算。
  - 四叉树平铺在类型化数组里、逐轮复用缓冲：1 千个节点、2 千条连线同步跑完 300 轮实测约 290 ms。
  - `circular(count, { center, radius, group, groupGap })`：环形布局，按分组聚在一起、等角排在圆上，组间多留空当，自 12 点方向顺时针。
  - 不从包入口导出，子路径单独计体积：实测 3.18 kB（gzip），限额 3.5 kB。

- 02f3921: 新增子路径 `@xihan-ui/viz/hierarchy`：层级布局。

  - `hierarchy(data, children)` 把嵌套数据建成层级节点，`stratify(rows, { id, parentId })` 把扁平的行按父 id 组树；id 重复、父节点不存在、多个根、没有根、成环或共享子树一律报 `XH_VIZ_HIERARCHY`，不静默丢行。
  - 节点带深度、高度、父子与聚合值，提供 `each` / `eachBefore` / `eachAfter` 三种遍历、`sum`、`count`、`sort`、`ancestors`、`descendants`、`leaves`、`links`、`path`、`find`。
  - `treemap(root, { size, tile, paddingInner, paddingOuter, paddingTop, round })`：铺法 `squarify`（目标宽高比缺省黄金比）、`binary`、`slice`、`dice`、`slice-dice`，也可以传自定义铺法。
  - `partition(root, { size, padding })`：冰柱图的分区，旭日图把 x 当角度、y 当半径；`pack(root, { size, padding, radius })`：兄弟圆前链排布加最小外接圆，随机次序取固定种子，结果只由数据决定。
  - 不从包入口导出：只画直角坐标图的应用不为它付字节。子路径单独计体积，实测 4.39 kB（gzip），限额 4.5 kB。

- f74b290: 面积标记支持横向：`AreaMark` 新增 `orientation`（缺省 `vertical`），`horizontal` 时沿 y 铺开、以点上的 `x0` 为基线，供转置后的面积图使用。`KeyedPoint` 新增 `x0`，点序列插值与过渡的「从基线升起」同样按 `x0` 处理。
- 3501667: `@xihan-ui/viz` 新增缩放窗口的数学、种子随机与统计布局。

  - 窗口：`AxisWindow` 用定义域的比例 `[0, 1]` 表达一段窗口。`zoomAt` 以锚点为中心缩放，锚点对着的定义域值不动，跨度夹在 `minSpan` / `maxSpan` 内；`pan` 按跨度的倍数平移，到头停住；`clampWindow` 把窗口推回 `[0, 1]`。`windowToDomain` / `domainToWindow` 在连续轴上换算（linear、time、log、symlog）；`windowToIndexRange` / `indexRangeToWindow` 在类目轴上取整到类目边界；`pixelsToWindow` 把一段像素换成窗口，纵轴自下而上也得到 `start ≤ end`。
  - 随机：`createRandom`（mulberry32）同一个种子给出同一串数；`hashSeed`（FNV-1a）把字符串散成种子；`jitter(identity, amount)` 以数据身份为种子给出抖动偏移，重渲染、换序都落在同一处。
  - 统计布局：`waterfall` 逐步累计，小计从 0 画到累计值；`boxplotStats` 按 R-7 求四分位，须线到 1.5 倍四分距以内最远的点，其外为离群点；`kde` 核密度估计（高斯或 Epanechnikov，带宽缺省 `silvermanBandwidth`）；`linearRegression` 最小二乘与决定系数；`movingAverage` 尾随窗口平均。缺失值一律跳过，不按 0 处理。

- 1937ab6: `@xihan-ui/viz` 新增插值。

  - 基础：`interpolateNumber`、`interpolateRound`、`interpolateDate`、`interpolateArray`、`interpolateObject`、`interpolateString`（以终点为模板插值其中的数字），以及按终点类型分派的 `interpolate`；两端类型不一致时报错。`piecewise` 串联多段，`quantize` 等距取样。
  - 颜色：`interpolateOklab` 在 OKLab 里直线插值，`interpolateOklch` 走最短色相弧、一端是灰色时沿用另一端的色相。只用于构建期生成色阶、校验与 Canvas 渲染；SVG 运行时着色交给样式里的 `color-mix()`。
  - 几何：柱与扇区的参数（位置、尺寸、起止角、内外半径）用 `interpolateObject` 插值；折线与面积用 `interpolatePoints` 按数据键对齐点序列——两边都有的键从旧位置移到新位置，新增的键从相邻旧点的位置出现，删除的键并入相邻新点后消失，再由插好的点重新生成路径，路径命令结构不一致也不会形变跳变。

- 57922f2: 图表的路径类标记在数据更新时按几何参数插值，不再第一帧就跳到终态：

  - `@xihan-ui/viz` 新增 `PathSegment` 与 `segmentsPath()`；`PathMark` 可带 `segments`（由折线段拼成的几何参数），前后两帧段数与每段点数相同时过渡逐点插值并重新生成路径，形状不同时仍只淡变。
  - 直角坐标图的刻度线、棒棒糖的杆、箱线的须与中位线、小提琴轮廓、K 线的影线与美国线、瀑布连接线，以及关系图的箭头都带上折线段几何：值域变化或图例切换时与同一数据的点、实体、刻度字同步移动。刻度线拆成按刻度值键控的独立标记。

- a551a9a: `@xihan-ui/viz` 新增路径接收端 `PathSink` 与 SVG 路径构建器 `createSvgPath(digits)`。

  - `PathSink` 与 Canvas 2D 的路径方法同名同义（`moveTo`、`lineTo`、`bezierCurveTo`、`quadraticCurveTo`、`arc`、`arcTo`、`rect`、`closePath`），形状生成器只写入它：同一个生成器既能产出 SVG 的 `d`，也能直接驱动 `CanvasRenderingContext2D`。
  - SVG 构建器按 Canvas 语义画弧：有当前点时先直线接到弧起点，整圆拆成两个半圆，`arcTo` 画与两条边相切的圆角、三点共线时退成直线。数值缺省保留 2 位小数，控制大数据量时的 DOM 体积；半径为负时报错。

- 65efb60: 矩形标记与 `roundedBar` 的 `baseline` 新增 `'none'`：不贴基线的独立矩形（桑基图的节点、矩形树图的块、焦点环）四角都圆，半径夹到宽高较小者的一半；过渡里新出现时从中心展开。原有的 `'start'` / `'end'` 不变，柱子仍只圆远离基线的一端。
- a6d5ad7: `@xihan-ui/viz` 新增降采样，只作用于绘制，提示框、键盘遍历与数据表始终用原始数据。

  - `lttb`：Largest-Triangle-Three-Buckets，保留首尾，结果是原数据的子序列、长度恰为名额，形状最忠实。
  - `minMax`：每桶保留首、最小、最大、末四个点，全局的最大值与最小值一定保留，监控类数据的尖峰不会丢。
  - `average`：每桶取平均，得到新的点。
  - 缺失的点是折线的断点，`lttb` 与 `minMax` 采样后原样保留，两侧各自采样。`needsSampling(count, plotWidth)`：点数超过绘图区宽度两倍时才需要降采样。

- ad17b85: 新增子路径 `@xihan-ui/viz/sankey`：桑基布局。

  - `sankey(nodes, links, { size, nodeWidth, nodePadding, nodeAlign, nodeSort, iterations })`：节点值取流入与流出里较大的，深度按拓扑序的最长路径，`nodeAlign` 取 `justify`（缺省）/ `start` / `end` / `center` 分列；纵向比例由最挤的一列决定，几轮松弛把节点移向相连节点的流量加权中心，每轮后解开重叠；流带在节点两端按对端的位置排开。
  - `sankeyLinkPath(link, orientation)` 写出流带的中线（两端水平进出），以流带宽度为线宽描出来；`vertical` 横纵对调。
  - 成环报 `XH_VIZ_SANKEY_CYCLE`，`detail.cycle` 列出环路；未知节点、自环、负值报 `XH_VIZ_INVALID_ARGUMENT`，重复节点报 `XH_VIZ_DUPLICATE_KEY`。
  - 不从包入口导出，子路径单独计体积：实测 2.09 kB（gzip），限额 2.5 kB。

- 82b083b: `@xihan-ui/viz` 新增比例尺与定义域推断。全部比例尺冻结不可变，`nice()` 返回新的比例尺。

  - 连续：`scaleLinear`（可分段，`[0, 50, 100] → [a, b, c]`）、`scalePow`、`scaleSqrt`（气泡半径用它，面积才与数值成正比）、`scaleLog`（定义域含 0 或跨越正负时抛 `XH_VIZ_LOG_DOMAIN`；跨度不足 3 个数量级时补 2、5 倍刻度）、`scaleSymlog`。都有 `map`、`invert`、`ticks`、`tickFormat(locale, count, spec)`、`nice`，`clamp` 与 `round` 可选。缺失值映射为 `undefined`。
  - 时间：`scaleTime` / `scaleUtc`，刻度与取整按日历推进，标签多尺度；可传入其他时区的间隔与 `timeZone`。
  - 色阶位置：`scaleSequential` / `scaleDiverging` 输出 t ∈ [0, 1]（发散以 0.5 为中点），始终钳制，颜色交给样式在令牌之间插值。
  - 分档：`scaleQuantize`、`scaleQuantile`、`scaleThreshold` 输出档位序号，`invertExtent` 给出每档的取值区间。
  - 类目：`scaleBand` 与 `scalePoint` 共用步长，point 落在同参数 band 的中线上，柱线组合时点正落在柱中间；`invert` 按格子反查类目。`scaleOrdinal` 的定义域必须显式给出，没见过的键返回 `undefined`，值域比定义域短时报错、不循环复用。重复的键抛 `XH_VIZ_DUPLICATE_KEY`。
  - `inferDomain(values, options)`：数据为空时为 [0, 1]；`bars` 轴强制包含 0，被固定成不含 0 时抛 `XH_VIZ_BAR_BASELINE`；作者固定的一端不外扩、不取整。

- 017ed3c: `@xihan-ui/viz` 新增与渲染器无关的场景。

  - 标记：`rect`、`arc`、`line`、`area`、`symbol`、`path`、`text`、`group`，判别键为 `kind`。标记只带几何参数与语义着色引用（色槽 1–8、色阶位置、语气、涨跌、符号、纹理序号），不含任何颜色值；SVG 与 Canvas 消费同一份场景。
  - `createScene`：分为 back / data / front 三层，校验标记键在整个场景内唯一（含分组里的子标记）与着色引用的取值，然后整体冻结。`version` 只在几何变化时递增，过渡中的中间帧另带 `frame` 进度。
  - `diffScenes` 按键求出进入、更新、退出，更新标出有无变化；`sceneMarks` 按层序展开全部标记并累计分组平移；`markPath` 把形状标记转成绝对坐标的路径，`curveOf` 按名字取曲线。
  - `arc` 与 `roundedBar` 只校验自己的几何字段，带着其他字段的对象（如标记）也能直接传入。

- 6b02e77: `@xihan-ui/viz` 新增形状生成器。全部只写入 `PathSink`：不传 sink 返回 SVG 路径字符串，传入 Canvas 2D 上下文时直接绘制。

  - 曲线：`curveLinear`、`curveLinearClosed`、`curveMonotoneX` / `curveMonotoneY`（Fritsch–Carlson 单调三次插值，不越过数据点，是数据曲线「平滑」的唯一实现）、`curveStep` / `curveStepBefore` / `curveStepAfter`、`curveCatmullRom` / `curveCatmullRomClosed`（向心，不打结）、`curveBasis`、`curveBundle(beta)`、`curveBumpX` / `curveBumpY` / `curveBumpRadial`。不提供会制造不存在极值的自然三次样条。
  - `line`、`area`、`lineRadial`、`areaRadial`：缺失的点处断开，不按 0 连过去；面积的回程基线与上沿用同一条曲线对齐。
  - `arc` / `arcCentroid`：角度 0 在 12 点方向、顺时针为正。扇区间隙是与径向边平行的等宽条带，宽度不随半径变化，饼的尖端落在两条边线的交点；`cornerRadius` 夹到环厚一半，并缩到弧长容得下两侧圆角。
  - `pie`：间隙角计入每个扇区自己的角度范围，角度之和恰为一圈；负值抛 `XH_VIZ_NEGATIVE_SHARE`。`foldSmall` 按最大扇区数或最小占比把尾部并成「其他」，并入的条目原样保留供提示框列出。
  - `stack`：次序 none / appearance / ascending / descending / insideOut / reverse，偏移 none / expand / diverging / silhouette / wiggle；每段 `y1 − y0` 恒等于它的值，缺失值是不画的空段，每列朝上、朝下各标出最外层的段；百分比堆叠遇到负值报错。
  - `symbol`：circle、square、diamond、triangle、triangleDown、cross、star、wye 八种，以面积为尺寸，视觉等重，次序与色槽对齐（`SYMBOL_NAMES`）。
  - `roundedBar`：只在远离基线的一端做圆角，半径夹到 min(半径, 厚度 / 2, 长度)。`link` 画横向、纵向与径向的连线。

- 4403744: `@xihan-ui/viz` 新增几何拾取。命中走几何，不依赖 DOM，粗指针与 Canvas 渲染共用同一套逻辑。

  - `createQuadtree`：一次建好、不可变的四叉树，`find` 取半径内最近点（距离相同取输入里靠前的），`findAll` 按距离列出，`visit` 先序遍历。
  - `pointInArc`、`pointInPolygon`、`polygonArea`（屏幕坐标下顺时针为正）、`polygonCentroid`。
  - `createPicker(scene)`：只看数据层里未退场、可聚焦的标记。柱按整条带宽 × 绘图区值域命中，很短的柱也能命中，堆叠时指针落在哪段就是哪段；折线与面积沿对齐轴取最近的键、再按另一轴取最近系列；散点用四叉树，命中半径 = max(符号外延 + 2px, 最小半径)；扇区按极坐标判定。最小命中半径细指针 12、粗指针（touch、pen）22，即命中区 24px 与 44px。`axis` 模式报告同一自变量位置上的全部系列，每个系列一个。

- cc759f8: `@xihan-ui/viz` 新增文字度量、折行与省略。

  - `TextMeasurer` 协议以接口注入，`version` 在度量结果可能变化时递增，依赖度量的布局据此重算；挂载后可以换成基于 Canvas `measureText` 的精确度量器。
  - `createEstimatingMeasurer()`：确定性估算器，按字符类累加宽度（全角 1em、数字 0.6em、大写 0.68em、小写 0.55em、窄字符与空格 0.28em、宽字符 0.85em），服务端与首帧算出同一份布局。
  - `wrapText`：中日韩文字逐字可断、拉丁文按词断、单词本身过长时逐字断；收尾标点与前一个字一起换行，不单独落到行首；显式换行符强制断行；超过 `maxLines` 时余下的文字并进最后一行再截断。
  - `ellipsize`：截到能放下「前缀 + …」的最长前缀，连「…」都放不下时返回空串。

- 6e39397: `@xihan-ui/viz` 新增时间间隔与时间刻度。

  - `localIntervals` / `utcIntervals`：毫秒、秒、分、时、日、周、月、年，各带 `floor`、`ceil`、`round`、`offset`、`range`、`count`、`every`，全部返回新的 `Date`、不修改入参。时、分、秒按绝对时长推进；日、周、月、年按日历推进，跨夏令时的一天是 23 或 25 小时，日刻度始终落在当地零点。
  - `every(n)` 按上一级里的序号取余：每 15 分钟落在 0、15、30、45 分，每两日在月初重新起算。
  - `createTimeIntervalSet(calendar)`：间隔算法只经由 `TimeCalendar`（墙上时间与时间点互换）读写日期字段，本地与 UTC 两份日历已内建（`localCalendar`、`utcCalendar`），任意时区传入按同一接口实现的日历即可得到同一套间隔。
  - `timeTickInterval` / `timeTicks`：按目标间隔在 1、5、15、30 秒 / 分，1、3、6、12 时，1、2 日，1 周，1、3 月，1 年里取最近者；跨度超过一年按年数取刻度步长，不足一秒按毫秒取。周刻度缺省从星期一开始，`firstDayOfWeek` 可改。
  - 年份 0–99 按字面年份处理，不映射到 1900 年代；无效日期立即抛 `XH_VIZ_INVALID_ARGUMENT`。

- b2f213a: 过渡里的分组逐个子标记对齐：新出现的系列分组不再整组淡入，里面的柱各自从基线长出、扇区各自展开；整组退出时子标记各自收回基线并淡出；减弱动效下子标记照样淡入淡出。按系列错开时，分组按它里面的系列计算延迟。
- 1898319: `@xihan-ui/viz` 新增场景过渡 `planTransition` / `sceneAt`。按键把新旧场景对齐成进入、更新、退出三类轨迹，按几何参数插值，不插值路径字符串。

  - 更新：柱插值位置与尺寸，扇区插值起止角与内外半径，折线与面积按数据键对齐点序后重新生成路径，终点精确等于新场景。
  - 进入：`enterFrom` 为 baseline 时柱从基线长出、扇区结束角从起始角增长、面积从基线升起；center 从中心展开；fade 只淡入。折线、点、文字总是淡入。
  - 退出：收回基线并淡出，期间标为 `exiting`、不参与命中，到终点时移除。
  - 按系列错开，至多 5 步，同一系列内不错开；缓动由调用方提供，作用在每条轨迹的局部进度上。`reducedMotion` 下几何直接落到终态，只保留淡入淡出。
  - `sceneAt(plan, elapsed)` 以经过的毫秒数取那一帧，中间帧带着 `frame` 进度与新场景的 `version`，到达总时长后返回新场景本身。

- 30ac1bc: `@xihan-ui/viz/hierarchy` 加上整齐的树与树状图。

  - `tree(root, { size | nodeSize, separation })`：Reingold–Tilford 整齐的树，按 Buchheim、Jünger 与 Leipert 的线性时间做法实现；父节点落在第一个与最后一个子节点的正中，同层相邻节点至少隔开一份间隔（缺省同父 1 份、不同父 2 份），y 按深度排开。
  - `cluster(root, { size | nodeSize, separation })`：树状图，叶子一律落在最底一层、等距排开，父节点在子节点的正中、比最高的子节点高一层。
  - 两者只看结构，不需要先 `sum()`；`size` 缩放到整体尺寸，`nodeSize` 按固定间距排、根落在原点。
  - 子路径实测从 4.39 kB 涨到 5.58 kB（gzip），限额从 4.5 kB 调到 6 kB。

### Patch Changes

- 21e59f2: 顶层的冻结常量与曲线工厂标成纯调用：只用到直角坐标图常用路径（linear / band / time 比例尺、线与面积、堆叠、坐标轴、文字、拾取、降采样）时，没用到的曲线与常量能被摇树摇掉，gzip 后由 12.46 KB 降到约 11.3 KB。体积门禁新增这条路径，上限 12 KB。
