#!/usr/bin/env node
// 门禁：三档私有槽的阶梯必须在两个密度下都严格递增。
//
// 皮肤里的三档槽常常混用两把尺：md 档写在没有 data-size 的基础块里、取的是带 compact
// 覆盖的语义令牌，sm / lg 写在 [data-size] 块里、取的是不随密度动的 --xh-space-* 原语。
// 两把尺在 comfortable 下看着还好，切到 compact 就会塌平（sm == md）甚至反过来——
// 「小档比中档还宽」。这种错单看某一档的声明看不出来，必须把两张密度表各解析一遍。
//
// 判据：同一个私有槽三档齐全且三档都解析得出像素值时，sm < md < lg 必须成立。
// 解析不动的（含 calc 里套百分比、取值来自组件槽等）跳过并计数——门禁只对算得出的那部分负责。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'
const TOKENS_CSS = 'packages/design/tokens/tokens.css'
const ROOT_FONT_SIZE = 16

const tokensCss = await readFile(TOKENS_CSS, 'utf8')

/** 抠出 tokens.css 里某个注释开头的块，返回它声明的 name → value。 */
function block(marker) {
  const at = tokensCss.indexOf(marker)
  if (at < 0)
    throw new Error(`[check-size-ladder] tokens.css 里找不到块标记「${marker}」——生成器的块注释改了就要同步改这里`)
  const open = tokensCss.indexOf('{', at)
  let depth = 0
  let end = open
  for (; end < tokensCss.length; end++) {
    if (tokensCss[end] === '{')
      depth++
    else if (tokensCss[end] === '}' && --depth === 0)
      break
  }
  const map = new Map()
  // 冒号后不写 \s*：它与 [^;]+ 能吃同一批字符，不匹配时会逐位回溯。值交给 trim 归一
  for (const [, name, value] of tokensCss.slice(open, end).matchAll(/(--xh-[\w-]+)\s*:([^;]+);/g))
    map.set(name, value.trim())
  return map
}

const primitive = block('/* primitive')
const base = block('/* 非模式语义')
const compact = block('/* density 轴 · compact')

const TABLES = [
  ['comfortable', new Map([...primitive, ...base])],
  ['compact', new Map([...primitive, ...base, ...compact])],
]

/** 取值链 → 像素数；解析不动返回 null。 */
function resolve(value, table, depth = 0) {
  if (depth > 12)
    return null
  const v = value.trim()
  const px = /^(-?[\d.]+)px$/.exec(v)
  if (px)
    return Number.parseFloat(px[1])
  const rem = /^(-?[\d.]+)rem$/.exec(v)
  if (rem)
    return Number.parseFloat(rem[1]) * ROOT_FONT_SIZE
  const ref = /^var\((--xh-[\w-]+)(?:,([\s\S]+))?\)$/.exec(v)
  if (ref) {
    const named = table.get(ref[1])
    if (named !== undefined)
      return resolve(named, table, depth + 1)
    return ref[2] ? resolve(ref[2], table, depth + 1) : null
  }
  const calc = /^calc\(([\s\S]+)\)$/.exec(v)
  if (calc) {
    const parts = calc[1].split(/\s+([+\-*/])\s+/)
    if (parts.length !== 3)
      return null
    const left = resolve(parts[0], table, depth + 1)
    const right = /^[\d.]+$/.test(parts[2]) ? Number.parseFloat(parts[2]) : resolve(parts[2], table, depth + 1)
    if (left === null || right === null)
      return null
    return { '+': left + right, '-': left - right, '*': left * right, '/': left / right }[parts[1]]
  }
  return null
}

/** 注释挖空但保留换行，行号与原文对齐。 */
const strip = css => css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))

const problems = []
let checked = 0
let skipped = 0

for (const file of (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()) {
  const src = strip(await readFile(join(STYLES_DIR, file), 'utf8'))
  /** 槽名 → { sm, md, lg }（后写的赢，与级联一致） */
  const slots = new Map()
  let tier = 'md'
  let depth = 0
  for (const line of src.split('\n')) {
    const sized = /\[data-size='(sm|md|lg)'\]/.exec(line)
    if (sized && line.includes('{'))
      tier = sized[1]
    depth += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length
    const decl = /^\s*(--xh-_[\w-]+)\s*:([^;]+);/.exec(line)
    if (decl) {
      if (!slots.has(decl[1]))
        slots.set(decl[1], {})
      slots.get(decl[1])[tier] = decl[2].trim()
    }
    // 回到 @layer 那一层就不再算在某个尺寸块里
    if (depth <= 1)
      tier = 'md'
  }

  for (const [name, tiers] of slots) {
    if (!tiers.sm || !tiers.md || !tiers.lg)
      continue
    for (const [density, table] of TABLES) {
      const sm = resolve(tiers.sm, table)
      const md = resolve(tiers.md, table)
      const lg = resolve(tiers.lg, table)
      if (sm === null || md === null || lg === null) {
        skipped += 1
        continue
      }
      checked += 1
      if (sm < md && md < lg)
        continue
      problems.push(`${file}  ${name}  [${density}]  sm=${sm} md=${md} lg=${lg}`)
    }
  }
}

if (problems.length) {
  console.error('[check-size-ladder] ✗ 三档阶梯塌平或反转：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  console.error('\n成因基本都是三档混用两把尺：md 取带 compact 覆盖的语义档、sm/lg 取不随密度动的原语。')
  console.error('三档取同一把尺（同一组语义令牌的 sm/md/lg），或三档都取原语——不要一半一半。')
  process.exit(1)
}

console.log(`[check-size-ladder] 通过：2 档密度 × 三档齐全的私有槽，${checked} 组阶梯都严格递增（取值链解析不动而跳过 ${skipped} 组）`)
