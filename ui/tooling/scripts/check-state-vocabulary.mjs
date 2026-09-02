#!/usr/bin/env node
// 门禁：DOM 状态属性的写法收在一套词汇里。
//
// 皮肤层完全靠 data-* 选中状态，所以这些属性名与取值形态是对外契约的一部分：
// 拼成 data-isOpen、或者布尔属性时有时无地写成空串，使用者那条全局规则就会漏掉一半组件。
//
// 八条判据：
// ① 属性名形态：一律小写连字符，不许驼峰或下划线。
// ② 布尔类状态一律走 dataAttr(...)：它把 false 编成 undefined（属性缺席）、true 编成空串，
//    手写的 `cond ? '' : undefined` 与它等价但绕开了单一出口，改语义时会漏掉。
// ③ 同一个属性名不得既当布尔又当枚举：那样 [data-x] 这条选择器会同时命中两种语义，
//    使用者写全局规则必然错一半。两种含义就取两个名字（列冻结叫 data-frozen，
//    表头吸顶才叫 data-fixed）。判据③只认得出「dataAttr 对上字面量枚举」这一种组合——
//    枚举值若由函数算出再经变量交进来（表格那一对当初就是这样），静态看不出来，
//    得靠人工审计；它守的是照着别处复制粘贴写歪的那一类。
// ⑨ 一名多义的另一半：同一个属性名在两个组件里都是枚举、取值域却互不相交，
//    说明它在两处问的不是同一个问题（形态轴那种「同一个问题、各家自己的取值」不算）。
//    取值域两头收：connect 里的字面量，加上皮肤选择器里 [data-x='v'] 选中的值——
//    取值经变量中转的组件（'data-severity': severity）静态看不出字面量，皮肤那一头补得上。
//    判定为同一个问题的写进 state-vocabulary.json 的 enum 段，一句话说不清的即须拆名。
//
// ④ data-state 的取值必须登记在 state-vocabulary.json 的某个族里，connect 的字面量与皮肤的选择器两头都查；
//    ARIA↔data 的配对也写在那份表里，供人照着配。
// ⑧ 布尔状态属性的名字必须登记在同一份表的 boolean 段里，两头都查：发了没登记的即报，
//    登记了没人发的算名单过期。名字就是使用者那条 [data-xxx] 规则的入口，同一件事在两个
//    组件里取两个名字，规则只能命中一半；逼着新名字先与已有的比对一遍，比事后清点便宜。
//
// 刻意不上的一条：ARIA↔data 配对的静态检查会被展开助手（...rowState / ...itemStateAttrs）
// 大面积假阳性，要落地得先解析并内联同文件顶部的助手字面量。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const HEADLESS_SRC = 'packages/engine/headless/src'
const STYLES_DIR = 'packages/design/styles/css'
const VOCAB_PATH = 'tooling/scripts/state-vocabulary.json'

/**
 * 发 aria-current 但 data 侧不配 data-current 的组件，逐条写明由谁承担当前项语义。
 * 只豁免「必须配 data-current」这一条，同一处「不许再发 data-selected / data-active」照查。
 * 每条都要真被用来放行过一次，一次都没用上的会被下面的名单核验报出来。
 */
const ARIA_CURRENT_EXEMPT = {
  steps: '当前步由 data-state 的 step 族表达（current / completed / …），不另开 data-current',
}

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
/** 值表达式里的取值字面量，判据⑨拿它当取值域。 */
const RE_VALUE_LITERAL = /'([a-z][a-z0-9-]*)'/g
/** 选择器里按出现顺序扫 scope 限定与带值的属性，用来把取值归到组件名下。 */
const RE_SCOPE_OR_VALUE = /\[data-scope=['"]([a-z0-9-]+)['"]\]|\[(data-[a-z0-9-]+)=['"]([a-z0-9-]+)['"]\]/g

function lineOf(source, index) {
  let line = 1
  for (let i = 0; i < index; i++) {
    if (source[i] === '\n')
      line++
  }
  return line
}

/** 取出所有规则块的选择器串；@ 开头的前奏（@layer / @media / @supports）不是选择器。 */
function selectorLists(css) {
  const out = []
  let buf = ''
  for (const ch of css) {
    if (ch === '{') {
      const prelude = buf.trim()
      buf = ''
      if (prelude && !prelude.startsWith('@'))
        out.push(prelude)
      continue
    }
    if (ch === '}' || ch === ';') {
      buf = ''
      continue
    }
    buf += ch
  }
  return out
}

/** 按逗号切成一条条选择器，括号里的逗号不算分隔——:is(a, b) 是一条。 */
function splitSelectors(list) {
  const out = []
  let cur = ''
  let paren = 0
  for (const ch of list) {
    if (ch === '(')
      paren++
    if (ch === ')')
      paren--
    if (paren === 0 && ch === ',') {
      out.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }
  out.push(cur)
  return out.map(s => s.trim()).filter(Boolean)
}

const problems = []
/** 真的用来放行过的组件。 */
const ariaCurrentExemptSeen = new Set()
const vocabulary = new Map()
/** 属性名 → { bool: [出处], enum: [出处] }，用于判据③。 */
const shapes = new Map()
/** 属性名 → 组件名 → 取值集合，用于判据⑨。 */
const enumDomains = new Map()
/** 已读入的 connect 源码：posix 路径 → 内容，判据④复用。 */
const connectSources = []
let files = 0

function noteShape(attr, shape, where) {
  if (!shapes.has(attr))
    shapes.set(attr, { bool: [], enum: [] })
  shapes.get(attr)[shape].push(where)
}

function noteDomain(attr, component, values) {
  if (!enumDomains.has(attr))
    enumDomains.set(attr, new Map())
  const byComponent = enumDomains.get(attr)
  if (!byComponent.has(component))
    byComponent.set(component, new Set())
  for (const value of values)
    byComponent.get(component).add(value)
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
      if (value.includes('dataAttr(') || boolConsts.has(value)) {
        noteShape(match[1], 'bool', where)
      }
      else if (RE_ENUM_VALUE.test(value)) {
        noteShape(match[1], 'enum', where)
        noteDomain(match[1], entry.name, [...value.matchAll(RE_VALUE_LITERAL)].map(m => m[1]))
      }
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

// ⑥ 发了 aria-current 的节点，data 侧配对的是 data-current（例外见 ARIA_CURRENT_EXEMPT）
// ⑦ 有开合交互（api 上有 setOpen）的组件，data-state 走 open / closed，不借派生显隐的 visible / hidden
for (const [path, source] of connectSources) {
  for (const getter of source.split(/\n\s{4}(?=get[A-Z]\w*Props\s*[:(])/)) {
    if (!/['"]aria-current['"]\s*:/.test(getter))
      continue
    const comp = path.split('/').at(-2)
    const exempt = comp in ARIA_CURRENT_EXEMPT
    if (exempt)
      ariaCurrentExemptSeen.add(comp)
    if (!exempt && !/['"]data-current['"]\s*:/.test(getter))
      problems.push(`${path} 里发 aria-current 的节点没配 data-current——当前项在 data 侧只用这一个名字`)
    if (/['"]data-(?:selected|active)['"]\s*:/.test(getter))
      problems.push(`${path} 里发 aria-current 的节点还在发 data-selected / data-active——当前项改 data-current`)
  }
  if (/\bsetOpen\b/.test(source) && /['"]data-state['"]\s*:[^,\n]*['"](?:visible|hidden)['"]/.test(source))
    problems.push(`${path} 有开合交互（setOpen）却把 data-state 发成 visible / hidden——改 open / closed`)
}

for (const comp of Object.keys(ARIA_CURRENT_EXEMPT)) {
  if (!ariaCurrentExemptSeen.has(comp))
    problems.push(`${comp} 登记在 ARIA_CURRENT_EXEMPT 里却没被扫到——名单过期了`)
}

// ⑦ 布尔属性的名字两头对表：connect 发的必须登记，登记的必须有人发。
{
  const registered = new Set(Object.keys(vocab.boolean).filter(key => !key.startsWith('$')))
  const emitted = new Set()
  for (const [attr, shape] of shapes) {
    if (!shape.bool.length)
      continue
    emitted.add(attr)
    if (!registered.has(attr)) {
      problems.push(
        `${sample(shape.bool)} 发的布尔属性 ${attr} 没有登记——先在 ${VOCAB_PATH} 的 boolean 表里写明它是什么语义；`
        + ' 同一件事已经有名字的沿用旧名，别另起一个',
      )
    }
  }
  for (const attr of registered) {
    if (!emitted.has(attr))
      problems.push(`${VOCAB_PATH} 的 boolean 表里登着 ${attr}，却没有一处 connect 以 dataAttr(...) 发它——名单过期了`)
  }
}

// ⑤ 删掉的属性名不许再出现：同一件事重新分裂成两个名字，使用者那条规则就只能命中一半
for (const [path, source] of connectSources) {
  for (const match of source.matchAll(RE_DATA_KEY)) {
    if (match[1] in vocab.retired)
      problems.push(`${path}:${lineOf(source, match.index)} 发了已删掉的 ${match[1]}——${vocab.retired[match[1]]}`)
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

// ⑧ data-status 只属于「结果种类」那一轴：生命周期相位一律走 data-state 的 phase 族。
//    两义共用一个名字时，使用者写 [data-status='error'] 会同时命中结果种类与相位。
//    取值经变量中转的静态看不出来，只查字面量。
{
  const allowed = new Set(vocab['data-status'].values)
  for (const [path, source] of connectSources) {
    for (const match of source.matchAll(/'data-status'\s*:\s*([^,\n]+)/g)) {
      for (const [, value] of match[1].matchAll(/'([a-z0-9-]+)'/g)) {
        if (!allowed.has(value))
          problems.push(`${path} 给 data-status 发了 ${value}——这一轴只表达结果种类，相位走 data-state`)
      }
    }
  }
}

const skinFiles = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css'))
const consumed = new Set()
for (const file of skinFiles) {
  // 注释里的选择器不算数；换行留着，报错时的行号才对得上原文
  const css = (await readFile(join(STYLES_DIR, file), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, block => block.replace(/[^\n]/g, ' '))
  for (const m of css.matchAll(/\[(data-[a-z0-9-]+)(?:=['"]([a-z0-9-]+)['"])?\]/g)) {
    consumed.add(m[1])
    const at = `${STYLES_DIR}/${file}:${lineOf(css, m.index)}`
    if (m[1] in vocab.retired)
      problems.push(`${at} 选了已删掉的 ${m[1]}——${vocab.retired[m[1]]}，这条规则永远不命中`)
    if (m[1] === 'data-state' && m[2] && !familyOf.has(m[2]))
      problems.push(`${at} 选了 [data-state='${m[2]}']，这个值不在词汇表里——没有 connect 会发它，这条规则永远不命中`)
  }

  // 取值域的另一半来源：选择器里选中的值。scope 限定决定这个取值算哪个组件的，
  // 后代选择器没有自己的 scope 时沿用左边最近的那一个。
  for (const list of selectorLists(css)) {
    for (const selector of splitSelectors(list)) {
      let scope = null
      for (const m of selector.matchAll(RE_SCOPE_OR_VALUE)) {
        if (m[1]) {
          scope = m[1]
          continue
        }
        if (scope && vocabulary.has(m[2]))
          noteDomain(m[2], scope, [m[3]])
      }
    }
  }
}

// ⑨ 同一个属性名在两个组件里取值域互不相交＝它在两处问的不是同一个问题。
//    判定为同一个问题（形态、摆位这一类逐组件自定取值的轴）的登记进 enum 段，
//    登记项写清这个名字问的是什么；一句话说不清的就是一名多义，各取一个名字。
{
  const registered = new Set(Object.keys(vocab.enum).filter(key => !key.startsWith('$')))
  const seen = new Set()
  for (const [attr, byComponent] of enumDomains) {
    const domains = [...byComponent].filter(([, values]) => values.size >= 2)
    const disjoint = []
    for (let i = 0; i < domains.length; i++) {
      for (let j = i + 1; j < domains.length; j++) {
        const [oneName, oneValues] = domains[i]
        const [twoName, twoValues] = domains[j]
        if ([...oneValues].some(value => twoValues.has(value)))
          continue
        disjoint.push(`${oneName}（${[...oneValues].join(' / ')}）与 ${twoName}（${[...twoValues].join(' / ')}）`)
      }
    }
    if (!disjoint.length)
      continue
    seen.add(attr)
    if (registered.has(attr))
      continue
    problems.push(
      `${attr} 在这些组件里取值域互不相交：${sample(disjoint)}`
      + `——一个名字答两个问题，使用者看见 [${attr}] 猜不出选中的是什么。`
      + ` 两处问的是同一个问题就在 ${VOCAB_PATH} 的 enum 段登记这个名字问的是什么，`
      + '一句话说不清的即须各取一个说得清的名字',
    )
  }
  for (const attr of registered) {
    if (!seen.has(attr))
      problems.push(`${VOCAB_PATH} 的 enum 段登着 ${attr}，却没有哪两个组件的取值域互不相交——名单过期了，删掉这一行`)
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
