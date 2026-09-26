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
  ['--xh-_toast-progress-steps', 'packages/engine/headless/src/toast/toast.connect.ts'],
  // 同一批新到条目的错开序号：条目到达的追踪写进条目的内联样式，皮肤只读
  ['--xh-_stagger-index', 'packages/engine/core/src/behavior/arrival/track-arrivals.ts'],
  // 叠放的一摞里各条的层深：堆叠控制器写进条目的内联样式，皮肤按它逐层算收拢比例
  ['--xh-_toast-depth', 'packages/engine/headless/src/toast/toast.stack.ts'],
  // 图表提示框的锚点坐标：连接层按数据或指针的位置写进提示框的内联样式，皮肤只读
  ['--xh-_chart-tip-x', 'packages/engine/headless/src/cartesian-chart/cartesian-chart.connect.ts'],
  ['--xh-_chart-tip-y', 'packages/engine/headless/src/cartesian-chart/cartesian-chart.connect.ts'],
  // 环形中心的圆心与内径：连接层按饼的几何写进中心的内联样式，皮肤只读
  ['--xh-_chart-center-x', 'packages/engine/headless/src/pie-chart/pie-chart.connect.ts'],
  ['--xh-_chart-center-y', 'packages/engine/headless/src/pie-chart/pie-chart.connect.ts'],
  ['--xh-_chart-center-size', 'packages/engine/headless/src/pie-chart/pie-chart.connect.ts'],
])

// 皮肤声明、由运行时从计算样式读出的私有槽：取值链在皮肤里，消费方是 JS，皮肤里不必有 var() 消费点
const RUNTIME_READ_SLOTS = new Map([
  // 图表的几何度量：机器挂载后从根的计算样式读取，作者覆盖组件槽即改变几何
  ...['bar-max', 'gap', 'line-width', 'point-size', 'hit-min', 'tick-length', 'label-gap', 'radius', 'font-size', 'leading']
    .map(name => [`--xh-_chart-metric-${name}`, 'packages/engine/headless/src/shared/chart/metrics.ts']),
])

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
