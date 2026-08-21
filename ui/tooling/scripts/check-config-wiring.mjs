#!/usr/bin/env node
// 门禁：两个适配器的全局配置面必须一致，且配了要真能生效。
//
// 三条判据各对应一种静默失效：
//   两侧字段不一致 → 同一份配置在 Vue 上生效、在 Web Components 上没反应，谁也不会报错
//   声明了 translations 却没走 withXhConfig → 全局文案对那个组件永远不命中
//   size 同名不同义的组件没进豁免名单 → 全局垫一个 'md' 进去，那个组件当场坏掉
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const VUE_CONFIG = 'packages/adapters/vue/src/config/config.ts'
const WC_CONFIG = 'packages/adapters/web-components/src/config.ts'
const VUE_COMPONENTS = 'packages/adapters/vue/src/components'
const HEADLESS = 'packages/engine/headless/src'

/** 取 `export interface XhConfig { ... }` 里的字段名。 */
function configFields(source, where) {
  const start = source.indexOf('export interface XhConfig {')
  if (start === -1)
    throw new Error(`[check-config-wiring] ${where} 里找不到 XhConfig 声明`)
  const end = source.indexOf('\n}', start)
  const body = source.slice(start, end)
  return new Set([...body.matchAll(/^\s{2}(\w+)\?:/gm)].map(hit => hit[1]))
}

/** 取 `SIZE_IS_NOT_AXIS = new Set([...])` 里的组件名。 */
function exemptSizes(source, where) {
  const hit = source.match(/SIZE_IS_NOT_AXIS = new Set\(\[([^\]]*)\]\)/)
  if (!hit)
    throw new Error(`[check-config-wiring] ${where} 里找不到 SIZE_IS_NOT_AXIS`)
  return new Set([...hit[1].matchAll(/'([\w-]+)'/g)].map(m => m[1]))
}

const errors = []

// —— 一、两个适配器的配置面 ——
const vueConfigSource = await readFile(VUE_CONFIG, 'utf8')
const vueFields = configFields(vueConfigSource, VUE_CONFIG)
const wcFields = configFields(await readFile(WC_CONFIG, 'utf8'), WC_CONFIG)
// portalContainer 只有 Vue 有：WC 是 Light DOM，浮层不搬运，那个端口在这一侧没有意义
const VUE_ONLY = new Set(['portalContainer'])
for (const field of vueFields) {
  if (!wcFields.has(field) && !VUE_ONLY.has(field))
    errors.push(`XhConfig.${field} 只有 Vue 侧有；同一份配置在 Web Components 上会静默不生效`)
}
for (const field of wcFields) {
  if (!vueFields.has(field))
    errors.push(`XhConfig.${field} 只有 Web Components 侧有；同一份配置在 Vue 上会静默不生效`)
}

// —— 二、size 同名不同义的豁免名单 ——
const vueExempt = exemptSizes(vueConfigSource, VUE_CONFIG)
const wcExempt = exemptSizes(await readFile(WC_CONFIG, 'utf8'), WC_CONFIG)
for (const name of new Set([...vueExempt, ...wcExempt])) {
  if (!vueExempt.has(name) || !wcExempt.has(name))
    errors.push(`size 豁免名单两侧对不上：'${name}' 只在一边`)
}

const components = []
for (const entry of await readdir(HEADLESS, { withFileTypes: true })) {
  if (!entry.isDirectory())
    continue
  const types = join(HEADLESS, entry.name, `${entry.name}.types.ts`)
  const source = await readFile(types, 'utf8').catch(() => null)
  if (source === null)
    continue
  components.push(entry.name)
  // props 块里的 size 声明缩进四格；两格那些在别的接口里，与机器 props 无关
  const declared = source.match(/^ {4}size\?: (.+)$/m)
  if (!declared)
    continue
  const axis = declared[1].trim() === 'Size'
  if (!axis && !vueExempt.has(entry.name))
    errors.push(`${entry.name} 的 size 是 ${declared[1].trim()} 不是三轴那档，要进两侧的 SIZE_IS_NOT_AXIS`)
  if (axis && vueExempt.has(entry.name))
    errors.push(`${entry.name} 的 size 就是三轴那档，不该在 SIZE_IS_NOT_AXIS 里`)
}
for (const name of vueExempt) {
  if (!components.includes(name))
    errors.push(`SIZE_IS_NOT_AXIS 里的 '${name}' 不是组件`)
}

// —— 三、Vue 组件要真接得到全局配置 ——
// translations 按组件名分桶，只有 withXhConfig 认得出自己是谁；
// size 两条路都行：跑机器的走 useMachine 那一处，没机器的自己调 withXhConfig。
for (const entry of await readdir(VUE_COMPONENTS, { withFileTypes: true })) {
  if (!entry.isDirectory())
    continue
  const dir = join(VUE_COMPONENTS, entry.name)
  const files = (await readdir(dir)).filter(name => name.endsWith('.ts'))
  let component = ''
  for (const name of files)
    component += await readFile(join(dir, name), 'utf8')
  if (component === '')
    continue

  if (/^\s{4}translations: \{/m.test(component) && !component.includes('withXhConfig('))
    errors.push(`${entry.name}：声明了 translations 却没走 withXhConfig，全局文案到不了它`)

  const declaresSize = /PropType<Size>/.test(component)
  const wired = component.includes('withXhConfig(') || component.includes('useMachine(')
  if (declaresSize && !wired)
    errors.push(`${entry.name}：声明了三轴 size 却既没跑机器也没调 withXhConfig，全局尺寸档到不了它`)
}

if (errors.length > 0) {
  console.error('[check-config-wiring] ✗')
  for (const error of errors)
    console.error(`  ${error}`)
  process.exit(1)
}

console.log(`[check-config-wiring] 通过：两侧配置面各 ${vueFields.size}/${wcFields.size} 个字段，size 豁免 ${vueExempt.size} 个，声明了文案的 Vue 组件都接了全局配置`)
