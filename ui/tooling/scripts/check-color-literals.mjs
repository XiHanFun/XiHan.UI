#!/usr/bin/env node
// 门禁：皮肤里的颜色一律出自令牌，不许写颜色字面量。
//
// stylelint 的颜色白名单只挂在六个长属性上（color / background-color / border-color /
// outline-color / fill / stroke）。颜色能进 CSS 的口子远不止这六个：`background` 简写、
// `border` 简写、`box-shadow` 的颜色位、还有先灌进私有槽再消费的 `--xh-_bg: #f00`——
// 这四类今天一条规则都不响。写死的颜色换肤时不跟着走，深色档下它还是那个色，
// 而现有门禁只验令牌自己的取值，一路绿灯。这条把口子按属性补齐。
//
// 扫的是取值里的颜色字面量：#rrggbb / rgb() / rgba() / hsl() / hsla() / hwb() /
// lab() / lch() / oklab() / oklch() / color() 以及 CSS 具名色。
// 不算字面量的四类：
//   var(--…) 的令牌名（令牌名里带 purple、white 也只是名字，取值仍在令牌层）；
//   相对颜色语法 fn(from …)（源色是令牌，函数只做推导）；
//   url() 里的内容（那是资源路径，不是取值）；
//   transparent / currentColor / inherit / none 这类关键字。
// var() 的兜底位不在豁免之列：兜底写死同样是一处换不动的颜色。
//
// GEOMETRY 登记的是画的就是颜色本身、跟着主题换反而画错的地方。登记项扫不到即判失败，
// 免得名单变成过期的免检通行证。
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const cssDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../packages/design/styles/css',
)

/**
 * 会吃颜色的属性，以及私有槽赋值——原语先灌进私有槽再消费同样是把颜色写死在皮肤里。
 * 简写（background / border / outline / mask / list-style / filter）与颜色位在中间的
 * box-shadow、text-shadow 都在内，长属性只是其中一小撮。
 */
const COLOR_PROP = /^(?:color|background|background-color|background-image|border|border-(?:top|bottom|left|right)|border-(?:block|inline)(?:-(?:start|end))?|border-color|border-(?:top|bottom|left|right)-color|border-(?:block|inline)(?:-(?:start|end))?-color|border-image|border-image-source|outline|outline-color|box-shadow|text-shadow|text-decoration|text-decoration-color|text-emphasis-color|column-rule|column-rule-color|caret-color|accent-color|scrollbar-color|fill|stroke|stop-color|flood-color|lighting-color|-webkit-text-fill-color|mask|mask-image|-webkit-mask|-webkit-mask-image|list-style|list-style-image|filter|backdrop-filter|--xh-[\w-]*)$/

/**
 * 画的就是颜色本身的地方：这里的颜色是坐标不是设计色，跟着主题走反而画错。
 * 键写成「组件:部件[::伪元素]」，literals 是这处允许出现的全部字面量——
 * 多出一个没登记的照样报，登记了却扫不到的报名单过期。
 */
const GEOMETRY = {
  'color-picker:area::before': {
    reason: '饱和度/明度方块画的是 HSV 的两根坐标轴，黑与白是轴的两端，换成主题色就取不出色了',
    literals: ['black', 'white'],
  },
  'color-picker:channel-slider-track': {
    reason: '色相条画的是色相本身，七段取的是色环上的等分角度，跟着主题换色就不是色相条了',
    literals: [
      'hsl(0deg 100% 50%)',
      'hsl(60deg 100% 50%)',
      'hsl(120deg 100% 50%)',
      'hsl(180deg 100% 50%)',
      'hsl(240deg 100% 50%)',
      'hsl(300deg 100% 50%)',
      'hsl(360deg 100% 50%)',
    ],
  },
}

/**
 * 色阶原语：`--xh-color-<族>-<档>`，档位是数字。它只在令牌产物的根上声明一次，
 * 浅色档与深色档都不重声明——皮肤直接引它，那处颜色就四季不变，而同族的语义令牌
 * （--xh-bg-brand 浅色指 600、深色指 500）是逐主题给值的。换肤同理：使用者换的是语义层。
 * 所以语义令牌是皮肤取色的唯一入口。
 *
 * PRIMITIVE_OK 登记的是「这处画的东西本来就不该随主题翻」。登记项扫不到即判失败。
 * `--xh-color-picker-*` 那一族不在此列：它是组件槽，档位段不是数字，判据认得出来。
 */
const PRIMITIVE_TOKEN = /--xh-color-([a-z]+)-(\d+)(?![\w-])/g
const PRIMITIVE_OK = {
  'tone.css': {
    reason: '语气层就是语义色的产地：六族的主色、实心底上的前景与交互挪动方向在这里兑成 --xh-_tone-* 私有槽，下游组件只读私有槽。实心底本身不随主题翻，配色跟着翻就会变成白字压浅黄底',
    tokens: ['neutral-0', 'neutral-550', 'neutral-600', 'neutral-950', 'success-600', 'warning-600', 'warning-700', 'danger-600', 'info-600'],
  },
  'heatmap.css': {
    reason: '色板是数据可视化的配色轴，六档各指名一个颜色；借道语气槽会把语气的悬停 / 淡底 / 前景一起绑进来，也会被祖先的 data-tone 染色。灰那一族按主题分了两档，是唯一的例外',
    tokens: ['neutral-450', 'neutral-600', 'success-600', 'warning-600', 'danger-600', 'info-600', 'purple-600'],
  },
  'result.css': {
    reason: '四档结果色标取 500 那一装饰档，与语气层实心底用的 600 档不同源',
    tokens: ['success-500', 'warning-500', 'danger-500', 'info-500'],
  },
  'rating.css': {
    reason: '没写 data-tone 时点亮色退回警示色；这一支是语气缺席时的落点，与语气层同族同档',
    tokens: ['warning-500'],
  },
  'image-viewer.css': {
    reason: '看图时整块画布是恒定的深底加浅字，照片要在中性底上看，不随主题翻',
    tokens: ['neutral-0', 'neutral-950'],
  },
  'qr-code.css': {
    reason: '码点必须比底色深且对比要足，反相与深浅相近都会让一部分读码器扫不出来',
    tokens: ['neutral-0', 'neutral-950'],
  },
  'color-picker.css': {
    reason: '拇指描边压在使用者选的任意颜色上，要恒定；棋盘格画的是「透明」这件事本身',
    tokens: ['neutral-0', 'neutral-300'],
  },
}

/** CSS 具名色全表。这些词单独出现在会吃颜色的取值里就是写死的颜色。 */
const NAMED_COLORS = new Set(`aliceblue antiquewhite aqua aquamarine azure beige bisque black
blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue
cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki
darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue
darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue
firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow
grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon
lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink
lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime
limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen
mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose
moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen
paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red
rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue
slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white
whitesmoke yellow yellowgreen`.split(/\s+/))

/** 写颜色的函数。color() 与 oklch() 等还能带 from 做相对推导，那一支单独放行。 */
const COLOR_FN = /(?<![\w-])(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/gi

/** 找出 expr 中从 start 处那个 `(` 起配对的 `)` 下标；不配对则返回末尾。 */
function closingParen(expr, start) {
  let depth = 0
  for (let i = start; i < expr.length; i++) {
    if (expr[i] === '(')
      depth++
    else if (expr[i] === ')' && --depth === 0)
      return i
  }
  return expr.length - 1
}

/**
 * 把不该被当成字面量的片段就地涂白（等长空格，下标与行号不移位）：
 * url() 整体、var() 的令牌名（兜底位留着继续扫）、相对颜色语法 fn(from …) 整体。
 */
function maskNonLiterals(value) {
  const chars = [...value]
  const blank = (from, to) => {
    for (let i = from; i <= to && i < chars.length; i++) {
      if (chars[i] !== '\n')
        chars[i] = ' '
    }
  }
  for (let i = 0; i < value.length; i++) {
    if (value[i] !== '(')
      continue
    const head = /(?:^|[^\w-])([\w-]+)$/.exec(value.slice(0, i))
    if (!head)
      continue
    const name = head[1].toLowerCase()
    const open = i
    const close = closingParen(value, open)
    if (name === 'url') {
      blank(open - name.length, close)
      continue
    }
    if (name === 'var') {
      // 只涂令牌名：第一个顶层逗号之前，没有逗号就整只 var() 都是名字
      let depth = 0
      let cut = close
      for (let j = open; j <= close; j++) {
        if (value[j] === '(') {
          depth++
        }
        else if (value[j] === ')') {
          depth--
        }
        else if (value[j] === ',' && depth === 1) {
          cut = j
          break
        }
      }
      blank(open - name.length, cut)
      continue
    }
    // fn(from <源色> …)：源色是令牌，函数只做推导，整只放行
    if (/^(?:color|oklch|oklab|lab|lch|rgb|hsl|hwb)$/.test(name) && /^\(\s*from(?![\w-])/.test(value.slice(open, close + 1)))
      blank(open - name.length, close)
  }
  return chars.join('')
}

/** 从一段取值里挑出颜色字面量，返回原文数组。 */
function findLiterals(value) {
  const masked = maskNonLiterals(value)
  const hits = []
  for (const m of masked.matchAll(/#[0-9a-f]{3,8}(?![\w-])/gi))
    hits.push(m[0])
  for (const m of masked.matchAll(COLOR_FN)) {
    const open = m.index + m[0].length - 1
    hits.push(masked.slice(m.index, closingParen(masked, open) + 1).replace(/\s+/g, ' '))
  }
  // 后瞻里的 `(` 把函数名挡掉：linear-gradient( 的名字不是具名色，颜色函数上面已经取过
  for (const m of masked.matchAll(/(?<![\w-])[a-z]+(?![-\w(])/gi)) {
    if (NAMED_COLORS.has(m[0].toLowerCase()))
      hits.push(m[0])
  }
  return hits
}

/**
 * 逐条走出文件里的声明，连同它所在规则的选择器。
 * 自己走一遍而不用整块正则：皮肤里有嵌套规则，块级正则会把嵌套层的声明整段漏掉。
 */
function eachDeclaration(text, visit) {
  const stack = []
  let start = 0
  const emit = (end) => {
    const raw = text.slice(start, end)
    const colon = raw.indexOf(':')
    if (colon === -1)
      return
    visit({
      prop: raw.slice(0, colon).trim(),
      value: raw.slice(colon + 1),
      at: start + (raw.length - raw.trimStart().length),
      selector: stack[stack.length - 1] ?? '',
    })
  }
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '\'' || ch === '"') {
      // 字符串里的花括号与分号不是结构符号（content: '}' 那种）
      for (i++; i < text.length && text[i] !== ch; i++) {
        if (text[i] === '\\')
          i++
      }
      continue
    }
    if (ch === '{') {
      stack.push(text.slice(start, i).trim().replace(/\s+/g, ' '))
      start = i + 1
    }
    else if (ch === '}') {
      emit(i)
      stack.pop()
      start = i + 1
    }
    else if (ch === ';') {
      emit(i)
      start = i + 1
    }
  }
}

const offenders = []
const stale = []
const geometrySeen = new Map()
const primitiveSeen = new Map()
let scanned = 0
let checked = 0
let primitiveRefs = 0

for (const file of fs.readdirSync(cssDir).filter(f => f.endsWith('.css')).sort()) {
  scanned++
  const comp = file.replace(/\.css$/, '')
  // 注释整段涂白：注释里举的反例不是代码。等长空格保住行号
  const text = fs.readFileSync(path.join(cssDir, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
  const lineAt = index => text.slice(0, index).split('\n').length

  // 色阶原语按整份文件扫：原语能经任意自定义属性中转，不限于会吃颜色的那些属性
  const allowed = PRIMITIVE_OK[file]
  const seenHere = allowed ? (primitiveSeen.get(file) ?? new Set()) : null
  if (seenHere)
    primitiveSeen.set(file, seenHere)
  for (const m of text.matchAll(PRIMITIVE_TOKEN)) {
    primitiveRefs++
    const step = `${m[1]}-${m[2]}`
    if (allowed?.tokens.includes(step)) {
      seenHere.add(step)
      continue
    }
    offenders.push(`${file}:${lineAt(m.index)}  直引了色阶原语 --xh-color-${step}`)
  }

  eachDeclaration(text, ({ prop, value, at, selector }) => {
    if (!COLOR_PROP.test(prop))
      return
    checked++
    const hits = findLiterals(value)
    if (hits.length === 0)
      return

    const parts = [...selector.matchAll(/data-part='([a-z-]+)'/g)].map(x => x[1])
    const pseudo = /::(before|after)/.exec(selector)?.[1]
    const key = `${comp}:${parts.at(-1) ?? '?'}${pseudo ? `::${pseudo}` : ''}`
    const entry = GEOMETRY[key]
    const seen = entry ? (geometrySeen.get(key) ?? new Set()) : null
    if (seen)
      geometrySeen.set(key, seen)

    for (const hit of hits) {
      if (entry?.literals.includes(hit)) {
        seen.add(hit)
        continue
      }
      offenders.push(`${file}:${lineAt(at)}  ${prop}  写死了 ${hit}`)
    }
  })
}

for (const [key, entry] of Object.entries(GEOMETRY)) {
  const seen = geometrySeen.get(key)
  if (!seen) {
    stale.push(`${key}  登记在 GEOMETRY 里却没被扫到——名单过期了`)
    continue
  }
  for (const literal of entry.literals) {
    if (!seen.has(literal))
      stale.push(`${key}  登记的 ${literal} 没被扫到——名单过期了`)
  }
}

for (const [file, entry] of Object.entries(PRIMITIVE_OK)) {
  const seen = primitiveSeen.get(file)
  if (!seen) {
    stale.push(`${file}  登记在 PRIMITIVE_OK 里却没被扫到——名单过期了`)
    continue
  }
  for (const step of entry.tokens) {
    if (!seen.has(step))
      stale.push(`${file}  登记的 --xh-color-${step} 没被扫到——名单过期了`)
  }
}

// 两块一起打印再退：例外的键写错时两块会同时亮（那处成了违规，名单也扫不到），
// 只打头一块会把「名单过期」这条真正的病因藏起来
if (offenders.length > 0 || stale.length > 0) {
  if (offenders.length > 0) {
    console.error('[check-color-literals] ✗ 皮肤里写死了颜色，换肤时它不跟着走：')
    for (const o of offenders)
      console.error(`  ${o}`)
    console.error('改成 var(--xh-<组件>-<部件>-<角色>, var(--xh-…语义令牌))；画的就是颜色本身的（色相条、取色方块）登记进 GEOMETRY，本来就不该随主题翻的登记进 PRIMITIVE_OK。')
  }
  if (stale.length > 0) {
    console.error('[check-color-literals] ✗ 名单过期：')
    for (const s of stale)
      console.error(`  ${s}`)
  }
  process.exit(1)
}

const exempt = [...geometrySeen.values()].reduce((n, s) => n + s.size, 0)
console.log(`[check-color-literals] 通过：${scanned} 份皮肤 · ${checked} 处吃颜色的声明全部走令牌（画色本身的 ${Object.keys(GEOMETRY).length} 处共 ${exempt} 个字面量已登记）`)
console.log(`[check-color-literals] 通过：${primitiveRefs} 处直引色阶原语的都在 PRIMITIVE_OK 的 ${Object.keys(PRIMITIVE_OK).length} 份皮肤里，其余皮肤只经语义令牌取色`)
