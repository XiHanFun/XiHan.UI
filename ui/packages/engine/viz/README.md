# @xihan-ui/viz

图表引擎：数组统计、数字与时间格式、时间间隔、比例尺、插值、颜色换算与色板校验、路径与形状生成、坐标轴布局、文字度量、几何拾取、降采样、场景求差与过渡、无障碍模型。全部是纯函数与冻结对象，不碰 DOM：文字度量以接口注入，结果只由输入决定，服务端与浏览器算出同一份几何。自研实现，零运行时依赖，import 无副作用。

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

## 装

```bash
pnpm add @xihan-ui/viz
```

完整文档见 [https://ui.docs.xihanfun.com](https://ui.docs.xihanfun.com)。这个包属于 `engine/` 组，组的含义见仓库里的 `ui/packages/README.md`。

许可：MIT
