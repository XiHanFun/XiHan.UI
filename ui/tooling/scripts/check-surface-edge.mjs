#!/usr/bin/env node
// 门禁：根面的边界只由描边承担——三选一，不许阴影或淡底冒充边界。
//
// 真源 component-design.md §8.3：任何根面 / 主面只能取「描边 / 淡底 / 无壳」之一。
// 描边 = --xh-border-default（字段 --xh-border-control）描边 + surface 底 + 无影；
// 淡底 = --xh-bg-subtle + 透明占位边 + 无影；无壳 = 三者都不写。
// --xh-border-subtle / --xh-border-strong 只作内部分隔，不得出现在根面 border 简写里。
//
// 受管部件：root / content / panel / tree / viewport / source-panel / target-panel 的基础规则，
// 以及它们的 [data-variant='outline'|'subtle'|'ghost'] 分支。四条判据：
// ① border 颜色位（沿兜底链取最内层）不得是 --xh-border-subtle / --xh-border-strong；
// ② 同一块里 background 落 --xh-bg-subtle（或语气淡底）时 box-shadow 必须是 none；
// ③ ghost 分支不得画 border / background / box-shadow（transparent / none 占位不算画，分隔线的单边 border 除外）；
// ④ outline / 缺省分支的 border 颜色位必须是 border-default / material-solid-border /
//    border-control（字段）/ 浮层材质边（frosted / elevated），或淡底面的 transparent 占位边。
// 私有槽在赋值点判：颜色位只写 var(--xh-_x) 的，找同部件基础块 / 同 variant 块里的赋值再判。
//
// 存量登在 family-backlog.json 的 edge 段，命中即放行、不命中判过期，表只减不增。
import { openBacklog } from './lib/family-backlog.mjs'
import { colorPositionOf, conditional, innermost, partOf, readSkins, scopeOf, splitCompounds, splitSelectors } from './lib/skin-rules.mjs'

/** 真源 §8.3 管的根面 / 主面部件。 */
const MANAGED_PARTS = new Set(['root', 'content', 'panel', 'tree', 'viewport', 'source-panel', 'target-panel'])
/** 只作内部分隔的边色，根面 border 简写里不许出现。 */
const SEPARATOR_ONLY = new Set(['--xh-border-subtle', '--xh-border-strong'])
/** outline / 缺省分支允许的描边色。 */
const OUTLINE_BORDER = new Set([
  '--xh-border-default',
  '--xh-material-solid-border',
  '--xh-border-control',
  '--xh-material-frosted-border',
  '--xh-material-elevated-border',
])
/** 淡底面的底色。 */
const SUBTLE_BG = /^--xh-(?:bg-subtle|_tone-subtle|tone-subtle)$/
/** 真源 §8 登记的 soft 材质消费者：状态 chip 的描边是 soft 边。 */
const SOFT_CONSUMERS = new Set(['tag:root'])
/**
 * 真源 §8.4 登记的反白 compact frosted 面：--xh-material-frosted-border 是深色 14% 的透明边，压在反白深底上
 * 看不见，§8.1 要求的 1px 可见边界改由 on 色 20% 的 color-mix 承担。键 组件:部件，值是理由；
 * 登记了却没在描边位落 color-mix 的照样报过期。
 */
const INVERTED_COMPACT = {
  'tooltip:content': '反白 compact frosted，边取 on 色（--xh-_tooltip-on）20% 拼色',
}
/** 不画东西的取值：占位边、无底、无影。 */
const NOTHING = new Set(['transparent', 'none', '0', '0 0 0 transparent'])

const backlog = await openBacklog('edge', { owns: key => !key.endsWith(':raised') })
const problems = [...backlog.problems]
let managed = 0
/** INVERTED_COMPACT 里真被用来放行过的键：登了却没命中即过期。 */
const invertedSeen = new Set()

/** 受管分支：主体是受管部件，主体上除 scope / part 之外只允许一个 variant 属性。 */
function classify(branch, comp) {
  const compounds = splitCompounds(branch)
  const subject = compounds.at(-1) ?? ''
  const part = partOf(subject)
  if (!part || !MANAGED_PARTS.has(part))
    return null
  const scope = scopeOf(subject) ?? [...compounds].reverse().map(scopeOf).find(Boolean)
  if (scope && scope !== comp)
    return null
  const rest = subject
    .replace(/\[data-scope=['"]?[a-z0-9-]+['"]?\]/, '')
    .replace(/\[data-part=['"]?[a-z0-9-]+['"]?\]/, '')
  const variant = /^\[data-variant=['"]?(outline|subtle|ghost)['"]?\]$/.exec(rest)?.[1]
  if (rest !== '' && !variant)
    return null
  // 前面还有别的部件时是「某容器里的面」，那是容器下发的语境，不是这块面自己的基础规则
  if (compounds.length > 1 && !compounds.slice(0, -1).every(c => scopeOf(c) === comp && !partOf(c)))
    return null
  return { part, variant: variant ?? null }
}

for (const { comp, file, rules } of await readSkins()) {
  /** 受管块：{ rule, part, variant, three: { border, bg, shadow }, slots }。 */
  const blocks = []
  for (const rule of rules) {
    if (conditional(rule))
      continue
    for (const branch of splitSelectors(rule.selector)) {
      const hit = classify(branch, comp)
      if (!hit)
        continue
      const three = { border: null, bg: null, shadow: null }
      const slots = new Map()
      for (const decl of rule.decls) {
        if (decl.prop.startsWith('--xh-_')) {
          slots.set(decl.prop, decl.value)
          continue
        }
        if (decl.prop === 'border')
          three.border = colorPositionOf(decl.value)
        else if (decl.prop === 'border-color')
          three.border = decl.value
        else if (decl.prop === 'background' || decl.prop === 'background-color')
          three.bg = decl.value
        else if (decl.prop === 'box-shadow')
          three.shadow = decl.value
      }
      blocks.push({ rule, ...hit, three, slots })
      break
    }
  }

  // variant 分支常只改私有槽、由基础块消费：基础块某一件的最内层是这个槽时，分支里的赋值就是这一件的取值
  for (const block of blocks) {
    if (!block.variant)
      continue
    const base = blocks.find(b => b.part === block.part && b.variant === null)
    if (!base)
      continue
    for (const role of ['border', 'bg', 'shadow']) {
      if (block.three[role] != null || base.three[role] == null)
        continue
      const slot = innermost(base.three[role])
      if (block.slots.has(slot))
        block.three[role] = block.slots.get(slot)
    }
  }

  /** 把某一件的取值解到底：颜色位是私有槽时，到本块、同部件基础块与同 variant 块的赋值里找。 */
  function endOf(block, role) {
    const value = block.three[role]
    if (value == null)
      return null
    let token = innermost(value)
    for (let hops = 0; token.startsWith('--xh-_') && hops < 4; hops++) {
      const found = [block, ...blocks.filter(b => b !== block && b.part === block.part && (b.variant === block.variant || b.variant === null))]
        .find(b => b.slots.has(token))
      if (!found)
        return null
      token = innermost(found.slots.get(token))
    }
    return token
  }

  for (const block of blocks) {
    const { rule, part, variant } = block
    managed++
    const key = `${comp}:${part}${variant ? `:${variant}` : ''}`
    const where = `${file}:${rule.line}`
    const report = (message) => {
      if (!backlog.excuse(key))
        problems.push(`${where}  ${key}  ${message}`)
    }

    const border = endOf(block, 'border')
    const bg = endOf(block, 'bg')
    const shadow = endOf(block, 'shadow')

    // ③ 无壳：三件都不画
    if (variant === 'ghost') {
      for (const [role, token] of [['border', border], ['bg', bg], ['shadow', shadow]]) {
        if (token != null && !NOTHING.has(token))
          report(`ghost 分支画了 ${role}: ${token}——无壳面三件都不画，只允许分隔线`)
      }
      continue
    }

    const isSubtleBg = bg != null && SUBTLE_BG.test(bg)

    // ① 分隔色不上根面
    if (border && SEPARATOR_ONLY.has(border))
      report(`border 颜色位落在 ${border}——它只作内部分隔，根面描边用 --xh-border-default`)

    // ② 淡底面无影：本块没写阴影时按同部件基础块算
    if (isSubtleBg) {
      const effective = shadow ?? (variant ? endOf(blocks.find(b => b.part === part && b.variant === null) ?? block, 'shadow') : null)
      if (effective != null && !NOTHING.has(effective))
        report(`底色是 ${bg} 的淡底面却带 box-shadow: ${effective}——淡底面无影`)
    }

    // ④ 描边面的边色只能是 border-default 系
    if (border && !SEPARATOR_ONLY.has(border) && !OUTLINE_BORDER.has(border)) {
      if (border === 'transparent' && (isSubtleBg || variant === 'subtle'))
        continue
      // border: 0 / none 是不画边，不是描边面；transparent 占位边在底与影也都不画时同样什么都没画
      if (border === '0' || border === 'none')
        continue
      if (border === 'transparent' && (bg == null || NOTHING.has(bg)) && (shadow == null || NOTHING.has(shadow)))
        continue
      if (border === '--xh-material-soft-border' && SOFT_CONSUMERS.has(`${comp}:${part}`))
        continue
      if (`${comp}:${part}` in INVERTED_COMPACT && border.startsWith('color-mix(')) {
        invertedSeen.add(`${comp}:${part}`)
        continue
      }
      report(`${variant ?? '缺省'} 分支的 border 颜色位是 ${border}——描边面只能取 --xh-border-default / --xh-material-solid-border / --xh-border-control 或浮层材质边`)
    }
  }
}

problems.push(...backlog.stale())
for (const key of Object.keys(INVERTED_COMPACT)) {
  if (!invertedSeen.has(key))
    problems.push(`${key} 登在 INVERTED_COMPACT 里却没在描边位落 color-mix——反白登记过期了`)
}

if (problems.length) {
  console.error('[check-surface-edge] ✗ 根面边界没按三选一走：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('\n描边 = border-default + surface + 无影；淡底 = bg-subtle + 透明占位边 + 无影；无壳 = 三者都不写。存量登 family-backlog.json edge 段。')
  process.exit(1)
}

console.log(`[check-surface-edge] 通过：${managed} 块根面按三选一核过；backlog 待办 ${backlog.pending} 条，无过期豁免`)
