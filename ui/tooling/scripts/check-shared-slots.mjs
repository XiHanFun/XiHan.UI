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

// 同一个槽位后缀在多个组件里各写各的字面量（trigger-min-w = 10rem / 12rem / 14rem）：
// 值互异所以上面那条抓不到，但它们是同一个概念，同样该收成一个语义令牌。
const bySuffix = new Map()
for (const [key, comps] of groups) {
  const suffix = key.slice(0, key.indexOf(' = '))
  if (!bySuffix.has(suffix))
    bySuffix.set(suffix, new Map())
  for (const comp of comps)
    bySuffix.get(suffix).set(comp, key.slice(key.indexOf(' = ') + 3))
}
/** 后缀相同但概念不同的，逐条写明理由；名单之外一律受管。 */
const DISTINCT = {
  'column-min-w': '级联的列是一列选项文字，时间选择器的列是两位数字',
  'line-height': 'code-block 的行距与连接层虚拟行高绑死，log 是紧排的日志行',
}
const divergent = [...bySuffix].filter(([suffix, byComp]) => !(suffix in DISTINCT) && byComp.size >= 2 && new Set(byComp.values()).size >= 2)
for (const suffix of Object.keys(DISTINCT)) {
  const byComp = bySuffix.get(suffix)
  if (!byComp || byComp.size < 2 || new Set(byComp.values()).size < 2)
    divergent.push([suffix, new Map([['（名单）', '登在 DISTINCT 里但已不互异，删掉这条']])])
}

if (shared.length || divergent.length) {
  if (shared.length)
    console.error('[check-shared-slots] ✗ 这些默认值在多个组件里重复，先立语义令牌再指过去：')
  for (const [key, comps] of shared.sort((a, b) => b[1].size - a[1].size))
    console.error(`  ${key}  —— ${comps.size} 个组件: ${[...comps].sort().join(' ')}`)
  if (divergent.length)
    console.error('[check-shared-slots] ✗ 同一个槽位后缀在多个组件里各写各的字面量，这是同一个概念，收成一个语义令牌：')
  for (const [suffix, byComp] of divergent)
    console.error(`  ${suffix}  —— ${[...byComp].map(([c, v]) => `${c}=${v}`).join(' / ')}`)
  process.exit(1)
}

console.log(`[check-shared-slots] 通过：${files.length} 份皮肤里没有跨组件重复或互异的字面量默认值`)
