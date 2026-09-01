#!/usr/bin/env node
// 门禁：缓动只走语义档，不许下探到 primitive，也不许在皮肤里手写曲线。
//
// 语义档四条：continuous（循环动画，以及元素在屏内被推到新位置——两端都在屏内，起步就带速度）·
// enter（进场与常规状态过渡的减速曲线）· enter-strong（位移与展开的强减速）· exit（退场的加速）。
//
// 这条是补出来的：审计时查到 4 份皮肤在 animation / transition 上写 var(--xh-ease-standard)，
// 共 7 处，绕过整个语义层。原因不是谁偷懒，是语义层当时只有进场与退场两向——
// 循环动画与"被推过去"的位移既不进也不退，没档可去，于是各自下探。补齐 continuous 之后
// 把 7 处收回来，再用这条门禁钉住，免得下次又从 primitive 长出来。
//
// 手写 cubic-bezier() 与 ease / ease-in-out 这类关键字同样拦：它们和下探 primitive 是一件事，
// 都让这一处曲线脱离令牌层，皮肤之间再也对不齐。
//
// 匀速与阶跃不是曲线，语义层不给档：恒速旋转、恒速跑马灯、拿 steps(1) 硬切的闪烁，
// 以及拿 0s linear 把 visibility 做成阶跃的写法。这些逐处登记进 NO_CURVE。
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
  'button:xh-spin': '按钮里的加载环，恒速转',
  'markdown-stream:xh-markdown-stream-caret': '等字的光标，steps(1) 硬切成亮灭两态，不淡入淡出',
  'marquee:animation-timing-function': '跑马灯的轨道，恒速走才接得上接缝',
  'notification:xh-notification-spin': '通知里的加载环，恒速转',
  'popconfirm:xh-popconfirm-rotate': '确认气泡里的加载环，恒速转',
  'reasoning:xh-reasoning-shimmer': '思考中的流光，恒速扫',
  'scroll-area:transition': 'visibility 走 0s 阶跃，linear 只是补齐这一项的曲线位',
  'scrollbar:transition': 'visibility 走 0s 阶跃，linear 只是补齐这一项的曲线位',
  'spinner:xh-spinner-rotate': '加载指示器本体，恒速转',
  'switch:xh-switch-rotate': '开关里的加载环，恒速转',
  'tool-call:xh-tool-call-shimmer': '工具调用中的流光，恒速扫',
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
      problems.push(`${at()}\n    —— 缓动别直接引 --xh-ease-* 原语，改走 --xh-motion-ease-continuous / -enter / -enter-strong / -exit，或组件自己的缓动槽`)

    if (HANDWRITTEN.test(value))
      problems.push(`${at()}\n    —— 皮肤里不许手写 cubic-bezier()，曲线归令牌层：循环与屏内位移用 --xh-motion-ease-continuous，进场用 -enter / -enter-strong，退场用 -exit`)

    const literal = LITERAL.exec(value)
    if (literal) {
      const key = `${comp}:${keyframeName(value) ?? prop}`
      if (key in NO_CURVE)
        seen.add(key)
      else
        problems.push(`${at()}\n    —— 字面缓动 ${literal[1]} 没走语义档，改走 --xh-motion-ease-continuous / -enter / -enter-strong / -exit；确实要匀速或阶跃就把 ${key} 登记进 NO_CURVE`)
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
