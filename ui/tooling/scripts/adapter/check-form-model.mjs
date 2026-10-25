#!/usr/bin/env node
// 门禁：表单字段组按字段名绑定控件的值，这条通道三处都要对得上。
//
// 一、headless 的值通道表（form-model.ts）：带 name 参与表单提交的组件都登记了，或写明为什么不接；
//     登记的值 prop、初值 prop、改动回调与回调细节里的新值字段，在那个组件的类型里都真有。
// 二、三个适配器跑机器的那一处都把值端口并进 props，表单字段组都交出值端口：桥一拆，
//     所有控件同时退回非受控，而每条登记看着都还在。
// 三、组件内部借来跑的子机器（颜色选择器里的滑块、日期选择器里的日期输入、分页里的每页条数下拉）
//     都写了 formField: false：它们与外层组件同在一个字段组下，漏写就会把外层字段的值当成自己的。
import { readdir, readFile } from 'node:fs/promises'
import { basename, dirname, join, sep } from 'node:path'
import process from 'node:process'
import { ADAPTERS } from '../lib/adapters.mjs'

const HEADLESS = 'packages/engine/headless/src'
const MODEL_FILE = `${HEADLESS}/form/form-model.ts`

/** 带 name 却不接字段值的组件，必须写明理由。 */
const EXEMPT = {
  'field-array': '字段数组自己按路径读写表单的值，不经字段组的值端口',
}

/** 三个适配器的接入点：路径与必须出现的调用。 */
const BRIDGES = [
  ['vue', `${ADAPTERS.vue.root}/src/runtime/use-machine.ts`, 'bindFormModel('],
  ['vue', `${ADAPTERS.vue.root}/src/components/form/form.ts`, 'formFieldModel('],
  ['react', `${ADAPTERS.react.root}/src/runtime/use-machine.ts`, 'bindFormModel('],
  ['react', `${ADAPTERS.react.root}/src/components/form/form.tsx`, 'formFieldModel('],
  ['wc', `${ADAPTERS.wc.root}/src/runtime/machine-controller.ts`, 'bindFormModel('],
  ['wc', `${ADAPTERS.wc.root}/src/elements/form.ts`, 'setFormFieldModel('],
]

async function read(p) {
  try {
    return await readFile(p, 'utf8')
  }
  catch {
    return null
  }
}

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory())
      await walk(p, out)
    else if (/\.tsx?$/.test(entry.name))
      out.push(p)
  }
  return out
}

/** 从 index 处的左括号起，取到与它配对的右括号为止的那段文本。 */
function callText(src, open) {
  let depth = 0
  for (let i = open; i < src.length; i++) {
    if (src[i] === '(')
      depth += 1
    else if (src[i] === ')' && --depth === 0)
      return src.slice(open, i + 1)
  }
  return src.slice(open)
}

const camel = name => `${name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}Machine`

const modelSource = await read(MODEL_FILE)
if (modelSource == null) {
  console.error(`[check-form-model] ✗ 找不到 ${MODEL_FILE}，值通道表挪了位置`)
  process.exit(1)
}

// 一、值通道表
const channels = new Map()
for (const m of modelSource.matchAll(/^const (\w+): FormModel = \{ prop: '(\w+)', defaultProp: '(\w+)', onChange: '(\w+)', detail: '(\w+)' \}/gm))
  channels.set(m[1], { prop: m[2], defaultProp: m[3], onChange: m[4], detail: m[5] })
const table = new Map()
for (const m of modelSource.matchAll(/^ {2}'([a-z-]+)': (\w+),$/gm)) {
  const channel = channels.get(m[2])
  if (!channel) {
    console.error(`[check-form-model] ✗ ${m[1]} 登记的值通道 ${m[2]} 没有定义`)
    process.exit(1)
  }
  table.set(m[1], channel)
}
if (table.size === 0) {
  console.error(`[check-form-model] ✗ ${MODEL_FILE} 里一条登记都没扫到，表的写法变了`)
  process.exit(1)
}

const dirs = (await readdir(HEADLESS, { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name).sort()
const problems = []
const fields = []
for (const name of dirs) {
  const types = await read(join(HEADLESS, name, `${name}.types.ts`))
  if (types == null)
    continue
  if (/^\s{4}name\?:/m.test(types))
    fields.push(name)
  const channel = table.get(name)
  if (!channel)
    continue
  if (!new RegExp(`^\\s{4}${channel.prop}\\?:`, 'm').test(types))
    problems.push(`${name} —— 登记的值 prop「${channel.prop}」在 ${name}.types.ts 的 props 里没有`)
  if (!new RegExp(`^\\s{4}${channel.defaultProp}\\?:`, 'm').test(types))
    problems.push(`${name} —— 登记的初值 prop「${channel.defaultProp}」在 ${name}.types.ts 的 props 里没有`)
  // 细节类型可以带值类型参数（选择类的 `SelectValueChangeDetails<V>`），只取名字去找它的声明
  const callback = types.match(new RegExp(`^\\s{4}${channel.onChange}\\?: \\(details: (\\w+)(?:<[^>]*>)?\\)`, 'm'))
  if (!callback) {
    problems.push(`${name} —— 登记的改动回调「${channel.onChange}」在 ${name}.types.ts 的 props 里没有`)
    continue
  }
  const details = types.match(new RegExp(`export interface ${callback[1]}\\b[^{]*\\{([\\s\\S]*?)\\n\\}`))
  if (details && !new RegExp(`^\\s{2}${channel.detail}\\??:`, 'm').test(details[1]))
    problems.push(`${name} —— ${callback[1]} 里没有新值字段「${channel.detail}」`)
}
for (const name of table.keys()) {
  if (!dirs.includes(name))
    problems.push(`${name} —— 值通道表登记了它，headless 里却没有这个组件`)
}
const missing = fields.filter(name => !table.has(name) && !(name in EXEMPT))
for (const name of missing)
  problems.push(`${name} —— 带 name 参与表单提交，却没在值通道表里登记；放进字段组时它不会按字段名读写表单的值`)
for (const name of Object.keys(EXEMPT)) {
  if (!fields.includes(name))
    problems.push(`${name} —— EXEMPT 里登记了它，它却已经不带 name，删掉这条`)
  if (table.has(name))
    problems.push(`${name} —— 同时在值通道表与 EXEMPT 里，只留一处`)
}

// 二、三个适配器的桥
for (const [key, path, needle] of BRIDGES) {
  const text = await read(path)
  if (text == null || !text.includes(needle))
    problems.push(`${ADAPTERS[key].label}：${path} 里找不到 ${needle}——这一侧所有控件放进字段组都不再接字段的值`)
}

// 三、组件内部借来跑的子机器
const byMachine = new Map([...table.keys()].map(name => [camel(name), name]))
const CALL = /\b(?:useMachine(?:<[^>(]*>)?|new MachineController<[^>(]*>|new MachineController)\(\s*(?:this,\s*)?(\w+Machine)\b/g
let nested = 0
for (const key of ['vue', 'react', 'wc']) {
  for (const file of await walk(`${ADAPTERS[key].root}/src`)) {
    const src = await read(file)
    for (const m of src.matchAll(CALL)) {
      const name = byMachine.get(m[1])
      if (!name)
        continue
      const own = basename(file).replace(/\.tsx?$/, '').replace(/^use-/, '')
      if (basename(dirname(file)) === name || own === name)
        continue
      nested += 1
      // 泛型参数里不会有左括号，匹配里的第一个左括号就是这次调用的
      if (!/\bformField: false\b/.test(callText(src, m.index + m[0].indexOf('(')))) {
        const line = src.slice(0, m.index).split('\n').length
        problems.push(`${file.split(sep).join('/')}:${line} —— 内部借来跑的 ${name} 机器没写 formField: false，会接到外层字段组的值`)
      }
    }
  }
}

if (problems.length) {
  console.error('[check-form-model] ✗ 表单字段组的值通道有对不上的地方：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(
  `[check-form-model] 通过：${table.size} 个控件登记了值通道（${[...channels.keys()].length} 种），`
  + `${fields.length} 个带 name 的组件都已登记或写明不接（豁免 ${Object.keys(EXEMPT).length} 个）；`
  + `三个适配器的桥 ${BRIDGES.length} 处都在；组件内部借来跑的子机器 ${nested} 处都写了 formField: false`,
)
