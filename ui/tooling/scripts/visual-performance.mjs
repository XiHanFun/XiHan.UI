#!/usr/bin/env node
// REQ-039 的公开入口。容器编排复用像素基线运行器，避免两套镜像、挂载和缓存协议漂移。
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const runner = join(dirname(fileURLToPath(import.meta.url)), 'visual-baseline.mjs')
const run = spawnSync(process.execPath, [runner, '--performance', ...process.argv.slice(2)], { stdio: 'inherit' })

if (run.error) {
  console.error(`[visual-performance] ✗ 起不来容器运行器：${run.error.message}`)
  process.exit(1)
}

process.exit(run.status ?? 1)
