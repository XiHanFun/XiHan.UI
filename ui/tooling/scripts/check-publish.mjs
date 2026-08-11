#!/usr/bin/env node
// 门禁：逐个可发布包跑 publint 与 attw，校验产物契约（exports 条件、类型解析）。
import { execFileSync } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const PACKAGES_DIR = 'packages'

// 按包声明的支持面校验：ESM-only、engines node>=18，不提供 CJS，也不承诺 node10 的
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

/** packages/<角色组>/<包>：两级。收集所有带 package.json 的叶子目录。 */
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

const failed = []
const dirs = await packageDirs()
let checked = 0

for (const dir of dirs) {
  let pkg
  try {
    pkg = await readJson(join(dir, 'package.json'))
  }
  catch {
    continue
  }
  if (pkg.private)
    continue
  checked++

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

// 一个都没扫到就是错，不是通过。真发生过：包按角色分成两级目录之后，只走一层的
// 遍历一个包都匹配不上，门禁照常打印「通过」，连着两轮验证都被当成绿的。
// 「扫到 0 个」与「全部合格」在输出上分不开，正是这类假绿的根。
if (checked === 0) {
  console.error(`\n[check-publish] ✗ 一个可发布包都没扫到——${PACKAGES_DIR} 的层级变了就把这里的遍历一起改`)
  process.exit(1)
}

console.log(`\n[check-publish] 通过：${checked} 个可发布包的产物契约无问题`)
