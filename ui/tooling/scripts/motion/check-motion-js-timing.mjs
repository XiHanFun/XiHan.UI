#!/usr/bin/env node
// 门禁：headless 与 core 的 JS 不写死动画时长，也不自己排帧循环。
//
// 动画时长的真源是令牌：CSS 侧读 --xh-motion-duration-*，JS 侧经 readMotion(el) 从元素读同一组令牌，
// 作者改令牌、容器写 data-motion，两边一起变。写死的毫秒数与 motion 包的 durations 常量表绕开了这条路。
// 停留时长（提示停多久、自动播放间隔、长按判定）不是动效，作为组件属性的缺省值保留，但要登记在册、写清属于哪一类。
//
// 四条：
//   时长常量    —— 名字以 _DURATION / _MS / _DELAY / _INTERVAL / _TIMEOUT / _SPEED / _AFTER 结尾的数字常量
//                 逐条登记类别与理由：停留类写明它是哪个属性的缺省值，做成内部取值的写明为什么不开放；
//   时长表      —— 不直接读 motion 的 durations 常量表，时长从元素读令牌；
//   setInterval —— 只许出现在登记的文件里；
//   帧循环      —— 自己把自己再交给 requestAnimationFrame 的函数要登记理由，动画循环改用 motion 的 frameLoop。
// 三张登记表与待办表都两侧反查：登记了却没扫到的判过期；待办只减不增，不再违规的条目判过期。
import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

const ROOTS = ['packages/engine/headless/src', 'packages/engine/core/src']

/** 时长常量：键写「相对 packages/engine 的路径:常量名」，值写它属于哪一类、为什么不是动画时长。 */
const TIMING_CONSTANTS = {
  'headless/src/notification/notification.connect.ts:NOTIFICATION_DURATION': '停留：通知停多久才自动收起，属性 duration 的缺省值',
  'headless/src/toast/toast.machine.ts:TOAST_DURATION': '停留：轻提示停多久才自动收起，属性 duration 的缺省值',
  'headless/src/number-animation/number-animation.machine.ts:NUMBER_ANIMATION_DURATION': '补间缺省：数值补间走多久，属性 duration 的缺省值；减弱档按根节点所在的作用域取 0',
  'headless/src/heatmap/heatmap.grid.ts:DAY_MS': '单位：一天的毫秒数，日期换算用，不是时长',
  'headless/src/tooltip/tooltip.machine.ts:OPEN_DELAY': '停留：悬停、聚焦与触屏长按到打开的等待，属性 openDelay 的缺省值',
  'headless/src/tooltip/tooltip.machine.ts:CLOSE_DELAY': '停留：离开后的保留，属性 closeDelay 的缺省值',
  'headless/src/tooltip/tooltip.machine.ts:TOUCH_CLOSE_DELAY': '停留：长按打开后抬起手指的保留，内部取值：触屏读完提示要比悬停离开久，作者调 closeDelay 不该连带改它',
  'headless/src/hover-card/hover-card.machine.ts:OPEN_DELAY': '停留：悬停到打开的等待，属性 openDelay 的缺省值',
  'headless/src/hover-card/hover-card.machine.ts:CLOSE_DELAY': '停留：离开后的保留，属性 closeDelay 的缺省值',
  'headless/src/navigation-menu/navigation-menu.machine.ts:NAVIGATION_MENU_DELAY': '停留：悬停到展开的等待，属性 delayDuration 的缺省值',
  'headless/src/navigation-menu/navigation-menu.machine.ts:NAVIGATION_MENU_SKIP_DELAY': '停留：收起后直接展开下一个入口的窗口，属性 skipDelayDuration 的缺省值',
  'headless/src/pagination/pagination.machine.ts:PAGINATION_OPEN_DELAY': '停留：悬停省略位到打开页码浮层的等待，属性 openDelay 的缺省值',
  'headless/src/pagination/pagination.machine.ts:PAGINATION_CLOSE_DELAY': '停留：离开页码浮层后的保留，属性 closeDelay 的缺省值',
  'headless/src/context-menu/context-menu.machine.ts:CONTEXT_MENU_LONG_PRESS_DELAY': '停留：触屏长按到打开菜单的判定，属性 longPressDelay 的缺省值',
  'headless/src/carousel/carousel.machine.ts:CAROUSEL_AUTOPLAY_INTERVAL': '停留：自动轮播的间隔，属性 autoplay 写 true 时的缺省值；减弱动效下不自动起播',
  'headless/src/clipboard/clipboard.machine.ts:CLIPBOARD_TIMEOUT': '停留：复制成功态保留多久，属性 timeout 的缺省值',
  'headless/src/question-flow/question-flow.machine.ts:AUTO_ADVANCE_DELAY': '停留：单选选定后到下一题的等待，属性 autoAdvanceDelay 的缺省值',
  'headless/src/scrollbar/scrollbar.machine.ts:SCROLLBAR_HIDE_DELAY': '停留：停手与离开后多久隐藏，属性 hideDelay 的缺省值',
  'headless/src/scrollbar/scrollbar.machine.ts:SCROLLBAR_SCROLL_END_DELAY': '判定：停手多久算一段滚动结束，内部取值：它决定的是事件何时发出，不是作者要调的观感',
  'headless/src/number-field/number-field.machine.ts:NUMBER_FIELD_CHANGE_DELAY': '停留：按住步进按钮多久开始连发，属性 changeDelay 的缺省值',
  'headless/src/number-field/number-field.machine.ts:NUMBER_FIELD_CHANGE_INTERVAL': '节拍：连发的间隔，属性 changeInterval 的缺省值',
  'headless/src/timer/timer.format.ts:TIMER_INTERVAL': '节拍：显示刷新的周期，属性 interval 的缺省值；到期由另一个精确计时器判定',
  'headless/src/loading-bar/loading-bar.machine.ts:LOADING_BAR_TRICKLE_SPEED': '节拍：进度自动爬升的周期，属性 trickleSpeed 的缺省值',
  'headless/src/calendar-range-picker/calendar-range-picker.connect.ts:TOUCH_DRAG_DELAY': '判定：触屏按住多久才算开始拖选，内部取值：用来区分拖选与滚动页面，调短会误把滚动当拖选',
  'headless/src/virtualizer/virtualizer.kernel.ts:VIRTUALIZER_SCROLL_IDLE_DELAY': '判定：停手多久算滚动静止，内部取值：只决定何时重量条目尺寸',
  'headless/src/download-trigger/download-trigger.machine.ts:DOWNLOAD_TRIGGER_REVOKE_DELAY': '资源回收：临时下载地址延迟撤销，等浏览器接走下载；不是给人看的停留',
  'core/src/behavior/collection/typeahead.ts:RESET_AFTER': '停留：首字母检索在最后一次按键后多久清空前缀，集合共用的内部取值',
}

/** 可以用 setInterval 的文件：键写相对路径，值写理由。 */
const INTERVAL_FILES = {
  'core/src/machine/delay.ts': '机器的延时原语：after.* 的周期计时器由它统一排，组件不直接起',
}

/** 登记过的自调度帧回调：键写「相对路径:函数名」，值写为什么不是动画循环。 */
const RAF_LOOPS = {
  'headless/src/editable/editable.machine.ts:attempt': '有上限的落焦重试：宿主把输入框挂上之前隔帧再试，次数用完即停',
}

/** 待办：已知的违规，只减不增。键与上面三张表同形，时长表一条写「相对路径:durations」。 */
const BACKLOG = {}

async function collect(dir, out) {
  for (const entry of await readdir(dir)) {
    const path = join(dir, entry)
    if ((await stat(path)).isDirectory())
      await collect(path, out)
    else if (entry.endsWith('.ts'))
      out.push(path)
  }
  return out
}

/** 从 `{` 出发找到配对的 `}`。 */
function blockEnd(text, open) {
  let depth = 0
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{')
      depth++
    else if (text[i] === '}' && --depth === 0)
      return i
  }
  return text.length
}

const CONSTANT = /(?:export\s+)?const\s+([A-Z][A-Z0-9_]*_(?:DURATION|MS|DELAY|INTERVAL|TIMEOUT|SPEED|AFTER))\s*(?::[^=]+)?=\s*[\d_.]+/g
const DURATIONS_IMPORT = /import\s*\{[^}]*(?<![\w-])durations(?![\w-])[^}]*\}\s*from\s*'@xihan-ui\/motion'/
const INTERVAL = /(?<![\w.])setInterval\(|\.setInterval\(/g
/** 具名函数、或以常量 / 变量接住的函数：名字与函数体起点。 */
const FUNCTION_HEAD = /function\s+(\w+)\([^)]*\)[^{]*\{|(?:const|let)\s+(\w+)\s*=\s*(?:function[\w\s]*)?\([^)]*\)[^{]*\{/g

const problems = []
const seen = new Set()
const backlogSeen = new Set()
let constants = 0
let intervals = 0
let loops = 0

function report(key, message) {
  if (key in BACKLOG) {
    backlogSeen.add(key)
    return
  }
  problems.push(message)
}

for (const root of ROOTS) {
  for (const file of await collect(root, [])) {
    const text = await readFile(file, 'utf8')
    const rel = file.replaceAll('\\', '/').replace('packages/engine/', '')
    const lineOf = index => text.slice(0, index).split('\n').length

    for (const m of text.matchAll(CONSTANT)) {
      constants++
      const key = `${rel}:${m[1]}`
      if (key in TIMING_CONSTANTS) {
        seen.add(key)
        continue
      }
      report(key, `${rel}:${lineOf(m.index)}  ${m[1]} 是写死的毫秒数\n    —— 动画时长从元素读令牌（readMotion）；停留时长作为属性缺省值保留，登记进 TIMING_CONSTANTS 并写清类别`)
    }

    if (DURATIONS_IMPORT.test(text))
      report(`${rel}:durations`, `${rel}  直接读 motion 的 durations 常量表\n    —— 时长从元素读令牌（readMotion(el).duration(...)），作者改令牌、容器写 data-motion 才一起生效`)

    for (const m of text.matchAll(INTERVAL)) {
      intervals++
      if (rel in INTERVAL_FILES) {
        seen.add(rel)
        continue
      }
      report(rel, `${rel}:${lineOf(m.index)}  setInterval\n    —— 周期计时交给机器的 after.* 延时；逐帧推进用 motion 的 frameLoop`)
    }

    for (const m of text.matchAll(FUNCTION_HEAD)) {
      const name = m[1] ?? m[2]
      const open = m.index + m[0].length - 1
      const body = text.slice(open, blockEnd(text, open))
      const again = new RegExp(`requestAnimationFrame\\(\\s*(?:${name}\\s*\\)|\\(\\)\\s*=>\\s*${name}\\s*\\()`)
      if (!again.test(body))
        continue
      loops++
      const key = `${rel}:${name}`
      if (key in RAF_LOOPS) {
        seen.add(key)
        continue
      }
      report(key, `${rel}:${lineOf(m.index)}  ${name} 自己把自己再交给 requestAnimationFrame\n    —— 逐帧推进用 motion 的 frameLoop；不是动画循环（有上限的重试这类）就登记进 RAF_LOOPS 写清理由`)
    }
  }
}

for (const [table, entries] of [['TIMING_CONSTANTS', TIMING_CONSTANTS], ['INTERVAL_FILES', INTERVAL_FILES], ['RAF_LOOPS', RAF_LOOPS]]) {
  for (const key of Object.keys(entries)) {
    if (!seen.has(key))
      problems.push(`${key}  登记在 ${table} 里却没被扫到——名单过期了`)
  }
}
for (const key of Object.keys(BACKLOG)) {
  if (!backlogSeen.has(key))
    problems.push(`${key}  登记在 BACKLOG 里却已经不再违规——待办只减不增，删掉这一条`)
}

if (problems.length) {
  console.error('[check-motion-js-timing] ✗ JS 里的动效时长与帧调度没有走统一的路：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(
  `[check-motion-js-timing] 通过：${constants} 个时长常量、${intervals} 处 setInterval、${loops} 个自调度帧回调都已登记在册；`
  + `待办 ${Object.keys(BACKLOG).length} 条`,
)
