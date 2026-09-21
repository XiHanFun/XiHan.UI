#!/usr/bin/env node
// 门禁：圆角只走语义档，不许直接下探到 primitive。
//
// 语义档六级：inset(4px 嵌在控件里的小标记) · control(4px 控件本体，以及尺寸接近控件的
// 小浮层，tooltip 这类一行字的气泡按这档走) · surface(8px 成面的容器与卡片) ·
// overlay(12px 浮层) · circle(50% 圆点) · pill(9999px 胶囊)。
//
// 这条是补出来的：审计时查到 20 份皮肤在 border-radius 上写 var(--xh-radius-sm|md|full)，
// 绕过整个语义层。原因不是谁偷懒，是语义层当时缺 4px 那一档——小内嵌方块没处可去，
// 于是各自下探。补齐 inset 之后把 26 处收回来，再用这条门禁钉住，免得下次又从 primitive 长出来。
//
// 允许的写法：--xh-shape-* / 组件槽 --xh-<comp>-* / 私有槽 --xh-_* / 0 / inherit / 百分比 / calc。
//
// 第三条判据是形状身份（真源 §6.3 / §4.1）：IDENTITY 逐部件登记该取哪一档，登记部件的
// radius 兜底值（私有槽在赋值点解）必须等于登记档；取 circle / pill 的部件必须在表里；
// 同一规则块里 inline-size 与 block-size 同槽 / 同值的正方盒不得取 pill（用 pill 冒充圆）。
// 登记为 floating 的悬浮圆钮，connect 还得投影 data-xh-action-profile: 'floating'——手写圆钮不算。
// 接了 Action Control 的部件圆角由家族配方按 profile 给，皮肤只在桥接槽 --xh-action-radius 上映射
// 使用者槽；这条桥接槽就是该部件的圆角声明，原语判据与逐部件登记的身份判据同样对它生效
// （按后缀归档的 close / clear 钮不核桥接槽：field-inset 档的形状由家族 profile 给）。
// 存量登 family-backlog.json shape 段，命中即放行、不命中判过期。
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { getterBody } from './lib/connect-getters.mjs'
import { declarations, lineCounter, stripComments } from './lib/css-declarations.mjs'
import { openBacklog } from './lib/family-backlog.mjs'
import { innermost } from './lib/skin-rules.mjs'

/** 与其余皮肤门禁一样按工作目录取皮肤：夹具单测在临时根下铺目录后把脚本当子进程跑。 */
const cssDir = 'packages/design/styles/css'

/** primitive 的圆角档，只该由语义层引用，皮肤不许直接点名。 */
const PRIMITIVE = /var\(\s*--xh-radius-[\w-]+/

/** 简写、border-<side>-radius 与逻辑角长属性。 */
const RADIUS_PROP = /^border(?:-[\w-]+)?-radius$/
/** Action Control 的圆角桥接槽：接了家族的部件圆角写在这里，与 border-radius 同等看待。 */
const ACTION_RADIUS = '--xh-action-radius'
/** 私有槽赋值：原语先灌进私有槽再消费同样是下探。 */
const RADIUS_SLOT = /^--xh-_[\w-]*radius[\w-]*$/

/**
 * 圆角可以没有使用者覆盖槽的地方：形状本身就是这个部件的身份，换掉它就不是那个东西了。
 * 键写成「组件:部件[::伪元素]」。
 */
const NO_SLOT = {
  'radio-group:indicator::before': '单选圆点，圆是它的身份',
  'color-swatch-picker:indicator::before': '压在色块正中的选中徽标，圆是它的身份',
  'tour:progress-dot': '进度圆点，8px 正方盒取 circle；当前那颗拉成 20px 胶囊取 pill，两档都是身份',
  'popconfirm:confirm-trigger::before': '转圈的加载环，正方盒取 circle',
  'switch:thumb::after': '转圈的加载环',
  'download-trigger:root::before': '转圈的加载环，正方盒取 circle',
  'clipboard:copy-trigger::before': '转圈的加载环，正方盒取 circle',
  'approval:footer::before': '转圈的加载环',
  // reset 层的原生细条：主体是 :where([data-scope][data-part], [data-xh-scroll], …) 一组宿主，
  // 部件位记作 *；原生滑块与自绘 scrollbar:thumb 同为一维对象，pill 是它的身份
  'reset:*::-webkit-scrollbar-thumb': '原生细条的滑块，与自绘 scrollbar:thumb 同身份',
}

/**
 * 形状身份表：键「组件:部件[::伪元素][属性限定]」，值是该部件的圆角档。
 * 按真源 §6.3 身份表与 §4.1 归族表登记；同名部件跨组件语义不同，逐 scope 列出，不通配。
 * 值写成 { shape, floating: true } 的是悬浮单图标动作，还要接 Action Control floating profile。
 * circle / pill 的登记部件形状即身份，可以没有使用者覆盖槽（与 NO_SLOT 并存）。
 */
const IDENTITY = {
  // circle：宽高相等的圆形对象
  'avatar:root': 'circle',
  'avatar-group:overflow-item': 'circle',
  'icon-wrapper:root': 'circle',
  'dialog:indicator': 'circle',
  'radio-group:indicator': 'circle',
  'radio-group:indicator::before': 'circle',
  // 记号盒：单选是圆，多选是嵌在行里的圆角方格（与 Checkbox 同 inset），单选的实心点是圆
  'question-flow:item-indicator[data-select-mode=\'single\']': 'circle',
  'question-flow:item-indicator::before': 'circle',
  'switch:thumb': 'circle',
  'slider:thumb': 'circle',
  'color-slider:thumb': 'circle',
  'color-picker:area-thumb': 'circle',
  'steps:indicator': 'circle',
  'timeline:indicator': 'circle',
  'spinner:root::before': 'circle',
  'popconfirm:confirm-trigger::before': 'circle',
  'switch:thumb::after': 'circle',
  'download-trigger:root::before': 'circle',
  'clipboard:copy-trigger::before': 'circle',
  'approval:footer::before': 'circle',
  'color-swatch-picker:indicator::before': 'circle',
  'skeleton:item[data-shape=\'circle\']': 'circle',
  // 位置指示点：8px 圆点，当前项拉长成 20px 胶囊（§6.3）；粗指针下点由 ::after 画、进度条由 ::before 画，同一张表
  'carousel:indicator': 'circle',
  'carousel:indicator[data-current]': 'pill',
  'carousel:indicator::after': 'circle',
  'carousel:indicator::after[data-current]': 'pill',
  'carousel:indicator::before[data-current]': 'pill',
  'slider:tick': 'circle',
  'image-cropper:crop-area': 'circle',
  // circle + floating：悬浮于内容之上的单图标动作，走 Action Control floating profile
  'float-button:trigger': { shape: 'circle', floating: true },
  'back-top:trigger': { shape: 'circle', floating: true },
  'carousel:prev-trigger': { shape: 'circle', floating: true },
  'carousel:next-trigger': { shape: 'circle', floating: true },
  'carousel:autoplay-trigger': { shape: 'circle', floating: true },
  'log:scroll-to-end-trigger': { shape: 'circle', floating: true },
  'message-feed:scroll-to-end-trigger': { shape: 'circle', floating: true },
  'image-viewer:prev-trigger': { shape: 'circle', floating: true },
  'image-viewer:next-trigger': { shape: 'circle', floating: true },
  // 角标圆点档是宽高同槽的正方盒：计数档是胶囊，圆点档必须取 circle
  'badge:indicator[data-dot]': 'circle',
  // pill：(a) 状态 chip
  'badge:indicator': 'pill',
  'tag:root': 'pill',
  'tool-call:status': 'pill',
  'approval:result': 'pill',
  'question-flow:result': 'pill',
  // pill：(b) 一维对象
  'switch:root': 'pill',
  'slider:track': 'pill',
  'slider:range': 'pill',
  'color-slider:track': 'pill',
  'progress:track': 'pill',
  'progress:range': 'pill',
  'password-input:strength-meter': 'pill',
  'file-upload:item-progress': 'pill',
  'notification:item-progress': 'pill',
  'separator:root': 'pill',
  'separator:line': 'pill',
  'menu:separator': 'pill',
  'menubar:separator': 'pill',
  'context-menu:separator': 'pill',
  'toolbar:separator': 'pill',
  'tabs:separator': 'pill',
  'steps:separator': 'pill',
  'timeline:connector': 'pill',
  'tabs:indicator': 'pill',
  // line 档没放 indicator 部件时选中标签自画的静态线：与部件同规格的一维对象
  'tabs:trigger::after': 'pill',
  'anchor:indicator': 'pill',
  'navigation-menu:indicator': 'pill',
  'resizable:handle::after': 'pill',
  'table:column-resize-trigger::after': 'pill',
  'image-cropper:crop-handle::after': 'pill',
  'scrollbar:thumb': 'pill',
  'sortable:drop-indicator': 'pill',
  'skeleton:item[data-shape=\'text\']': 'pill',

  // 引导的分页点：圆点 circle，当前那颗拉长成 pill（§6.3 分页点统一 tour 款）
  'tour:progress-dot': 'circle',
  'tour:progress-dot[data-current]': 'pill',
  // control：在 chrome 内或随文的按钮与字段
  'pagination:item': 'control',
  // 看图器顶部一行字的计数气泡：与 tooltip / kbd 同档
  'image-viewer:counter': 'control',
  'kbd:root': 'control',
  'tooltip:content': 'control',
  'rating:item': 'control',
  'tabs:trigger': 'control',
  'steps:trigger': 'control',
  // surface：轨道与容器
  'segmented:root': 'surface',
  // 看图器底部的工具条外壳：容器不是一维对象，与 toolbar 根面同身份
  'image-viewer:toolbar': 'surface',
  'tabs:list': 'surface',
  // inset：嵌在 control 内的小块
  'checkbox:root': 'inset',
  // 标签里的叉是随文标记档（coarse-target 的 inlineMark：指示符尺寸 + inset 圆角），与 checkbox 系方框同档，
  // 不按 close-trigger 后缀归 control，也不是圆
  'tag:close-trigger': 'inset',
  'question-flow:item-indicator': 'inset',
  'checkbox-group:indicator': 'inset',
  'checkbox-group:select-all-trigger': 'inset',
  'table:row-select-trigger': 'inset',
  'table:select-all-trigger': 'inset',
  'transfer:item-checkbox': 'inset',
  'transfer:select-all-trigger': 'inset',
  'color-swatch-picker:item': 'inset',
  'segmented:item': 'inset',
  'segmented:indicator': 'inset',
}
/** 所有 *close-trigger / *clear-trigger 都是 control 档：按部件名后缀登记，不逐组件列。 */
const IDENTITY_SUFFIX = { 'close-trigger': 'control', 'clear-trigger': 'control' }

const backlog = await openBacklog('shape')
const offenders = []
const slotless = []
const identity = [...backlog.problems]
const identitySeen = new Set()
const noSlotSeen = new Set()
let scanned = 0
let checked = 0
let identityChecked = 0

/** 括号与方括号之外的空格与组合符才分隔复合体。 */
function compoundsOf(branch) {
  const out = []
  let depth = 0
  let current = ''
  for (const ch of branch) {
    if (ch === '[' || ch === '(')
      depth++
    else if (ch === ']' || ch === ')')
      depth--
    if (depth === 0 && (ch === ' ' || ch === '>' || ch === '+' || ch === '~')) {
      if (current)
        out.push(current)
      current = ''
      continue
    }
    current += ch
  }
  if (current)
    out.push(current)
  return out
}

/** 一条 radius 声明落在哪些身份键上：逐分支取主体的 scope / part / 伪元素 / 属性限定拼出来的键。 */
function identityKeysOf(comp, selector) {
  return splitBranches(selector).map(branch => identityKeyOf(comp, branch)).filter(Boolean)
}

/** 按顶层逗号拆分支。 */
function splitBranches(selector) {
  const out = []
  let depth = 0
  let current = ''
  for (const ch of selector) {
    if (ch === '(' || ch === '[')
      depth++
    else if (ch === ')' || ch === ']')
      depth--
    if (ch === ',' && depth === 0) {
      out.push(current.trim())
      current = ''
      continue
    }
    current += ch
  }
  out.push(current.trim())
  return out.filter(Boolean)
}

function identityKeyOf(comp, branch) {
  const compounds = compoundsOf(branch)
  const subject = compounds.at(-1) ?? ''
  // 主体是 :where(…) / :is(…) 一组宿主（reset 层的原生细条）时没有单一部件身份，由 NO_SLOT 按伪元素登记
  if (/^:(?:where|is)\(/.test(subject))
    return null
  const part = /data-part='([a-z-]+)'/.exec(subject)?.[1]
  if (!part)
    return null
  const scope = /data-scope='([a-z-]+)'/.exec(subject)?.[1]
    ?? [...compounds].reverse().map(c => /data-scope='([a-z-]+)'/.exec(c)?.[1]).find(Boolean)
    ?? comp
  const pseudo = /::(before|after)/.exec(subject)?.[1]
  const base = `${comp}:${scope === comp ? '' : `${scope}/`}${part}${pseudo ? `::${pseudo}` : ''}`
  const qualified = Object.keys(IDENTITY).find(key => key.startsWith(`${base}[`) && subject.includes(key.slice(base.length)))
  return { key: qualified ?? base, part }
}

/** 登记档：先查身份表，再按部件名后缀。 */
function wantOf(key, part) {
  let entry = IDENTITY[key]
  if (entry == null) {
    const suffix = Object.keys(IDENTITY_SUFFIX).find(s => part === s || part.endsWith(`-${s}`))
    entry = suffix ? IDENTITY_SUFFIX[suffix] : undefined
  }
  if (entry == null)
    return null
  return typeof entry === 'string' ? { shape: entry, floating: false } : { shape: entry.shape, floating: Boolean(entry.floating) }
}

for (const file of fs.readdirSync(cssDir).filter(f => f.endsWith('.css')).sort()) {
  scanned++
  const comp = file.replace(/\.css$/, '')
  const text = stripComments(fs.readFileSync(path.join(cssDir, file), 'utf8'))
  const lineOf = lineCounter(text)
  const all = [...declarations(text)]
  /** 私有槽的全部赋值：名字 → 值列表。 */
  const slots = new Map()
  for (const d of all) {
    if (d.prop.startsWith('--xh-_'))
      (slots.get(d.prop) ?? slots.set(d.prop, []).get(d.prop)).push(d.value)
  }
  /** 解到最内层；私有槽按每一处赋值分别解，返回全部终值。 */
  const ends = (value, seen = new Set()) => {
    const token = innermost(value)
    if (!token.startsWith('--xh-_') || seen.has(token) || !slots.has(token))
      return [token]
    seen.add(token)
    return slots.get(token).flatMap(v => ends(v, seen))
  }
  /** 同一块里的其他声明：正方盒判据要看 inline-size 与 block-size。 */
  const blockOf = selectors => all.filter(d => d.selectors.join('>') === selectors.join('>'))

  for (const { prop, value, index, selectors } of all) {
    const isRadiusProp = RADIUS_PROP.test(prop) || prop === ACTION_RADIUS
    if (!isRadiusProp && !RADIUS_SLOT.test(prop))
      continue
    checked++

    if (PRIMITIVE.test(value)) {
      offenders.push(`${file}:${lineOf(index)}  ${prop}: ${value}`)
      continue
    }

    const selector = (selectors.at(-1) ?? '').replace(/\s+/g, ' ').trim()
    const parts = [...selector.matchAll(/data-part='([a-z-]+)'/g)].map(x => x[1])
    // 伪元素取全名：reset 层的 ::-webkit-scrollbar-thumb 也要落到可登记的键上；
    // 主体是 :where(…) / :is(…) 一组宿主（reset 层的原生细条）时没有单一部件，部件位记作 *
    const pseudo = /::([a-z-]+)/.exec(selector)?.[1]
    const part = /^:(?:where|is)\(/.test(selector) ? '*' : (parts.at(-1) ?? '?')
    const key = `${comp}:${part}${pseudo ? `::${pseudo}` : ''}`

    // 第三条判据：形状身份
    if ((prop === 'border-radius' || prop === ACTION_RADIUS) && !selectors.some(s => s.startsWith('@keyframes'))) {
      const shapes = ends(value).filter(t => t.startsWith('--xh-shape-')).map(t => t.replace('--xh-shape-', ''))
      for (const hit of identityKeysOf(comp, selector)) {
        // 桥接槽只核逐部件登记的身份：按后缀归档的 close / clear 钮在 field-inset 档里取 inset，
        // 那是家族按 profile 给的形状，不在这条身份表管辖之内
        const want = prop === ACTION_RADIUS && !(hit.key in IDENTITY) ? null : wantOf(hit.key, hit.part)
        const where = `${file}:${lineOf(index)}`
        if (want) {
          identityChecked++
          identitySeen.add(hit.key)
          for (const shape of shapes) {
            if (shape !== want.shape && !backlog.excuse(hit.key))
              identity.push(`${where}  ${hit.key}  取了 ${shape}，身份表登记的是 ${want.shape}`)
          }
        }
        else if (shapes.some(shape => shape === 'circle' || shape === 'pill') && !backlog.excuse(hit.key)) {
          identity.push(`${where}  ${hit.key}  取了 ${shapes.join(' / ')} 却没在 IDENTITY 登记——circle 只给等宽高对象与悬浮单图标钮，pill 只给状态 chip 与一维对象`)
        }
        // 正方盒不得用 pill 冒充圆
        if (shapes.includes('pill')) {
          const block = blockOf(selectors)
          const inline = block.find(d => d.prop === 'inline-size')?.value.replace(/\s+/g, ' ')
          const size = block.find(d => d.prop === 'block-size')?.value.replace(/\s+/g, ' ')
          if (inline && size && inline === size && !backlog.excuse(hit.key))
            identity.push(`${where}  ${hit.key}  inline-size 与 block-size 同值（${inline.slice(0, 40)}）的正方盒取了 pill——正方盒必须取 circle`)
        }
      }
    }

    // 第二条判据：取语义档的圆角必须留一个使用者覆盖槽，同角色的部件在别处都有。
    // 私有槽赋值、inherit、显式取直角都不在此列——它们不是「可换的形状」
    if (!isRadiusProp || !value.startsWith('var(--xh-shape-'))
      continue
    if (key in NO_SLOT) {
      noSlotSeen.add(key)
      continue
    }
    // 身份表里取 circle / pill 的部件：形状即身份，可以没有覆盖槽
    const identityShape = IDENTITY[key]
    if (identityShape === 'circle' || identityShape === 'pill' || identityShape?.shape === 'circle')
      continue
    slotless.push(`${file}:${lineOf(index)}  ${selector.slice(0, 80)}  ${prop}: ${value}`)
  }
}

for (const key of Object.keys(NO_SLOT)) {
  if (!noSlotSeen.has(key))
    slotless.push(`${key}  登记在 NO_SLOT 里却没被扫到——名单过期了`)
}

// 身份表反查：登了却没扫到；floating 档的圆钮还得在 connect 里投影 floating profile
for (const [key, entry] of Object.entries(IDENTITY)) {
  if (!identitySeen.has(key)) {
    identity.push(`${key}  登记在 IDENTITY 里却没被扫到——名单过期了`)
    continue
  }
  if (typeof entry === 'object' && entry.floating) {
    const [comp, part] = key.split(':')
    const body = await getterBody(comp, part)
    if (!body?.includes('\'data-xh-action-profile\': \'floating\'') && !backlog.excuse(key))
      identity.push(`${key}  登记为悬浮圆钮，connect 的 getter 却没投影 data-xh-action-profile: 'floating'——手写圆钮不算，接 Action Control floating 档`)
  }
}
identity.push(...backlog.stale())

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

if (identity.length > 0) {
  console.error('[check-shape-scale] ✗ 形状身份没按 §6.3 走：')
  for (const s of identity)
    console.error(`  ${s}`)
  console.error('\n身份表 IDENTITY 逐部件登记；circle 只给等宽高对象与悬浮单图标钮，pill 只给状态 chip 与一维对象，正方盒不得用 pill。存量登 family-backlog.json shape 段。')
  process.exit(1)
}

console.log(`[check-shape-scale] 通过：${scanned} 份皮肤 · ${checked} 处圆角声明全部走语义档，取语义档的都留了覆盖槽（形状即身份的 ${noSlotSeen.size} 处）；身份表 ${Object.keys(IDENTITY).length} 条核过 ${identityChecked} 处，backlog 待办 ${backlog.pending} 条，无过期豁免`)
