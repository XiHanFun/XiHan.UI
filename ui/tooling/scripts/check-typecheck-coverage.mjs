#!/usr/bin/env node
// 门禁：工作区里每一份 TS 源文件都要被某个真会跑的 tsc 吃到。
//
// `pnpm typecheck` 只跑各包 typecheck 脚本点名的那些 project。一份 .ts 只要不在任何一个
// project 的 include 里，tsc 就永远看不到它，全仓 typecheck 照样全绿——绿的是"没人看"，
// 不是"没有错"。构建配置、vitest 配置、放在 tests/ 之外的用例都是这么漏掉的。
//
// 判据：
//   1. 各包 typecheck 脚本里 `-p` 点名的 project，加上根 typecheck 跑的 tsconfig.node.json，
//      合起来要盖住 packages/*/* 与 tooling/* 下每一份 .ts / .tsx / .mts / .cts；
//   2. 根 package.json 的 typecheck 脚本要真的跑 tsconfig.node.json，否则上面那条的第二半是空的。
//
// .d.ts 不算：base.json 开着 skipLibCheck，声明文件进了 project 也不做检查。
// 没有豁免表——漏了就补 include 或补 project，不许登记。
import { readFile } from 'node:fs/promises'
import { join, posix } from 'node:path'
import process from 'node:process'
import { exists, listFiles, listPackages, matchesAny, projectsOf, readJson } from './lib/tsconfig.mjs'

const ROOT_NODE_PROJECT = 'tsconfig.node.json'
const SKIP_DIRS = new Set(['node_modules', 'dist', '.turbo', 'coverage', '.vitest-attachments'])
const SOURCE = /\.(?:ts|tsx|mts|cts)$/
const DECLARATION = /\.d\.(?:ts|mts|cts)$/

const problems = []

const rootPkg = JSON.parse(await readFile('package.json', 'utf8'))
const rootScript = rootPkg.scripts?.typecheck ?? ''
const rootRuns = rootScript.includes(`-p ${ROOT_NODE_PROJECT}`)
if (!rootRuns) {
  problems.push(
    `package.json:1 —— 根 typecheck 脚本 ${JSON.stringify(rootScript)} 没跑 ${ROOT_NODE_PROJECT}，`
    + `各包 project 之外的那些文件没人检查`,
  )
}

// 根的 node project 用仓库根相对路径写 include，逐包判定时要拿同样的路径去比。
// 脚本没真跑它就一份都不算，免得配了不跑也判绿。
const rootNode = rootRuns && await exists(ROOT_NODE_PROJECT) ? await readJson(ROOT_NODE_PROJECT) : null
const rootInclude = rootNode?.include ?? []
const rootExclude = rootNode?.exclude ?? []

let checkedFiles = 0
const uncovered = []

for (const dir of await listPackages()) {
  const pkg = await readJson(posix.join(dir, 'package.json'))
  const files = (await listFiles(dir, '', SKIP_DIRS))
    .filter(f => SOURCE.test(f) && !DECLARATION.test(f))
  if (!files.length)
    continue

  // 该包 typecheck 真会跑到的那些 project 的 include / exclude
  const include = []
  const exclude = []
  for (const project of projectsOf(pkg.scripts?.typecheck)) {
    const path = join(dir, project)
    if (!await exists(path))
      continue
    const config = await readJson(path)
    include.push(...(config.include ?? ['**/*']))
    exclude.push(...(config.exclude ?? []))
  }

  for (const file of files) {
    const inPackage = include.length && matchesAny(include, file) && !matchesAny(exclude, file)
    const fromRoot = posix.join(dir, file)
    const inRoot = rootInclude.length && matchesAny(rootInclude, fromRoot) && !matchesAny(rootExclude, fromRoot)
    if (inPackage || inRoot)
      checkedFiles++
    else
      uncovered.push(fromRoot)
  }
}

if (uncovered.length) {
  const byPackage = new Map()
  for (const file of uncovered) {
    const key = file.split('/').slice(0, file.startsWith('tooling/') ? 2 : 3).join('/')
    byPackage.set(key, [...(byPackage.get(key) ?? []), file])
  }
  for (const [key, files] of [...byPackage].sort()) {
    problems.push(
      `${key}/package.json:1 —— ${files.length} 份 TS 不在任何一个会跑的 project 里：${
        files.map(f => `\n      ${f}`).join('')}`,
    )
  }
}

if (problems.length) {
  console.error('[check-typecheck-coverage] ✗ 有 TS 源文件没进类型检查：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error(
    `\n  改法：把文件补进本包某个 project 的 include，`
    + `构建与测试配置这类包外围的写进根的 ${ROOT_NODE_PROJECT}。`,
  )
  process.exit(1)
}

console.log(
  `[check-typecheck-coverage] 通过：${checkedFiles} 份 TS 源文件全部在 tsc 的检查面内`
  + `（.d.ts 不计——skipLibCheck 开着，进了也不查）`,
)
