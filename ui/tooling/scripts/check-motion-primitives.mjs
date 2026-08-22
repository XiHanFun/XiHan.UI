#!/usr/bin/env node
// 门禁：皮肤的动画 / 过渡时长不许直接引 --xh-duration-fast / normal / slow 原语；
// 皮肤里也不许出现 !important 与 0.01ms。
//
// 减弱动效只在语义层重映射（--xh-motion-duration-* 压到 1ms，循环动画由皮肤自己停掉），
// 原语 --xh-duration-* 不动。animation / transition 直接引原语的那一处，减弱档就穿不过去——
// 看上去照常在动。时长要么走 --xh-motion-duration-*，要么走组件自己的时长槽（--xh-<组件>-…-duration）
// 并以 --xh-spin-duration / --xh-shimmer-duration 这类语义时长兜底。
//
// !important 会把使用者按层覆盖的口子堵死；0.01ms 是「把动画压快到看不见」的做法，
// 循环动画压快了仍在循环，停掉要写 animation: none。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'
const TIMING_PROPS = new Set(['animation', 'transition', 'animation-duration', 'transition-duration'])
const PRIMITIVE = /--xh-duration-(?:fast|normal|slow)(?![\w-])/

/** 去掉块注释但保留换行，报错行号才对得上源文件。 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ''))
}

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()
const problems = []
let timings = 0

for (const file of files) {
  const css = stripComments(await readFile(join(STYLES_DIR, file), 'utf8'))

  // 声明可能跨行（transition 列表一行一项），按 `属性: 值;` 整体匹配再换算行号
  for (const m of css.matchAll(/(?<![\w-])([\w-]+)\s*:([^;{}]+);/g)) {
    const [, prop, raw] = m
    if (!TIMING_PROPS.has(prop))
      continue
    timings++
    if (PRIMITIVE.test(raw)) {
      const line = css.slice(0, m.index).split('\n').length
      problems.push(`${file}:${line}  ${prop}: ${raw.replace(/\s+/g, ' ').trim()}  —— 时长别直接引 --xh-duration-* 原语，走 --xh-motion-duration-* 或组件时长槽`)
    }
  }

  css.split('\n').forEach((text, i) => {
    if (/!\s*important/.test(text))
      problems.push(`${file}:${i + 1}  ${text.trim()}  —— 皮肤里不许写 !important`)
    if (/(?<![\d.])0\.01ms/.test(text))
      problems.push(`${file}:${i + 1}  ${text.trim()}  —— 别把时长压到 0.01ms，停掉动画写 animation: none`)
  })
}

if (problems.length) {
  console.error('[check-motion-primitives] ✗ 皮肤的动效时长没走语义层：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(`[check-motion-primitives] 通过：${files.length} 份皮肤 · ${timings} 条 animation / transition 时长声明都没直引 --xh-duration-* 原语，没有 !important 与 0.01ms`)
