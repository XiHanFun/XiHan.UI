#!/usr/bin/env node
// 门禁：动画不闪——任意一秒内明暗交替不超过三次（WCAG 2.3.1）。
//
// 数法与 @xihan-ui/animations 的入口校验是同一份（features/animations/src/flash.ts，本脚本直接导入源码）：
// 不透明度朝一个方向连续变化满 0.1 记一次起落，一明一暗算一次闪烁，连播时末帧跳回首帧也算一次变化。
// 动画层的预设与作者配方在播放入口就被这套数法拦下（validateMotionSpec）；这里核皮肤里的 CSS 动画：
// 每条 animation 的关键帧取自关键帧登记表，时长沿 var() 与 calc() 解到令牌的毫秒值，
// infinite 按无限次播放数。时长或不透明度解不出的逐条列出，不静默跳过。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { MAX_FLASHES_PER_SECOND, peakFlashes } from '../../../packages/features/animations/src/flash.ts'
import { declarations, lineCounter, stripComments } from '../lib/css-declarations.mjs'

const STYLES_DIR = 'packages/design/styles/css'
const FAMILY_DIR = 'packages/design/styles/family'
const REGISTRY = 'tooling/scripts/keyframe-registry.json'
const TOKENS = 'packages/design/tokens/tokens.json'

const registry = JSON.parse(await readFile(REGISTRY, 'utf8')).frames ?? {}
const tokens = JSON.parse(await readFile(TOKENS, 'utf8'))

/** 按顶层逗号或空白切段。 */
function splitTop(value, separator) {
  const out = []
  let depth = 0
  let start = 0
  for (let i = 0; i < value.length; i++) {
    const ch = value[i]
    if (ch === '(') {
      depth++
    }
    else if (ch === ')') {
      depth--
    }
    else if (depth === 0 && (separator === ',' ? ch === ',' : /\s/.test(ch))) {
      out.push(value.slice(start, i))
      start = i + 1
    }
  }
  out.push(value.slice(start))
  return out.map(s => s.trim()).filter(Boolean)
}

/** 把一段取值解成数：var() 先查令牌、查不到走兜底，calc 只认「值 × / ÷ 数」，时间统一成毫秒。 */
function resolve(expr, kind) {
  const text = expr.trim()
  const ref = /^var\(\s*(--[\w-]+)\s*(?:,(.*))?\)$/s.exec(text)
  if (ref) {
    if (ref[1] in tokens)
      return resolve(tokens[ref[1]], kind)
    return ref[2] === undefined ? null : resolve(ref[2], kind)
  }
  const scaled = /^calc\((.+)\s([*/])\s(\d+(?:\.\d+)?)\)$/s.exec(text)
  if (scaled) {
    const base = resolve(scaled[1], kind)
    return base === null ? null : scaled[2] === '*' ? base * Number(scaled[3]) : base / Number(scaled[3])
  }
  if (kind === 'time') {
    const time = /^(-?\d+(?:\.\d+)?)(ms|s)$/.exec(text)
    return time ? Number(time[1]) * (time[2] === 's' ? 1000 : 1) : null
  }
  const number = /^-?\d+(?:\.\d+)?$/.exec(text)
  return number ? Number(text) : null
}

/** 关键帧帧体 → 按位置排好的帧；opacity 解不出时返回 null。 */
function framesOf(content) {
  const frames = []
  for (const block of content.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const opacity = /(?:^|;)opacity:([^;]+)/.exec(block[2])?.[1]
    const value = opacity === undefined ? undefined : resolve(opacity, 'number')
    if (value === null)
      return null
    for (const selector of block[1].split(',')) {
      const s = selector.trim()
      const offset = s === 'from' ? 0 : s === 'to' ? 1 : Number.parseFloat(s) / 100
      frames.push({ offset, opacity: value })
    }
  }
  frames.sort((a, b) => a.offset - b.offset)
  // 没写起止帧时取元素本身的值（不透明度按 1 算）
  if (frames.length && frames[0].offset > 0)
    frames.unshift({ offset: 0 })
  if (frames.length && frames.at(-1).offset < 1)
    frames.push({ offset: 1 })
  return frames
}

const DIRECTIONS = new Set(['normal', 'reverse', 'alternate', 'alternate-reverse'])

/** 解一段 animation 简写：名字、时长、次数、方向。 */
function parseAnimation(part) {
  const tokensOf = splitTop(part, ' ')
  const name = tokensOf.find(t => /^xh-[\w-]+$/.test(t)) ?? null
  const timeToken = tokensOf.find(t => /^(?:var\(|calc\(|-?\d+(?:\.\d+)?m?s$)/.test(t) && resolve(t, 'time') !== null)
    ?? tokensOf.find(t => /^var\(/.test(t))
  const iterations = tokensOf.includes('infinite') ? Number.POSITIVE_INFINITY : Number(tokensOf.find(t => /^\d+(?:\.\d+)?$/.test(t)) ?? 1)
  const direction = tokensOf.find(t => DIRECTIONS.has(t))
  return { name, duration: timeToken ? resolve(timeToken, 'time') : null, iterations, direction }
}

const sources = [
  ...(await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort().map(f => ({ path: join(STYLES_DIR, f), label: f })),
  ...(await readdir(FAMILY_DIR)).filter(f => f.endsWith('.css')).sort().map(f => ({ path: join(FAMILY_DIR, f), label: `family/${f}` })),
]

const problems = []
let measured = 0
let flickering = 0
let peak = 0

for (const { path, label } of sources) {
  const css = stripComments(await readFile(path, 'utf8'))
  const lineOf = lineCounter(css)
  for (const d of declarations(css)) {
    if (d.prop !== 'animation')
      continue
    for (const part of splitTop(d.value, ',')) {
      const animation = parseAnimation(part)
      if (!animation.name || !(animation.name in registry))
        continue
      const frames = framesOf(registry[animation.name].content)
      if (!frames?.some(frame => frame.opacity !== undefined)) {
        if (frames === null)
          problems.push(`${label}:${lineOf(d.index)}  ${animation.name} 的不透明度解不出数值，闪烁量不了——写成数字或令牌`)
        continue
      }
      if (animation.duration === null) {
        problems.push(`${label}:${lineOf(d.index)}  ${part}  —— 时长解不出毫秒（组件槽之外要有令牌兜底），闪烁量不了`)
        continue
      }
      measured++
      const flashes = peakFlashes(frames, animation)
      if (flashes > 0)
        flickering++
      peak = Math.max(peak, flashes)
      if (flashes > MAX_FLASHES_PER_SECOND)
        problems.push(`${label}:${lineOf(d.index)}  ${part}\n    —— 任意一秒内闪 ${flashes} 次，超过 ${MAX_FLASHES_PER_SECOND} 次的上限（WCAG 2.3.1）：拉长周期或减少明暗起落`)
    }
  }
}

if (problems.length) {
  console.error('[check-attention-flash] ✗ 动画的闪烁超限或量不了：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(`[check-attention-flash] 通过：${measured} 条带不透明度变化的 CSS 动画都量过，其中 ${flickering} 条有明暗起落，任意一秒最多闪 ${peak} 次（上限 ${MAX_FLASHES_PER_SECOND}）；动画层的预设与配方由播放入口按同一数法校验`)
