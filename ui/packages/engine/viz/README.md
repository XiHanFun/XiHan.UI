# @xihan-ui/viz

图表引擎：数组统计、数字与时间格式、时间间隔、比例尺、插值、颜色换算与色板校验、路径与形状生成、坐标轴布局、文字度量、几何拾取、降采样、场景求差与过渡、无障碍模型，以及缩放窗口的数学、种子随机与统计布局（瀑布、箱线、核密度、回归）。全部是纯函数与冻结对象，不碰 DOM：文字度量以接口注入，结果只由输入决定，服务端与浏览器算出同一份几何。自研实现，零运行时依赖，import 无副作用。

**谁会装它**：一般不用直接装——图表组件内部已经接好了。要在自己的 `<svg>` 里画定制图形、又想用和组件同一套比例尺与刻度时才会直接引。

## 用法

```ts
import { createEstimatingMeasurer, layoutAxis, line, scaleBand, scaleLinear, stack } from '@xihan-ui/viz'

const rows = [
  { month: '一月', online: 120, retail: 80 },
  { month: '二月', online: 150, retail: 60 },
]
const x = scaleBand({ domain: rows.map(r => r.month), range: [0, 320], paddingInner: 0.2 })
const y = scaleLinear({ domain: [0, 250], range: [200, 0] }).nice()

// 堆叠：每段 y1 − y0 恰为该段的值，最外层的段标了 outermost
const series = stack(rows, { keys: ['online', 'retail'], value: (row, key) => row[key as 'online' | 'retail'] })

// 折线路径：不传 sink 得到 SVG 的 d；传入 Canvas 2D 上下文则直接绘制
const d = line<(typeof rows)[number]>({
  x: r => (x.map(r.month) ?? 0) + x.bandwidth / 2,
  y: r => y.map(r.online) ?? 0,
})(rows)

// 坐标轴只算刻度位置与标签避让，不碰 DOM
const axis = layoutAxis({
  scale: y,
  position: 'left',
  format: v => String(v),
  measure: createEstimatingMeasurer(),
  font: { family: 'sans-serif', size: 12, weight: 400, lineHeight: 16 },
  labelOverflow: 'auto',
  minLabelGap: 8,
  maxLabelSize: 80,
  tickLength: 4,
  labelGap: 4,
})
```

## 约定

- 工厂返回冻结对象，「修改」返回新对象：`scale.nice()` 得到一把新的比例尺，原来那把不变。
- 非法输入立即抛 `VizError`，`code` 以 `XH_VIZ_` 开头，`detail` 带着出问题的原始输入；不静默修正。
- 缺失值（`null`、`undefined`、`NaN`）是缺失，统计时跳过，不按 0 处理。
- 层级布局（层级节点、按父 id 组树、矩形树图、分区、圆堆积、整齐的树与树状图）走 `@xihan-ui/viz/hierarchy` 子路径，不从包入口导出：只画直角坐标图的应用不为它付字节。布局把几何写回节点（矩形的四边 `x0` / `y0` / `x1` / `y1`，圆的 `x` / `y` / `r`，树与树状图的 `x` / `y`）；矩形树图、分区与圆堆积调用前先 `sum()` 或 `count()` 算出聚合值，树与树状图只看结构。
- 桑基布局走 `@xihan-ui/viz/sankey` 子路径：`sankey(nodes, links, { size, nodeWidth, nodePadding, nodeAlign, nodeSort })` 给出节点的四边与流带两端的中线，`sankeyLinkPath` 写出流带的路径；成环报 `XH_VIZ_SANKEY_CYCLE` 并在 `detail.cycle` 里列出环路。
- 关系布局走 `@xihan-ui/viz/graph` 子路径：`forceSimulation(count, links, options)` 是力导模拟（连线弹簧、Barnes–Hut 电荷、向心、碰撞与 x / y 定位，初始位置按叶序排开，同样的输入得到同样的布局），`run()` 同步跑到收敛，`fix` / `release` / `reheat` 供拖拽时局部重算；`circular(count, { radius, group })` 把节点按分组等角排在圆上。树与径向树用 hierarchy 子路径的 `tree` / `cluster`。
- 大数据走 `@xihan-ui/viz/columns` 子路径：`createColumnStore({ fields, capacity })` 是列式数据仓（每个字段一列 `Float64Array`，缺失写 `NaN`；`append` / `setLast` / `shift` / `clear`，`capacity` 是滑动窗口的行数上限，只有最后一行能改写）；`decimateLine` 按像素列保留首、末、最小、最大（M4，画出来与全量逐像素相同）；`bucketOhlc` / `bucketPeak` 把窄到画不出实体的 K 线与柱按 2 的幂根一组合并，组边界按序号对齐；`thinPoints` 按像素格稀疏散点；`createExtentIndex` 分块求区间极值；`createPointIndex` 按像素网格找最近点；`ordinalTimeTicks` 给等距排列的时间轴（交易时段）取刻度。
- 画布绘制的原语走 `@xihan-ui/viz/canvas` 子路径：`tracePolyline` / `traceBand` 把类型化数组上的像素坐标写成折线、面积与区间带（写进 PathSink，Canvas 2D 上下文就是一个）；`parseCssColor` / `mixCssColor` / `createColorRamp` 按 CSS `color-mix` 的同一规则解析与插值颜色，结果写回原空间的函数式，交给画布与 CSS 走同一条换算。

## 装

```bash
pnpm add @xihan-ui/viz
```

完整文档见 [https://ui.docs.xihanfun.com](https://ui.docs.xihanfun.com)。这个包属于 `engine/` 组，组的含义见仓库里的 `ui/packages/README.md`。

许可：MIT
