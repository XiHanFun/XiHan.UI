#!/usr/bin/env node
// 门禁：皮肤里消费的每个私有槽 --xh-_* 都必须在某份皮肤或登记的运行时写入点声明过。
// 只消费不声明的槽会静默退到 var() 的兜底值——CSS 不报错、TS 不报错、现有门禁也不管
// （check-token-refs 整体放行 --xh-_ 前缀），只有肉眼盯着某个语气不生效才看得出来。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES = 'packages/design/styles/css'
const RUNTIME_PRIVATE_SLOTS = new Map([
  ['--xh-_layer', 'packages/engine/core/src/kernel/structure/layer-registry.ts'],
])

const files = (await readdir(STYLES)).filter(f => f.endsWith('.css'))
if (files.length === 0) {
  console.error(`[check-private-slots] ✗ ${STYLES} 下一份皮肤都没有，路径变了`)
  process.exit(1)
}

/** 声明处：`--xh-_foo: ...`；消费处：`var(--xh-_foo` */
const declared = new Map()
const used = new Map()

for (const file of files) {
  const text = await readFile(join(STYLES, file), 'utf8')
  text.split('\n').forEach((line, i) => {
    for (const m of line.matchAll(/(--xh-_[\w-]+)\s*:/g)) {
      if (!declared.has(m[1]))
        declared.set(m[1], `${file}:${i + 1}`)
    }
    for (const m of line.matchAll(/var\(\s*(--xh-_[\w-]+)/g)) {
      if (!used.has(m[1]))
        used.set(m[1], `${file}:${i + 1}`)
    }
  })
}

for (const [slot, source] of RUNTIME_PRIVATE_SLOTS) {
  const text = await readFile(source, 'utf8')
  if (!text.includes(`'${slot}'`))
    throw new Error(`[check-private-slots] ✗ 运行时私有槽 ${slot} 没有在 ${source} 写入`)
}

const dangling = [...used].filter(([slot]) => !declared.has(slot) && !RUNTIME_PRIVATE_SLOTS.has(slot))
const unusedSlots = [...declared].filter(([slot]) => !used.has(slot))
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

console.log(`[check-private-slots] 通过：${declared.size} 个 CSS 私有槽与 ${RUNTIME_PRIVATE_SLOTS.size} 个运行时私有槽均有消费`)
