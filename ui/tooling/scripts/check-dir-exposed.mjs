#!/usr/bin/env node
// 门禁：headless 的作者面声明了 dir 的组件，两个适配器都要把它露出来。
//
// dir 是条真接线：机器把它交给定位引擎翻转行内轴，connect 把它写到被搬走的
// 浮层落点上（那里继承不到作者子树的方向，只能由作者显式给）。适配器不露，
// 作者就设不了它 —— 而文档站的 Props 表读的是 headless 的类型，照登不误：
// 一个只在文档里存在、代码里够不着的形状。
//
// 判据三条：
//   声明了 dir，Vue 没有 dir prop        → 这一侧的作者永远设不了
//   声明了 dir，WC 没有 dir 属性或没转交 → 同上；转交漏了则属性写了也不生效
//   适配器露了 dir，headless 没声明      → 要么是死 prop，要么是复合件转交给内部机器（登记进 COMPOSED）
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const HEADLESS = 'packages/engine/headless/src'
const VUE_COMPONENTS = 'packages/adapters/vue/src/components'
const WC_ELEMENTS = 'packages/adapters/web-components/src/elements'

/**
 * 自己没有 schema、把 dir 转交给内部机器的复合件。
 *
 * 它们的 dir 来自被组合的那台机器的 props，本组件的 types 里查不到，
 * 但适配器上确实露着、也确实通到机器。登记了就要还露着：名单过期即判失败。
 */
const COMPOSED = {
  popselect: '复合件：自己无 schema，dir 转交内部 listbox 机器（popselect.connect.ts 读 listbox.prop(\'dir\')）',
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

/** Vue 组件源码：目录形态（components/x/*.ts）与单文件形态（components/x.ts）都认。 */
async function vueSource(name) {
  const dir = join(VUE_COMPONENTS, name)
  const files = await readdir(dir).catch(() => null)
  if (files === null)
    return readFile(join(VUE_COMPONENTS, `${name}.ts`), 'utf8').catch(() => '')
  let out = ''
  for (const file of files.filter(f => f.endsWith('.ts')))
    out += await readFile(join(dir, file), 'utf8')
  return out
}

/** Vue 侧露出 dir：Root 的 props 块里有一条 dir 声明（缩进四格）。 */
const vueExposes = source => /^ {4}dir: \{/m.test(source)

/**
 * WC 侧的 dir 字段名：属性名占 dir，字段另起（direction / textDir），
 * 避开 HTMLElement 自带的 dir 存取器。没有这条描述符就是没露。
 */
function wcField(source) {
  return source.match(/^\s*(\w+): \{[^}]*attribute: 'dir'/m)?.[1] ?? null
}

const errors = []
const declared = []
const composedSeen = new Set()

for (const entry of await readdir(HEADLESS, { withFileTypes: true })) {
  if (!entry.isDirectory())
    continue
  const name = entry.name
  const types = await readFile(join(HEADLESS, name, `${name}.types.ts`), 'utf8').catch(() => null)
  if (types === null)
    continue

  const vue = await vueSource(name)
  const wc = await readFile(join(WC_ELEMENTS, `${name}.ts`), 'utf8').catch(() => '')

  if (declaresDir(types)) {
    declared.push(name)
    if (vue !== '' && !vueExposes(vue))
      errors.push(`Vue 的 ${name}：headless 作者面声明了 dir，Root 的 props 里没有——文档站照登，作者却设不了它`)
    if (wc !== '') {
      const field = wcField(wc)
      if (field === null)
        errors.push(`Web Components 的 ${name}：headless 作者面声明了 dir，元素上没有 dir 属性——照 tabs.ts 写 direction: { converter: STRING_CONVERTER, attribute: 'dir' }`)
      else if (!new RegExp(`\\bdir: this\\.${field}\\b`).test(wc))
        errors.push(`Web Components 的 ${name}：dir 属性收下了却没进机器 props——machineProps 里补 dir: this.${field}`)
    }
    continue
  }

  // 反向：headless 没声明，适配器却露着
  const exposed = (vue !== '' && vueExposes(vue)) || (wc !== '' && wcField(wc) !== null)
  if (!exposed)
    continue
  if (name in COMPOSED) {
    composedSeen.add(name)
    continue
  }
  errors.push(`${name} 的适配器露着 dir，headless 的作者面却没声明它——要么是通不到机器的死 prop，要么是转交给内部机器的复合件（登记进 COMPOSED）`)
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

console.log(`[check-dir-exposed] 通过：${declared.length} 个声明了 dir 的组件两个适配器都露出来了（另有 ${composedSeen.size} 个复合件转交给内部机器）`)
