#!/usr/bin/env node
// 门禁：connect 发出的每一个 data-* 属性，要么在**这个组件自己的作用域里**有一条规则消费它，
// 要么登记在下面的表里说清为什么不该有视觉。
//
// 判据按 (组件, 属性) 这一对算，不按属性名算全库差集。差集口径下，属性名只要在任何一份皮肤的
// 选择器里出现过就算活的，于是 field-array 的 data-at-max 会被 tags-input 那条规则算成活的、
// calendar 的 data-focus 会被 date-field 的规则算成活的——两者其实互不相干，规则永远选不中对方。
//
// 消费面不止本组件那份皮肤：
// · 带 scope 值的选择器（`[data-scope='x'] … [data-attr]`）算 x 这个组件的消费，
//   写在哪份文件里都算——date-picker.css 里那些 `[data-scope='calendar']` 的规则就是给日历的。
// · 整条选择器一个 scope 值都没有的，是与组件无关的通用规则（tone.css 的 [data-tone]、
//   reset.css 的 [data-positioned]），对所有组件都算消费。
//
// 表分两份：
// · HOOK_ATTRS —— 属性级放行。属性名本身就在传值、传序号、传名字，落在哪个组件上都是给作者与
//   测试用的数据位，本就不该有视觉。
// · HOOKS —— 逐对放行。属性在别处是有视觉的，这一处的那件事由别的通道承载，理由里写清是哪一条。
//
// 两份表登的都是「本来就不该有」的永久结论，不收「该有还没写」——那种只能以失败呈现。
// 两份表都做过期反查：登记了却没被扫到（属性不再发了，或者已经补上规则了）同样判失败。
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const uiRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const HEADLESS_SRC = join(uiRoot, 'packages/engine/headless/src')
const STYLES_DIR = join(uiRoot, 'packages/design/styles/css')

/** connect 里发射的 data-* 键，取单引号写法（本仓一律如此）。 */
const RE_DATA_KEY = /'(data-[\w-]+)'\s*:/g
/** 选择器里带值的 scope 限定，决定这条规则归哪个组件。 */
const RE_SCOPE_VALUE = /\[data-scope=['"]([a-z0-9-]+)['"]\]/g
/** 选择器里出现的 data-* 属性名，带不带取值都算。 */
const RE_ATTR_IN_SELECTOR = /\[(data-[a-z0-9-]+)/g

/**
 * 属性级放行：这些属性名本身就是数据位，凡是没有规则的地方一律按信息钩子算。
 * 名字不在这张表里、又确实该有视觉的，补皮肤规则。
 */
const HOOK_ATTRS = {
  'data-index': '第几个。取值是序号，作者拿它定位、测试拿它断言',
  'data-value': '条目的值。取值来自数据，不是状态',
  'data-count': '有几个',
  'data-checked-count': '勾了几个',
  'data-max': '上限是几',
  'data-level': '第几档。热力格的颜色由 connect 的内联 style 直接给，二维码是纠错档，级联是第几层',
  'data-lang': '哪门语言。着色由 token 的 data-kind 表出，语言名只是标注',
  'data-line-number': '第几行',
  'data-column': '第几列',
  'data-lane': '第几条泳道',
  'data-section': '这一行属于表头、表体还是表尾',
  'data-side': '哪一侧。两侧的版面是对称的，不按侧别分档',
  'data-unit': '哪个时间单位',
  'data-segment': '哪个日期段',
  'data-lines': '截到几行。真正裁切的是行数槽，这一位只是把入参照抄出来',
  'data-icon': '图标叫什么名字',
  'data-step': '第几步',
  'data-bound': '图例的哪一端',
  'data-modules': '二维码有几个模块',
  'data-version': '二维码是第几版',
  'data-platform': '按键名按哪套平台写法渲染',
  'data-file-name': '文件叫什么',
  'data-file-size': '文件多少字节',
  'data-role': '这条消息是谁说的。message-feed.css:81 已写明：左右分侧由使用者按它自己写',
  'data-complete': '填完了 / 流完了。是一个数据位，完成与否的观感由内容本身表出',
  'data-out-of-range': '越界。date / time 四家把 invalid 与 outOfRange 并成一位打进 data-invalid，视觉挂在那一位上',
  'data-required': '必填。星号由 field 画（field.css:51 按根上的 data-required），控件自身这一位是钩子',
  'data-empty': '空。空与非空的差别由内容本身表出——占位文字通道、空态部件，或者干脆没有东西可画',
  'data-scrolling': '正在滚。滚动条露不露面由 data-state=visible|hidden 表出，这一位是同一件事的数据面',
}

/**
 * 逐对放行：属性在别的组件上是有视觉的，这一处那件事由别的通道承载。
 * 键写成「组件:属性」，值写清承载它的是哪一条。
 */
const HOOKS = {
  // 显隐一律由 hidden 承载：收起时留着节点只加 hidden，data-state 是同一件事的同名镜像
  'alert:data-state': '开合的显隐由 root 上的 hidden 承载',
  'avatar:data-state': '图与兜底各自的显隐由自己的 hidden 承载',
  'back-top:data-state': '收起时置 hidden，显隐由它承载',
  'editable:data-state': '预览与输入的切换由两边各自的 hidden 承载',
  'float-button:data-state': '展开的视觉是列表的 hidden',
  'image:data-state': '图与兜底各自的显隐由自己的 hidden 承载',
  'skeleton:data-state': '加载完置 hidden，整块骨架收起',
  'tag:data-state': '关掉后置 hidden',
  // 同一件事在别的部件上已经画了，根上这一位是镜像
  'code-view:data-state': '折叠的视觉在根的 data-clamped 上，触发器这一位是镜像',
  'markdown-stream:data-state': '流式的视觉是内容上的 data-caret',
  'prompt-input:data-state': '输入框的机器态；能看见的运行态在提交钮的 data-mode 上',
  'rating:data-state': '星的填充走 data-highlighted 与 data-half',
  'number-animation:data-state': '数字滚动的外观不随相位变，相位只留给作者接线',
  // 禁用不在这张表里：pointer.css 那条与组件无关的规则消费全库的 data-disabled
  'infinite-scroll:data-loading': 'infinite-scroll.css:9 已写明：加载中的观感由作者自己的哨兵内容表出',
  'table:data-loading': '加载中的观感由 loading 部件承载（table.css:746 起，收起时 hidden）',
  // 只读：观感落在真正的输入件身上
  'field:data-readonly': '只读的观感落在各输入件自己身上（text-field.css:155 那一类），这一层只往下传状态',
  'form:data-readonly': '整份表单置只读时由逐个控件自己表出',
  // 忙：锁住的观感由提交钮的身份切换承载
  'prompt-input:data-loading': '在途时提交钮切成 data-mode=stop，观感挂在那一位上',
  // 暂停：自动播放钮自己有 running / paused 两档；另两家解剖里没有能承载停表的部件
  'carousel:data-paused': '暂停的视觉在自动播放钮的 data-state=paused 上（carousel.css:248）',
  'notification:data-paused': '解剖里没有进度部件能承载停表；与 toast 那一条成对',
  'toast:data-paused': '解剖里没有进度部件能承载停表；与 notification 那一条成对',
  // 其余逐条
  'calendar:data-focus': '漫游焦点的锚点位。看得见的聚焦环走 :focus-visible',
  'carousel:data-autoplay': '自动播放开没开，视觉在自动播放钮的 data-state 上',
  'carousel:data-inview': '这一帧在不在视口里，作者拿它做懒加载与埋点',
  'code-view:data-foldable': '折不折得动。真正裁切的是根上的 data-clamped',
  'diff-view:data-expanded': '折叠段展开后整条 gap 置 hidden，显隐由它承载',
  'diff-view:data-truncated': '整份差异被截断的标志，作者拿它决定要不要提示"还有更多"',
  'field-array:data-at-max': '顶到上限时新增钮置 aria-disabled，观感挂在那一位上（field-array.css:173）',
  'field-array:data-at-min': '到下限时删除钮置 aria-disabled，观感挂在那一位上（field-array.css:124）',
  'field-array:data-first': '第一条在形上与别的条目没有差别',
  'field-array:data-last': '最后一条在形上与别的条目没有差别',
  'field-array:data-movable': '这份列表能不能排序。手柄本身收不收由 hidden 承载',
  'file-upload:data-remote': '这条是不是已在服务端的旧文件，作者拿它决定要不要重传',
  'highlight:data-case-sensitive': '匹配时区不区分大小写，是查找入参不是外观',
  'json-viewer:data-view': '树视图还是原文视图，两种视图渲染的是不同的部件',
  'loading-bar:data-indeterminate': '不知进度时涓流本身就是表达，不另给一档外观',
  'log:data-at-bottom': '视口贴没贴底，作者拿它决定要不要提示"有新内容"',
  'log:data-sticking': '还粘不粘着底，与上面那一位成对',
  'markdown-stream:data-live': '这一块还在流。看得见的是内容上的 data-caret',
  'masonry:data-sequential': '按序还是按高度填列，是排布入参不是外观',
  'message-feed:data-streaming': '这条消息还在流，气泡本身不随它改样子',
  'qr-code:data-logo': '中心留没留出徽标位。真正挖洞的是 connect 算出来的内联 style',
  'question-flow:data-mode': '提交钮是"继续"还是"发送"，换的是文案不是外观',
  'scroll-area:data-dragging': '拖的是滚动条部件，滚块的观感由 scrollbar.css:125 那条画',
  'scroll-area:data-reveal-mode': '露面策略是入参；露不露由 data-state=visible|hidden 表出',
  'scrollbar:data-reveal-mode': '露面策略是入参；露不露由 data-state=visible|hidden 表出',
  'table:data-sortable': '这一列排不排得了序。排序钮不排序时置 hidden，箭头由 data-sort 画',
  'tags-input:data-overflowing': '越过上限时 data-at-max 同时为真（前者是 count > max，后者是 count >= max），观感由 control 上的 at-max 描边一并承载，两者不另分档',
  'timer:data-action': '控制钮这一按是开始还是暂停，换的是文案不是外观',
  'timer:data-controlled': '状态归 value / active 两个 prop 还是归起停按钮，两条通道画出来一模一样',
  'timer:data-countdown': '正计时还是倒计时，数字的排版两者一致',
  'timestamp:data-format': '按日期、时间还是两者一起渲染，换的是文本不是外观',
  'tour:data-last': '走到末步。末步换的是按钮文案不是外观',
  'transfer:data-one-way': '单向还是双向。少一组钮由 hidden 承载',
  'tree-select:data-indeterminate': '解剖里没有勾选框部件，三态没有可画的地方；选中与否由 data-selected 表出',
}

/** 去掉注释，注释里的选择器不算数。 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

/** 取出所有规则块的选择器串；@ 开头的前奏（@layer / @media / @supports）不算选择器。 */
function selectorLists(css) {
  const out = []
  let buf = ''
  for (const ch of css) {
    if (ch === '{') {
      const prelude = buf.trim()
      buf = ''
      if (prelude && !prelude.startsWith('@'))
        out.push(prelude)
      continue
    }
    if (ch === '}' || ch === ';') {
      buf = ''
      continue
    }
    buf += ch
  }
  return out
}

/**
 * 抹掉 `@media (forced-colors: active)` 的整块正文（换行留着，别的判据的行号不移位）。
 *
 * 那一档里的规则只在系统接管配色时才画，常态渲染下一条都不生效；算进消费面的话，
 * 公共补救层那条 `[data-scope][data-state='checked']` 会把每一个组件的 data-state
 * 都算成「有视觉」，本判据就再也看不出常态下漏画的状态。
 */
function stripForcedColors(css) {
  let out = css
  for (;;) {
    const at = out.search(/@media\s*\(\s*forced-colors\s*:\s*active\s*\)\s*\{/)
    if (at === -1)
      return out
    const open = out.indexOf('{', at)
    let depth = 0
    let end = out.length
    for (let i = open; i < out.length; i++) {
      if (out[i] === '{') {
        depth++
      }
      else if (out[i] === '}') {
        depth--
        if (depth === 0) {
          end = i + 1
          break
        }
      }
    }
    out = out.slice(0, at) + out.slice(at, end).replace(/[^\n]/g, ' ') + out.slice(end)
  }
}

/** 按分隔符切，括号里的不切——:is(a, b) 这类里面的逗号不是选择器分隔。 */
function splitTop(text, sep) {
  const parts = []
  let cur = ''
  let paren = 0
  for (const ch of text) {
    if (ch === '(')
      paren++
    if (ch === ')')
      paren--
    if (paren === 0 && ch === sep) {
      parts.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }
  parts.push(cur)
  return parts.map(s => s.trim()).filter(Boolean)
}

function lineOf(source, index) {
  let line = 1
  for (let i = 0; i < index; i++) {
    if (source[i] === '\n')
      line++
  }
  return line
}

// 发射面：每个组件的 connect 发出了哪些 data-*
const emitted = new Map()
let connectFiles = 0
for (const entry of await readdir(HEADLESS_SRC, { withFileTypes: true })) {
  if (!entry.isDirectory())
    continue
  let names
  try {
    names = await readdir(join(HEADLESS_SRC, entry.name))
  }
  catch {
    continue
  }
  for (const name of names) {
    if (!name.endsWith('.connect.ts'))
      continue
    const source = await readFile(join(HEADLESS_SRC, entry.name, name), 'utf8')
    connectFiles++
    for (const match of source.matchAll(RE_DATA_KEY)) {
      if (!emitted.has(entry.name))
        emitted.set(entry.name, new Map())
      const attrs = emitted.get(entry.name)
      if (!attrs.has(match[1]))
        attrs.set(match[1], `${entry.name}/${name}:${lineOf(source, match.index)}`)
    }
  }
}

// 消费面：带 scope 值的规则归那个组件，一个 scope 值都没有的规则对所有组件都算
const scopedConsume = new Map()
const genericConsume = new Set()
let skinFiles = 0
for (const file of (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()) {
  skinFiles++
  const css = stripForcedColors(stripComments(await readFile(join(STYLES_DIR, file), 'utf8')))
  for (const list of selectorLists(css)) {
    for (const selector of splitTop(list, ',')) {
      const attrs = [...selector.matchAll(RE_ATTR_IN_SELECTOR)].map(m => m[1]).filter(a => a !== 'data-scope')
      if (attrs.length === 0)
        continue
      const scopes = new Set([...selector.matchAll(RE_SCOPE_VALUE)].map(m => m[1]))
      if (scopes.size === 0) {
        for (const attr of attrs)
          genericConsume.add(attr)
        continue
      }
      for (const scope of scopes) {
        if (!scopedConsume.has(scope))
          scopedConsume.set(scope, new Set())
        for (const attr of attrs)
          scopedConsume.get(scope).add(attr)
      }
    }
  }
}

const problems = []
const hookAttrSeen = new Set()
const hookSeen = new Set()
let pairs = 0
let alive = 0

for (const [component, attrs] of [...emitted].sort()) {
  for (const [attr, where] of [...attrs].sort()) {
    pairs++
    if (genericConsume.has(attr) || scopedConsume.get(component)?.has(attr)) {
      alive++
      continue
    }
    const key = `${component}:${attr}`
    if (attr in HOOK_ATTRS) {
      hookAttrSeen.add(attr)
      continue
    }
    if (key in HOOKS) {
      hookSeen.add(key)
      continue
    }
    problems.push(`${where} 发了 ${attr}，但 [data-scope='${component}'] 这个作用域里没有一条规则消费它——补一条皮肤规则，或者登记进 HOOKS`)
  }
}

for (const attr of Object.keys(HOOK_ATTRS)) {
  if (!hookAttrSeen.has(attr))
    problems.push(`HOOK_ATTRS 里登着 ${attr}，却没有一对是靠它放行的——名单过期了，删掉这一条`)
}
for (const key of Object.keys(HOOKS)) {
  if (!hookSeen.has(key))
    problems.push(`HOOKS 里登着 ${key}，却没被扫到——属性不发了，或者已经补上规则了，删掉这一条`)
}

if (problems.length > 0) {
  console.error('[check-dead-state-attr] ✗ 状态属性发了没人消费：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('\n判据按 (组件, 属性) 算：别的组件有同名规则不算数，那条规则永远选不中这个组件。')
  process.exit(1)
}

console.log(`[check-dead-state-attr] 通过：${connectFiles} 份 connect · ${skinFiles} 份皮肤 · ${pairs} 对（组件, 属性），${alive} 对在本组件作用域内有规则；登记放行 ${pairs - alive} 对（属性级 ${hookAttrSeen.size} 类 · 逐对钩子 ${hookSeen.size} 条）`)
