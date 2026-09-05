#!/usr/bin/env node
// 门禁：每份组件皮肤实际声明的视觉轴，必须与登记表写的那几条一字不差。
//
// 三轴是 variant 形态 / tone 语气 / size 尺寸，皮肤里以 [data-variant] / [data-tone] /
// [data-size] 出现在选择器上。多数组件本就只该吃其中一两条——布局族吃形态、分隔线吃语气
// 都没有意义——所以这不是一张「谁还差几条轴」的欠账表，而是「谁该接哪几条轴」的登记表。
// 判据是「实际声明 == 登记」：少一条是漏接，多一条是乱加，两侧都判红。
//
// 同批还禁一条：组件皮肤里不许重新定义语气色。语气是 tone.css 共享那一层的事，
// 组件按 [data-tone='<值>'] 分支自己挑调色板颜色，等于在共享层之外另起一套。
// 判据是「跟着语气值走的分支里出现颜色属性、或取值引用调色板 --xh-color-*」。
// 分支里改字形、改图标一类与颜色无关的事不在此列。
//
// 哪些皮肤算组件皮肤由解剖决定：createAnatomy('<scope>', […]) 发过同名 scope 的才算，
// 其余（语气层、聚焦层、重置层等公共层）不吃轴，跳过。
//
// 登记表 axis-scope.json 由 `node tooling/scripts/check-axis-declaration.mjs --update`
// 生成并入库；表两侧都反查：登记了却没有这份组件皮肤、皮肤在却没登记，都判红。
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const HEADLESS = 'packages/engine/headless/src'
const STYLES_DIR = 'packages/design/styles/css'
const TABLE = join(dirname(fileURLToPath(import.meta.url)), 'axis-scope.json')
const TABLE_LABEL = 'tooling/scripts/axis-scope.json'
const UPDATE_CMD = 'node tooling/scripts/check-axis-declaration.mjs --update'

/** 三轴的固定次序，登记表按这个次序写。 */
const AXES = ['variant', 'tone', 'size']

/** 跟着语气值走的分支里不许出现的颜色属性。 */
const COLOR_PROPS = new Set([
  'accent-color',
  'background',
  'background-color',
  'background-image',
  'border-block-color',
  'border-block-end-color',
  'border-block-start-color',
  'border-bottom-color',
  'border-color',
  'border-inline-color',
  'border-inline-end-color',
  'border-inline-start-color',
  'border-left-color',
  'border-right-color',
  'border-top-color',
  'box-shadow',
  'caret-color',
  'color',
  'column-rule-color',
  'fill',
  'outline-color',
  'stroke',
  'text-decoration-color',
  'text-shadow',
])

/** 去注释与字符串字面量，用等长空白填回去，行号不移位。 */
function blank(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .replace(/'[^'\n]*'|"[^"\n]*"/g, m => m.replace(/[^\n]/g, ' '))
}

/** 偏移量 → 行号（从 1 起）。 */
function lineAt(src, offset) {
  let line = 1
  for (let i = 0; i < offset; i += 1) {
    if (src[i] === '\n')
      line += 1
  }
  return line
}

/**
 * 扫一份 CSS，取出两样东西：
 * - preludes：每个 `{` 前面那截选择器（或 at 规则），带偏移量；
 * - decls：每条声明，带它所在的 prelude 栈。
 * 花括号前的那截只取最后一个 `;` `{` `}` 之后的部分，
 * 这样嵌套写法里前面的声明不会被当成选择器的一部分。
 */
function scan(css) {
  const preludes = []
  const decls = []
  const stack = []
  let boundary = 0

  for (let i = 0; i < css.length; i += 1) {
    const ch = css[i]
    if (ch !== '{' && ch !== '}' && ch !== ';')
      continue

    const chunk = css.slice(boundary, i)
    if (ch === '{') {
      const lead = chunk.length - chunk.trimStart().length
      const prelude = { text: chunk.trim(), start: boundary + lead }
      preludes.push(prelude)
      stack.push(prelude)
    }
    else {
      const decl = /^\s*([\w-]+)\s*:([\s\S]*)$/.exec(chunk)
      if (decl) {
        decls.push({
          prop: decl[1],
          value: decl[2].trim().replace(/\s+/g, ' '),
          start: boundary + (chunk.length - chunk.trimStart().length),
          end: i,
          stack: [...stack],
        })
      }
      if (ch === '}')
        stack.pop()
    }
    boundary = i + 1
  }

  return { preludes, decls }
}

/** 这截选择器命中了哪几条轴。 */
function axesOf(prelude) {
  return AXES.filter(axis => new RegExp(`\\[data-${axis}[\\]=~|^$*]`).test(prelude))
}

// ── 采集：解剖发过的 scope 决定谁是组件皮肤 ──
const scopes = new Set()
for (const entry of (await readdir(HEADLESS, { withFileTypes: true })).filter(d => d.isDirectory())) {
  let src
  try {
    src = await readFile(join(HEADLESS, entry.name, `${entry.name}.anatomy.ts`), 'utf8')
  }
  catch {
    continue
  }
  for (const m of src.matchAll(/createAnatomy\(\s*'([a-z][a-z0-9-]*)'/g))
    scopes.add(m[1])
}

const skins = (await readdir(STYLES_DIR))
  .filter(f => f.endsWith('.css'))
  .map(f => f.replace(/\.css$/, ''))
  .filter(name => scopes.has(name))
  .sort()

/** 皮肤名 → { axes: 实际声明的轴, seen: 轴 → 首次出现的行, toneColor: 违例列表 } */
const measured = new Map()

for (const name of skins) {
  const path = `${STYLES_DIR}/${name}.css`
  const raw = await readFile(path, 'utf8')
  const src = blank(raw)
  const { preludes, decls } = scan(src)
  /** 报错时按原文取回那一截：src 里的字符串字面量被空白填过。 */
  const asWritten = (start, length) => raw.slice(start, start + length).replace(/\s+/g, ' ').trim()

  const seen = new Map()
  for (const { text, start } of preludes) {
    for (const axis of axesOf(text)) {
      if (!seen.has(axis))
        seen.set(axis, lineAt(src, start))
    }
  }

  const toneColor = []
  for (const { prop, value, start, end, stack } of decls) {
    const branch = stack.find(p => /\[data-tone=/.test(p.text))
    const palette = /--xh-color-/.test(value)
    if (branch && (COLOR_PROPS.has(prop) || palette)) {
      const written = asWritten(start, end - start)
      toneColor.push({
        line: lineAt(src, start),
        text: written.length > 72 ? `${written.slice(0, 69)}…` : written,
        branch: asWritten(branch.start, branch.text.length),
      })
    }
    if (/^--xh-_?tone[a-z0-9-]*$/.test(prop))
      toneColor.push({ line: lineAt(src, start), text: `${prop}: ${value}`, branch: null })
  }

  measured.set(name, { axes: AXES.filter(a => seen.has(a)), seen, toneColor })
}

// ── --update：按现状落登记表 ──
if (process.argv.includes('--update')) {
  const table = {}
  for (const name of skins)
    table[name] = measured.get(name).axes
  await writeFile(TABLE, `${JSON.stringify(table, null, 2)}\n`, 'utf8')
  const tally = new Map()
  for (const name of skins) {
    const key = measured.get(name).axes.join('+') || '（不吃轴）'
    tally.set(key, (tally.get(key) ?? 0) + 1)
  }
  const spread = [...tally].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(' · ')
  console.log(`[axis-scope] 已写入 ${TABLE_LABEL}：${skins.length} 份组件皮肤，${spread}`)
  process.exit(0)
}

let table
try {
  table = JSON.parse(await readFile(TABLE, 'utf8'))
}
catch {
  console.error(`[check-axis-declaration] ✗ 读不到 ${TABLE_LABEL}——先跑 ${UPDATE_CMD} 落登记表`)
  process.exit(1)
}

const problems = []

// ── 一、实际声明的轴 == 登记的轴 ──
for (const name of skins) {
  const path = `${STYLES_DIR}/${name}.css`
  const { axes, seen } = measured.get(name)
  const registered = table[name]

  if (!Array.isArray(registered)) {
    problems.push(`${path} —— 没有登记该接哪几条轴（实测 ${axes.join('+') || '一条都没有'}）。想清楚这个组件该吃哪几轴，跑 ${UPDATE_CMD} 登记`)
    continue
  }

  const bad = registered.filter(a => !AXES.includes(a))
  if (bad.length) {
    problems.push(`${TABLE_LABEL} —— ${name} 登记了 ${bad.join('、')}，三轴只有 ${AXES.join(' / ')}`)
    continue
  }

  for (const axis of axes) {
    if (!registered.includes(axis)) {
      problems.push(
        `${path}:${seen.get(axis)} —— 声明了 [data-${axis}]，登记表里这个组件不接这条轴。`
        + `确实该接就跑 ${UPDATE_CMD} 重登记，否则去掉这条轴——别为了凑齐三轴造假轴`,
      )
    }
  }
  for (const axis of registered) {
    if (!axes.includes(axis))
      problems.push(`${path} —— 登记要接 ${axis} 轴，皮肤里一条 [data-${axis}] 都没有。补上这条轴的规则，或者改登记表`)
  }
}

// ── 二、登记表里的名字必须还是一份组件皮肤 ──
const present = new Set(skins)
for (const name of Object.keys(table)) {
  if (!present.has(name))
    problems.push(`${TABLE_LABEL} —— 登记了 ${name}，而它已经不是一份组件皮肤了（皮肤没了，或者解剖不再发这个 scope），名单过期`)
}

// ── 三、组件皮肤里不许重新定义语气色 ──
for (const name of skins) {
  const path = `${STYLES_DIR}/${name}.css`
  for (const v of measured.get(name).toneColor) {
    if (v.branch === null)
      problems.push(`${path}:${v.line} —— 声明了 ${v.text}，语气那一族的取值只在 tone.css 里出`)
    else
      problems.push(`${path}:${v.line} —— 跟着语气值走的分支「${v.branch}」里写了 ${v.text}，语气色是 tone.css 共享那一层的事，组件按语气槽取色`)
  }
}

if (problems.length) {
  console.error('[check-axis-declaration] ✗ 三轴的声明面对不上登记表：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

const tally = new Map()
for (const name of skins) {
  const key = measured.get(name).axes.join('+') || '（不吃轴）'
  tally.set(key, (tally.get(key) ?? 0) + 1)
}
const spread = [...tally].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(' · ')
console.log(`[check-axis-declaration] 通过：${skins.length} 份组件皮肤声明的轴与登记表一致（${spread}），无一份自行定义语气色`)
