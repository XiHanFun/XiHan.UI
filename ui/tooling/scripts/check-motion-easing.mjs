#!/usr/bin/env node
// 门禁：缓动只走语义档，不许下探到 primitive，也不许在皮肤里手写曲线。
//
// 语义档五条：loop（无限循环的匀速动画：加载环、流光、跑马灯）· continuous（元素在屏内被推到
// 新位置，起终点都在可视区内）· enter（进场与常规状态过渡的减速）· enter-strong（位移与展开的
// 强减速）· exit（退场的加速）。
//
// 这条是补出来的：审计时查到 4 份皮肤在 animation / transition 上写 var(--xh-ease-standard)，
// 共 7 处，绕过整个语义层。原因不是谁偷懒，是语义层当时只有进场与退场两向，没档可去。
//
// loop 与 continuous 分家是第二轮审计逼出来的：起初把两者合成一档，结果循环动画拿到的是
// 带缓动的曲线，每一圈忽快忽慢，于是 8 处循环只能手写 linear 再逐条登记为例外——同一道流光
// 在库里跑出两种节奏（骨架走令牌、思考态走 linear），共用同一支时长、同构的关键帧，
// 相邻放置看得出来，而没有任何判据会红。匀速是循环的硬要求，不是可选口味，所以它自成一档。
//
// 手写 cubic-bezier() 与 ease / ease-in-out 这类关键字同样拦：它们和下探 primitive 是一件事，
// 都让这一处曲线脱离令牌层，皮肤之间再也对不齐。
//
// 阶跃不是曲线，语义层不给档：拿 steps(1) 硬切的闪烁，以及拿 0s linear 把 visibility
// 做成阶跃的写法。这两类逐处登记进 NO_CURVE。恒速循环不在此列，它有 loop 那一档。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const STYLES_DIR = 'packages/design/styles/css'

/** 带缓动的声明位置：两个简写、两个长属性，以及先灌进私有槽再消费的写法。 */
// 结尾收 `;` 也收 `}`：CSS 允许块内最后一条省略分号，只认分号的话那一条整个看不见，
// 而看不见的违规比报错危险。
const TIMING_DECL = /(?<![\w-])(animation|transition|animation-timing-function|transition-timing-function|--xh-_[\w-]*(?:ease|timing)[\w-]*)\s*:([^;{}]+)[;}]/g

/** primitive 的缓动档，只该由语义层引用，皮肤不许直接点名。 */
const PRIMITIVE = /var\(\s*--xh-ease-[\w-]+/

/** 手写曲线：完全脱离令牌层。 */
const HANDWRITTEN = /(?<![\w-])cubic-bezier\s*\(/

/** CSS 自带的缓动关键字与 steps()，语义档之外的字面曲线。匀速与阶跃另有登记表。 */
const LITERAL = /(?<![\w-])(linear|ease|ease-in|ease-out|ease-in-out|steps)(?![\w-])/

/**
 * 匀速与阶跃：语义层不给档，逐处登记。
 * 键写成「组件:关键帧名」，同一声明里没有关键帧名的写「组件:属性名」。
 */
const NO_CURVE = {
  'markdown-stream:xh-markdown-stream-caret': '等字的光标，steps(1) 硬切成亮灭两态，不淡入淡出',
  'scroll-area:transition': 'visibility 走 0s 阶跃，linear 只是补齐这一项的曲线位',
  'scrollbar:transition': 'visibility 走 0s 阶跃，linear 只是补齐这一项的曲线位',
}

/** 去掉块注释但保留换行，报错行号才对得上源文件。 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ''))
}

/**
 * 声明里的关键帧名：`animation: xh-spin var(--xh-…) linear infinite` 取 `xh-spin`。
 * 令牌名一律以 `--` 开头，用前置断言排掉，剩下的裸 `xh-*` 标识符就是关键帧名。
 */
function keyframeName(value) {
  return value.match(/(?<![-\w])(xh-[a-z0-9-]+)/)?.[1] ?? null
}

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()
const problems = []
const seen = new Set()
let checked = 0

for (const file of files) {
  const comp = file.replace(/\.css$/, '')
  const css = stripComments(await readFile(join(STYLES_DIR, file), 'utf8'))

  // 声明可能跨行（transition 列表一行一项），按 `属性: 值;` 整体匹配再换算行号
  for (const m of css.matchAll(TIMING_DECL)) {
    const [, prop, raw] = m
    const value = raw.replace(/\s+/g, ' ').trim()
    checked++
    const at = () => `${file}:${css.slice(0, m.index).split('\n').length}  ${prop}: ${value}`

    if (PRIMITIVE.test(value))
      problems.push(`${at()}\n    —— 缓动别直接引 --xh-ease-* 原语，改走 --xh-motion-ease-loop / -continuous / -enter / -enter-strong / -exit，或组件自己的缓动槽`)

    if (HANDWRITTEN.test(value))
      problems.push(`${at()}\n    —— 皮肤里不许手写 cubic-bezier()，曲线归令牌层：循环用 --xh-motion-ease-loop，屏内位移用 -continuous，进场用 -enter / -enter-strong，退场用 -exit`)

    const literal = LITERAL.exec(value)
    if (literal) {
      const key = `${comp}:${keyframeName(value) ?? prop}`
      if (key in NO_CURVE)
        seen.add(key)
      else
        problems.push(`${at()}\n    —— 字面缓动 ${literal[1]} 没走语义档，匀速循环改走 --xh-motion-ease-loop，其余走 -continuous / -enter / -enter-strong / -exit；确实是阶跃就把 ${key} 登记进 NO_CURVE`)
    }
  }
}

for (const key of Object.keys(NO_CURVE)) {
  if (!seen.has(key))
    problems.push(`${key}  登记在 NO_CURVE 里却没被扫到——名单过期了`)
}

if (problems.length) {
  console.error('[check-motion-easing] ✗ 皮肤的缓动没走语义层：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(`[check-motion-easing] 通过：${files.length} 份皮肤 · ${checked} 条缓动声明全部走语义档，没有下探 --xh-ease-* 与手写曲线（匀速与阶跃登记 ${seen.size} 处）`)
