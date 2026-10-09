#!/usr/bin/env node
// 门禁：组件总览示意图（docs/.vitepress/catalog/*.vue）按设计真源「总览示意图」一节书写。
//
// 总览页同时摆出全部组件，每张卡片只放一张内联 SVG 示意图，不挂真实组件。示意图的
// 颜色经语义令牌才会随亮暗主题、高对比与强制色走；尺度落在固定几档上各张图才像一套。
// 判据逐条对应设计真源：
//
// - 文件只有一个 <template>，里面只有一个 <svg> 根；没有 <script> / <style>。
// - 根属性固定：viewBox="0 0 240 160"、fill="none"、stroke-linecap / stroke-linejoin="round"、
//   aria-hidden="true"、focusable="false"；可选 data-direction="fixed"。
// - 元素只有 g / path / rect / circle / defs / linearGradient / stop，属性逐元素白名单：
//   没有 <text> / <foreignObject> / <image> / <use> / 动画元素，没有 style / class / transform、
//   事件与 Vue 绑定。
// - fill / stroke / stop-color 只写 none、同文件渐变 url(#…) 或 var(--xh-…) 语义令牌，令牌必须在
//   令牌产物或语气轴里声明过；--xh-tone-* 只在 <g data-tone> 里取；基础色板 --xh-color-* 只给
//   COLOR_SAMPLES 里画颜色本身的组件。
// - 透明度只取令牌：fill-opacity 取图表的面积 / 流带透明度，stop-opacity 只取 0 / 1。
// - 线宽只有 1 / 2 / 4 / 6 / 8 五档，虚线只取 "4 4"；rect 的 rx 只取 2（控件与内层）/ 4（表面与
//   浮层）或短边一半（胶囊）；
//   rect / circle 的坐标与尺寸取 0.5 的倍数。
// - 字段外壳（描控件边、短边不小于 FIELD_SHELL_MIN 的实线盒）按描边铺底：静息铺 --xh-bg-field，
//   校验失败铺 --xh-bg-field-invalid，聚焦铺 --xh-bg-surface；刻意不铺的登记在 UNFILLED_CONTROL_BOX。
// - 勾选方框与单选圈（不填底的 16px 小盒）描边取 CHECK_MARKER_STROKE。
// - 通栏列表（FLUSH_ROW_LISTS：锚定浮层里的列表与时间列、Command、Transfer）：面板里 24 高的悬停 / 选中行
//   不取圆角，左右贴面板内沿；多列面板（MULTI_COLUMN_LISTS）的行铺到列分隔线为止，只核左沿。
// - 渐变 id 以文件名开头（总览页上全部示意图同处一个 document，整页不重名由 check-demo-ids 核）；
//   每张图元素不超过 MAX_ELEMENTS 个。
// - 方向固定的示意图（图表分类的全部卡片与 FIXED_DIRECTION 登记的组件）根上写
//   data-direction="fixed"，其余不写；两侧反查。
// - 每份文件对应清单里的一个组件或一条跨分类引用，名单外的文件判红。
//
// 用法：node tooling/scripts/docs/check-catalog-preview.mjs
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const CATALOG = '../docs/.vitepress/catalog'
const MANIFEST = 'scripts/component-docs.manifest.json'
const TOKENS_CSS = 'packages/design/tokens/tokens.css'
const TONE_CSS = 'packages/design/styles/css/tone.css'

const VIEW_BOX = '0 0 240 160'
const MAX_ELEMENTS = 40
const STROKE_WIDTHS = new Set(['1', '2', '4', '6', '8'])
const DASH = '4 4'
const RADII = new Set([2, 4])
const TONES = new Set(['brand', 'neutral', 'info', 'success', 'warning', 'danger'])

/** 画颜色本身的组件：示意里的样色取基础色板。 */
const COLOR_SAMPLES = new Set(['color-field', 'color-picker', 'color-slider', 'color-swatch', 'color-swatch-picker'])

/** 图表分类之外、内容方向固定的组件（RTL 下不镜像），连同理由。 */
const FIXED_DIRECTION = {
  'bar-code': '码制按固定方向扫描',
  'matrix-code': '码制按固定方向扫描',
  'code-view': '代码按从左到右排',
  'diff-view': '代码按从左到右排',
  'json-viewer': '代码按从左到右排',
  'log': '日志按从左到右排',
}

/** 字段外壳按描边铺的底：静息铺字段淡底，校验失败铺 4% 失效色淡底，聚焦换承载面。 */
const FIELD_SHELL_FILL = {
  'var(--xh-border-control)': 'var(--xh-bg-field)',
  'var(--xh-border-invalid)': 'var(--xh-bg-field-invalid)',
  'var(--xh-border-control-focus)': 'var(--xh-bg-surface)',
}
/** 字段盒的短边下限：再小就是 16px 的勾选方框。 */
const FIELD_SHELL_MIN = 23

/** 描着控件边、刻意不铺字段淡底的组件，连同理由。 */
const UNFILLED_CONTROL_BOX = {
  clipboard: '只读输入框与复制钮共一个外框：输入框那段的底由框下的 path 铺 --xh-bg-subtle，复制钮那段透明',
}

/** 勾选方框与单选圈的描边：16px 的小盒比字段边重一档。 */
const CHECK_MARKER_STROKE = 'var(--xh-border-strong)'
const CHECK_MARKER_MAX = 16

/** 行是通栏的列表：锚定浮层里的列表、Command 结果列表与 Transfer 列表；其中多列面板的行铺到列分隔线为止。 */
const FLUSH_ROW_LISTS = new Set(['menu', 'context-menu', 'menubar', 'select', 'combobox', 'tree-select', 'mention', 'cascader', 'time-picker', 'time-range-picker', 'command', 'transfer'])
/** 承载列表的面板底：浮层面与页内面。 */
const LIST_PANEL_FILLS = new Set(['var(--xh-bg-surface-raised)', 'var(--xh-bg-surface)'])
/** 列表行的面：悬停淡底，或页内持久集合的选中面。 */
const LIST_ROW_FILL = /^var\(--xh-bg-(?:subtle(?:-hover)?|brand-subtle)\)$/
const MULTI_COLUMN_LISTS = new Set(['cascader', 'time-picker', 'time-range-picker'])
const LIST_ROW_H = 24

/** 每种元素允许的属性。 */
const ATTRS = {
  svg: new Set(['viewBox', 'fill', 'stroke-linecap', 'stroke-linejoin', 'aria-hidden', 'focusable', 'data-direction']),
  g: new Set(['data-tone']),
  path: new Set(['d', 'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'fill-rule', 'fill-opacity']),
  rect: new Set(['x', 'y', 'width', 'height', 'rx', 'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'fill-opacity']),
  circle: new Set(['cx', 'cy', 'r', 'fill', 'stroke', 'stroke-width']),
  defs: new Set([]),
  linearGradient: new Set(['id', 'x1', 'y1', 'x2', 'y2', 'gradientUnits']),
  stop: new Set(['offset', 'stop-color', 'stop-opacity']),
}
const ROOT_ATTRS = {
  'viewBox': VIEW_BOX,
  'fill': 'none',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'aria-hidden': 'true',
  'focusable': 'false',
}
/** 图表家具与数据色之外的图表令牌：长度、比例与透明度不是颜色。 */
const CHART_NON_COLOR = /-(?:alpha|bar-max|height|gap|line-width|point-size|tick-length|hit-min|label-gap|node-width)$/
const OPACITY_TOKENS = new Set(['--xh-chart-area-alpha', '--xh-chart-link-alpha'])

const problems = []

// ── 事实：令牌、清单 ─────────────────────────────────────────────────────────

const declared = new Set()
for (const m of (await readFile(TOKENS_CSS, 'utf8')).matchAll(/(--xh-[\w-]+)\s*:/g))
  declared.add(m[1])
const toneTokens = new Set()
for (const m of (await readFile(TONE_CSS, 'utf8')).matchAll(/(--xh-tone-[\w-]+)\s*:/g))
  toneTokens.add(m[1])

const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'))
const expected = new Map()
const chartIds = new Set()
for (const category of manifest.categories) {
  for (const component of category.components ?? []) {
    if (!component.renderless)
      expected.set(component.id, component.name)
    if (category.id === 'chart')
      chartIds.add(component.id)
  }
  for (const ref of category.references ?? []) {
    expected.set(ref.preview, ref.name)
    if (category.id === 'chart')
      chartIds.add(ref.preview)
  }
}
const fixedDirection = new Set([...chartIds, ...Object.keys(FIXED_DIRECTION)])

// ── 解析 ─────────────────────────────────────────────────────────────────────

function lineAt(source, index) {
  return source.slice(0, index).split('\n').length
}

/** 把模板里的标记切成开始 / 结束 / 自闭合三种，带属性表与行号。 */
function* tokens(source, from, to) {
  const re = /<(\/?)([\w:-]+)((?:\s+[^\s=/>]+(?:="[^"]*")?)*)\s*(\/?)>/g
  re.lastIndex = from
  let at = from
  for (let m = re.exec(source); m && m.index < to; m = re.exec(source)) {
    if (source.slice(at, m.index).trim())
      yield { kind: 'text', text: source.slice(at, m.index).trim(), line: lineAt(source, at) }
    at = re.lastIndex
    const attrs = new Map()
    for (const a of m[3].matchAll(/\s+([^\s=/>]+)(?:="([^"]*)")?/g))
      attrs.set(a[1], a[2] ?? '')
    yield {
      kind: m[1] ? 'close' : m[4] ? 'void' : 'open',
      name: m[2],
      attrs,
      line: lineAt(source, m.index),
    }
  }
  if (source.slice(at, to).trim())
    yield { kind: 'text', text: source.slice(at, to).trim(), line: lineAt(source, at) }
}

const isHalf = value => /^-?\d+(?:\.5|\.0)?$/.test(value)
const num = value => Number(value)

// ── 逐份检查 ─────────────────────────────────────────────────────────────────

const files = (await readdir(CATALOG)).filter(file => file.endsWith('.vue')).sort()
let elements = 0
let widest = { id: '', count: 0 }
const tally = { shells: 0, markers: 0, rows: 0 }

for (const file of files) {
  const id = file.slice(0, -'.vue'.length)
  const path = `${CATALOG}/${file}`
  const report = (line, message) => problems.push(`${path}:${line}  ${message}`)
  const raw = await readFile(join(CATALOG, file), 'utf8')
  const source = raw.replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, ' '))

  if (!expected.has(id))
    report(1, `${id} 不在 ${MANIFEST} 的组件或跨分类引用里——组件改名或退役了就一起删掉这份示意图`)

  const outer = source.replace(/\s+/g, ' ').trim()
  if (!/^<template>[\s\S]*<\/template>$/.test(outer)) {
    report(1, '文件只有一个 <template>：示意图不写 <script> / <style>')
    continue
  }
  const from = source.indexOf('<template>') + '<template>'.length
  const to = source.lastIndexOf('</template>')

  const stack = []
  const ids = new Set()
  const refs = []
  const usesPalette = []
  const rects = []
  let unfilledControlBoxes = 0
  let root = null
  let count = 0
  let hasDirection = false

  for (const token of tokens(source, from, to)) {
    if (token.kind === 'text') {
      report(token.line, `文字节点「${token.text.slice(0, 20)}」—— 示意图不写真实文案，文字画成圆头条`)
      continue
    }
    if (token.kind === 'close') {
      stack.pop()
      continue
    }
    const { name, attrs, line } = token

    if (!root) {
      root = token
      if (name !== 'svg') {
        report(line, `根是 <${name}> —— <template> 里只有一个 <svg> 根`)
        break
      }
      for (const [attr, value] of Object.entries(ROOT_ATTRS)) {
        if (attrs.get(attr) !== value)
          report(line, `<svg> 根要写 ${attr}="${value}"（现在是 ${attrs.has(attr) ? `"${attrs.get(attr)}"` : '缺省'}）`)
      }
      if (attrs.has('data-direction')) {
        hasDirection = true
        if (attrs.get('data-direction') !== 'fixed')
          report(line, 'data-direction 只取 "fixed"：方向固定的示意图不随 RTL 镜像')
      }
    }
    else {
      count += 1
      if (stack.length === 0)
        report(line, `<${name}> 在 <svg> 根之外 —— <template> 里只有一个 <svg> 根`)
    }

    if (!ATTRS[name]) {
      report(line, `<${name}> —— 示意图只用 g / path / rect / circle / defs / linearGradient / stop；文字画成条，不写文字、外来对象、图片与动画元素`)
    }
    else {
      for (const attr of attrs.keys()) {
        if (!ATTRS[name].has(attr))
          report(line, `<${name} ${attr}> —— ${name} 只允许 ${[...ATTRS[name]].join(' / ') || '无属性'}；不写 style / class / transform、事件与绑定`)
      }
    }

    const toneAncestor = stack.some(t => t.attrs.has('data-tone'))
    if (attrs.has('data-tone') && !TONES.has(attrs.get('data-tone')))
      report(line, `data-tone="${attrs.get('data-tone')}" —— 语气只取 ${[...TONES].join(' / ')}`)

    for (const attr of ['fill', 'stroke', 'stop-color']) {
      if (!attrs.has(attr))
        continue
      const value = attrs.get(attr)
      if (value === 'none' && attr !== 'stop-color')
        continue
      const url = value.match(/^url\(#([\w-]+)\)$/)
      if (url && attr !== 'stop-color') {
        refs.push({ id: url[1], line })
        continue
      }
      const token = value.match(/^var\((--xh-[\w-]+)\)$/)?.[1]
      if (!token) {
        report(line, `${attr}="${value}" —— 颜色只写 var(--xh-…) 语义令牌${attr === 'stop-color' ? '' : '、同文件渐变 url(#…) 或 none'}，亮暗主题与高对比才跟得上`)
        continue
      }
      if (token.startsWith('--xh-tone-')) {
        if (!toneTokens.has(token))
          report(line, `${attr}: ${token} —— 语气轴没有这支令牌（${TONE_CSS}）`)
        else if (!toneAncestor && !attrs.has('data-tone'))
          report(line, `${attr}: ${token} —— --xh-tone-* 只在 <g data-tone="…"> 里取`)
        continue
      }
      if (!declared.has(token)) {
        report(line, `${attr}: ${token} —— 令牌产物里没有这个名字（${TOKENS_CSS}）`)
        continue
      }
      if (token.startsWith('--xh-color-')) {
        usesPalette.push(line)
        if (!COLOR_SAMPLES.has(id))
          report(line, `${attr}: ${token} —— 基础色板只给画颜色本身的组件（COLOR_SAMPLES），其余取语义角色`)
        continue
      }
      const colorFamily = /^--xh-(?:bg|fg|border)-/.test(token)
        || (token.startsWith('--xh-chart-') && !CHART_NON_COLOR.test(token))
        || token.startsWith('--xh-syntax-')
        || /^--xh-gradient-brand-(?:from|to)$/.test(token)
      if (!colorFamily)
        report(line, `${attr}: ${token} —— 颜色只取 --xh-bg / fg / border / chart / syntax / gradient-brand 语义令牌与语气轴`)
    }

    if (attrs.has('fill-opacity') && !OPACITY_TOKENS.has(attrs.get('fill-opacity').match(/^var\((--xh-[\w-]+)\)$/)?.[1]))
      report(line, `fill-opacity="${attrs.get('fill-opacity')}" —— 透明度只取 ${[...OPACITY_TOKENS].join(' / ')}`)
    if (attrs.has('stop-opacity') && !['0', '1'].includes(attrs.get('stop-opacity')))
      report(line, `stop-opacity="${attrs.get('stop-opacity')}" —— 渐变端点只取 0 / 1，中间值交给令牌`)

    if (attrs.has('stroke-width') && !STROKE_WIDTHS.has(attrs.get('stroke-width')))
      report(line, `stroke-width="${attrs.get('stroke-width')}" —— 线宽只有 ${[...STROKE_WIDTHS].join(' / ')} 五档`)
    if (attrs.has('stroke-dasharray') && attrs.get('stroke-dasharray') !== DASH)
      report(line, `stroke-dasharray="${attrs.get('stroke-dasharray')}" —— 虚线只画没有实体边的范围，取 "${DASH}"`)

    if (name === 'rect' || name === 'circle') {
      const geometry = name === 'rect' ? ['x', 'y', 'width', 'height', 'rx'] : ['cx', 'cy', 'r']
      for (const attr of geometry) {
        if (attrs.has(attr) && !isHalf(attrs.get(attr)))
          report(line, `<${name} ${attr}="${attrs.get(attr)}"> —— 坐标与尺寸取 0.5 的倍数`)
      }
    }
    if (name === 'rect' && attrs.has('rx')) {
      const rx = num(attrs.get('rx'))
      const short = Math.min(num(attrs.get('width')), num(attrs.get('height')))
      if (!RADII.has(rx) && rx * 2 !== short)
        report(line, `<rect rx="${attrs.get('rx')}"> —— 圆角只取 ${[...RADII].join(' / ')}，或等于短边一半（胶囊）`)
    }

    const fill = attrs.get('fill')
    const stroke = attrs.get('stroke')
    const unfilled = fill === undefined || fill === 'none'
    if (name === 'rect') {
      const box = { x: num(attrs.get('x')), y: num(attrs.get('y')), w: num(attrs.get('width')), h: num(attrs.get('height')) }
      rects.push({ ...box, attrs, line })
      const short = Math.min(box.w, box.h)
      if (Object.hasOwn(FIELD_SHELL_FILL, stroke) && !attrs.has('stroke-dasharray') && short >= FIELD_SHELL_MIN) {
        if (Object.hasOwn(UNFILLED_CONTROL_BOX, id)) {
          if (unfilled)
            unfilledControlBoxes += 1
        }
        else {
          tally.shells += 1
          if (fill !== FIELD_SHELL_FILL[stroke])
            report(line, `<rect stroke="${stroke}" fill="${fill ?? '缺省'}"> —— 字段外壳按描边铺底：${FIELD_SHELL_FILL[stroke]}（静息铺字段淡底，校验失败铺失效淡底，聚焦铺承载面）`)
        }
      }
    }
    const marker = name === 'rect'
      ? num(attrs.get('width')) === num(attrs.get('height')) && num(attrs.get('width')) <= CHECK_MARKER_MAX
      : name === 'circle' && num(attrs.get('r')) * 2 <= CHECK_MARKER_MAX
    if (marker && unfilled && stroke?.startsWith('var(--xh-border-')) {
      tally.markers += 1
      if (stroke !== CHECK_MARKER_STROKE)
        report(line, `<${name} stroke="${stroke}"> —— ${name === 'rect' ? '勾选方框' : '单选圈'}描边取 ${CHECK_MARKER_STROKE}，比字段边重一档`)
    }

    if (attrs.has('id')) {
      const value = attrs.get('id')
      if (!value.startsWith(`${id}-`))
        report(line, `id="${value}" —— 全部示意图内联在同一页，id 以文件名开头（${id}-…）`)
      ids.add(value)
    }

    if (token.kind === 'open')
      stack.push(token)
  }

  if (!root)
    report(1, '<template> 里没有 <svg> 根')

  for (const ref of refs) {
    if (!ids.has(ref.id))
      report(ref.line, `url(#${ref.id}) —— 本文件没有定义这个 id`)
  }

  if (Object.hasOwn(UNFILLED_CONTROL_BOX, id) && unfilledControlBoxes === 0)
    report(1, `UNFILLED_CONTROL_BOX 登记了 ${id}，但示意图里没有不铺底的字段盒——名单过期了，删掉这条`)

  if (FLUSH_ROW_LISTS.has(id)) {
    // 列表面板：铺浮层面或页内面、描装饰边的 rect；1 线宽描边落在半格，面板内沿比外框各收半格
    const panels = rects.filter(r => LIST_PANEL_FILLS.has(r.attrs.get('fill')) && r.attrs.has('stroke'))
    let rows = 0
    for (const row of rects) {
      if (row.h !== LIST_ROW_H || !LIST_ROW_FILL.test(row.attrs.get('fill') ?? ''))
        continue
      const panel = panels.find(p => row.x >= p.x && row.x + row.w <= p.x + p.w && row.y >= p.y && row.y + row.h <= p.y + p.h)
      if (!panel)
        continue
      rows += 1
      tally.rows += 1
      const inner = { start: panel.x + 0.5, end: panel.x + panel.w - 0.5 }
      if (row.attrs.has('rx'))
        report(row.line, `<rect rx="${row.attrs.get('rx')}"> —— 通栏列表的行不取圆角`)
      if (row.x !== inner.start)
        report(row.line, `<rect x="${row.x}"> —— 通栏列表的行左沿贴面板内沿 x="${inner.start}"`)
      if (!MULTI_COLUMN_LISTS.has(id) && row.x + row.w !== inner.end)
        report(row.line, `<rect width="${row.w}"> —— 通栏列表的行右沿贴面板内沿（x + width = ${inner.end}，现在 ${row.x + row.w}）`)
    }
    if (rows === 0)
      report(1, `FLUSH_ROW_LISTS 登记了 ${id}，但示意图的列表面板里没有 ${LIST_ROW_H} 高的悬停或选中行——画一条，或把名单里这条删掉`)
  }

  if (fixedDirection.has(id) && !hasDirection)
    report(root?.line ?? 1, `${chartIds.has(id) ? '图表绘图区' : FIXED_DIRECTION[id]}：方向固定，根上写 data-direction="fixed"`)
  if (!fixedDirection.has(id) && hasDirection)
    report(root?.line ?? 1, 'data-direction="fixed" 只给图表与 FIXED_DIRECTION 登记的组件：示意图画的是界面布局，RTL 下随书写方向镜像')

  if (COLOR_SAMPLES.has(id) && usesPalette.length === 0)
    report(1, `COLOR_SAMPLES 登记了 ${id}，但示意图没用基础色板——名单过期了，删掉这条`)

  if (count > MAX_ELEMENTS)
    report(root?.line ?? 1, `${count} 个元素 —— 每张示意图不超过 ${MAX_ELEMENTS} 个；同色同线宽的条与字形合并成一条 path`)
  elements += count
  if (count > widest.count)
    widest = { id, count }
}

for (const [id, name] of expected) {
  if (!files.includes(`${id}.vue`))
    problems.push(`${MANIFEST}:1  ${name}（${id}）没有总览示意图：在 ${CATALOG}/${id}.vue 画一张`)
}
for (const id of Object.keys(FIXED_DIRECTION)) {
  if (!files.includes(`${id}.vue`))
    problems.push(`FIXED_DIRECTION 登记了 ${id}，但 ${CATALOG}/${id}.vue 不存在——名单过期了，删掉这条`)
}
for (const id of COLOR_SAMPLES) {
  if (!files.includes(`${id}.vue`))
    problems.push(`COLOR_SAMPLES 登记了 ${id}，但 ${CATALOG}/${id}.vue 不存在——名单过期了，删掉这条`)
}
for (const [list, ids] of [['UNFILLED_CONTROL_BOX', Object.keys(UNFILLED_CONTROL_BOX)], ['FLUSH_ROW_LISTS', FLUSH_ROW_LISTS], ['MULTI_COLUMN_LISTS', MULTI_COLUMN_LISTS]]) {
  for (const id of ids) {
    if (!files.includes(`${id}.vue`))
      problems.push(`${list} 登记了 ${id}，但 ${CATALOG}/${id}.vue 不存在——名单过期了，删掉这条`)
  }
}
for (const id of MULTI_COLUMN_LISTS) {
  if (!FLUSH_ROW_LISTS.has(id))
    problems.push(`MULTI_COLUMN_LISTS 登记了 ${id}，但它不在 FLUSH_ROW_LISTS 里——多列只放宽通栏行的右沿，先登记成通栏列表`)
}

if (problems.length) {
  console.error('[check-catalog-preview] ✗ 组件总览示意图偏离书写规范：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  process.exit(1)
}

console.log(
  `[check-catalog-preview] 通过：${files.length} 张总览示意图都是 ${VIEW_BOX} 画布上的纯 SVG，颜色只取语义令牌，`
  + `合计 ${elements} 个元素（最多的 ${widest.id} ${widest.count} 个）；方向固定 ${fixedDirection.size} 张；`
  + `字段外壳 ${tally.shells} 个按描边铺底，勾选标记 ${tally.markers} 个描重一档，通栏列表行 ${tally.rows} 条`,
)
