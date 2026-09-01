#!/usr/bin/env node
// 门禁：示例里引的 @xihan-ui 包必须写进文档站的依赖。
//
// 示例分两版：自定义元素那版是 .html，由 check-wc-demos 在真实 Chromium 里跑过；
// Vue 那版是 .vue，只有文档站自己构建时才会被编译。于是「示例引了一个文档站没装的包」
// 这件事，仓内全部门禁都看不见——直到有人打开文档站，dev 服务器整页报解析失败。
//
// 传递依赖不算数：文档站用 link: 挂载各个包，pnpm 不会把它们的依赖铺进
// docs/node_modules/@xihan-ui/，所以示例要直接 import 谁，就得直接写谁。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const DEMOS = '../docs/.vitepress/demos'
const DOCS_PKG = '../docs/package.json'

/** 示例里可能出现的引用形式：裸包名，或带一级子路径（如 @xihan-ui/vue/sound）。 */
const IMPORT = /['"](@xihan-ui\/[a-z0-9-]+)(?:\/[a-z0-9-]+)?['"]/g

async function demoFiles(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...await demoFiles(path))
      continue
    }
    if (/\.(?:vue|html|ts|js|mjs)$/.test(entry.name))
      out.push(path)
  }
  return out
}

const pkg = JSON.parse(await readFile(DOCS_PKG, 'utf8'))
const declared = new Set(Object.keys(pkg.dependencies ?? {}))

const problems = []
let checked = 0

for (const file of await demoFiles(DEMOS)) {
  const source = await readFile(file, 'utf8')
  for (const match of source.matchAll(IMPORT)) {
    checked++
    if (declared.has(match[1]))
      continue
    problems.push(`${file.replaceAll('\\', '/')} 引了 ${match[1]}，但 docs/package.json 的 dependencies 里没有它`)
  }
}

if (problems.length) {
  console.error('[check-demo-imports] ✗ 示例引了文档站没装的包：')
  for (const problem of [...new Set(problems)])
    console.error(`  ${problem}`)
  console.error('把它按 link:../ui/packages/<组>/<包> 写进 docs/package.json，再在 docs 下跑一次 pnpm install。')
  process.exit(1)
}

console.log(`[check-demo-imports] 通过：${checked} 处 @xihan-ui 引用都在文档站的依赖里`)
