#!/usr/bin/env node
// 门禁：皮肤里位移与缩放的**幅度**不许写字面量，必须取 --xh-motion-distance-sm / -md、--xh-motion-travel 与
// --xh-motion-scale-enter / -press / -drag。
//
// 这条与 check-motion-primitives 拦时长是同一个机制：减弱动效档把 distance-* 重映射成 0px、
// scale-* 重映射成 1，幅度写死的那一处，减弱通道就穿不过去——看上去照常在动。
//
// 难在 translate / scale 上还坐着另一类值：把元素挪到自身尺寸的一半以居中、把覆盖档侧栏收到
// 画外一整条。这类常驻的位置在减弱档必须原样保留，压成 0 就错位、就收不回去，它们是几何不是幅度。
// 只在进出场关键帧里出现的整幅位移（抽屉、轻提示推入推出）是幅度，取 --xh-motion-travel，减弱档归零只剩淡变。
// 判据因此按「减弱档该不该动它」划线，落到可机检的形式上是值本身的单位与形态：
//
//   百分比            相对的是元素自身尺寸，压成 0 就是错位  → 几何，放行
//   无单位 0 / 1      不动 / 原尺寸，本来就是减弱档的目标值  → 退化值，放行
//   任何单位的 0      同样是不动（calc 里与长度相加的兜底只能写 0px）→ 退化值，放行
//   同一条值里带 var  无单位数是对令牌做取反 / 求补 / 求逆    → 系数，放行
//   带长度单位的数    减弱档碰不到它，是幅度就穿不过去        → 判红
//   其余无单位数      同上，且 0.96 这类本身就是幅度         → 判红
//
// 受管位置：translate / scale 两个独立属性、transform 里的 translate*() / scale*() 函数参数、
// var() 的兜底值、calc() 的内部，以及被上述值消费的自定义属性的赋值——原语先灌进槽再消费
// 同样是绕过。只以系数身份被消费的槽（每一处消费它的值里都还有别的 var，它只是乘上去的方向或倍数）
// 按系数看：无单位数放行，带长度单位的照样判红。旋转不在受管之列：语义层没有旋转档，库里的旋转全是四分之一 / 一半 / 整圈这类
// 结构性角度，不是可调幅度。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

/** 扫描面：组件皮肤 + 家族文件（family/motion.css 装着共享关键帧，其余家族文件没有时长与幅度声明）。 */
const STYLES_DIRS = ['packages/design/styles/css', 'packages/design/styles/family']

/** 位移与缩放的两个独立属性，整条值都是幅度。 */
const MANAGED_PROPS = new Set(['translate', 'scale'])

/** transform 简写里只有这两族函数带幅度，rotate / skew / perspective 不看。 */
const TRANSFORM_FN = /(?<![\w-])(?:translate|scale)(?:[XYZ]|3d)?\(/g

/** transform 里位移与缩放函数的参数：按括号配平取，参数里套几层 calc / var 都取得全。 */
function transformArgs(value) {
  const out = []
  for (const m of value.matchAll(TRANSFORM_FN)) {
    const start = m.index + m[0].length
    let depth = 1
    let i = start
    while (i < value.length && depth > 0) {
      if (value[i] === '(')
        depth++
      else if (value[i] === ')')
        depth--
      i++
    }
    out.push(value.slice(start, i - 1))
  }
  return out
}

/** 无单位的退化值：不动、原尺寸。减弱档本来就把幅度压到这两个数。 */
const DEGENERATE = new Set(['0', '1', '-0', '+1'])

/**
 * 静态几何：这些字面长度坐在受管属性上，但元素的 translate / scale 从不参与任何过渡与动画，
 * 减弱档也不该动它们。键写成「文件 · 属性 · 字面量」，脚本另行复核旁证：该声明所在的规则块
 * 里没有 transition / animation 声明。哪天有人给它加上过渡，这条豁免自动失效。
 */
const STATIC_GEOMETRY = {
  'markdown-stream.css · translate · -0.5px': '光标竖线与文字基线的静态对齐，半像素是视觉补正不是位移',
  'icon.css · scale · -1': '翻转是几何不是幅度：沿轴取反把图形照到另一侧，减弱动效档压成 1 等于把翻转撤掉',
}

/** 去掉块注释但保留换行，报错行号才对得上源文件。 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ''))
}

/** 每个 @keyframes 块的 [起, 止) 区间，用于统计有多少幅度写在关键帧里。 */
function keyframeRanges(css) {
  const ranges = []
  for (const m of css.matchAll(/@keyframes\s+[\w-]+\s*\{/g)) {
    let i = m.index + m[0].length
    let depth = 1
    while (i < css.length && depth > 0) {
      if (css[i] === '{')
        depth++
      else if (css[i] === '}')
        depth--
      i++
    }
    ranges.push([m.index, i])
  }
  return ranges
}

/**
 * 逐条声明走一遍，同时给出它所在的最内层块。
 * 块起点用栈记；`;` 与块结束的 `}` 都收一条声明——CSS 允许块内最后一条省略分号，
 * 只认分号的话那一条整个看不见，而看不见的违规比报错危险。
 */
function* declarations(css) {
  const opens = []
  let start = 0

  /** 把 start..end 之间的文本当一条声明收下；不含冒号的（选择器、块尾空白）跳过。 */
  function* take(end, blockStart) {
    const text = css.slice(start, end)
    const colon = text.indexOf(':')
    if (colon > 0) {
      yield {
        prop: text.slice(0, colon).trim(),
        value: text.slice(colon + 1).trim(),
        // 声明的起点还在上一条的分号后面，行号要落到属性名那一格
        index: start + (/\S/.exec(text)?.index ?? 0),
        blockStart,
      }
    }
  }

  for (let i = 0; i < css.length; i++) {
    const c = css[i]
    if (c === '{') {
      opens.push(i + 1)
      start = i + 1
    }
    else if (c === '}') {
      // 块尾那一段可能是省略了分号的最后一条声明
      if (opens.length > 0)
        yield* take(i, opens[opens.length - 1])
      opens.pop()
      start = i + 1
    }
    else if (c === ';' && opens.length > 0) {
      yield* take(i, opens[opens.length - 1])
      start = i + 1
    }
  }
}

/** 块起点对应的整块正文，用于复核豁免旁证。 */
function blockBody(css, blockStart) {
  let i = blockStart
  let depth = 1
  while (i < css.length && depth > 0) {
    if (css[i] === '{')
      depth++
    else if (css[i] === '}')
      depth--
    i++
  }
  return css.slice(blockStart, i - 1)
}

/**
 * 一条值里所有该被判定的数值字面量。
 * 先抹掉自定义属性名（`--xh-motion-distance-sm` 这种名字里也可能带数字），兜底值与 calc 内部留着。
 */
function literals(value) {
  const masked = value.replace(/--[\w-]+/g, '')
  return [...masked.matchAll(/[+-]?(?:\d+\.?\d*|\.\d+)([a-z%]*)/gi)].map(m => ({
    text: m[0],
    unit: m[1].toLowerCase(),
  }))
}

/** 值里的幅度部分：独立属性取整条，transform 只取位移与缩放函数的参数。 */
function amplitudeText(prop, value) {
  if (MANAGED_PROPS.has(prop))
    return value
  if (prop !== 'transform')
    return null
  const args = transformArgs(value)
  return args.length > 0 ? args.join(' ') : null
}

/** 判定一条幅度值，返回违规的字面量。coefficient 为真时按系数看：无单位数一律放行。 */
function offendingLiterals(text, coefficient = false) {
  const derived = coefficient || text.includes('var(')
  const bad = []
  for (const lit of literals(text)) {
    if (lit.unit === '%')
      continue
    // 任何单位的 0 都是不动
    if (Number.parseFloat(lit.text) === 0)
      continue
    if (lit.unit !== '') {
      bad.push(lit.text)
      continue
    }
    const bare = lit.text.replace(/^\+/, '')
    if (DEGENERATE.has(bare) || DEGENERATE.has(lit.text))
      continue
    if (derived)
      continue
    bad.push(lit.text)
  }
  return bad
}

const files = (await Promise.all(STYLES_DIRS.map(async dir =>
  (await readdir(dir)).filter(f => f.endsWith('.css')).sort().map(f => ({ dir, file: dir.endsWith('/family') ? `family/${f}` : f })),
))).flat()
const problems = []
const exemptSeen = new Set()
let amplitudes = 0
let inKeyframes = 0
let slotAssignments = 0

for (const { dir, file } of files) {
  const css = stripComments(await readFile(join(dir, file.replace(/^family\//, '')), 'utf8'))
  const ranges = keyframeRanges(css)
  const decls = [...declarations(css)]
  const lineOf = index => css.slice(0, index).split('\n').length

  // 受管值消费到的自定义属性：槽里灌的也要跟着看一层。
  // 每一处消费都还带着别的 var 的槽只是乘上去的系数（方向、倍数），记下它有没有被单独消费过
  const consumed = new Set()
  const standalone = new Set()

  for (const d of decls) {
    const text = amplitudeText(d.prop, d.value)
    if (text === null)
      continue
    amplitudes++
    if (ranges.some(([a, b]) => d.index >= a && d.index < b))
      inKeyframes++
    const names = [...text.matchAll(/var\(\s*(--[\w-]+)/g)].map(m => m[1])
    for (const name of names) {
      consumed.add(name)
      if (names.every(other => other === name))
        standalone.add(name)
    }

    for (const lit of offendingLiterals(text)) {
      const key = `${file} · ${d.prop} · ${lit}`
      if (key in STATIC_GEOMETRY) {
        exemptSeen.add(key)
        const body = blockBody(css, d.blockStart)
        if (/(?<![\w-])(?:transition|animation)(?:-[\w-]+)?\s*:/.test(body)) {
          problems.push(
            `${file}:${lineOf(d.index)}  ${d.prop}: ${d.value.replace(/\s+/g, ' ')}  —— 登记为静态几何，但所在规则块声明了 transition / animation，旁证不成立`,
          )
        }
        continue
      }
      problems.push(
        `${file}:${lineOf(d.index)}  ${d.prop}: ${d.value.replace(/\s+/g, ' ')}  —— 幅度写死了 ${lit}，位移取 --xh-motion-distance-sm / -md，缩放取 --xh-motion-scale-enter / -press / -drag`,
      )
    }
  }

  // 槽赋值：只看被受管值真消费的那些，且只看自己就是字面量的（值里再引 var 的交给它引的那一层）
  for (const d of decls) {
    if (!d.prop.startsWith('--') || !consumed.has(d.prop) || d.value.includes('var('))
      continue
    slotAssignments++
    for (const lit of offendingLiterals(d.value, !standalone.has(d.prop))) {
      problems.push(
        `${file}:${lineOf(d.index)}  ${d.prop}: ${d.value.replace(/\s+/g, ' ')}  —— 这个槽喂给了位移 / 缩放，幅度写死了 ${lit}，先灌进槽再消费一样是绕过`,
      )
    }
  }
}

for (const key of Object.keys(STATIC_GEOMETRY)) {
  if (!exemptSeen.has(key))
    problems.push(`${key}  登记在 STATIC_GEOMETRY 里却没被扫到——名单过期了`)
}

if (problems.length > 0) {
  console.error('[check-motion-amplitude] ✗ 位移 / 缩放的幅度没走语义层：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('\n百分比与 0 / 1 是几何不是幅度，照写；进出场位移、按压回弹、拖拽放大必须取令牌，否则减弱动效档压不下去。')
  process.exit(1)
}

console.log(
  `[check-motion-amplitude] 通过：${files.length} 份皮肤与家族文件 · ${amplitudes} 处位移 / 缩放声明（其中 ${inKeyframes} 处在关键帧里）`
  + ` · ${slotAssignments} 处喂给它们的槽赋值，幅度全部取自 --xh-motion-distance-* / --xh-motion-travel / --xh-motion-scale-*，`
  + `字面量只剩百分比与 0 / 1 这类几何（静态几何豁免 ${exemptSeen.size} 处）`,
)
