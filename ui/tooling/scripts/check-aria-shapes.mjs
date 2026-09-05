#!/usr/bin/env node
// 门禁：连接层里 ARIA 属性的写法只许一种形状。
//
// ① aria-hidden 写布尔 true，不写字符串 'true'：两种写法落到 DOM 都是 "true"，
//    但属性级断言与快照会分成两套，连接层之间也会各写各的。
// ② getTriggerProps 发了 aria-haspopup='listbox' 的触发器必须同时写 role='combobox'
//    （APG 的 select-only combobox 形态），除非登记在 ALLOWED 里：
//    那些是按钮式弹出，触发器不承载当前值、保持原生 button 角色。
// ③ aria-busy 写省略式；凡在 DOM 上说了「正在加载」的组件都得报 aria-busy。
// ④ 报了 aria-busy 的组件，皮肤得把在途画出来，且不许只画在 cursor 上。
//    ③ 与 ④ 是同一份契约的两半：③ 管读屏那一侧，④ 管眼睛这一侧。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const HEADLESS = 'packages/engine/headless/src'
const STYLES_DIR = 'packages/design/styles/css'

/** 按钮式弹出列表框：触发器保持 button 角色，不扮演 combobox。当前一个都没有。 */
const ALLOWED = new Set([])

/**
 * 说了「正在加载」却不必报 aria-busy 的，各带理由。
 * 这里只登记「那条 loading 说的不是本节点在更新」的情形。
 */
const BUSY_EXEMPT = {
  // role=progressbar 本身就是「进度」的角色，配 aria-valuenow 已经把在途说清楚了；
  // 再叠 aria-busy 是同一件事说两遍。它的 data-state='loading' 是常态不是「这块在更新」
  'progress': 'role=progressbar 已经承担了在途语义',
  // 报 busy 会压住同一棵子树内播报区的播报，而 AI 那一族只认会话级的那一个活区
  'tool-call': '在更新的是会话那一层的活区，不是这一块',
  'prompt-input': '在更新的是会话那一层的活区，不是输入壳；锁住的观感由提交钮切成 data-mode=stop 承载',
}

/**
 * 判据④ 的放行表：报了 aria-busy、皮肤里却没有一条按在途分档的规则的组件，各带理由。
 *
 * 收的是永久结论——这一处不该有「在途」这一档规则，不是「该有还没写」。
 * 分界线是 aria-busy 落在什么东西上：落在**控件**上，说的是「你刚按的那一下正在走」，
 * 用户等着看那一下有没有落地，不画就等于零反馈；落在**会被追加内容的区域**上，
 * 说的是「这块内容正在变」，谁都没在等自己的一次按下，画在途的是内容本身——
 * 或者是一个只在取数期在场的部件，那种在途由部件的在场与否承载，不由属性分档。
 * 表里四个都是后一类，五个报 aria-busy 的控件一个都不在表里。
 */
const BUSY_WITHOUT_SKIN = {
  'skeleton': '骨架本身就是那一档在途视觉：整块骨架只在加载期在场，取完数根上置 hidden 整块收起。在途与在场是同一个条件，分不出第二档来画',
  'log': 'aria-busy 落在滚动视口上，那是一块会被追加的区域、不是刚被按下的控件。取行由作者那一侧的动作发起，「这一下按到了」的反馈落在发起它的那颗钮上',
  'infinite-scroll': '外壳这一层刻意不给盒模型（连 display 都不写），身上没有可画的面；在途的观感由作者自己的哨兵内容表出（infinite-scroll.css:9 已写明）',
  'table': 'aria-busy 落在 grid 容器上，说的是这块表体正在换。取数期那一格由只在取数期在场的 loading 部件承载（收起时 hidden、在场时自己呼吸），承载它的是部件的在场与否，不是一条按属性分档的规则',
}

const problems = []
/** connect 名 → 源码，判据③复用。 */
const busySources = []
let connects = 0
let ariaHidden = 0
let ariaBusy = 0
let listboxTriggers = 0

/** 抠出 getXxxProps 的函数体（到下一个 getXxxProps 或对象末尾）。 */
function getter(src, name) {
  const i = src.indexOf(`${name}:`)
  if (i < 0)
    return null
  const rest = src.slice(i + name.length + 1)
  const next = rest.search(/\n\s{4}get[A-Z][A-Za-z]*Props\s*[:(]/)
  return next < 0 ? rest : rest.slice(0, next)
}

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1')
}

for (const dir of await readdir(HEADLESS, { withFileTypes: true })) {
  if (!dir.isDirectory())
    continue
  const name = dir.name
  const file = join(HEADLESS, name, `${name}.connect.ts`)
  let raw
  try {
    raw = await readFile(file, 'utf8')
  }
  catch {
    continue
  }
  connects += 1
  const src = stripComments(raw)
  busySources.push([name, src])

  // ① aria-hidden 的形状
  for (const m of src.matchAll(/['"]aria-hidden['"]\s*:\s*([^,\n]+)/g)) {
    ariaHidden += 1
    if (/['"]true['"]/.test(m[1]))
      problems.push(`${name}.connect.ts：aria-hidden 写了字符串 'true'，该写布尔 true → ${m[1].trim()}`)
  }

  // ② 触发器的 combobox 角色
  const trigger = getter(src, 'getTriggerProps')
  if (trigger && /['"]aria-haspopup['"]\s*:\s*['"]listbox['"]/.test(trigger)) {
    listboxTriggers += 1
    const combobox = /['"]role['"]\s*:\s*['"]combobox['"]/.test(trigger)
    if (!combobox && !ALLOWED.has(name))
      problems.push(`${name}.connect.ts：getTriggerProps 发了 aria-haspopup='listbox' 却没有 role='combobox'；按钮式弹出要登记进 ALLOWED`)
    if (combobox && ALLOWED.has(name))
      problems.push(`${name}.connect.ts：已写 role='combobox'，从 ALLOWED 里去掉`)
  }
}

/** 连接层是否在 DOM 上说了「正在加载」。 */
function saysLoading(src) {
  return /'data-loading'/.test(src) || /'data-state'[^\n]*'loading'/.test(src)
}

// ③ 在途状态：aria-busy 一律省略式（false 是它的缺省值，写出来只是噪音；这也是本仓 5:2 的多数派），
// 且凡是在 DOM 上说了「正在加载」的组件都得报 busy——皮肤看 data-loading / data-state='loading'
// 就能画转圈，读屏却只认 aria-busy，少了它辅助技术完全不知道这块在更新。
for (const [name, src] of busySources) {
  for (const m of src.matchAll(/['"]aria-busy['"]\s*:\s*([^,\n]+)/g)) {
    ariaBusy += 1
    if (!/undefined/.test(m[1]))
      problems.push(`${name}.connect.ts：aria-busy 写成了显式两值（${m[1].trim()}），家规是省略式——它的缺省就是 false`)
  }
  if (saysLoading(src) && !src.includes('\'aria-busy\'') && !(name in BUSY_EXEMPT))
    problems.push(`${name}.connect.ts：DOM 上说了正在加载，却不报 aria-busy——读屏不知道这块在更新`)
}

for (const name of Object.keys(BUSY_EXEMPT)) {
  const hit = busySources.find(([n]) => n === name)
  if (!hit || !saysLoading(hit[1]))
    problems.push(`BUSY_EXEMPT 里的 ${name} 已经不再说「正在加载」了——名单过期`)
}

for (const name of ALLOWED) {
  try {
    await readFile(join(HEADLESS, name, `${name}.connect.ts`), 'utf8')
  }
  catch {
    problems.push(`ALLOWED 里的 ${name} 没有 connect 文件——组件改名了就把名单一起改`)
  }
}

// ④ 报了 aria-busy 的组件，皮肤必须把在途画出来，而且不许只画在 cursor 上：
// 指针形状在触屏上根本不存在，只换指针等于手指按下去到结果出来之间屏上什么都不变，
// 用户只会接着点。也不许只靠禁用那一档灰——「系统正在想」与「你按不动」是两件事，
// 同一档灰把它们抹成一样，用户分不出该等还是该去补点什么。

/** 皮肤里能读到「正在忙」的那一位。取值型的相位从 connect 推出来。 */
function busyHooks(src) {
  const hooks = ['[aria-busy', '[data-loading']
  const guard = src.match(/['"]aria-busy['"]\s*:\s*([A-Za-z_$][\w$]*)\s*\?/)
  const decl = guard && src.match(new RegExp(`\\bconst\\s+${guard[1]}\\s*=\\s*([^\\n]+)`))
  const phase = decl && decl[1].match(/===\s*['"]([a-z0-9-]+)['"]|matches\(\s*['"]([a-z0-9-]+)['"]/)
  if (phase)
    hooks.push(`[data-state='${phase[1] ?? phase[2]}']`)
  return hooks
}

/**
 * 把一份皮肤拆成「常态渲染下会生效」的规则：选择器串 + 声明文本。
 *
 * 嵌在 @media / @supports / @container 里的一律不算——强制配色、减弱动效、打印那几档
 * 只在特定环境下画，把它们算进来，一个只在系统接管配色时才有的补救规则就能顶掉常态的缺画。
 * @layer 是分层不是条件，照常进。选择器带 [data-motion=] 的同理：那是作者打开减弱后的变体。
 */
function paintedRules(css) {
  const out = []
  const stack = []
  let buf = ''
  for (const ch of css.replace(/\/\*[\s\S]*?\*\//g, '')) {
    if (ch === '{') {
      stack.push(buf.trim().replace(/\s+/g, ' '))
      buf = ''
      continue
    }
    if (ch === '}') {
      const prelude = stack.pop()
      if (prelude && !prelude.startsWith('@') && stack.every(a => !a.startsWith('@') || a.startsWith('@layer')))
        out.push({ prelude, decls: buf })
      buf = ''
      continue
    }
    buf += ch
  }
  return out
}

/** 这条规则画了东西没有：cursor 与自定义属性都不算「画」。 */
function paints(decls) {
  return decls.split(';').some((piece) => {
    const prop = piece.split(':')[0]?.trim()
    return !!prop && /^[a-z-]+$/.test(prop) && !prop.startsWith('--') && prop !== 'cursor'
  })
}

const skinRules = []
for (const file of (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()) {
  for (const rule of paintedRules(await readFile(join(STYLES_DIR, file), 'utf8')))
    skinRules.push({ file, ...rule })
}

const busyPainted = new Set()
for (const [name, src] of busySources) {
  if (!src.includes('\'aria-busy\''))
    continue
  const hooks = busyHooks(src)
  const hit = skinRules.find((rule) => {
    // :not() 里的那一位是把在途排除在外，不是按它画：`[aria-disabled='true']:not([data-loading])`
    // 说的正是「这一档不给在途用」，算成有视觉就把缺画的那一处放过去了
    const positive = rule.prelude.replace(/:not\([^)]*\)/g, '')
    return positive.includes(`[data-scope='${name}']`)
      && !positive.includes('[data-motion=')
      && hooks.some(hook => positive.includes(hook))
      && paints(rule.decls)
  })
  if (hit) {
    busyPainted.add(name)
    if (name in BUSY_WITHOUT_SKIN)
      problems.push(`BUSY_WITHOUT_SKIN 里的 ${name} 已经画上在途了（${hit.file}  ${hit.prelude.slice(0, 60)}）——名单过期，删掉这一条`)
    continue
  }
  if (name in BUSY_WITHOUT_SKIN)
    continue
  problems.push(`${name}.connect.ts 报了 aria-busy，${name}.css 里却没有一条读 ${hooks.join(' / ')} 又真画了东西的规则——只换 cursor 的在途在触屏上是零反馈，只置灰的在途与「按不动」分不开`)
}

for (const name of Object.keys(BUSY_WITHOUT_SKIN)) {
  const hit = busySources.find(([n]) => n === name)
  if (!hit || !hit[1].includes('\'aria-busy\''))
    problems.push(`BUSY_WITHOUT_SKIN 里的 ${name} 已经不报 aria-busy 了——名单过期`)
}

if (problems.length) {
  console.error('[check-aria-shapes] ✗ 连接层 ARIA 写法不齐：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(`[check-aria-shapes] 通过：${connects} 份 connect，${ariaHidden} 处 aria-hidden 都写布尔，${listboxTriggers} 个 listbox 触发器角色齐全，${ariaBusy} 处 aria-busy 都写省略式；${busyPainted.size} 个组件把在途画在了 cursor 以外，${Object.keys(BUSY_WITHOUT_SKIN).length} 个登记放行`)
