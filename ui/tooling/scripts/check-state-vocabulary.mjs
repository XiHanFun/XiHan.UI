#!/usr/bin/env node
// 门禁：DOM 状态属性的写法收在一套词汇里。
//
// 皮肤层完全靠 data-* 选中状态，所以这些属性名与取值形态是对外契约的一部分：
// 拼成 data-isOpen、或者布尔属性时有时无地写成空串，使用者那条全局规则就会漏掉一半组件。
//
// 七条判据：
// ① 属性名形态：一律小写连字符，不许驼峰或下划线。
// ② 布尔类状态一律走 dataAttr(...)：它把 false 编成 undefined（属性缺席）、true 编成空串，
//    手写的 `cond ? '' : undefined` 与它等价但绕开了单一出口，改语义时会漏掉。
// ③ 同一个属性名不得既当布尔又当枚举：那样 [data-x] 这条选择器会同时命中两种语义，
//    使用者写全局规则必然错一半。两种含义就取两个名字（列冻结叫 data-frozen，
//    表头吸顶才叫 data-sticky）。判据③只认得出「dataAttr 对上字面量枚举」这一种组合——
//    枚举值若由函数算出再经变量交进来（data-sticky 当初就是这样），静态看不出来，
//    得靠人工审计；它守的是照着别处复制粘贴写歪的那一类。
//
// ④ data-state 的取值必须登记在 state-vocabulary.json 的某个族里，connect 的字面量与皮肤的选择器两头都查；
//    ARIA↔data 的配对也写在那份表里，供人照着配。
//
// 刻意不上的一条：ARIA↔data 配对的静态检查会被展开助手（...rowState / ...itemStateAttrs）
// 大面积假阳性，要落地得先解析并内联同文件顶部的助手字面量。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const HEADLESS_SRC = 'packages/engine/headless/src'
const STYLES_DIR = 'packages/design/styles/css'
const VOCAB_PATH = 'tooling/scripts/state-vocabulary.json'

/** 属性名形态：data- 之后一律小写字母数字，连字符只作分隔。 */
const RE_NAME_OK = /^data-[a-z0-9]+(?:-[a-z0-9]+)*$/
/** connect 里发射的 data-* 键，取单引号写法（本仓一律如此）。 */
const RE_DATA_KEY = /'(data-[\w-]+)'\s*:/g
/** 手写的布尔编码：三元的两支正好是空串与 undefined。 */
const RE_BARE_BOOL = /'(data-[a-z0-9-]+)'\s*:\s*(?:[^\s,][^,\n]*)?\?\s*''\s*:\s*undefined/g
/** 属性键与它的值表达式（到行尾或逗号为止）。 */
const RE_KEY_VALUE = /'(data-[a-z0-9-]+)'\s*:\s*([^,\n]+)/g
/** 本文件里由 dataAttr(...) 赋值的常量名，用来跟住经变量中转的布尔值。 */
const RE_BOOL_CONST = /const\s+([A-Za-z_$][\w$]*)\s*=\s*dataAttr\(/g
/** data-state 的值表达式：取到逗号或行尾，里面的字符串字面量逐个对词汇表。 */
const RE_STATE_LITERALS = /'data-state'\s*:\s*([^,\n]+)/g
/** 枚举形态：值是字面量字符串，或三元的两支都是字面量字符串。 */
const RE_ENUM_VALUE = /^(?:'[a-z][a-z0-9-]*'|.*\?\s*'[a-z][a-z0-9-]*'\s*:\s*'[a-z][a-z0-9-]*')$/

function lineOf(source, index) {
  let line = 1
  for (let i = 0; i < index; i++) {
    if (source[i] === '\n')
      line++
  }
  return line
}

const problems = []
const vocabulary = new Map()
/** 属性名 → { bool: [出处], enum: [出处] }，用于判据③。 */
const shapes = new Map()
/** 已读入的 connect 源码：posix 路径 → 内容，判据④复用。 */
const connectSources = []
let files = 0

function noteShape(attr, shape, where) {
  if (!shapes.has(attr))
    shapes.set(attr, { bool: [], enum: [] })
  shapes.get(attr)[shape].push(where)
}

const entries = await readdir(HEADLESS_SRC, { withFileTypes: true })
for (const entry of entries) {
  if (!entry.isDirectory())
    continue
  let names
  try {
    names = await readdir(join(HEADLESS_SRC, entry.name))
  }
  catch {
    continue
  }
  for (const name of names) {
    if (!name.endsWith('.connect.ts'))
      continue
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
    connectSources.push([posix, source])
    // 先收本文件里由 dataAttr 赋值的常量，值经它中转时仍算布尔形态
    const boolConsts = new Set([...source.matchAll(RE_BOOL_CONST)].map(m => m[1]))
    for (const match of source.matchAll(RE_KEY_VALUE)) {
      const value = match[2].trim().replace(/,$/, '')
      if (value === 'undefined')
        continue
      const where = `${posix}:${lineOf(source, match.index)}`
      if (value.includes('dataAttr(') || boolConsts.has(value))
        noteShape(match[1], 'bool', where)
      else if (RE_ENUM_VALUE.test(value))
        noteShape(match[1], 'enum', where)
    }
  }
}

/** 出处列表太长时只报前几个：少数派那一侧才是要改的地方，全打出来会把它淹掉。 */
function sample(list) {
  return list.length > 3 ? `${list.slice(0, 3).join('、')} 等 ${list.length} 处` : list.join('、')
}

for (const [attr, shape] of shapes) {
  if (!shape.bool.length || !shape.enum.length)
    continue
  problems.push(
    `${attr} 同时当布尔与枚举用——布尔 ${sample(shape.bool)}；枚举 ${sample(shape.enum)}。`
    + ` [${attr}] 这条选择器会同时命中两种语义，两种含义请各取一个名字（少数派那一侧改）`,
  )
}

// ④ data-state 的取值必须落在词汇真源的某个族里：connect 里的字面量与皮肤里的选择器两头都查。
//    族内互斥、族间不混用；新值先登记进 state-vocabulary.json 再用。
const vocab = JSON.parse(await readFile(VOCAB_PATH, 'utf8'))
const familyOf = new Map()
for (const [family, def] of Object.entries(vocab['data-state'])) {
  for (const value of def.values) {
    if (familyOf.has(value))
      problems.push(`state-vocabulary.json 里 ${value} 同时登记在 ${familyOf.get(value)} 与 ${family} 两个族——一个值只能属于一个族`)
    familyOf.set(value, family)
  }
}
for (const [aria, map] of Object.entries(vocab.aria)) {
  if (map.family !== null && !vocab['data-state'][map.family])
    problems.push(`state-vocabulary.json 里 ${aria} 指向的族 ${map.family} 不存在`)
}

// ⑥ 发了 aria-current 的节点，data 侧配对的是 data-current（steps 例外：它的 data-state 走 step 族）
// ⑦ 有开合交互（api 上有 setOpen）的组件，data-state 走 open / closed，不借派生显隐的 visible / hidden
for (const [path, source] of connectSources) {
  for (const getter of source.split(/\n\s{4}(?=get[A-Z]\w*Props\s*[:(])/)) {
    if (!/['"]aria-current['"]\s*:/.test(getter))
      continue
    if (/\/steps\//.test(path))
      continue
    if (!/['"]data-current['"]\s*:/.test(getter))
      problems.push(`${path} 里发 aria-current 的节点没配 data-current——当前项在 data 侧只用这一个名字`)
    if (/['"]data-(?:selected|active)['"]\s*:/.test(getter))
      problems.push(`${path} 里发 aria-current 的节点还在发 data-selected / data-active——当前项改 data-current`)
  }
  if (/\bsetOpen\b/.test(source) && /['"]data-state['"]\s*:[^,\n]*['"](?:visible|hidden)['"]/.test(source))
    problems.push(`${path} 有开合交互（setOpen）却把 data-state 发成 visible / hidden——改 open / closed`)
}

// ⑤ 退役的属性名不许再发
for (const [path, source] of connectSources) {
  for (const match of source.matchAll(RE_DATA_KEY)) {
    if (match[1] in vocab.retired)
      problems.push(`${path}:${lineOf(source, match.index)} 发了已退役的 ${match[1]}——${vocab.retired[match[1]]}`)
  }
}

for (const [path, source] of connectSources) {
  for (const match of source.matchAll(RE_STATE_LITERALS)) {
    for (const [, value] of match[1].matchAll(/'([a-z][a-z0-9-]*)'/g)) {
      if (!familyOf.has(value))
        problems.push(`${path}:${lineOf(source, match.index)} 给 data-state 发了词汇表外的值 ${value}——先在 tooling/scripts/state-vocabulary.json 登记进某个族`)
    }
  }
}

const skinFiles = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css'))
const consumed = new Set()
for (const file of skinFiles) {
  const css = (await readFile(join(STYLES_DIR, file), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '')
  for (const m of css.matchAll(/\[(data-[a-z0-9-]+)(?:=['"]([a-z0-9-]+)['"])?\]/g)) {
    consumed.add(m[1])
    if (m[1] === 'data-state' && m[2] && !familyOf.has(m[2]))
      problems.push(`${STYLES_DIR}/${file} 选了 [data-state='${m[2]}']，这个值不在词汇表里——没有 connect 会发它，这条规则永远不命中`)
  }
}

// 发射但零引用的属性只报不拦：其中一部分是数据载体（data-index / data-value），不是状态。
const unconsumed = [...vocabulary.keys()].filter(attr => !consumed.has(attr)).sort()

if (problems.length) {
  console.error('[check-state-vocabulary] ✗ 状态属性写法出格：')
  for (const p of problems) console.error(`  ${p}`)
  process.exit(1)
}

console.log(`[check-state-vocabulary] 通过：${files} 份 connect · ${vocabulary.size} 种 data-* 属性，命名与布尔编码都在词汇内；data-state 的 ${familyOf.size} 个取值分 ${Object.keys(vocab['data-state']).length} 个族`)
if (unconsumed.length)
  console.log(`  发射但没有皮肤引用的属性 ${unconsumed.length} 个（数据载体不必引用；状态类的要么接上要么删）：${unconsumed.join(' ')}`)
