#!/usr/bin/env node
// 门禁：点得动的东西，按下去要有回应。
//
// 悬停变色是「指哪一个」，按下缩放是「点到了」——两件事。只做悬停的控件，
// 用户按下去到松手之间毫无变化，触屏上尤其明显：手指盖住了元素，抬起才知道点没点中。
//
// 判据只管「有没有」，不管缩多少：缩放量走 --xh-motion-scale-press，
// 减弱动效档把它归 1，所以这条不与无障碍冲突。
//
// 不是每个组件都该有按压反馈——输入框、只读展示件按下去不该动。所以分两张表：
// 该给的登进 PRESSABLE 逐条查形态，不该给的登进 NO_PRESS 留一句理由。
// NO_PRESS 两侧都反查，登记过期或者反馈后来补上了都会判失败。
//
// 全集是扫出来的，不是登出来的：皮肤里带 cursor:pointer 的部件就是「可点部件」，
// 两张表加起来必须盖住它们，漏一个就判红。反过来不成立——已登记的部件不要求自己那条
// 规则里写 cursor:pointer，共享规则里继承来的也算数。
// 可点的是选择器末尾那个复合体（主体）；主体戴着别的组件的 scope 时，说明这份皮肤把可点加在了
// 内嵌的别家部件上（tag-group 给 tag 的 root），键写成「宿主:scope/部件」，登记时照抄。
//
// 三种形态：
// ① 即时按压（多数）：反馈落在 :active 上，缩放量走令牌。
// ② 长按等待（登记成 { part, attr }）：要按满一段时间才生效的操作，反馈由连接层打的
//    状态属性驱动。这一支不能靠 :active——手指按住不动时 :active 会被滚动接管等原因
//    提前撤掉，而等待期恰恰是最需要回执的那几百毫秒；也不比缩放，因为这类触发区往往是
//    作者的整块内容，缩放它会把作者自己的排版一起抖起来。改比底色。
// ③ 列表行的即时换面：显式登记 feedback: 'surface'，换底可由本部件或（投影了 data-xh-collection-item 时）
//    家族配方的 pressed 面给出，禁止改变按压几何。投影了 data-xh-action-control 且 profile 为 row /
//    disclosure-trigger 的部件（§9.2 铺满一行的动作条目与 disclosure trigger）读 family/action-control.css：
//    通用按压块给换底，两档专属的按压块 scale: none 保住几何。
//
// 真源 §9.1 / §9.2 再加四条：
// ⑤ 几何判据：登记为缩放的部件，基础规则含 inline-size: 100% / flex: 1 / display: block，或按 §4.1
//    归为 disclosure trigger / row 的，不该缩放整条——改登记 { part, feedback: 'surface' }；
// ⑥ 缩放必换底：:active 块（或家族配方的 :active 块）必须同时换一个非透明的 background；
// ⑦ 集合行不许零反馈：NO_PRESS 只留扩大命中区标签、拖拽轨道、字段外壳与值区、作者内容区四类永久理由，
//    列表行一律登 PRESSABLE 的 surface 形态；
// ⑧ data-pressed 第二判据：PRESSABLE 部件的 connect getter 必须投影 data-pressed（Space / Enter 与粗指针
//    的按压由 Headless 投影），家族配方的按压选择器必须是 :is(:active, [data-pressed])。
//    皮肤自己写的按压规则两种写法都认：:active（只有指针）与 :is(:active, [data-pressed])（三种输入同一档）。
// 存量登 family-backlog.json press 段：⑤ 的 15 条、⑥ 只缩放不换底的、⑦ 皮肤还没有 :active 换面的行，
// 以及 ⑧ 各组件接上 press-channel 之前的一条 *:data-pressed 总豁免（button / toggle 已接，其余随各组件
// 提交接入，全部接完即删）；命中即放行、不命中判过期，表只减不增。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getterBody } from './lib/connect-getters.mjs'
import { openBacklog } from './lib/family-backlog.mjs'

const SKINS = 'packages/design/styles/css'
const HEADLESS = 'packages/engine/headless/src'
const ACTION_RECIPE = 'packages/design/styles/family/action-control.css'
const COLLECTION_RECIPE = 'packages/design/styles/family/collection-item.css'

/**
 * 该有按压反馈的控件，连同它的部件名（一个组件可以登记多个部件）。
 * 字符串按形态①查，`{ part, attr }` 按②查，`{ part, feedback: 'surface' }` 按③查。
 */
const PRESSABLE = {
  'menu': [{ part: 'item', feedback: 'surface' }],
  // 列表族条目：一行文字，按下的回执走换面，不缩放整列（§9.2 集合行不允许零反馈）
  'command': [{ part: 'item', feedback: 'surface' }],
  'mention': [{ part: 'item', feedback: 'surface' }],
  'tree': [{ part: 'item', feedback: 'surface' }, { part: 'branch-control', feedback: 'surface' }],
  'json-viewer': [{ part: 'branch-control', feedback: 'surface' }],
  'side-nav': [{ part: 'link', feedback: 'surface' }, { part: 'branch-trigger', feedback: 'surface' }],
  'steps': [{ part: 'trigger', feedback: 'surface' }],
  // 圆圈 + 文字的整行条目：回执落在整行的换面上，圆点的缩放归指示器
  'radio-group': [{ part: 'item', feedback: 'surface' }],
  // 按钮形的控件本体：整颗就是点击目标
  'button': ['root'],
  'download-trigger': [{ part: 'root', feedback: 'surface' }],
  'toggle': ['root'],
  'toggle-group': [{ part: 'item', feedback: 'surface' }],
  'segmented': ['item'],
  'back-top': ['trigger'],
  'float-button': ['trigger'],
  'clipboard': [{ part: 'copy-trigger', feedback: 'surface' }],
  // 列表末尾铺满一行的「取下一页」：Action Control row 档，按下只换面不缩放（§9.2）
  'infinite-scroll': [{ part: 'load-more-trigger', feedback: 'surface' }],
  // 集合件尾部的「取下一页」：Action Control row 档铺满一行，按下只换面不缩放（§9.2）；条目走 Collection Item 的 page 语境
  'listbox': [{ part: 'load-more-trigger', feedback: 'surface' }, { part: 'item', feedback: 'surface' }],
  // 组里的一枚标签就是 tag 的 root，整枚就是点击目标；摘除钮是 tag 的 close-trigger，按压归 tag.css
  'tag-group': ['tag/root'],
  // 清空 / 关闭 / 移除按钮四类（契约见 check-clear-trigger）
  'cascader': ['clear-trigger', { part: 'item', feedback: 'surface' }, { part: 'search-item', feedback: 'surface' }],
  'tree-select': ['clear-trigger', { part: 'item', feedback: 'surface' }, { part: 'branch-control', feedback: 'surface' }],
  'combobox': ['clear-trigger', 'trigger', { part: 'item', feedback: 'surface' }],
  // 展开钮与确认钮跟着同组件的 clear-trigger 走同一副观感
  'date-picker': ['clear-trigger', 'trigger', 'confirm-trigger', { part: 'preset', feedback: 'surface' }, { part: 'time-item', feedback: 'surface' }],
  'date-range-picker': ['clear-trigger', 'trigger', { part: 'preset', feedback: 'surface' }],
  'time-picker': ['clear-trigger', 'trigger', { part: 'preset', feedback: 'surface' }, { part: 'item', feedback: 'surface' }],
  'time-range-picker': ['clear-trigger', 'trigger', { part: 'preset', feedback: 'surface' }, { part: 'item', feedback: 'surface' }],
  'text-field': ['clear-trigger'],
  'color-field': ['clear-trigger'],
  // 标签里的删除钮是 tag 的 close-trigger，按压归 tag.css
  'tags-input': ['clear-trigger'],
  'select': ['clear-trigger', { part: 'item', feedback: 'surface' }],
  'date-field': ['clear-trigger'],
  'time-field': ['clear-trigger'],
  'file-upload': ['clear-trigger', 'item-delete-trigger', 'trigger'],
  'signature-pad': ['clear-trigger'],
  'dialog': ['close-trigger'],
  'drawer': ['close-trigger', 'trigger'],
  'notification': ['item-close-trigger', 'item-action-trigger'],
  'popover': ['close-trigger'],
  'tour': ['close-trigger', 'prev-trigger', 'next-trigger', 'skip-trigger'],
  'toast': ['close-trigger', 'action-trigger'],
  'alert': ['close-trigger'],
  'floating-panel': ['close-trigger', 'trigger', 'window-state-trigger'],
  'popconfirm': ['confirm-trigger', 'cancel-trigger'],
  'image-viewer': [
    'close-trigger',
    'zoom-in-trigger',
    'zoom-out-trigger',
    'rotate-left-trigger',
    'rotate-right-trigger',
    'flip-horizontal-trigger',
    'flip-vertical-trigger',
    'reset-trigger',
    'prev-trigger',
    'next-trigger',
  ],
  'tag': ['close-trigger'],
  'field-array': ['item-delete-trigger', 'move-up-trigger', 'move-down-trigger', 'add-trigger'],
  // 表单里的编辑、提交与增减
  'editable': ['edit-trigger', 'submit-trigger', 'cancel-trigger'],
  'form': ['submit-trigger', 'reset-trigger', { part: 'error-summary-item', feedback: 'surface' }],
  'number-field': ['increment-trigger', 'decrement-trigger'],
  'password-input': ['visibility-trigger'],
  'transfer': ['to-target-trigger', 'to-source-trigger', { part: 'item', feedback: 'surface' }, { part: 'select-all-trigger', feedback: 'surface' }],
  // 勾选形的控件本体：方框、轨道、星星都是自己能被按下的一颗
  'checkbox': ['root'],
  // 组条目的命中区包含文字，按压缩放只落在其中的方框与全选伪元素上
  'checkbox-group': ['item', 'select-all-trigger'],
  'switch': ['root'],
  'rating': ['item'],
  // 预设色板的格子归内嵌的 color-swatch-picker，按压归那份皮
  'color-picker': ['eye-dropper-trigger'],
  'color-swatch-picker': ['item'],
  'pagination': ['prev-trigger', 'next-trigger', 'item', 'ellipsis-trigger'],
  // 两个日历的翻页钮、标题钮与日期格
  'calendar-picker': [
    'prev-year-trigger',
    'prev-trigger',
    'next-trigger',
    'next-year-trigger',
    'heading-year-trigger',
    'heading-month-trigger',
    'cell-trigger',
  ],
  'calendar-range-picker': [
    'prev-year-trigger',
    'prev-trigger',
    'next-trigger',
    'next-year-trigger',
    'heading-year-trigger',
    'heading-month-trigger',
    'cell-trigger',
  ],
  'timer': ['control'],
  // 展开与导航的触发钮
  'accordion': [{ part: 'trigger', feedback: 'surface' }],
  'collapsible': [{ part: 'trigger', feedback: 'surface' }],
  // 菜单栏的入口是一排菜单名里铺开的一段，按下只换面不缩放（§9.2）
  'menubar': [{ part: 'trigger', feedback: 'surface' }, { part: 'item', feedback: 'surface' }],
  // 横排导航的入口是铺开的一段，按下只换面不缩放（§9.2）；面板里的链接走 Collection Item 的 overlay 语境
  'navigation-menu': [{ part: 'trigger', feedback: 'surface' }, { part: 'link', feedback: 'surface' }],
  'tabs': ['trigger'],
  'toolbar': ['item'],
  // 表格里的勾选与展开把手（定尺方框，缩放并换底）；表体行走 Collection Item 的 page 语境只换面；
  // 排序把手撑满一格、表尾那颗「取下一页」接 Action Control row 档，都只换面不缩放（§9.2）
  'table': ['select-all-trigger', 'row-select-trigger', 'column-visibility-trigger', 'expand-trigger', { part: 'row', feedback: 'surface' }, { part: 'load-more-trigger', feedback: 'surface' }, { part: 'sort-trigger', feedback: 'surface' }],
  // 走马灯的翻页钮、播放钮与圆点
  'carousel': ['prev-trigger', 'next-trigger', 'autoplay-trigger', 'indicator'],
  'layout': ['sider-trigger'],
  // AI 族里点得动的部件
  'approval': ['approve-trigger', 'deny-trigger', { part: 'item', feedback: 'surface' }],
  'code-view': [{ part: 'fold-trigger', feedback: 'surface' }],
  'diff-view': [{ part: 'gap-trigger', feedback: 'surface' }],
  'log': ['scroll-to-end-trigger'],
  'message-feed': ['scroll-to-end-trigger'],
  'prompt-input': ['submit-trigger'],
  'question-flow': [{ part: 'item', feedback: 'surface' }, 'prev-trigger', 'next-trigger', 'skip-trigger', 'submit-trigger'],
  'reasoning': [{ part: 'trigger', feedback: 'surface' }],
  'tool-call': [{ part: 'trigger', feedback: 'surface' }],
  // 触屏上代替右键的长按：等待期的回执落在 data-pressing 上
  'context-menu': [{ part: 'trigger', attr: 'data-pressing' }, { part: 'item', feedback: 'surface' }],
}

/**
 * 点得动、但判定为不该有按压反馈的部件，值是理由。
 * 两侧都反查：部件名得在解剖里查得到（组件改名或部件退役即失败），
 * 皮肤里得查不到它的 :active 规则（有了就说明反馈已经补上，该挪进 PRESSABLE）。
 */
const NO_PRESS = {
  // 网格在拖着挑区间时才换手型：按下的回执落在格子上，网格自己不是可按的东西
  'calendar-range-picker:grid': '拖着挑区间时整张网格保持手型，按压回执由格子承担',
  // 扩大命中区的标签：点它等于点控件，回执落在控件本体上
  'checkbox:label': '标签是包住方框与文字的整行命中区，点它等于点方框，按下的回执落在方框本体上，标签自己不动',
  'switch:label': '标签是包住轨道与文字的整行命中区，点它等于点轨道，按下的回执落在轨道与滑块上，标签自己不动',
  'editable:label': '标题是「点它等于进编辑态」的扩大命中区，反馈该落在预览区与输入框本体上，标签自己不动',
  'slider:tick-label': '刻度文案是点它跳到该刻度的扩大命中区，回执落在拇指上，文案自己不动',
  // 字段外壳与壳里铺满宽度的值显示体：缩放会把回显文字一起挤
  'cascader:control': '字段外壳，描边底色与控件高度都长在这一层，缩放它会把盒里的回显文字与按钮一起挤',
  'cascader:trigger': '盒里撑满剩余宽度的透明区，承载回显与箭头，缩放它等于抖动整个字段的内容',
  'select:trigger': '盒里撑满剩余宽度的透明区，承载回显与箭头，缩放它等于抖动整个字段的内容',
  'tree-select:control': '字段外壳，描边底色与控件高度都长在这一层，缩放它会把盒里的回显文字与按钮一起挤',
  'tree-select:trigger': '盒里撑满剩余宽度的透明区，承载回显与箭头，缩放它等于抖动整个字段的内容',
  'color-picker:control': '字段外壳：按下整壳缩放会把里面的色块与值文本一起挤，回执该落在盒里的部件上',
  'color-picker:trigger': '不是按钮形，是撑满字段的内容区（色块加值串），缩放它等于缩放整条字段文本',
  'pagination:page-size-select': '原生 select 的字段外壳，按下即弹出系统下拉，缩放整壳会把里面的文字一起挤',
  // 拖拽轨道：按下即进入拖动，回执由拇指给出
  'slider:control': '控件是整条轨道，按下即进入拖动，回执由拇指的拖动放大给出；缩放整条轨道会把刻度点与刻度文案一起挤',
  'color-slider:control': '拖拽轨道，按下的回执由拇指的拖拽放大给出；缩放整条轨道会让渐变与拇指位置一起错开',
  // 大块区域：缩放会把里面的排版一起抖起来
  'image-viewer:trigger': '触发区是作者自己的一块内容（多为缩略图），皮肤对它零外观规则；缩放它会把作者的排版一起抖起来',
  'file-upload:dropzone': '大块投放区，按下回执由拖入态的描边与底色给出；缩放整块会把里面的说明文字一起抖起来',
  'truncate:root': '触发区就是被裁的那整段文本，缩放它会把整段排版一起抖起来',
}

/**
 * 真源 §4.1 归为 disclosure trigger / row 的部件：铺满一行、高度随内容，只换面不缩放。
 * 登记在这里又在 PRESSABLE 里写成缩放形态的，判 ⑤。
 */
const ROW_OR_DISCLOSURE = new Set([
  'accordion:trigger',
  'collapsible:trigger',
  'reasoning:trigger',
  'tool-call:trigger',
  'code-view:fold-trigger',
  'diff-view:gap-trigger',
  'approval:item',
  'question-flow:item',
  'tabs:trigger',
  'segmented:item',
  'navigation-menu:trigger',
  'menubar:trigger',
  'listbox:load-more-trigger',
  'table:load-more-trigger',
  'infinite-scroll:load-more-trigger',
])
/** 基础规则里的这几条说明部件是铺满一行的东西，不是定尺的独立动作控件。 */
const ROW_GEOMETRY = /(?:^|;)\s*(?:inline-size\s*:\s*100%|flex\s*:\s*1|display\s*:\s*block)\s*(?:;|$)/

const backlog = await openBacklog('press')
/** 各组件接上 press-channel 之前 data-pressed 判据的总豁免键。 */
const PRESSED_CHANNEL = '*:data-pressed'
/** 按压选择器：皮肤自己写的两种写法都认；家族配方只认后一种（⑧）。 */
const PRESS_SELECTOR = String.raw`(?::active|:is\(:active, \[data-pressed\]\))`
const FAMILY_PRESS = String.raw`:is\(:active, \[data-pressed\]\)`

const problems = [...backlog.problems]
const actionRecipe = await readFile(ACTION_RECIPE, 'utf8').catch(() => '')
const collectionRecipe = await readFile(COLLECTION_RECIPE, 'utf8').catch(() => '')

/** 存量放行：键在 press 段里就不报。 */
function report(key, message) {
  if (!backlog.excuse(key))
    problems.push(message)
}

for (const [name, parts] of Object.entries(PRESSABLE)) {
  let css
  try {
    css = await readFile(`${SKINS}/${name}.css`, 'utf8')
  }
  catch {
    problems.push(`${name}.css 读不到——组件改名了就把 PRESSABLE 里那条一起改`)
    continue
  }
  for (const part of parts) {
    const partName = typeof part === 'string' ? part : part.part
    if (typeof part === 'string')
      checkPart(name, part, css, await isActionControlPart(name, part) ? actionRecipe : '')
    else if (part.feedback === 'surface')
      checkSurfacePart(name, part.part, css, await surfaceFamilyCss(name, part.part))
    else
      checkHeldPart(name, part.part, part.attr, css)
    // ⑧ Space / Enter 与粗指针的按压由 Headless 投影 data-pressed，皮肤的 :active 才能与键盘按压一致
    const [scope, ownPart] = partName.includes('/') ? partName.split('/') : [name, partName]
    const body = await getterBody(scope, ownPart)
    if (body != null && !body.includes('\'data-pressed\''))
      report(PRESSED_CHANNEL, `${name} 的 ${partName} 登记为可按，connect 的 getter 却没投影 data-pressed——键盘与粗指针的按压回执要由 Headless 给`)
  }
}

// ⑧ 家族配方的按压选择器必须同时认 :active 与 [data-pressed]
for (const [label, recipe] of [['action-control.css', actionRecipe], ['collection-item.css', collectionRecipe]]) {
  for (const m of recipe.matchAll(/[^{}]*:active[^{]*\{/g)) {
    const selector = m[0].replace(/\s+/g, ' ').trim()
    if (!/:is\(:active, \[data-pressed\]\)/.test(selector))
      report(PRESSED_CHANNEL, `family/${label}  ${selector.slice(0, 70)}  按压选择器只认 :active——要写成 :is(:active, [data-pressed])`)
  }
}

/** Headless getter 明确投影 data-xh-action-control 时，按压反馈可以由 Family Recipe 提供。 */
async function isActionControlPart(name, part) {
  const source = await readFile(`${HEADLESS}/${name}/${name}.connect.ts`, 'utf8').catch(() => '')
  const getter = `get${part.split('-').map(value => value[0].toUpperCase() + value.slice(1)).join('')}Props`
  const start = source.search(new RegExp(`${getter}\\s*[:=]`))
  if (start < 0)
    return false
  const next = source.slice(start + getter.length).search(/\bget[A-Z][A-Za-z0-9]*Props\s*[:=]/)
  const body = source.slice(start, next < 0 ? source.length : start + getter.length + next)
  return body.includes('\'data-xh-action-control\':')
}

/** Headless getter投影 Collection Item 时，换面过渡可以由共享家族提供。 */
async function isCollectionItemPart(name, part) {
  const source = await readFile(`${HEADLESS}/${name}/${name}.connect.ts`, 'utf8').catch(() => '')
  const getter = `get${part.split('-').map(value => value[0].toUpperCase() + value.slice(1)).join('')}Props`
  const start = source.search(new RegExp(`${getter}\\s*[:=]`))
  if (start < 0)
    return false
  const next = source.slice(start + getter.length).search(/\bget[A-Z][A-Za-z0-9]*Props\s*[:=]/)
  const body = source.slice(start, next < 0 ? source.length : start + getter.length + next)
  return body.includes('\'data-xh-collection-item\':')
}

/**
 * 形态③的家族来源：投影 data-xh-collection-item 的读 Collection Item 配方；投影 data-xh-action-control
 * 且 profile 为 row / disclosure-trigger 的读 Action Control 配方；都没有就只认皮肤自己的 :active 换面。
 */
async function surfaceFamilyCss(name, part) {
  if (await isCollectionItemPart(name, part))
    return collectionRecipe
  if (await isActionControlPart(name, part)) {
    const body = await getterBody(name, part)
    if (/'data-xh-action-profile':\s*'(?:row|disclosure-trigger)'/.test(body ?? ''))
      return actionRecipe
  }
  return ''
}

for (const key of Object.keys(NO_PRESS)) {
  const [name, part] = key.split(':')
  let anatomy
  try {
    anatomy = await readFile(`${HEADLESS}/${name}/${name}.anatomy.ts`, 'utf8')
  }
  catch {
    problems.push(`${key} 的解剖文件读不到——组件改名了就把 NO_PRESS 里那条一起改`)
    continue
  }
  if (!anatomy.includes(`'${part}'`)) {
    problems.push(`${key} 在解剖里查不到这个部件——名单过期了`)
    continue
  }
  const css = await readFile(`${SKINS}/${name}.css`, 'utf8')
  if (new RegExp(`\\[data-part='${part}'\\][^{]*:active`).test(css))
    problems.push(`${key} 登记成不给按压反馈，皮肤里却已经有 :active 规则——把它挪进 PRESSABLE`)
}

// 全集反查：皮肤里带 cursor:pointer 的部件，两张表加起来必须盖住
const registered = new Set()
for (const [name, parts] of Object.entries(PRESSABLE)) {
  for (const part of parts)
    registered.add(`${name}:${typeof part === 'string' ? part : part.part}`)
}
for (const key of Object.keys(NO_PRESS))
  registered.add(key)

const clickable = await collectClickableParts()
for (const [key, line] of clickable) {
  if (registered.has(key))
    continue
  problems.push(
    `未登记：${key}（${key.split(':')[0]}.css:${line}）——新的可点部件必须定性：`
    + `该给按压反馈就登进 PRESSABLE，不该给就登进 NO_PRESS 并写一句理由`,
  )
}

/** 扫皮肤，收全带 cursor:pointer 的部件，返回 `组件:部件` → 规则起始行号。 */
async function collectClickableParts() {
  const found = new Map()
  const files = (await readdir(SKINS)).filter(file => file.endsWith('.css')).sort()
  for (const file of files) {
    const name = file.replace(/\.css$/, '')
    // 去块注释时把内容换成等长空格，保留换行，行号才对得上
    const css = (await readFile(join(SKINS, file), 'utf8'))
      .replace(/\/\*[\s\S]*?\*\//g, block => block.replace(/[^\n]/g, ' '))
    for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (!/cursor:\s*pointer/.test(rule[2]))
        continue
      // 选择器可能是逗号分组，每条分支只收主体那个复合体
      for (const branch of rule[1].split(',')) {
        const compounds = splitCompounds(branch.trim().replace(/\s+/g, ' '))
        const subject = compounds[compounds.length - 1] ?? ''
        const part = /\[data-part='([a-z0-9-]+)'\]/.exec(subject)?.[1]
        if (!part)
          continue
        const scope = /\[data-scope='([a-z0-9-]+)'\]/.exec(subject)?.[1] ?? name
        const key = scope === name ? `${name}:${part}` : `${name}:${scope}/${part}`
        if (!found.has(key))
          found.set(key, css.slice(0, rule.index).split('\n').length)
      }
    }
  }
  return [...found].sort(([a], [b]) => a.localeCompare(b))
}

/** 括号与方括号之外的空格与组合符才分隔复合体。 */
function splitCompounds(branch) {
  const out = []
  let depth = 0
  let current = ''
  for (const ch of branch) {
    if (ch === '[' || ch === '(')
      depth++
    else if (ch === ']' || ch === ')')
      depth--
    if (depth === 0 && (ch === ' ' || ch === '>' || ch === '+' || ch === '~')) {
      if (current)
        out.push(current)
      current = ''
      continue
    }
    current += ch
  }
  if (current)
    out.push(current)
  return out
}

/** 登记名里的部件：本组件的写部件名，别家的写 scope/部件，选择器按后者要带上那个 scope。 */
function partSelector(part) {
  const slash = part.indexOf('/')
  return slash < 0
    ? `\\[data-part='${part}'\\]`
    : `\\[data-scope='${part.slice(0, slash)}'\\]\\[data-part='${part.slice(slash + 1)}'\\]`
}

function checkPart(name, part, css, familyCss = '') {
  const key = `${name}:${part}`
  // ⑤ 几何判据：铺满一行的东西不该缩放整条
  if (ROW_OR_DISCLOSURE.has(key)) {
    report(key, `${name} 的 ${part} 按 §4.1 是 disclosure trigger / row，登记成缩放形态——改登记 { part: '${part}', feedback: 'surface' }，皮肤只换面`)
  }
  else {
    const base = css.match(new RegExp(`(?:^|[,}])\\s*\\[data-scope='${name}'\\]${partSelector(part)}\\s*\\{([^}]*)\\}`, 'm'))
    if (base && ROW_GEOMETRY.test(base[1]))
      report(key, `${name} 的 ${part} 基础规则含 inline-size: 100% / flex: 1 / display: block，是铺满一行的东西，登记成缩放形态——改登记 { part: '${part}', feedback: 'surface' }`)
  }
  // 按压规则要落在该部件上，且缩放量走令牌
  const active = new RegExp(`${partSelector(part)}[^{]*${PRESS_SELECTOR}(?::not\\([^)]*\\))?(?:::[a-z-]+)?\\s*\\{([^}]*)\\}`)
  const match = css.match(active) ?? familyCss.match(new RegExp(`\\[data-xh-action-control\\][^{]*${FAMILY_PRESS}\\s*\\{([^}]*)\\}`))
  if (!match) {
    problems.push(`${name} 的 ${part} 没有 :active 规则——按下去到松手之间没有任何变化`)
    return
  }
  if (!match[1].includes('--xh-motion-scale-press')) {
    problems.push(
      `${name} 的 ${part} 按下缩放没走 --xh-motion-scale-press——`
      + `写死的缩放量在减弱动效档下不会归 1`,
    )
  }
  // ⑥ 缩放必换底：按下那一帧要同时进入 active 面
  const surface = match[1].match(/(?:^|;)\s*(?:background(?:-color)?|--xh-_[\w-]*(?:bg|surface)[\w-]*)\s*:\s*([^;]+)/)
  if (!surface || /^(?:none|transparent)$/.test(surface[1].trim()))
    report(key, `${name} 的 ${part} 按下只缩放不换底——:active 块要同时把 background 换到 active 面（§9.1）`)
  // 缩放要能过渡，否则是硬切
  if (!/transition:[^;]*\bscale\b/.test(css) && !/transition:[^;]*\bscale\b/.test(familyCss)) {
    problems.push(`${name} 的 ${part} 没把 scale 写进 transition——按下与松手都是硬切`)
  }
}

/** 列表行用换面表达按下，几何保持不变；只有显式登记的部件走这条合同。 */
function checkSurfacePart(name, part, css, familyCss = '') {
  const active = new RegExp(`${partSelector(part)}[^{]*${PRESS_SELECTOR}(?::not\\([^)]*\\))?\\s*\\{([^}]*)\\}`)
  const key = `${name}:${part}`
  // 投影了家族标记的部件（familyCss 非空）可以由家族配方的 pressed 面给出换底：
  // Collection Item 读 [data-xh-collection-item] 的按压块；Action Control 的 row / disclosure-trigger 档
  // 读 [data-xh-action-control] 的通用按压块（不取两档专属那条——它只归零 scale，不换底）
  const isAction = familyCss !== '' && familyCss === actionRecipe
  const marker = isAction ? String.raw`\[data-xh-action-control\]` : String.raw`\[data-xh-collection-item\]`
  const familyPress = new RegExp(`${marker}(?:(?!:is\\(\\[data-xh-action-profile)[^{])*${FAMILY_PRESS}\\s*\\{([^}]*)\\}`)
  const match = css.match(active) ?? (familyCss ? familyCss.match(familyPress) : null)
  const surface = match?.[1].match(/(?:^|;)\s*(?:background(?:-color)?|--xh-_collection-bg)\s*:\s*([^;]+)/)
  if (!surface || /^(?:none|transparent)$/.test(surface[1].trim()))
    report(key, `${name} 的 ${part} 没有明确的 :active 换面——集合行不允许零反馈（§9.2）`)
  if (match && /(?:^|;)\s*(?:scale|translate|transform)\s*:/.test(match[1])) {
    // Action Control 通用按压块带 0.97 缩放，row / disclosure-trigger 两档靠专属按压块 scale: none 归零；
    // 皮肤自己写的按压块则一律不许动几何
    const rowPress = new RegExp(String.raw`\[data-xh-action-control\]:is\(\[data-xh-action-profile='row'\], \[data-xh-action-profile='disclosure-trigger'\]\)[^{]*${FAMILY_PRESS}\s*\{[^}]*(?:^|;|\s)scale\s*:\s*none\s*;`)
    if (!(isAction && match.input === familyCss && rowPress.test(familyCss)))
      report(key, `${name} 的 ${part} 登记为换面反馈，却在按下时改变几何`)
  }
  const rules = [...css.matchAll(new RegExp(`${partSelector(part)}[^{]*\\{([^}]*)\\}`, 'g'))]
  const familyTransition = new RegExp(`${marker}\\s*\\{[\\s\\S]*?transition:[^;]*\\bbackground(?:-color)?\\b`).test(familyCss)
  if (!rules.some(rule => /transition:[^;]*\bbackground(?:-color)?\b/.test(rule[1])) && !familyTransition)
    report(key, `${name} 的 ${part} 没把换面写进本部件的 transition`)
}

/** 形态②：反馈规则挂在状态属性上，且换的是底色。 */
function checkHeldPart(name, part, attr, css) {
  const held = new RegExp(`\\[data-part='${part}'\\](?:\\[[^\\]]+\\])*\\[${attr}\\][^{]*\\{([^}]*)\\}`)
  const match = css.match(held)
  if (!match) {
    problems.push(`${name} 的 ${part} 没有 [${attr}] 规则——按住等待的那段时间里没有任何变化，用户会以为没按上`)
    return
  }
  if (!/(?:^|;|\s)background\s*:/.test(match[1])) {
    problems.push(`${name} 的 ${part} 的 [${attr}] 规则没换底色——长按的回执只能落在底色上`)
    return
  }
  // 过渡要落在这个部件自己的规则里。整份皮肤里搜一遍是不够的：同一份皮肤的条目、
  // 触发钮各有各的 transition，别人写了不等于这个部件写了
  const rules = [...css.matchAll(new RegExp(`\\[data-part='${part}'\\][^{]*\\{([^}]*)\\}`, 'g'))]
  if (!rules.some(rule => /transition:[^;]*\bbackground\b/.test(rule[1]))) {
    problems.push(`${name} 的 ${part} 没把 background 写进自己的 transition——按下与松手都是硬切`)
  }
}

problems.push(...backlog.stale())

if (problems.length) {
  console.error('[check-press-feedback] ✗ 按压反馈没接齐：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

const pressable = Object.values(PRESSABLE).flat()
const held = pressable.filter(part => typeof part !== 'string' && 'attr' in part).length
const surfaces = pressable.filter(part => typeof part !== 'string' && part.feedback === 'surface').length
console.log(
  `[check-press-feedback] 通过：皮肤里 ${clickable.length} 个可点部件全部定性过`
  + `（登记 ${registered.size} 个）——${pressable.length} 个按下去有回应`
  + `（长按等待 ${held} 个比底色，即时换面 ${surfaces} 个保持几何，其余缩放走令牌）`
  + `，${Object.keys(NO_PRESS).length} 个判定为不给按压反馈；backlog 待办 ${backlog.pending} 条，无过期豁免`,
)
