// Vue 与 React 的组件上下文：读的全公开、写的全不公开，两端读钩子同名。
//
// 使用者写自定义部件要读组件状态，读钩子（use*Context 等）缺一个就写不成，所以组件目录里
// context 模块的读钩子都要从包入口导出。写的一半（Vue 的 provide*、React 的 Provider / Context 对象）
// 一旦公开，上下文的内部结构就成了对外契约，使用者还能伪造上下文，所以一个都不出包。
// 两端读钩子的名字要一一对上：同一个部件在 Vue 叫 useStepsItem、在 React 叫 useStepsItemContext，
// 照着另一端的文档就写不出来。
//
// 判据只看 components/**/context.ts(x) 与 *-context.ts：写在组件文件里的 InjectionKey 不是上下文契约。

import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../../../', import.meta.url))

/** 每端的入口、读写判据与登记。internal 是实现机制用的读钩子，keep 是例外公开的写函数，都写明理由。 */
const ADAPTERS = {
  vue: {
    src: 'packages/adapters/vue/src',
    writes: /^export function ((?:provide|clear)[A-Z]\w*)/gm,
    keep: {
      clearFieldContext: '字段边界的组合式写法，给封装在 setup 里断开外层字段，与 XhFieldBoundary 同义，不伪造上下文',
    },
    internal: {
      useFieldsetOuterDisabled: '外层字段组的禁用往里层字段组传，部件读的是 useFieldsetContext',
      useOptionalTableFooterLevel: '表尾嵌套层级，只给表格自己的部件用',
      useOptionalTableHeaderLevel: '表头嵌套层级，只给表格自己的部件用',
      useTooltipGroup: 'XhTooltipProvider 的延时共享，对外的是那个组件',
    },
  },
  react: {
    src: 'packages/adapters/react/src',
    writes: /^export const (\w+)\s*=/gm,
    keep: {},
    internal: {
      useDatePickerTimeUnitContext: '时间列把自己的单位交给列内子部件，是列的实现；Vue 同样只在组件文件里传',
      useMenubarPositionerContext: 'positioner 给 content 的回写口，只服务 React 的视觉桥',
      useTableFooterLevel: '表尾嵌套层级，只给表格自己的部件用',
      useTableHeaderLevel: '表头嵌套层级，只给表格自己的部件用',
    },
  },
}

const RE_READ = /^export function (use[A-Z]\w*)/gm
const RE_VALUE_EXPORT = /^export \{([^}]*)\} from '([^']+)'/gm

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)])
}

const problems = []
const publicReads = {}

for (const [name, cfg] of Object.entries(ADAPTERS)) {
  const src = join(ROOT, cfg.src)
  const index = readFileSync(join(src, 'index.ts'), 'utf8')
  const exported = new Map()
  for (const m of index.matchAll(RE_VALUE_EXPORT)) {
    for (const id of m[1].split(',').map(s => s.trim()).filter(Boolean))
      exported.set(id, m[2])
  }

  const seen = new Set()
  publicReads[name] = new Set()
  const files = walk(join(src, 'components')).filter(file => /[\\/](?:context|[\w-]+-context)\.tsx?$/.test(file))
  for (const file of files) {
    const text = readFileSync(file, 'utf8')
    const spec = `./${relative(src, file).replaceAll('\\', '/').replace(/\.tsx?$/, '')}`
    for (const [, id] of text.matchAll(RE_READ)) {
      seen.add(id)
      if (cfg.internal[id])
        continue
      publicReads[name].add(id)
      if (exported.get(id) !== spec)
        problems.push(`${name}：${spec} 的读钩子 ${id} 没从包入口导出`)
    }
    for (const [, id] of text.matchAll(cfg.writes)) {
      seen.add(id)
      if (!cfg.keep[id] && exported.has(id))
        problems.push(`${name}：写上下文的 ${id} 不该从包入口导出`)
    }
  }

  for (const id of [...Object.keys(cfg.internal), ...Object.keys(cfg.keep)]) {
    if (!seen.has(id))
      problems.push(`${name}：登记的 ${id} 在 context 模块里找不到，名单过期了`)
  }
}

for (const id of publicReads.vue) {
  if (!publicReads.react.has(id))
    problems.push(`读钩子 ${id} 只有 Vue 有：React 同一个部件要用同一个名字`)
}
for (const id of publicReads.react) {
  if (!publicReads.vue.has(id))
    problems.push(`读钩子 ${id} 只有 React 有：Vue 同一个部件要用同一个名字`)
}

if (problems.length) {
  console.error('[check-adapter-contexts] ✗ 组件上下文的公开面不成套：')
  problems.forEach(problem => console.error(`  - ${problem}`))
  process.exit(1)
}

console.log(`[check-adapter-contexts] 通过：两端各公开 ${publicReads.vue.size} 个读钩子、名字一一对上，写上下文的都不出包`)
