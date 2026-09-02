#!/usr/bin/env node
// 门禁：使用者槽的字面量兜底若与某个令牌的最终值相等，必须改成引那个令牌。
//
// var(--xh-checkbox-size, 16px) 在今天与 --xh-control-indicator-size 同值，可令牌一换档
// （compact 收到 14px）那一处就不跟，同一页上的两个方框从此两个尺寸。同值兜底等于
// 把令牌的值抄了一份进皮肤，令牌再也管不到它。
//
// 做法：读 tokens.css，顺着 var() 引用把每个令牌解到最终字面值（取各轴的基线块，覆盖块不参与）；
// 扫皮肤里 var(--xh-<组件>-…, <字面量>) 的兜底，只看尺寸类字面量（px / rem / em / ms / s / % / 无单位数），
// 与某个令牌最终值相等即报，并列出候选令牌名。ALLOWED 登记确实不该引令牌的兜底：
// 0 / 1 这类不是设计尺度的数、line-height 的无单位倍数、transform 的比例。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'
const TOKENS_CSS = 'packages/design/tokens/tokens.css'

/**
 * 允许的字面量兜底。键是「皮肤:槽名=字面量」或只写字面量（对所有皮肤放行），值是理由。
 * 0 / 1 这种数在任何令牌表里都只是巧合相等，不是在抄令牌。
 * 每条都要真挡下过一处兜底，一条都挡不下的会被下面的名单核验报出来。
 */
const ALLOWED = new Map([
  ['0', '零不是设计尺度（space-0 / radius-none 只是恰好也是 0）'],
  ['1', '倍数或比例 1（line-height、opacity、scale），不是 leading.none'],
  ['color-picker.css:--xh-color-picker-swatch-size=18px', '色板色块的几何，与 18px 的滑杆拇指同值是巧合'],
  ['color-picker.css:--xh-color-picker-thumb-size=14px', '取色器拇指几何，与 14px 的滚动条厚度档无关'],
  ['color-picker.css:--xh-color-picker-track-thickness=8px', '色相带比滑杆轨道厚一档，与 space-2 同值是巧合'],
  ['marquee.css:--xh-marquee-span=600', '跑马灯单程像素长度的无单位数，不是字重'],
  ['marquee.css:--xh-marquee-block-size=10rem', '纵向跑马灯的视口高度，与菜单最小宽同值是巧合'],
  ['progress.css:--xh-progress-size=10rem', '环形进度大档直径，与菜单最小宽同值是巧合'],
  ['side-nav.css:--xh-side-nav-collapsed-w=56px', '侧栏折叠后的栏宽，与 56px 的字形档无关'],
  ['slider.css:--xh-slider-vertical-length=10rem', '纵向滑杆默认长度，与菜单最小宽同值是巧合'],
  ['splitter.css:--xh-splitter-disabled-opacity=0.6', '压的是宿主正文不是控件图形，地板比禁用档高；与拖动档同值是巧合'],
])

/** 只认尺寸类字面量：数字带 px / rem / em / ms / s / %，或无单位数。 */
const DIMENSION = /^-?(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em|ms|s|%)?$/

/** 把 "0px" / ".5" / "1.50rem" 归一成可比较的形态。 */
function normalize(value) {
  const m = /^(-?(?:\d+(?:\.\d+)?|\.\d+))(px|rem|em|ms|s|%)?$/.exec(value.trim())
  if (!m)
    return null
  const n = Number(m[1])
  const unit = n === 0 ? '' : (m[2] ?? '')
  return `${n}${unit}`
}

// —— 令牌表：顺 var() 引用解到最终值，同名令牌只取第一次声明（基线块）——
const tokensCss = await readFile(TOKENS_CSS, 'utf8')
const raw = new Map()
for (const m of tokensCss.matchAll(/^\s*(--xh-[a-z0-9_-]+)\s*:([^;]+);/gm)) {
  if (!raw.has(m[1]))
    raw.set(m[1], m[2].trim())
}
function resolve(name, seen = new Set()) {
  const v = raw.get(name)
  if (v == null || seen.has(name))
    return null
  seen.add(name)
  const ref = /^var\(\s*(--xh-[a-z0-9_-]+)\s*\)$/.exec(v)
  return ref ? resolve(ref[1], seen) : v
}
/** 归一化后的最终值 → 令牌名列表。 */
const byValue = new Map()
for (const name of raw.keys()) {
  const key = normalize(resolve(name) ?? '')
  if (key == null)
    continue
  if (!byValue.has(key))
    byValue.set(key, [])
  byValue.get(key).push(name)
}

// —— 扫皮肤 ——
/** 从 var( 之后的位置起读到配对的右括号，返回括号内的文本。 */
function readParens(src, start) {
  let depth = 1
  let i = start
  while (i < src.length && depth > 0) {
    if (src[i] === '(')
      depth++
    else if (src[i] === ')')
      depth--
    i++
  }
  return src.slice(start, i - 1)
}

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()
const problems = []
/** 真的挡下过一处兜底的 ALLOWED 条目。 */
const allowedSeen = new Set()
let checked = 0

for (const file of files) {
  const src = (await readFile(join(STYLES_DIR, file), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
  const re = /var\(\s*(--xh-[a-z0-9_-]+)\s*,/g
  for (const m of src.matchAll(re)) {
    const name = m[1]
    if (name.startsWith('--xh-_'))
      continue
    const inner = readParens(src, m.index + 4)
    const fallback = inner.slice(inner.indexOf(',') + 1).trim()
    if (!DIMENSION.test(fallback))
      continue
    checked++
    const key = normalize(fallback)
    const candidates = byValue.get(key)
    if (!candidates)
      continue
    const scoped = `${file}:${name}=${key}`
    if (ALLOWED.has(key)) {
      allowedSeen.add(key)
      continue
    }
    if (ALLOWED.has(scoped)) {
      allowedSeen.add(scoped)
      continue
    }
    const line = src.slice(0, m.index).split('\n').length
    problems.push(`${file}:${line}  ${name} 的兜底「${fallback}」≡ ${candidates.join(' / ')}`)
  }
}

// 名单核验：一条都没挡下过，说明那处兜底已经改走令牌、改了名或整个没了
for (const key of ALLOWED.keys()) {
  if (!allowedSeen.has(key))
    problems.push(`${key}  登记在 ALLOWED 里却没被扫到——名单过期了`)
}

if (problems.length) {
  console.error('[check-literal-fallbacks] ✗ 字面量兜底与令牌同值却不引令牌：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('改成 var(--xh-<槽>, var(--xh-<令牌>))；确实不该引令牌的，把理由登进本脚本的 ALLOWED。')
  process.exit(1)
}

console.log(`[check-literal-fallbacks] 通过：${files.length} 份皮肤 · ${checked} 处尺寸字面量兜底 · 没有与令牌同值的`)
