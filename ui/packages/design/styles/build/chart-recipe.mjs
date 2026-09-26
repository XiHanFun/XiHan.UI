import { Buffer } from 'node:buffer'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyFileHeader } from '../../../../tooling/file-header.mjs'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SOURCE = join(ROOT, 'recipes', 'chart.recipe.json')
const OUTPUT = join(ROOT, 'family', 'chart.css')

/** 各图表要在对应部件上接进来的私有槽：键是配方里的用途，值是槽名。 */
export const CHART_CONTRACT_FIELDS = [
  'gap',
  'height',
  'legendGap',
  'legendSwatchRadius',
  'legendSwatchLineRadius',
  'tooltipGap',
  'tooltipPadBlock',
  'tooltipPadInline',
  'tooltipRadius',
  'tooltipShadow',
  'tooltipRowGap',
  'tooltipSwatchRadius',
  'tooltipSwatchLineRadius',
  'emptyGap',
]
/** 只有画折线色标的图表才要接的槽：没有折线的图表不投影 data-mark="line"，这两条规则不生效。 */
export const CHART_LINE_CONTRACT_FIELDS = ['legendSwatchLineRadius', 'tooltipSwatchLineRadius']
const LAYOUT_FIELDS = ['fontSize']
const LEGEND_FIELDS = ['swatchSize', 'swatchBorder', 'lineThickness', 'hiddenFg']
const TOOLTIP_FIELDS = ['minInlineSize', 'offsetInline', 'offsetBlock', 'swatchSize', 'lineThickness']
const LOADING_FIELDS = ['ringSize', 'ringWidth', 'track']
const FORCED_FIELDS = ['mark', 'focusRing', 'hidden']

function fail(message) {
  throw new Error(`[chart-recipe] ${message}`)
}

function assertRecord(value, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    fail(`${path} 必须是对象`)
}

function assertExactKeys(value, expected, path) {
  assertRecord(value, path)
  const actual = Object.keys(value).sort()
  const wanted = [...expected].sort()
  if (actual.join(',') === wanted.join(','))
    return
  const unknown = actual.filter(name => !wanted.includes(name))
  const missing = wanted.filter(name => !actual.includes(name))
  fail(
    `${path} 键集合不完整`
    + `${unknown.length ? `；未知：${unknown.join(', ')}` : ''}`
    + `${missing.length ? `；缺少：${missing.join(', ')}` : ''}`,
  )
}

function assertString(value, path) {
  if (typeof value !== 'string' || value.trim().length === 0)
    fail(`${path} 必须是非空字符串`)
}

function assertFields(value, fields, path) {
  assertExactKeys(value, fields, path)
  for (const field of fields)
    assertString(value[field], `${path}.${field}`)
}

export function assertChartRecipe(source) {
  assertExactKeys(source, ['$description', 'version', 'contract', 'layout', 'legend', 'tooltip', 'loading', 'print', 'forcedColors'], 'root')
  assertString(source.$description, 'root.$description')
  if (source.version !== 1)
    fail('version 只支持 1')
  assertFields(source.contract, CHART_CONTRACT_FIELDS, 'root.contract')
  for (const field of CHART_CONTRACT_FIELDS) {
    if (!/^--xh-_chart-[a-z-]+$/.test(source.contract[field]))
      fail(`contract.${field} 必须是 --xh-_chart- 开头的私有槽`)
  }
  assertFields(source.layout, LAYOUT_FIELDS, 'root.layout')
  assertFields(source.legend, LEGEND_FIELDS, 'root.legend')
  assertFields(source.tooltip, TOOLTIP_FIELDS, 'root.tooltip')
  assertFields(source.loading, LOADING_FIELDS, 'root.loading')
  assertFields(source.print, ['strategy'], 'root.print')
  if (source.print.strategy !== 'exact-color')
    fail('print.strategy 必须为 exact-color：数据色就是数据的编码，打印时不能被抽掉')
  assertFields(source.forcedColors, FORCED_FIELDS, 'root.forcedColors')
}

/** 家族部件的选择器：各图表的 connect 在部件上投影 data-xh-chart-part，取值与部件名相同。 */
function part(name) {
  return `[data-xh-chart-part='${name}']`
}

export function compileChartRecipe(source) {
  assertChartRecipe(source)
  const selectors = new Set()
  const chunks = []
  // 说明写在紧接着的那条规则（或那个 @media 块）头上
  let pending = null
  const comment = (text) => {
    pending = text
  }
  const lead = (indent) => {
    const text = pending == null ? '' : `${indent}/* ${pending} */\n`
    pending = null
    return text
  }
  const rule = (selector, body, context = 'root', target = chunks, indent = '  ') => {
    const branches = selector.split(',').map(value => value.trim())
    for (const branch of branches) {
      const key = `${context}\n${branch}`
      if (selectors.has(key))
        fail(`生成了重复选择器：${branch} (${context})`)
      selectors.add(key)
    }
    const pad = `${indent}  `
    const lines = (Array.isArray(body) ? body : [body]).map(line => (line.length ? `${pad}${line}` : line))
    target.push(`${target === chunks ? lead(indent) : ''}${indent}${branches.join(`,\n${indent}`)} {\n${lines.join('\n')}\n${indent}}`)
  }
  const slot = field => `var(${source.contract[field]})`
  const { layout, legend, tooltip, loading, forcedColors } = source

  comment('根不画外边、不填底，透出宿主面；需要框时由作者放进 Card。提示框按根的内边距盒绝对定位，参照系就是它；\n     它抬的那一层只在根里排序。图随容器铺满：在 flex / grid 里也不按内容收缩成默认的 300px')
  rule(part('root'), [
    'position: relative;',
    'isolation: isolate;',
    'display: flex;',
    'flex-direction: column;',
    `gap: ${slot('gap')};`,
    'inline-size: 100%;',
    'margin: 0;',
    'min-inline-size: 0;',
    'color: var(--xh-fg-default);',
    `font-size: ${layout.fontSize};`,
  ])

  rule(part('caption'), [
    'font-size: var(--xh-text-label-size);',
    'font-weight: var(--xh-text-label-weight);',
    'color: var(--xh-fg-default);',
  ])

  comment('视口的块尺寸含坐标轴与标签带，宽度铺满；卡片里不出现嵌套的纵向滚动。它是尺寸观测的宿主')
  rule(part('viewport'), [
    'position: relative;',
    'inline-size: 100%;',
    `block-size: ${slot('height')};`,
    'min-inline-size: 0;',
  ])

  comment('重取数据：保留上一帧，整体淡下去，不闪骨架、不跳布局')
  rule(`${part('root')}[data-loading] > ${part('viewport')}`, [
    'opacity: var(--xh-chart-pending-alpha);',
    'transition: opacity var(--xh-motion-duration-micro) var(--xh-motion-ease-enter);',
  ])

  comment('绘图区脱离文档流：svg 的 width 属性来自测得的视口宽，留在流里会反过来撑住视口，容器收窄时图不跟着缩。\n     斜排的刻度标签与外侧标签会伸出盒子，不裁；焦点环由 focus-ring 部件画在标记外，不靠 SVG 元素自己的 outline')
  rule(part('plot'), [
    'position: absolute;',
    'inset: 0;',
    'display: block;',
    'inline-size: 100%;',
    'block-size: 100%;',
    'overflow: visible;',
    'font-size: var(--xh-_chart-metric-font-size);',
    'font-variant-numeric: tabular-nums;',
    'outline: none;',
  ])
  rule(`${part('plot')} [tabindex]`, 'outline: none;')

  rule(part('focus-ring'), [
    'fill: none;',
    'stroke: var(--xh-ring-focus);',
    'stroke-width: var(--xh-ring-width);',
  ])

  comment('引导线是标注：结构线色的细线，不取系列色；所属的系列或扇区淡出时一起淡出')
  rule(part('leader-line'), [
    'fill: none;',
    'stroke: var(--xh-chart-axis);',
    'stroke-width: var(--xh-stroke-thin);',
  ])
  rule(`${part('leader-line')}[data-dimmed]`, 'opacity: var(--xh-chart-dim-alpha);')
  comment('首次出现：等描线的笔尖或扫开的边缘到了才淡入。连接层写入它占入场时长的比例，乘上入场时长就是延迟，\n     作者改时长、系统开减弱动效时跟着缩放')
  rule(`${part('leader-line')}[data-drawing]`, [
    'animation: xh-fade-in var(--xh-motion-duration-enter) var(--xh-motion-ease-enter) both;',
    'animation-delay: calc(var(--xh-motion-duration-reveal) * var(--xh-_chart-reveal-at));',
  ])

  comment('图例：工具条，项是 Action Control 的 text 档')
  rule(part('legend'), [
    'display: flex;',
    'flex-wrap: wrap;',
    `gap: ${slot('legendGap')};`,
  ])
  rule(part('legend-item'), 'color: var(--xh-fg-default);')
  comment('色标：面（柱、面积、扇区）是 inset 圆角的方块，折线是一段短线；隐藏时只留描边（空心）。\n     方块边长取 12px：inset 圆角是 4px，再小就成了圆点，与散点的符号分不开')
  rule(part('legend-swatch'), [
    'flex: none;',
    `inline-size: ${legend.swatchSize};`,
    `block-size: ${legend.swatchSize};`,
    `border: ${legend.swatchBorder} solid var(--xh-_chart-series);`,
    `border-radius: ${slot('legendSwatchRadius')};`,
    'background: var(--xh-_chart-series);',
  ])
  rule(`${part('legend-swatch')}[data-mark='line']`, [
    `inline-size: ${legend.swatchSize};`,
    'block-size: 0;',
    `border-width: ${legend.lineThickness};`,
    `border-radius: ${slot('legendSwatchLineRadius')};`,
  ])
  comment('显隐标记：开是常态，不用品牌淡底；隐藏的项空心色标、次级字色、删除线')
  rule(`${part('legend-item')}[aria-pressed='false']`, [
    `color: ${legend.hiddenFg};`,
    'text-decoration: line-through;',
  ])
  rule(`${part('legend-item')}[aria-pressed='false'] > ${part('legend-swatch')}`, 'background: transparent;')

  comment('提示框：frosted 材质，画在根里；绘图区不随 RTL 镜像，这里的左右也是物理方向。正文排版，与根同一档：\n     不反白、不缩字，色标按承载面校准。提示框不接指针：跟着指针走时压住下面的标记，命中就断了')
  const up = `calc(-100% - ${tooltip.offsetBlock})`
  const left = `calc(-100% - ${tooltip.offsetInline})`
  rule(part('tooltip'), [
    'position: absolute;',
    'inset-block-start: var(--xh-_chart-tip-y, 0);',
    '/* stylelint-disable-next-line property-disallowed-list -- 绘图区不随 RTL 镜像，锚点横坐标由连接层按物理左缘写入 */',
    'left: var(--xh-_chart-tip-x, 0);',
    'z-index: 1;',
    'display: grid;',
    `gap: ${slot('tooltipGap')};`,
    `min-inline-size: ${tooltip.minInlineSize};`,
    `padding-block: ${slot('tooltipPadBlock')};`,
    `padding-inline: ${slot('tooltipPadInline')};`,
    'border: var(--xh-stroke-thin) solid var(--xh-material-frosted-border);',
    `border-radius: ${slot('tooltipRadius')};`,
    'background:',
    '  linear-gradient(',
    '    to bottom,',
    '    var(--xh-material-frosted-highlight) 0 var(--xh-stroke-thin),',
    '    transparent var(--xh-stroke-thin)',
    '  ),',
    '  var(--xh-material-frosted-bg);',
    'color: var(--xh-material-frosted-fg);',
    `box-shadow: ${slot('tooltipShadow')};`,
    '-webkit-backdrop-filter: var(--xh-material-frosted-backdrop);',
    'backdrop-filter: var(--xh-material-frosted-backdrop);',
    `font-size: ${layout.fontSize};`,
    'white-space: nowrap;',
    'pointer-events: none;',
    `translate: ${tooltip.offsetInline} ${up};`,
  ])
  comment('落点：锚点在右半边时长在左侧，在上半边时向下长')
  rule(`${part('tooltip')}[data-placement='top-left']`, `translate: ${left} ${up};`)
  rule(`${part('tooltip')}[data-placement='bottom-right']`, `translate: ${tooltip.offsetInline} ${tooltip.offsetBlock};`)
  rule(`${part('tooltip')}[data-placement='bottom-left']`, `translate: ${left} ${tooltip.offsetBlock};`)
  comment('露不露是从激活的数据算出来的派生显隐：首次出现淡入，跟着指针移动时不做位置过渡')
  rule(`${part('tooltip')}[data-state='hidden']`, [
    'visibility: hidden;',
    'opacity: 0;',
  ])
  rule(`${part('tooltip')}[data-state='visible']`, 'transition: opacity var(--xh-motion-duration-micro) var(--xh-motion-ease-enter);')
  rule(part('tooltip-header'), 'font-weight: var(--xh-font-weight-medium);')
  comment('一行：色标、数值、说明。数值在前并加重，说明在后是次级文字——读者已知系列，要看的是数')
  rule(part('tooltip-row'), [
    'display: flex;',
    'align-items: center;',
    `gap: ${slot('tooltipRowGap')};`,
  ])
  rule(part('tooltip-swatch'), [
    'flex: none;',
    `inline-size: ${tooltip.swatchSize};`,
    `block-size: ${tooltip.swatchSize};`,
    `border-radius: ${slot('tooltipSwatchRadius')};`,
    'background: var(--xh-_chart-series);',
  ])
  rule(`${part('tooltip-swatch')}[data-mark='line']`, [
    `inline-size: ${tooltip.swatchSize};`,
    `block-size: ${tooltip.lineThickness};`,
    `border-radius: ${slot('tooltipSwatchLineRadius')};`,
  ])
  rule(part('tooltip-value'), [
    'font-weight: var(--xh-font-weight-medium);',
    'font-variant-numeric: tabular-nums;',
  ])
  rule(part('tooltip-name'), 'color: var(--xh-fg-muted);')
  comment('指针或焦点所在的那个系列：说明升为正文色，一眼找到自己指着的那一行')
  rule(`${part('tooltip-row')}[data-current] > ${part('tooltip-name')}`, 'color: var(--xh-fg-default);')

  comment('空态叠在视口上，居中')
  rule(part('empty'), [
    'position: absolute;',
    'inset: 0;',
    'display: flex;',
    'align-items: center;',
    'justify-content: center;',
    'color: var(--xh-fg-muted);',
    'font-size: var(--xh-text-secondary-size);',
  ])
  comment('取数中、还没有可画的数据：文字前转一个圈，与 Spinner 同一副画法——整圈是轨道色，起始边是前景色')
  rule(`${part('empty')}[data-state='loading']`, `gap: ${slot('emptyGap')};`)
  rule(`${part('empty')}[data-state='loading']::before`, [
    'content: \'\';',
    'box-sizing: border-box;',
    'flex: none;',
    `inline-size: ${loading.ringSize};`,
    `block-size: ${loading.ringSize};`,
    `border: ${loading.ringWidth} solid ${loading.track};`,
    'border-block-start-color: currentColor;',
    'border-radius: var(--xh-shape-circle);',
    'animation: xh-spin var(--xh-motion-loop-spin) var(--xh-motion-ease-loop) infinite;',
  ])
  comment('减弱动效：圈停下、换成点线，文字照写。两组规则是同一件事的两个触发条件：系统偏好与作者打的 data-motion')
  const reduced = []
  rule(`${part('empty')}[data-state='loading']::before`, [
    'border-style: dotted;',
    'animation: none;',
  ], 'reduced-motion', reduced, '    ')
  chunks.push(`${lead('  ')}  @media (prefers-reduced-motion: reduce) {\n${reduced.join('\n\n')}\n  }`)
  rule(`:where([data-motion='reduce']) ${part('empty')}[data-state='loading']::before`, [
    'border-style: dotted;',
    'animation: none;',
  ])

  comment('声明了 display 的部件：作者写 hidden 时照样收起')
  rule([
    `${part('root')}[hidden]`,
    `${part('legend')}[hidden]`,
    `${part('plot')}[hidden]`,
    `${part('tooltip')}[hidden]`,
    `${part('tooltip-row')}[hidden]`,
    `${part('empty')}[hidden]`,
  ].join(', '), 'display: none;')

  comment('强制色：焦点环取高亮色，引导线取系统前景色；色标退出强制着色保住形状，填系统前景色；\n     图例隐藏态保留空心与删除线')
  const forced = []
  rule(part('focus-ring'), `stroke: ${forcedColors.focusRing};`, 'forced-colors', forced, '    ')
  rule(part('leader-line'), `stroke: ${forcedColors.mark};`, 'forced-colors', forced, '    ')
  rule(`${part('legend-swatch')}, ${part('tooltip-swatch')}`, [
    'forced-color-adjust: none;',
    `border-color: ${forcedColors.mark};`,
    `background: ${forcedColors.mark};`,
  ], 'forced-colors', forced, '    ')
  rule(`${part('legend-item')}[aria-pressed='false'] > ${part('legend-swatch')}`, `background: ${forcedColors.hidden};`, 'forced-colors', forced, '    ')
  rule(part('tooltip'), 'background-image: none;', 'forced-colors', forced, '    ')
  chunks.push(`${lead('  ')}  @media (forced-colors: active) {\n${forced.join('\n\n')}\n  }`)

  comment('打印：纸上没有指针，提示框与焦点环不印；数据色照印')
  const print = []
  rule(part('root'), 'print-color-adjust: exact;', 'print', print, '    ')
  rule(`${part('tooltip')}, ${part('focus-ring')}`, 'display: none;', 'print', print, '    ')
  chunks.push(`${lead('  ')}  @media print {\n${print.join('\n\n')}\n  }`)

  const head = [
    '/* AUTO-GENERATED by build/chart-recipe.mjs — do not edit. */',
    '',
    '/* 转圈与淡入关键帧由 motion.css 提供：引入本配方的图表皮肤同时 @import 它；家族文件之间不互相引入，',
    '   全量入口里每份家族只内联一次。 */',
    '',
  ].join('\n')
  return applyFileHeader(OUTPUT, `${head}@layer xihan.components {\n${chunks.join('\n\n')}\n}\n`)
}

export async function emitChartRecipe(options = {}) {
  const sourcePath = options.sourcePath ?? SOURCE
  const outputPath = options.outputPath ?? OUTPUT
  const source = JSON.parse(await readFile(sourcePath, 'utf8'))
  const css = compileChartRecipe(source)
  if (options.check) {
    const actual = await readFile(outputPath, 'utf8').catch(() => null)
    if (actual !== css)
      throw new Error(`[chart-recipe] 生成物漂移：${outputPath}`)
  }
  else {
    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, css, 'utf8')
  }
  return { bytes: Buffer.byteLength(css), contract: source.contract }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  emitChartRecipe()
    .then(result => console.log(`[chart-recipe] ${Object.keys(result.contract).length} contract slots -> ${result.bytes} bytes`))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
