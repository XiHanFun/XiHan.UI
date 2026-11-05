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
//   COLOR_SAMPLES 里画颜色本身的组件，而且只取浅档（COLOR_SAMPLE_TOKEN）。
// - 淡彩域：示意图不写色相，卡片（XhComponentCard.vue）把语义令牌重写成分类色相的曲线。示意图用到的
//   中性、品牌与图表家具令牌都要在域里重写（DOMAIN_EXEMPT 除外），域里不留没人用的令牌，取值只有
//   var() 与 color-mix()；每个分类都要有色相，色相只取分类色槽。
// - 透明度只取令牌：fill-opacity 取图表的面积 / 流带透明度，stop-opacity 只取 0 / 1。
// - 线宽只有 1 / 2 / 4 / 6 / 8 五档，虚线只取 "4 4"；rect / circle 的坐标与尺寸取 0.5 的倍数。
// - 圆角与真实组件同值：画布宽屏下 1:1，控件 32 高就是 md 档。圆角按外沿算（rx 加半个线宽），只取
//   inset / control·surface·overlay / sheet 三档，从 --xh-radius-seed 派生；等于外沿短边一半的是胶囊。
//   sheet 只给 SHEET_PREVIEWS；短边不小于 SURFACE_MIN 的盒不取 inset（INSET_FACES 登记的数据标记与色块
//   除外）；不大于 CHECK_MARKER_MAX 的小方块只取 inset。带填充的 path 画的圆角同一套，描边中线与内沿各
//   收半格、一格。
// - 字段外壳（描控件边、短边不小于 FIELD_SHELL_MIN 的实线盒）按描边铺底：静息铺 --xh-bg-field，
//   校验失败铺 --xh-bg-field-invalid，聚焦铺 --xh-bg-surface；刻意不铺的登记在 UNFILLED_CONTROL_BOX。
// - 勾选方框与单选圈（不填底的 16px 小盒）描边取 CHECK_MARKER_STROKE。
// - 内缩列表（INSET_ROW_LISTS：锚定浮层里的列表与时间列、Listbox、Command、Transfer）：面板里 24 高的
//   悬停 / 选中行取 inset 圆角，左右比面板内沿各收 4（真实面板的内衬）；多列面板（MULTI_COLUMN_LISTS）
//   的行收到列分隔线前，只核左沿。
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
const CARD = '../docs/.vitepress/theme/XhComponentCard.vue'

const VIEW_BOX = '0 0 240 160'
const MAX_ELEMENTS = 40
const STROKE_WIDTHS = new Set(['1', '2', '4', '6', '8'])
const DASH = '4 4'
const TONES = new Set(['brand', 'neutral', 'info', 'success', 'warning', 'danger'])

/** 画颜色本身的组件：示意里的样色取基础色板。 */
const COLOR_SAMPLES = new Set(['color-field', 'color-picker', 'color-slider', 'color-swatch', 'color-swatch-picker'])

/** 色样只取浅档与中性的白、灰：示意图整页是淡彩，500 档的色块会跳出来。 */
const COLOR_SAMPLE_TOKEN = /^--xh-color-(?:neutral-(?:0|500)|(?!neutral)[a-z]+-300)$/

/** 圆角取 sheet 档的示意图：模态与强反馈面。 */
const SHEET_PREVIEWS = new Set(['dialog', 'drawer', 'notification'])
/** 短边不小于这个数的是控件与面，不取 inset。 */
const SURFACE_MIN = 28
/** 大块也取 inset 的：数据标记与色块，连同理由。 */
const INSET_FACES = {
  'color-swatch': '色块 item 取 inset',
  'hierarchy-chart': '矩形树图的格取 inset',
}

/** 淡彩域里不重写的令牌，连同理由。 */
const DOMAIN_EXEMPT = {
  '--xh-fg-on-brand': '实心面上的字条：亮色白、暗色墨，在浅彩实心面上照样成立',
  '--xh-bg-mark': 'Highlight 的标记色就是它自己',
}
/** 不进淡彩域的令牌族：数据色、色样与品牌渐变本来就各有颜色。 */
const DOMAIN_FREE = /^--xh-(?:chart-categorical-|color-|gradient-brand-)/
/** 语气轴里由淡彩域改写的几支；其余（淡底、淡边）是语气轴自己兑出来的，本来就淡。 */
const TONE_REMAPPED = new Set(['--xh-tone-solid', '--xh-tone-fg', '--xh-tone-on'])
const TONE_DILUTED = new Set(['--xh-tone-subtle', '--xh-tone-border'])
/** 不写分类定色规则的分类：取缺省色相（分类色槽 1）。 */
const DEFAULT_HUE_CATEGORIES = new Set(['general', 'chart'])

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

/** 行按面板内衬内缩的列表：锚定浮层里的列表、Listbox、Command 结果列表与 Transfer 列表；其中多列面板的行收到列分隔线前。 */
const INSET_ROW_LISTS = new Set(['menu', 'context-menu', 'menubar', 'select', 'combobox', 'tree-select', 'mention', 'expression-input', 'cascader', 'time-picker', 'time-range-picker', 'listbox', 'command', 'transfer'])
/** 承载列表的面板底：浮层面与页内面。 */
const LIST_PANEL_FILLS = new Set(['var(--xh-bg-surface-raised)', 'var(--xh-bg-surface)'])
/** 列表行的面：悬停淡底，或页内持久集合的选中面。 */
const LIST_ROW_FILL = /^var\(--xh-bg-(?:subtle(?:-hover)?|brand-subtle)\)$/
const MULTI_COLUMN_LISTS = new Set(['cascader', 'time-picker', 'time-range-picker'])
const LIST_ROW_H = 24
/** 真实面板的内衬（Menu、Select 的 content 与 Listbox 同为 --xh-space-1）。 */
const LIST_PANEL_PAD = 4

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

const tokensCss = await readFile(TOKENS_CSS, 'utf8')
const declared = new Set()
for (const m of tokensCss.matchAll(/(--xh-[\w-]+)\s*:/g))
  declared.add(m[1])

// 圆角三档从令牌读：种子乘各档系数，角色只引档
const seed = Number(tokensCss.match(/--xh-radius-seed:\s*([\d.]+)px/)?.[1])
function radiusOf(role) {
  const step = tokensCss.match(new RegExp(`--xh-shape-${role}:\\s*var\\((--xh-radius-[\\w-]+)\\)`))?.[1]
  const value = step && tokensCss.match(new RegExp(`${step}:\\s*([^;]+);`))?.[1]
  const factor = value?.match(/\*\s*([\d.]+)\)/)?.[1]
  return value === 'var(--xh-radius-seed)' ? seed : seed * Number(factor)
}
const RADIUS = { inset: radiusOf('inset'), control: radiusOf('control'), sheet: radiusOf('sheet') }
if (!Object.values(RADIUS).every(Number.isFinite))
  problems.push(`${TOKENS_CSS}:1  读不出圆角档（inset / control / sheet）：令牌结构变了，同步这里的 radiusOf`)
const RADII = new Set(Object.values(RADIUS))
/** 带填充的 path 画的圆角：外沿、描边中线（收半格）、描边内沿（收一格）。 */
const PATH_RADII = new Set([...RADII].flatMap(r => [r, r - 0.5, r - 1]))

// 淡彩域：卡片里 @media not all and (prefers-contrast: more) 这一段
const cardSource = await readFile(CARD, 'utf8')
const domainFrom = cardSource.indexOf('@media not all and (prefers-contrast: more)')
const domainBody = domainFrom < 0 ? '' : cardSource.slice(domainFrom, cardSource.indexOf('.xh-component-card__preview > svg {', domainFrom))
if (!domainBody)
  problems.push(`${CARD}:1  没有淡彩域：示意图的语义令牌要在 @media not all and (prefers-contrast: more) 里重写成分类色相的曲线`)
const domainTokens = new Set()
for (const m of domainBody.matchAll(/^\s*(--xh-[\w-]+):\s*([^;\s][^;]*);/gm)) {
  domainTokens.add(m[1])
  if (!/^(?:var\(--xh-[\w-]+\)|color-mix\(in oklab, var\(--xh-[\w-]+\) \d+%, (?:var\(--xh-[\w-]+\)|transparent)\))$/.test(m[2].trim()))
    problems.push(`${CARD}:1  ${m[1]}: ${m[2].trim()} —— 淡彩域的取值只有 var() 与 color-mix(in oklab, 令牌 N%, 令牌 / transparent)，不写散色`)
}
const hueRules = new Map()
for (const m of cardSource.matchAll(/\.xh-component-grid(?:\[data-category="([\w-]+)"\])?\s*\{\s*--xh-doc-catalog-hue:\s*var\((--xh-[\w-]+)\);/g)) {
  hueRules.set(m[1] ?? '', m[2])
  if (!/^--xh-chart-categorical-[1-8]$/.test(m[2]))
    problems.push(`${CARD}:1  ${m[1] ?? '缺省'} 的色相取 ${m[2]} —— 色相只取分类色槽 --xh-chart-categorical-1…8：明度带与彩度带由色板门禁保证，两档主题都浅`)
}
const usedTokens = new Set()
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
for (const category of manifest.categories) {
  if (!hueRules.has(category.id) && !DEFAULT_HUE_CATEGORIES.has(category.id))
    problems.push(`${CARD}:1  分类 ${category.id} 没有色相：加一条 .xh-component-grid[data-category="${category.id}"]，或登记到 DEFAULT_HUE_CATEGORIES`)
}
for (const id of hueRules.keys()) {
  if (id && !manifest.categories.some(category => category.id === id))
    problems.push(`${CARD}:1  .xh-component-grid[data-category="${id}"] 对不上清单里的分类——分类改名或删了就一起改`)
}

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
        else if (!TONE_REMAPPED.has(token) && !TONE_DILUTED.has(token))
          report(line, `${attr}: ${token} —— 这支语气令牌没有进淡彩域：示意图只取 ${[...TONE_REMAPPED, ...TONE_DILUTED].join(' / ')}，要用别的先在卡片的 [data-tone] 里重写`)
        else if (TONE_REMAPPED.has(token))
          usedTokens.add(token)
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
        else if (!COLOR_SAMPLE_TOKEN.test(token))
          report(line, `${attr}: ${token} —— 色样只取 300 档与中性的 0 / 500：示意图整页是淡彩，深档的色块会跳出来`)
        continue
      }
      const colorFamily = /^--xh-(?:bg|fg|border)-/.test(token)
        || (token.startsWith('--xh-chart-') && !CHART_NON_COLOR.test(token))
        || token.startsWith('--xh-syntax-')
        || /^--xh-gradient-brand-(?:from|to)$/.test(token)
      if (!colorFamily)
        report(line, `${attr}: ${token} —— 颜色只取 --xh-bg / fg / border / chart / syntax / gradient-brand 语义令牌与语气轴`)
      usedTokens.add(token)
      if (colorFamily && !DOMAIN_FREE.test(token) && !Object.hasOwn(DOMAIN_EXEMPT, token) && !domainTokens.has(token))
        report(line, `${attr}: ${token} —— 淡彩域没有重写这支令牌，这里会漏出原色：在 ${CARD} 的淡彩域里加上它，或换一支已有的角色`)
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
      const w = num(attrs.get('width'))
      const h = num(attrs.get('height'))
      const short = Math.min(w, h)
      // 圆角按外沿算：描边压在盒的中线上，外沿比中线多半个线宽，与 CSS 的 border-radius 同一个量
      const half = attrs.has('stroke') && attrs.get('stroke') !== 'none' ? num(attrs.get('stroke-width') ?? 1) / 2 : 0
      const outer = rx + half
      const pill = outer * 2 === short + half * 2
      if (!pill && !RADII.has(outer)) {
        report(line, `<rect rx="${attrs.get('rx')}"> —— 外沿圆角 ${outer}：只取 inset ${RADIUS.inset} / control·surface·overlay ${RADIUS.control} / sheet ${RADIUS.sheet}，或等于外沿短边一半（胶囊）；描边压半格的盒写 rx 时减半个线宽`)
      }
      else if (outer === RADIUS.sheet && !pill && !SHEET_PREVIEWS.has(id)) {
        report(line, `<rect rx="${attrs.get('rx')}"> —— sheet 档只给 ${[...SHEET_PREVIEWS].join(' / ')}：其余面取 ${RADIUS.control}`)
      }
      else if (outer === RADIUS.inset && !pill && short >= SURFACE_MIN && !Object.hasOwn(INSET_FACES, id)) {
        report(line, `<rect rx="${attrs.get('rx')}" width="${w}" height="${h}"> —— 这么大的盒是控件或面，取 ${RADIUS.control}；inset 只给嵌在里面的小块（真实是数据标记或色块就登记 INSET_FACES）`)
      }
      else if (w === h && w <= CHECK_MARKER_MAX && outer !== RADIUS.inset) {
        report(line, `<rect rx="${attrs.get('rx')}" width="${w}" height="${h}"> —— 勾选方框与图例色块取 inset ${RADIUS.inset}`)
      }
    }
    if (name === 'path' && attrs.has('fill') && attrs.get('fill') !== 'none') {
      for (const arc of attrs.get('d').matchAll(/a([\d.]+) ([\d.]+) 0 0 [01] ?(-?[\d.]+)(?:[ ,]|(?=-))(-?[\d.]+)/g)) {
        const [r, ry, dx, dy] = arc.slice(1).map(Number)
        if (r === ry && Math.abs(dx) === r && Math.abs(dy) === r && !PATH_RADII.has(r))
          report(line, `<path> 的圆角 a${r} ${r} —— 路径画的圆角随所贴的面：${[...PATH_RADII].sort((a, b) => a - b).join(' / ')}（外沿、描边中线、描边内沿）`)
      }
      // 紧贴圆角的直边这么长，贴的就是控件或面，不是嵌在里面的小块
      for (const run of attrs.get('d').matchAll(/[hv](-?[\d.]+)a([\d.]+) \2 0 0 [01]/g)) {
        const [edge, r] = run.slice(1).map(Number)
        if (Math.abs(edge) >= SURFACE_MIN && r <= RADIUS.inset && !Object.hasOwn(INSET_FACES, id))
          report(line, `<path> 的圆角 a${r} ${r} 贴着 ${Math.abs(edge)} 长的直边 —— 这是控件或面，圆角取 ${RADIUS.control}（描边中线 ${RADIUS.control - 0.5}、内沿 ${RADIUS.control - 1}）`)
      }
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

  if (INSET_ROW_LISTS.has(id)) {
    // 列表面板：铺浮层面或页内面、描装饰边的 rect；1 线宽描边落在半格，面板内沿比外框各收半格，
    // 行再比内沿收一个内衬
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
      const inner = { start: panel.x + 0.5 + LIST_PANEL_PAD, end: panel.x + panel.w - 0.5 - LIST_PANEL_PAD }
      if (num(row.attrs.get('rx')) !== RADIUS.inset)
        report(row.line, `<rect rx="${row.attrs.get('rx') ?? '缺省'}"> —— 面板里的行取 inset 圆角 rx="${RADIUS.inset}"，与真实的集合行一致`)
      if (row.x !== inner.start)
        report(row.line, `<rect x="${row.x}"> —— 行左沿比面板内沿收一个内衬 x="${inner.start}"`)
      if (!MULTI_COLUMN_LISTS.has(id) && row.x + row.w !== inner.end)
        report(row.line, `<rect width="${row.w}"> —— 行右沿比面板内沿收一个内衬（x + width = ${inner.end}，现在 ${row.x + row.w}）`)
    }
    if (rows === 0)
      report(1, `INSET_ROW_LISTS 登记了 ${id}，但示意图的列表面板里没有 ${LIST_ROW_H} 高的悬停或选中行——画一条，或把名单里这条删掉`)
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
for (const [list, ids] of [['UNFILLED_CONTROL_BOX', Object.keys(UNFILLED_CONTROL_BOX)], ['INSET_ROW_LISTS', INSET_ROW_LISTS], ['MULTI_COLUMN_LISTS', MULTI_COLUMN_LISTS], ['SHEET_PREVIEWS', SHEET_PREVIEWS], ['INSET_FACES', Object.keys(INSET_FACES)]]) {
  for (const id of ids) {
    if (!files.includes(`${id}.vue`))
      problems.push(`${list} 登记了 ${id}，但 ${CATALOG}/${id}.vue 不存在——名单过期了，删掉这条`)
  }
}
for (const id of MULTI_COLUMN_LISTS) {
  if (!INSET_ROW_LISTS.has(id))
    problems.push(`MULTI_COLUMN_LISTS 登记了 ${id}，但它不在 INSET_ROW_LISTS 里——多列只放宽行的右沿，先登记成内缩列表`)
}
// 域里不留没人用的令牌：名单只增不减，就核不出哪支是真要的。域内自己引用的也算用到
for (const token of domainTokens) {
  if (token.startsWith('--xh-doc-catalog-'))
    continue
  if (!usedTokens.has(token) && !domainBody.includes(`var(${token})`))
    problems.push(`${CARD}:1  淡彩域重写了 ${token}，但没有一张示意图用它——删掉这条`)
}
for (const token of Object.keys(DOMAIN_EXEMPT)) {
  if (!usedTokens.has(token))
    problems.push(`DOMAIN_EXEMPT 登记了 ${token}，但没有一张示意图用它——名单过期了，删掉这条`)
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
  + `字段外壳 ${tally.shells} 个按描边铺底，勾选标记 ${tally.markers} 个描重一档，内缩列表行 ${tally.rows} 条；`
  + `圆角与真实组件同值（${[...RADII].join(' / ')}），淡彩域重写 ${domainTokens.size} 支令牌`,
)
