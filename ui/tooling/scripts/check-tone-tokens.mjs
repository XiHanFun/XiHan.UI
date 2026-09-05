#!/usr/bin/env node
// 门禁：语气轴对外那一族 --xh-tone-* 必须在语气层上声明，且与私有槽一对一同源。
//
// 私有槽 --xh-_tone* 是库内消费点，使用者的节点接不到它；公开令牌是同一份取值的对外名字。
// 两条判据：
//   一、声明位置只认 tone.css 里选择器为 [data-tone] 或 :root 的块。落在某个组件皮肤里，
//       使用者在自己的节点上就取不到——那等于没出这支令牌，而 CSS 不会告诉任何人。
//   二、取值必须恰好是 var(<对应私有槽>)。写成别的式子就是另起一套，改私有槽时两边分叉。
//
// 名册 PAIRS 同时是这一族的基线：公开面采集器只收 var(名字, 兜底) 形态的组件覆盖槽，
// 收不到这一族，所以改名与删名由这张表拦。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'
const TONE = 'tone.css'

/** 私有槽 → 公开令牌。左边有、右边没有的，登记进 NOT_PUBLIC 并写理由。 */
const PAIRS = {
  '--xh-_tone': '--xh-tone-solid',
  '--xh-_tone-hover': '--xh-tone-solid-hover',
  '--xh-_tone-active': '--xh-tone-solid-active',
  '--xh-_tone-on': '--xh-tone-on',
  '--xh-_tone-subtle': '--xh-tone-subtle',
  '--xh-_tone-subtle-hover': '--xh-tone-subtle-hover',
  '--xh-_tone-subtle-active': '--xh-tone-subtle-active',
  '--xh-_tone-fg': '--xh-tone-fg',
  '--xh-_tone-border': '--xh-tone-border',
  '--xh-_tone-border-control': '--xh-tone-border-control',
  '--xh-_tone-soft': '--xh-tone-soft',
}

/** 不出公开令牌的私有槽，逐条写明理由；名单里的槽必须真的还在 tone.css 里声明着。 */
const NOT_PUBLIC = {
  '--xh-_tone-shift': '兑色的方向，不是一档能直接用的颜色',
}

/** 只认 [data-tone] 与 :root 这两种声明位置。 */
const PUBLIC_SELECTOR = /^(?::root|\[data-tone\])$/

const strip = css => css.replace(/\/\*[\s\S]*?\*\//g, ' ')

/** 拆成 { selector, decls } 数组，只认自定义属性声明。 */
function parseBlocks(css) {
  const blocks = []
  for (const m of strip(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const decls = new Map()
    for (const d of m[2].matchAll(/(--[a-z0-9_-]+)\s*:([^;]+);/g))
      decls.set(d[1], d[2].trim().replace(/\s+/g, ' '))
    if (decls.size)
      blocks.push({ selector: m[1].trim().replace(/\s+/g, ' '), decls })
  }
  return blocks
}

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css'))
const sources = new Map()
for (const file of files)
  sources.set(file, await readFile(join(STYLES_DIR, file), 'utf8'))

const toneSrc = sources.get(TONE)
if (!toneSrc) {
  console.error(`[check-tone-tokens] ✗ 找不到 ${STYLES_DIR}/${TONE}，语气层挪位置了`)
  process.exit(1)
}

const problems = []

// ── 一、私有槽与名册两侧对齐 ──
const slots = new Set([...strip(toneSrc).matchAll(/(--xh-_tone[a-z0-9-]*)\s*:/g)].map(m => m[1]))
for (const slot of slots) {
  if (!(slot in PAIRS) && !(slot in NOT_PUBLIC))
    problems.push(`私有槽 ${slot} 没有对应的公开令牌——加进 PAIRS 并在 tone.css 里出一支，或登记进 NOT_PUBLIC 写明理由`)
}
for (const slot of [...Object.keys(PAIRS), ...Object.keys(NOT_PUBLIC)]) {
  if (!slots.has(slot))
    problems.push(`名册登记了 ${slot}，但 tone.css 里已经没有这个私有槽了，名单过期`)
}

// ── 二、公开令牌的声明位置与取值 ──
const declaredAt = new Map()
for (const [file, css] of sources) {
  for (const { selector, decls } of parseBlocks(css)) {
    for (const [name, value] of decls) {
      if (!name.startsWith('--xh-tone-'))
        continue
      declaredAt.set(name, { file, selector, value })
    }
  }
}

for (const [slot, token] of Object.entries(PAIRS)) {
  const at = declaredAt.get(token)
  if (!at) {
    problems.push(`${token} 一处都没声明——使用者写下它只会拿到无效值`)
    continue
  }
  if (at.file !== TONE || !PUBLIC_SELECTOR.test(at.selector))
    problems.push(`${token} 声明在 ${at.file} 的 ${at.selector} 上，只有 ${TONE} 里的 [data-tone] 或 :root 才接得到`)
  if (at.value !== `var(${slot})`)
    problems.push(`${token} 的取值是「${at.value}」，必须恰好是 var(${slot})，否则与私有槽分叉`)
}

// ── 三、没有名册之外的野名字 ──
const known = new Set(Object.values(PAIRS))
for (const [file, css] of sources) {
  strip(css).split('\n').forEach((line, i) => {
    for (const m of line.matchAll(/(--xh-tone-[a-z0-9-]*)/g)) {
      if (!known.has(m[1]))
        problems.push(`${file}:${i + 1}  ${m[1]} 不在名册里——拼错了，或者新出的令牌忘了登记进 PAIRS`)
    }
  })
}

if (problems.length) {
  console.error('[check-tone-tokens] ✗ 语气轴的公开令牌对不上：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(`[check-tone-tokens] 通过：${Object.keys(PAIRS).length} 支公开令牌都声明在 ${TONE} 的 [data-tone] 上并与私有槽同源（不出令牌的私有槽 ${Object.keys(NOT_PUBLIC).length} 支）`)
