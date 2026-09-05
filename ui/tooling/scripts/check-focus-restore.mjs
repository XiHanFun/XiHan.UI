#!/usr/bin/env node
// 门禁：浮层关掉之后焦点归还到哪儿，键盘表的承诺与机器的接线必须对得上。
//
// 焦点域默认按「创建前谁持有焦点」归还。指针入口下这个快照并不可靠——各平台对
// 「点按按钮给不给焦点」的处理不一致（Safari 不给），快照因此可能是 body。
// 于是 Escape 关闭浮层之后，Tab 得从页首重新走一遍，而键盘表上白纸黑字写着焦点回到触发器。
// focus-scope 的 restoreTarget 就是为这件事留的口子：把触发器显式交进去。
//
// 三条判据：
//   一 键盘表里带 restoresFocus: true 的组件，机器必须交出 restoreTarget；
//   二 交了 restoreTarget 的组件，键盘表里必须有一行 restoresFocus: true——使用者要读得到这条行为；
//   三 建了焦点域的机器一律要交 restoreTarget，不交的逐个登记，写明凭什么信得过那个快照。
//
// 承诺的真源是 restoresFocus 这个字段，不是 does 里的措辞。同一件事有「焦点归还 trigger」
// 「把焦点还给 trigger」「焦点回到 trigger」「焦点还给触发按钮」等七八种写法，
// 拿措辞去匹配，漏掉哪一种都是无声的。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const HEADLESS = 'packages/engine/headless/src'

/** 机器里交出归还落点的写法。 */
const WIRED = /\brestoreTarget\s*:/
/** 建焦点域的调用。 */
const FOCUS_SCOPE = /\bcreateFocusScope\s*\(/

/**
 * 不交显式落点的组件，逐个写明凭什么。
 * 每条都要真被用来放行过一次——组件补上了落点，或者既不再承诺也不再建焦点域，
 * 这条就成了一张过期的免检通行证，由下面的名单核验报出来。
 */
const EXEMPT = {
  'popconfirm': '自己没有机器，浮层跑的是 popover 那台，焦点域与归还都在那一层建',
  'navigation-menu': '不建焦点域：面板里是链接不是菜单项，收起时由 focusItem 直接把焦点放回对应 trigger',
  'menubar': 'roving 锚点自己算，退出动作里手搬焦点（restoreTriggerFocus）',
  'side-nav': '面板只在键盘展开时建焦点域，那种入口下创建前的持有者就是触发按钮；指针会话不建域，拆除时自己把焦点搬回锚点',
  'date-picker': '触发器是输入行，点它必然把焦点落到某一段上，创建前的快照就是它本身',
  'tour': '引导没有触发器，由宿主程序发起，除了创建前的持有者没有别的落点可交',
}

/** 去掉块注释与行注释，注释里的字样不参与任何判断。 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

/**
 * 从键盘表源码里取出 rows 数组的每一条。
 * 逐字符走并跨过字符串，字面量里的花括号与方括号不参与配对。
 * sawBrace 区分「表是空的」与「表里有条目但这套解析读不出来」。
 */
function parseRows(src) {
  const head = /\brows:\s*\[/.exec(src)
  if (!head)
    return null

  const rows = []
  let sawBrace = false
  let i = head.index + head[0].length
  let depth = 0
  let start = -1
  let quote = ''

  while (i < src.length) {
    const ch = src[i]
    if (quote) {
      if (ch === '\\') {
        i += 2
        continue
      }
      if (ch === quote)
        quote = ''
      i += 1
      continue
    }
    if (ch === '\'' || ch === '"' || ch === '`') {
      quote = ch
      i += 1
      continue
    }
    if (ch === '{') {
      sawBrace = true
      if (depth === 0)
        start = i
      depth += 1
      i += 1
      continue
    }
    if (ch === '}') {
      depth -= 1
      if (depth === 0 && start >= 0) {
        rows.push({
          text: src.slice(start, i + 1),
          line: src.slice(0, start).split('\n').length,
        })
        start = -1
      }
      i += 1
      continue
    }
    // 顶层的右方括号即数组收尾；花括号里的方括号（keys 那一串）由 depth 挡住
    if (ch === ']' && depth === 0)
      break
    i += 1
  }
  return { rows, sawBrace }
}

/** 取一条 row 里某个字符串字段的值。 */
function stringField(text, key) {
  const m = new RegExp(`\\b${key}:\\s*'((?:[^'\\\\]|\\\\.)*)'`).exec(text)
  return m ? m[1] : null
}

/** 本组件目录下所有源码，按 file:line 定位用。 */
async function readSources(dir) {
  const out = []
  for (const name of (await readdir(dir)).sort()) {
    if (!name.endsWith('.ts'))
      continue
    const file = `${dir}/${name}`.split('\\').join('/')
    out.push({ file, lines: stripComments(await readFile(join(dir, name), 'utf8')).split('\n') })
  }
  return out
}

/** 在一组源码里找首个命中的位置，写成 file:line。 */
function locate(sources, pattern) {
  for (const { file, lines } of sources) {
    for (let i = 0; i < lines.length; i += 1) {
      if (pattern.test(lines[i]))
        return `${file}:${i + 1}`
    }
  }
  return null
}

const problems = []
const exemptSeen = new Set()
let promised = 0
let scoped = 0

for (const entry of (await readdir(HEADLESS, { withFileTypes: true })).filter(d => d.isDirectory()).sort((a, b) => a.name < b.name ? -1 : 1)) {
  const name = entry.name
  const dir = join(HEADLESS, name)
  const keyboardFile = `${HEADLESS}/${name}/${name}.keyboard.ts`.split('\\').join('/')

  let keyboardSrc
  try {
    keyboardSrc = stripComments(await readFile(join(dir, `${name}.keyboard.ts`), 'utf8'))
  }
  catch {
    keyboardSrc = null
  }

  const sources = await readSources(dir)
  const wiredAt = locate(sources, WIRED)
  const scopeAt = locate(sources, FOCUS_SCOPE)

  // 键盘表的承诺：只认 restoresFocus 这个字段
  let promises = false
  if (keyboardSrc !== null) {
    const parsed = parseRows(keyboardSrc)
    if (parsed === null) {
      // 没有 rows 的键盘表（不接收焦点的组件）合法，但它不该有落点接线
      if (wiredAt)
        problems.push(`${wiredAt}  交了 restoreTarget，而 ${keyboardFile} 里没有 rows——把这条行为写进键盘表，使用者才读得到`)
      continue
    }
    if (parsed.sawBrace && !parsed.rows.length) {
      problems.push(`${keyboardFile}  rows 里有条目却一条都没读出来——这道门禁只认 rows: [{ … }] 的字面量写法，换了形状它就看不见承诺`)
      continue
    }
    for (const row of parsed.rows) {
      const flag = /\brestoresFocus:\s*(true|false)\b/.exec(row.text)
      if (flag?.[1] === 'true') {
        promises = true
        const id = stringField(row.text, 'id')
        // 承诺归还的键位必然是收起浮层的那一下，does 得说清楚关掉之后焦点去哪儿
        if (!stringField(row.text, 'does'))
          problems.push(`${keyboardFile}:${row.line}  ${id ?? '这一行'} 标了 restoresFocus: true 却没有 does——承诺要写成人话，文档直接渲染这一列`)
      }
    }
  }
  else if (wiredAt) {
    problems.push(`${wiredAt}  交了 restoreTarget，而 ${name} 没有键盘表——补一份 ${name}.keyboard.ts，把归还这条行为写进去`)
    continue
  }
  else {
    continue
  }

  if (promises)
    promised += 1
  if (scopeAt)
    scoped += 1

  const exempt = name in EXEMPT

  // 判据一：承诺了就得交落点
  if (promises && !wiredAt && !exempt) {
    problems.push(`${keyboardFile}  键盘表标了 restoresFocus: true，机器却没给焦点域交 restoreTarget——指针打开时归还会落到 body。在 createFocusScope 里补 restoreTarget: () => refs.get('getAnchorEl')()，由别人代兑的登记进 EXEMPT`)
  }

  // 判据二：交了落点就得写进键盘表
  if (!promises && wiredAt) {
    problems.push(`${wiredAt}  交了 restoreTarget，${keyboardFile} 里却没有一行标 restoresFocus: true——使用者读不到这条行为。给收起浮层的那一行补上 restoresFocus: true`)
  }

  // 判据三：建了焦点域就得交落点
  if (scopeAt && !wiredAt && !exempt) {
    problems.push(`${scopeAt}  建了焦点域却没交 restoreTarget，归还只能靠创建前的焦点快照——指针入口下那可能是 body。补 restoreTarget，或者把 ${name} 登记进 EXEMPT 并写明凭什么信得过这个快照`)
  }

  if (exempt && (promises || scopeAt)) {
    if (wiredAt)
      problems.push(`${name} 登记在 EXEMPT 里，${wiredAt} 却已经交了 restoreTarget——名单过期，删掉这条`)
    else
      exemptSeen.add(name)
  }
}

for (const name of Object.keys(EXEMPT)) {
  if (!exemptSeen.has(name))
    problems.push(`${name} 登记在 EXEMPT 里，但它既不承诺归还触发器也不建焦点域了——名单过期，删掉这条`)
}

if (problems.length) {
  console.error('[check-focus-restore] ✗ 焦点归还的承诺与接线对不上：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  process.exit(1)
}

console.log(`[check-focus-restore] 通过：${promised} 个组件在键盘表里承诺归还触发器、${scoped} 台机器建了焦点域，落点接线逐个对上（登记不交显式落点的 ${exemptSeen.size} 个）`)
