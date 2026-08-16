#!/usr/bin/env node
// 门禁:tooling/scripts 里的每个 check-*.mjs 都必须接进 ui/package.json 的某个 script。
//
// 检查脚本的存在不等于检查在跑:写了不接线,gate 不会执行它,等于没写。这条元门禁把
// 「新增检查」与「接入流水线」焊在一起。其余门禁管库的公开面,这条管检查系统自己的完整性。
import { readdir, readFile } from 'node:fs/promises'

const SCRIPTS_DIR = 'tooling/scripts'
const ROOT_PKG = 'package.json'

const checks = (await readdir(SCRIPTS_DIR)).filter(name => name.startsWith('check-') && name.endsWith('.mjs'))
if (checks.length === 0) {
  console.error(`[check-wiring] ✗ 一个检查脚本都没扫到,${SCRIPTS_DIR}/ 目录层级变了`)
  process.exit(1)
}

const root = JSON.parse(await readFile(ROOT_PKG, 'utf8'))
const allScripts = Object.values(root.scripts ?? {}).join(' ')

const errors = []
for (const name of checks) {
  if (!allScripts.includes(name))
    errors.push(`${name} 没接进任何 pnpm script——写了却不跑,等于没写`)
}

// 反向:script 引用的检查文件必须存在,改名后残留的死引用在这里提前揪出
for (const ref of allScripts.matchAll(/check-[\w-]+\.mjs/g)) {
  if (!checks.includes(ref[0]))
    errors.push(`${ref[0]} 被 script 引用但文件不存在`)
}

if (errors.length > 0) {
  console.error('[check-wiring] ✗')
  for (const e of errors)
    console.error(`  ${e}`)
  process.exit(1)
}

console.log(`[check-wiring] 通过:${checks.length} 个检查脚本全部接入 script,script 里没有死引用`)
