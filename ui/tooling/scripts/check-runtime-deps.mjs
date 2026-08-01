#!/usr/bin/env node
// 门禁：库包的运行时依赖只许是 workspace 内的兄弟包，第三方须逐条登记并写明理由。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const PACKAGES_DIR = 'packages'

// 加条目前先问它值不值一个长期维护面；理由要写清楚何时可以摘掉。
const ALLOWLIST = {
  '@xihan-ui/headless': {
    '@internationalized/date': '历法与时区运算；目标浏览器基线普遍支持 Temporal 后摘除',
  },
}

// 冻结的遗留包，重建前不纳入门禁。
const SKIP = new Set(['icons'])

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

const violations = []
const staleAllowlist = []

const entries = await readdir(PACKAGES_DIR, { withFileTypes: true })
for (const entry of entries) {
  if (!entry.isDirectory() || SKIP.has(entry.name))
    continue

  let pkg
  try {
    pkg = await readJson(join(PACKAGES_DIR, entry.name, 'package.json'))
  }
  catch {
    continue
  }

  const allowed = ALLOWLIST[pkg.name] ?? {}
  const deps = pkg.dependencies ?? {}

  for (const [dep, range] of Object.entries(deps)) {
    if (range.startsWith('workspace:'))
      continue
    if (dep in allowed)
      continue
    violations.push({ pkg: pkg.name, dep, range })
  }

  for (const dep of Object.keys(allowed)) {
    if (!(dep in deps))
      staleAllowlist.push({ pkg: pkg.name, dep })
  }
}

if (violations.length) {
  console.error('[check-runtime-deps] ✗ 库包出现未登记的第三方运行时依赖：')
  for (const v of violations)
    console.error(`  ${v.pkg} → ${v.dep}@${v.range}`)
  console.error('能自己实现的不引第三方；确需保留就登记进 tooling/scripts/check-runtime-deps.mjs 的 ALLOWLIST 并写明理由。')
  process.exit(1)
}

// 登记表里躺着已经摘掉的依赖，说明门禁在放行一个不存在的例外。
if (staleAllowlist.length) {
  console.error('[check-runtime-deps] ✗ ALLOWLIST 里有已经不存在的条目，删掉它：')
  for (const s of staleAllowlist)
    console.error(`  ${s.pkg} → ${s.dep}`)
  process.exit(1)
}

console.log('[check-runtime-deps] 通过：库包运行时依赖只有 workspace 兄弟包与登记在案的第三方')
