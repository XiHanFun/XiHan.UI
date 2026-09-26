#!/usr/bin/env node
// 门禁：皮肤的动画 / 过渡时长不许直接引 --xh-duration-fast / normal / slow 原语；
// 皮肤里也不许出现 !important 与 0.01ms。
//
// 减弱动效只在语义层重映射（--xh-motion-duration-* 压到 1ms，循环动画由皮肤自己停掉），
// 原语 --xh-duration-* 不动。animation / transition 直接引原语的那一处，减弱档就穿不过去——
// 看上去照常在动。时长要么走 --xh-motion-duration-*，要么走组件自己的时长槽（--xh-<组件>-…-duration）
// 并以 --xh-motion-loop-spin / --xh-motion-loop-shimmer 这类语义时长兜底。
//
// !important 会把使用者按层覆盖的口子堵死；0.01ms 是「把动画压快到看不见」的做法，
// 循环动画压快了仍在循环，停掉要写 animation: none。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { declarations, lineCounter, stripComments } from '../lib/css-declarations.mjs'

/** 扫描面：组件皮肤 + 家族文件（family/motion.css 装着共享关键帧，其余家族文件没有时长与幅度声明）。 */
const STYLES_DIRS = ['packages/design/styles/css', 'packages/design/styles/family']
const TIMING_PROPS = new Set([
  'animation',
  'transition',
  'animation-duration',
  'transition-duration',
  'animation-delay',
  'transition-delay',
])
const PRIMITIVE = /--xh-duration-(?:fast|normal|slow)(?![\w-])/

/**
 * 延迟位专查：延迟只许由 stagger-step（交错的间隔）或语义时长 --xh-motion-duration-*（等上一段播完、
 * 按进程比例出现）派生——两者在减弱档都归零或归 1ms，写死的毫秒数归不掉。
 */
const DELAY_PROPS = new Set(['animation-delay', 'transition-delay'])
const STAGGER = /var\(\s*--xh-motion-(?:stagger-step|duration-[a-z-]+)\s*[,)]/

const files = (await Promise.all(STYLES_DIRS.map(async dir =>
  (await readdir(dir)).filter(f => f.endsWith('.css')).sort().map(f => ({ dir, file: dir.endsWith('/family') ? `family/${f}` : f })),
))).flat()
const problems = []
let timings = 0

for (const { dir, file } of files) {
  const css = stripComments(await readFile(join(dir, file.replace(/^family\//, '')), 'utf8'))
  const lineOf = lineCounter(css)

  // 按结构逐条取声明：跨行的 transition 列表、挤在一行的几条、块尾省略分号的最后一条都取得到
  for (const d of declarations(css)) {
    const { prop, value: raw } = d
    if (!TIMING_PROPS.has(prop))
      continue
    timings++
    if (PRIMITIVE.test(raw)) {
      const line = lineOf(d.index)
      problems.push(`${file}:${line}  ${prop}: ${raw.replace(/\s+/g, ' ').trim()}  —— 时长别直接引 --xh-duration-* 原语，走 --xh-motion-duration-* 或组件时长槽`)
    }
    // 延迟位只许由 stagger-step 或语义时长派生：写死 40ms 的那一处，减弱档归不掉，
    // 而 TIMING_PROPS 只测「有没有下探原语」，字面值它一个字都看不见
    if (DELAY_PROPS.has(prop) && raw.trim() !== '0s' && raw.trim() !== '0ms' && !STAGGER.test(raw)) {
      const line = lineOf(d.index)
      problems.push(`${file}:${line}  ${prop}: ${raw.replace(/\s+/g, ' ').trim()}  —— 延迟要走 var(--xh-motion-stagger-step)（可乘序号）或 var(--xh-motion-duration-*)（可乘比例），写死的值在减弱档归不掉`)
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

console.log(`[check-motion-primitives] 通过：${files.length} 份皮肤与家族文件 · ${timings} 条 animation / transition 时长声明都没直引 --xh-duration-* 原语，没有 !important 与 0.01ms`)
