#!/usr/bin/env node
// 门禁：交互态的底与字只从语义面派生，阶梯按承载面走。
//
// 真源 component-design.md §7.2 第 3 条：坐在 canvas / surface 白底上的控件 hover 落
// --xh-bg-subtle（100）→ pressed --xh-bg-subtle-hover（200）；坐在淡底容器（轨道、subtle 档容器）
// 里的控件 hover 200 → pressed --xh-bg-subtle-active（300）；300 只留给 pressed。承载面通过
// --xh-action-host-bg-hover / -pressed 向内下发，皮肤没给 host 槽赋值就是白底承载。
// 第 5 条：焦点边框一律 --xh-border-control-focus，不随 tone。第 8 条：hover / active / selected
// 从当前语义面派生，不切到无关颜色。
//
// 判据：
// ① 选择器含 :hover / :active / [data-pressed] / [data-highlighted] / [data-state='open'|'active'|'checked'|'on']
//    / [data-selected] / [aria-selected='true'] / [data-current] / [data-in-path] / [aria-pressed='true'] 的规则，
//    其 background(-color) / color（私有槽在赋值点判，兜底链看最内层）只允许 ALLOWED 列出的语义面；
// ② 阶梯：hover 落 200 档而这份皮肤没给 host 槽赋值即判红，hover 不得落 300；pressed 不得停在 100，
//    落 300 同样要求 host 槽；
// ③ :focus-visible / [data-focus] 规则的 border-color 必须是 --xh-border-control-focus，出现 --xh-_tone 即判红。
// 存量登 family-backlog.json ladder 段，键 组件:部件[:状态]，命中即放行、不命中判过期。
import { openBacklog } from './lib/family-backlog.mjs'
import { colorPositionOf, conditional, innermost, partOf, readSkins, scopeOf, splitCompounds, splitSelectors, topLevelTokens } from './lib/skin-rules.mjs'

/** 交互态选择器：主体或祖先带其中之一就是交互态规则。 */
const STATES = [
  [':hover', 'hover'],
  ['[data-highlighted]', 'hover'],
  [':active', 'pressed'],
  ['[data-pressed]', 'pressed'],
  ['[data-state=\'open\']', 'open'],
  ['[data-state=\'active\']', 'selected'],
  ['[data-state=\'checked\']', 'selected'],
  ['[data-state=\'on\']', 'selected'],
  ['[data-selected]', 'selected'],
  ['[aria-selected=\'true\']', 'selected'],
  ['[data-current]', 'selected'],
  ['[data-in-path]', 'open'],
  ['[aria-pressed=\'true\']', 'selected'],
]
/** 焦点规则。 */
const FOCUS = [':focus-visible', '[data-focus]', ':focus-within']

/** 交互态里 background / color 允许落的语义面。 */
const ALLOWED = [
  /^transparent$/,
  /^currentcolor$/i,
  /^inherit$/,
  /^none$/,
  /^--xh-bg-subtle(?:-hover|-active)?$/,
  /^--xh-bg-brand(?:-hover|-active)?$/,
  /^--xh-bg-brand-subtle(?:-hover|-active)?$/,
  /^--xh-bg-surface(?:-raised)?$/,
  /^--xh-bg-canvas$/,
  /^--xh-fg-on-brand(?:-subtle)?$/,
  /^--xh-fg-brand(?:-strong)?$/,
  /^--xh-fg-(?:default|muted|disabled)$/,
  /^--xh-fg-danger(?:-hover)?$/,
  /^--xh-_tone-[\w-]+$/,
  /^--xh-_action-[\w-]+$/,
  /^--xh-_collection-[\w-]+$/,
  /^--xh-_field-[\w-]+$/,
  /^--xh-action-host-bg-[\w-]+$/,
  /^--xh-material-[\w-]+$/,
  /^--xh-fg-scrollbar-thumb(?:-hover|-active)?$/,
]

/** color-mix 里每个 var() 都落在允许的语义面上时，混出来的仍是从语义面派生的；原语一进来就不是。 */
function derivedMix(value, resolve) {
  const m = /^color-mix\((.*)\)$/.exec(value)
  if (!m)
    return false
  const args = splitTopLevel(m[1]).slice(1)
  return args.length > 0 && args.every((arg) => {
    const color = topLevelTokens(arg)[0] ?? ''
    return ALLOWED.some(re => re.test(resolve(color)))
  })
}

/** 按顶层逗号切开。 */
function splitTopLevel(text) {
  const out = []
  let depth = 0
  let current = ''
  for (const ch of text) {
    if (ch === '(')
      depth++
    else if (ch === ')')
      depth--
    if (ch === ',' && depth === 0) {
      out.push(current.trim())
      current = ''
      continue
    }
    current += ch
  }
  out.push(current.trim())
  return out
}

/** 私有槽名里的角色：bg / surface 是底，fg / color 是字；边、影、环不在此列。 */
function slotRole(prop) {
  if (!prop.startsWith('--xh-_'))
    return null
  if (/border|shadow|ring|outline|stroke|width|size|gap|radius|opacity|glyph|icon|mark|check|rail|indicator-size/.test(prop))
    return null
  if (/(?:^|-)(?:bg|surface|background)(?:-|$)/.test(prop))
    return 'background'
  if (/(?:^|-)(?:fg|color)(?:-|$)/.test(prop))
    return 'color'
  return null
}

const backlog = await openBacklog('ladder')
const problems = [...backlog.problems]
let governed = 0

for (const { comp, file, rules } of await readSkins()) {
  /** 这份皮肤是否给承载面的 host 槽赋过值：有就是淡底容器，阶梯整体上抬一档。 */
  const hostSlot = rules.some(rule => rule.decls.some(d => /^--xh-action-host-bg-(?:hover|pressed)$/.test(d.prop)))
  /** 私有槽的全部赋值（名字 → 值列表），消费点只写私有槽时不判。 */
  const slotValues = new Map()
  for (const rule of rules) {
    for (const decl of rule.decls) {
      if (decl.prop.startsWith('--xh-_'))
        (slotValues.get(decl.prop) ?? slotValues.set(decl.prop, []).get(decl.prop)).push(decl.value)
    }
  }
  const resolve = (value) => {
    let token = innermost(value)
    for (let hops = 0; token.startsWith('--xh-_') && hops < 4; hops++) {
      const next = slotValues.get(token)?.[0]
      if (next == null)
        return token
      token = innermost(next)
    }
    return token
  }

  for (const rule of rules) {
    if (conditional(rule))
      continue
    for (const branch of splitSelectors(rule.selector)) {
      const compounds = splitCompounds(branch)
      const subject = compounds.at(-1) ?? ''
      const part = partOf(subject)
      if (!part)
        continue
      const scope = scopeOf(subject) ?? [...compounds].reverse().map(scopeOf).find(Boolean) ?? comp
      if (scope !== comp)
        continue
      const bare = branch.replace(/:not\([^)]*\)/g, '')
      const kinds = new Set(STATES.filter(([s]) => bare.includes(s)).map(([, kind]) => kind))
      const focused = FOCUS.some(s => bare.includes(s))
      if (kinds.size === 0 && !focused)
        continue
      const state = [...kinds].sort().join('+') || 'focus'
      const key = `${comp}:${part}:${state}`
      const where = `${file}:${rule.line}`
      const report = (message) => {
        if (!backlog.excuse(key))
          problems.push(`${where}  ${key}  ${message}`)
      }

      for (const decl of rule.decls) {
        const role = decl.prop === 'background' || decl.prop === 'background-color'
          ? 'background'
          : decl.prop === 'color'
            ? 'color'
            : slotRole(decl.prop)
        if (role && kinds.size > 0) {
          governed++
          const inner = innermost(decl.value)
          // 消费点只写私有槽：在赋值点判
          if (inner.startsWith('--xh-_') && !decl.prop.startsWith('--xh-_'))
            continue
          const token = decl.prop.startsWith('--xh-_') ? resolve(decl.value) : inner
          if (token.startsWith('--xh-_') && !ALLOWED.some(re => re.test(token)))
            continue
          if (!ALLOWED.some(re => re.test(token))) {
            if (derivedMix(token, resolve))
              continue
            report(`${decl.prop}: ${token}——交互态的${role === 'background' ? '底' : '字'}只从语义面派生（bg-subtle / brand / brand-subtle 阶梯、fg-default / muted / brand / on-brand、语气与配方槽）`)
            continue
          }
          if (role !== 'background')
            continue
          // ② 阶梯：只核中性 subtle 阶梯，brand 阶梯的档位由各自 -hover / -active 令牌表达
          const step = /^--xh-bg-subtle(?:-(hover|active))?$/.exec(token)
          if (!step)
            continue
          const level = step[1] === 'active' ? 300 : step[1] === 'hover' ? 200 : 100
          if (kinds.has('hover') && !kinds.has('pressed')) {
            if (level === 300)
              report(`hover 落 ${token}（300）——300 只留给 pressed`)
            else if (level === 200 && !hostSlot)
              report(`hover 落 ${token}（200），这份皮肤却没给 --xh-action-host-bg-* 赋值——白底承载 hover 是 --xh-bg-subtle（100），淡底容器由 host 槽下发`)
          }
          else if (kinds.has('pressed') && !kinds.has('hover')) {
            if (level === 100)
              report(`pressed 停在 ${token}（100）——pressed 要比 hover 高一档，白底承载是 --xh-bg-subtle-hover（200）`)
            else if (level === 300 && !hostSlot)
              report(`pressed 落 ${token}（300），这份皮肤却没给 --xh-action-host-bg-* 赋值——白底承载 pressed 是 --xh-bg-subtle-hover（200）`)
          }
        }
        // ③ 焦点边一律 --xh-border-control-focus
        if (focused && (decl.prop === 'border-color' || decl.prop === 'border' || /^--xh-_[\w-]*border[\w-]*$/.test(decl.prop))) {
          governed++
          const raw = decl.prop === 'border' ? colorPositionOf(decl.value) : decl.value
          if (/var\(--xh-_tone\b/.test(raw)) {
            report(`焦点边写了 ${decl.prop}: ${raw.slice(0, 60)}——焦点边框一律 --xh-border-control-focus，不随 tone`)
          }
          else {
            const token = resolve(raw)
            if (token.startsWith('--xh-') && !token.startsWith('--xh-_') && !['--xh-border-control-focus', '--xh-border-invalid', '--xh-ring-focus', '--xh-ring-invalid'].includes(token))
              report(`焦点边落 ${token}——焦点边框一律 --xh-border-control-focus`)
          }
        }
      }
      break
    }
  }
}

problems.push(...backlog.stale())

if (problems.length) {
  console.error('[check-state-ladder] ✗ 交互态没按承载面阶梯走：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('\n白底 hover 100 → pressed 200；淡底容器 hover 200 → pressed 300（host 槽下发）；焦点边 --xh-border-control-focus。存量登 family-backlog.json ladder 段。')
  process.exit(1)
}

console.log(`[check-state-ladder] 通过：${governed} 条交互态取值按语义面与阶梯核过；backlog 待办 ${backlog.pending} 条，无过期豁免`)
