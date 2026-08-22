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
// 要求逐条登记，免得新组件默认逃过。
import { readFile } from 'node:fs/promises'

const SKINS = 'packages/design/styles/css'

/** 该有按压反馈的控件，连同它的部件名（一个组件可以登记多个部件）。 */
const PRESSABLE = {
  'segmented': ['item'],
  // 清空 / 关闭 / 移除按钮四类（契约见 check-clear-trigger）
  'cascader': ['clear-trigger'],
  'tree-select': ['clear-trigger'],
  'combobox': ['clear-trigger'],
  'date-picker': ['clear-trigger'],
  'time-picker': ['clear-trigger'],
  'text-field': ['clear-trigger'],
  'tags-input': ['clear-trigger', 'item-delete-trigger'],
  'select': ['clear-trigger', 'tag-remove'],
  'popselect': ['clear-trigger'],
  'date-field': ['clear-trigger'],
  'time-field': ['clear-trigger'],
  'file-upload': ['clear-trigger', 'item-delete-trigger'],
  'signature-pad': ['clear-trigger'],
  'dialog': ['close-trigger'],
  'drawer': ['close-trigger'],
  'popover': ['close-trigger'],
  'tour': ['close-trigger'],
  'toast': ['close-trigger'],
  'alert': ['close-trigger'],
  'floating-panel': ['close-trigger'],
  'image-viewer': ['close-trigger'],
  'tag': ['close-trigger'],
  'dynamic-input': ['remove-trigger'],
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
  for (const part of parts)
    checkPart(name, part, css)
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

if (problems.length) {
  console.error('[check-press-feedback] ✗ 按压反馈没接齐：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(`[check-press-feedback] 通过：${Object.values(PRESSABLE).flat().length} 个部件按下去都有回应，缩放量都走令牌`)
