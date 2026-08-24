#!/usr/bin/env node
// 门禁：内衬与间隙必须留一个使用者覆盖槽。
//
// 皮肤是使用者唯一能改样式的口子，改法就是覆盖 --xh-<组件>-<部件>-<属性> 这些槽。
// 一条 padding 直接写 var(--xh-space-3)，使用者要改就只能提高特指度去压整条规则——
// 那等于绕开整套覆盖契约。同一个角色的部件在别的组件里都留了槽（tag 的内衬有、
// badge 的曾经没有），不留的是漏掉而不是有意。
//
// margin 不在此列：本仓的 margin 全是几何补偿（拼接组靠负外边距吃掉相邻描边、
// 标签与必填星之间的固定小位移），不是可调的内衬。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'

/** 受管属性 → 槽名后缀。 */
const SUFFIX = {
  'padding': 'padding',
  'padding-block': 'py',
  'padding-inline': 'px',
  'padding-block-start': 'pt',
  'padding-block-end': 'pb',
  'padding-inline-start': 'ps',
  'padding-inline-end': 'pe',
  'gap': 'gap',
  'row-gap': 'row-gap',
  'column-gap': 'column-gap',
}

/** 注释挖空但保留换行。 */
const strip = css => css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))

const problems = []
let withSlot = 0

for (const file of (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()) {
  const src = strip(await readFile(join(STYLES_DIR, file), 'utf8'))
  const comp = file.replace(/\.css$/, '')
  for (const [, selector, body] of src.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const parts = [...selector.matchAll(/data-part='([a-z-]+)'/g)].map(x => x[1])
    // 冒号后不写 \s*：它与 [^;]+ 能吃同一批字符，不匹配时会逐位回溯。值交给 trim 归一
    for (const [, prop, value] of body.matchAll(/([a-z-]+)\s*:([^;]+);/g)) {
      const suffix = SUFFIX[prop]
      if (!suffix)
        continue
      const v = value.trim()
      // 走令牌的才受管：0 / auto / 百分比 / 字面量各有各的判据，由别的门禁盯
      if (!/var\(--xh-/.test(v))
        continue
      // 有口子 = 取值链的第一个 var() 是私有槽或本组件的使用者槽
      const first = /var\(\s*(--xh-[\w-]+)/.exec(v)?.[1] ?? ''
      if (first.startsWith('--xh-_') || first.startsWith(`--xh-${comp}-`)) {
        withSlot += 1
        continue
      }
      // 部件认不出来的（纯 scope 选择器、共享皮肤）不下判断
      if (!parts.length)
        continue
      const part = parts.at(-1)
      const slot = part === 'root' ? `--xh-${comp}-${suffix}` : `--xh-${comp}-${part}-${suffix}`
      problems.push(`${file}  ${selector.replace(/\s+/g, ' ').trim().slice(0, 70)}  ${prop}: ${v}\n      改成 var(${slot}, ${v})`)
    }
  }
}

if (problems.length) {
  console.error('[check-spacing-slots] ✗ 内衬 / 间隙没有使用者覆盖槽：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  process.exit(1)
}

console.log(`[check-spacing-slots] 通过：${withSlot} 处内衬 / 间隙都经使用者覆盖槽或私有槽（margin 是几何补偿，不在此列）`)
