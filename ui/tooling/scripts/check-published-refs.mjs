#!/usr/bin/env node
// 门禁：随包发到 npm 的文本，不许指向本仓之外的文档目录。
//
// README.md 与 CHANGELOG.md 是 npm 包页面直接渲染的两份文本，装包的人只拿得到包内的东西。
// 指向 `开发设计/` 或 `设计规范/` 这类目录的引用在包里永远解析不到，点过去是 404。
// 同样的路径写进 packages/**/src 也一样——那份注释会随 dist 的 sourcemap 一起发出去。
//
// 值域是封闭的：外部文档目录名列在 FORBIDDEN 里，新增一个就往表里加一条。
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const uiRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** 不随包发布、使用者也拿不到的文档目录前缀。 */
const FORBIDDEN = ['开发设计/', '设计规范/']

const EXT = /\.(?:md|ts|tsx|js|mjs|css)$/
const SKIP = new Set(['node_modules', 'dist', '.turbo'])

async function filesUnder(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    if (SKIP.has(entry.name))
      continue
    const path = join(dir, entry.name)
    if (entry.isDirectory())
      await filesUnder(path, out)
    else if (EXT.test(entry.name))
      out.push(path)
  }
  return out
}

const problems = []
let checked = 0

for (const path of await filesUnder(join(uiRoot, 'packages'))) {
  const source = await readFile(path, 'utf8')
  checked++
  const shown = path.replaceAll('\\', '/').slice(uiRoot.replaceAll('\\', '/').length + 1)
  for (const prefix of FORBIDDEN) {
    let at = source.indexOf(prefix)
    while (at !== -1) {
      const line = source.slice(0, at).split('\n').length
      problems.push(`${shown}:${line}  指向 ${prefix}——这个目录不随包发布，装包的人点过去是 404`)
      at = source.indexOf(prefix, at + prefix.length)
    }
  }
}

if (problems.length) {
  console.error(`[check-published-refs] ✗ 发布物里有拿不到的文档引用（${problems.length} 处）：`)
  for (const problem of problems)
    console.error(`  ${problem}`)
  console.error('\n改法：把引用整段删掉，或换成文档站上真实存在的一页。')
  process.exit(1)
}

console.log(`[check-published-refs] 通过：${checked} 份包内文本没有指向仓外文档目录的引用`)
