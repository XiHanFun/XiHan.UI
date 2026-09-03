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
import { declarations, lineCounter, stripComments } from './lib/css-declarations.mjs'

const cssDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../packages/design/styles/css',
)

/** primitive 的圆角档，只该由语义层引用，皮肤不许直接点名。 */
const PRIMITIVE = /var\(\s*--xh-radius-[\w-]+/

/** 简写、border-<side>-radius 与逻辑角长属性。 */
const RADIUS_PROP = /^border(?:-[\w-]+)?-radius$/
/** 私有槽赋值：原语先灌进私有槽再消费同样是下探。 */
const RADIUS_SLOT = /^--xh-_[\w-]*radius[\w-]*$/

/**
 * 圆角可以没有使用者覆盖槽的地方：形状本身就是这个部件的身份，换掉它就不是那个东西了。
 * 键写成「组件:部件[::伪元素]」。
 */
const NO_SLOT = {
  'radio-group:indicator::before': '单选圆点，圆是它的身份',
  'popconfirm:confirm-trigger::before': '转圈的加载环',
  'switch:thumb::after': '转圈的加载环',
  'download-trigger:root::before': '转圈的加载环',
  'clipboard:trigger::before': '转圈的加载环',
  'approval:footer::before': '转圈的加载环',
}

const offenders = []
const slotless = []
const noSlotSeen = new Set()
let scanned = 0
let checked = 0

for (const file of fs.readdirSync(cssDir).filter(f => f.endsWith('.css')).sort()) {
  scanned++
  const comp = file.replace(/\.css$/, '')
  const text = stripComments(fs.readFileSync(path.join(cssDir, file), 'utf8'))
  const lineOf = lineCounter(text)

  for (const { prop, value, index, selectors } of declarations(text)) {
    const isRadiusProp = RADIUS_PROP.test(prop)
    if (!isRadiusProp && !RADIUS_SLOT.test(prop))
      continue
    checked++

    if (PRIMITIVE.test(value)) {
      offenders.push(`${file}:${lineOf(index)}  ${prop}: ${value}`)
      continue
    }

    // 第二条判据：取语义档的圆角必须留一个使用者覆盖槽，同角色的部件在别处都有。
    // 私有槽赋值、inherit、显式取直角都不在此列——它们不是「可换的形状」
    if (!isRadiusProp || !value.startsWith('var(--xh-shape-'))
      continue
    const selector = selectors.at(-1) ?? ''
    const parts = [...selector.matchAll(/data-part='([a-z-]+)'/g)].map(x => x[1])
    const pseudo = /::(before|after)/.exec(selector)?.[1]
    const key = `${comp}:${parts.at(-1) ?? '?'}${pseudo ? `::${pseudo}` : ''}`
    if (key in NO_SLOT) {
      noSlotSeen.add(key)
      continue
    }
    slotless.push(`${file}:${lineOf(index)}  ${selector.replace(/\s+/g, ' ').trim().slice(0, 80)}  ${prop}: ${value}`)
  }
}

for (const key of Object.keys(NO_SLOT)) {
  if (!noSlotSeen.has(key))
    slotless.push(`${key}  登记在 NO_SLOT 里却没被扫到——名单过期了`)
}

if (offenders.length > 0) {
  console.error('[check-shape-scale] ✗ 圆角直接用了 primitive，改走 --xh-shape-inset / control / surface / pill：')
  for (const o of offenders)
    console.error(`  ${o}`)
  process.exit(1)
}

if (slotless.length > 0) {
  console.error('[check-shape-scale] ✗ 圆角没有使用者覆盖槽，同角色的部件在别的组件里都有：')
  for (const s of slotless)
    console.error(`  ${s}`)
  console.error('\n写成 var(--xh-<组件>-<部件>-radius, var(--xh-shape-…))；形状即身份的（圆点、加载环）登记进 NO_SLOT。')
  process.exit(1)
}

console.log(`[check-shape-scale] 通过：${scanned} 份皮肤 · ${checked} 处圆角声明全部走语义档，取语义档的都留了覆盖槽（形状即身份的 ${noSlotSeen.size} 处）`)
