#!/usr/bin/env node
// 门禁：禁用态的前景色令牌上不许再叠 opacity。
//
// fg-disabled 本身已经是低对比度的一档（浅色 2.59:1、深色 2.54:1），再叠 0.5 的不透明度
// 会把它压到 1.54:1 / 1.46:1——那已经是「看得见有东西、读不出是什么」。
// 颜色令牌与不透明度是两种表达禁用的手段，同时用只会互相抵消。
//
// 纯图形部件（渐变取色区、滑杆轨道、评分星星、填充式按钮）没有文字可读，
// 用 opacity 整体压暗是合理的，它们本来就不写 fg-disabled，天然不在这条规则里。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/styles'
const DISABLED_RULE = /([^{}]*(?:\[data-disabled\]|:disabled|\[aria-disabled=)[^{}]*)\{([^}]*)\}/g

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css'))
const problems = []

for (const file of files) {
  const src = await readFile(join(STYLES_DIR, file), 'utf8')
  for (const m of src.matchAll(DISABLED_RULE)) {
    const body = m[2]
    if (!/color:\s*var\(--xh-fg-disabled\)/.test(body))
      continue
    if (!/opacity:/.test(body))
      continue
    const selector = m[1].trim().replace(/\s+/g, ' ').slice(0, 70)
    problems.push(`${file}  ${selector}`)
  }
}

if (problems.length) {
  console.error('[check-disabled-contrast] ✗ 禁用态在 fg-disabled 之上又叠了 opacity：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('两者取其一：有文字的部件用 fg-disabled，纯图形部件用 opacity。')
  process.exit(1)
}

console.log(`[check-disabled-contrast] 通过：${files.length} 份皮肤的禁用态没有叠加不透明度`)
