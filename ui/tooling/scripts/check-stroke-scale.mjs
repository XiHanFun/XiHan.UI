#!/usr/bin/env node
// 门禁：描边宽度只走 --xh-stroke-*，皮肤里不许写字面像素。
//
// 边框算在尺寸里面（reset 对所有角色节点兜了 border-box），控件高度表是按 1px 描边算出来的；
// 描边宽度一旦在某份皮肤里写成字面 1px，把 --xh-stroke-thin 调成 1.5px 时那一处不跟，
// 相邻控件的可见高度就差半像素。合边算法（按钮组、分段控制器）同样依赖这一个数。
//
// 扫 border / border-<side> / border-block* / border-inline* / outline 简写里的宽度位，
// 以及 border-*-width / outline-width 长属性。允许：0 / var(--xh-stroke-*) / 组件槽 / 私有槽 /
// 令牌 --xh-ring-width（焦点环宽度另有一档）/ thin|medium|thick 关键字不在允许之列。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { declarations, lineCounter, stripComments } from './lib/css-declarations.mjs'

const STYLES_DIR = 'packages/design/styles/css'

/** 简写属性：值里第一个长度就是宽度位。 */
const SHORTHAND = /^(?:border(?:-(?:block|inline)(?:-(?:start|end))?|-(?:top|right|bottom|left))?|outline)$/
/** 长属性。 */
const LONGHAND = /^(?:border(?:-(?:block|inline)(?:-(?:start|end))?|-(?:top|right|bottom|left))?-width|outline-width)$/
/**
 * 宽度位允许的形态：0、描边令牌、焦点环宽、组件槽包着令牌、私有槽，以及把令牌按比例缩放的 calc
 * （图片裁切的取景框随缩放倍率反向缩，描边才在屏幕上恒为一像素）。装饰色条的宽度不是描边，走间距令牌。
 */
const OK_WIDTH = /^(?:0|var\(--xh-stroke-[\w-]+(?:,[^)]*)?\)|var\(--xh-ring-width\)|var\(--xh-[a-z0-9]+(?:-[a-z0-9]+)*,\s*var\(--xh-(?:stroke|ring|space)-[\w-]+\)\)|var\(--xh-_[\w-]+\)|calc\(var\(--xh-stroke-[\w-]+\)[^;]*\))$/
/** 字面像素或关键字。 */
const LITERAL = /^(?:(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em)|thin|medium|thick)$/

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()
const problems = []
let checked = 0

/** 从简写值里取宽度位：第一个形如长度、关键字或 var(…) 的 token。 */
function widthOf(value) {
  const tokens = []
  let depth = 0
  let cur = ''
  for (const ch of value.trim()) {
    if (ch === '(')
      depth++
    if (ch === ')')
      depth--
    if (ch === ' ' && depth === 0) {
      if (cur)
        tokens.push(cur)
      cur = ''
    }
    else {
      cur += ch
    }
  }
  if (cur)
    tokens.push(cur)
  return tokens.find(t => LITERAL.test(t) || /^var\(--xh-(?:stroke|ring|_)/.test(t) || /^var\(--xh-[\w-]+,\s*var\(--xh-(?:stroke|ring)/.test(t) || t === '0') ?? null
}

for (const file of files) {
  const src = stripComments(await readFile(join(STYLES_DIR, file), 'utf8'))
  const lineOf = lineCounter(src)
  for (const { prop, value, index } of declarations(src)) {
    let width = null
    if (LONGHAND.test(prop))
      width = value
    else if (SHORTHAND.test(prop))
      width = widthOf(value)
    if (width == null)
      continue
    if (/^none$/.test(width) || width === 'inherit' || width === 'transparent' || width === 'currentColor')
      continue
    checked++
    if (!OK_WIDTH.test(width))
      problems.push(`${file}:${lineOf(index)}  ${prop}: ${value}`)
  }
}

if (problems.length) {
  console.error('[check-stroke-scale] ✗ 描边宽度没走 --xh-stroke-*：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('改成 var(--xh-stroke-thin) / var(--xh-stroke-thick)，或经组件槽包一层；焦点环走 --xh-ring-width。')
  process.exit(1)
}

console.log(`[check-stroke-scale] 通过：${files.length} 份皮肤 · ${checked} 处描边宽度全部走令牌`)
