#!/usr/bin/env node
// 门禁:库包锁步发版——任何一个包发新版本,全部一起发同一个号。
//
// 这是 docs/guide/versioning.md 的承诺:混装版本的后果不是编译错误而是运行时硬故障
// (wc 侧同一个 xh- 标签被两个版本注册会直接抛错)。此前这个承诺只靠自觉:改一个包的
// version 而不动其余 15 个,没有任何一条门禁会响。这条门禁把 version 字段本身变成
// 一致性的机械保证——新包进 packages/ 也必须并轨,否则同样失败。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const PKG_DIR = 'packages'

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

const byVersion = new Map()
for (const dir of await packageDirs()) {
  const pkg = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8'))
  if (!pkg.name.startsWith('@xihan-ui/'))
    continue
  const list = byVersion.get(pkg.version) ?? []
  list.push(pkg.name)
  byVersion.set(pkg.version, list)
}

// 空转保护:目录层级一变,按老路径枚举的门禁会一个包都扫不到却照样绿
if (byVersion.size === 0) {
  console.error(`[check-version-lock] ✗ 一个库包都没扫到,${PKG_DIR}/ 的目录层级变了`)
  process.exit(1)
}

if (byVersion.size !== 1) {
  console.error('[check-version-lock] ✗ 库包版本不一致,锁步发版被打破:')
  for (const [v, names] of byVersion)
    console.error(`  ${v}: ${names.join(', ')}`)
  process.exit(1)
}

const [[version, names]] = [...byVersion]
console.log(`[check-version-lock] 通过:${names.length} 个库包同版本 ${version}`)
