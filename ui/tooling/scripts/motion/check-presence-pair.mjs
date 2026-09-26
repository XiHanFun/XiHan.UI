#!/usr/bin/env node
// 门禁：有进场即有退场。
//
// 部件随开合状态（[data-state='open'] / [data-state='visible']）播一段进场关键帧，收起时却硬消失，
// 是「一头有动画、一头瞬断」：打开时的那段过渡把人的注意力引过去，收起时画面上的东西凭空不见。
// 本门禁要求：同一份皮肤里，凡随开合状态播进场关键帧的部件，都得有一条播退场关键帧的规则。
//
// 只核随开合状态播放的进场。挂载即播的出现类（新到的消息、卡片、空状态）随内容替换消失，不在此列；
// 靠 hidden 开合、没有开合状态可认的常挂部件静态上判不出，由各自的浏览器用例盯着。
// 进场关键帧按名字认：xh-*-in；退场认 xh-*-out 与 xh-disclosure-collapse。部件由选择器里的
// data-scope 与 data-part 定。一个进场找不到退场时，要么补上退场，要么登记理由；待办只减不增。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'

/** 刻意只有进场的部件：键写「组件:部件」，值写理由。 */
const EXEMPT = {}

/** 待办：已知缺退场的部件，只减不增。 */
const BACKLOG = {}

const ENTER = /(?<![-\w])xh-[a-z0-9-]*-in(?![-\w])/
const EXIT = /(?<![-\w])(?:xh-[a-z0-9-]*-out|xh-disclosure-collapse)(?![-\w])/
const OPEN_STATE = /\[data-state=['"](?:open|visible)['"]\]/

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ''))
}

/** 选择器里点名的部件：「组件:部件」。取最后一个复合选择器，也就是规则真正落到的那个节点。 */
function partOf(selector) {
  // 按方括号外的空白切出复合选择器
  const compounds = []
  let depth = 0
  let current = ''
  for (const ch of selector.trim()) {
    if (ch === '[')
      depth++
    else if (ch === ']')
      depth--
    if (depth === 0 && /\s/.test(ch)) {
      if (current)
        compounds.push(current)
      current = ''
      continue
    }
    current += ch
  }
  if (current)
    compounds.push(current)
  const last = compounds.at(-1) ?? ''
  const scope = last.match(/\[data-scope=['"]([\w-]+)['"]\]/)?.[1]
  const part = last.match(/\[data-part=['"]([\w-]+)['"]\]/)?.[1]
  return scope && part ? `${scope}:${part}` : null
}

const problems = []
const seen = new Set()
let entrances = 0

for (const file of (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()) {
  const css = stripComments(await readFile(join(STYLES_DIR, file), 'utf8'))
  const opens = new Map()
  const exits = new Set()
  for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const animation = rule[2].match(/(?<![\w-])animation(?:-name)?\s*:([^;}]+)/)?.[1]
    if (!animation)
      continue
    for (const selector of rule[1].split(',')) {
      const key = partOf(selector)
      if (!key)
        continue
      if (EXIT.test(animation))
        exits.add(key)
      if (ENTER.test(animation) && OPEN_STATE.test(selector) && !opens.has(key))
        opens.set(key, css.slice(0, rule.index).split('\n').length + 1)
    }
  }
  for (const [key, line] of opens) {
    entrances++
    if (exits.has(key)) {
      if (key in BACKLOG)
        problems.push(`${key}  已经补上了退场，从 BACKLOG 里删掉这一条`)
      continue
    }
    if (key in EXEMPT || key in BACKLOG) {
      seen.add(key)
      continue
    }
    problems.push(`${file}:${line}  ${key} 随开合状态播进场关键帧，收起时却没有退场\n    —— 补一条收起态（closed / hidden / dismissing）上的退场关键帧（xh-*-out），或登记进 EXEMPT 写清理由`)
  }
}

for (const [table, entries] of [['EXEMPT', EXEMPT], ['BACKLOG', BACKLOG]]) {
  for (const key of Object.keys(entries)) {
    if (!seen.has(key) && !problems.some(p => p.startsWith(key)))
      problems.push(`${key}  登记在 ${table} 里却没被扫到——名单过期了`)
  }
}

if (problems.length) {
  console.error('[check-presence-pair] ✗ 有进场没退场：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(`[check-presence-pair] 通过：${entrances} 个随开合状态播进场的部件都有退场（待办 ${Object.keys(BACKLOG).length} 条）`)
