#!/usr/bin/env node
// 门禁：逐个可发布包跑 publint 与 attw，校验产物契约（exports 条件、类型解析）。
import { execFileSync } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const PACKAGES_DIR = 'packages'

// 按包声明的支持面校验：ESM-only、engines node>=24，不提供 CJS，也不承诺 node10 的
// 旧式解析（它不认 exports，子路径一律解析失败）。profile 收窄到 esm-only 后
// 校验的是 node16-from-ESM 与 bundler 两列。
const ATTW_PROFILE = 'esm-only'

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

// attw 解析不了纯资源子路径（CSS 里没有类型也没有 JS），按 exports 自动摘掉。
function assetEntrypoints(pkg) {
  const out = []
  for (const key of Object.keys(pkg.exports ?? {})) {
    if (/\.(?:css|json)$/.test(key))
      out.push(key.replace(/^\.\//, ''))
  }
  return out
}

function run(cmd, args, cwd) {
  try {
    execFileSync(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' })
    return true
  }
  catch {
    return false
  }
}

const failed = []
const entries = await readdir(PACKAGES_DIR, { withFileTypes: true })

for (const entry of entries) {
  if (!entry.isDirectory())
    continue
  const dir = join(PACKAGES_DIR, entry.name)

  let pkg
  try {
    pkg = await readJson(join(dir, 'package.json'))
  }
  catch {
    continue
  }
  if (pkg.private)
    continue

  console.log(`\n── ${pkg.name} ──`)

  if (!run('publint', ['--strict'], dir))
    failed.push(`${pkg.name} (publint)`)

  const attwArgs = ['--pack', '.', '--profile', ATTW_PROFILE]
  for (const ep of assetEntrypoints(pkg))
    attwArgs.push('--exclude-entrypoints', ep)
  if (!run('attw', attwArgs, dir))
    failed.push(`${pkg.name} (attw)`)
}

if (failed.length) {
  console.error(`\n[check-publish] ✗ 产物契约不通过：${failed.join('、')}`)
  process.exit(1)
}
console.log('\n[check-publish] 通过：全部可发布包的产物契约无问题')
