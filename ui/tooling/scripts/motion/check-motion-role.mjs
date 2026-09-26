#!/usr/bin/env node
// 门禁：几何类过渡按角色选曲线档与时长档，不许用色彩档。
//
// 动效曲线选用表把 `--xh-motion-ease-enter` 判给「仅不透明度 / 底色 / 边框色变化」，
// 动位置、尺寸、缩放、旋转的过渡另有档位。check-motion-easing.mjs 只拦「下探原语 /
// 手写曲线 / 字面关键字」三类写法，判不出档位选错，本脚本补的就是这一条。
//
// 曲线两档的分界按被动的属性算：
//   move  —— 元素被推到新位置或尺寸被推到新值（inset-* / inline-size / translate / transform / clip-path…）→ continuous
//   shape —— 元素原地形变（scale / rotate）→ enter-strong；按压缩放的释放段走统一点击时间线的 release
//
// 时长另核一条：几何类不许取 micro / enter / exit 三支。这三支在减弱动效下保留为淡变，
// 几何变化挂在它们上面，减弱档下照样会动；几何类取 move / nudge / expand / collapse / slide / press / release，
// 这几支在减弱档下是 1ms。时长核对连同家族配方与 transition-property 长写一起扫。
// 例外是进出场：过渡所在规则块里该属性的取值只由 --xh-motion-distance-* / -scale-* / -travel 驱动
// （可经本皮肤的私有槽转一道）时，减弱档下幅度归零、只剩淡变，照常取 enter / exit，
// 曲线随之取进出场那一对（退场 -exit，入场 -enter / -enter-strong）。
//
// 逐项判，不逐条判：一条 transition 可以列多项，`inset-block-start` 与 `scale` 同列时两项各判各的。
//
// 书写另核一条：transition 列表（简写与 transition-property 长写，皮肤与家族配方）只写长名。
// 简写会把同组的属性一起挂上过渡，计算样式里的 transition-property 也对不上真正在动的那一个；
// background 与 background-color 这类混写，同一种换面在不同皮肤里读出两种名字。
//
// animation 另核三条：
//   时长 —— 关键帧里的几何量写的是字面量（fr / % / deg / px…）而不是幅度令牌时，不许取 micro / enter / exit；
//           只由 --xh-motion-distance-* / --xh-motion-scale-* / --xh-motion-travel 驱动的出现类关键帧，
//           减弱档下幅度归零、只剩淡变，照常取 enter / exit。
//   关系 —— 浮层按锚定关系三分，登记在 OVERLAY_RELATION 里的组件，其 animation
//           引用的共享进出场关键帧只能是本关系那一对（RELATION_KEYFRAMES）；fade / disclosure
//           不表达锚定关系，不受限。共享关键帧住在 family/motion.css，关系表在 lib/keyframe-relations.mjs。
//   大尺度 —— 关键帧里动到 SLIDE_REQUIRED 登记的属性时，入场声明的曲线要走 --xh-motion-ease-slide；
//           退场走 -exit，不在此列。关键帧体从本皮肤与它 @import 的家族文件里解。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { openBacklog } from '../lib/family-backlog.mjs'

import { OVERLAY_RELATION, RELATION_KEYFRAMES, SHARED_RELATION } from '../lib/keyframe-relations.mjs'

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
  'clip-path',
  'stroke-dashoffset',
])

/** 原地形变的属性。 */
const SHAPE = new Set(['scale', 'rotate'])

/** 几何类不许取的时长：减弱动效下保留为淡变的三支。 */
const FADE_DURATIONS = new Set(['--xh-motion-duration-micro', '--xh-motion-duration-enter', '--xh-motion-duration-exit'])
const GEOMETRY_DURATIONS = 'move / nudge / expand / collapse / slide / press / release'
const ENTER_DURATION = '--xh-motion-duration-enter'
const EXIT_DURATION = '--xh-motion-duration-exit'

/** 进出场那一对几何过渡的曲线：退场走 -exit，入场走出现类的两档。 */
const APPEAR_EASE = {
  [ENTER_DURATION]: ['--xh-motion-ease-enter', '--xh-motion-ease-enter-strong'],
  [EXIT_DURATION]: ['--xh-motion-ease-exit'],
}

/** 各角色要求的语义档。move 有两档，按位移的尺度分；shape 另允许统一点击时间线的 release 档（按压缩放的释放段）。 */
const REQUIRED = { move: ['--xh-motion-ease-continuous'], shape: ['--xh-motion-ease-enter-strong', '--xh-motion-ease-release'] }

/**
 * 位移以百分比或视口尺度计、或一端在可视区外的那些项，走 --xh-motion-ease-slide
 * 而不是 -continuous。键写成「组件:行内属性」，值写这一项为什么算大尺度。
 * 登记了却没被扫到的键会判红，名单不会悄悄过期。
 */
const SLIDE_REQUIRED = {
  'carousel:translate': '整页换位，位移量以百分比计',
  'layout:translate': '覆盖档的侧栏整条推出画外，位移量以自身宽度的百分比计',
  'drawer:translate': '面板从视口外整条推入，位移量以自身尺寸的百分比计（关键帧 xh-slide-in）',
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
  'toast:scale': '叠放重排：往后一层的收拢比例与位移是同一次换位，随位移走 move + continuous，不是形变',
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

/** 一项实际生效的时长档：私有槽或组件槽兜底时取兜底那支。 */
function durationToken(item) {
  const all = [...item.matchAll(/--xh-motion-duration-[\w-]+/g)].map(m => m[0])
  return all.length ? all[all.length - 1] : null
}

const VAR_REF = /var\(\s*(--[\w-]+)/g
const AMPLITUDE_TOKEN = /^--xh-motion-(?:distance|scale|travel)(?:-[\w-]+)?$/

/**
 * 取值是否只由幅度令牌驱动：引用的自定义属性要么是 --xh-motion-distance-* / -scale-* / -travel，
 * 要么是本皮肤里每一处定义都只由它们驱动的私有槽；去掉引用后不剩字面几何量，且至少引用到一支幅度令牌。
 * 这样的几何量在减弱动效下归零，过渡剩下的只有淡变。
 */
function amplitudeOnly(value, css, seen = new Set()) {
  if (hasLiteralGeometry(value))
    return false
  let driven = false
  for (const [, name] of value.matchAll(VAR_REF)) {
    if (AMPLITUDE_TOKEN.test(name)) {
      driven = true
      continue
    }
    if (!name.startsWith('--xh-_') || seen.has(name))
      return false
    seen.add(name)
    const definitions = [...css.matchAll(new RegExp(`(?<![\\w-])${name}\\s*:([^;{}]+)[;}]`, 'g'))].map(d => d[1])
    if (!definitions.length || !definitions.every(d => amplitudeOnly(d, css, seen)))
      return false
    driven = true
  }
  return driven
}

/** 过渡声明所在规则块里，被过渡的那个属性的取值；块里没写返回 null。 */
function declaredValue(css, index, prop) {
  const open = css.lastIndexOf('{', index)
  const block = css.slice(open + 1, blockEnd(css, open))
  return block.match(new RegExp(`(?<![\\w-])${prop}\\s*:([^;{}]+)[;}]`))?.[1] ?? null
}

/**
 * 一项几何过渡是否属于进出场：时长取 enter / exit，且所在规则块里该属性的取值只由幅度令牌驱动。
 * 这样的过渡在减弱动效下只剩淡变，照常取进出场那一对时长与曲线。
 */
function appearing(css, index, prop, dur) {
  if (dur !== ENTER_DURATION && dur !== EXIT_DURATION)
    return false
  const value = declaredValue(css, index, prop)
  return value !== null && amplitudeOnly(value, css)
}

/** 去掉全部 `var(…)` 之后，取值里还剩带单位的数（fr / % / deg / px…），即字面几何量。 */
function hasLiteralGeometry(value) {
  const bare = value.replace(/var\([^()]*(?:\([^()]*(?:\([^()]*\)[^()]*)*\)[^()]*)*\)/g, ' ')
  return /(?:\d+(?:\.\d+)?|\.\d+)(?:fr|%|deg|turn|rad|px|r?em|v[wh]|lh)(?![\w-])/.test(bare)
}

const TRANSITION_DECL = /(?<![\w-])transition\s*:([^;{}]+)[;}]/g
const TRANSITION_PROPERTY_DECL = /(?<![\w-])transition-property\s*:([^;{}]+)[;}]/g

/** transition 列表里不许出现的简写 → 该写的长名。 */
const LONGHAND = {
  background: 'background-color',
  border: 'border-color',
  outline: 'outline-color',
}

/** 书写核对：transition 列表逐项只写长名。 */
function checkLonghand(label, css) {
  const out = []
  let count = 0
  for (const decl of [TRANSITION_DECL, TRANSITION_PROPERTY_DECL]) {
    for (const m of css.matchAll(decl)) {
      const line = css.slice(0, m.index).split('\n').length
      for (const item of splitTopLevel(m[1])) {
        const prop = animatedProp(item)
        if (!prop || prop === 'none')
          continue
        count++
        if (prop in LONGHAND)
          out.push(`${label}:${line}  ${item}\n    —— transition 列表写长名：${prop} 是简写，写 ${LONGHAND[prop]}`)
      }
    }
  }
  return { problems: out, count }
}
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

/** 一份 CSS 里的关键帧：名字 → 帧体内动到的属性集合，以及几何量是否写成字面量。 */
function keyframeProps(css) {
  const out = new Map()
  for (const m of css.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
    const open = m.index + m[0].length - 1
    const body = css.slice(open + 1, blockEnd(css, open))
    const props = new Set()
    let literal = false
    for (const d of body.matchAll(/(?<![\w-])([a-z][a-z0-9-]*)\s*:([^;{}]*)/g)) {
      props.add(d[1])
      if ((MOVE.has(d[1]) || SHAPE.has(d[1])) && hasLiteralGeometry(d[2]))
        literal = true
    }
    out.set(m[1], { props, literal })
  }
  return out
}

/**
 * 时长核对：几何类不许取 micro / enter / exit。
 * 扫 transition 简写的逐项、同一规则块里成对出现的 transition-property / transition-duration 长写，
 * 以及关键帧里写了字面几何量的 animation。只核时长，曲线档另有上面的逐项判据。
 */
function checkDurations(label, css, keyframes) {
  const out = []
  let count = 0
  const flag = (line, what, subject, dur) => out.push(
    `${label}:${line}  ${what}\n    —— ${subject}，时长该取 ${GEOMETRY_DURATIONS}，写的是 ${dur}：`
    + 'micro / enter / exit 在减弱动效下保留为淡变，挂在它们上面的几何变化会在减弱档下照样动起来',
  )
  const lineOf = index => css.slice(0, index).split('\n').length

  for (const m of css.matchAll(TRANSITION_DECL)) {
    for (const item of splitTopLevel(m[1])) {
      const prop = animatedProp(item)
      if (!prop || !(MOVE.has(prop) || SHAPE.has(prop)))
        continue
      count++
      const dur = durationToken(item)
      if (!FADE_DURATIONS.has(dur))
        continue
      if (appearing(css, m.index, prop, dur))
        continue
      flag(lineOf(m.index), item, `${prop} 是几何类`, dur)
    }
  }

  for (const m of css.matchAll(/(?<![\w-])transition-property\s*:([^;{}]+)[;}]/g)) {
    const open = css.lastIndexOf('{', m.index)
    const block = css.slice(open, blockEnd(css, open))
    const durations = splitTopLevel(block.match(/(?<![\w-])transition-duration\s*:([^;{}]+)[;}]/)?.[1] ?? '')
    if (!durations.length)
      continue
    splitTopLevel(m[1]).forEach((prop, i) => {
      if (!(MOVE.has(prop) || SHAPE.has(prop)))
        return
      count++
      const dur = durationToken(durations[i % durations.length])
      if (FADE_DURATIONS.has(dur))
        flag(lineOf(m.index), `transition-property: ${prop}`, `${prop} 是几何类`, dur)
    })
  }

  for (const m of css.matchAll(ANIMATION_DECL)) {
    for (const part of splitTopLevel(m[1])) {
      const name = animationName(part)
      const info = name ? keyframes.get(name) : null
      if (!info?.literal)
        continue
      count++
      const dur = durationToken(part)
      if (FADE_DURATIONS.has(dur))
        flag(lineOf(m.index), `animation: ${part}`, `关键帧 ${name} 动的是字面几何量`, dur)
    }
  }
  return { problems: out, count }
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
const familySources = new Map()
for (const file of (await readdir(FAMILY_DIR)).filter(f => f.endsWith('.css')).sort()) {
  const css = stripComments(await readFile(join(FAMILY_DIR, file), 'utf8'))
  familySources.set(file, css)
  familyKeyframes.set(file, keyframeProps(css))
}

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()
const problems = [...slideBacklog.problems]
const seen = new Set()
const relationSeen = new Set()
let checked = 0
let animations = 0
let durationChecked = 0
let longhandChecked = 0

for (const [file, css] of familySources) {
  const result = checkDurations(`family/${file}`, css, familyKeyframes.get(file))
  problems.push(...result.problems)
  durationChecked += result.count
  const longhand = checkLonghand(`family/${file}`, css)
  problems.push(...longhand.problems)
  longhandChecked += longhand.count
}

for (const file of files) {
  const comp = file.replace(/\.css$/, '')
  const css = stripComments(await readFile(join(STYLES_DIR, file), 'utf8'))

  // 本皮肤能解到的关键帧：自己的 + @import 的家族文件里的
  const keyframes = new Map(keyframeProps(css))
  for (const family of familyImports(css)) {
    for (const [name, info] of familyKeyframes.get(family) ?? [])
      keyframes.set(name, info)
  }

  const durations = checkDurations(file, css, keyframes)
  problems.push(...durations.problems)
  durationChecked += durations.count
  const longhand = checkLonghand(file, css)
  problems.push(...longhand.problems)
  longhandChecked += longhand.count

  const relation = OVERLAY_RELATION[comp]
  /** 一段动画：自己的关键帧、时长与曲线。一条 animation 并列几段时逐段核。 */
  const checkAnimation = (line, part) => {
    const value = part.replace(/\s+/g, ' ').trim()
    const name = animationName(value)
    if (!name)
      return
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
      return
    for (const prop of keyframes.get(name)?.props ?? []) {
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
  for (const m of css.matchAll(ANIMATION_DECL)) {
    const line = css.slice(0, m.index).split('\n').length
    for (const part of splitTopLevel(m[1]))
      checkAnimation(line, part)
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
      const dur = durationToken(item)
      const want = appearing(css, m.index, prop, dur)
        ? APPEAR_EASE[dur]
        : slide ? ['--xh-motion-ease-slide'] : REQUIRED[role]
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
  console.error('[check-motion-role] ✗ 过渡的曲线、时长档位或书写不对：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(
  `[check-motion-role] 通过：${files.length} 份皮肤 · ${checked} 项几何类过渡各按角色走 -continuous / -enter-strong / -release（例外登记 ${seen.size} 处）`
  + ` · ${durationChecked} 处几何类时长（含家族配方、长写与字面几何量的关键帧）都不取 micro / enter / exit`
  + ` · ${longhandChecked} 项过渡都写长名`
  + ` · ${animations} 条 animation 里 ${relationSeen.size} 个浮层组件的进出场关键帧与锚定关系相符，大尺度待办 ${slideBacklog.pending} 处`,
)
