#!/usr/bin/env node
// 门禁：布局属性只在登记过的地方做动画。
//
// 尺寸、内外边距、inset、网格轨道这类属性一动，浏览器每一帧都要重排，受影响的不止元素自己；
// 可合成的 translate / scale / rotate / opacity 与只触发重绘的 clip-path 才是动效的常规手段。
// 真需要动布局的只有少数几处：披露内容的高度、指示器与当前点的尺寸、侧栏让出内容区、
// 容器随内容增减高度。它们各有理由，逐条登记在 LAYOUT_EXCEPTIONS；新写一处布局动画，
// 要么改成可合成的写法，要么把理由登记进来。
//
// 扫两处：transition 列表（简写逐项与 transition-property 长写，皮肤与家族配方）里的布局属性，
// 键写「组件:部件:属性」，部件取规则选择器里最后一个 data-part；@keyframes 帧体里改动的布局属性，
// 键写「关键帧:属性」。登记了却没被扫到的键判过期。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { declarations, lineCounter, stripComments } from '../lib/css-declarations.mjs'

const STYLES_DIR = 'packages/design/styles/css'
const FAMILY_DIR = 'packages/design/styles/family'

/** 会触发重排的属性。 */
const LAYOUT = /^(?:(?:min-|max-)?(?:width|height|inline-size|block-size)|grid-template-(?:rows|columns)|padding(?:-[a-z-]+)?|margin(?:-[a-z-]+)?|inset(?:-[a-z-]+)?|top|right|bottom|left|flex|flex-basis|gap|row-gap|column-gap|border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?-width|font-size|line-height|letter-spacing|word-spacing)$/

const INDICATOR = '选中指示器：绝对定位的独立小元素，尺寸跟着当前项变，不推动其他元素'
const DOT = '当前点伸长：部件只有几像素大，重排范围只有它自己'
const DISCLOSURE = '披露内容的高度：grid-template-rows 0fr → 1fr 是唯一能过渡到内容真实高度的写法，内缩随之同步'

/** 允许做动画的布局属性，值写理由。 */
const LAYOUT_EXCEPTIONS = {
  'anchor:indicator:inline-size': INDICATOR,
  'anchor:indicator:block-size': INDICATOR,
  'navigation-menu:indicator:inline-size': INDICATOR,
  'navigation-menu:indicator:block-size': INDICATOR,
  'segmented:indicator:inline-size': INDICATOR,
  'segmented:indicator:block-size': INDICATOR,
  'tabs:indicator:inline-size': INDICATOR,
  'tabs:indicator:block-size': INDICATOR,
  'carousel:indicator:inline-size': DOT,
  'carousel:indicator:block-size': DOT,
  'tour:progress-dot:inline-size': DOT,
  'switch:thumb:inline-size': '开关滑块按下伸长：拇指是轨道里绝对定位的小件，伸长不推动轨道外的任何东西',
  'layout:sider:inline-size': '侧栏折叠必须让出内容区宽度：内容区跟着侧栏重排正是这个动作要表达的',
  'question-flow:viewport:block-size': '换题时视口随题目内容增减高度：下面的操作条要跟着挪到新位置',
  'toast:root:block-size': '轻提示叠放展开时卡片长回自己的高度：叠放区跟着撑开',
  'tour:spotlight:inline-size': '聚光框是 position: fixed 的独立框，跟着目标换位换尺寸，不在文档流里，不推动其他元素',
  'tour:spotlight:block-size': '聚光框是 position: fixed 的独立框，跟着目标换位换尺寸，不在文档流里，不推动其他元素',
  'tour:spotlight:inset-inline-start': '聚光框是 position: fixed 的独立框，跟着目标换位换尺寸，不在文档流里，不推动其他元素',
  'tour:spotlight:inset-block-start': '聚光框是 position: fixed 的独立框，跟着目标换位换尺寸，不在文档流里，不推动其他元素',
  'xh-disclosure-expand:grid-template-rows': DISCLOSURE,
  'xh-disclosure-expand:padding-block-start': DISCLOSURE,
  'xh-disclosure-expand:padding-block-end': DISCLOSURE,
  'xh-disclosure-collapse:grid-template-rows': DISCLOSURE,
  'xh-disclosure-collapse:padding-block-start': DISCLOSURE,
  'xh-disclosure-collapse:padding-block-end': DISCLOSURE,
}

/** 按顶层逗号切项。 */
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

/** 一项过渡动的是哪个属性：var(…) 之外的第一个标识符。 */
function animatedProp(item) {
  const head = item.replace(/var\([^()]*(?:\([^()]*\)[^()]*)*\)/g, ' ')
  return head.match(/(?<![\w-])([a-z][a-z0-9-]*)(?![\w-])/)?.[1] ?? null
}

/** 规则选择器里最后一个 data-part；没有部件的规则记作 root 之外的「组件本身」。 */
function partOf(selectors) {
  for (let i = selectors.length - 1; i >= 0; i--) {
    const parts = [...selectors[i].matchAll(/\[data-part=['"]?([\w-]+)['"]?\]/g)]
    if (parts.length)
      return parts[parts.length - 1][1]
  }
  return '*'
}

/** 所在的 @keyframes 名；不在关键帧里返回 null。 */
function keyframeOf(selectors) {
  for (const s of selectors) {
    const m = /^@keyframes\s+([\w-]+)/.exec(s)
    if (m)
      return m[1]
  }
  return null
}

const sources = [
  ...(await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort().map(f => ({ path: join(STYLES_DIR, f), label: f, comp: f.replace(/\.css$/, '') })),
  ...(await readdir(FAMILY_DIR)).filter(f => f.endsWith('.css')).sort().map(f => ({ path: join(FAMILY_DIR, f), label: `family/${f}`, comp: null })),
]

const problems = []
const seen = new Set()
let transitions = 0
let frames = 0

for (const { path, label, comp } of sources) {
  const css = stripComments(await readFile(path, 'utf8'))
  const lineOf = lineCounter(css)
  for (const d of declarations(css)) {
    const keyframe = keyframeOf(d.selectors)
    if (keyframe) {
      if (!LAYOUT.test(d.prop))
        continue
      frames++
      const key = `${keyframe}:${d.prop}`
      if (key in LAYOUT_EXCEPTIONS) {
        seen.add(key)
        continue
      }
      problems.push(`${label}:${lineOf(d.index)}  @keyframes ${keyframe} 里动了 ${d.prop}\n    —— 布局属性每帧都要重排：改用 translate / scale / opacity / clip-path，或把理由登记进 LAYOUT_EXCEPTIONS（键 ${key}）`)
      continue
    }
    if (d.prop !== 'transition' && d.prop !== 'transition-property')
      continue
    for (const item of splitTopLevel(d.value)) {
      const prop = animatedProp(item)
      if (!prop || !LAYOUT.test(prop))
        continue
      transitions++
      const key = `${comp ?? label}:${partOf(d.selectors)}:${prop}`
      if (key in LAYOUT_EXCEPTIONS) {
        seen.add(key)
        continue
      }
      problems.push(`${label}:${lineOf(d.index)}  transition 里有 ${prop}（${item}）\n    —— 布局属性每帧都要重排：改用 translate / scale / opacity / clip-path，或把理由登记进 LAYOUT_EXCEPTIONS（键 ${key}）`)
    }
  }
}

for (const key of Object.keys(LAYOUT_EXCEPTIONS)) {
  if (!seen.has(key))
    problems.push(`${key}  登记在 LAYOUT_EXCEPTIONS 里却没被扫到——名单过期了`)
}

if (problems.length) {
  console.error('[check-motion-layout] ✗ 布局属性做了动画：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(`[check-motion-layout] 通过：${transitions} 项布局属性过渡与 ${frames} 处关键帧里的布局属性全部登记在案（${Object.keys(LAYOUT_EXCEPTIONS).length} 条例外）`)
