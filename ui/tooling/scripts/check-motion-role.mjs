#!/usr/bin/env node
// 门禁：几何类过渡按角色选曲线档，不许用色彩档。
//
// 规范 §8.2 选用表把 `--xh-motion-ease-enter` 判给「仅不透明度 / 底色 / 边框色变化」，
// 动位置、尺寸、缩放、旋转的过渡另有档位。check-motion-easing.mjs 只拦「下探原语 /
// 手写曲线 / 字面关键字」三类写法，判不出档位选错，本脚本补的就是这一条。
//
// 两档的分界按被动的属性算：
//   move  —— 元素被推到新位置或尺寸被推到新值（inset-* / inline-size / translate / transform…）→ continuous
//   shape —— 元素原地形变（scale / rotate）→ enter-strong；按压缩放的释放段走统一点击时间线的 release
//
// 逐项判，不逐条判：一条 transition 可以列多项，`inset-block-start` 与 `scale` 同列时两项各判各的。
//
// animation 另核两条：
//   关系 —— 浮层按锚定关系三分（规范 §9.5），登记在 OVERLAY_RELATION 里的组件，其 animation
//           引用的共享进出场关键帧只能是本关系那一对（RELATION_KEYFRAMES）；fade / disclosure
//           不表达锚定关系，不受限。共享关键帧住在 family/motion.css，关系表在 lib/keyframe-relations.mjs。
//   大尺度 —— 关键帧里动到 SLIDE_REQUIRED 登记的属性时，入场声明的曲线要走 --xh-motion-ease-slide；
//           退场按 §9.5 走 -exit，不在此列。关键帧体从本皮肤与它 @import 的家族文件里解。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { openBacklog } from './lib/family-backlog.mjs'

import { OVERLAY_RELATION, RELATION_KEYFRAMES, SHARED_RELATION } from './lib/keyframe-relations.mjs'

const STYLES_DIR = 'packages/design/styles/css'
const FAMILY_DIR = 'packages/design/styles/family'

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

/** 各角色要求的语义档。move 有两档，按位移的尺度分；shape 另允许统一点击时间线的 release 档（按压缩放的释放段）。 */
const REQUIRED = { move: ['--xh-motion-ease-continuous'], shape: ['--xh-motion-ease-enter-strong', '--xh-motion-ease-release'] }

/**
 * 位移以百分比或视口尺度计、或一端在可视区外的那些项，走 --xh-motion-ease-slide
 * 而不是 -continuous。键写成「组件:行内属性」，值写这一项为什么算大尺度。
 * 登记了却没被扫到的键会判红，名单不会悄悄过期。
 */
const SLIDE_REQUIRED = {
  'carousel:transform': '整页换位，位移量以百分比计',
  'layout:translate': '覆盖档的侧栏整条推出画外，位移量以自身宽度的百分比计',
  'drawer:translate': '面板从视口外整条推入，位移量以自身尺寸的百分比计（关键帧 xh-drawer-in-*）',
}

/**
 * 待办：已登记 SLIDE_REQUIRED 但实现尚未跟上的项，记在 family-backlog.json 的 motion 段，
 * 键与 SLIDE_REQUIRED 同形、逐条写理由。只减不增：不再违规的条目判过期；不在表里的违规照常判红。
 */
const slideBacklog = await openBacklog('motion')

/**
 * 逐项例外。键写成「组件:行内属性」，值写这一项为什么两档都不走。
 * 登记了却没被扫到的键会判红，名单不会悄悄过期。
 */
const ROLE_OVERRIDE = {
  'radio-group:scale': '圆点直径为指示器一半的小件落位，走 --xh-motion-ease-settle 的过冲收束，过冲量落在圈内不碰描边',
  'color-swatch-picker:scale': '压在色块正中的选中徽标落位，走 --xh-motion-ease-settle 的过冲收束，过冲量落在格内不碰描边',
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
const ANIMATION_DECL = /(?<![\w-])animation\s*:([^;{}]+)[;}]/g

/** 从 `{` 出发找到配对的 `}`。 */
function blockEnd(css, open) {
  let depth = 0
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{')
      depth++
    else if (css[i] === '}' && --depth === 0)
      return i
  }
  return css.length
}

/** 一份 CSS 里的关键帧：名字 → 帧体内动到的属性集合。 */
function keyframeProps(css) {
  const out = new Map()
  for (const m of css.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
    const open = m.index + m[0].length - 1
    const body = css.slice(open + 1, blockEnd(css, open))
    const props = new Set()
    for (const d of body.matchAll(/(?<![\w-])([a-z][a-z0-9-]*)\s*:/g))
      props.add(d[1])
    out.set(m[1], props)
  }
  return out
}

/** 一条 animation 声明引用的关键帧名：令牌名以 `--` 开头，用前置断言排掉。 */
function animationName(value) {
  return value.match(/(?<![-\w])(xh-[a-z0-9-]+)/)?.[1] ?? null
}

/** 皮肤 @import 的家族文件名。 */
function familyImports(css) {
  return [...css.matchAll(/^\s*@import\s+['"]\.\.\/family\/([\w-]+\.css)['"]\s*;/gm)].map(m => m[1])
}

const familyKeyframes = new Map()
for (const file of (await readdir(FAMILY_DIR)).filter(f => f.endsWith('.css')).sort())
  familyKeyframes.set(file, keyframeProps(stripComments(await readFile(join(FAMILY_DIR, file), 'utf8'))))

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()
const problems = [...slideBacklog.problems]
const seen = new Set()
const relationSeen = new Set()
let checked = 0
let animations = 0

for (const file of files) {
  const comp = file.replace(/\.css$/, '')
  const css = stripComments(await readFile(join(STYLES_DIR, file), 'utf8'))

  // 本皮肤能解到的关键帧：自己的 + @import 的家族文件里的
  const keyframes = new Map(keyframeProps(css))
  for (const family of familyImports(css)) {
    for (const [name, props] of familyKeyframes.get(family) ?? [])
      keyframes.set(name, props)
  }

  const relation = OVERLAY_RELATION[comp]
  for (const m of css.matchAll(ANIMATION_DECL)) {
    const line = css.slice(0, m.index).split('\n').length
    const value = m[1].replace(/\s+/g, ' ').trim()
    const name = animationName(value)
    if (!name)
      continue
    animations++
    const at = `${file}:${line}  animation: ${value}`

    // 关系判据：只核共享的进出场关键帧（fade / disclosure 不表达锚定关系）
    const nameRelation = SHARED_RELATION[name]
    if (relation && nameRelation && nameRelation in RELATION_KEYFRAMES) {
      relationSeen.add(comp)
      if (!RELATION_KEYFRAMES[relation].includes(name))
        problems.push(`${at}\n    —— ${comp} 的锚定关系是 ${relation}，只能用 ${RELATION_KEYFRAMES[relation].join(' / ')}，引用的 ${name} 属于 ${nameRelation}`)
    }

    // 大尺度判据：关键帧动到 SLIDE_REQUIRED 登记的属性，入场曲线要走 -slide；退场走 -exit 不核
    const ease = easeToken(value)
    if (ease === '--xh-motion-ease-exit')
      continue
    for (const prop of keyframes.get(name) ?? []) {
      const key = `${comp}:${prop}`
      if (!(key in SLIDE_REQUIRED))
        continue
      seen.add(key)
      if (ease === '--xh-motion-ease-slide')
        continue
      if (slideBacklog.excuse(key))
        continue
      problems.push(`${at}\n    —— 关键帧 ${name} 动到 ${prop}（${SLIDE_REQUIRED[key]}），入场曲线该走 --xh-motion-ease-slide，写的是 ${ease ?? '(无)'}`)
    }
  }

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
      const want = slide ? ['--xh-motion-ease-slide'] : REQUIRED[role]
      if (want.includes(ease))
        continue

      const at = `${file}:${line}  ${item}`
      if (!ease)
        problems.push(`${at}\n    —— 几何类过渡没写曲线，${role === 'move' ? '被推到新位置' : '原地形变'}要显式走 ${want.join(' / ')}`)
      else
        problems.push(`${at}\n    —— ${prop} 是${role === 'move' ? '位置/尺寸' : '形变'}类，曲线该是 ${want.join(' / ')}，写的是 ${ease}${ease === '--xh-motion-ease-enter' ? '（那一档只给不透明度与色彩）' : ''}`)
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
for (const key of Object.keys(slideBacklog.entries)) {
  if (!(key in SLIDE_REQUIRED))
    problems.push(`${key}  登记在 family-backlog.json 的 motion 段却不在 SLIDE_REQUIRED——待办只能是已登记规则的欠账`)
}
problems.push(...slideBacklog.stale())
for (const comp of Object.keys(OVERLAY_RELATION)) {
  if (!relationSeen.has(comp))
    problems.push(`${comp}  登记在 OVERLAY_RELATION 里却没有引用任何共享进出场关键帧——名单过期了`)
}

if (problems.length) {
  console.error('[check-motion-role] ✗ 几何类过渡的曲线档位选错：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(
  `[check-motion-role] 通过：${files.length} 份皮肤 · ${checked} 项几何类过渡各按角色走 -continuous / -enter-strong / -release（例外登记 ${seen.size} 处）`
  + ` · ${animations} 条 animation 里 ${relationSeen.size} 个浮层组件的进出场关键帧与锚定关系相符，大尺度待办 ${slideBacklog.pending} 处`,
)
