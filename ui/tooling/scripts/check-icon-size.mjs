#!/usr/bin/env node
// 门禁：画了兜底字形的皮肤，必须把 --xh-icon-size 接上，且兜底字形的盒按它量。
//
// 指示符槽有两种内容：皮肤画的兜底字形（mask 令牌）与作者塞进来的 XhIcon。
// XhIcon 的尺寸读 --xh-icon-size（icon.css），没接线时落到 glyph-size-md = 20px，
// 而兜底字形是 1em（14px 上下）——作者一替换图标就跳 6px，还撑破 16px 的指示符盒。
// 接线后两者读同一把尺：皮肤 root（浮层族是 content）声明 --xh-icon-size，兜底盒也按它量。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()
const problems = []
let wired = 0

for (const file of files) {
  const src = (await readFile(join(STYLES_DIR, file), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '')
  // 只看 mask 形态的字形（真图标）；必填星号那种文字 content 不在此列
  if (!/mask: var\(--xh-glyph-mark-/.test(src))
    continue
  if (!/--xh-icon-size\s*:/.test(src)) {
    problems.push(`${file}  画了兜底字形却没声明 --xh-icon-size，作者塞进来的 XhIcon 会落到 20px`)
    continue
  }
  // 兜底盒必须按 --xh-icon-size 量
  for (const rule of src.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!/mask: var\(--xh-glyph-mark-/.test(rule[2]))
      continue
    const size = rule[2].match(/inline-size:([^;]+);/)?.[1]?.trim()
    if (!size || !/--xh-icon-size/.test(size))
      problems.push(`${file}  ${rule[1].replace(/\s+/g, ' ').trim().slice(0, 70)}  兜底字形的盒没按 --xh-icon-size 量（现在是 ${size ?? '没写'}）`)
  }
  wired++
}

if (problems.length) {
  console.error('[check-icon-size] ✗ 图标尺寸没接线：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('root（浮层族是 content）上写 --xh-icon-size: var(--xh-<comp>-icon-size, var(--xh-glyph-size-text))，兜底盒写 inline-size / block-size: var(--xh-icon-size, var(--xh-glyph-size-text))。')
  process.exit(1)
}

console.log(`[check-icon-size] 通过：${wired} 份画兜底字形的皮肤都接了 --xh-icon-size，兜底盒与作者图标同一把尺`)
