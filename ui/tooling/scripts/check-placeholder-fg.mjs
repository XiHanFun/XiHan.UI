#!/usr/bin/env node
// 门禁：占位文字的前景色，两条通道同一支默认令牌、各自留组件槽、一律不许用 opacity 表达。
//
// 占位文字有两条通道，长得完全不一样但说的是同一件事：
// ① 原生表单控件（input / textarea）的占位串只能用 `::placeholder` 伪元素画；
// ② 不是原生控件的触发器、段位、预览文本（value-text / segment / trigger / preview）
//    由机器打 `[data-placeholder]`，占位态是一个属性钩子。
// 同一个库里两套写法各自演化，最容易长成两种深浅——一个下拉框没选值时的灰，
// 和它旁边输入框没填值时的灰对不上，用户看到的是同一句「请选择」深浅不一。
// 所以两条通道钉死同一支默认前景 --xh-fg-subtle，各自留 --xh-<组件>-placeholder-fg 供覆盖。
//
// 不许用 opacity：UA 给 `::placeholder` 的默认不透明度各不相同（有的 1，有的 0.54），
// 在它之上再叠一层 opacity，等于每个引擎算出一个不同的实际对比度，
// 而对比度是可访问性判据里唯一能量化的那条——它必须由令牌单独决定，不能被引擎默认值乘进来。
//
// 判据取「名单 + 全目录反查」而不是纯禁止清单：禁止清单只对已经存在的规则生效，
// 把某份皮肤的占位前景整条删掉、或新加一个带输入框的组件却忘了写占位前景，
// 都会一路绿到发布——占位文字于是拿到继承来的正文色，看着像已经填了值。
// 名单负责「必须有」，全目录反查负责「有的都必须在名单里」，两头都堵住名单本身过期。
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const cssDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../packages/design/styles/css',
)

/** 通道 ①：`::placeholder` 伪元素，组件 → 承载占位串的部件。 */
const PSEUDO = {
  'combobox': 'input',
  'editable': 'input',
  'mention': 'input',
  'number-field': 'input',
  'password-input': 'input',
  'pin-input': 'input',
  'prompt-input': 'input',
  'question-flow': 'note',
  'tags-input': 'input',
  'text-field': 'input',
}

/** 通道 ②：`[data-placeholder]` 属性钩子，组件 → 承载占位文字的部件。 */
const ATTR = {
  'cascader': 'value-text',
  'date-field': 'segment',
  'editable': 'preview',
  'popselect': 'trigger',
  'select': 'value-text',
  'time-field': 'segment',
  'time-picker': 'input',
  'tree-select': 'value-text',
}

/** 两条通道共用的默认前景。改这一支等于同时改 19 处，正是它存在的意义。 */
const DEFAULT_FG = '--xh-fg-subtle'

const problems = []
/** key = `${通道}:${组件}`，值是扫到的基础规则（占位前景那一条）。 */
const base = new Map()
/** 占位通道上带状态限定的覆写规则（如焦点反白后重新指定前景），只查 opacity。 */
const overrides = []

/** 取声明块里某个属性的值；属性名必须整段匹配，免得 -webkit-text-fill-color 被当成 color。 */
function decl(body, prop) {
  const m = body.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:([^;]+)`))
  return m ? m[1].trim() : null
}

for (const file of fs.readdirSync(cssDir).filter(f => f.endsWith('.css')).sort()) {
  // 注释整段抹成等量空白：行号与列位不变，报错定位才对得上
  const text = fs.readFileSync(path.join(cssDir, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
  for (const [, rawSelector, body] of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    for (const one of rawSelector.split(',')) {
      const sel = one.trim().replace(/\s+/g, ' ')
      const channel = sel.includes('::placeholder') ? 'pseudo' : sel.includes('[data-placeholder]') ? 'attr' : null
      if (!channel)
        continue
      const scope = /\[data-scope='([a-z-]+)'\]/.exec(sel)?.[1]
      const part = [...sel.matchAll(/\[data-part='([a-z-]+)'\]/g)].at(-1)?.[1]
      if (!scope || !part) {
        problems.push(`${file} 占位规则没写全 data-scope / data-part：${sel}`)
        continue
      }
      // opacity 禁令覆盖整条通道：焦点态覆写同样是占位前景，叠上去一样把对比度乘没了
      if (decl(body, 'opacity') !== null)
        problems.push(`${file} [${part}] 占位前景不许用 opacity 表达——UA 给占位串的默认不透明度各引擎不同，叠上去对比度就不再由令牌决定；要更淡就换一支更淡的前景令牌`)

      // 去掉通道自身的选择器成分，剩下的就是状态限定：剩空的是基础规则，剩东西的是覆写
      const rest = sel
        .replaceAll(`[data-scope='${scope}']`, '')
        .replaceAll(`[data-part='${part}']`, '')
        .replaceAll('[data-placeholder]', '')
        .replaceAll('::placeholder', '')
        .trim()
      if (rest) {
        overrides.push({ file, scope, part, channel })
        continue
      }

      const registry = channel === 'pseudo' ? PSEUDO : ATTR
      const chLabel = channel === 'pseudo' ? '::placeholder' : '[data-placeholder]'
      if (registry[scope] !== part) {
        problems.push(`${file} ${scope} 的 ${chLabel} 占位前景落在 [${part}] 上，名单里没有这一条——新组件要登记进名单，改了部件名要同步改`)
        continue
      }
      const key = `${channel}:${scope}`
      if (base.has(key)) {
        problems.push(`${file} ${scope} 的 ${chLabel} 占位前景有不止一条基础规则——同一份皮肤里两条都不带状态限定，后一条会把前一条整个盖掉`)
        continue
      }
      base.set(key, { file, part })

      const value = decl(body, 'color')
      if (value === null) {
        problems.push(`${file} ${scope} 的 ${chLabel} 占位规则没写 color——占位文字会继承正文前景，看着像已经填了值`)
        continue
      }
      const m = /^var\(\s*--xh-([a-z0-9-]+)-placeholder-fg\s*,\s*var\(\s*(--xh-[a-z0-9-]+)\s*\)\s*\)$/.exec(value)
      if (!m) {
        if (new RegExp(`^var\\(\\s*${DEFAULT_FG}\\s*\\)$`).test(value))
          problems.push(`${file} ${scope} 的 ${chLabel} 占位前景缺组件槽——该写 var(--xh-${scope}-placeholder-fg, var(${DEFAULT_FG}))，没有槽使用者只能整支改令牌，一改就波及所有组件`)
        else
          problems.push(`${file} ${scope} 的 ${chLabel} 占位前景写成 ${value}——该写 var(--xh-${scope}-placeholder-fg, var(${DEFAULT_FG}))`)
        continue
      }
      if (m[1] !== scope)
        problems.push(`${file} ${scope} 的 ${chLabel} 占位前景槽名是 --xh-${m[1]}-placeholder-fg，与组件名对不上——使用者按组件名写覆盖会写空`)
      if (m[2] !== DEFAULT_FG)
        problems.push(`${file} ${scope} 的 ${chLabel} 占位前景默认取 var(${m[2]})，两条通道必须同取 var(${DEFAULT_FG})——不同默认值会让下拉框与输入框的同一句占位文字深浅不一`)
    }
  }
}

for (const [registry, channel, chLabel] of [[PSEUDO, 'pseudo', '::placeholder'], [ATTR, 'attr', '[data-placeholder]']]) {
  for (const [scope, part] of Object.entries(registry)) {
    if (!base.has(`${channel}:${scope}`))
      problems.push(`${scope}.css 缺 [${part}] 的 ${chLabel} 占位前景——名单里登记了却没扫到，要么规则被删了，要么部件改名了`)
  }
}

if (problems.length) {
  console.error('[check-placeholder-fg] ✗ 占位前景没按两通道同源的写法走：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

const files = new Set([...base.values()].map(v => v.file))
console.log(`[check-placeholder-fg] 通过：${base.size} 处占位前景同取 var(${DEFAULT_FG}) 并各留组件槽（${Object.keys(PSEUDO).length} 处 ::placeholder + ${Object.keys(ATTR).length} 处 [data-placeholder]，落在 ${files.size} 份皮肤里），另 ${overrides.length} 处状态覆写一并查过 opacity`)
