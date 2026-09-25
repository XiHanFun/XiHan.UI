#!/usr/bin/env node
// 门禁：关键帧的名字与内容都登记在册。
//
// 共享关键帧住在 family/motion.css、皮肤 @import 它；组件专属关键帧仍在各自皮肤。
// check-keyframe-refs.mjs 管的是「引用的名字在不在场」，管不到「这个名字全库该长什么样」，
// 也管不到「两个名字其实是同一段动画」。本脚本补的是后两条。
//
// 六条判据：
//   1 皮肤里的每个 @keyframes 名字都在登记表里
//   2 同名的块内容与登记值逐字一致（去空白归一化后比）
//   3 登记表每条至少被一份皮肤定义（过期反查）
//   4 同物异名：两个名字的内容化到规范式后相同即判红，同一段动画只留一个名字
//   5 consumers 与实际引用面双向一致
//   6 relation 非空的名字（登记的共享关键帧）只能定义在 family/motion.css，
//     且 family/motion.css 里的每个名字都带 relation——共享与专属的边界由这张表钉死
//
// 判据 4 是这套表的核心：它是唯一能拦住「同一个动作长出第 N 个名字」的机器判据。
// 规范式把同一段动画的不同写法归到一种：from / to 与 0% / 100% 同义，transform 里
// 只有一个 rotate() 时与独立的 rotate 属性同义，角度统一折成 turn。
// retired 记着收敛掉的旧名，旧名再出现（定义或引用）即判红。
//
// 登记表 tooling/scripts/keyframe-registry.json 由 `pnpm keyframes:update` 生成并入库。
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

import { MOTION_FAMILY, RELATIONS, SHARED_RELATION } from '../lib/keyframe-relations.mjs'

const SKINS = 'packages/design/styles/css'
const FAMILY = 'packages/design/styles/family'
const TABLE = 'tooling/scripts/keyframe-registry.json'

/** 去块注释，保留换行。 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ''))
}

/** 归一化：压掉空白，末尾分号统一，好让「同一段动画」逐字可比。 */
function normalize(body) {
  return body.replace(/\s+/g, ' ').replace(/;\s*\}/g, ' }').replace(/\s*([{}:;,])\s*/g, '$1').trim()
}

/** 角度折成 turn：360deg、1turn 与 400grad 是同一个角。 */
function toTurn(angle) {
  const m = /^(-?(?:\d+(?:\.\d*)?|\.\d+))(deg|turn|grad|rad)$/.exec(angle)
  if (!m)
    return angle
  const perTurn = { deg: 360, turn: 1, grad: 400, rad: 2 * Math.PI }[m[2]]
  return `${Number((Number(m[1]) / perTurn).toFixed(6))}turn`
}

/** 一条声明的规范式：transform 里只有一个 rotate() 时改写成独立的 rotate 属性。 */
function canonicalDeclaration(decl) {
  const colon = decl.indexOf(':')
  let prop = decl.slice(0, colon)
  let value = decl.slice(colon + 1)
  if (prop === 'transform' && value.startsWith('rotate(') && value.endsWith(')') && !value.slice(7, -1).includes('(')) {
    prop = 'rotate'
    value = value.slice(7, -1)
  }
  if (prop === 'rotate')
    value = toTurn(value)
  return `${prop}:${value}`
}

/** 帧体的规范式：只用来判「是不是同一段动画」，登记值仍存归一化后的原文。 */
function canonical(content) {
  const blocks = []
  let rest = content
  while (rest) {
    const open = rest.indexOf('{')
    const close = rest.indexOf('}', open)
    const selectors = rest.slice(0, open).split(',').map(sel => ({ from: '0%', to: '100%' })[sel] ?? sel)
    const decls = rest.slice(open + 1, close).split(';').filter(Boolean).map(canonicalDeclaration)
    blocks.push(`${selectors.join(',')}{${decls.join(';')}}`)
    rest = rest.slice(close + 1)
  }
  return blocks.join('')
}

/** 取 @keyframes 块体：从 `{` 起做括号配平。 */
function frameBody(css, openIndex) {
  let depth = 0
  for (let i = openIndex; i < css.length; i++) {
    if (css[i] === '{') {
      depth++
    }
    else if (css[i] === '}') {
      depth--
      if (depth === 0)
        return css.slice(openIndex + 1, i)
    }
  }
  return null
}

/** 扫描面：家族文件 + 组件皮肤；家族文件的 definedIn 记成 family/<名>，与皮肤名不混。 */
const files = [
  ...(await readdir(FAMILY)).filter(f => f.endsWith('.css')).sort().map(f => ({ dir: FAMILY, file: f, label: `family/${f}` })),
  ...(await readdir(SKINS)).filter(f => f.endsWith('.css')).sort().map(f => ({ dir: SKINS, file: f, label: f })),
]

/** name → { content, definedIn[] }；同名内容不一致时记进 conflicts。 */
const found = new Map()
const conflicts = []
const consumers = new Map()

for (const { dir, file, label } of files) {
  const comp = file.replace(/\.css$/, '')
  const css = stripComments(await readFile(join(dir, file), 'utf8'))

  for (const m of css.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
    const name = m[1]
    const raw = frameBody(css, m.index + m[0].length - 1)
    if (raw == null)
      continue
    const content = normalize(raw)
    const hit = found.get(name)
    if (!hit) {
      found.set(name, { content, definedIn: [label] })
    }
    else {
      hit.definedIn.push(label)
      if (hit.content !== content)
        conflicts.push(`${name} 在 ${hit.definedIn[0]} 与 ${label} 里内容不同——同名必须同物`)
    }
  }

  // 家族文件只放关键帧，不是引用面
  if (dir === FAMILY)
    continue
  for (const m of css.matchAll(/animation(?:-name)?\s*:[^;}]*/g)) {
    for (const n of m[0].matchAll(/(?<![-\w])(xh-[a-z0-9-]+)/g)) {
      if (!consumers.has(n[1]))
        consumers.set(n[1], new Set())
      consumers.get(n[1]).add(comp)
    }
  }
}

/** 按规范式分组，找出「一个视觉多个名字」。 */
function collisionGroups() {
  const byContent = new Map()
  for (const [name, { content }] of found) {
    const key = canonical(content)
    if (!byContent.has(key))
      byContent.set(key, [])
    byContent.get(key).push(name)
  }
  return [...byContent.values()].filter(names => names.length > 1).map(names => names.sort())
}

if (process.argv.includes('--update')) {
  /** retired 是人工登记的退役名单，重生表时原样保留。 */
  let retired = {}
  try {
    retired = JSON.parse(await readFile(TABLE, 'utf8')).retired ?? {}
  }
  catch {
    // 首次落表没有旧表
  }
  const frames = {}
  for (const name of [...found.keys()].sort()) {
    const { content, definedIn } = found.get(name)
    frames[name] = {
      content,
      definedIn: [...new Set(definedIn)].sort(),
      consumers: [...(consumers.get(name) ?? [])].sort(),
      ...(name in SHARED_RELATION ? { relation: SHARED_RELATION[name] } : {}),
    }
  }
  const table = {
    $description: '关键帧的名字与内容真源。共享关键帧只定义在 family/motion.css，relation 按 tooling/scripts/lib/keyframe-relations.mjs 的关系组登记；组件专属关键帧住在各自皮肤。本表登记「这个名字全库该长什么样」，同一段动画只许一个名字。retired 是退役名单：旧名再出现即判红。',
    frames,
    retired,
  }
  await writeFile(TABLE, `${JSON.stringify(table, null, 2)}\n`, 'utf8')
  console.log(`[keyframes:update] 已写入 ${TABLE}：${Object.keys(frames).length} 个名字`)
  for (const names of collisionGroups())
    console.warn(`  ${names.join(' / ')} 是同一段动画——收敛成一个名字，否则门禁判红`)
  process.exit(0)
}

let table
try {
  table = JSON.parse(await readFile(TABLE, 'utf8'))
}
catch {
  console.error(`[check-keyframe-registry] ✗ 读不到 ${TABLE}——先跑 pnpm keyframes:update 落基线`)
  process.exit(1)
}

const problems = [...conflicts]
const { frames = {}, retired = {} } = table

// 判据 1 + 2 + 5
for (const [name, { content, definedIn }] of found) {
  const entry = frames[name]
  if (!entry) {
    problems.push(
      `${name}（${definedIn[0]}）未登记——新关键帧要么复用既有名字，`
      + `要么跑 pnpm keyframes:update 登记进表`,
    )
    continue
  }
  if (entry.content !== content)
    problems.push(`${name} 的块内容与登记表不符（${definedIn.join(' / ')}）——改了就跑 pnpm keyframes:update 重落`)

  const actualDef = [...new Set(definedIn)].sort().join(',')
  const listedDef = [...(entry.definedIn ?? [])].sort().join(',')
  if (actualDef !== listedDef)
    problems.push(`${name} 的 definedIn 与实际定义面不符：实际 ${actualDef}，登记 ${listedDef}`)

  const actualCon = [...(consumers.get(name) ?? [])].sort().join(',')
  const listedCon = [...(entry.consumers ?? [])].sort().join(',')
  if (actualCon !== listedCon)
    problems.push(`${name} 的 consumers 与实际引用面不符：实际 ${actualCon || '(无)'}，登记 ${listedCon || '(无)'}`)
}

// 判据 3：过期反查
for (const name of Object.keys(frames)) {
  if (!found.has(name))
    problems.push(`${name} 登记在表里却没有任何皮肤定义它——名单过期了`)
}

// 判据 4：同物异名
for (const names of collisionGroups()) {
  const shared = names.filter(n => n in SHARED_RELATION)
  const fix = shared.length
    ? `改引共享关键帧 ${shared.join(' / ')}，删掉皮肤里的副本，旧名登进 retired`
    : `只留一个名字；跨皮肤共用就收进 ${MOTION_FAMILY} 并登记 relation`
  problems.push(`${names.join(' / ')} 是同一段动画，却有 ${names.length} 个名字——${fix}`)
}

// retired：旧名出现即判红（定义与引用都算）
for (const [name, why] of Object.entries(retired)) {
  if (found.has(name))
    problems.push(`${name} 已退役（${why}），皮肤里却还在定义它`)
  if (consumers.has(name))
    problems.push(`${name} 已退役（${why}），${[...consumers.get(name)].join(' / ')} 却还在引用它`)
}

// 判据 6：relation 与 family/motion.css 互为充要
for (const [name, relation] of Object.entries(SHARED_RELATION)) {
  if (!RELATIONS.includes(relation))
    problems.push(`${name} 的 relation ${relation} 不在 ${RELATIONS.join(' / ')} 之列`)
  const hit = found.get(name)
  if (!hit) {
    problems.push(`${name} 登记了 relation 却没有任何文件定义它——共享关键帧要写进 ${MOTION_FAMILY}`)
    continue
  }
  const defs = [...new Set(hit.definedIn)]
  if (defs.length !== 1 || defs[0] !== MOTION_FAMILY)
    problems.push(`${name} 是共享关键帧（${relation}），只能定义在 ${MOTION_FAMILY}，实际定义在 ${defs.join(' / ')}`)
  if (frames[name] && frames[name].relation !== relation)
    problems.push(`${name} 登记表里的 relation 是 ${frames[name].relation ?? '(无)'}，脚本登记的是 ${relation}——跑 pnpm keyframes:update 重落`)
}
for (const [name, { definedIn }] of found) {
  if (definedIn.includes(MOTION_FAMILY) && !(name in SHARED_RELATION))
    problems.push(`${name} 定义在 ${MOTION_FAMILY} 却没有登记 relation——共享关键帧要在 SHARED_RELATION 里写清锚定关系`)
  if (!definedIn.includes(MOTION_FAMILY) && frames[name]?.relation)
    problems.push(`${name} 登记了 relation ${frames[name].relation} 却不在 ${MOTION_FAMILY} 里`)
}

if (problems.length) {
  console.error('[check-keyframe-registry] ✗ 关键帧与登记表对不上：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

const blocks = [...found.values()].reduce((n, f) => n + f.definedIn.length, 0)
console.log(
  `[check-keyframe-registry] 通过：${found.size} 个关键帧名字 · ${blocks} 个块 · `
  + `${new Set([...found.values()].map(f => f.content)).size} 种内容，名字与内容都在册`
  + `（共享关键帧 ${Object.keys(SHARED_RELATION).length} 个只定义在 ${MOTION_FAMILY}；同一段动画只有一个名字；退役 ${Object.keys(retired).length} 个）`,
)
