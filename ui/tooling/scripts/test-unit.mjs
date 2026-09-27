#!/usr/bin/env node
// 单测运行器：turbo 并行跑各包的 test，按核数给每个包的 vitest 定 worker 上限。
//
//   pnpm test                                  全部包
//   node tooling/scripts/test-unit.mjs --force 参数原样接在 turbo run test 后面，与原先直接跑 turbo 同一种写法
//   VITEST_MAX_WORKERS=8 pnpm test             显式给出每包 worker 数时不再推算
//
// 为什么要定上限：vitest 不在 watch 下缺省开「核数 - 1」个 worker，turbo 缺省同时跑十个任务，
// 全量时是十倍的超卖。冷启动的模块图（code-view 的可选着色要重执行整张图）、spawn 子进程的门禁用例
// 因此被拖过超时，超时的用例还在后台落地，又把下一条用例的断言带红。
// 这里让总 worker 数与核数相当：turbo 并发取 min(10, 核数)，每包 worker 取 max(1, ⌊核数 / 并发⌋)。
// 上限走 VITEST_MAX_WORKERS 而不是 --maxWorkers：turbo 把参数转给每个包的 test 脚本，
// 有的包不是 vitest（core 用 node --test），环境变量只有 vitest 认，别的运行器照旧。
// 这个变量只影响快慢、不影响结果，turbo.json 里登在 passThroughEnv，不进缓存哈希。
import { spawnSync } from 'node:child_process'
import { availableParallelism } from 'node:os'
import process from 'node:process'

const cores = availableParallelism()
const concurrency = Math.min(10, cores)
const workers = process.env.VITEST_MAX_WORKERS ?? String(Math.max(1, Math.floor(cores / concurrency)))

console.log(`[test] ${cores} 核：turbo 并发 ${concurrency}，每包 vitest worker 上限 ${workers}`)
// 经 pnpm exec 找 turbo：直接 node 调本脚本时 node_modules/.bin 不在 PATH 上
const result = spawnSync('pnpm', ['exec', 'turbo', 'run', 'test', `--concurrency=${concurrency}`, ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, VITEST_MAX_WORKERS: workers },
})
process.exit(result.status ?? 1)
