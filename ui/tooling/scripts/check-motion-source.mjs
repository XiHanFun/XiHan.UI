#!/usr/bin/env node
// 门禁：JS 动画引擎的缓动与时长常量必须逐字等于令牌。
//
// 真源是 packages/design/tokens 的 primitive.json：ease.standard / in / out / out-strong / in-out 与
// duration.fast / normal / slow。@xihan-ui/motion 是 engine 组，不能依赖 design 组，
// 所以它把同一批值抄成常量（easing.standard / easeIn / easeOut / outStrong / easeInOut 与
// durations.fast / normal / slow）。
// 两边互不引用，任何一边改了值另一边不会报错，只有这里对账。
//
// easing.ts 是 JS 侧唯一的曲线表：补间也从它取曲线，逐帧算出来的路径与 CSS 声明的同名曲线同值。
import { readFile } from 'node:fs/promises'

const PRIMITIVE = 'packages/design/tokens/tokens/primitive.json'
const EASING_TS = 'packages/engine/motion/src/easing.ts'
const DURATIONS_TS = 'packages/engine/motion/src/durations.ts'

/** 令牌名 → 引擎常量名 */
const EASE_PAIRS = [
  ['standard', 'standard'],
  ['in', 'easeIn'],
  ['out', 'easeOut'],
  ['out-strong', 'outStrong'],
  ['in-out', 'easeInOut'],
]
const DURATION_KEYS = ['fast', 'normal', 'slow']

/** 读 `key: 'value'` 形式的字符串常量。 */
function readStringConst(source, key) {
  const m = source.match(new RegExp(`^\\s*${key}:\\s*'([^']*)'`, 'm'))
  return m ? m[1] : null
}

/** 读 `key: 123` 形式的数字常量。 */
function readNumberConst(source, key) {
  const m = source.match(new RegExp(`^\\s*${key}:\\s*(\\d+(?:\\.\\d+)?)`, 'm'))
  return m ? Number(m[1]) : null
}

const primitive = JSON.parse(await readFile(PRIMITIVE, 'utf8'))
const easingTs = await readFile(EASING_TS, 'utf8')
const durationsTs = await readFile(DURATIONS_TS, 'utf8')

const problems = []
let checked = 0

for (const [token, name] of EASE_PAIRS) {
  const expected = primitive.ease?.[token]?.$value
  const actual = readStringConst(easingTs, name)
  checked++
  if (expected == null)
    problems.push(`${PRIMITIVE} 缺 ease.${token}`)
  else if (actual == null)
    problems.push(`${EASING_TS} 缺 easing.${name}`)
  else if (expected !== actual)
    problems.push(`ease.${token} = ${expected}，但 easing.${name} = ${actual}`)
}

for (const key of DURATION_KEYS) {
  const raw = primitive.duration?.[key]?.$value
  const expected = raw == null ? null : Number(String(raw).replace(/ms$/, ''))
  const actual = readNumberConst(durationsTs, key)
  checked++
  if (expected == null || Number.isNaN(expected))
    problems.push(`${PRIMITIVE} 缺 duration.${key} 或它不是 ms 值`)
  else if (actual == null)
    problems.push(`${DURATIONS_TS} 缺 durations.${key}`)
  else if (expected !== actual)
    problems.push(`duration.${key} = ${expected}ms，但 durations.${key} = ${actual}`)
}

if (problems.length) {
  console.error('[check-motion-source] 引擎常量与令牌不一致：')
  for (const p of problems) console.error(`  ${p}`)
  console.error(`  真源是 ${PRIMITIVE}，改引擎常量去对齐它`)
  process.exit(1)
}

console.log(`[check-motion-source] 通过：${checked} 条缓动/时长常量与 primitive.json 逐字一致`)
