#!/usr/bin/env node
// 门禁：键盘表里承诺「焦点归还触发器」的组件，机器必须显式交出归还落点。
//
// 焦点域默认按「创建前谁持有焦点」归还。指针入口下这个快照并不可靠——各平台对
// 「点按按钮给不给焦点」的处理不一致（Safari 不给），快照因此可能是 body。
// 于是 Escape 关闭浮层之后，Tab 得从页首重新走一遍，而键盘表上白纸黑字写着
// 「焦点归还 trigger」。focus-scope 的 restoreTarget 就是为这件事留的口子。
//
// 两个方向都查：承诺了却没接线是失信；接了线却没在键盘表里写，是使用者读不到这条行为。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const HEADLESS = 'packages/engine/headless/src'

/** 键盘表里表示「把焦点还回触发器」的说法。 */
const PROMISE = /归还[^，。；]{0,8}(?:trigger|触发器|触发区)/
/** 机器里交出落点的写法。 */
const WIRED = /restoreTarget\s*:/

/** 承诺了但由别人代为兑现的，各带理由。 */
const DELEGATED = {
  'popselect': '浮层是宿主 popover 的，焦点域与归还都由宿主那一层建',
  'navigation-menu': '不建焦点域：面板里是链接不是菜单项，收起时由 focusItem 直接把焦点放回对应 trigger',
  'menubar': 'roving 锚点自己算，退出动作里手搬焦点（restoreTriggerFocus）',
}

const problems = []
let promised = 0
const delegatedSeen = new Set()

for (const entry of await readdir(HEADLESS, { withFileTypes: true })) {
  if (!entry.isDirectory())
    continue
  const name = entry.name
  let keyboard
  try {
    keyboard = await readFile(join(HEADLESS, name, `${name}.keyboard.ts`), 'utf8')
  }
  catch {
    continue
  }
  let machine = ''
  try {
    machine = await readFile(join(HEADLESS, name, `${name}.machine.ts`), 'utf8')
  }
  catch {
    machine = ''
  }

  const promises = PROMISE.test(keyboard)
  const wired = WIRED.test(machine)

  if (promises) {
    promised += 1
    if (name in DELEGATED) {
      delegatedSeen.add(name)
      continue
    }
    if (!wired)
      problems.push(`${name}：键盘表承诺「焦点归还触发器」，机器却没给焦点域交 restoreTarget——指针打开时归还会落到 body`)
  }
  else if (wired) {
    problems.push(`${name}：机器交了 restoreTarget，键盘表里却没写这条行为——使用者读不到`)
  }
}

for (const name of Object.keys(DELEGATED)) {
  if (!delegatedSeen.has(name))
    problems.push(`${name} 登记在 DELEGATED 里，但它的键盘表已经不再承诺归还触发器了——名单过期`)
}

if (problems.length) {
  console.error('[check-focus-restore] ✗ 焦点归还的承诺与接线对不上：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  console.error('\n接线写 restoreTarget: () => refs.get(\'getAnchorEl\')()；由别人代为兑现的登记进 DELEGATED。')
  process.exit(1)
}

console.log(`[check-focus-restore] 通过：${promised} 个承诺归还触发器的组件都交了归还落点（由宿主或自有算法代兑的 ${delegatedSeen.size} 个）`)
