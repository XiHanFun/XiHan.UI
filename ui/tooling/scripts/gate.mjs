#!/usr/bin/env node
// gate 运行器：按 gate.modules.mjs 的清单逐模块、逐步串行跑结构门禁。
//
//   pnpm gate                      全部模块，遇到第一处失败即停（与原来的 && 串同一语义，CI 用这条）
//   pnpm gate overlay motion       只跑点名的模块，按清单里的先后
//   pnpm gate --list               列出模块、中文名与步数
//   pnpm gate --keep-going [模块…] 失败不停，跑完再汇总哪些步红了
//
// 每一步都是独立子进程、跑完才起下一步，不并发：门禁脚本各自要读整份皮肤或整棵源码树，
// 一起起会把内存与磁盘占满。
import { spawnSync } from 'node:child_process'
import process from 'node:process'
import { MODULES } from './gate.modules.mjs'

const argv = process.argv.slice(2)
const flags = new Set(argv.filter(arg => arg.startsWith('--')))
const picked = argv.filter(arg => !arg.startsWith('--'))

const KNOWN_FLAGS = new Set(['--list', '--keep-going', '--help'])
const unknownFlags = [...flags].filter(flag => !KNOWN_FLAGS.has(flag))
if (unknownFlags.length > 0) {
  console.error(`[gate] ✗ 不认识的参数：${unknownFlags.join(' ')}（可用：${[...KNOWN_FLAGS].join(' ')}）`)
  process.exit(2)
}

if (flags.has('--help')) {
  console.log('用法：pnpm gate [模块…] [--keep-going] | pnpm gate --list')
  process.exit(0)
}

if (flags.has('--list')) {
  const width = Math.max(...MODULES.map(module => module.id.length))
  for (const module of MODULES)
    console.log(`${module.id.padEnd(width)}  ${String(module.steps.length).padStart(3)} 步  ${module.label}`)
  console.log(`${'合计'.padEnd(width - 1)}  ${String(MODULES.reduce((sum, module) => sum + module.steps.length, 0)).padStart(3)} 步`)
  process.exit(0)
}

const byId = new Map(MODULES.map(module => [module.id, module]))
const unknown = picked.filter(id => !byId.has(id))
if (unknown.length > 0) {
  console.error(`[gate] ✗ 没有这个模块：${unknown.join(' ')}`)
  console.error(`  可选：${MODULES.map(module => module.id).join(' ')}（pnpm gate --list 看每个模块管什么）`)
  process.exit(2)
}

// 点名时仍按清单先后跑，与命令行里写的顺序无关
const chosen = picked.length > 0 ? MODULES.filter(module => picked.includes(module.id)) : MODULES
const keepGoing = flags.has('--keep-going')
const failures = []
const started = performance.now()
let ran = 0

for (const module of chosen) {
  console.log(`\n[gate] ── ${module.id} · ${module.label}（${module.steps.length} 步）`)
  for (const step of module.steps) {
    const run = spawnSync(step, { shell: true, stdio: 'inherit' })
    ran++
    const code = run.status ?? 1
    if (code === 0)
      continue
    failures.push({ module: module.id, step, code })
    if (!keepGoing) {
      console.error(`\n[gate] ✗ ${module.id} 模块的这一步没过：${step}`)
      console.error(`  修好后可以只重跑这个模块：pnpm gate ${module.id}`)
      process.exit(code)
    }
  }
}

const seconds = ((performance.now() - started) / 1000).toFixed(1)
const scope = picked.length > 0 ? chosen.map(module => module.id).join(' ') : `全部 ${chosen.length} 个模块`
if (failures.length > 0) {
  console.error(`\n[gate] ✗ ${scope}：${ran} 步里 ${failures.length} 步没过（${seconds}s）`)
  for (const failure of failures)
    console.error(`  [${failure.module}] ${failure.step}`)
  process.exit(1)
}
console.log(`\n[gate] ✓ ${scope}：${ran} 步全部通过（${seconds}s）`)
