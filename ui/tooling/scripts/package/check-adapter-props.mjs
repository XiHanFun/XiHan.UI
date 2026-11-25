// Vue 与 React 的组件 props 类型：每个组件一个 Xh<组件>Props，两端同名。
//
// 封装组件、给 h() / JSX 的参数或配置对象标类型都要用到组件的 props 类型。一端有、一端没有，
// 或同一个部件两端叫法不同，照着另一端的文档就写不出来；几个部件共用一个类型名，换掉其中一个的
// props 就得改名。所以入口导出的每个组件都要在同一个模块里导出 `<组件名>Props`，不导出对不上组件的
// Xh*Props，两端名单一一对上。只在一端才有的组件逐条登记并写明理由。

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../../../', import.meta.url))

/** 每端带组件的入口，与只在这一端才有的组件。 */
const ADAPTERS = {
  vue: {
    src: 'packages/adapters/vue/src',
    entries: ['index.ts', 'backgrounds.ts'],
    only: {},
  },
  react: {
    src: 'packages/adapters/react/src',
    entries: ['index.ts', 'backgrounds.tsx'],
    only: {
      XhConfigProvider: 'Vue 的全局配置用 provideXhConfig，不是组件',
      XhPortal: 'Vue 用自带的 Teleport，XhPortal 只在库内部用',
    },
  },
}

const RE_REEXPORT = /^export (type )?\{([^}]*)\}\s+from\s+'([^']+)'/gm
const RE_LOCAL_COMPONENT = /^export (?:const|function) (Xh[A-Z]\w*)\b/gm
const RE_LOCAL_PROPS = /^export (?:type|interface) (Xh\w+Props)\b/gm

const isComponent = name => /^Xh[A-Z]\w*$/.test(name) && !name.endsWith('Props')
const isPropsType = name => /^Xh\w+Props$/.test(name)

function names(list) {
  return list.split(',').map(s => s.trim().replace(/^type\s+/, '')).filter(Boolean)
}

const problems = []
const propsByAdapter = {}

for (const [adapter, cfg] of Object.entries(ADAPTERS)) {
  /** 组件 → 出处模块；Props 类型 → 出处模块。入口自己定义的记作入口文件名。 */
  const components = new Map()
  const props = new Map()
  for (const entry of cfg.entries) {
    const src = readFileSync(join(ROOT, cfg.src, entry), 'utf8')
    for (const m of src.matchAll(RE_REEXPORT)) {
      for (const name of names(m[2])) {
        if (!m[1] && isComponent(name))
          components.set(name, m[3])
        if (isPropsType(name))
          props.set(name, m[3])
      }
    }
    for (const m of src.matchAll(RE_LOCAL_COMPONENT))
      components.set(m[1], entry)
    for (const m of src.matchAll(RE_LOCAL_PROPS))
      props.set(m[1], entry)
  }

  for (const [component, from] of components) {
    const want = `${component}Props`
    if (!props.has(want))
      problems.push(`${adapter}：组件 ${component} 没有导出 ${want}（从 ${from} 导出）`)
    else if (props.get(want) !== from)
      problems.push(`${adapter}：${want} 要和 ${component} 从同一个模块导出，现在一个在 ${props.get(want)}、一个在 ${from}`)
  }
  for (const name of props.keys()) {
    if (!components.has(name.slice(0, -'Props'.length)))
      problems.push(`${adapter}：${name} 对不上任何组件。几个部件共用的类型不出包，各部件导出自己的同名类型`)
  }
  for (const name of Object.keys(cfg.only)) {
    if (!components.has(name))
      problems.push(`${adapter}：登记的单端组件 ${name} 已经不在入口里，删掉这条登记`)
  }
  propsByAdapter[adapter] = { props: new Set(props.keys()), components }
}

// 两端名单对拍：只在一端才有的组件按登记放行
const [left, right] = Object.keys(ADAPTERS)
for (const [a, b] of [[left, right], [right, left]]) {
  for (const name of propsByAdapter[a].props) {
    const component = name.slice(0, -'Props'.length)
    // 对不上组件的上面已经报过
    if (propsByAdapter[b].props.has(name) || component in ADAPTERS[a].only || !propsByAdapter[a].components.has(component))
      continue
    problems.push(`${a} 导出了 ${name}，${b} 没有：两端组件与 props 类型要一一对上，只在 ${a} 才有的组件登记进 ADAPTERS.${a}.only 并写明理由`)
  }
}
for (const [adapter, cfg] of Object.entries(ADAPTERS)) {
  const other = adapter === left ? right : left
  for (const name of Object.keys(cfg.only)) {
    if (propsByAdapter[other].components.has(name))
      problems.push(`${adapter}：${name} 登记为单端组件，但 ${other} 也导出了它，删掉这条登记`)
  }
}

if (problems.length) {
  console.error(`组件 props 类型检查失败（${problems.length} 处）：`)
  for (const p of problems)
    console.error(`  - ${p}`)
  process.exit(1)
}

const counts = Object.entries(propsByAdapter).map(([a, { props }]) => `${a} ${props.size}`).join('、')
console.log(`通过：每个组件都导出了同名的 Xh*Props（${counts}），两端名单一一对上`)
