#!/usr/bin/env node
// 门禁：禁用态的前景色令牌上不许再叠 opacity。
//
// fg-disabled 本身已经是低对比度的一档（浅色 2.59:1、深色 2.54:1），再叠 0.5 的不透明度
// 会把它压到 1.54:1 / 1.46:1——那已经是「看得见有东西、读不出是什么」。
// 颜色令牌与不透明度是两种表达禁用的手段，同时用只会互相抵消。
//
// 两种叠法都查：同一条规则里既写 fg-disabled 又写 opacity；以及同一份皮肤里祖先部件的
// 禁用规则压了 opacity、后代部件的禁用规则又写 fg-disabled——后者隔着两条规则，
// 渲染出来同样是叠加。fg-disabled 经使用者槽包一层（var(--xh-<comp>-fg-disabled, var(--xh-fg-disabled))）
// 也算数。
//
// 纯图形部件（渐变取色区、滑杆轨道、评分星星、填充式按钮）没有文字可读，
// 用 opacity 整体压暗是合理的，它们本来就不写 fg-disabled，天然不在这条规则里。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'

const DISABLED_RULE = /([^{}]*(?:\[data-disabled\]|:disabled|\[aria-disabled=)[^{}]*)\{([^}]*)\}/g
/** 裸引与使用者槽包裹两种形态都算引了 fg-disabled。 */
const FG_DISABLED = /color:\s*var\((?:--xh-[a-z0-9-]+,\s*)*var\(--xh-fg-disabled\)|color:\s*var\(--xh-fg-disabled\)/
const PART = /\[data-part='([a-z-]+)'\]/

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css'))
const problems = []

for (const file of files) {
  const src = await readFile(join(STYLES_DIR, file), 'utf8')
  /** 本文件里禁用规则压了 opacity 的部件（祖先候选）。 */
  const dimmedParts = new Set()
  /** 本文件里禁用规则写了 fg-disabled 的部件。 */
  const fgParts = new Map()

  for (const m of src.matchAll(DISABLED_RULE)) {
    const selector = m[1].trim().replace(/\s+/g, ' ')
    const body = m[2]
    const hasFg = FG_DISABLED.test(body)
    const hasOpacity = /(?:^|[\s;])opacity:/.test(body)
    if (hasFg && hasOpacity) {
      problems.push(`${file}  ${selector.slice(0, 70)}  同一条规则里既写 fg-disabled 又压 opacity`)
      continue
    }
    const part = selector.match(PART)?.[1]
    if (!part)
      continue
    if (hasOpacity)
      dimmedParts.add(part)
    if (hasFg)
      fgParts.set(part, selector.slice(0, 70))
  }

  // 跨块叠加：root / control / item 这类容器部件压了 opacity，后代文字部件再写 fg-disabled。
  // label 不算后代：单体控件（checkbox / switch）的 label 是 root 的兄弟文字，各自表达禁用是对的
  if (dimmedParts.size && fgParts.size) {
    const containers = [...dimmedParts].filter(p => ['root', 'control', 'item', 'trigger', 'content'].includes(p))
    for (const [part, selector] of fgParts) {
      if (dimmedParts.has(part) || part === 'label')
        continue
      if (containers.length)
        problems.push(`${file}  ${selector}  写了 fg-disabled，而同文件 ${containers.join('/')} 的禁用规则已压 opacity，渲染出来是叠加`)
    }
  }
}

if (problems.length) {
  console.error('[check-disabled-contrast] ✗ 禁用态在 fg-disabled 之上又叠了 opacity：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('两者取其一：有文字的部件用 fg-disabled，纯图形部件用 opacity；容器压了 opacity 就别再给后代写 fg-disabled。')
  process.exit(1)
}

console.log(`[check-disabled-contrast] 通过：${files.length} 份皮肤的禁用态没有叠加不透明度（同块与跨块都查）`)
