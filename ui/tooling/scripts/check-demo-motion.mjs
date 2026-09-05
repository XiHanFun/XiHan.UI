#!/usr/bin/env node
// 门禁：文档站示例里的时长与曲线走令牌，不手写。
//
// stylelint 的 glob 是 packages/**/*.css，皮肤那侧的 check-motion-easing 也只读
// packages/design/styles/css——两者都扫不到 docs/.vitepress/demos。这条判据补这一段。
//
// 判据：示例（.vue / .html）里 transition / animation 与它们的时长、延迟、曲线三个长属性，
// 值里出现下面四类之一就判红：
//   · 字面时间：320ms、0.3s，以及模板串里 `${x}ms` 这种拼出来的时间
//   · 手写曲线：cubic-bezier()
//   · 字面曲线关键字：ease / linear / ease-in-out / steps
//   · 下探原语：var(--xh-ease-*)、var(--xh-duration-*)
// 时间取 var()（语义档 --xh-motion-duration-* 与循环档 --xh-spin-duration 一类，
// 或组件自己的时长槽），曲线取 --xh-motion-ease-*。
//
// 改不动的逐处登记进 EXEMPT，脚本反查两侧：登记表里没有的违规判红，登记了却没被扫到的条目
// 同样判红。
import { readdir, readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import process from 'node:process'

/** 文档站在仓库根，跟 ui/ 是兄弟。 */
const DEMOS = '../docs/.vitepress/demos'
/** 生成物与依赖不看。 */
const SKIP_DIRS = new Set(['node_modules', 'dist', 'cache', '.vitepress-cache'])

/**
 * 允许手写时长或曲线的位置，连同理由。
 * 键写成「示例相对路径:属性名」，例如 `carousel/09-effect.vue:transition`。
 */
const EXEMPT = {}

/**
 * 带时间或曲线的声明位置：两个简写，加上时长、延迟、曲线三个长属性。
 * 长属性排在简写之前，`animation-name` 这类不带时间的长属性由后面的 `\s*:` 挡掉。
 */
const TIMING_PROP = /(?<![\w-])(transition-timing-function|transition-duration|transition-delay|transition|animation-timing-function|animation-duration|animation-delay|animation)\s*:/g

/** 字面时间：320ms、0.3s。 */
const LITERAL_TIME = /(?<![\w.-])\d+(?:\.\d+)?m?s(?![\w-])/
/** 模板串拼出来的时间：`${delay}ms`。 */
const INTERPOLATED_TIME = /\}m?s(?![\w-])/
/** 手写曲线。 */
const HANDWRITTEN = /(?<![\w-])cubic-bezier\s*\(/
/** CSS 自带的曲线关键字与 steps()。 */
const LITERAL_EASE = /(?<![\w-])(linear|ease|ease-in|ease-out|ease-in-out|steps)(?![\w-])/
/** primitive 档，只该由语义层引用。 */
const PRIMITIVE = /var\(\s*--xh-(?:ease|duration)-[\w-]+/

/** 去掉 HTML 与块注释，保留换行，报错行号才对得上源文件。 */
function stripComments(src) {
  const blank = c => c.replace(/[^\n]/g, '')
  return src.replace(/<!--[\s\S]*?-->/g, blank).replace(/\/\*[\s\S]*?\*\//g, blank)
}

/**
 * 读冒号之后的声明值。
 * 示例里同一条声明有四种壳：CSS 块（收 `;` 或 `}`）、内联 style 属性（收引号）、
 * JS 对象字面量与模板串（值自带一对引号）。带引号的读到配对的那一只，其余读到第一个终止符；
 * 模板串里的 `${…}` 整段跳过，里面的 `}` 不当终止符。
 */
function readValue(src, from) {
  let i = from
  while (i < src.length && /\s/.test(src[i]))
    i += 1

  const quote = src[i]
  if (quote === '"' || quote === '\'' || quote === '`') {
    const end = src.indexOf(quote, i + 1)
    return { value: src.slice(i + 1, end === -1 ? src.length : end), start: i + 1 }
  }

  let end = i
  while (end < src.length) {
    if (src[end] === '$' && src[end + 1] === '{') {
      const close = src.indexOf('}', end + 2)
      if (close === -1)
        break
      end = close + 1
      continue
    }
    if (';}"\'`'.includes(src[end]))
      break
    end += 1
  }
  return { value: src.slice(i, end), start: i }
}

async function* walk(dir) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  }
  catch {
    return
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name))
      continue
    const full = join(dir, entry.name)
    if (entry.isDirectory())
      yield* walk(full)
    else if (['.vue', '.html'].includes(extname(entry.name)))
      yield full
  }
}

const problems = []
const seen = new Set()
let files = 0
let checked = 0

const prefix = `${DEMOS.split('\\').join('/')}/`

for await (const file of walk(DEMOS)) {
  files += 1
  const rel = file.split('\\').join('/').slice(prefix.length)
  const src = stripComments(await readFile(file, 'utf8'))

  for (const m of src.matchAll(TIMING_PROP)) {
    const prop = m[1]
    const { value: raw, start } = readValue(src, m.index + m[0].length)
    const value = raw.replace(/\s+/g, ' ').trim()
    checked += 1

    const hits = []
    if (LITERAL_TIME.test(value) || INTERPOLATED_TIME.test(value))
      hits.push('字面时长 —— 时间改走 var()：语义档 --xh-motion-duration-enter / -exit / -micro / -slide / -nudge，循环档 --xh-spin-duration / --xh-shimmer-duration，错峰用 --xh-motion-stagger-step')
    if (HANDWRITTEN.test(value))
      hits.push('手写 cubic-bezier() —— 曲线归令牌层：循环用 --xh-motion-ease-loop，屏内位移用 -continuous，进场用 -enter / -enter-strong，退场用 -exit')
    const literal = LITERAL_EASE.exec(value)
    if (literal)
      hits.push(`字面曲线 ${literal[1]} —— 匀速循环走 --xh-motion-ease-loop，往复走 -sweep，其余走 -continuous / -enter / -enter-strong / -exit`)
    if (PRIMITIVE.test(value))
      hits.push('下探 primitive —— 别直接引 --xh-ease-* / --xh-duration-*，改走 --xh-motion-* 语义档')

    if (!hits.length)
      continue

    const key = `${rel}:${prop}`
    if (key in EXEMPT) {
      seen.add(key)
      continue
    }
    const line = src.slice(0, start).split('\n').length
    problems.push(`${rel}:${line}  ${prop}: ${value}\n    —— ${hits.join('\n    —— ')}`)
  }
}

for (const [key, reason] of Object.entries(EXEMPT)) {
  if (!seen.has(key))
    problems.push(`${key}  登记在 EXEMPT 里（${reason}），却没被扫到——名单过期了，删掉这条`)
}

if (problems.length) {
  console.error('[check-demo-motion] ✗ 示例里手写了时长或曲线：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('\n示例是照抄的范本：一处手写的节拍会被抄进使用者的项目，从此不随令牌层一起改。')
  process.exit(1)
}

console.log(`[check-demo-motion] 通过：${files} 份示例 · ${checked} 条时长与曲线声明全部走令牌（登记豁免 ${seen.size} 处）`)
