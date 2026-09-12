#!/usr/bin/env node
// 门禁：减弱动效只有两处基础层系统信号源。
//
// motion 包不能依赖同为 level 1 的 design/tokens：前者维护 JS override/Presence 通道，后者维护
// VisualEnvironmentController 的七轴 DOM/父作用域解析。两处各自持有一个系统信号源，应用根再经
// 显式 motionSink 汇合；适配器与组件不得出现第三份探测。
import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

const PACKAGES = 'packages'
const ALLOWED = new Set([
  'packages/design/tokens/src/runtime/env.ts',
  'packages/engine/motion/src/reduced-motion.ts',
])
const PATTERN = /\(prefers-reduced-motion:/g
const EXT = /\.(?:ts|tsx|js|mjs|vue)$/

/** 递归收集 packages/<组>/<包>/src 下的源码文件。 */
async function collect(dir, out) {
  for (const entry of await readdir(dir)) {
    if (entry === 'node_modules' || entry === 'dist')
      continue
    const path = join(dir, entry)
    const info = await stat(path)
    if (info.isDirectory())
      await collect(path, out)
    else if (EXT.test(entry))
      out.push(path)
  }
}

const files = []
for (const group of await readdir(PACKAGES)) {
  const groupDir = join(PACKAGES, group)
  if (!(await stat(groupDir)).isDirectory())
    continue
  for (const pkg of await readdir(groupDir)) {
    const src = join(groupDir, pkg, 'src')
    try {
      if ((await stat(src)).isDirectory())
        await collect(src, files)
    }
    catch {}
  }
}

const offenders = []
const allowedHits = new Map([...ALLOWED].map(file => [file, 0]))
for (const file of files) {
  const text = await readFile(file, 'utf8')
  const hits = [...text.matchAll(PATTERN)]
  if (hits.length === 0)
    continue
  const normalized = file.replaceAll('\\', '/')
  if (ALLOWED.has(normalized)) {
    allowedHits.set(normalized, hits.length)
    continue
  }
  for (const hit of hits) {
    const line = text.slice(0, hit.index).split('\n').length
    offenders.push(`${normalized}:${line}`)
  }
}

const missing = [...allowedHits].filter(([, hits]) => hits === 0).map(([file]) => file)
if (missing.length) {
  console.error(`[check-reduced-motion-channel] 基础系统信号源缺失：${missing.join('、')}`)
  process.exit(1)
}

if (offenders.length) {
  console.error('[check-reduced-motion-channel] 以下位置新增了第三份 prefers-reduced-motion 信号源：')
  for (const o of offenders) console.error(`  ${o}`)
  console.error('  JS 行为改用 @xihan-ui/motion；DOM 视觉环境改用 @xihan-ui/tokens/runtime')
  process.exit(1)
}

console.log(`[check-reduced-motion-channel] 通过：扫描 ${files.length} 个源码文件，系统信号只在 ${[...ALLOWED].join('、')}`)
