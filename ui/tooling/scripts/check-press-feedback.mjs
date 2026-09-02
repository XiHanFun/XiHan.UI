#!/usr/bin/env node
// 门禁：点得动的东西，按下去要有回应。
//
// 悬停变色是「指哪一个」，按下缩放是「点到了」——两件事。只做悬停的控件，
// 用户按下去到松手之间毫无变化，触屏上尤其明显：手指盖住了元素，抬起才知道点没点中。
//
// 判据只管「有没有」，不管缩多少：缩放量走 --xh-motion-scale-press，
// 减弱动效档把它归 1，所以这条不与无障碍冲突。
//
// 名单制而非全量扫：不是每个组件都该有按压反馈——输入框、只读展示件按下去不该动。
// 要求逐条登记，免得新组件默认逃过。判定为不该有的，登进 NO_PRESS 留一句理由，
// 那张表两侧都反查，登记过期或者反馈后来补上了都会判失败。
//
// 两种形态：
// ① 即时按压（多数）：反馈落在 :active 上，缩放量走令牌。
// ② 长按等待（登记成 { part, attr }）：要按满一段时间才生效的操作，反馈由连接层打的
//    状态属性驱动。这一支不能靠 :active——手指按住不动时 :active 会被滚动接管等原因
//    提前撤掉，而等待期恰恰是最需要回执的那几百毫秒；也不比缩放，因为这类触发区往往是
//    作者的整块内容，缩放它会把作者自己的排版一起抖起来。改比底色。
import { readFile } from 'node:fs/promises'

const SKINS = 'packages/design/styles/css'
const HEADLESS = 'packages/engine/headless/src'

/**
 * 该有按压反馈的控件，连同它的部件名（一个组件可以登记多个部件）。
 * 字符串条目按形态①查；`{ part, attr }` 条目按形态②查。
 */
const PRESSABLE = {
  'segmented': ['item'],
  // 清空 / 关闭 / 移除按钮四类（契约见 check-clear-trigger）
  'cascader': ['clear-trigger'],
  'tree-select': ['clear-trigger'],
  'combobox': ['clear-trigger'],
  // 展开钮与确认钮跟着同组件的 clear-trigger 走同一副观感
  'date-picker': ['clear-trigger', 'trigger', 'confirm-trigger'],
  'time-picker': ['clear-trigger'],
  'text-field': ['clear-trigger'],
  'tags-input': ['clear-trigger', 'item-delete-trigger'],
  'select': ['clear-trigger', 'item-delete-trigger'],
  'popselect': ['clear-trigger'],
  'date-field': ['clear-trigger'],
  'time-field': ['clear-trigger'],
  'file-upload': ['clear-trigger', 'item-delete-trigger'],
  'signature-pad': ['clear-trigger'],
  'dialog': ['close-trigger'],
  'drawer': ['close-trigger'],
  'notification': ['item-close-trigger'],
  'popover': ['close-trigger'],
  'tour': ['close-trigger'],
  'toast': ['close-trigger'],
  'alert': ['close-trigger'],
  'floating-panel': ['close-trigger'],
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
  'dynamic-input': ['item-delete-trigger'],
  // 色板格子的底色就是它要展示的那个颜色，换底会盖掉展示物，按压回执只能落在缩放上
  'color-picker': ['eye-dropper-trigger', 'swatch-item'],
  'pagination': ['prev-trigger', 'next-trigger', 'item', 'ellipsis'],
  // AI 族里点得动的部件
  'approval': ['approve-trigger', 'deny-trigger'],
  'code-view': ['fold-trigger'],
  'diff-view': ['gap-trigger'],
  'message-feed': ['scroll-button'],
  'prompt-input': ['submit-trigger'],
  'question-flow': ['option', 'prev-trigger', 'next-trigger', 'skip-trigger', 'submit-trigger'],
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
  'image-viewer:trigger': '触发区是作者自己的一块内容（多为缩略图），皮肤对它零外观规则；缩放它会把作者的排版一起抖起来',
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

const held = Object.values(PRESSABLE).flat().filter(part => typeof part !== 'string').length
console.log(
  `[check-press-feedback] 通过：${Object.values(PRESSABLE).flat().length} 个部件按下去都有回应`
  + `（其中长按等待 ${held} 个比底色，其余比缩放且缩放量都走令牌）`
  + `，另有 ${Object.keys(NO_PRESS).length} 个判定为不给按压反馈`,
)
