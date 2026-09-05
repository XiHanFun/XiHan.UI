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
//
// 两种形态：
// ① 即时按压（多数）：反馈落在 :active 上，缩放量走令牌。
// ② 长按等待（登记成 { part, attr }）：要按满一段时间才生效的操作，反馈由连接层打的
//    状态属性驱动。这一支不能靠 :active——手指按住不动时 :active 会被滚动接管等原因
//    提前撤掉，而等待期恰恰是最需要回执的那几百毫秒；也不比缩放，因为这类触发区往往是
//    作者的整块内容，缩放它会把作者自己的排版一起抖起来。改比底色。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const SKINS = 'packages/design/styles/css'
const HEADLESS = 'packages/engine/headless/src'

/**
 * 该有按压反馈的控件，连同它的部件名（一个组件可以登记多个部件）。
 * 字符串条目按形态①查；`{ part, attr }` 条目按形态②查。
 */
const PRESSABLE = {
  // 按钮形的控件本体：整颗就是点击目标
  'button': ['root'],
  'download-trigger': ['root'],
  'toggle': ['root'],
  'toggle-group': ['item'],
  'segmented': ['item'],
  'back-top': ['trigger'],
  'float-button': ['trigger'],
  'clipboard': ['copy-trigger'],
  // 清空 / 关闭 / 移除按钮四类（契约见 check-clear-trigger）
  'cascader': ['clear-trigger'],
  'tree-select': ['clear-trigger'],
  'combobox': ['clear-trigger', 'trigger'],
  // 展开钮与确认钮跟着同组件的 clear-trigger 走同一副观感
  'date-picker': ['clear-trigger', 'trigger', 'confirm-trigger'],
  'time-picker': ['clear-trigger', 'trigger'],
  'text-field': ['clear-trigger'],
  'tags-input': ['clear-trigger', 'item-delete-trigger'],
  'select': ['clear-trigger', 'item-delete-trigger'],
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
  'form': ['submit-trigger', 'reset-trigger'],
  'number-field': ['increment-trigger', 'decrement-trigger'],
  'password-input': ['visibility-trigger'],
  'transfer': ['to-target-trigger', 'to-source-trigger'],
  // 勾选形的控件本体：方框、轨道、星星都是自己能被按下的一颗
  'checkbox': ['root'],
  'switch': ['root'],
  'rating': ['item'],
  // 色板格子的底色就是它要展示的那个颜色，换底会盖掉展示物，按压回执只能落在缩放上
  'color-picker': ['eye-dropper-trigger', 'swatch-item'],
  'pagination': ['prev-trigger', 'next-trigger', 'item', 'ellipsis-trigger'],
  // 日历的翻页钮、标题钮与日期格
  'calendar': [
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
  'accordion': ['trigger'],
  'collapsible': ['trigger'],
  'menubar': ['trigger'],
  'navigation-menu': ['trigger'],
  'tabs': ['trigger'],
  // 表格里的勾选与展开把手
  'table': ['select-all-trigger', 'row-select-trigger', 'expand-trigger'],
  // 走马灯的翻页钮、播放钮与圆点
  'carousel': ['prev-trigger', 'next-trigger', 'autoplay-trigger', 'indicator'],
  'layout': ['sider-trigger'],
  // AI 族里点得动的部件
  'approval': ['approve-trigger', 'deny-trigger', 'item'],
  'code-view': ['fold-trigger'],
  'diff-view': ['gap-trigger'],
  'log': ['scroll-to-end-trigger'],
  'message-feed': ['scroll-to-end-trigger'],
  'prompt-input': ['submit-trigger'],
  'question-flow': ['item', 'prev-trigger', 'next-trigger', 'skip-trigger', 'submit-trigger'],
  'reasoning': ['trigger'],
  'tool-call': ['trigger'],
  // 触屏上代替右键的长按：等待期的回执落在 data-pressing 上
  'context-menu': [{ part: 'trigger', attr: 'data-pressing' }],
}

/**
 * 点得动、但判定为不该有按压反馈的部件，值是理由。
 * 两侧都反查：部件名得在解剖里查得到（组件改名或部件退役即失败），
 * 皮肤里得查不到它的 :active 规则（有了就说明反馈已经补上，该挪进 PRESSABLE）。
 */
const NO_PRESS = {
  // 列表族条目：一行文字，按下的回执走高亮档（悬停中性灰、展开路径品牌淡底）
  'menu:item': '列表行的按下回执走高亮档，缩放会抖动整列',
  'menubar:item': '列表行的按下回执走高亮档，缩放会抖动整列',
  'context-menu:item': '列表行的按下回执走高亮档，缩放会抖动整列',
  'listbox:item': '列表行的按下回执走高亮档，缩放会抖动整列',
  'select:item': '列表行的按下回执走高亮档，缩放会抖动整列',
  'combobox:item': '列表行的按下回执走高亮档，缩放会抖动整列',
  'cascader:item': '列表行的按下回执走高亮档，缩放会抖动整列',
  'cascader:search-item': '列表行的按下回执走高亮档，缩放会抖动整列',
  'mention:item': '列表行的按下回执走高亮档，缩放会抖动整列',
  'transfer:item': '列表行的按下回执走高亮档，缩放会抖动整列',
  'tree:item': '列表行的按下回执走高亮档，缩放会抖动整列',
  'tree:branch-control': '分支那一行与叶子行共用同一套行盒，列表行的按下回执走高亮档，缩放会抖动整列',
  'tree-select:item': '列表行的按下回执走高亮档，缩放会抖动整列',
  'tree-select:branch-control': '分支行与叶子行共用同一套行盒，按下回执走高亮档，缩放会抖动整列',
  'json-viewer:branch-control': '分支那一行是整行点击目标，列表行的按下回执走高亮档，缩放会抖动整列',
  'date-picker:preset': '列表行的按下回执走高亮档，缩放会抖动整列',
  'date-picker:time-item': '列表行的按下回执走高亮档，缩放会抖动整列',
  'time-picker:preset': '列表行的按下回执走高亮档，缩放会抖动整列',
  'time-picker:item': '列表行的按下回执走高亮档，缩放会抖动整列',
  'side-nav:link': '列表行的按下回执走高亮档，缩放会抖动整列',
  'side-nav:branch-trigger': '列表行的按下回执走高亮档，缩放会抖动整列',
  'form:error-summary-item': '错误摘要里的每一条是一行文字链接，回执走文字色，缩放一行文字会把整块摘要抖起来',
  'steps:trigger': '步骤条目是序号圆点加标题说明的整块内容，按下回执走高亮底色，缩放会把多行文字一起抖起来',
  // 扩大命中区的标签：点它等于点控件，回执落在控件本体上
  'checkbox:label': '标签是包住方框与文字的整行命中区，点它等于点方框，按下的回执落在方框本体上，标签自己不动',
  'switch:label': '标签是包住轨道与文字的整行命中区，点它等于点轨道，按下的回执落在轨道与滑块上，标签自己不动',
  'editable:label': '标题是「点它等于进编辑态」的扩大命中区，反馈该落在预览区与输入框本体上，标签自己不动',
  'slider:tick-label': '刻度文案是点它跳到该刻度的扩大命中区，回执落在拇指上，文案自己不动',
  // 方框圆圈连着文字的整行条目：回执落在方框与圆点的填色上
  'checkbox-group:item': '条目是「方框 + 文字」的整行命中区，缩放整行会把文字一起抖起来，按下的回执落在方框的填色上',
  'checkbox-group:select-all-trigger': '全选格与条目同形，也是「方框 + 文字」的整行，缩放会带着整列条目一起抖',
  'radio-group:item': '条目是「圆圈 + 文字」的整行命中区，缩放整行会把文字一起抖起来，按下的回执落在圆圈的圆点上',
  'transfer:select-all-trigger': '勾选方框与标签连成的一行，缩放会带着标签文字一起抖，回执落在方框的勾选态上',
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
  'color-picker:channel-slider': '拖拽轨道，按下的回执由拇指的拖拽放大给出；缩放整条轨道会让渐变与拇指位置一起错开',
  // 大块区域：缩放会把里面的排版一起抖起来
  'image-viewer:trigger': '触发区是作者自己的一块内容（多为缩略图），皮肤对它零外观规则；缩放它会把作者的排版一起抖起来',
  'image-viewer:toolbar': '工具条本身是容器，cursor:pointer 落在它里面的按钮上（那几颗已登记有按压反馈），缩放整条会把所有按钮一起抖起来',
  'file-upload:dropzone': '大块投放区，按下回执由拖入态的描边与底色给出；缩放整块会把里面的说明文字一起抖起来',
  'truncate:root': '触发区就是被裁的那整段文本，缩放它会把整段排版一起抖起来',
  'table:sort-trigger': '排序把手 flex:1 撑满整块列标题，缩放会把表头文字连同列宽基线一起抖起来；按下回执落在排序指示字形与列标题底色上',
}

const problems = []

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
    if (typeof part === 'string')
      checkPart(name, part, css)
    else
      checkHeldPart(name, part.part, part.attr, css)
  }
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
      // 选择器可能是逗号分组，一条规则里列的部件全收
      const parts = new Set([...rule[1].matchAll(/\[data-part='([a-z0-9-]+)'\]/g)].map(m => m[1]))
      for (const part of parts) {
        const key = `${name}:${part}`
        if (!found.has(key))
          found.set(key, css.slice(0, rule.index).split('\n').length)
      }
    }
  }
  return [...found].sort(([a], [b]) => a.localeCompare(b))
}

function checkPart(name, part, css) {
  // :active 规则要落在该部件上，且缩放量走令牌
  const active = new RegExp(`\\[data-part='${part}'\\][^{]*:active(?::not\\([^)]*\\))?\\s*\\{([^}]*)\\}`)
  const match = css.match(active)
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
  // 缩放要能过渡，否则是硬切
  if (!/transition:[^;]*\bscale\b/.test(css)) {
    problems.push(`${name} 的 ${part} 没把 scale 写进 transition——按下与松手都是硬切`)
  }
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

if (problems.length) {
  console.error('[check-press-feedback] ✗ 按压反馈没接齐：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

const pressable = Object.values(PRESSABLE).flat()
const held = pressable.filter(part => typeof part !== 'string').length
console.log(
  `[check-press-feedback] 通过：皮肤里 ${clickable.length} 个可点部件全部定性过`
  + `（登记 ${registered.size} 个）——${pressable.length} 个按下去有回应`
  + `（其中长按等待 ${held} 个比底色，其余比缩放且缩放量都走令牌）`
  + `，${Object.keys(NO_PRESS).length} 个判定为不给按压反馈`,
)
