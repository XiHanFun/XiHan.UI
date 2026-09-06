#!/usr/bin/env node
// 门禁：单一可聚焦控件的薄封装，必须把字段的说明与校验状态接到真控件上。
//
// XhFieldControl 把接线属性合到它唯一的子节点上；子节点是薄封装时合的是封装根，
// 而封装根往往只是个 div。名字不受影响（控件属性里带 aria-labelledby，div 上也生效），
// 但 aria-describedby 与 aria-invalid 落在 div 上就等于没落：焦点进的是里面那个
// input / button，读屏只念焦点所在节点的描述，说明与错误文本因此永远播报不出来——
// 而这种失效不报任何错，text-field 的文档里推荐的正是「外面套表单字段拿标签与错误文本」。
//
// 判据：带 invalid 轴、且解剖里有单一可聚焦控件的组件，它的封装必须调 useFieldStateWiring()
// 与 useFieldLabelWiring()。分组型（radio-group / checkbox-group / segmented）与分段型
// （date-field / pin-input 之类）不在此列——它们的根本身有分组角色或多个焦点目标，
// 属性落在根上读屏进组时就会念出来。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { ADAPTERS, reactCovered, reactProgress } from './lib/adapters.mjs'

const HEADLESS = 'packages/engine/headless/src'

/**
 * 逐个适配器：封装文件的位置，与它里面必须出现的那两句调用。
 * React 一侧只核 react-coverage.json 里已铺到的组件，没铺到的跳过。
 */
const WRAPPERS = [
  { key: 'vue', file: name => join(ADAPTERS.vue.components, name, `${name}.ts`), coveredOnly: false },
  { key: 'react', file: name => join(ADAPTERS.react.components, name, `${name}.tsx`), coveredOnly: true },
]

/**
 * Web Components 不在此列，收尾行照原样打出来，免得读输出的人以为它也被核过。
 *
 * 这张门禁防的是「属性合到薄封装的根、而根不是真控件」这一层。`<xh-field>` 是 Light-DOM
 * 行为宿主：id 与 aria-* 由它直接打在作者标出的 control 角色节点上，没有封装根这一层，
 * 也就没有可漏的接线口子。
 */
const WC_NOT_APPLICABLE = `${ADAPTERS.wc.label} 不在其列：<xh-field> 把 id 与 aria-* 直接打在作者标出的 control 节点上，没有薄封装这一层`

/** 不必接线的，各带理由。 */
const NOT_SINGLE_CONTROL = {
  'field': '它自己就是字段',
  'fieldset': '同上，分组容器',
  'checkbox-group': '分组：根是 role=group，读屏进组即念说明',
  'listbox': '分组：content 是 role=listbox，焦点在各条目上',
  'transfer': '分组：两侧各一个 role=listbox，没有单一可聚焦控件',
  'radio-group': '分组：根是 role=radiogroup',
  'segmented': '分组：根是 role=radiogroup',
  'date-field': '分段输入：焦点在各段上，没有单一可聚焦控件',
  'time-field': '同 date-field',
  'pin-input': '分段输入：每格一个 input',
  'slider': '图形控件：焦点在各个拇指上',
  'signature-pad': '图形控件：画布自己承担名字与描述',
  'file-upload': '根是投放区，触发钮只是其中一个入口',
  'editable': '预览态与编辑态是两个不同的焦点目标',
  'field-array': '一列行，每行里的控件各自是焦点目标；这一层没有单一可聚焦控件',
}

const covered = await reactCovered()
const problems = []
/** 逐适配器计数：接上字段状态的、接上字段标签的。 */
const wired = { vue: 0, react: 0 }
const named = { vue: 0, react: 0 }
const exemptSeen = new Set()
/** 有 types 文件的目录才算一个组件，config / shared / spec 这类不算。 */
let components = 0

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
  components += 1
  if (!/invalid\?:\s*boolean/.test(types))
    continue

  if (name in NOT_SINGLE_CONTROL) {
    exemptSeen.add(name)
    continue
  }

  for (const { key, file, coveredOnly } of WRAPPERS) {
    const label = ADAPTERS[key].label
    if (coveredOnly && !covered.has(name))
      continue

    const path = file(name)
    let src
    try {
      src = await readFile(path, 'utf8')
    }
    catch {
      problems.push(`${name}：带 invalid 轴却找不到 ${label} 封装 ${path}——要么补封装，要么登记进 NOT_SINGLE_CONTROL`)
      continue
    }

    if (src.includes('useFieldStateWiring('))
      wired[key] += 1
    else
      problems.push(`${name}：${label} 的单一控件封装没有调 useFieldStateWiring()——套进表单字段后，说明与错误文本读屏念不出来`)

    // 名字是另一半：控件自带的 aria-labelledby 指的是它自己那个没渲染的 label 部件，
    // 不把字段的标签并进去，焦点所在的控件一个名字都没有
    if (src.includes('useFieldLabelWiring('))
      named[key] += 1
    else
      problems.push(`${name}：${label} 的单一控件封装没有调 useFieldLabelWiring()——套进表单字段后，字段的标签念不到焦点所在的控件上`)
  }
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

console.log(
  `[check-field-wiring] 通过：${ADAPTERS.vue.label} ${wired.vue} 个、${ADAPTERS.react.label} ${wired.react} 个单一控件封装把字段状态接到了真控件上，`
  + `字段标签同样 ${ADAPTERS.vue.label} ${named.vue} 个 / ${ADAPTERS.react.label} ${named.react} 个`
  + `（分组 / 分段 / 图形控件 ${exemptSeen.size} 个不在此列；${reactProgress(covered, components)}，未铺到的跳过；${WC_NOT_APPLICABLE}）`,
)
