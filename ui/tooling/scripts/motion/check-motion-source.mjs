#!/usr/bin/env node
// 门禁：JS 动画引擎的缓动与时长常量必须逐字等于令牌，双向对账。
//
// 真源是 packages/design/tokens：primitive.json 的 ease.* 与 duration.*，
// semantic.base.json 的 motion.duration-* 与 motion.ease-*，semantic.reduce.json 的减弱档。
// @xihan-ui/motion 是 engine 组，不能依赖 design 组，所以它把同一批值抄成常量：
//   easing.ts   —— 原语曲线（名字按 JS 习惯写成驼峰）
//   durations.ts —— 原语时长
//   semantic.ts —— 语义时长、减弱档语义时长、语义缓动（值引用上面两张表）
//   spring.ts   —— 弹簧预设（semantic.base.json 的 motion.spring-<名>.stiffness / damping，质量恒为 1）
// 两边互不引用，任何一边改了值另一边不会报错，只有这里对账。
// 对账是双向的：令牌多出来的名字 JS 要补，JS 多出来的名字要么删、要么登记在 JS_ONLY 并写明理由。
import { readFile } from 'node:fs/promises'

const TOKENS = 'packages/design/tokens/tokens'
const PRIMITIVE = `${TOKENS}/primitive.json`
const BASE = `${TOKENS}/semantic.base.json`
const REDUCE = `${TOKENS}/semantic.reduce.json`
const EASING_TS = 'packages/engine/motion/src/easing.ts'
const DURATIONS_TS = 'packages/engine/motion/src/durations.ts'
const SEMANTIC_TS = 'packages/engine/motion/src/semantic.ts'
const SPRING_TS = 'packages/engine/motion/src/spring.ts'

/** 原语曲线名 → JS 常量名：连字符转驼峰，in / out / in-out 三条沿用 CSS 关键字的 ease 前缀。 */
const EASE_NAME = { 'in': 'easeIn', 'out': 'easeOut', 'in-out': 'easeInOut' }
const jsEaseName = token => EASE_NAME[token] ?? token.replace(/-(\w)/g, (_, c) => c.toUpperCase())

/** JS 缓动表里没有令牌对应的名字，逐条写理由。登记了却不在表里的判过期。 */
const JS_ONLY = {
  linear: 'CSS 关键字本身，语义层 ease-loop 直接取 linear，原语层不设这一条',
  emphasized: '表现性进场曲线，供 @xihan-ui/animations 的预设使用；组件皮肤不用',
  decelerate: '公开导出的曲线，组件库与令牌都不使用',
  accelerate: '公开导出的曲线，组件库与令牌都不使用',
}

/** 读 `key: 'value'` 形式的字符串常量。 */
function readStringConst(source, key) {
  const m = source.match(new RegExp(`^\\s*${key}:\\s*'([^']*)'`, 'm'))
  return m ? m[1] : null
}

/** 读某个 `export const name = { … }` 对象字面量里的全部 `键: 值` 行。 */
function readObjectEntries(source, name) {
  const start = source.indexOf(`export const ${name}`)
  if (start < 0)
    return null
  const open = source.indexOf('{', start)
  const close = source.indexOf('}', open)
  const out = new Map()
  // 逐行取 `键: 值`。取值里可以带逗号（cubic-bezier 的四个分量），只把行尾那一个逗号当分隔符
  for (const line of source.slice(open + 1, close).split('\n')) {
    const m = /^'?([\w-]+)'?:(.*)$/.exec(line.trim())
    if (m)
      out.set(m[1], m[2].trim().replace(/,$/, ''))
  }
  return out
}

const primitive = JSON.parse(await readFile(PRIMITIVE, 'utf8'))
const base = JSON.parse(await readFile(BASE, 'utf8')).motion
const reduce = JSON.parse(await readFile(REDUCE, 'utf8')).motion
const easingTs = await readFile(EASING_TS, 'utf8')
const durationsTs = await readFile(DURATIONS_TS, 'utf8')
const semanticTs = await readFile(SEMANTIC_TS, 'utf8')

const problems = []
let checked = 0

// —— 原语曲线：令牌 → JS ——
const primitiveEases = Object.keys(primitive.ease ?? {}).filter(k => !k.startsWith('$'))
for (const token of primitiveEases) {
  checked++
  const name = jsEaseName(token)
  const actual = readStringConst(easingTs, name)
  const expected = primitive.ease[token].$value
  if (actual == null)
    problems.push(`${EASING_TS} 缺 easing.${name}（对应 ease.${token} = ${expected}）`)
  else if (actual !== expected)
    problems.push(`ease.${token} = ${expected}，但 easing.${name} = ${actual}`)
}

// —— 原语曲线：JS → 令牌 ——
const jsEases = readObjectEntries(easingTs, 'easing') ?? new Map()
const tokenJsNames = new Set(primitiveEases.map(jsEaseName))
for (const name of jsEases.keys()) {
  if (tokenJsNames.has(name) || name in JS_ONLY)
    continue
  problems.push(`easing.${name} 没有令牌对应：在 ${PRIMITIVE} 补 ease.* 原语，或删掉它，或登记进本门禁的 JS_ONLY 并写明理由`)
}
for (const name of Object.keys(JS_ONLY)) {
  if (!jsEases.has(name))
    problems.push(`${name} 登记在 JS_ONLY 里，但 easing 表已经没有它——登记过期`)
  else if (tokenJsNames.has(name))
    problems.push(`${name} 登记在 JS_ONLY 里，但令牌已有对应的原语——移出登记`)
}

// —— 原语时长 ——
const primitiveDurations = Object.keys(primitive.duration ?? {}).filter(k => !k.startsWith('$'))
const jsDurations = readObjectEntries(durationsTs, 'durations') ?? new Map()
for (const key of primitiveDurations) {
  checked++
  const expected = Number(String(primitive.duration[key].$value).replace(/ms$/, ''))
  const actual = jsDurations.has(key) ? Number(jsDurations.get(key)) : null
  if (actual == null)
    problems.push(`${DURATIONS_TS} 缺 durations.${key}`)
  else if (actual !== expected)
    problems.push(`duration.${key} = ${expected}ms，但 durations.${key} = ${actual}`)
}
for (const key of jsDurations.keys()) {
  if (!primitiveDurations.includes(key))
    problems.push(`durations.${key} 没有令牌对应：在 ${PRIMITIVE} 补 duration.${key} 或删掉它`)
}

/** 语义令牌取值 `{duration.normal}` / `{ease.out}` / 字面值 → 期望的 JS 引用。 */
function expectedRef(value, table) {
  const ref = /^\{(duration|ease)\.([\w-]+)\}$/.exec(String(value))
  if (!ref)
    return table === 'easing' && value === 'linear' ? 'easing.linear' : null
  return ref[1] === 'duration' ? `durations.${ref[2]}` : `easing.${jsEaseName(ref[2])}`
}

// —— 语义时长与语义缓动：令牌 ↔ semantic.ts ——
for (const [prefix, constName, table] of [['duration-', 'motionDurations', 'durations'], ['ease-', 'motionEasings', 'easing']]) {
  const js = readObjectEntries(semanticTs, constName)
  if (js == null) {
    problems.push(`${SEMANTIC_TS} 缺 ${constName}`)
    continue
  }
  const tokenKeys = Object.keys(base).filter(k => k.startsWith(prefix)).map(k => k.slice(prefix.length))
  for (const key of tokenKeys) {
    checked++
    const want = expectedRef(base[`${prefix}${key}`].$value, table)
    const got = js.get(key)
    if (got == null)
      problems.push(`${constName} 缺 ${key}（对应 --xh-motion-${prefix}${key}）`)
    else if (want == null)
      problems.push(`--xh-motion-${prefix}${key} 的取值 ${base[`${prefix}${key}`].$value} 不是单个原语引用，${constName}.${key} 无从对账`)
    else if (got !== want)
      problems.push(`--xh-motion-${prefix}${key} 取 ${base[`${prefix}${key}`].$value}，${constName}.${key} 却是 ${got}（应为 ${want}）`)
  }
  for (const key of js.keys()) {
    if (!tokenKeys.includes(key))
      problems.push(`${constName}.${key} 没有令牌对应：在 ${BASE} 补 motion.${prefix}${key} 或删掉它`)
  }
}

// —— 减弱档语义时长 ——
const reducedJs = readObjectEntries(semanticTs, 'reducedMotionDurations')
if (reducedJs == null) {
  problems.push(`${SEMANTIC_TS} 缺 reducedMotionDurations`)
}
else {
  /** 令牌取值 `120ms` 或 `{duration.fast}` → 毫秒数；其它写法无从对账。 */
  const tokenMs = (value) => {
    const text = String(value)
    if (/^\d+ms$/.test(text))
      return Number(text.replace(/ms$/, ''))
    const ref = /^\{duration\.(\w+)\}$/.exec(text)?.[1]
    const primitiveValue = ref ? primitive.duration?.[ref]?.$value : null
    return primitiveValue ? Number(String(primitiveValue).replace(/ms$/, '')) : null
  }
  /** JS 取值 `1` 或 `durations.fast` → 毫秒数。 */
  const jsMs = (value) => {
    const ref = /^durations\.(\w+)$/.exec(value)?.[1]
    return ref ? Number(jsDurations.get(ref)) : Number(value)
  }
  const durationKeys = Object.keys(base).filter(k => k.startsWith('duration-')).map(k => k.slice('duration-'.length))
  for (const key of durationKeys) {
    checked++
    const token = reduce[`duration-${key}`]?.$value ?? base[`duration-${key}`].$value
    const expected = tokenMs(token)
    const got = reducedJs.has(key) ? jsMs(reducedJs.get(key)) : null
    if (got == null)
      problems.push(`reducedMotionDurations 缺 ${key}`)
    else if (expected == null)
      problems.push(`--xh-motion-duration-${key} 的减弱档取值 ${token} 无法换算成毫秒，reducedMotionDurations.${key} 无从对账`)
    else if (got !== expected)
      problems.push(`--xh-motion-duration-${key} 的减弱档为 ${expected}ms，reducedMotionDurations.${key} 却是 ${got}`)
  }
  for (const key of reducedJs.keys()) {
    if (!durationKeys.includes(key))
      problems.push(`reducedMotionDurations.${key} 没有令牌对应`)
  }
}

// —— 弹簧预设：令牌 ↔ springPresets ——
const springTs = await readFile(SPRING_TS, 'utf8')
// 每条预设本身是一个对象字面量，通用读取器遇到内层花括号就截断，这里逐行取「名: { … }」
const springStart = springTs.indexOf('export const springPresets')
const springBlock = springStart < 0 ? '' : springTs.slice(springStart, springTs.indexOf('\n}\n', springStart))
const jsSprings = springStart < 0
  ? null
  : new Map([...springBlock.matchAll(/^\s*(\w+):\s*(\{[^}]*\})/gm)].map(m => [m[1], m[2]]))
if (jsSprings == null) {
  problems.push(`${SPRING_TS} 缺 springPresets`)
}
else {
  const tokenSprings = Object.keys(base).filter(k => k.startsWith('spring-')).map(k => k.slice('spring-'.length))
  for (const name of tokenSprings) {
    checked++
    const token = base[`spring-${name}`]
    const literal = jsSprings.get(name)
    if (literal == null) {
      problems.push(`springPresets 缺 ${name}（对应 --xh-motion-spring-${name}-*）`)
      continue
    }
    const field = key => Number(new RegExp(`${key}:\\s*([\\d.]+)`).exec(literal)?.[1])
    for (const key of ['stiffness', 'damping']) {
      if (field(key) !== token[key]?.$value)
        problems.push(`--xh-motion-spring-${name}-${key} = ${token[key]?.$value}，springPresets.${name}.${key} 却是 ${field(key)}`)
    }
    if (field('mass') !== 1)
      problems.push(`springPresets.${name}.mass 是 ${field('mass')}：令牌只登记刚度与阻尼，质量恒为 1`)
  }
  for (const name of jsSprings.keys()) {
    if (!tokenSprings.includes(name))
      problems.push(`springPresets.${name} 没有令牌对应：在 ${BASE} 补 motion.spring-${name} 或删掉它`)
  }
}

if (problems.length) {
  console.error('[check-motion-source] 引擎常量与令牌不一致：')
  for (const p of problems) console.error(`  ${p}`)
  console.error(`  真源是 ${TOKENS}，改引擎常量去对齐它`)
  process.exit(1)
}

console.log(`[check-motion-source] 通过：${checked} 条缓动 / 时长 / 弹簧常量与令牌双向一致（JS 独有 ${Object.keys(JS_ONLY).length} 条已登记）`)
