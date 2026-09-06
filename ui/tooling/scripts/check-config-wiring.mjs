#!/usr/bin/env node
// 门禁：三个适配器的全局配置面必须一致，且配了要真能生效。
//
// 四条判据各对应一种静默失效：
//   某一侧少了字段 → 同一份配置在别处生效、在这一侧没反应，谁也不会报错
//   size 同名不同义的组件没进豁免名单 → 全局垫一个 'md' 进去，那个组件当场坏掉
//   headless 声明了 size / translations 的组件在某一侧没接配置 → 全局值对它永远不命中
//   XhConfig 的字段没有任何人真读它 → 配置是死的，写了也不生效
//
// React 正在按批次铺开：逐组件那一段只核 react-coverage.json 里已铺的组件，
// 没铺到的跳过并在收尾行报出进度。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ADAPTERS, reactCovered, reactProgress } from './lib/adapters.mjs'

const CONFIG_FILES = {
  vue: 'packages/adapters/vue/src/config/config.ts',
  react: 'packages/adapters/react/src/config/config.tsx',
  wc: 'packages/adapters/web-components/src/config.ts',
}
const SRC = {
  vue: `${ADAPTERS.vue.root}/src`,
  react: `${ADAPTERS.react.root}/src`,
  wc: `${ADAPTERS.wc.root}/src`,
}
const MERGE = 'packages/engine/headless/src/config/config-merge.ts'
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
const covered = await reactCovered()

// —— 一、三个适配器的配置面 ——
// 共同字段在 headless 的 XhConfigBase 上；Vue 与 React 在它之上各自扩展，WC 直接用它。
const mergeSource = await readFile(MERGE, 'utf8')
const baseFields = fieldsOf(mergeSource, 'XhConfigBase', MERGE)
const vueFields = new Set([...baseFields, ...fieldsOf(await readFile(CONFIG_FILES.vue, 'utf8'), 'XhConfig', CONFIG_FILES.vue)])
const reactFields = new Set([...baseFields, ...fieldsOf(await readFile(CONFIG_FILES.react, 'utf8'), 'XhConfig', CONFIG_FILES.react)])
if (!/export type XhConfig = XhConfigBase/.test(await readFile(CONFIG_FILES.wc, 'utf8')))
  errors.push(`${CONFIG_FILES.wc} 的 XhConfig 不再等于 XhConfigBase；字段一旦分叉，同一份配置在各侧会静默不一致`)
const wcFields = baseFields

const fieldsByAdapter = { vue: vueFields, react: reactFields, wc: wcFields }
// portalContainer 只有搬得动浮层的两侧有：WC 是 Light DOM，浮层不搬运，那个端口在这一侧没有意义
const NOT_IN_WC = new Set(['portalContainer'])
const allFields = new Set([...vueFields, ...reactFields, ...wcFields])
for (const field of allFields) {
  for (const adapter of Object.values(ADAPTERS)) {
    if (fieldsByAdapter[adapter.name].has(field))
      continue
    if (adapter.name === 'wc' && NOT_IN_WC.has(field))
      continue
    errors.push(`XhConfig.${field} 在 ${adapter.label} 侧的配置面里没有；同一份配置在这一侧会静默不生效`)
  }
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

// —— 三、声明了 size / translations 的组件，每个适配器都要真接得到全局配置 ——
// 真源是 headless 的 props 声明（四格缩进在 schema 的 props 块里，两格在无机器组件的 Props 接口里）。
// translations 按组件名分桶，只有 withXhConfig 认得出自己是谁；size 跑机器的走 useMachine /
// MachineController 那一处，没机器的自己调 withXhConfig（Vue 与 React）或 this.configured（WC，带宿主沿祖先链解析）。

async function readAll(paths) {
  let out = ''
  for (const path of paths)
    out += await readFile(path, 'utf8').catch(() => '')
  return out
}

/** 某个适配器下这个组件的源码：目录形态（components/x/*）与单文件形态（components/x.*）都认。 */
async function componentSource(dir, name, extensions) {
  const sub = join(dir, name)
  const files = await readdir(sub).catch(() => null)
  if (files)
    return readAll(files.filter(file => extensions.some(ext => file.endsWith(ext))).map(file => join(sub, file)))
  return readAll(extensions.map(ext => join(dir, `${name}${ext}`)))
}

const wiredCount = { vue: 0, react: 0, wc: 0 }
const reactSkipped = []

for (const name of components) {
  const types = await readFile(join(HEADLESS, name, `${name}.types.ts`), 'utf8')
  const wantsSize = /^ {2,4}size\?: Size$/m.test(types)
  const wantsText = /^ {2,4}translations\?:/m.test(types)
  if (!wantsSize && !wantsText)
    continue
  const want = [wantsSize ? 'size' : '', wantsText ? 'translations' : ''].filter(Boolean).join(' 与 ')

  // Vue 与 React 的接线形状一样：size / locale 由 useMachine 那一处并（fillXhConfigDefaults 只认这两个键）；
  // translations 按组件名分桶，只有 withXhConfig 认得出自己是谁——跑机器也不代表它接上了
  for (const adapter of [ADAPTERS.vue, ADAPTERS.react]) {
    // React 按批次铺开：没铺到的组件这一侧没有源码，跳过并计进收尾行的进度
    if (adapter.name === 'react' && !covered.has(name)) {
      reactSkipped.push(name)
      continue
    }
    const source = await componentSource(adapter.components, name, ['.ts', '.tsx'])
    if (source === '')
      continue
    wiredCount[adapter.name]++
    if (wantsSize && !source.includes('withXhConfig(') && !source.includes('useMachine('))
      errors.push(`${adapter.label} 的 ${name}：headless 声明了 size，却既没跑机器也没调 withXhConfig，全局配置到不了它`)
    if (wantsText && !source.includes('withXhConfig('))
      errors.push(`${adapter.label} 的 ${name}：headless 声明了 translations，这一侧必须调 withXhConfig——useMachine 只并 locale 与 size，按组件名分桶的文案到不了它`)
  }

  const wc = await readFile(join(ADAPTERS.wc.components, `${name}.ts`), 'utf8').catch(() => '')
  if (wc !== '') {
    wiredCount.wc++
    const wired = wc.includes('MachineController') || wc.includes('this.configured(')
    if (!wired)
      errors.push(`${ADAPTERS.wc.label} 的 ${name}：headless 声明了 ${want}，却既没跑机器也没调 this.configured，全局配置到不了它`)
    // 跑机器只保证全局那份并得进来，逐实例那条通道是另一回事：元素上没有
    // translations 这个 property、或者收下了不往 props 里转交，作者就只能靠
    // <xh-config> 改整棵子树，同一个组件在 Vue 上却能逐实例改——五个元素曾一直如此。
    if (wantsText) {
      if (!/^\s*translations: \{/m.test(wc))
        errors.push(`${ADAPTERS.wc.label} 的 ${name}：headless 声明了 translations，元素上没有这个 property——照 select.ts 写 translations: { attribute: false }（对象递不进属性），作者只能改整棵子树的文案`)
      else if (!/\btranslations: this\.translations\b/.test(wc))
        errors.push(`${ADAPTERS.wc.label} 的 ${name}：translations 这个 property 收下了却没转交进 props——machineProps 里补 translations: this.translations，否则设了也不生效`)
    }
    // 绕开宿主直接调 withXhConfig 只看得见全局那份，<xh-config> 的局部覆盖对它无效
    if (/\bwithXhConfig\(/.test(wc))
      errors.push(`${ADAPTERS.wc.label} 的 ${name}：元素里直接调 withXhConfig 看不见祖先链上的 <xh-config>，改用 this.configured`)
  }
}

// —— 四、XhConfig 的每个字段都要有人真读 ——
// 声明了字段、合并也正确，但没有任何组件读它，配置就是死的：scrollRoot 曾在 WC 侧一直如此。
//
// 扫描面是各适配器 src 下的全部 .ts / .tsx，config 那一份也在内——各侧真正把 motion 交给
// setMotionOverride 的接线点就写在那几个 config 文件里，按文件名把它们排除，等于把要查的
// 东西本身排除在外：删掉接线，判据照样绿。

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

/** 一个适配器 src 下的全部 .ts / .tsx，逐份留着路径：字段由谁读要按文件分辨。 */
async function filesUnder(root) {
  const out = []
  for (const entry of await readdir(root, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || !/\.tsx?$/.test(entry.name))
      continue
    const path = join(entry.parentPath ?? entry.path, entry.name)
    out.push({ path: path.replace(/\\/g, '/'), source: stripComments(await readFile(path, 'utf8')) })
  }
  return out
}

/**
 * 一次真实取值：从一份配置里把这个字段读出来。
 *
 * 判据是「点号左边那一串里带 config」，现有的读法多数是这个形状：
 *   config.<字段>            ·  toValue(config).<字段>
 *   xhConfig.value.<字段>    ·  resolveXhConfig(this).<字段>
 * 另一种是先把一份配置绑到局部名字上再读它（React 把合并结果记在 useMemo 的返回值里，
 * 点号左边不带 config 字样），那个名字由 configAliases 认出来。
 * 反过来，`motion: this.motion` 这种把值**装进**一份配置的写法不算消费——装进去没人读，
 * 配置照样是死的；接口里的字段声明、`declare` 的类字段、import 路径、kebab 字符串同理，
 * 它们都不是取值，不必再按文件或按 interface 块去排除。
 *
 * 新读法读不出来时改这两个函数，别去放宽扫描面。
 */
function consumes(source, field, aliases) {
  if (new RegExp(`[Cc]onfig[\\w$.?!()[\\]]*\\.${field}\\b`).test(source))
    return true
  for (const alias of aliases ?? []) {
    if (new RegExp(`\\b${alias}\\.${field}\\b`).test(source))
      return true
  }
  return false
}

/** 绑着一份配置的局部名字：`const x = …mergeXhConfig(…)` 里的 x。中间不许跨过另一条声明。 */
function configAliases(source) {
  const bind = /\b(?:const|let)\s+(\w+)\s*=\s*(?:(?!\b(?:const|let|function|return)\b)[\s\S]){0,200}?\b(?:useXhConfig|resolveXhConfig|mergeXhConfig|useContext)\(/g
  return new Set([...source.matchAll(bind)].map(m => m[1]))
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

const files = { vue: await filesUnder(SRC.vue), react: await filesUnder(SRC.react), wc: await filesUnder(SRC.wc) }
const blob = {}
const aliases = {}
for (const key of Object.keys(files)) {
  blob[key] = files[key].map(file => file.source).join('\n')
  aliases[key] = configAliases(blob[key])
}

/**
 * 这个字段在 Vue 侧由谁读：适配器级的一处，还是某几个组件。
 *
 * React 那一侧据此判断「没人读」是缺陷还是还没轮到：读它的若是适配器级的接线，
 * 三家都该有；读它的若全是还没铺到的组件，缺席是进度，不是缺陷。
 */
function vueReaders(field) {
  const inComponents = new Set()
  let adapterLevel = false
  for (const file of files.vue) {
    if (!consumes(file.source, field, aliases.vue))
      continue
    const hit = file.path.match(/\/src\/components\/([^/]+)/)
    if (hit)
      inComponents.add(hit[1].replace(/\.tsx?$/, ''))
    else
      adapterLevel = true
  }
  return { inComponents, adapterLevel }
}

let probed = 0
const deferred = []
for (const field of allFields) {
  if (MERGED_BY_WITH.has(field))
    continue
  probed++
  const how = `写法要能被 consumes() 认出来（config.${field} 这个形状）；确实读了但写法不同，把新形状加进 check-config-wiring.mjs 的 consumes()`
  const readers = vueReaders(field)
  for (const adapter of Object.values(ADAPTERS)) {
    if (adapter.name === 'wc' && NOT_IN_WC.has(field))
      continue
    if (consumes(blob[adapter.name], field, aliases[adapter.name]))
      continue
    // React 还没铺到读它的那些组件时，缺席是进度不是缺陷；适配器级的接线不在此列
    if (adapter.name === 'react' && !readers.adapterLevel && ![...readers.inComponents].some(name => covered.has(name))) {
      deferred.push(field)
      continue
    }
    errors.push(`XhConfig.${field} 在 ${adapter.label} 侧没有任何人读它，配置是死的：${how}`)
  }
}

// 两张豁免名单的过期反查：登了却已不成立的比漏登更危险，它会一直放行
for (const field of NOT_IN_WC) {
  if (!vueFields.has(field) && !reactFields.has(field))
    errors.push(`NOT_IN_WC 里的 '${field}' 已经不是任何一侧 XhConfig 的字段——名单过期了，删掉这一条`)
  else if (wcFields.has(field))
    errors.push(`NOT_IN_WC 里的 '${field}' 现在 Web Components 侧也有了——名单过期了，删掉这一条，让它跟别的字段一样三侧都查`)
}
for (const field of MERGED_BY_WITH) {
  if (!allFields.has(field))
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

const deferredNote = deferred.length > 0
  ? `，另 ${new Set(deferred).size} 个字段（${[...new Set(deferred)].join(' / ')}）在 React 侧等读它的组件铺到`
  : ''
console.log(`[check-config-wiring] 通过：配置面 Vue ${vueFields.size} / React ${reactFields.size} / Web Components ${wcFields.size} 个字段，其中 ${probed} 个逐一验过有人真读（另 ${MERGED_BY_WITH.size} 个经 withXhConfig 统一垫底）${deferredNote}`)
console.log(`  接了全局配置的组件：Vue ${wiredCount.vue} 个 / React ${wiredCount.react} 个 / Web Components ${wiredCount.wc} 个，size 豁免 ${exempt.size} 个（${reactProgress(covered, components.length)}，这一段跳过 React 还没铺的 ${new Set(reactSkipped).size} 个组件）`)
