#!/usr/bin/env node
// 门禁：文档站的自定义元素版示例（docs/.vitepress/demos/<组件>/*.html）逐份在真实 Chromium 里挂一遍。
//
// 判据五条，由 packages/adapters/web-components/tests/demos/demos.spec.ts 执行：
//   元素升级 · 作者写的角色节点全被接线 · 必需部件齐备 · 控制台零 error · 脚本是 type="module"
//
// 用法：
//   node tooling/scripts/check-wc-demos.mjs                全部示例
//   node tooling/scripts/check-wc-demos.mjs select dialog   只跑这两个组件
//
// 本脚本只做筛选与转发；直接起 vitest 不经 turbo，示例文件不在 turbo 的输入集里，走缓存会拿到过期的绿。
import { spawnSync } from 'node:child_process'
import { readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const uiRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const demosDir = join(uiRoot, '..', 'docs', '.vitepress', 'demos')
const EXT = '.html'

const wanted = process.argv.slice(2).filter(arg => !arg.startsWith('-'))

/** 各组件目录下的自定义元素版示例文件名；没有示例的组件不进表。 */
async function collect() {
  const out = new Map()
  const dirs = (await readdir(demosDir, { withFileTypes: true }))
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort()
  for (const dir of dirs) {
    const files = (await readdir(join(demosDir, dir))).filter(file => file.endsWith(EXT)).sort()
    if (files.length > 0)
      out.set(dir, files)
  }
  return out
}

const available = await collect()

// 点名的组件一份示例都没有时直接报出来：让「验了个空」跟「验过了」分得开
const empty = wanted.filter(name => !available.has(name))
if (empty.length > 0) {
  console.error(`[check-wc-demos] ✗ 这些组件目录下没有 ${EXT} 示例：${empty.join('、')}`)
  process.exit(1)
}

const selected = wanted.length > 0 ? wanted : [...available.keys()]
const count = selected.reduce((sum, name) => sum + available.get(name).length, 0)
console.log(`[check-wc-demos] ${selected.length} 个组件 · ${count} 份示例`)

const result = spawnSync(
  'pnpm',
  ['--fail-if-no-match', '--filter', '@xihan-ui/web-components', 'test:demos'],
  {
    cwd: uiRoot,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, XH_WC_DEMOS: wanted.join(',') },
  },
)

process.exit(result.status ?? 1)
