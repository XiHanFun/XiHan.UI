#!/usr/bin/env node
// 打印当前检出的一份组件参考页。
// 用法：node get-component-docs.mjs <组件标识>

import { join } from 'node:path'
import process from 'node:process'
import { componentId, positional, readRequired, repoRoot, run } from './lib/source.mjs'

await run(async () => {
  const [rawId] = positional(process.argv)
  const id = componentId(rawId)
  const root = await repoRoot()
  const file = join(root, 'docs', 'components', `${id}.md`)
  const hit = await readRequired(file, `组件 ${id} 的参考页`)

  process.stdout.write(`<!-- 来源：${hit.path} -->\n${hit.text}`)
})
