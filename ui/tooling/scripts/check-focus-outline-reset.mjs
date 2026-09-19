#!/usr/bin/env node
// 门禁：皮肤里不许在 `:focus:not(:focus-visible)` 下复位 outline。
//
// UA 只在 :focus-visible 画环，`:focus:not(:focus-visible)` 这条选择器下本来就没有环可关——
// 写在它下面的 outline 复位是死代码。死代码本身不碍事，碍事的是 `outline` 简写的副作用：
// 它把 outline-color 一并复位成初始值 currentColor（正文墨色，近黑），outline-style 复位成 none。
// 集合类条目由家族配方在根上画 outline 并把 outline-color 放进过渡（micro 时长），指针路径下
// 描边色恒为 transparent；指针划入条目时 Headless 把焦点搬到该条目，这条规则命中；划到下一条
// 时焦点离开、规则失效，outline-style 立即回到 solid，outline-color 却要从 currentColor 过渡回
// transparent——这几帧里上一条目画出一圈实心近黑描边。真发生过：全部下拉列表类组件划过条目时，
// 上一条目闪一圈黑边。
//
// 判据：皮肤里任一规则的任一选择器分支含 `:focus:not(:focus-visible)`（空白差异不论），
// 且声明了 outline / outline-style / outline-width / outline-color，判红。
// 指针落焦不画环由家族配方的描边槽与皮肤的 :focus-visible 规则负责，不靠这条选择器。
import { parseRules, readSkins, splitSelectors } from './lib/skin-rules.mjs'

const POINTER_FOCUS = /:focus:not\(\s*:focus-visible\s*\)/
const OUTLINE_PROPS = new Set(['outline', 'outline-style', 'outline-width', 'outline-color'])

const offenders = []

for (const skin of await readSkins()) {
  for (const rule of parseRules(skin.text)) {
    const branches = splitSelectors(rule.selector).filter(branch => POINTER_FOCUS.test(branch))
    if (!branches.length)
      continue
    const props = rule.decls.filter(decl => OUTLINE_PROPS.has(decl.prop.toLowerCase())).map(decl => decl.prop)
    if (!props.length)
      continue
    offenders.push(`${skin.file}:${rule.line}  ${branches.join(', ')}  →  ${props.join(', ')}`)
  }
}

if (offenders.length) {
  console.error('[check-focus-outline-reset] 皮肤在 :focus:not(:focus-visible) 下复位了 outline：')
  for (const offender of offenders)
    console.error(`  ${offender}`)
  console.error('  UA 只在 :focus-visible 画环，这条复位是死代码；outline 简写还会把 outline-color 复位成 currentColor，')
  console.error('  与家族配方的 outline-color 过渡叠加，焦点离开时闪出一圈近黑描边。整条规则删掉即可。')
  process.exit(1)
}

console.log('[check-focus-outline-reset] 通过：没有皮肤在 :focus:not(:focus-visible) 下复位 outline')
