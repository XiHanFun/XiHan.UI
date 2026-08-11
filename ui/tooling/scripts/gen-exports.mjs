#!/usr/bin/env node
// 构建后按各包 dist 产物回写 package.json 的 exports 字段；缺 dist 的包跳过。
import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const PKG_DIR = 'packages'

async function exists(p) {
  try { await stat(p); return true }
  catch { return false }
}

/** packages/<角色组>/<包>：两级。按一级枚举一个包都找不到。 */
async function packageDirs() {
  const out = []
  for (const group of await readdir(PKG_DIR, { withFileTypes: true }).catch(() => [])) {
    if (!group.isDirectory())
      continue
    for (const leaf of await readdir(join(PKG_DIR, group.name), { withFileTypes: true })) {
      if (leaf.isDirectory())
        out.push(join(PKG_DIR, group.name, leaf.name))
    }
  }
  return out
}

const dirs = await packageDirs()
if (dirs.length === 0) {
  console.error(`[gen-exports] ✗ 一个包都没找到，${PKG_DIR}/ 的目录层级变了`)
  process.exit(1)
}

const dropped = []
let touched = 0
for (const dir of dirs) {
  const dist = join(dir, 'dist')
  if (!(await exists(dist)))
    continue
  const files = await readdir(dist)
  const subpaths = files.filter(f => f.endsWith('.js')).map(f => f.replace(/\.js$/, ''))
  if (subpaths.length === 0)
    continue
  const pkgJsonPath = join(dir, 'package.json')
  const pkg = JSON.parse(await readFile(pkgJsonPath, 'utf8'))
  // 主入口排在最前：exports 是有序的，`.` 落到别的子入口后面会让人读不出哪个是主入口
  const exportsMap = {}
  for (const sub of [...subpaths].sort((a, b) => (a === 'index' ? -1 : b === 'index' ? 1 : a.localeCompare(b)))) {
    const key = sub === 'index' ? '.' : `./${sub}`
    exportsMap[key] = { types: `./dist/${sub}.d.ts`, import: `./dist/${sub}.js` }
  }
  // 手写的子入口（皮肤的逐组件 CSS 之类）在 dist 里没有对应的 .js，整表覆盖会把它们抹掉
  const lost = Object.keys(pkg.exports ?? {}).filter(k => !(k in exportsMap))
  if (lost.length) {
    dropped.push(`${pkg.name}：${lost.join(' ')}`)
    continue
  }
  if (JSON.stringify(pkg.exports) === JSON.stringify(exportsMap))
    continue
  pkg.exports = exportsMap
  await writeFile(pkgJsonPath, `${JSON.stringify(pkg, null, 2)}\n`)
  touched++
}

if (dropped.length) {
  console.error('[gen-exports] ✗ 下列包按 dist 重算会丢掉已有子入口，已跳过、未写入：')
  for (const d of dropped)
    console.error(`  ${d}`)
  process.exit(1)
}

console.log(`[gen-exports] 更新 ${touched} 个包的 exports`)
