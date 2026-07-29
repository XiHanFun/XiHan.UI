#!/usr/bin/env node
// 门禁：库包（packages/*）的运行时 dependencies 只允许 catalog: 或 workspace: 引用，不得内联版本号。
import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

const PKG_DIR = 'packages'
const ALLOWED = new Set(['catalog:', 'workspace:*'])

async function exists(p) {
  try { await stat(p); return true }
  catch { return false }
}

const pkgs = await readdir(PKG_DIR).catch(() => [])
const violations = []
for (const name of pkgs) {
  const pkgJsonPath = join(PKG_DIR, name, 'package.json')
  if (!(await exists(pkgJsonPath)))
    continue
  const pkg = JSON.parse(await readFile(pkgJsonPath, 'utf8'))
  for (const field of ['dependencies', 'peerDependencies']) {
    for (const [dep, range] of Object.entries(pkg[field] ?? {})) {
      const ok = ALLOWED.has(range) || range.startsWith('workspace:')
      if (!ok)
        violations.push(`${name} → ${field}.${dep} = "${range}"（应为 catalog: 或 workspace:）`)
    }
  }
}

if (violations.length) {
  console.error('[check-exact-pins] 发现内联版本号：')
  for (const v of violations) console.error(`  ✗ ${v}`)
  process.exit(1)
}
console.log('[check-exact-pins] 通过：所有库包依赖均走 catalog/workspace')
