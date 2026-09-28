#!/usr/bin/env node
// 门禁：皮肤里消费的每个私有槽 --xh-_* 都必须在某份皮肤或登记的运行时写入点声明过。
// 只消费不声明的槽会静默退到 var() 的兜底值——CSS 不报错、TS 不报错、现有门禁也不管
// （check-token-refs 整体放行 --xh-_ 前缀），只有肉眼盯着某个语气不生效才看得出来。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLE_DIRS = ['packages/design/styles/css', 'packages/design/styles/family']
const RUNTIME_PRIVATE_SLOTS = new Map([
  ['--xh-_layer', 'packages/engine/core/src/kernel/structure/layer-registry.ts'],
  // 值类填充的比例（0–1）与倒计时条的分段数：连接层写进部件的内联样式，皮肤只读
  ['--xh-_loading-bar-value', 'packages/engine/headless/src/loading-bar/loading-bar.connect.ts'],
  ['--xh-_notification-progress-steps', 'packages/engine/headless/src/notification/notification.connect.ts'],
  ['--xh-_progress-value', 'packages/engine/headless/src/progress/progress.connect.ts'],
  // 量的刻画：色带的起止、目标与刻度的位置（占满值的比例 0–1）、刻度值的对齐比例与环形坐标、指针的角度，
  // 都由连接层按几何写进部件的内联样式，皮肤只读
  ['--xh-_progress-from', 'packages/engine/headless/src/progress/progress.connect.ts'],
  ['--xh-_progress-to', 'packages/engine/headless/src/progress/progress.connect.ts'],
  ['--xh-_progress-at', 'packages/engine/headless/src/progress/progress.connect.ts'],
  ['--xh-_progress-label-align', 'packages/engine/headless/src/progress/progress.connect.ts'],
  ['--xh-_progress-x', 'packages/engine/headless/src/progress/progress.connect.ts'],
  ['--xh-_progress-y', 'packages/engine/headless/src/progress/progress.connect.ts'],
  ['--xh-_progress-needle-angle', 'packages/engine/headless/src/progress/progress.connect.ts'],
  ['--xh-_toast-progress-steps', 'packages/engine/headless/src/toast/toast.connect.ts'],
  // 提示关闭时收占位的起点：机器在收起前量下整块高度，连接层在退场途中写进根的内联样式，收占位的关键帧只读
  ['--xh-_alert-exit-block-size', 'packages/engine/headless/src/alert/alert.connect.ts'],
  // 引用预览披露的内容区高度：机器在露面与收起前量下，连接层写进预览的内联样式，展开与收起的关键帧只读
  ['--xh-_citation-preview-block-size', 'packages/engine/headless/src/citation/citation.connect.ts'],
  // 跑马灯一份内容在滚动轴上的实测长度：机器挂载后量、随尺寸变化重量，连接层写进根的内联样式，一圈的时长按它换算
  ['--xh-_marquee-measured-span', 'packages/engine/headless/src/marquee/marquee.connect.ts'],
  // 同一批新到条目的错开序号：条目到达的追踪写进条目的内联样式，皮肤只读
  ['--xh-_stagger-index', 'packages/engine/core/src/behavior/arrival/track-arrivals.ts'],
  // 退场中途重开时进场的起点透明度：退场探测按退场播到的位置写进节点的内联样式，进场关键帧只读
  ['--xh-_enter-from-opacity', 'packages/engine/core/src/behavior/presence/animation-end.ts'],
  // 叠放的一摞里各条的层深：堆叠控制器写进条目的内联样式，皮肤按它逐层算收拢比例
  ['--xh-_toast-depth', 'packages/engine/headless/src/toast/toast.stack.ts'],
  // 图表提示框的锚点坐标：连接层按数据或指针的位置写进提示框的内联样式，皮肤只读
  ['--xh-_chart-tip-x', 'packages/engine/headless/src/cartesian-chart/cartesian-chart.connect.ts'],
  ['--xh-_chart-tip-y', 'packages/engine/headless/src/cartesian-chart/cartesian-chart.connect.ts'],
  // 环形中心的圆心与内径：连接层按饼的几何写进中心的内联样式，皮肤只读
  ['--xh-_chart-center-x', 'packages/engine/headless/src/pie-chart/pie-chart.connect.ts'],
  ['--xh-_chart-center-y', 'packages/engine/headless/src/pie-chart/pie-chart.connect.ts'],
  ['--xh-_chart-center-size', 'packages/engine/headless/src/pie-chart/pie-chart.connect.ts'],
  // 图表首次出现时逐个出现的标记占入场时长的比例：连接层写进标记的内联样式，皮肤乘上入场时长作延迟
  ['--xh-_chart-reveal-at', 'packages/engine/headless/src/cartesian-chart/cartesian-chart.connect.ts'],
  // 按值着色的数据在色阶一段里的百分比：连接层写进散点与提示框色标的内联样式，配方用一层 color-mix 兑出颜色
  ['--xh-_chart-p', 'packages/engine/headless/src/cartesian-chart/cartesian-chart.connect.ts'],
  // 系列或扇区引用的那一格纹理（url(#…)）：连接层写进系列分组与扇区的内联样式，纹理模式下皮肤拿它当填充
  ['--xh-_chart-pattern', 'packages/engine/headless/src/cartesian-chart/cartesian-chart.connect.ts'],
  // 缩放条上窗口的两端、缩放条对齐绘图区的左右内缩：连接层按窗口与绘图区的几何写进缩放条的内联样式，皮肤只读
  ...['start', 'end', 'left', 'right'].map(edge => [`--xh-_chart-zoom-${edge}`, 'packages/engine/headless/src/cartesian-chart/cartesian-chart.connect.ts']),
  // 桑基图流带引用的那一个渐变（url(#…)）：连接层写进流带的内联样式，linkColor="gradient" 时皮肤拿它当填充
  ['--xh-_sankey-gradient', 'packages/engine/headless/src/sankey-chart/sankey-chart.connect.ts'],
  // 关系图有权重的连线的线宽：连接层按权重写进连线的内联样式，皮肤拿它当描边宽
  ['--xh-_graph-link-width', 'packages/engine/headless/src/graph-chart/graph-chart.connect.ts'],
])

// 皮肤声明、由运行时从计算样式读出的私有槽：取值链在皮肤里，消费方是 JS，皮肤里不必有 var() 消费点
// 图表的几何度量：机器挂载后从根的计算样式读取，作者覆盖组件槽即改变几何
const RUNTIME_READ_SLOTS = new Map(
  ['bar-max', 'gap', 'line-width', 'point-size', 'hit-min', 'tick-length', 'label-gap', 'radius', 'font-size', 'leading']
    .map(name => [`--xh-_chart-metric-${name}`, 'packages/engine/headless/src/shared/chart/metrics.ts']),
)

const files = (await Promise.all(STYLE_DIRS.map(async dir =>
  (await readdir(dir).catch(() => [])).filter(file => file.endsWith('.css')).map(file => ({ dir, file })),
))).flat()
if (files.length === 0) {
  console.error(`[check-private-slots] ✗ ${STYLE_DIRS.join(' / ')} 下一份皮肤都没有，路径变了`)
  process.exit(1)
}

/** 声明处：`--xh-_foo: ...`；消费处：`var(--xh-_foo` */
const declared = new Map()
const used = new Map()

for (const { dir, file } of files) {
  const text = await readFile(join(dir, file), 'utf8')
  const label = `${dir.split('/').at(-1)}/${file}`
  text.split('\n').forEach((line, i) => {
    for (const m of line.matchAll(/(--xh-_[\w-]+)\s*:/g)) {
      if (!declared.has(m[1]))
        declared.set(m[1], `${label}:${i + 1}`)
    }
    for (const m of line.matchAll(/var\(\s*(--xh-_[\w-]+)/g)) {
      if (!used.has(m[1]))
        used.set(m[1], `${label}:${i + 1}`)
    }
  })
}

for (const [slot, source] of RUNTIME_PRIVATE_SLOTS) {
  const text = await readFile(source, 'utf8')
  if (!text.includes(`'${slot}'`))
    throw new Error(`[check-private-slots] ✗ 运行时私有槽 ${slot} 没有在 ${source} 写入`)
}

for (const [slot, source] of RUNTIME_READ_SLOTS) {
  const text = await readFile(source, 'utf8')
  if (!text.includes(`'${slot}'`))
    throw new Error(`[check-private-slots] ✗ 运行时读取的私有槽 ${slot} 没有在 ${source} 读取`)
  if (!declared.has(slot))
    throw new Error(`[check-private-slots] ✗ 运行时读取的私有槽 ${slot} 没有皮肤声明，名单过期了`)
}

const dangling = [...used].filter(([slot]) => !declared.has(slot) && !RUNTIME_PRIVATE_SLOTS.has(slot))
const unusedSlots = [...declared].filter(([slot]) => !used.has(slot) && !RUNTIME_READ_SLOTS.has(slot))
const unusedRuntimeSlots = [...RUNTIME_PRIVATE_SLOTS].filter(([slot]) => !used.has(slot))

if (dangling.length) {
  console.error('[check-private-slots] ✗ 下列私有槽只被消费、从没被声明——消费点会静默退到兜底值：')
  for (const [slot, at] of dangling)
    console.error(`  ${slot}  首个消费点 ${at}`)
  process.exit(1)
}

if (unusedSlots.length) {
  console.error('[check-private-slots] ✗ 下列私有槽声明了却没人消费，删掉它：')
  for (const [slot, at] of unusedSlots)
    console.error(`  ${slot}  声明于 ${at}`)
  process.exit(1)
}

if (unusedRuntimeSlots.length) {
  console.error('[check-private-slots] ✗ 下列运行时私有槽没有皮肤消费，删掉写入或补上使用点：')
  for (const [slot, source] of unusedRuntimeSlots)
    console.error(`  ${slot}  运行时写入 ${source}`)
  process.exit(1)
}

console.log(`[check-private-slots] 通过：${declared.size} 个 CSS 私有槽与 ${RUNTIME_PRIVATE_SLOTS.size} 个运行时私有槽均有消费，${RUNTIME_READ_SLOTS.size} 个由运行时读取`)
