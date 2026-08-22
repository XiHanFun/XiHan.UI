#!/usr/bin/env node
// 门禁：减弱动效只有一条探测通道。
//
// 应用级 override（setMotionOverride）只有 @xihan-ui/motion 的 resolveMotionPreference 看得见；
// 谁自己去 matchMedia('(prefers-reduced-motion: reduce)') 就绕开了它——作者在配置里写了
// motion: 'reduce'，这一处照样转、照样滚。所以系统偏好的探测只允许写在 motion 包的
// reduced-motion.ts 里，其余源码一律经它读。
import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

const PACKAGES = 'packages'
const ALLOWED = 'packages/engine/motion/src/reduced-motion.ts'
const PATTERN = /matchMedia\(\s*['"`]\(prefers-reduced-motion/g
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
let allowedHits = 0
for (const file of files) {
  const text = await readFile(file, 'utf8')
  const hits = [...text.matchAll(PATTERN)]
  if (hits.length === 0)
    continue
  const normalized = file.replaceAll('\\', '/')
  if (normalized === ALLOWED) {
    allowedHits += hits.length
    continue
  }
  for (const hit of hits) {
    const line = text.slice(0, hit.index).split('\n').length
    offenders.push(`${normalized}:${line}`)
  }
}

if (allowedHits === 0) {
  console.error(`[check-reduced-motion-channel] ${ALLOWED} 里没有 prefers-reduced-motion 探测，通道本身不见了`)
  process.exit(1)
}

if (offenders.length) {
  console.error('[check-reduced-motion-channel] 以下位置自己探测 prefers-reduced-motion，绕开了 resolveMotionPreference：')
  for (const o of offenders) console.error(`  ${o}`)
  console.error('  改用 @xihan-ui/motion 的 resolveMotionPreference / onMotionPreferenceChange')
  process.exit(1)
}

console.log(`[check-reduced-motion-channel] 通过：扫描 ${files.length} 个源码文件，prefers-reduced-motion 探测只在 ${ALLOWED}`)
