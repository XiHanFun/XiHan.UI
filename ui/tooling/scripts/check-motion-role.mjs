#!/usr/bin/env node
// 门禁：几何类过渡按角色选曲线档，不许用色彩档。
//
// 规范 §8.2 选用表把 `--xh-motion-ease-enter` 判给「仅不透明度 / 底色 / 边框色变化」，
// 动位置、尺寸、缩放、旋转的过渡另有档位。check-motion-easing.mjs 只拦「下探原语 /
// 手写曲线 / 字面关键字」三类写法，判不出档位选错，本脚本补的就是这一条。
//
// 两档的分界按被动的属性算：
//   move  —— 元素被推到新位置或尺寸被推到新值（inset-* / inline-size / translate / transform…）→ continuous
//   shape —— 元素原地形变（scale / rotate）→ enter-strong
//
// 逐项判，不逐条判：一条 transition 可以列多项，`inset-block-start` 与 `scale` 同列时两项各判各的。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const STYLES_DIR = 'packages/design/styles/css'

/** 被推到新位置或新尺寸的属性。 */
const MOVE = new Set([
  'transform',
  'translate',
  'inset',
  'inset-block',
  'inset-inline',
  'inset-block-start',
  'inset-block-end',
  'inset-inline-start',
  'inset-inline-end',
  'top',
  'right',
  'bottom',
  'left',
  'inline-size',
  'block-size',
  'width',
  'height',
  'max-inline-size',
  'max-block-size',
  'min-inline-size',
  'min-block-size',
  'grid-template-rows',
  'grid-template-columns',
  'flex-basis',
  'margin-block-start',
  'margin-block-end',
  'margin-inline-start',
  'margin-inline-end',
])

/** 原地形变的属性。 */
const SHAPE = new Set(['scale', 'rotate'])

/** 各角色要求的语义档。move 有两档，按位移的尺度分。 */
const REQUIRED = { move: '--xh-motion-ease-continuous', shape: '--xh-motion-ease-enter-strong' }

/**
 * 位移以百分比或视口尺度计、或一端在可视区外的那些项，走 --xh-motion-ease-slide
 * 而不是 -continuous。键写成「组件:行内属性」，值写这一项为什么算大尺度。
 * 登记了却没被扫到的键会判红，名单不会悄悄过期。
 */
const SLIDE_REQUIRED = {
  'carousel:transform': '整页换位，位移量以百分比计',
}

/**
 * 逐项例外。键写成「组件:行内属性」，值写这一项为什么两档都不走。
 * 登记了却没被扫到的键会判红，名单不会悄悄过期。
 */
const ROLE_OVERRIDE = {
  'radio-group:scale': '圆点直径为指示器一半的小件落位，走 --xh-motion-ease-settle 的过冲收束，过冲量落在圈内不碰描边',
}

/** 去掉块注释但保留换行，报错行号才对得上源文件。 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ''))
}

/** 按顶层逗号切项：`var(--slot, var(--token))` 里的逗号不算分隔符。 */
function splitTopLevel(value) {
  const out = []
  let depth = 0
  let start = 0
  for (let i = 0; i < value.length; i++) {
    const ch = value[i]
    if (ch === '(') {
      depth++
    }
    else if (ch === ')') {
      depth--
    }
    else if (ch === ',' && depth === 0) {
      out.push(value.slice(start, i))
      start = i + 1
    }
  }
  out.push(value.slice(start))
  return out.map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean)
}

/** 一项过渡动的是哪个属性：`var(…)` 之外的第一个标识符。 */
function animatedProp(item) {
  const head = item.replace(/var\([^()]*(?:\([^()]*\)[^()]*)*\)/g, ' ')
  return head.match(/(?<![\w-])([a-z][a-z0-9-]*)(?![\w-])/)?.[1] ?? null
}

/** 一项实际生效的语义档：私有槽兜底时取兜底那支。 */
function easeToken(item) {
  const all = [...item.matchAll(/--xh-motion-ease-[\w-]+/g)].map(m => m[0])
  return all.length ? all[all.length - 1] : null
}

const TRANSITION_DECL = /(?<![\w-])transition\s*:([^;{}]+)[;}]/g

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()
const problems = []
const seen = new Set()
let checked = 0

for (const file of files) {
  const comp = file.replace(/\.css$/, '')
  const css = stripComments(await readFile(join(STYLES_DIR, file), 'utf8'))

  for (const m of css.matchAll(TRANSITION_DECL)) {
    const line = css.slice(0, m.index).split('\n').length
    for (const item of splitTopLevel(m[1])) {
      const prop = animatedProp(item)
      if (!prop)
        continue
      const role = MOVE.has(prop) ? 'move' : SHAPE.has(prop) ? 'shape' : null
      if (!role)
        continue
      checked++

      const key = `${comp}:${prop}`
      if (key in ROLE_OVERRIDE) {
        seen.add(key)
        continue
      }

      const ease = easeToken(item)
      const slide = role === 'move' && key in SLIDE_REQUIRED
      if (slide)
        seen.add(key)
      const want = slide ? '--xh-motion-ease-slide' : REQUIRED[role]
      if (ease === want)
        continue

      const at = `${file}:${line}  ${item}`
      if (!ease)
        problems.push(`${at}\n    —— 几何类过渡没写曲线，${role === 'move' ? '被推到新位置' : '原地形变'}要显式走 ${want}`)
      else
        problems.push(`${at}\n    —— ${prop} 是${role === 'move' ? '位置/尺寸' : '形变'}类，曲线该是 ${want}，写的是 ${ease}${ease === '--xh-motion-ease-enter' ? '（那一档只给不透明度与色彩）' : ''}`)
    }
  }
}

for (const key of Object.keys(ROLE_OVERRIDE)) {
  if (!seen.has(key))
    problems.push(`${key}  登记在 ROLE_OVERRIDE 里却没被扫到——名单过期了`)
}
for (const key of Object.keys(SLIDE_REQUIRED)) {
  if (!seen.has(key))
    problems.push(`${key}  登记在 SLIDE_REQUIRED 里却没被扫到——名单过期了`)
}

if (problems.length) {
  console.error('[check-motion-role] ✗ 几何类过渡的曲线档位选错：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(`[check-motion-role] 通过：${files.length} 份皮肤 · ${checked} 项几何类过渡各按角色走 -continuous / -enter-strong（例外登记 ${seen.size} 处）`)
