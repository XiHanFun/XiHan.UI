#!/usr/bin/env node
// 门禁：每份皮肤都进得了全量入口、也够得着按需入口，且 index.source.css 的顺序是唯一的排序真源。
//
// 三条判据各挡一种静默失效：
//   漏进源入口       → 全量引入的人拿不到这份皮肤，组件渲染成裸元素
//   漏了子路径导出   → 按需引入的人根本 import 不到它
//   源入口重复引     → 同一份规则进两遍，等特异性下的胜负由第二遍说了算
//   扁平主入口漏段   → 生成物过期，发布出去的 index.css 少一份皮肤
//
// 顺带把「按需产物的顺序只能由 index.source.css 过滤得来」这条钉在这里：同层内等特异性的规则靠源序
// 定胜负，另起一套排序（例如按目录读取序）会让按需与全量渲染分叉，而且分叉看不出来。
import { readdir, readFile } from 'node:fs/promises'
import { emitActionControlRecipe } from '../../../packages/design/styles/build/action-control-recipe.mjs'
import { emitChartRecipe } from '../../../packages/design/styles/build/chart-recipe.mjs'
import { emitCollectionItemRecipe } from '../../../packages/design/styles/build/collection-item-recipe.mjs'
import { emitFieldChromeRecipe } from '../../../packages/design/styles/build/field-chrome-recipe.mjs'
import { emitSwatchRecipe } from '../../../packages/design/styles/build/swatch-recipe.mjs'

const PKG = 'packages/design/styles'

const files = (await readdir(`${PKG}/css`))
  .filter(name => name.endsWith('.css'))
  .sort()

const index = await readFile(`${PKG}/index.source.css`, 'utf8')
const flat = await readFile(`${PKG}/index.css`, 'utf8')
const imported = [...index.matchAll(/@import '\.\/css\/([\w-]+\.css)'/g)].map(match => match[1])

const manifest = JSON.parse(await readFile(`${PKG}/package.json`, 'utf8'))
const exported = Object.values(manifest.exports)
  .filter(target => typeof target === 'string' && target.startsWith('./css/'))
  .map(target => target.slice('./css/'.length))

const errors = []

try {
  await emitActionControlRecipe({ check: true })
  await emitFieldChromeRecipe({ check: true })
  await emitCollectionItemRecipe({ check: true })
  await emitSwatchRecipe({ check: true })
  await emitChartRecipe({ check: true })
}
catch (error) {
  errors.push(error instanceof Error ? error.message : String(error))
}

for (const file of files) {
  if (!imported.includes(file))
    errors.push(`css/${file} 没被 index.source.css 引入：全量引入的人拿不到它`)
  // 扁平主入口按源序逐段内联，每份皮肤恰好一段标记；多了是重复内联，少了是产物过期
  const segments = flat.split(`\n/* styles/${file} */\n`).length - 1
  if (segments !== 1)
    errors.push(`css/${file} 在生成的 index.css 里有 ${segments} 段——应恰好一段；先跑 pnpm --filter @xihan-ui/styles gen`)
  if (!exported.includes(file))
    errors.push(`css/${file} 没有子路径导出：按需引入的人 import 不到它`)
}

for (const file of imported) {
  if (!files.includes(file))
    errors.push(`index.source.css 引了不存在的 css/${file}`)
}

for (const file of exported) {
  if (!files.includes(file))
    errors.push(`exports 指向不存在的 css/${file}`)
}

const seen = new Set()
for (const file of imported) {
  if (seen.has(file))
    errors.push(`index.source.css 重复引入 css/${file}`)
  seen.add(file)
}

if (errors.length > 0) {
  console.error('[check-style-entries] ✗')
  for (const error of errors)
    console.error(`  ${error}`)
  process.exit(1)
}

console.log(`[check-style-entries] 通过：${files.length} 份皮肤都在 index.source.css 里各引一次、在生成的 index.css 里各内联一段，也都有子路径导出`)
