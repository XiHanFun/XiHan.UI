#!/usr/bin/env node
// 门禁：兜底字形与它所在的方框必须是两层，不能压在同一个伪元素上。
//
// 指示符类部件（勾选格、单选点、全选格）是「方框 + 字形」两层：方框画描边、底色、圆角，
// 字形用 mask 从令牌取轮廓。两层落在同一个元素上时，mask 会连着方框的描边与底色一起裁掉
// ——勾中之后剩下的不是「蓝方框里一枚白勾」，而是一枚孤零零的白勾，盒也从指示符尺寸
// 塌成字形尺寸。这种写法在浏览器里不会报错，只会静默画错，所以只能靠门禁拦。
//
// 多数派是真实节点当方框、它的 :empty::before 当字形；解剖里没有第二个节点时
// （全选格这类自己就是按钮的部件），用第二个伪元素补那一层：::before 画方框、
// ::after 画字形，::after 绝对定位叠上去。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'

/** 盒：同时写了描边或底色、又写了自己的宽度。 */
const RE_BOX_EDGE = /(?:^|;|\s)(?:border|background)\s*:/
const RE_BOX_SIZE = /(?:^|;|\s)inline-size\s*:/
/** 字形：用令牌里的图标当 mask。 */
const RE_GLYPH = /mask\s*:\s*var\(--xh-glyph-mark-/
/** 只看落在伪元素上的选择器——真实节点当方框时天然是两层，不在此列。 */
const RE_PSEUDO = /::(?:before|after)\s*$/
/** 状态限定：同一个伪元素在不同状态下的规则，归一后算同一个目标。 */
const RE_STATE = /\[data-(?:state|status|disabled|readonly|invalid|checked|selected|current|highlighted|hidden|empty|clearable|in-path|passed|collapsed|focus|loading|at-max)(?:[~^|*$]?=[^\]]*)?\]/g
const RE_PSEUDO_CLASS = /:(?:hover|focus|focus-visible|focus-within|active|empty|checked|first-child|last-child|not|is)\b/g

/**
 * 把一条选择器归一成「它作用在哪个伪元素上」：去掉状态限定与 :is() / :not() 包装，
 * 只留 scope + part + 伪元素。
 */
function targets(selector) {
  return selector
    .split(',')
    .map(part => part.trim())
    .filter(part => RE_PSEUDO.test(part))
    .map(part => part
      .replace(/:is\([^)]*\)/g, '')
      .replace(/:not\([^)]*\)/g, '')
      .replace(RE_STATE, '')
      .replace(RE_PSEUDO_CLASS, '')
      .replace(/\s+/g, ' ')
      .trim())
}

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()
const problems = []
let pseudoGlyphs = 0

for (const file of files) {
  const src = (await readFile(join(STYLES_DIR, file), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '')
  /** 伪元素目标 → { box: [选择器], glyph: [选择器] } */
  const roles = new Map()
  for (const [, selector, body] of src.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (selector.trim().startsWith('@'))
      continue
    const isBox = RE_BOX_EDGE.test(body) && RE_BOX_SIZE.test(body)
    const isGlyph = RE_GLYPH.test(body)
    if (!isBox && !isGlyph)
      continue
    for (const target of targets(selector)) {
      if (!roles.has(target))
        roles.set(target, { box: [], glyph: [] })
      if (isBox)
        roles.get(target).box.push(selector.replace(/\s+/g, ' ').trim())
      if (isGlyph)
        roles.get(target).glyph.push(selector.replace(/\s+/g, ' ').trim())
    }
  }
  for (const [target, role] of roles) {
    if (role.glyph.length)
      pseudoGlyphs += 1
    if (!role.box.length || !role.glyph.length)
      continue
    problems.push(
      `${file}  ${target}\n`
      + `      当方框：${role.box.join('\n              ')}\n`
      + `      当字形：${role.glyph.join('\n              ')}`,
    )
  }
}

if (problems.length) {
  console.error('[check-glyph-layer] ✗ 方框与字形压在同一个伪元素上：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  console.error('\nmask 会把该元素的描边与底色一并裁成字形轮廓，方框就此消失、盒也塌成字形尺寸。')
  console.error('::before 只留方框，字形另起一颗 ::after 绝对定位叠上去（见 checkbox-group / transfer 的全选格）。')
  process.exit(1)
}

console.log(`[check-glyph-layer] 通过：${files.length} 份皮肤 · ${pseudoGlyphs} 处画在伪元素上的兜底字形，都没有和方框挤在同一层`)
