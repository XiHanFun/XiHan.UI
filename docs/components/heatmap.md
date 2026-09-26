# Heatmap 热力图

按网格铺开的强度图：一格是一个观测点，颜色深浅表示数值所在的档位。三种形态共用同一套分档、色阶、图例与详情条，只是格子的排列方式不同：连续周列的一年日历、按自然月分块的月历、行列由作者提供的矩阵。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/heatmap" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/heatmap.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/heatmap" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/heatmap" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/heatmap.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一整年铺为周列 × 星期行的方格阵，颜色深浅表示当天数值所在的档位

<XhDemo src="heatmap/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="heatmap"`：**`root`** · **`grid`** · `month-block` · `row` · `week-day` · `month-label` · `row-label` · `column-label` · `cell` · `tooltip` · `legend` · `legend-label` · `legend-item`

## 示例

### 语气换色

tone 决定使用哪族颜色，色阶两端随之更换，格子的分档不变

<XhDemo src="heatmap/02-tone" />

### 色板换色

palette 直接按颜色指定，六个色板只更换色阶满档一端，分档与空格底色都不变

<XhDemo src="heatmap/03-palette" />

### 尺寸

size 改变格子边长与行首星期名的留白，一屏能放下的周数随之变化

<XhDemo src="heatmap/04-size" />

### 档数

levels 决定分几档，图例与格子共用同一条色阶

<XhDemo src="heatmap/05-levels" />

### 焦点明细

焦点落到某一天时报告日期与计数，键盘用户与鼠标用户看到同一份明细

<XhDemo src="heatmap/06-focus" />

### 月历形态

按自然月分块，每块是一张真实月历，1 号落在它实际的星期几上

<XhDemo src="heatmap/07-month" />

### 矩阵形态

行列都由作者提供，数据按行列定位而不按日期：星期 × 时段的活跃度

<XhDemo src="heatmap/08-matrix" />

### 悬停详情

指针悬停与键盘聚焦经同一条路径：详情条跟随该格，Escape 收起

<XhDemo src="heatmap/09-detail" />

### 年份切换

一排按钮切换的是区间，网格、月份段、色阶与锚点全部按新区间重新计算

<XhDemo src="heatmap/10-year" />

### 数据统计

总天数、空白天数与占比、最大值、平均值都从网格模型直接读取，不必再遍历一遍数据

<XhDemo src="heatmap/11-stats" />

## 设计指引

### 何时使用

- 查看一段连续日期上的多少分布，以及是否存在成片的空档。
- 查看逐月分布，月与月之间需要对齐比较。
- 查看两条离散坐标交叉产生的强度：“星期 × 小时”的活跃度、“品类 × 月份”的销量、相关系数矩阵。
- 强调节奏与分布，而不是某一格的准确数值。

### 何时不用

- 需要选择日期或区间时，使用[日历选择器](./calendar-picker)或[日历范围选择器](./calendar-range-picker)，它们才有选中语义与表单出口。
- 需要读取准确数字、排序或筛选时，使用[表格](./table)。
- 只报告一个总量或同比时，使用[统计数值](./statistic)。

### 特性

- 典型用法是一整年：`calendar` 形态给出整年的起止日期，铺出 53 个周列 × 7 行。以下各条的取值都按这个尺度确定。
- 三种形态由 `variant` 切换，默认 `calendar`：
  - `calendar`：连续周列 × 星期行，月份名浮在网格上沿作为坐标轴，适合查看整年的节奏；
  - `month`：按自然月分块，每块是一张真实月历，1 号落在真实的星期位置，适合查看逐月分布；连续周列看不出月界，这是它存在的理由；
  - `matrix`：行列都由作者通过 `rows` / `columns` 提供，数据按 `(row, column)` 定位，与日期无关。
- 矩阵形态的格子两向分别度量：宽度使用 `--xh-heatmap-column-w`，高度使用 `--xh-heatmap-row-h`，两者都不使用日历形态的 `--xh-heatmap-cell-size`。日历尺按一年五十多列确定，矩阵的行首挂着行名，格子按它定高会矮于行名，行高由行名文字决定、格子在行内拉成细条。行高未设置时取格宽尺的两倍（sm 16px / md 20px / lg 24px），每一档都高于行名文字；列宽未设置时取行高，默认格子为正方形。行高不使用控件高度尺：该尺用于可交互控件在一行内对齐，矩阵格子不可交互，接入后密度档切换会导致矩阵变形。
- 月份名与星期名跟随 `locale`：未提供时跟随宿主浏览器语言，读取失败时使用 `en-US`。周首日由 `firstDayOfWeek` 单独决定，默认星期一。
- 数据接受两种形状之一，按是否含 `date` 区分：日期形态写 `{ date, count }`，矩阵形态写 `{ row, column, value }`。同一格出现多次即累加。
- 日期只接受 ISO 的 `YYYY-MM-DD` 串，加减以 UTC 计算，不引入日期库。
- 区间起点不在周首日时会错列，两种日期形态的口径不同：`calendar` 是排在起点星期之前的整行向后错一列，`month` 是本月首格错到 1 号真实的星期位置。两者都不铺没有日期的占位格。
- 月份名落在该月首日所在的列上；一列跨两个月时整列归后一个月。1 号极少正好是周首日，按列内首日所在月分段会使十二个月份名中的九个整体晚一列，读者顺着“2 月”向下看反而错过月初几天。第 0 列是唯一例外，它按区间首日所在的月归属：起点落在月末（如 `2024-01-29` 起的近 365 天）时该列只露出上月末尾几天，跟随末日会使首月没有名字。代价是这种区间中第二个月的名字排在第 1 列，比 1 号所在的第 0 列晚一列。
- 一整年放不下一屏时网格横向滚动，行首的星期名列固定在起始缘不随之滚动（矩阵形态的行名同理）。固定列自带 `--xh-bg-surface` 的底色，整块放在其他底色上（卡片、分区）时需要改写 `--xh-heatmap-bg`，否则该列会形成色块。月历形态例外：月块换行排列，宽度不超过容器，不作为滚动容器，也没有固定列。
- 三张网格的推导都是纯函数（`buildHeatmapGrid` / `buildHeatmapMonthGrid` / `buildHeatmapMatrixGrid`），可脱离组件单独调用以预生成数据。
- 格距四周相同：数据行的高度固定为格子边长，不由行首星期名的文字撑开。三档尺寸的横向与纵向格距是同一个值（默认 4px），格子 sm 8px / md 10px / lg 12px。
- 行首的星期名隔行绘制：只保留第 0/2/4/6 行之外的三行，周首日是星期一时是“二 / 四 / 六”，是星期日时是“一 / 三 / 五”。一行只有 10px 高而字号是 12px，七个连续书写会上下重叠；隔行后每个保留的字有两行高度可用。三档尺寸一致，不随档位变化。需要七行全部绘制时把 `--xh-heatmap-week-day-skip` 改为可见颜色，例如 `var(--xh-heatmap-label-fg, var(--xh-fg-subtle))`（此时 `sm` 档会较为紧凑）。跳过的是文字着色而不是盒子：节点、文字、盒子与底色都在，固定列的实色底不能缺四行，否则格子会从行首透出，那四行也会不再参与命中测试。
- 色阶对照条两端各有一个词（默认 `Less` `More`），一排色块本身无法说明哪端表示多。文案使用 `translations.legendLow` / `legendHigh`，部件是 `legend-label`（`value` 为 `low` 或 `high`）；Vue 侧不写默认插槽时两端自动铺出，WC 侧从元素的 `legendText` 属性读取。
- 配色有两条路径，默认为品牌色。一条是 `tone` 语气轴（brand / neutral / success / warning / danger / info），与其他组件共用；另一条是 `palette` 色板轴（green / blue / orange / purple / red / gray），直接按颜色指定。色板只决定色阶满档一端的实心底，0 档的空格底与中间各档的混合方式不变，也不参与语气层的悬停 / 淡底 / 前景派生；它是装饰性的轴，不是语义轴。两者都写时以色板为准：色板指定了具体颜色，语气只能推导出颜色。
- 档数可调：未提供 `thresholds` 时按网格内的最大值均分，提供时以其为准。
- 在图外报告“总天数 / 空白天数与占比 / 最大值 / 平均值”不需要再次遍历数据：三张网格都带 `max`（最大值）、`total`（总和）与 `emptyCount`（值为 0 的格子数），格子总数从 `cells.size` 读取。`emptyCount` 统计值为 0 的格子：没有数据的日期与写了 0 的日期都计入。它不是色阶第 0 档的格子数：未提供 `thresholds` 时首个下界始终为 1，两个数相等；提供 `thresholds` 后第 0 档还会包含低于首个下界的非零值，两个数不再相等。
- 悬停或键盘聚焦到某一格时显示详情条，内容由作者编写；组件只提供身份、位置与该格的数据（日期或行列、原始值、档位、在色阶中的位置）。
- 语气与尺寸两轴与其他组件同源；色板轴是热力图独有的。
- 两个适配器的作者侧写法不同，最终 DOM 一致：Vue 侧不写默认插槽时按形态自动铺开整棵树，另有 `cell` 插槽向每格放入内容（三种形态都铺，载荷是日历格或矩阵格，用 `'date' in cell` 区分）、`tooltip` 插槽编写详情条内容（写了才铺出详情条）；Web Components 侧元素不生成任何结构，各部件由作者写进标记，元素只按部件名打属性。
- Web Components 侧铺一整年不需要手写三百多个格子：`<xh-heatmap>` 上有 `grid` / `monthGrid` / `matrixGrid` 三个只读属性，分别对应三种形态推导出的网格（行、列、月份段、星期名、档位标尺都在其中），按其循环生成节点即可；元素连接后即可读取，接线在此之后进行，当场铺出的格子能被接上。每次读取都重算整张网格，读取一次后缓存使用。两个插槽是 Vue 专属，WC 侧通过 `cell-active` 事件自行填充详情条。
- 自行编写默认插槽铺网格时，锚点从载荷的 `focusedCell` / `anchorCell` 读取、用 `setFocusedCell` 移动：这一组三种形态通用，带 `Date` 的一组在矩阵形态下始终为 null。

从其他库迁移时的对照表。左列是那些库写在 `color-theme` 上的取值，右侧两列是本库的两条路径，写任一条都可以，同一行的两种写法在默认主题下产出同一个颜色（`gray` 是唯一例外，见表下说明）：

| 其他库的 `color-theme` | 色板轴（推荐） | 语气轴 | 满档实心底取的原语 |
| --- | --- | --- | --- |
| `green` | `palette="green"` | `tone="success"` | `--xh-color-success-600` |
| `blue` | `palette="blue"` | `tone="info"` | `--xh-color-info-600` |
| `orange` | `palette="orange"` | `tone="warning"` | `--xh-color-warning-600` |
| `purple` | `palette="purple"` | 语气轴没有紫色 | `--xh-color-purple-600` |
| `red` | `palette="red"` | `tone="danger"` | `--xh-color-danger-600` |
| （多数库没有） | `palette="gray"` | `tone="neutral"` | `--xh-color-neutral-600`；深色态换 `--xh-color-neutral-450` |
| （多数库默认为绿） | 不写 | 不写 | `--xh-bg-brand`，跟随使用者的品牌色 |

- 灰色是唯一按主题换档的一族：五个彩色族的 600 档明度在 0.577–0.705，深色态的空格底（`neutral-800`，明度 0.269）距离足够；中性 600 档只有 0.439，五档均分后每档只差 0.0425、相邻两档对比度 1.16–1.20，几乎无法分辨。因此深色态改取 `neutral-450`（明度 0.65），步长回到 0.095、相邻两档 1.42–1.50，与彩色族一致；不取更亮的 `neutral-400` 是因为高对比档的 `border-default` 正是该档，满档格子的描边会与底色同色。`tone="neutral"` 没有这层处理，需要灰色热力图时写 `palette="gray"`。
- 这七种之外的颜色可以直接指定：改写 `--xh-heatmap-ink`（满档的实心底）与 `--xh-heatmap-empty`（0 档的空格底），中间各档由两端在 oklab 中混合。这个入口优先级最高，色板与语气都不能覆盖它。

### 组合

- 详情条不引入浮层引擎，也不参与浮层的层级与关闭协议：它按 root 的内边距盒绝对定位，随网格一起横向滚动，摆在上方还是下方按格子的行序决定，因此始终压在网格自身上。条比一格宽得多，格子末缘之前的空间比起始缘之后多时它改从末缘反向延伸，不越过滚动容器的末缘；否则整年铺开时后三分之一的格子悬停出的条会被裁掉，横向滚动条也会随之伸缩。选择的是两侧空间较大的一边，与条自身的宽度无关（条的宽度在计算落点时尚不可得：内容即将替换，收起时又是 `display:none`）；容器窄到条比较大的一侧还宽时，条仍会被裁掉一截，两侧都放不下时没有解。需要会翻转、会避让视口的真正浮层时，在格子上挂[文字提示](./tooltip)。
- 与[日历选择器](./calendar-picker)并排：一个查看分布，一个选择日期。

### 最佳实践

- 图例两端的词按默认铺出即可；需要换成“少 / 多”或其他说法时改 `translations.legendLow` / `legendHigh`，不要删除，只有一排色块时读者无法判断深色的含义。
- 深浅不是唯一线索：数值必须在文案中说明，否则色觉障碍的用户无法读取。
- 一张图只选一条轴：表达“这一族数据是告警”时写 `tone`，表达“这张图使用绿色”时写 `palette`，两者都写会让读者猜测优先级。同一页并排的几张图更要统一，混用会让读者以为颜色有语义。
- 色板只改变颜色不改变语义：`palette="red"` 的格子不代表这些天出了问题，该含义只能由标题与文案表达。
- 数据中出现极端值时自行提供 `thresholds`，按最大值均分会把其余格子全部压到第 0、1 档，整张图变成一片空白加一个亮点。
- 一屏放不下时让网格横向滚动，不要把格子压到无法辨认。整年在 `md` 档约需 774px，`sm` 档约 660px，容器窄于该值会出现横向滚动条。
- 键盘移动到视口外的格子时网格会自动滚动，落点已避开固定列；为 root 另加内边距或更换 `--xh-heatmap-gutter` 时不需要再处理，两处读取同一个值。
- 矩阵的列名与其下一列的格子同宽：标签较长时整体调大 `--xh-heatmap-column-w`，不只撑开标签，否则标签会与格子错位。
- 调宽列时一并调高行：只设置 `--xh-heatmap-column-w` 而不设置 `--xh-heatmap-row-h`，格子会横向拉成细条。两个值在 1.5 : 1 左右最易读，一屏放不下时减少列数而不压扁行。
- 矩阵的行列顺序就是渲染顺序，按希望读者阅读的次序提供，组件不排序。
- 月历形态中上下键移动的是“上一周 / 下一周同一天”，可以跨月块：从一月块最后一行按 ↓ 会落到二月块，而月块并排换行，视觉上像向右上方跳动。按块阅读时使用左右键，它逐日移动、次序与视觉一致。矩阵形态没有这种情况，它的行列是无序类目，上下键到边即停。

### 反模式

- 将它用作日期选择器：格子不可点击、没有选中语义。
- 一次铺多年：列数上千后既看不出节奏，键盘也无法走到尽头。
- 只用颜色不提供文案：没有可访问名称的方格阵对读屏用户等于空白。
- 把详情条作为唯一的信息出口：它对读屏隐藏，只写在那里等于只提供给鼠标用户。
- 矩阵形态中期望组件从数据推断行列：轴上没有的行列，数据中写了也不进入网格。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-heatmap>` |
| Vue 组件 | `XhHeatmapCell` `XhHeatmapColumnLabel` `XhHeatmapGrid` `XhHeatmapLegend` `XhHeatmapLegendItem` `XhHeatmapLegendLabel` `XhHeatmapMonthBlock` `XhHeatmapMonthLabel` `XhHeatmapRoot` `XhHeatmapRow` `XhHeatmapRowLabel` `XhHeatmapTooltip` `XhHeatmapWeekDay` |
| 组合式函数 | `useHeatmap` |
| 状态机 | `heatmapMachine` |
| 皮肤 | `@xihan-ui/styles/heatmap.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `variant` | `HeatmapVariant` |  | 形态：calendar 连续周列、month 按自然月分块、matrix 行列由作者提供；默认 calendar。 |
| `value` | `HeatmapValue[]` |  | 数据。日期形态接受 { date, count }，矩阵形态接受 { row, column, value }；同一格出现多次即累加。 |
| `rows` | `HeatmapAxisInput[]` |  | 矩阵的行，顺序即渲染顺序；只写身份或身份与文本分开写均可。 |
| `columns` | `HeatmapAxisInput[]` |  | 矩阵的列，顺序即渲染顺序。 |
| `startDate` | `string` |  | 区间起点（含），ISO YYYY-MM-DD。未提供或非法时为空网格。 |
| `endDate` | `string` |  | 区间终点（含）。早于起点即空网格。 |
| `levels` | `number` |  | 档数，默认 5；提供 thresholds 时档数由它决定。 |
| `thresholds` | `number[]` |  | 各档的下界，升序；提供后 levels 不再生效。 |
| `firstDayOfWeek` | `number` |  | 周首日，0 = 星期日，默认 1。 |
| `locale` | `string` |  | 月份名与星期名的书写 locale，未提供时按宿主语言，宿主也没有时按 en-US。 |
| `dir` | `Direction` |  | 文字方向。只作显式覆盖：未提供时方向从 DOM 读取， 左右方向键的语义跟随视觉次序，上下键与它无关。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `palette` | `HeatmapPalette` |  | 色板：green / blue / orange / purple / red / gray，直接指定色阶满档一端的颜色；同时提供 tone 时以色板为准。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<HeatmapTranslations>` |  |  |
| `onCellFocus` | `(details: HeatmapCellFocusDetails) => void` |  | DOM 焦点落到某一格时通知一次；同一格重复聚焦不重复通知。 只由真实的聚焦触发，程序化移动锚点（`setFocusedCell`）不派发该回调。 |
| `onCellActive` | `(details: HeatmapCellDetails \| null) => void` |  | 详情应显示哪一格：指针悬停或键盘聚焦都会走到这里，收起时为 null。 详情条的内容由作者决定，组件只报告是哪一格、数值多少。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `cell-focus` | `HeatmapCellFocusDetails` | 焦点落到某一格；detail 为 `{ date, row, column, count, level, percent }` |
| `cell-active` | `HeatmapCellDetails` | 详情应显示哪一格（悬停或聚焦）；收起时 detail 为 null |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhHeatmapRoot` | `default` | `HeatmapRootSlotProps` |  |
| `XhHeatmapRoot` | `cell` | `HeatmapCellSlotProps` | 铺开网格时每一格的内容插槽，默认是空格子；三种形态都铺设。 |
| `XhHeatmapRoot` | `tooltip` | `HeatmapCellDetails \| null` | 详情条的内容插槽；写了它才会铺设 tooltip 部件。 |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhHeatmapCell` | `value` | `string` | 是 | 日期形态是 ISO 日期，矩阵形态是列身份。 |
| `XhHeatmapCell` | `row` | `string` |  | 矩阵形态：行身份；写在行中时不必再写一遍。 |
| `XhHeatmapColumnLabel` | `value` | `string` | 是 | 列身份。 |
| `XhHeatmapLegendItem` | `value` | `number \| string` | 是 | 档位，兼收字符串。 |
| `XhHeatmapLegendLabel` | `value` | `HeatmapLegendBound` | 是 | 挂在哪一端：low 是色阶起点，high 是终点。 |
| `XhHeatmapMonthBlock` | `value` | `string` | 是 | 月份身份 YYYY-MM。 |
| `XhHeatmapMonthLabel` | `value` | `string` | 是 | 月份身份 YYYY-MM。 |
| `XhHeatmapRoot` | `renderCell` | `(cell: HeatmapCellSlotProps) => ReactNode` |  | 铺开网格时每一格的内容；未提供时是空格子。 |
| `XhHeatmapRoot` | `renderTooltip` | `(details: HeatmapCellDetails \| null) => ReactNode` |  | 详情条的内容；提供后才铺设 tooltip 部件。 |
| `XhHeatmapRoot` | `children` | `SlotChildren<HeatmapRootSlotProps>` |  |  |
| `XhHeatmapRow` | `value` | `number \| string` |  | 行的身份。日历形态是行序 0-6，月历形态是月内第几周，矩阵形态是行身份； 未写即坐标轴行。 |
| `XhHeatmapRow` | `month` | `string` |  | 月历形态：所属月份 YYYY-MM；写在月块中时不必再写一遍。 |
| `XhHeatmapRowLabel` | `value` | `string` |  | 行身份；未写即表头行行首的角落占位。 |
| `XhHeatmapWeekDay` | `value` | `number \| string` |  | 行序 0-6；未提供即坐标轴行行首的占位。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `tooltip` | 'hidden' \| 'visible' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`CELL.FOCUS` · `CELL.BLUR` · `CELL.ENTER` · `CELL.LEAVE` · `DETAIL.DISMISS` · `FOCUS.SET`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `variant` | `HeatmapVariant` | 当前形态。 |
| `grid` | `HeatmapGrid` | 日历网格：行是星期几、列是周次，另带月份段、星期名与档位标尺。其余形态下是一张空网格。 |
| `monthGrid` | `HeatmapMonthGrid \| null` | 月历网格：按自然月分块；不是 month 形态时为 null。 |
| `matrixGrid` | `HeatmapMatrixGrid \| null` | 矩阵网格：行列由作者提供；不是 matrix 形态时为 null。 |
| `focusedCell` | `HeatmapCellRef \| null` | 最后一次被聚焦的格；从未聚焦过时为 null。 |
| `focusedDate` | `string \| null` | 最后一次被聚焦的日期；矩阵形态下恒为 null。 |
| `anchorCell` | `HeatmapCellRef \| null` | 当前占据 Tab 位的格：锚点仍在网格中即为它，否则回退为文档序首格。 |
| `anchorDate` | `string \| null` | 当前占据 Tab 位的日期；矩阵形态下恒为 null。 |
| `activeCell` | `HeatmapCellDetails \| null` | 详情应显示的格的数据：身份、原始值、档位与色阶位置；不显示时为 null。 |
| `detailOpen` | `boolean` | 详情条当前是否显示。 |
| `legendText` | `{ low: string, high: string }` | 对照条两端的文字，作者按它渲染 legend-label 部件。 与 `getLegendLabelProps` 同源，修改 translations 两处一起变化。 |
| `cellAt` | `(date: string) => HeatmapCellMeta \| null` | 按日期取一格；不在区间内时为 null。矩阵形态下恒为 null。 |
| `setFocusedCell` | `(cell: HeatmapCellRef \| null) => void` | 移动锚点。只改锚点不移动 DOM 焦点，也不派发 `onCellFocus`； 需要焦点跟随时自行调用元素的 focus()。 |
| `setFocusedDate` | `(date: string \| null) => void` | 按日期移动锚点，等同于 `setFocusedCell({ date })`。 |
| `getRootProps` | `() => T['element']` |  |
| `getGridProps` | `() => T['element']` |  |
| `getMonthBlockProps` | `(props: HeatmapMonthBlockProps) => T['element']` |  |
| `getRowProps` | `(props: HeatmapRowProps) => T['element']` |  |
| `getWeekDayProps` | `(props: HeatmapWeekDayProps) => T['element']` |  |
| `getMonthLabelProps` | `(props: HeatmapMonthLabelProps) => T['element']` |  |
| `getRowLabelProps` | `(props: HeatmapRowLabelProps) => T['element']` |  |
| `getColumnLabelProps` | `(props: HeatmapColumnLabelProps) => T['element']` |  |
| `getCellProps` | `(props: HeatmapCellProps) => T['element']` |  |
| `getTooltipProps` | `() => T['element']` |  |
| `getLegendProps` | `() => T['element']` |  |
| `getLegendLabelProps` | `(props: HeatmapLegendLabelProps) => T['element']` |  |
| `getLegendItemProps` | `(props: HeatmapLegendItemProps) => T['element']` |  |

## 无障碍

### 键盘

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

### ARIA

以下属性由 `connect` 生成。

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
| `row` | `aria-label` | undefined \| grid.weekDays[row.weekDay]?.long |
| `row` | `aria-rowindex` | 1 |
| `row` | `role` | 'row' |
| `week-day` | `aria-hidden` | 'true' |
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
| `legend` | `aria-label` | translations?.legendLabel |
| `legend` | `role` | 'group' |
| `legend-item` | `aria-hidden` | 'true' |

- 网格是 `role="grid"` 且 `aria-readonly`，每行一个 `role="row"`，每格一个 `role="gridcell"`。
- 月历形态中一个自然月是一个 `role="rowgroup"`，块的可访问名称是该月的完整名称；块内的星期名坐标轴整条 `aria-hidden`，读屏看到的每一块只有合法的行。
- 矩阵形态中行名是 `role="rowheader"`、列名是 `role="columnheader"`，表头行行首的角落占位 `aria-hidden`；行列总数把两条表头计入，读屏报告的行列号才正确。
- 格子内没有文字，可访问名称完全由文案拼出：日期形态使用 `translations.cellLabel`（日期 + 数值），矩阵形态使用 `translations.matrixCellLabel`（行 + 列 + 数值），务必按本地语言改写。
- 星期名、月份名与图例中的色块都是视觉坐标轴，一律 `aria-hidden`：每格自身能读出完整身份与数值，再读一遍轴只是噪音。
- 日历形态中星期名隔行绘制，视觉上可以根据上下文推断被跳过的行：因此每一行自带 `aria-label`，写的是该行星期的全称（如“星期一”）。这个名称跟随 `locale`、不进 `translations`，读的就是坐标轴上的词，两处必须逐字一致（月块的名称同理）。它只是补充：`role="row"` 上的名称并非所有读屏在方向键导航时都播报，而每一格的可访问名称本就带完整日期。
- 图例整体是 `role="group"`，名称使用 `translations.legendLabel`。两端的词是真实文字、不隐藏，因此能说明色阶的方向；深色表示多还是少是约定而非自明。
- 详情条 `aria-hidden`：它显示的信息与格子的可访问名称是同一份，读两遍反而干扰。因此详情条内不能出现可访问名称中没有的内容，否则读屏用户会缺少信息。
- 各行格子数不一定相同（首行可能少一格），格子上带 `aria-colindex`，读屏报出的列号才正确。
- 整张网格只占一个 Tab 位，进入后靠方向键移动。键盘聚焦与指针悬停触发同一条详情：只支持悬停会把键盘与读屏用户排除在外。
- Escape 收起详情条但不拦截按键：外层浮层的关闭仍由其自身处理。

## 样式参考

### 皮肤

`@xihan-ui/styles/heatmap.css` 使用 `[data-scope="heatmap"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-palette` | props.palette |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `row` | `data-week` | String(row.week) |
| `row` | `data-week-day` | undefined \| String(row.weekDay) |
| `week-day` | `data-week-day` | undefined \| String(label.weekDay) |
| `cell` | `data-level` | String(level) |
| `tooltip` | `data-inline-anchor` | undefined \| tip.inlineAnchor |
| `tooltip` | `data-placement` | undefined \| ((): 'block-start' \| 'block-end' =&gt; { if (activeRef =… |
| `tooltip` | `data-state` | 'hidden' \| 'visible' |
| `legend-label` | `data-bound` | label.bound |
| `legend-item` | `data-level` | String(item.level) |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-heatmap-bg` | `root`<br>`row-label`<br>`week-day` | `background` | `default` | `--xh-bg-surface` | heatmap 的 root、row-label、week-day 部件 background 覆盖槽。 |
| `--xh-heatmap-block-gap` | `grid`<br>`root` | `gap` | `variant=month` | `--xh-_heatmap-gutter` | heatmap 的 grid、root 部件 gap 覆盖槽。 |
| `--xh-heatmap-block-inner-gap` | `month-block` | `gap` | `default` | `--xh-_heatmap-gap` | heatmap 的 month-block 部件 gap 覆盖槽。 |
| `--xh-heatmap-cell-bg` | `cell`<br>`legend-item` | `background` | `default` | `--xh-_heatmap-ink` | heatmap 的 cell、legend-item 部件 background 覆盖槽。 |
| `--xh-heatmap-cell-border` | `cell`<br>`legend-item` | `box-shadow` | `default` | `--xh-border-default` | heatmap 的 cell、legend-item 部件 box-shadow 覆盖槽。 |
| `--xh-heatmap-cell-radius` | `cell`<br>`legend-item` | `border-radius` | `default` | `--xh-shape-inset` | heatmap 的 cell、legend-item 部件 border-radius 覆盖槽。 |
| `--xh-heatmap-cell-size` | `cell`<br>`legend-item`<br>`month-label`<br>`root`<br>`row`<br>`week-day` | `block-size`<br>`border`<br>`inline-size`<br>`margin-inline-start` | `@media print`<br>`default`<br>`first-child`<br>`level=1`<br>`level=2`<br>`level=3`<br>`size=lg`<br>`size=sm`<br>`variant=month`<br>`week`<br>`week-day` | `--xh-space-2`<br>`--xh-space-2_5`<br>`--xh-space-3` | heatmap 的 cell、legend-item、month-label、root、row、week-day 部件 block-size、border、inline-size、margin-inline-start 覆盖槽。 |
| `--xh-heatmap-column-w` | `cell`<br>`column-label`<br>`root` | `inline-size` | `default`<br>`variant=matrix` | `--xh-_heatmap-row-h` | heatmap 的 cell、column-label、root 部件 inline-size 覆盖槽。 |
| `--xh-heatmap-empty` | `cell`<br>`legend-item`<br>`root` | `background` | `default` | `--xh-bg-subtle-opaque` | heatmap 的 cell、legend-item、root 部件 background 覆盖槽。 |
| `--xh-heatmap-fg` | `root` | `color` | `default` | `--xh-fg-muted` | heatmap 的 root 部件 color 覆盖槽。 |
| `--xh-heatmap-font-size` | `root` | `font-size` | `default` | `--xh-_heatmap-font-size` | heatmap 的 root 部件 font-size 覆盖槽。 |
| `--xh-heatmap-gap` | `root` | `gap` | `default` | `--xh-space-2` | heatmap 的 root 部件 gap 覆盖槽。 |
| `--xh-heatmap-grid-gap` | `grid` | `gap` | `default` | `--xh-_heatmap-gap` | heatmap 的 grid 部件 gap 覆盖槽。 |
| `--xh-heatmap-gutter` | `grid`<br>`root`<br>`row-label`<br>`week-day` | `gap`<br>`inline-size`<br>`scroll-padding-inline-start` | `default`<br>`size=sm`<br>`variant=month` | `--xh-space-6`<br>`--xh-space-8` | heatmap 的 grid、root、row-label、week-day 部件 gap、inline-size、scroll-padding-inline-start 覆盖槽。 |
| `--xh-heatmap-ink` | `cell`<br>`legend-item`<br>`root` | `background` | `default`<br>`is([data-theme='dark'] *, [data-theme='dark'])`<br>`palette=blue`<br>`palette=gray`<br>`palette=green`<br>`palette=orange`<br>`palette=purple`<br>`palette=red`<br>`theme=dark`<br>`tone` | `--xh-_tone`<br>`--xh-bg-brand`<br>`--xh-color-danger-600`<br>`--xh-color-info-600`<br>`--xh-color-neutral-450`<br>`--xh-color-neutral-600`<br>`--xh-color-purple-600`<br>`--xh-color-success-600`<br>`--xh-color-warning-600` | heatmap 的 cell、legend-item、root 部件 background 覆盖槽。 |
| `--xh-heatmap-label-fg` | `column-label`<br>`legend`<br>`month-label`<br>`root`<br>`row-label`<br>`week-day` | `color` | `default`<br>`variant=month`<br>`week-day=0`<br>`week-day=2`<br>`week-day=4`<br>`week-day=6` | `--xh-fg-subtle` | heatmap 的 column-label、legend、month-label、root、row-label、week-day 部件 color 覆盖槽。 |
| `--xh-heatmap-legend-gap` | `legend` | `gap` | `default` | `--xh-_heatmap-gap` | heatmap 的 legend 部件 gap 覆盖槽。 |
| `--xh-heatmap-py` | `root` | `padding-block` | `default` | `--xh-_heatmap-gap` | heatmap 的 root 部件 padding-block 覆盖槽。 |
| `--xh-heatmap-row-gap` | `row` | `gap` | `default` | `--xh-_heatmap-gap` | heatmap 的 row 部件 gap 覆盖槽。 |
| `--xh-heatmap-row-h` | `cell`<br>`column-label`<br>`root` | `block-size`<br>`inline-size` | `default`<br>`size=lg`<br>`size=sm`<br>`variant=matrix` | `--xh-space-4`<br>`--xh-space-5`<br>`--xh-space-6` | heatmap 的 cell、column-label、root 部件 block-size、inline-size 覆盖槽。 |
| `--xh-heatmap-sticky-layer` | `row-label`<br>`week-day` | `z-index` | `default` | `1` | heatmap 的 row-label、week-day 部件 z-index 覆盖槽。 |
| `--xh-heatmap-title-fg` | `month-label`<br>`root` | `color` | `variant=month` | `--xh-fg-default` | heatmap 的 month-label、root 部件 color 覆盖槽。 |
| `--xh-heatmap-tooltip-bg` | `tooltip` | `background` | `default` | `--xh-fg-default` | heatmap 的 tooltip 部件 background 覆盖槽。 |
| `--xh-heatmap-tooltip-border` | `tooltip` | `border` | `default` | `--xh-heatmap-tooltip-fg` | heatmap 的 tooltip 部件 border 覆盖槽。 |
| `--xh-heatmap-tooltip-fg` | `tooltip` | `border`<br>`color` | `default` | `--xh-bg-surface` | heatmap 的 tooltip 部件 border、color 覆盖槽。 |
| `--xh-heatmap-tooltip-font-size` | `tooltip` | `font-size` | `default` | `--xh-control-caption-md` | heatmap 的 tooltip 部件 font-size 覆盖槽。 |
| `--xh-heatmap-tooltip-layer` | `tooltip` | `z-index` | `default` | `2` | heatmap 的 tooltip 部件 z-index 覆盖槽。 |
| `--xh-heatmap-tooltip-max-w` | `tooltip` | `max-inline-size` | `default` | `--xh-overlay-max-w` | heatmap 的 tooltip 部件 max-inline-size 覆盖槽。 |
| `--xh-heatmap-tooltip-px` | `tooltip` | `padding-inline` | `default` | `--xh-space-2` | heatmap 的 tooltip 部件 padding-inline 覆盖槽。 |
| `--xh-heatmap-tooltip-py` | `tooltip` | `padding-block` | `default` | `--xh-space-1` | heatmap 的 tooltip 部件 padding-block 覆盖槽。 |
| `--xh-heatmap-tooltip-radius` | `tooltip` | `border-radius` | `default` | `--xh-shape-control` | heatmap 的 tooltip 部件 border-radius 覆盖槽。 |
| `--xh-heatmap-tooltip-shadow` | `tooltip` | `box-shadow` | `default` | `--xh-material-frosted-compact-shadow` | heatmap 的 tooltip 部件 box-shadow 覆盖槽。 |
| `--xh-heatmap-week-day-skip` | `root`<br>`week-day` | `color` | `week-day=0`<br>`week-day=2`<br>`week-day=4`<br>`week-day=6` | `transparent` | heatmap 的 root、week-day 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background-color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 横轴沿 inline 方向排列，整页切换为 rtl 时视觉次序整体翻转，左右方向键的语义跟随翻转，上下键不受影响。
- 方向从 DOM 实时读取，祖先链上任意一处 `dir` 或 CSS `direction` 都有效；`dir` 属性只作显式覆盖。
- 详情条的落点也按逻辑方向计算：rtl 下从末缘反向度量，样式侧只写一条 `inset-inline-start` 即两向通用。
