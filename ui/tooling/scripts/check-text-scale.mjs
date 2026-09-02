#!/usr/bin/env node
// 门禁：皮肤里的字号只走语义档，不许直接下探到 --xh-font-size-* 原语。
//
// 语义档：控件文字 --xh-control-font-sm/md/lg（与 --xh-control-h-* 同构，按尺寸档走）、
// 正文 --xh-text-body-size、标签 --xh-text-label-size、说明文字 --xh-text-caption-size、
// 标题 --xh-text-heading-1/2/3-size。皮肤直接点名原语，改「所有控件文字小一号」就得改几十份皮肤。
//
// 控件里的次级文字（提示、计数、快捷键、清空钮）走 --xh-control-caption-sm/md/lg，比同档主文字低一级。
//
// 扫所有引用了原语的声明：font-size 属性、私有槽赋值、calc 里的换算——原语先灌进私有槽再消费同样是下探。
// 允许：语义档 / 组件槽 --xh-<comp>-* / 私有槽 --xh-_* / inherit / em / % / 0 / calc 里只含上述。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { declarations, lineCounter, stripComments } from './lib/css-declarations.mjs'

const STYLES_DIR = 'packages/design/styles/css'

const PRIMITIVE = /var\(\s*--xh-font-size-[\w-]+/

/**
 * 字号不在文字档上的声明，连同理由。键写成「文件 属性名」。
 * 名单之外一律受管。
 */
const OFF_SCALE = {
  'typography.css --xh-_typography-h1': '排版组件的六级标题就是整条字号阶梯本身',
  'typography.css --xh-_typography-h2': '同上',
  'typography.css --xh-_typography-h3': '同上',
  'typography.css --xh-_typography-h4': '同上',
  'typography.css --xh-_typography-h5': '同上',
  'typography.css --xh-_typography-h6': '同上',
  'typography.css --xh-_typography-body-size': '排版组件的正文档位沿字号阶梯逐级走',
  'rating.css --xh-_rating-item-size': '星标是按 em 画的字形，三档尺寸取字号阶梯的三个相邻刻度',
}

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()
const problems = []
const usedOff = new Set()
let scanned = 0
let sized = 0

for (const file of files) {
  const src = stripComments(await readFile(join(STYLES_DIR, file), 'utf8'))
  const lineOf = lineCounter(src)
  for (const { prop, value, index } of declarations(src)) {
    scanned++
    if (prop === 'font-size' || prop === 'font')
      sized++
    if (!PRIMITIVE.test(value))
      continue
    const key = `${file} ${prop}`
    if (key in OFF_SCALE) {
      usedOff.add(key)
      continue
    }
    problems.push(`${file}:${lineOf(index)}  ${prop}: ${value}`)
  }
}

for (const key of Object.keys(OFF_SCALE)) {
  if (!usedOff.has(key))
    problems.push(`${key}：登在例外名单里，但它已经不下探原语了，删掉这条`)
}

if (problems.length) {
  console.error('[check-text-scale] ✗ 字号直接用了 --xh-font-size-* 原语，改走语义档：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('控件文字按尺寸档走 --xh-control-font-sm/md/lg；正文 --xh-text-body-size、标签 --xh-text-label-size、说明 --xh-text-caption-size、标题 --xh-text-heading-1/2/3-size。')
  process.exit(1)
}

console.log(`[check-text-scale] 通过：${files.length} 份皮肤 · 逐条扫过 ${scanned} 条声明（其中 ${sized} 处 font-size），没有直接下探原语的（例外 ${usedOff.size} 处）`)
