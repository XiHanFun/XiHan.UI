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
  '@xihan-ui/vue': {
    vue: '适配器的宿主框架，由使用者自带；这个包存在的意义就是接它，摘不掉',
  },
}

// 第三方 peer 也要登记：使用者装它是本库要求的，与直接依赖同样是长期维护面。
const RUNTIME_FIELDS = ['dependencies', 'peerDependencies', 'optionalDependencies']

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

/** packages/<角色组>/<包>：两级。按一级枚举会一个包都扫不到，而且照常打印通过。 */
async function packageDirs() {
  const out = []
  for (const group of await readdir(PACKAGES_DIR, { withFileTypes: true })) {
    if (!group.isDirectory())
      continue
    for (const leaf of await readdir(join(PACKAGES_DIR, group.name), { withFileTypes: true })) {
      if (leaf.isDirectory())
        out.push(join(PACKAGES_DIR, group.name, leaf.name))
    }
  }
  return out
}

const violations = []
const staleAllowlist = []
let checked = 0

for (const dir of await packageDirs()) {
  let pkg
  try {
    pkg = await readJson(join(dir, 'package.json'))
  }
  catch {
    continue
  }
  checked++

  const allowed = ALLOWLIST[pkg.name] ?? {}
  const deps = Object.fromEntries(RUNTIME_FIELDS.flatMap(f => Object.entries(pkg[f] ?? {})))

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

// 目录层级一变，按老路径枚举的门禁会一个包都扫不到却照样绿；这条挡住那种空转
if (checked === 0) {
  console.error(`[check-runtime-deps] ✗ 一个包都没扫到，${PACKAGES_DIR}/ 的目录层级变了`)
  process.exit(1)
}

console.log(`[check-runtime-deps] 通过：${checked} 个库包的运行时依赖只有 workspace 兄弟包与登记在案的第三方`)
