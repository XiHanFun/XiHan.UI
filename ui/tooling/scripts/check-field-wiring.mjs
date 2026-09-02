#!/usr/bin/env node
// 门禁：单一可聚焦控件的薄封装，必须把字段的说明与校验状态接到真控件上。
//
// XhFieldControl 把接线属性合到它唯一的子节点上；子节点是薄封装时合的是封装根，
// 而封装根往往只是个 div。名字不受影响（控件属性里带 aria-labelledby，div 上也生效），
// 但 aria-describedby 与 aria-invalid 落在 div 上就等于没落：焦点进的是里面那个
// input / button，读屏只念焦点所在节点的描述，说明与错误文本因此永远播报不出来——
// 而这种失效不报任何错，text-field 的文档里推荐的正是「外面套表单字段拿标签与错误文本」。
//
// 判据：带 invalid 轴、且解剖里有单一可聚焦控件的组件，它的 Vue 封装必须调 useFieldStateWiring()。
// 分组型（radio-group / checkbox-group / segmented）与分段型（date-field / pin-input 之类）
// 不在此列——它们的根本身有分组角色或多个焦点目标，属性落在根上读屏进组时就会念出来。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const HEADLESS = 'packages/engine/headless/src'
const VUE = 'packages/adapters/vue/src/components'

/** 不必接线的，各带理由。 */
const NOT_SINGLE_CONTROL = {
  'field': '它自己就是字段',
  'fieldset': '同上，分组容器',
  'checkbox-group': '分组：根是 role=group，读屏进组即念说明',
  'radio-group': '分组：根是 role=radiogroup',
  'segmented': '分组：根是 role=radiogroup',
  'date-field': '分段输入：焦点在各段上，没有单一可聚焦控件',
  'time-field': '同 date-field',
  'pin-input': '分段输入：每格一个 input',
  'slider': '图形控件：焦点在各个拇指上',
  'signature-pad': '图形控件：画布自己承担名字与描述',
  'file-upload': '根是投放区，触发钮只是其中一个入口',
  'editable': '预览态与编辑态是两个不同的焦点目标',
}

const problems = []
let wired = 0
let named = 0
const exemptSeen = new Set()

for (const entry of await readdir(HEADLESS, { withFileTypes: true })) {
  if (!entry.isDirectory())
    continue
  const name = entry.name
  let types
  try {
    types = await readFile(join(HEADLESS, name, `${name}.types.ts`), 'utf8')
  }
  catch {
    continue
  }
  if (!/invalid\?:\s*boolean/.test(types))
    continue

  if (name in NOT_SINGLE_CONTROL) {
    exemptSeen.add(name)
    continue
  }

  let vue
  try {
    vue = await readFile(join(VUE, name, `${name}.ts`), 'utf8')
  }
  catch {
    problems.push(`${name}：带 invalid 轴却找不到 Vue 封装——要么补封装，要么登记进 NOT_SINGLE_CONTROL`)
    continue
  }
  if (vue.includes('useFieldStateWiring('))
    wired += 1
  else
    problems.push(`${name}：带 invalid 轴的单一控件封装没有调 useFieldStateWiring()——套进表单字段后，说明与错误文本读屏念不出来`)

  // 名字是另一半：控件自带的 aria-labelledby 指的是它自己那个没渲染的 label 部件，
  // 不把字段的标签并进去，焦点所在的控件一个名字都没有
  if (vue.includes('useFieldLabelWiring('))
    named += 1
  else
    problems.push(`${name}：带 invalid 轴的单一控件封装没有调 useFieldLabelWiring()——套进表单字段后，字段的标签念不到焦点所在的控件上`)
}

for (const name of Object.keys(NOT_SINGLE_CONTROL)) {
  if (!exemptSeen.has(name))
    problems.push(`NOT_SINGLE_CONTROL 里的 ${name} 已经没有 invalid 轴了——名单过期`)
}

if (problems.length) {
  console.error('[check-field-wiring] ✗ 字段接线没落到真控件上：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  console.error('\n在那个真正可聚焦的部件组件里取两份接线：const fieldWiring = useFieldStateWiring() 合进渲染属性，\nconst fieldLabel = useFieldLabelWiring() 把整份属性包起来。')
  process.exit(1)
}

console.log(`[check-field-wiring] 通过：${wired} 个单一控件封装把字段状态、${named} 个把字段标签接到了真控件上（分组 / 分段 / 图形控件 ${exemptSeen.size} 个不在此列）`)
