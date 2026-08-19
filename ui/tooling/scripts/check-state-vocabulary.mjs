#!/usr/bin/env node
// 门禁：DOM 状态属性的写法收在一套词汇里。
//
// 皮肤层完全靠 data-* 选中状态，所以这些属性名与取值形态是对外契约的一部分：
// 拼成 data-isOpen、或者布尔属性时有时无地写成空串，使用者那条全局规则就会漏掉一半组件。
//
// 三条判据，都是当前已清零、纯防回归的：
// ① 属性名形态：一律小写连字符，不许驼峰或下划线。
// ② 布尔类状态一律走 dataAttr(...)：它把 false 编成 undefined（属性缺席）、true 编成空串，
//    手写的 `cond ? '' : undefined` 与它等价但绕开了单一出口，改语义时会漏掉。
// ③ 同一个属性名不得既当布尔又当枚举：那样 [data-x] 这条选择器会同时命中两种语义，
//    使用者写全局规则必然错一半。两种含义就取两个名字（列冻结叫 data-frozen，
//    表头吸顶才叫 data-sticky）。判据③只认得出「dataAttr 对上字面量枚举」这一种组合——
//    枚举值若由函数算出再经变量交进来（data-sticky 当初就是这样），静态看不出来，
//    得靠人工审计；它守的是照着别处复制粘贴写歪的那一类。
//
// 刻意不上的一条：ARIA↔data 配对检查会被展开助手（...rowState / ...itemStateAttrs）
// 大面积假阳性，要落地得先解析并内联同文件顶部的助手字面量。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const HEADLESS_SRC = 'packages/engine/headless/src'

/** 属性名形态：data- 之后一律小写字母数字，连字符只作分隔。 */
const RE_NAME_OK = /^data-[a-z0-9]+(?:-[a-z0-9]+)*$/
/** connect 里发射的 data-* 键，取单引号写法（本仓一律如此）。 */
const RE_DATA_KEY = /'(data-[A-Za-z0-9_-]+)'\s*:/g
/** 手写的布尔编码：三元的两支正好是空串与 undefined。 */
const RE_BARE_BOOL = /'(data-[a-z0-9-]+)'\s*:\s*[^,\n]*\?\s*''\s*:\s*undefined/g
/** 属性键与它的值表达式（到行尾或逗号为止）。 */
const RE_KEY_VALUE = /'(data-[a-z0-9-]+)'\s*:\s*([^,\n]+)/g
/** 本文件里由 dataAttr(...) 赋值的常量名，用来跟住经变量中转的布尔值。 */
const RE_BOOL_CONST = /const\s+([A-Za-z_$][\w$]*)\s*=\s*dataAttr\(/g
/** 枚举形态：值是字面量字符串，或三元的两支都是字面量字符串。 */
const RE_ENUM_VALUE = /^(?:'[a-z][a-z0-9-]*'|.*\?\s*'[a-z][a-z0-9-]*'\s*:\s*'[a-z][a-z0-9-]*')$/

function lineOf(source, index) {
  let line = 1
  for (let i = 0; i < index; i++) {
    if (source[i] === '\n') line++
  }
  return line
}

const problems = []
const vocabulary = new Map()
/** 属性名 → { bool: [出处], enum: [出处] }，用于判据③。 */
const shapes = new Map()
let files = 0

function noteShape(attr, shape, where) {
  if (!shapes.has(attr)) shapes.set(attr, { bool: [], enum: [] })
  shapes.get(attr)[shape].push(where)
}

const entries = await readdir(HEADLESS_SRC, { withFileTypes: true })
for (const entry of entries) {
  if (!entry.isDirectory()) continue
  let names
  try {
    names = await readdir(join(HEADLESS_SRC, entry.name))
  }
  catch {
    continue
  }
  for (const name of names) {
    if (!name.endsWith('.connect.ts')) continue
    const path = join(HEADLESS_SRC, entry.name, name)
    const source = await readFile(path, 'utf8')
    files++

    for (const match of source.matchAll(RE_DATA_KEY)) {
      const attr = match[1]
      vocabulary.set(attr, (vocabulary.get(attr) ?? 0) + 1)
      if (!RE_NAME_OK.test(attr)) {
        problems.push(`${path.replaceAll('\\', '/')}:${lineOf(source, match.index)} 的 ${attr} 不是小写连字符形态——状态属性名是对外契约，改成 data-xxx-yyy`)
      }
    }

    for (const match of source.matchAll(RE_BARE_BOOL)) {
      problems.push(`${path.replaceAll('\\', '/')}:${lineOf(source, match.index)} 的 ${match[1]} 手写了 \`? '' : undefined\`——改用 dataAttr(...)，布尔状态只留这一个出口`)
    }

    const posix = path.replaceAll('\\', '/')
    // 先收本文件里由 dataAttr 赋值的常量，值经它中转时仍算布尔形态
    const boolConsts = new Set([...source.matchAll(RE_BOOL_CONST)].map(m => m[1]))
    for (const match of source.matchAll(RE_KEY_VALUE)) {
      const value = match[2].trim().replace(/,$/, '')
      if (value === 'undefined') continue
      const where = `${posix}:${lineOf(source, match.index)}`
      if (value.includes('dataAttr(') || boolConsts.has(value)) noteShape(match[1], 'bool', where)
      else if (RE_ENUM_VALUE.test(value)) noteShape(match[1], 'enum', where)
    }
  }
}

/** 出处列表太长时只报前几个：少数派那一侧才是要改的地方，全打出来会把它淹掉。 */
function sample(list) {
  return list.length > 3 ? `${list.slice(0, 3).join('、')} 等 ${list.length} 处` : list.join('、')
}

for (const [attr, shape] of shapes) {
  if (!shape.bool.length || !shape.enum.length) continue
  problems.push(
    `${attr} 同时当布尔与枚举用——布尔 ${sample(shape.bool)}；枚举 ${sample(shape.enum)}。`
    + ` [${attr}] 这条选择器会同时命中两种语义，两种含义请各取一个名字（少数派那一侧改）`,
  )
}

if (problems.length) {
  console.error('[check-state-vocabulary] ✗ 状态属性写法出格：')
  for (const p of problems) console.error(`  ${p}`)
  process.exit(1)
}

console.log(`[check-state-vocabulary] 通过：${files} 份 connect · ${vocabulary.size} 种 data-* 属性，命名与布尔编码都在词汇内`)
