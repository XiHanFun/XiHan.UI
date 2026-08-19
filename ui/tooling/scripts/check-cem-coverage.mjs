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
// 判据是双向差集：define.ts 注册了但清单里没有 → 漏收；清单里有但没注册 → 死条目。
import { readFile } from 'node:fs/promises'

const DEFINE = 'packages/adapters/web-components/src/define.ts'
const MANIFEST = 'packages/adapters/web-components/custom-elements.json'

const RE_DEFINE_CALL = /defineElement\(\s*['"]([^'"]+)['"]/g

const source = await readFile(DEFINE, 'utf8')
const registered = new Set()
for (const match of source.matchAll(RE_DEFINE_CALL)) registered.add(match[1])

const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'))
const declared = new Map()
for (const module of manifest.modules ?? []) {
  for (const declaration of module.declarations ?? []) {
    if (declaration.tagName) declared.set(declaration.tagName, module.path)
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

console.log(`[check-cem-coverage] 通过：${registered.size} 个注册元素在清单里一一对得上`)
