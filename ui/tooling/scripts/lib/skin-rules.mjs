// 家族门禁共用的皮肤拆解：按规则收声明、拆选择器分支、沿兜底链取最内层、私有槽按赋值点解。
//
// 家族门禁判的是「这一块面在这个状态下取了什么值」。值经常不是直接写的：
// 使用者槽包着语义令牌（var(--xh-card-bg, var(--xh-bg-surface))），或先灌进私有槽
// （--xh-_bg: …）再在别处消费。这里统一两条口径：
// ① 兜底链看最内层——使用者没覆盖时真正生效的那个值；
// ② 私有槽在赋值点判——消费点只写 var(--xh-_x) 的规则不判，找到它的每一处赋值再判。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { declarations, lineCounter, stripComments } from './css-declarations.mjs'

export const SKINS_DIR = 'packages/design/styles/css'
export const FAMILY_DIR = 'packages/design/styles/family'

/** 读一个目录下的全部皮肤：[{ comp, file, text, rules }]，按文件名排序。 */
export async function readSkins(dir = SKINS_DIR) {
  const files = (await readdir(dir)).filter(f => f.endsWith('.css')).sort()
  const out = []
  for (const file of files) {
    const text = stripComments(await readFile(join(dir, file), 'utf8'))
    out.push({ comp: file.replace(/\.css$/, ''), file, text, rules: parseRules(text) })
  }
  return out
}

/**
 * 把一份皮肤拆成规则：[{ selector, stack, line, decls: [{ prop, value, line }] }]。
 * selector 是最内层那条（`@layer` / `@media` 等留在 stack 里），同一块内的声明按出现顺序收；
 * 关键帧块里的 from / to / 百分比不是选择器，整块跳过。
 */
export function parseRules(text) {
  const lineOf = lineCounter(text)
  const rules = []
  let current = null
  for (const decl of declarations(text)) {
    const stack = decl.selectors
    if (stack.some(s => s.startsWith('@keyframes')))
      continue
    const block = text.lastIndexOf('{', decl.index)
    if (!current || current.block !== block) {
      current = {
        block,
        selector: (stack.at(-1) ?? '').replace(/\s+/g, ' ').trim(),
        stack,
        line: lineOf(decl.index),
        decls: [],
      }
      rules.push(current)
    }
    current.decls.push({ prop: decl.prop, value: decl.value.replace(/\s+/g, ' ').trim(), line: lineOf(decl.index) })
  }
  for (const rule of rules)
    delete rule.block
  return rules
}

/** 规则是否落在条件块（@media / @supports / @container）里；@layer 不算条件。 */
export function conditional(rule) {
  return rule.stack.some(s => s.startsWith('@') && !s.startsWith('@layer'))
}

/** 按顶层逗号拆选择器列表，`:is(a, b)` 括号里的逗号不是分隔符。 */
export function splitSelectors(selector) {
  const out = []
  let depth = 0
  let current = ''
  for (const ch of selector) {
    if (ch === '(' || ch === '[')
      depth++
    else if (ch === ')' || ch === ']')
      depth--
    if (ch === ',' && depth === 0) {
      out.push(current)
      current = ''
      continue
    }
    current += ch
  }
  out.push(current)
  return out.map(s => s.trim().replace(/\s+/g, ' ')).filter(Boolean)
}

/** 括号与方括号之外的空格与组合符才分隔复合体。 */
export function splitCompounds(branch) {
  const out = []
  let depth = 0
  let current = ''
  for (const ch of branch) {
    if (ch === '[' || ch === '(')
      depth++
    else if (ch === ']' || ch === ')')
      depth--
    if (depth === 0 && (ch === ' ' || ch === '>' || ch === '+' || ch === '~')) {
      if (current)
        out.push(current)
      current = ''
      continue
    }
    current += ch
  }
  if (current)
    out.push(current)
  return out
}

/** 选择器分支的主体（最后一个复合体）。 */
export function subjectOf(branch) {
  return splitCompounds(branch).at(-1) ?? ''
}

/** 复合体里的 data-part；没有返回 null。 */
export function partOf(compound) {
  return /\[data-part=['"]?([a-z0-9-]+)['"]?\]/.exec(compound)?.[1] ?? null
}

/** 复合体里的 data-scope；没有返回 null。 */
export function scopeOf(compound) {
  return /\[data-scope=['"]?([a-z0-9-]+)['"]?\]/.exec(compound)?.[1] ?? null
}

/** 分支主体所属的 scope：主体没写就沿用左侧最近一节写了的，都没写用 fallback。 */
export function subjectScope(branch, fallback) {
  const compounds = splitCompounds(branch)
  for (let i = compounds.length - 1; i >= 0; i--) {
    const scope = scopeOf(compounds[i])
    if (scope)
      return scope
  }
  return fallback
}

/** 分支主体上的伪元素（::before / ::after），没有返回 null。 */
export function pseudoOf(branch) {
  return /::(before|after)\b/.exec(subjectOf(branch))?.[1] ?? null
}

/** 值按顶层空格拆成段（括号里的空格不拆）。 */
export function topLevelTokens(value) {
  const out = []
  let depth = 0
  let current = ''
  for (const ch of value.trim()) {
    if (ch === '(')
      depth++
    else if (ch === ')')
      depth--
    if (depth === 0 && /\s/.test(ch)) {
      if (current)
        out.push(current)
      current = ''
      continue
    }
    current += ch
  }
  if (current)
    out.push(current)
  return out
}

/** 简写里的颜色位：`1px solid var(--xh-border-default)` → var(--xh-border-default)；取顶层最后一段。 */
export function colorPositionOf(value) {
  return topLevelTokens(value).at(-1) ?? value.trim()
}

/**
 * 沿兜底链取最内层：var(--xh-a, var(--xh-b, var(--xh-c))) → --xh-c；var(--xh-a, transparent) → transparent；
 * 不是 var() 的值原样返回（transparent / none / 0 / currentColor / 字面量）。
 * 值里有多段（`1px solid var(…)`）时只解最后一段——颜色位在简写末尾。
 */
export function innermost(value) {
  let expr = colorPositionOf(value)
  for (;;) {
    const m = /^var\(\s*(--[\w-]+)(?:\s*,([\s\S]*))?\)$/.exec(expr)
    if (!m)
      return expr.trim()
    if (m[2] == null)
      return m[1]
    expr = m[2].trim()
  }
}

/** 值里出现的全部 var() 名字（按出现顺序）。 */
export function varNames(value) {
  return [...value.matchAll(/var\(\s*(--[\w-]+)/g)].map(m => m[1])
}

/** 是否只引了私有槽（或使用者槽包着私有槽）：这类消费点在赋值点判，本处跳过。 */
export function onlyPrivateSlot(value) {
  return /^var\((?:--xh-[a-z0-9-]+,\s*var\()*--xh-_[\w-]+\)+$/.test(value.trim())
}

/**
 * 私有槽表：名字 → [{ value, selector, line, rule }]。私有槽 = `--xh-_…`。
 */
export function privateSlots(rules) {
  const map = new Map()
  for (const rule of rules) {
    for (const decl of rule.decls) {
      if (!decl.prop.startsWith('--xh-_'))
        continue
      if (!map.has(decl.prop))
        map.set(decl.prop, [])
      map.get(decl.prop).push({ value: decl.value, selector: rule.selector, line: decl.line, rule })
    }
  }
  return map
}

/**
 * 把一个值解到底：最内层是私有槽就沿赋值点继续解，返回全部可能的终值
 * [{ token, at: { selector, line, rule } | null }]。at 为 null 表示值直接写在消费点。
 * 解不到赋值点的私有槽（家族配方下发的 --xh-_action-* 之类）原样返回。
 */
export function resolveToEnd(value, slots, seen = new Set()) {
  const token = innermost(value)
  if (!token.startsWith('--xh-_') || seen.has(token))
    return [{ token, at: null }]
  const assignments = slots.get(token)
  if (!assignments?.length)
    return [{ token, at: null }]
  seen.add(token)
  const out = []
  for (const assignment of assignments) {
    for (const end of resolveToEnd(assignment.value, slots, seen))
      out.push({ token: end.token, at: end.at ?? { selector: assignment.selector, line: assignment.line, rule: assignment.rule } })
  }
  return out
}
