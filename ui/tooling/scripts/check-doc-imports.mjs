#!/usr/bin/env node
// 门禁：README 与文档站正文里 `import { X } from '@xihan-ui/Y'` 引的名字，必须在 Y 的公开面里。
//
// 扫描面是使用者会照抄的那些文本：18 个包的 README（随包发到 npm，是 npm 页面的落地页）、
// 两份仓库 README，以及文档站的正文、示例与代码块。名字对着 tooling/public-surface.json 逐个查——
// 那份基线由 build-public-surface.mjs 从各包的 dist 类型声明采集，改名或删导出都会落在里面。
//
// 子路径按主包查（`@xihan-ui/tokens/runtime` 的名字并在 `@xihan-ui/tokens` 的公开面里）。
// 只查具名导入：默认导入与 `import '@xihan-ui/styles'` 这种只带副作用的引用不参与。
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const uiRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const repoRoot = join(uiRoot, '..')

const IMPORT = /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"](@xihan-ui\/[a-z0-9-]+)(?:\/[a-z0-9-.]+)?['"]/g
const EXT = /\.(?:md|vue|html|ts|js|mjs)$/
/** 不扫的目录：依赖、产物，以及文档站构建时的中间目录。 */
const SKIP = /[\\/](?:node_modules|dist|\.git|\.turbo|\.vitepress[\\/](?:cache|\.temp))$/

async function filesUnder(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    if (SKIP.test(join(dir, entry.name)))
      continue
    const path = join(dir, entry.name)
    if (entry.isDirectory())
      await filesUnder(path, out)
    else if (EXT.test(entry.name))
      out.push(path)
  }
  return out
}

/** 花括号里的导入名：剥掉 `type ` 前缀与 `as 别名`，取原始导出名。 */
function importedNames(clause) {
  return clause
    .split(',')
    .map(part => part.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim())
    .filter(Boolean)
}

const surface = JSON.parse(await readFile(join(uiRoot, 'tooling/public-surface.json'), 'utf8')).exports

const targets = [
  ...(await filesUnder(join(uiRoot, 'packages'))).filter(path => /README(?:_cn)?\.md$/.test(path)),
  join(uiRoot, 'README.md'),
  join(uiRoot, 'README_cn.md'),
  join(repoRoot, 'README.md'),
  join(repoRoot, 'README_cn.md'),
  ...await filesUnder(join(repoRoot, 'docs')),
]

const problems = []
let checked = 0

for (const path of targets) {
  const source = await readFile(path, 'utf8').catch(() => null)
  if (source == null)
    continue
  const shown = path.replaceAll('\\', '/').slice(repoRoot.replaceAll('\\', '/').length + 1)
  for (const hit of source.matchAll(IMPORT)) {
    const pkg = hit[2]
    const line = source.slice(0, hit.index).split('\n').length
    const exported = surface[pkg]
    if (!exported) {
      problems.push(`${shown}:${line}  引了 ${pkg}，公开面基线里没有这个包`)
      continue
    }
    for (const name of importedNames(hit[1])) {
      checked++
      if (!exported.includes(name))
        problems.push(`${shown}:${line}  ${pkg} 没有导出 ${name}——照抄这段就是解析失败`)
    }
  }
}

if (problems.length) {
  console.error(`[check-doc-imports] ✗ 示例引了不存在的名字（${problems.length} 处）：`)
  for (const problem of problems)
    console.error(`  ${problem}`)
  console.error('\n改法：按包的 src/index.ts 或 tooling/public-surface.json 里的真名改正文；导出真的改过名就先跑 pnpm surface:update。')
  process.exit(1)
}

console.log(`[check-doc-imports] 通过：${targets.length} 份文本里 ${checked} 个导入名都在公开面里`)
