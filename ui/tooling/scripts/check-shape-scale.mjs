#!/usr/bin/env node
// 门禁：圆角只走语义档，不许直接下探到 primitive。
//
// 语义档四级：inset(4px 嵌在控件里的小标记) · control(6px 控件本体，以及尺寸接近控件的
// 小浮层——tooltip 那种一行字的气泡按这档走) · surface(8px 成面的浮层与卡片) ·
// pill(胶囊与圆点)。
//
// 这条是补出来的：审计时查到 20 份皮肤在 border-radius 上写 var(--xh-radius-sm|md|full)，
// 绕过整个语义层。原因不是谁偷懒，是语义层当时缺 4px 那一档——小内嵌方块没处可去，
// 于是各自下探。补齐 inset 之后把 26 处收回来，再用这条门禁钉住，免得下次又从 primitive 长出来。
//
// 允许的写法：--xh-shape-* / 组件槽 --xh-<comp>-* / 私有槽 --xh-_* / 0 / inherit / 百分比 / calc。
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const cssDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../packages/design/styles/css',
)

/** primitive 的圆角档，只该由语义层引用，皮肤不许直接点名。 */
const PRIMITIVE = /var\(\s*--xh-radius-[\w-]+/

const offenders = []
let scanned = 0
let checked = 0

for (const file of fs.readdirSync(cssDir).filter(f => f.endsWith('.css')).sort()) {
  scanned++
  const text = fs.readFileSync(path.join(cssDir, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  for (const line of text.split('\n')) {
    // 冒号后不写 \s*：它与 [^;]+ 能吃同一批字符，不匹配时会逐位回溯。值交给 trim 归一
    const m = line.match(/^\s*border(?:-\w+)?-radius:([^;]+);/)
    if (!m)
      continue
    checked++
    if (PRIMITIVE.test(m[1].trim()))
      offenders.push(`${file}: ${line.trim()}`)
  }
}

if (offenders.length > 0) {
  console.error('[check-shape-scale] ✗ 圆角直接用了 primitive，改走 --xh-shape-inset / control / surface / pill：')
  for (const o of offenders)
    console.error(`  ${o}`)
  process.exit(1)
}

console.log(`[check-shape-scale] 通过：${scanned} 份皮肤 · ${checked} 处圆角声明全部走语义档`)
