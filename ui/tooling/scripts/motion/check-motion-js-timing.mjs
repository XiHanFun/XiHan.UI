#!/usr/bin/env node
// 门禁：headless 与 core 的 JS 不写死动画时长，也不自己排帧循环。
//
// 动画时长的真源是令牌：CSS 侧读 --xh-motion-duration-*，JS 侧经 readMotion(el) 从元素读同一组令牌，
// 作者改令牌、容器写 data-motion，两边一起变。写死的毫秒数与 motion 包的 durations 常量表绕开了这条路。
// 停留时长（提示停多久、自动播放间隔、长按判定）不是动效，作为组件属性的缺省值保留，但要登记在册、写清属于哪一类。
//
// 四条：
//   时长常量    —— 名字以 _DURATION / _MS 结尾的数字常量逐条登记类别与理由；
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

const CONSTANT = /(?:export\s+)?const\s+([A-Z][A-Z0-9_]*_(?:DURATION|MS))\s*(?::[^=]+)?=\s*[\d_.]+/g
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
