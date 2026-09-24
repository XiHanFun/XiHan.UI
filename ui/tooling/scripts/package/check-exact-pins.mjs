#!/usr/bin/env node
// 门禁：库包（packages/*）的运行时 dependencies 只允许 catalog: 或 workspace: 引用，不得内联版本号。
import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

const PKG_DIR = 'packages'
const ALLOWED = new Set(['catalog:'])

async function exists(p) {
  try { await stat(p); return true }
  catch { return false }
}

/** packages/<角色组>/<包>：两级。按一级枚举会一个包都扫不到，而且照常打印通过。 */
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

const violations = []
let checked = 0
for (const dir of await packageDirs()) {
  const pkgJsonPath = join(dir, 'package.json')
  if (!(await exists(pkgJsonPath)))
    continue
  const pkg = JSON.parse(await readFile(pkgJsonPath, 'utf8'))
  checked++
  for (const field of ['dependencies', 'optionalDependencies']) {
    for (const [dep, range] of Object.entries(pkg[field] ?? {})) {
      const ok = ALLOWED.has(range) || range.startsWith('workspace:')
      if (!ok)
        violations.push(`${pkg.name} → ${field}.${dep} = "${range}"（应为 catalog: 或 workspace:）`)
    }
  }
  // 第三方 peer 写显式区间：它宣告的是对使用者的支持下限，与开发锁定的版本是两件事，
  // 走 catalog 会把开发锁当成承诺发出去。兄弟包的 peer 仍须 workspace:，由发布时展开
  for (const [dep, range] of Object.entries(pkg.peerDependencies ?? {})) {
    if (dep.startsWith('@xihan-ui/')) {
      if (!range.startsWith('workspace:'))
        violations.push(`${pkg.name} → peerDependencies.${dep} = "${range}"（兄弟包应为 workspace:）`)
    }
    else if (range.startsWith('catalog:') || range.startsWith('workspace:')) {
      violations.push(`${pkg.name} → peerDependencies.${dep} = "${range}"（第三方 peer 应写显式区间，别把开发锁发出去）`)
    }
  }
}

if (violations.length) {
  console.error('[check-exact-pins] 发现内联版本号：')
  for (const v of violations) console.error(`  ✗ ${v}`)
  process.exit(1)
}

// 目录层级一变，按老路径枚举的门禁会一个包都扫不到却照样绿；这条挡住那种空转
if (checked === 0) {
  console.error(`[check-exact-pins] ✗ 一个包都没扫到，${PKG_DIR}/ 的目录层级变了`)
  process.exit(1)
}

console.log(`[check-exact-pins] 通过：${checked} 个库包的依赖均走 catalog/workspace`)
