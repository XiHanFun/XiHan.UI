#!/usr/bin/env node
// 门禁：聚焦环两层在皮肤里不被改写，关环的地方光环一并关掉、并登记谁来画焦点。
//
// 环画在元素外侧（设计真源 §7.2 第 5 条）：内圈 outline 偏移 --xh-ring-offset（0），贴着边框外沿；光环由公共层
// focus.css 以零特指度的 box-shadow 从边框外沿铺开（内圈色 30%）。两层都压在承载面上，与元素自己的面无关，
// 所以实心面上不换环色——库环 --xh-ring-focus 对页面与承载面成立，彩色面由墨色域把它换成墨色。
// 首尾相接的行与格（集合行、表格单元格、时间列、树行）内圈往里收（--xh-ring-offset-inset）、不画光环。
//
// 本份查四件：
//   一、不灌环色。皮肤给 --xh-_ring-color / outline-color 赋值，或在键盘聚焦规则里写 outline 简写时，环色只能
//       解到库环两支（--xh-ring-focus、--xh-ring-invalid）：可经组件覆盖槽（var(--xh-<组件>-…, …) 取兜底那一支）
//       或本份皮肤的私有槽（逐处赋值都得是库环）转一道。currentColor、前景色、底色、transparent 这类写法判红。
//       强制色、打印这类真实媒体条件块里的系统色不在此列。
//   二、库环令牌链上的名字（--xh-ring-focus / -invalid / -halo 及它们在 tokens.css 里解到底经过的每个名字）
//       皮肤里一律不许赋值：在子树上改了它们，库环在那棵子树上就不再是库环。
//   三、关环的键盘聚焦规则（outline: none / 0、outline-width: 0、outline-style: none）同一块里得写
//       --xh-_ring-halo: transparent：光环由公共层画，只关内圈会留下一圈没有内圈的光环。
//   四、关环要登记：每条关环规则按「组件 + 选择器」登在 focus-ring-surface-registry.json 的 ringless 里，写明环由
//       谁画、或为什么不画；登了却扫不到判过期，没写理由也判红。
//
// 键盘聚焦规则：:focus-visible、[data-focus]、裸 :focus（它包含键盘落焦）；`:focus:not(:focus-visible)` 关的是指针那一路，
// 不算。真实媒体条件只认 CONDITIONAL_MEDIA 那几种写法，写成别的样子的条件块按成立处理。
// 引了 field-chrome 家族的皮肤，家族规则按 control / input 两个部件摊进那份皮肤一起扫。
//
// `--update` 只把新扫到的关环规则落进 ringless，理由留空由人补，不删条目。
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { declarations, lineCounter, stripComments } from '../lib/css-declarations.mjs'

const SKINS = 'packages/design/styles/css'
const TOKENS = 'packages/design/tokens/tokens.css'
const REGISTRY = 'tooling/scripts/focus-ring-surface-registry.json'
const FIELD_FAMILY = 'packages/design/styles/family/field-chrome.css'

/** 库环：默认环、校验失败环与光环。环色只许解到前两支；三支连同解析链皮肤都不许赋值。 */
const LIBRARY_RINGS = ['--xh-ring-focus', '--xh-ring-invalid']
const RING_TOKENS = [...LIBRARY_RINGS, '--xh-ring-halo']

/** 光环的开关：关环的规则在同一块里写它，值为 transparent。 */
const HALO_SLOT = '--xh-_ring-halo'

/** 零长度：0 或带任意单位的 0。 */
const ZERO = /^0[a-z%]*$/i

/** outline 简写里的线型关键字与粗细关键字，不是颜色。 */
const OUTLINE_KEYWORD = /^(?:none|auto|hidden|solid|dashed|dotted|double|groove|ridge|inset|outset|thin|medium|thick|invert)$/i

/** 长度：数字带单位，或 calc()，或长度令牌。 */
const LENGTH = /^(?:-?(?:\d+(?:\.\d*)?|\.\d+)[a-z%]*|calc\(.*\)|var\(\s*--xh-(?:ring-width|stroke-[\w-]+)\s*\))$/i

/** 改环色的三条声明。 */
const RING_PROP = /^(?:--xh-_ring-color|outline-color|outline)$/

/**
 * 真实媒体条件：只在纸面、系统高对比、减动效偏好、粗指针设备或某个断点之上成立。
 * 只认这几种写法；写成别的样子的条件块静态判不出它什么时候不成立，按成立处理。
 */
const CONDITIONAL_MEDIA = [
  /^@media print$/,
  /^@media \(forced-colors: active\)$/,
  /^@media \(prefers-reduced-motion: reduce\)$/,
  /^@media \(prefers-contrast: more\)$/,
  /^@media \(pointer: coarse\)$/,
  /^@media \(min-width: \d+px\)$/,
]

/** 按顶层分隔符拆分，括号与方括号里的不拆。 */
function splitTop(text, isSep) {
  const out = []
  let depth = 0
  let start = 0
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '(' || ch === '[')
      depth++
    else if (ch === ')' || ch === ']')
      depth--
    else if (depth === 0 && isSep(ch)) {
      out.push(text.slice(start, i))
      start = i + 1
    }
  }
  out.push(text.slice(start))
  return out.map(s => s.trim()).filter(Boolean)
}

/** 组合子：空白与 > + ~。 */
const isCombinator = ch => ch === ' ' || ch === '\t' || ch === '\n' || ch === '>' || ch === '+' || ch === '~'

/** 属性存在但没写取值时占位。 */
const ANY = '\u0000any'

/** 取 `fn(` 开头表达式里与之配对的括号内容。 */
function inner(expr, start) {
  let depth = 0
  for (let i = start; i < expr.length; i++) {
    if (expr[i] === '(')
      depth++
    if (expr[i] === ')' && --depth === 0)
      return expr.slice(start + 1, i)
  }
  throw new Error(`括号不配对：${expr}`)
}

/**
 * 拆一段复合选择器：属性条件、data-part 的取值集合、`:not(…)` 排除掉的条件，
 * 以及除聚焦伪类外剩下的伪类。`:is(…)` 里的分支按属性逐键并集合并。
 * 与旧版判据同一套拆法，ringless 的键因此沿用。
 */
function parseCompound(text) {
  const attrs = new Map()
  const pseudos = []
  const nots = []
  const add = (key, value) => {
    if (!attrs.has(key))
      attrs.set(key, new Set())
    attrs.get(key).add(value)
  }
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (ch === '[') {
      const end = text.indexOf(']', i)
      const body = text.slice(i + 1, end)
      const m = /^([\w-]+)(?:\s*[~|^$*]?=\s*'([^']*)')?$/.exec(body)
      if (!m)
        return null
      add(m[1], m[2] ?? ANY)
      i = end + 1
      continue
    }
    if (ch === ':') {
      const name = /^::?([\w-]+)/.exec(text.slice(i))
      if (!name)
        return null
      let arg = null
      let next = i + name[0].length
      if (text[next] === '(') {
        arg = inner(text.slice(next), 0)
        next += arg.length + 2
      }
      if (name[1] === 'is' || name[1] === 'where') {
        const branches = splitTop(arg ?? '', c => c === ',').map(parseCompound)
        if (branches.includes(null))
          return null
        const keys = new Set(branches.flatMap(b => [...b.attrs.keys()]))
        const mergeable = branches.every(b => !b.pseudos.length) && [...keys].every(key => branches.every(b => b.attrs.has(key)))
        if (!mergeable) {
          pseudos.push(`${name[1]}(${arg})`)
        }
        else {
          for (const key of keys) {
            for (const b of branches) {
              for (const v of b.attrs.get(key)) add(key, v)
            }
          }
        }
      }
      else if (name[1] === 'not') {
        for (const branch of splitTop(arg ?? '', c => c === ',').map(parseCompound)) {
          if (branch && branch.attrs.size && !branch.pseudos.length)
            nots.push(branch)
        }
      }
      else if (!/^focus(?:-visible|-within)?$/.test(name[1])) {
        pseudos.push(arg === null ? name[1] : `${name[1]}(${arg})`)
      }
      i = next
      continue
    }
    i++
  }
  return { attrs, pseudos, nots }
}

/** 拆一条选择器分支：末尾那个复合是主语，前面的都是祖先（组合子一律按后代处理）。 */
function parseBranch(branch) {
  const compounds = splitTop(branch, isCombinator).map(parseCompound)
  if (compounds.includes(null) || !compounds.length)
    return null
  const subject = compounds[compounds.length - 1]
  const ancestors = compounds.slice(0, -1).filter(c => c.attrs.has('data-part') || c.attrs.has('data-scope'))
  return { subject, ancestors }
}

/** 一个复合的落点：scope 取唯一值时才算认得出。 */
function scopeOf(compound) {
  const scope = compound.attrs.get('data-scope')
  return scope && scope.size === 1 ? [...scope][0] : null
}

/** 把一个复合写回可读的样子；属性排序固定，登记表的键才稳。 */
function renderCompound(c) {
  const bits = []
  for (const key of [...c.attrs.keys()].sort()) {
    const vals = [...c.attrs.get(key)].sort()
    bits.push(vals[0] === ANY ? `[${key}]` : vals.length === 1 ? `[${key}='${vals[0]}']` : `[${key}=:is(${vals.join(',')})]`)
  }
  for (const n of [...c.nots].map(renderCompound).sort())
    bits.push(`:not(${n})`)
  for (const p of [...c.pseudos].sort())
    bits.push(`:${p}`)
  return bits.join('')
}

/** 把一条分支写成登记表的键。 */
function render(branch) {
  return [...branch.ancestors.map(renderCompound), renderCompound(branch.subject)].join(' ')
}

/** 这条规则的选择器栈：是不是 @keyframes 里的、是不是落在真实媒体条件里。 */
function classifyStack(selectors) {
  let keyframes = false
  let conditional = false
  for (const s of selectors) {
    if (!s.startsWith('@'))
      continue
    const prelude = s.replace(/\s+/g, ' ').trim()
    if (prelude.startsWith('@keyframes'))
      keyframes = true
    else if (CONDITIONAL_MEDIA.some(re => re.test(prelude)))
      conditional = true
  }
  return { keyframes, conditional }
}

/** 这条声明把环关了：outline 简写里带 none 或零宽，outline-width 为零，outline-style 为 none。 */
function turnsRingOff(prop, value) {
  const v = value.trim()
  if (prop === 'outline')
    return splitTop(v, ch => ch === ' ' || ch === '\t' || ch === '\n').some(tok => /^none$/i.test(tok) || ZERO.test(tok))
  if (prop === 'outline-width')
    return ZERO.test(v)
  if (prop === 'outline-style')
    return /^none$/i.test(v)
  return false
}

/** 这条声明里可能是环色的那几节：环色槽与 outline-color 整条算，outline 简写按顶层空白拆开、去掉线型与粗细。 */
function ringColorsOf(prop, value) {
  const v = value.trim()
  if (prop === '--xh-_ring-color' || prop === 'outline-color')
    return [v]
  if (prop === 'outline')
    return splitTop(v, ch => ch === ' ' || ch === '\t' || ch === '\n').filter(tok => !OUTLINE_KEYWORD.test(tok) && !LENGTH.test(tok))
  return []
}

/** 键盘聚焦规则：:focus-visible、[data-focus]、裸 :focus；`:focus:not(:focus-visible)` 关的是指针那一路，不算。 */
function isKeyboardFocus(selector) {
  return /:focus(?:-visible)?(?![\w-])|\[data-focus\]/.test(selector) && !/:not\(\s*:focus-visible\s*\)/.test(selector)
}

// —— 库环令牌链：tokens.css 里库环解到底经过的每个名字 —— //

/** 摘掉 @media 块：条件档里同样挂着根选择器，不摘会把只在根上声明的令牌换成系统色。 */
function dropMedia(src) {
  let out = ''
  let i = 0
  while (i < src.length) {
    const at = src.indexOf('@media', i)
    if (at === -1) {
      out += src.slice(i)
      break
    }
    out += src.slice(i, at)
    let depth = 0
    let j = src.indexOf('{', at)
    for (; j < src.length; j++) {
      if (src[j] === '{')
        depth++
      else if (src[j] === '}' && --depth === 0)
        break
    }
    i = j + 1
  }
  return out
}

/** 只认根与浅深两套主题块：墨色域把库环换成墨色，那一支不是皮肤该管的链。 */
const THEME_BLOCKS = [':where(:root)', ':where([data-theme=\'light\'])', ':where([data-theme=\'dark\'])']
const tokenValues = new Map()
for (const m of dropMedia(stripComments(await readFile(TOKENS, 'utf8'))).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  if (!m[1].split(',').map(branch => branch.trim()).some(branch => THEME_BLOCKS.includes(branch)))
    continue
  for (const d of m[2].matchAll(/(--xh-[a-z0-9_-]+):([^;]+);/g)) {
    if (!tokenValues.has(d[1]))
      tokenValues.set(d[1], new Set())
    tokenValues.get(d[1]).add(d[2].trim())
  }
}
const RING_CHAIN = new Set()
{
  const queue = [...RING_TOKENS]
  while (queue.length) {
    const name = queue.pop()
    if (RING_CHAIN.has(name))
      continue
    RING_CHAIN.add(name)
    for (const value of tokenValues.get(name) ?? []) {
      for (const ref of value.matchAll(/var\(\s*(--[\w-]+)/g))
        queue.push(ref[1])
    }
  }
}

// —— 扫皮肤 —— //

const fieldFamilyCss = await readFile(FIELD_FAMILY, 'utf8')

/** Family Recipe 用命名空间角色而非组件 anatomy：引了字段家族的皮肤，家族规则按 control / input 摊进来。 */
function materializeFieldFamily(comp, componentCss) {
  if (!/@import\s+['"]\.\.\/family\/field-chrome\.css['"]/.test(componentCss))
    return componentCss
  return `${fieldFamilyCss
    .replaceAll('[data-xh-field-chrome]', `[data-scope='${comp}'][data-part='control']`)
    .replaceAll('[data-xh-field-input]', `[data-scope='${comp}'][data-part='input']`)}\n${componentCss}`
}

const registry = JSON.parse(await readFile(REGISTRY, 'utf8'))
registry.ringless ??= {}

const problems = []
const ringless = []
let ringAssignments = 0
const files = (await readdir(SKINS)).filter(f => f.endsWith('.css')).sort()

for (const file of files) {
  const comp = file.replace(/\.css$/, '')
  const css = stripComments(materializeFieldFamily(comp, await readFile(join(SKINS, file), 'utf8')))
  const lineAt = lineCounter(css)
  const all = [...declarations(css)]
  /** 本份皮肤私有槽的每一处赋值：私有槽只在本份里连线，跨文件同名不连。 */
  const slots = new Map()
  /** 同一块（选择器栈相同）里的声明，关环那一条要在同块里找光环开关。 */
  const blocks = new Map()
  for (const d of all) {
    if (d.prop.startsWith('--xh-_'))
      (slots.get(d.prop) ?? slots.set(d.prop, []).get(d.prop)).push(d.value.trim())
    const block = d.selectors.join('\u0000')
    ;(blocks.get(block) ?? blocks.set(block, []).get(block)).push(d)
  }

  /** 环色取值是否只解到库环：组件覆盖槽取兜底那一支，本份私有槽逐处赋值都得是库环。 */
  const libraryOnly = (value, seen = new Set()) => {
    const v = value.trim()
    const m = /^var\(\s*(--[\w-]+)\s*(?:,([\s\S]*))?\)$/.exec(v)
    if (!m)
      return false
    const [, name, fallback] = m
    if (LIBRARY_RINGS.includes(name))
      return true
    if (name.startsWith('--xh-_')) {
      if (seen.has(name))
        return false
      seen.add(name)
      const assigned = slots.get(name) ?? []
      if (!assigned.length && fallback === undefined)
        return false
      return assigned.every(a => libraryOnly(a, seen)) && (fallback === undefined || libraryOnly(fallback, seen))
    }
    // 使用者覆盖槽：缺省走兜底那一支
    return fallback !== undefined && libraryOnly(fallback, seen)
  }

  for (const decl of all) {
    const prop = decl.prop.startsWith('--') ? decl.prop : decl.prop.toLowerCase()
    const value = decl.value.trim()
    const stack = classifyStack(decl.selectors)
    if (stack.keyframes)
      continue
    const at = `${file}:${lineAt(decl.index)}`
    if (RING_CHAIN.has(prop))
      problems.push(`${at} 皮肤里给 ${prop} 赋值（${value}）——库环令牌链上的名字只在 tokens.css 里声明，皮肤在子树上改它等于换掉库环`)
    if (stack.conditional)
      continue
    const raw = decl.selectors.filter(s => !s.startsWith('@')).join(' ')
    if (!raw)
      continue
    for (const branchText of splitTop(raw, ch => ch === ',')) {
      if (/::[\w-]+/.test(branchText))
        continue
      const keyboardFocus = isKeyboardFocus(branchText)
      const ringOff = turnsRingOff(prop, value)
      // 一、灌环色：环色槽与 outline-color 写在哪都算，outline 简写只认键盘聚焦规则里的
      if (RING_PROP.test(prop) && !ringOff && (prop !== 'outline' || keyboardFocus)) {
        ringAssignments++
        const colors = ringColorsOf(prop, value)
        if (colors.some(color => !libraryOnly(color)))
          problems.push(`${at} ${branchText.trim()} 的 ${prop}: ${value} 解不到库环——环画在元素外侧、压在承载面上，不随面换色；环色只写 var(--xh-ring-focus)（校验失败 var(--xh-ring-invalid)），可经覆盖槽或本份私有槽转一道`)
      }
      if (!(keyboardFocus && ringOff))
        continue
      const branch = parseBranch(branchText)
      if (!branch) {
        problems.push(`${at} ${branchText.trim()} —— 本脚本读不出这条关环规则的选择器，登不进 ringless`)
        continue
      }
      const key = `${scopeOf(branch.subject) ?? comp} ${render(branch)}`
      ringless.push({ at, key })
      // 三、关环同时关光环
      const block = blocks.get(decl.selectors.join('\u0000')) ?? []
      if (!block.some(d => d.prop === HALO_SLOT && d.value.trim() === 'transparent'))
        problems.push(`${at} ${branchText.trim()} 关了环却没关光环——同一块里补一条 ${HALO_SLOT}: transparent，不然公共层的光环还在画`)
    }
  }
}

// 四、关环要登记
if (process.argv.includes('--update')) {
  let added = 0
  for (const { key } of ringless) {
    if (!(key in registry.ringless)) {
      registry.ringless[key] = ''
      added++
    }
  }
  registry.ringless = Object.fromEntries(Object.entries(registry.ringless).sort(([a], [b]) => a.localeCompare(b)))
  await writeFile(REGISTRY, `${JSON.stringify(registry, null, 2)}\n`)
  console.log(`[check-focus-ring-surface] ringless 新增 ${added} 条（理由留空，由人补）`)
  process.exit(0)
}

const seen = new Set()
for (const { at, key } of ringless) {
  seen.add(key)
  if (!(key in registry.ringless))
    problems.push(`${at} ${key} 关了环却没登进 ringless——写明这一档的环由谁画（外框的 :focus-within、条目上的高亮、包一层的壳），或为什么不画`)
  else if (!registry.ringless[key])
    problems.push(`${key} 登在 ringless 里没写理由——补一句「这一档的环由谁画、或为什么不画」`)
}
for (const key of Object.keys(registry.ringless)) {
  if (!seen.has(key))
    problems.push(`${key} 登在 ringless 里，皮肤里已经没有这条关环规则了——名单过期，删掉这条`)
}

if (problems.length) {
  console.error('[check-focus-ring-surface] ✗ 聚焦环两层对不上：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}
console.log(
  `[check-focus-ring-surface] 通过：${files.length} 份皮肤 · ${ringAssignments} 条改环色的声明都解到库环，`
  + `库环令牌链 ${RING_CHAIN.size} 个名字皮肤里没有赋值；${ringless.length} 条关环规则都同时关了光环、逐条登在 ringless 里`,
)
