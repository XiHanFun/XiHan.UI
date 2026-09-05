#!/usr/bin/env node
// 门禁：每份组件皮肤至少要有一条动效。
//
// 库里的动效是逐份皮肤自带的，没有一处集中的地方能看出「哪份皮肤一条都没写」。
// 实测下来有 24 份组件皮肤零动效，其中好几份是真交互件——把手拖起来没有任何反馈、
// 可按的那段文字指上去毫无变化、圆点换了语气色是硬跳的。这一条把那张名单钉在案上：
// 要么这份皮肤有动效，要么它登记在册并写清为什么不需要。
//
// 算「有动效」的两种形式：
//   ① transition / animation（含 -duration 长属性）的值里走 --xh-motion-duration-*
//   ② 无限循环动画（animation-iteration-count: infinite，或简写里的 infinite）——
//      循环的时长走的是 --xh-spin-duration / --xh-shimmer-duration 那一族，不在语义时长档里，
//      但转圈、流光、跑马灯本身就是动效
//
// 判之前先剥掉三种块，它们里面的声明不算「这个组件有动效」：
//   @media (prefers-reduced-motion: …) —— 那里面写的多是 animation: none，是把动效停掉的
//   @media (forced-colors: active)     —— 高对比档的补救，与动效无关
//   @media print                       —— 纸上没有动效
//
// 扫描面只取组件皮肤：scope 的真源是解剖（createAnatomy），没有同名解剖的那几份是公共层
// （tone / reset / focus / forced-colors 这些），它们不属于任何组件，本条判据不适用。
// 这一划分与 check-scope-has-skin.mjs 同源，那道门禁保证两侧一一对上。
//
// 豁免登记表 tooling/scripts/motion-exempt.json 由本脚本带 --update 跑一次生成并入库，
// 每条要写清理由。表两侧都反查：登记的文件没了、不是组件皮肤、或者哪天补上了动效，都判红——
// 名单不会悄悄过期，也不会变成一张没人走的免检通行证。
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const STYLES_DIR = 'packages/design/styles/css'
const HEADLESS = 'packages/engine/headless/src'
const TABLE = 'tooling/scripts/motion-exempt.json'

/** --update 给新条目写的占位理由，留着不填也判红。 */
const PLACEHOLDER = '（补一句理由：这份皮肤为什么不需要动效）'

/** 去掉块注释但保留换行，报错行号才对得上源文件。 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ' '))
}

/** 从 open 处那个左花括号配对求块尾下标。 */
function blockEnd(css, open) {
  let depth = 0
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{')
      depth++
    else if (css[i] === '}' && --depth === 0)
      return i
  }
  return css.length
}

/** 减弱动效 / 高对比 / 打印这三种 at 规则块，整块抹成空白（换行留着，行号不动）。 */
function stripExcluded(css) {
  const EXCLUDED = /prefers-reduced-motion|forced-colors|(?<![\w-])print(?![\w-])/
  const out = [...css]
  const re = /@media[^{;]*\{/g
  for (let m = re.exec(css); m !== null; m = re.exec(css)) {
    if (!EXCLUDED.test(m[0]))
      continue
    const open = m.index + m[0].length - 1
    const end = blockEnd(css, open)
    for (let i = m.index; i <= end && i < out.length; i++) {
      if (out[i] !== '\n')
        out[i] = ' '
    }
    re.lastIndex = end + 1
  }
  return out.join('')
}

/** 一份皮肤里算数的动效声明，逐条带行号。 */
function motionDecls(css) {
  const found = []
  const DECL = /(?<![\w-])(transition|animation)(?:-duration|-iteration-count)?\s*:([^;{}]+)[;}]/g
  for (const m of css.matchAll(DECL)) {
    const value = m[2]
    const timed = value.includes('--xh-motion-duration-')
    const looping = /(?<![\w-])infinite(?![\w-])/.test(value)
    if (!timed && !looping)
      continue
    found.push({
      line: css.slice(0, m.index).split('\n').length,
      kind: timed ? '语义时长' : '无限循环',
      text: `${m[1]}:${value}`.replace(/\s+/g, ' ').trim().slice(0, 72),
    })
  }
  return found
}

/** 解剖发出来的 scope 全集——组件皮肤就是与它们同名的那些。 */
async function anatomyScopes() {
  const scopes = new Set()
  for (const entry of await readdir(HEADLESS, { withFileTypes: true })) {
    if (!entry.isDirectory())
      continue
    let src
    try {
      src = await readFile(join(HEADLESS, entry.name, `${entry.name}.anatomy.ts`), 'utf8')
    }
    catch {
      continue
    }
    for (const [, scope] of stripComments(src).matchAll(/createAnatomy\(\s*'([a-z][a-z0-9-]*)'/g))
      scopes.add(scope)
  }
  return scopes
}

const scopes = await anatomyScopes()
const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()

/** 组件皮肤文件名 → 它里面算数的动效声明。 */
const skins = new Map()
for (const file of files) {
  if (!scopes.has(file.replace(/\.css$/, '')))
    continue
  const css = stripExcluded(stripComments(await readFile(join(STYLES_DIR, file), 'utf8')))
  skins.set(file, motionDecls(css))
}

const silent = [...skins].filter(([, decls]) => decls.length === 0).map(([file]) => file)

if (process.argv.includes('--update')) {
  let previous = {}
  try {
    previous = JSON.parse(await readFile(TABLE, 'utf8')).exempt ?? {}
  }
  catch {}
  const exempt = {}
  for (const file of silent)
    exempt[file] = previous[file] ?? PLACEHOLDER
  const table = {
    $description:
      '零动效的组件皮肤逐份登记，值写清这份皮肤为什么不需要动效。'
      + '由 check-motion-coverage.mjs 两侧反查：文件必须还在、必须仍是组件皮肤、必须确实零动效。',
    exempt,
  }
  await writeFile(TABLE, `${JSON.stringify(table, null, 2)}\n`, 'utf8')
  const blank = Object.values(exempt).filter(r => r === PLACEHOLDER).length
  console.log(
    `[check-motion-coverage] 已写入 ${TABLE}：${silent.length} 份零动效组件皮肤${blank ? `，其中 ${blank} 条理由待填` : ''}`,
  )
  process.exit(0)
}

let table
try {
  table = JSON.parse(await readFile(TABLE, 'utf8'))
}
catch {
  console.error(`[check-motion-coverage] ✗ 读不到 ${TABLE}——先跑 node tooling/scripts/check-motion-coverage.mjs --update 落基线`)
  process.exit(1)
}

const exempt = table.exempt ?? {}
/** 登记表里每个键写在第几行，报错时指得到位置。 */
const tableText = await readFile(TABLE, 'utf8')
function tableLine(key) {
  const at = tableText.indexOf(`"${key}"`)
  return at === -1 ? 1 : tableText.slice(0, at).split('\n').length
}

const problems = []

for (const file of silent) {
  if (file in exempt)
    continue
  problems.push(
    `${STYLES_DIR}/${file}:1 —— 整份皮肤一条动效都没有。`
    + `补一条走 --xh-motion-duration-* 的过渡（五态色彩走 -micro + -enter），`
    + `或者跑 node tooling/scripts/check-motion-coverage.mjs --update 把它登记进 ${TABLE} 并写清它为什么不需要`,
  )
}

for (const [file, reason] of Object.entries(exempt)) {
  const at = `${TABLE}:${tableLine(file)}`
  if (!skins.has(file)) {
    const gone = !files.includes(file)
    problems.push(
      `${at} —— 登记了 ${file}，但${gone ? `${STYLES_DIR} 里已经没有这份皮肤` : '它不是组件皮肤（没有同名解剖）'}——名单过期，删掉这条`,
    )
    continue
  }
  const decls = skins.get(file)
  if (decls.length) {
    const first = decls[0]
    problems.push(
      `${at} —— 登记了 ${file} 说它不需要动效，而 ${STYLES_DIR}/${file}:${first.line} 已经写了一条`
      + `（${first.kind}：${first.text}）——名单过期，删掉这条`,
    )
    continue
  }
  if (typeof reason !== 'string' || !reason.trim() || reason === PLACEHOLDER)
    problems.push(`${at} —— ${file} 的豁免理由还没填，写清这份皮肤为什么不需要动效`)
}

if (problems.length) {
  console.error('[check-motion-coverage] ✗ 组件皮肤的动效覆盖对不上：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

const covered = skins.size - silent.length
console.log(
  `[check-motion-coverage] 通过：${skins.size} 份组件皮肤，${covered} 份各有至少一条动效，`
  + `${silent.length} 份零动效逐条登记在案（另有不归组件管的公共皮肤 ${files.length - skins.size} 份不在扫描面）`,
)
