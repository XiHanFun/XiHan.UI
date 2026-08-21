#!/usr/bin/env node
// 门禁：皮肤里的层号只能来自层序令牌 --xh-layer-*，组件内部的相对堆叠除外。
//
// 裸层号绕开了层序这一处事实源：两个组件各写各的数字，谁盖谁只由数值大小决定，
// 而层序令牌一改，写死的那个不跟着走。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'

/**
 * 层号只在组件自己的堆叠上下文里比大小、不参与全局层序的皮肤，连同理由。
 * 名单之外的皮肤一律只许引层序令牌。
 */
const IN_COMPONENT_STACKING = {
  'avatar-group.css': '头像相互压边，靠悬停项抬一层盖住相邻头像',
  'button-group.css': '相邻段的边框重叠，靠悬停段抬一层盖住邻段边框',
  'heatmap.css': '行首那一列钉住时抬到格子之上，详情条再抬一层压住它，收在 root 自建的层叠上下文里',
  'image-viewer.css': '工具条压在图上，浮层内部的两层',
  'table.css': '粘性列抬到普通单元格之上，表内的列间层序',
  'thread.css': '回到底部的按钮压在消息之上，不依赖源序',
  'toggle-group.css': '条目的边框重叠与选中态抬升，组内三档',
  'watermark.css': '水印压在内容之上，容器内的两层',
}

/** 组件内堆叠允许的层号档位。 */
const SMALL = new Set(['0', '1', '2'])

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css'))
const problems = []
const usedWhitelist = new Set()
let tokenised = 0

for (const file of files) {
  const src = (await readFile(join(STYLES_DIR, file), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '')
  src.split(/\r?\n/).forEach((line, i) => {
    const m = line.match(/(?<!-)\bz-index\s*:\s*([^;}]+)/)
    if (!m)
      return
    const value = m[1].trim()
    const at = `${file}:${i + 1}  z-index: ${value}`
    if (/var\(\s*--xh-layer-/.test(value)) {
      tokenised++
      return
    }
    const numbers = value.match(/\d+/g) ?? []
    if (numbers.length === 0) {
      problems.push(`${at}  —— 既没引层序令牌，也不是层号`)
      return
    }
    if (numbers.some(n => n.length >= 3)) {
      problems.push(`${at}  —— 三位数层号一律走 --xh-layer-*`)
      return
    }
    if (!numbers.every(n => SMALL.has(n))) {
      problems.push(`${at}  —— 只有 0/1/2 算组件内堆叠，别的层号走 --xh-layer-*`)
      return
    }
    if (!(file in IN_COMPONENT_STACKING)) {
      problems.push(`${at}  —— 要么引 --xh-layer-*，要么把这份皮肤登进组件内堆叠名单并写明理由`)
      return
    }
    usedWhitelist.add(file)
  })
}

for (const file of Object.keys(IN_COMPONENT_STACKING)) {
  if (!files.includes(file))
    problems.push(`${file}：登在组件内堆叠名单里，但这份皮肤已经不在了`)
  else if (!usedWhitelist.has(file))
    problems.push(`${file}：登在组件内堆叠名单里，但它已经没有裸层号了，删掉这条`)
}

if (problems.length) {
  console.error('[check-raw-zindex] ✗ 皮肤里的层号没走层序令牌：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('层序只有 --xh-layer-* 一处事实源，写死的数字改令牌时不会跟着走。')
  process.exit(1)
}

console.log(`[check-raw-zindex] 通过：${files.length} 份皮肤 · ${tokenised} 处层号走层序令牌（另有 ${usedWhitelist.size} 份皮肤只做组件内堆叠）`)
