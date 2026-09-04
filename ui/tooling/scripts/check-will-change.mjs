#!/usr/bin/env node
// 门禁：will-change 点的必须正是这条规则里真会动的属性。
//
// transform 与 scale / translate / rotate 是各自独立的属性。关键帧写 `scale` 与 `translate`
// 而 will-change 写 `transform` 时，声明里点的那个属性一帧都不会动，真会动的那两个一个没点到。
// 实测这样写过 15 处。
//
// 只判「同一条规则块里既有 will-change、又有 animation 或 transition」的那些：
// 动的属性从同块的 transition 逐项取，或按 animation 的关键帧名去 keyframe-registry.json
// 里查帧体。will-change 单独成块（动画写在别的规则上）的量不准，跳过并计数。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const STYLES_DIR = 'packages/design/styles/css'
const REGISTRY = 'tooling/scripts/keyframe-registry.json'

/**
 * 逐条例外。键写成「组件:will-change 的值」，值写这一项为什么与实际动的属性不一致。
 * 登记了却没被扫到的键会判红，名单不会悄悄过期。
 */
const WILL_CHANGE_OVERRIDE = {}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ''))
}

/** 按顶层逗号切项。 */
function splitTopLevel(value) {
  const out = []
  let depth = 0
  let start = 0
  for (let i = 0; i < value.length; i++) {
    const ch = value[i]
    if (ch === '(')
      depth++
    else if (ch === ')')
      depth--
    else if (ch === ',' && depth === 0) {
      out.push(value.slice(start, i))
      start = i + 1
    }
  }
  out.push(value.slice(start))
  return out.map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean)
}

/** 一项过渡动的是哪个属性：var(…) 之外的第一个标识符。 */
function animatedProp(item) {
  const head = item.replace(/var\([^()]*(?:\([^()]*\)[^()]*)*\)/g, ' ')
  return head.match(/(?<![\w-])([a-z][a-z0-9-]*)(?![\w-])/)?.[1] ?? null
}

/** 帧体里出现在属性位的名字。 */
function framedProps(content) {
  return new Set([...content.matchAll(/(?:^|[{;])\s*([a-z-]+)\s*:/g)].map(m => m[1]))
}

let frames = {}
try {
  frames = JSON.parse(await readFile(REGISTRY, 'utf8')).frames ?? {}
}
catch {
  console.error(`[check-will-change] ✗ 读不到 ${REGISTRY}——先跑 pnpm keyframes:update`)
  process.exit(1)
}

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()
const problems = []
const seen = new Set()
let checked = 0
let unverifiable = 0

for (const file of files) {
  const comp = file.replace(/\.css$/, '')
  const css = stripComments(await readFile(join(STYLES_DIR, file), 'utf8'))

  for (const rule of css.matchAll(/\{([^{}]*)\}/g)) {
    const body = rule[1]
    const wc = body.match(/(?<![\w-])will-change\s*:([^;}]+)/)
    if (!wc)
      continue

    const declared = new Set(splitTopLevel(wc[1]))
    const line = css.slice(0, rule.index + wc.index).split('\n').length
    const actual = new Set()

    for (const t of body.matchAll(/(?<![\w-])transition\s*:([^;}]+)/g)) {
      for (const item of splitTopLevel(t[1])) {
        const prop = animatedProp(item)
        if (prop && prop !== 'none')
          actual.add(prop)
      }
    }
    for (const a of body.matchAll(/(?<![\w-])animation\s*:([^;}]+)/g)) {
      const name = a[1].match(/(?<![-\w])(xh-[a-z0-9-]+)/)?.[1]
      const entry = name ? frames[name] : null
      if (entry) {
        for (const p of framedProps(entry.content))
          actual.add(p)
      }
    }

    if (actual.size === 0) {
      unverifiable++
      continue
    }
    checked++

    const key = `${comp}:${[...declared].sort().join(',')}`
    if (key in WILL_CHANGE_OVERRIDE) {
      seen.add(key)
      continue
    }

    // 只咬「点了却不会动」。反过来不咬：will-change 的用途是提示合成层提升，
    // 只点需要提升的那几个是对的，把布局属性也点上没有收益。
    const spare = [...declared].filter(p => !actual.has(p))
    if (spare.length === 0)
      continue

    problems.push(
      `${file}:${line}  will-change: ${[...declared].join(', ')}\n`
      + `    —— ${spare.join(' / ')} 在这条规则里一帧都不会动（实际动的是 ${[...actual].sort().join(' / ')}）；`
      + `注意 transform 与 scale / translate / rotate 是各自独立的属性，点前者点不到后三个`,
    )
  }
}

for (const key of Object.keys(WILL_CHANGE_OVERRIDE)) {
  if (!seen.has(key))
    problems.push(`${key} 登记在 WILL_CHANGE_OVERRIDE 里却没被扫到——名单过期了`)
}

if (problems.length) {
  console.error('[check-will-change] ✗ will-change 点的属性与实际动的对不上：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(
  `[check-will-change] 通过：${checked} 处 will-change 与同块真会动的属性逐一对上`
  + `（动画写在别的规则上、量不准的 ${unverifiable} 处跳过）`,
)
