#!/usr/bin/env node
// 门禁：headless 的作者面声明了 dir 的组件，三个适配器都要把它露出来。
//
// dir 是条真接线：机器把它交给定位引擎翻转行内轴，connect 把它写到被搬走的
// 浮层落点上（那里继承不到作者子树的方向，只能由作者显式给）。适配器不露，
// 作者就设不了它 —— 而文档站的 Props 表读的是 headless 的类型，照登不误：
// 一个只在文档里存在、代码里够不着的形状。
//
// 判据三条：
//   声明了 dir，某一侧没有 dir prop / 属性        → 这一侧的作者永远设不了
//   声明了 dir，收下了却没转交给机器              → 属性写了也不生效
//   适配器露了 dir，headless 没声明               → 要么是死 prop，要么是复合件转交给内部机器（登记进 COMPOSED）
//
// React 正在按批次铺开：只核 react-coverage.json 里已铺的组件，没铺到的跳过并在收尾行报出进度。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ADAPTERS, reactCovered, reactProgress } from './lib/adapters.mjs'

const HEADLESS = 'packages/engine/headless/src'

/**
 * 自己没有 schema、把 dir 转交给内部机器的复合件。
 *
 * 它们的 dir 来自被组合的那台机器的 props，本组件的 types 里查不到，
 * 但适配器上确实露着、也确实通到机器。登记了就要还露着：名单过期即判失败。
 */
const COMPOSED = {
}

/** 取 `.types.ts` 里作者面的 props 块：machine schema 的 props，或无机器组件的 <Name>Props 接口。 */
function declaresDir(source) {
  const lines = source.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*dir\?:/.test(lines[i]))
      continue
    // 往回找最近的块头：`  props: {`（schema 内）或 `export interface XxxProps {`
    for (let j = i - 1; j >= 0; j--) {
      if (/^ {2}props: \{/.test(lines[j]))
        return true
      if (/^export interface \w+Props \{/.test(lines[j]))
        return true
      // 撞上别的顶层接口就说明这个 dir 不在作者面上
      if (/^export (?:interface|type|const|function) /.test(lines[j]))
        break
    }
  }
  return false
}

/** 某个适配器下这个组件的源码：目录形态（components/x/*）与单文件形态（components/x.*）都认。 */
async function componentSource(dir, name, extensions) {
  const sub = join(dir, name)
  const files = await readdir(sub).catch(() => null)
  if (files === null) {
    let single = ''
    for (const ext of extensions)
      single += await readFile(join(dir, `${name}${ext}`), 'utf8').catch(() => '')
    return single
  }
  let out = ''
  for (const file of files.filter(f => extensions.some(ext => f.endsWith(ext))))
    out += await readFile(join(sub, file), 'utf8')
  return out
}

/** Vue 侧露出 dir：Root 的 props 块里有一条 dir 声明（缩进四格）。 */
const vueExposes = source => /^ {4}dir: \{/m.test(source)

/** React 侧露出 dir：组件的 Props 接口里写着一条 dir（成员缩进两格）。 */
const reactExposes = source => /^ {2}dir\?:/m.test(source)

/** 整份 props 透传给 use<组件>：不逐个列键，而是把组件收到的那一份整个交出去。 */
const FORWARDS_ALL_PROPS = /\buse[A-Z]\w*\(\s*(?:with\w+\(\s*'[^']*'\s*,\s*)?(?:\.\.\.)?props\b/

/**
 * React 的 Props 大多从 ComponentPropsWithRef<'…'> 扩展而来，那里本就带着 HTML 的 dir，
 * 只声明不接线时 dir 会随 rest 落到 DOM 节点上、却永远到不了机器——看着生效，行内轴不翻。
 *
 * 两种接线都算数：组件体里把 dir 解构出来再交进机器 props，或者整份 props 直接交出去
 * （后者更严，一个键都漏不掉）。
 */
function reactForwards(source) {
  const body = source.replace(/export (?:interface|type) \w[^{]*\{[\s\S]*?\n\}/g, '')
  return /\bdir\b/.test(body) || FORWARDS_ALL_PROPS.test(body)
}

/**
 * WC 侧的 dir 字段名：属性名占 dir，字段另起（direction / textDir），
 * 避开 HTMLElement 自带的 dir 存取器。没有这条描述符就是没露。
 */
function wcField(source) {
  return source.match(/^\s*(\w+): \{[^}]*attribute: 'dir'/m)?.[1] ?? null
}

const errors = []
const declared = []
const exposedCount = { vue: 0, react: 0, wc: 0 }
let scanned = 0
const reactSkipped = new Set()
const composedSeen = new Set()
const covered = await reactCovered()

for (const entry of await readdir(HEADLESS, { withFileTypes: true })) {
  if (!entry.isDirectory())
    continue
  const name = entry.name
  const types = await readFile(join(HEADLESS, name, `${name}.types.ts`), 'utf8').catch(() => null)
  if (types === null)
    continue
  scanned++

  const vue = await componentSource(ADAPTERS.vue.components, name, ['.ts'])
  // React 按批次铺开：没铺到的组件这一侧没有源码，跳过并计进收尾行的进度
  const reactSkip = !covered.has(name)
  if (reactSkip)
    reactSkipped.add(name)
  const react = reactSkip ? '' : await componentSource(ADAPTERS.react.components, name, ['.ts', '.tsx'])
  const wc = await readFile(join(ADAPTERS.wc.components, `${name}.ts`), 'utf8').catch(() => '')

  if (declaresDir(types)) {
    declared.push(name)
    if (vue !== '') {
      if (vueExposes(vue))
        exposedCount.vue++
      else
        errors.push(`${ADAPTERS.vue.label} 的 ${name}：headless 作者面声明了 dir，Root 的 props 里没有——文档站照登，作者却设不了它`)
    }
    if (react !== '') {
      if (!reactExposes(react))
        errors.push(`${ADAPTERS.react.label} 的 ${name}：headless 作者面声明了 dir，组件的 Props 里没有——文档站照登，作者却设不了它`)
      else if (!reactForwards(react))
        errors.push(`${ADAPTERS.react.label} 的 ${name}：dir 只声明在 Props 上，组件体里没有它——随 rest 落到 DOM 节点是到不了机器的，要解构出来交进机器 props`)
      else
        exposedCount.react++
    }
    if (wc !== '') {
      const field = wcField(wc)
      if (field === null)
        errors.push(`${ADAPTERS.wc.label} 的 ${name}：headless 作者面声明了 dir，元素上没有 dir 属性——照 tabs.ts 写 direction: { converter: STRING_CONVERTER, attribute: 'dir' }`)
      else if (!new RegExp(`\\bdir: this\\.${field}\\b`).test(wc))
        errors.push(`${ADAPTERS.wc.label} 的 ${name}：dir 属性收下了却没进机器 props——machineProps 里补 dir: this.${field}`)
      else
        exposedCount.wc++
    }
    continue
  }

  // 反向：headless 没声明，适配器却露着
  const exposed = (vue !== '' && vueExposes(vue))
    || (react !== '' && reactExposes(react))
    || (wc !== '' && wcField(wc) !== null)
  if (!exposed)
    continue
  if (name in COMPOSED) {
    composedSeen.add(name)
    continue
  }
  const where = [
    vue !== '' && vueExposes(vue) ? ADAPTERS.vue.label : '',
    react !== '' && reactExposes(react) ? ADAPTERS.react.label : '',
    wc !== '' && wcField(wc) !== null ? ADAPTERS.wc.label : '',
  ].filter(Boolean).join(' / ')
  errors.push(`${name} 的适配器露着 dir（${where}），headless 的作者面却没声明它——要么是通不到机器的死 prop，要么是转交给内部机器的复合件（登记进 COMPOSED）`)
}

// 名单过期反查：登记了却已经不成立的，比漏登更危险——它会一直放行
for (const name of Object.keys(COMPOSED)) {
  if (!composedSeen.has(name))
    errors.push(`COMPOSED 里的 '${name}' 已经扫不到——它要么已经在 headless 里声明了 dir，要么适配器上不再露它，名单过期了，删掉这一条`)
}

if (errors.length > 0) {
  console.error('[check-dir-exposed] ✗')
  for (const error of errors)
    console.error(`  ${error}`)
  process.exit(1)
}

console.log(`[check-dir-exposed] 通过：${declared.length} 个声明了 dir 的组件，露出来的 Vue ${exposedCount.vue} 个 / React ${exposedCount.react} 个 / Web Components ${exposedCount.wc} 个（另有 ${composedSeen.size} 个复合件转交给内部机器）`)
console.log(`  ${reactProgress(covered, scanned)}；React 还没铺的 ${reactSkipped.size} 个组件这一轮跳过`)
