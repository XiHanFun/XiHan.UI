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

/**
 * 浮层族里「这把尺只挂在 root 上」的正当理由。
 *
 * 浮层被搬到 portal 落点后不再是 root 的后代，挂在 root 上的槽继承不过去。
 * 所以带 positioner 的皮肤必须把 --xh-icon-size 也声明在 content 或 positioner 上，
 * 除非它有意不让整档图标流进浮层。
 */
const PORTAL_EXEMPT = {
  'select': '浮层里的勾选标记有自己的指示符盒，换成整档图标会撑破它——图标只跟着盒那一侧换档',
  'popselect': '同 select：浮层里的勾选标记有自己的指示符盒',
  'side-nav': '折叠态弹出面板里没有兜底字形，也没有图标槽；根上这条只服务留在原地的行图标',
}

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()
const problems = []
const exemptSeen = new Set()
let wired = 0
let portaled = 0

for (const file of files) {
  const src = (await readFile(join(STYLES_DIR, file), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '')
  // 只看 mask 形态的字形（真图标）；必填星号那种文字 content 不在此列
  if (!/mask: var\(--xh-glyph-mark-/.test(src))
    continue
  if (!/--xh-icon-size\s*:/.test(src)) {
    problems.push(`${file}  画了兜底字形却没声明 --xh-icon-size，作者塞进来的 XhIcon 会落到 20px`)
    continue
  }
  // 浮层族：这把尺必须够得着被搬走的那一侧
  const name = file.replace(/\.css$/, '')
  if (src.includes('data-part=\'positioner\']')) {
    portaled += 1
    const reachable = [...src.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .some(([, selector, body]) => body.includes('--xh-icon-size:')
        && /data-part='(?:content|positioner)'\]/.test(selector))
    if (name in PORTAL_EXEMPT)
      exemptSeen.add(name)
    else if (!reachable)
      problems.push(`${file}  --xh-icon-size 只挂在 root 上，而浮层被搬到 portal 落点后继承不到它——作者塞进浮层的图标会落回 20px`)
  }
  else if (name in PORTAL_EXEMPT) {
    problems.push(`${file}  登记在 PORTAL_EXEMPT 里，但它已经没有 positioner 部件了`)
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

for (const name of Object.keys(PORTAL_EXEMPT)) {
  if (!exemptSeen.has(name))
    problems.push(`${name}.css  登记在 PORTAL_EXEMPT 里却没被扫到——名单过期了`)
}

console.log(`[check-icon-size] 通过：${wired} 份画兜底字形的皮肤都接了 --xh-icon-size，兜底盒与作者图标同一把尺；${portaled} 个浮层族里这把尺够得着被搬走的那一侧（有意不流进去的 ${exemptSeen.size} 个）`)
