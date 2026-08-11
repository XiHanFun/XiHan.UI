#!/usr/bin/env node
// 门禁：皮肤里消费的每个私有槽 --xh-_* 都必须在某份皮肤里声明过。
// 只消费不声明的槽会静默退到 var() 的兜底值——CSS 不报错、TS 不报错、现有门禁也不管
// （check-token-refs 整体放行 --xh-_ 前缀），只有肉眼盯着某个语气不生效才看得出来。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES = 'packages/design/styles/css'

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

const dangling = [...used].filter(([slot]) => !declared.has(slot))
const unusedSlots = [...declared].filter(([slot]) => !used.has(slot))

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

console.log(`[check-private-slots] 通过：${declared.size} 个私有槽，声明与消费两边对齐`)
