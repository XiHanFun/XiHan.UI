#!/usr/bin/env node
// 门禁：两个适配器的全局配置面必须一致，且配了要真能生效。
//
// 四条判据各对应一种静默失效：
//   两侧字段不一致 → 同一份配置在 Vue 上生效、在 Web Components 上没反应，谁也不会报错
//   size 同名不同义的组件没进豁免名单 → 全局垫一个 'md' 进去，那个组件当场坏掉
//   headless 声明了 size / translations 的组件在某一侧没接配置 → 全局值对它永远不命中
//   XhConfig 的字段没有任何组件真读它 → 配置是死的，写了也不生效
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const VUE_CONFIG = 'packages/adapters/vue/src/config/config.ts'
const WC_CONFIG = 'packages/adapters/web-components/src/config.ts'
const MERGE = 'packages/engine/headless/src/config/config-merge.ts'
const VUE_COMPONENTS = 'packages/adapters/vue/src/components'
const HEADLESS = 'packages/engine/headless/src'

/** 取 `export interface X { ... }` 里的字段名。 */
function fieldsOf(source, name, where) {
  const start = source.indexOf(`export interface ${name} `)
  if (start === -1)
    throw new Error(`[check-config-wiring] ${where} 里找不到 ${name} 声明`)
  const end = source.indexOf('\n}', start)
  const body = source.slice(start, end)
  return new Set([...body.matchAll(/^\s{2}(\w+)\?:/gm)].map(hit => hit[1]))
}

/** 取 `SIZE_IS_NOT_AXIS ... = new Set([...])` 里的组件名。 */
function exemptSizes(source, where) {
  const hit = source.match(/SIZE_IS_NOT_AXIS[^=]*= new Set\(\[([^\]]*)\]\)/)
  if (!hit)
    throw new Error(`[check-config-wiring] ${where} 里找不到 SIZE_IS_NOT_AXIS`)
  return new Set([...hit[1].matchAll(/'([\w-]+)'/g)].map(m => m[1]))
}

const errors = []

// —— 一、两个适配器的配置面 ——
// 共同字段在 headless 的 XhConfigBase 上；Vue 在它之上扩展，WC 直接用它。
const mergeSource = await readFile(MERGE, 'utf8')
const baseFields = fieldsOf(mergeSource, 'XhConfigBase', MERGE)
const vueFields = new Set([...baseFields, ...fieldsOf(await readFile(VUE_CONFIG, 'utf8'), 'XhConfig', VUE_CONFIG)])
if (!/export type XhConfig = XhConfigBase/.test(await readFile(WC_CONFIG, 'utf8')))
  errors.push(`${WC_CONFIG} 的 XhConfig 不再等于 XhConfigBase；字段一旦分叉，同一份配置在两侧会静默不一致`)
const wcFields = baseFields
// portalContainer 只有 Vue 有：WC 是 Light DOM，浮层不搬运，那个端口在这一侧没有意义
const VUE_ONLY = new Set(['portalContainer'])
for (const field of vueFields) {
  if (!wcFields.has(field) && !VUE_ONLY.has(field))
    errors.push(`XhConfig.${field} 只有 Vue 侧有；同一份配置在 Web Components 上会静默不生效`)
}

// —— 二、size 同名不同义的豁免名单 ——
const exempt = exemptSizes(mergeSource, MERGE)

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
  if (!axis && !exempt.has(entry.name))
    errors.push(`${entry.name} 的 size 是 ${declared[1].trim()} 不是三轴那档，要进 config-merge 的 SIZE_IS_NOT_AXIS`)
  if (axis && exempt.has(entry.name))
    errors.push(`${entry.name} 的 size 就是三轴那档，不该在 SIZE_IS_NOT_AXIS 里`)
}
for (const name of exempt) {
  if (!components.includes(name))
    errors.push(`SIZE_IS_NOT_AXIS 里的 '${name}' 不是组件`)
}

// —— 三、声明了 size / translations 的组件，两个适配器都要真接得到全局配置 ——
// 真源是 headless 的 props 声明（四格缩进在 schema 的 props 块里，两格在无机器组件的 Props 接口里）。
// translations 按组件名分桶，只有 withXhConfig 认得出自己是谁；size 跑机器的走 useMachine /
// MachineController 那一处，没机器的自己调 withXhConfig（Vue）或 this.configured（WC，带宿主沿祖先链解析）。
const WC_ELEMENTS = 'packages/adapters/web-components/src/elements'

async function readAll(paths) {
  let out = ''
  for (const path of paths)
    out += await readFile(path, 'utf8').catch(() => '')
  return out
}

/** Vue 组件的源码：目录形态（components/x/*.ts）与单文件形态（components/x.ts）都认。 */
async function vueSource(name) {
  const dir = join(VUE_COMPONENTS, name)
  const files = await readdir(dir).catch(() => null)
  if (files)
    return readAll(files.filter(file => file.endsWith('.ts')).map(file => join(dir, file)))
  return readAll([join(VUE_COMPONENTS, `${name}.ts`)])
}

for (const name of components) {
  const types = await readFile(join(HEADLESS, name, `${name}.types.ts`), 'utf8')
  const wantsSize = /^ {2,4}size\?: Size$/m.test(types)
  const wantsText = /^ {2,4}translations\?:/m.test(types)
  if (!wantsSize && !wantsText)
    continue
  const want = [wantsSize ? 'size' : '', wantsText ? 'translations' : ''].filter(Boolean).join(' 与 ')

  const vue = await vueSource(name)
  if (vue !== '') {
    // size / locale 由 useMachine 那一处并（fillXhConfigDefaults 只认这两个键）；
    // translations 按组件名分桶，只有 withXhConfig 认得出自己是谁——跑机器也不代表它接上了
    if (wantsSize && !vue.includes('withXhConfig(') && !vue.includes('useMachine('))
      errors.push(`Vue 的 ${name}：headless 声明了 size，却既没跑机器也没调 withXhConfig，全局配置到不了它`)
    if (wantsText && !vue.includes('withXhConfig('))
      errors.push(`Vue 的 ${name}：headless 声明了 translations，Vue 侧必须调 withXhConfig——useMachine 只并 locale 与 size，按组件名分桶的文案到不了它`)
  }

  const wc = await readFile(join(WC_ELEMENTS, `${name}.ts`), 'utf8').catch(() => '')
  if (wc !== '') {
    const wired = wc.includes('MachineController') || wc.includes('this.configured(')
    if (!wired)
      errors.push(`Web Components 的 ${name}：headless 声明了 ${want}，却既没跑机器也没调 this.configured，全局配置到不了它`)
    // 跑机器只保证全局那份并得进来，逐实例那条通道是另一回事：元素上没有
    // translations 这个 property、或者收下了不往 props 里转交，作者就只能靠
    // <xh-config> 改整棵子树，同一个组件在 Vue 上却能逐实例改——五个元素曾一直如此。
    if (wantsText) {
      if (!/^\s*translations: \{/m.test(wc))
        errors.push(`Web Components 的 ${name}：headless 声明了 translations，元素上没有这个 property——照 select.ts 写 translations: { attribute: false }（对象递不进属性），作者只能改整棵子树的文案`)
      else if (!/\btranslations: this\.translations\b/.test(wc))
        errors.push(`Web Components 的 ${name}：translations 这个 property 收下了却没转交进 props——machineProps 里补 translations: this.translations，否则设了也不生效`)
    }
    // 绕开宿主直接调 withXhConfig 只看得见全局那份，<xh-config> 的局部覆盖对它无效
    if (/\bwithXhConfig\(/.test(wc))
      errors.push(`Web Components 的 ${name}：元素里直接调 withXhConfig 看不见祖先链上的 <xh-config>，改用 this.configured`)
  }
}

// —— 四、XhConfig 的每个字段都要有人真读 ——
// 声明了字段、合并也正确，但没有任何组件读它，配置就是死的：scrollRoot 曾在 WC 侧一直如此。
//
// 扫描面是两个适配器 src 下的全部 .ts，config.ts 也在内——两侧真正把 motion 交给
// setMotionOverride 的接线点就写在那几个 config.ts 里，按文件名把它们排除，等于把要查的
// 东西本身排除在外：删掉接线，判据照样绿。
const VUE_SRC = 'packages/adapters/vue/src'
const WC_SRC = 'packages/adapters/web-components/src'

/**
 * 去掉注释，字符串与模板串里的 `//` 不动。
 *
 * 注释里的写法不算消费，注释掉的接线更不算：判据要能在接线被注释掉时判红。
 */
function stripComments(source) {
  let out = ''
  for (let i = 0; i < source.length; i++) {
    const two = source.slice(i, i + 2)
    if (two === '//') {
      while (i < source.length && source[i] !== '\n') i++
      out += '\n'
      continue
    }
    if (two === '/*') {
      const end = source.indexOf('*/', i + 2)
      i = end === -1 ? source.length : end + 1
      out += ' '
      continue
    }
    const quote = source[i]
    if (quote === '\'' || quote === '"' || quote === '`') {
      out += quote
      i++
      while (i < source.length) {
        if (source[i] === '\\') {
          out += source.slice(i, i + 2)
          i += 2
          continue
        }
        out += source[i]
        if (source[i] === quote)
          break
        i++
      }
      continue
    }
    out += source[i]
  }
  return out
}

async function sourcesUnder(root) {
  let out = ''
  for (const entry of await readdir(root, { withFileTypes: true, recursive: true })) {
    if (entry.isFile() && entry.name.endsWith('.ts'))
      out += `${stripComments(await readFile(join(entry.parentPath ?? entry.path, entry.name), 'utf8'))}\n`
  }
  return out
}

/**
 * 一次真实取值：从一份配置里把这个字段读出来。
 *
 * 判据是「点号左边那一串里带 config」，两侧现有的读法都是这个形状：
 *   config.<字段>            ·  toValue(config).<字段>
 *   xhConfig.value.<字段>    ·  resolveXhConfig(this).<字段>
 * 反过来，`motion: this.motion` 这种把值**装进**一份配置的写法不算消费——装进去没人读，
 * 配置照样是死的；接口里的字段声明、`declare` 的类字段、import 路径、kebab 字符串同理，
 * 它们都不是取值，不必再按文件或按 interface 块去排除。
 *
 * 新读法读不出来时改这个函数，别去放宽扫描面。
 */
function consumes(source, field) {
  return new RegExp(`[Cc]onfig[\\w$.?!()[\\]]*\\.${field}\\b`).test(source)
}

/** locale / size / translations 经 withXhConfig 统一垫进 props，不必逐字段点名。 */
const MERGED_BY_WITH = new Set(['locale', 'size', 'translations'])
const globalKeys = new Set(
  [...(mergeSource.match(/GLOBAL_KEYS = \[([^\]]*)\]/)?.[1] ?? '').matchAll(/'(\w+)'/g)].map(m => m[1]),
)
const withBody = mergeSource.slice(
  mergeSource.indexOf('export function withXhConfigBase'),
  mergeSource.indexOf('\n}', mergeSource.indexOf('export function withXhConfigBase')),
)

const vueAll = await sourcesUnder(VUE_SRC)
const wcAll = await sourcesUnder(WC_SRC)
let probed = 0
for (const field of vueFields) {
  if (MERGED_BY_WITH.has(field))
    continue
  probed++
  const how = `写法要能被 consumes() 认出来（config.${field} 这个形状）；确实读了但写法不同，把新形状加进 check-config-wiring.mjs 的 consumes()`
  if (!consumes(vueAll, field))
    errors.push(`XhConfig.${field} 在 Vue 侧没有任何组件读它，配置是死的：${how}`)
  if (!VUE_ONLY.has(field) && !consumes(wcAll, field))
    errors.push(`XhConfig.${field} 在 Web Components 侧没有任何组件读它，配置是死的：${how}`)
}

// 两张豁免名单的过期反查：登了却已不成立的比漏登更危险，它会一直放行
for (const field of VUE_ONLY) {
  if (!vueFields.has(field))
    errors.push(`VUE_ONLY 里的 '${field}' 已经不是 XhConfig 的字段——名单过期了，删掉这一条`)
  else if (wcFields.has(field))
    errors.push(`VUE_ONLY 里的 '${field}' 现在 Web Components 侧也有了——名单过期了，删掉这一条，让它跟别的字段一样两侧都查`)
}
for (const field of MERGED_BY_WITH) {
  if (!vueFields.has(field))
    errors.push(`MERGED_BY_WITH 里的 '${field}' 已经不是 XhConfig 的字段——名单过期了，删掉这一条`)
  else if (!globalKeys.has(field) && !withBody.includes(field))
    errors.push(`MERGED_BY_WITH 里的 '${field}' 已经不由 withXhConfig 统一垫底（${MERGE} 的 GLOBAL_KEYS 与 withXhConfigBase 里都找不到它）——名单过期了，删掉这一条，让它照常查有没有人读`)
}

if (errors.length > 0) {
  console.error('[check-config-wiring] ✗')
  for (const error of errors)
    console.error(`  ${error}`)
  process.exit(1)
}

console.log(`[check-config-wiring] 通过：两侧配置面各 ${vueFields.size}/${wcFields.size} 个字段，其中 ${probed} 个逐一验过有人真读（另 ${MERGED_BY_WITH.size} 个经 withXhConfig 统一垫底），size 豁免 ${exempt.size} 个，声明了 size / translations 的组件两侧都接了全局配置`)
