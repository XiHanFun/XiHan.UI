#!/usr/bin/env node
// 门禁：同一个概念在两个以上组件里用同一个字面量当默认值时，必须先立语义令牌再指过去。
//
// 组件覆盖槽的第二参数是「默认值」不是「兜底」，它必须有；但它一旦在多个组件里写成同一个
// 字面量，那就是一条没被命名的设计决策——改的时候得逐个组件找，找漏一个就长歪一处。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'

/** 不必令牌化的默认值：它们是 CSS 本身的语义，不是设计档位。 */
const NOT_A_SCALE = new Set(['transparent', 'none', 'auto', 'inherit', 'currentColor', '0', '1', '100%'])

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css'))

/** key = 「槽位后缀 = 字面量」，value = 用到它的组件集合。 */
const groups = new Map()

for (const file of files) {
  const comp = file.replace(/\.css$/, '')
  const src = await readFile(join(STYLES_DIR, file), 'utf8')
  for (const m of src.matchAll(/var\(\s*(--xh-[a-z0-9_-]+)\s*,([^;()]*)\)/g)) {
    const [, name, raw] = m
    const fallback = raw.trim()
    if (fallback.startsWith('var(') || NOT_A_SCALE.has(fallback))
      continue
    const prefix = `--xh-${comp}-`
    const suffix = name.startsWith(prefix) ? name.slice(prefix.length) : name
    const key = `${suffix} = ${fallback}`
    const set = groups.get(key) ?? new Set()
    set.add(comp)
    groups.set(key, set)
  }
}

const shared = [...groups].filter(([, comps]) => comps.size >= 2)

if (shared.length) {
  console.error('[check-shared-slots] ✗ 这些默认值在多个组件里重复，先立语义令牌再指过去：')
  for (const [key, comps] of shared.sort((a, b) => b[1].size - a[1].size))
    console.error(`  ${key}  —— ${comps.size} 个组件: ${[...comps].sort().join(' ')}`)
  process.exit(1)
}

console.log(`[check-shared-slots] 通过：${files.length} 份皮肤里没有跨组件重复的字面量默认值`)
