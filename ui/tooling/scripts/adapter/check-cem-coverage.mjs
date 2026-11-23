#!/usr/bin/env node
// 门禁：注册了的自定义元素必须在 custom-elements.json 里有一条同名声明。
//
// 分析器把 JSDoc 绑到紧跟它的那个声明上。JSDoc 与 class 之间一旦插进别的东西
// （calendar 就在两者之间夹了个 declaredIndex 函数），整块文档注释连同 tagName、
// attributes、events、cssParts 一起记到那个函数头上，class 被当成普通类收录——
// 元素本身照常注册、照常能用，只是从清单里整块消失。编辑器补全、文档站的属性表、
// public-surface 基线全都读这份清单，所以缺一个元素是静默的：CEM 生成成功，
// gate:cem 的 git diff 也干净（因为生成结果本来就一直是错的）。
//
// 判据一是双向差集：define.ts 注册了但清单里没有 → 漏收；清单里有但没注册 → 死条目。
//
// 判据二：清单里的每个事件都得来自类注释的 @fires。分析器另会从派发处自己推事件名——
// 构造事件时第一个实参是字面量就取它，是变量就取变量名。派发经一个带 name 形参的辅助函数转一手，
// 清单里就多出一个叫 name 的事件：它永不派发，却进了编辑器补全与公开面基线（xh-scrollbar 这样挂过）。
// 这种推出来的条目没有说明文字，@fires 写出来的都有，按这一点认。
import { readFile } from 'node:fs/promises'

/**
 * 这张门禁只核 Web Components 一家。
 * 两侧都是自定义元素独有的产物：define.ts 是 customElements.define 的调用点，
 * custom-elements.json 是元素清单。Vue 与 React 渲染的是各自框架的组件，
 * 没有元素注册这一层，也没有可比的清单产物，扩过去核的是空气。
 */
const SCOPE = '只核 Web Components 一家；Vue 与 React 不在其列：它们没有自定义元素注册这一层，也没有对应的清单产物'

const DEFINE = 'packages/adapters/web-components/src/define.ts'
const MANIFEST = 'packages/adapters/web-components/custom-elements.json'

const RE_DEFINE_CALL = /^ {2}'(xh-[\w-]+)': Xh\w+,$/gm

const source = await readFile(DEFINE, 'utf8')
const registered = new Set()
for (const match of source.matchAll(RE_DEFINE_CALL)) registered.add(match[1])

const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'))
const declared = new Map()
/** 没有说明文字的事件：分析器从派发处推出来的，不是 @fires 写的。 */
const inferredEvents = []
let eventCount = 0
for (const module of manifest.modules ?? []) {
  for (const declaration of module.declarations ?? []) {
    if (!declaration.tagName)
      continue
    declared.set(declaration.tagName, module.path)
    for (const event of declaration.events ?? []) {
      eventCount++
      if (!event.description)
        inferredEvents.push(`${declaration.tagName} 的 ${event.name}（${module.path}）`)
    }
  }
}

const missing = [...registered].filter(tag => !declared.has(tag)).sort()
const orphaned = [...declared.keys()].filter(tag => !registered.has(tag)).sort()

if (missing.length || orphaned.length) {
  console.error('[check-cem-coverage] ✗ 注册的元素与清单对不上：')
  for (const tag of missing)
    console.error(`  ${tag} 在 ${DEFINE} 注册了，${MANIFEST} 里没有——多半是 JSDoc 与 class 之间插了别的声明，把注释挪到 class 正上方`)
  for (const tag of orphaned)
    console.error(`  ${tag} 在 ${MANIFEST} 里，却没在 ${DEFINE} 注册——删掉清单里的死条目，或补上注册`)
  console.error('清单是编辑器补全、文档属性表与公开面基线的共同上游，缺一条不会有任何别的检查报错。')
  process.exit(1)
}

if (inferredEvents.length) {
  console.error('[check-cem-coverage] ✗ 清单里有不是 @fires 写出来的事件：')
  for (const entry of inferredEvents)
    console.error(`  ${entry}`)
  console.error('这是分析器从派发处推出来的名字。派发处把事件名写成字面量（不要经带 name 形参的辅助函数转手），并在类注释里补一条 @fires。')
  process.exit(1)
}

console.log(`[check-cem-coverage] 通过：${registered.size} 个注册元素在清单里一一对得上，${eventCount} 条事件都来自 @fires`)
console.log(`[check-cem-coverage] 适用面：${SCOPE}`)
