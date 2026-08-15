#!/usr/bin/env node
// 门禁：每份皮肤都进得了全量入口、也够得着按需入口，且 index.css 的顺序是唯一的排序真源。
//
// 三条判据各挡一种静默失效：
//   漏进 index.css   → 全量引入的人拿不到这份皮肤，组件渲染成裸元素
//   漏了子路径导出   → 按需引入的人根本 import 不到它
//   index.css 重复引 → 同一份规则进两遍，等特异性下的胜负由第二遍说了算
//
// 顺带把「按需产物的顺序只能由 index.css 过滤得来」这条钉在这里：同层内等特异性的规则靠源序
// 定胜负，另起一套排序（例如按目录读取序）会让按需与全量渲染分叉，而且分叉看不出来。
import { readdir, readFile } from 'node:fs/promises'

const PKG = 'packages/design/styles'

const files = (await readdir(`${PKG}/css`))
  .filter(name => name.endsWith('.css'))
  .sort()

const index = await readFile(`${PKG}/index.css`, 'utf8')
const imported = [...index.matchAll(/@import '\.\/css\/([\w-]+\.css)'/g)].map(match => match[1])

const manifest = JSON.parse(await readFile(`${PKG}/package.json`, 'utf8'))
const exported = Object.values(manifest.exports)
  .filter(target => typeof target === 'string' && target.startsWith('./css/'))
  .map(target => target.slice('./css/'.length))

const errors = []

for (const file of files) {
  if (!imported.includes(file))
    errors.push(`css/${file} 没被 index.css 引入：全量引入的人拿不到它`)
  if (!exported.includes(file))
    errors.push(`css/${file} 没有子路径导出：按需引入的人 import 不到它`)
}

for (const file of imported) {
  if (!files.includes(file))
    errors.push(`index.css 引了不存在的 css/${file}`)
}

for (const file of exported) {
  if (!files.includes(file))
    errors.push(`exports 指向不存在的 css/${file}`)
}

const seen = new Set()
for (const file of imported) {
  if (seen.has(file))
    errors.push(`index.css 重复引入 css/${file}`)
  seen.add(file)
}

if (errors.length > 0) {
  console.error('[check-style-entries] ✗')
  for (const error of errors)
    console.error(`  ${error}`)
  process.exit(1)
}

console.log(`[check-style-entries] 通过：${files.length} 份皮肤都在 index.css 里各引一次，也都有子路径导出`)
