#!/usr/bin/env node
// 构建后按各包 dist 产物回写 package.json 的 exports 字段。
// M0：packages 下只有 icons（冻结）与暂未构建的包，脚本对缺失 dist 的包跳过、不报错。
import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const PKG_DIR = 'packages'

async function exists(p) {
  try { await stat(p); return true }
  catch { return false }
}

const pkgs = await readdir(PKG_DIR).catch(() => [])
let touched = 0
for (const name of pkgs) {
  const dist = join(PKG_DIR, name, 'dist')
  if (!(await exists(dist)))
    continue
  const files = await readdir(dist)
  const subpaths = files.filter(f => f.endsWith('.js')).map(f => f.replace(/\.js$/, ''))
  if (subpaths.length === 0)
    continue
  const pkgJsonPath = join(PKG_DIR, name, 'package.json')
  const pkg = JSON.parse(await readFile(pkgJsonPath, 'utf8'))
  const exportsMap = {}
  for (const sub of subpaths) {
    const key = sub === 'index' ? '.' : `./${sub}`
    exportsMap[key] = { types: `./dist/${sub}.d.ts`, import: `./dist/${sub}.js` }
  }
  pkg.exports = exportsMap
  await writeFile(pkgJsonPath, `${JSON.stringify(pkg, null, 2)}\n`)
  touched++
}
console.log(`[gen-exports] 更新 ${touched} 个包的 exports`)
