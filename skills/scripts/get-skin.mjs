#!/usr/bin/env node
// 打印当前检出的一份组件共享 CSS 皮肤。
// 用法：node get-skin.mjs <组件标识>

import { join } from 'node:path'
import process from 'node:process'
import { componentId, positional, readRequired, repoRoot, run } from './lib/source.mjs'

await run(async () => {
  const [rawId] = positional(process.argv)
  const id = componentId(rawId)
  const root = await repoRoot()
  const file = join(root, 'ui', 'packages', 'design', 'styles', 'css', `${id}.css`)
  const hit = await readRequired(file, `组件 ${id} 的共享皮肤`)

  process.stdout.write(`/* 来源：${hit.path} */\n${hit.text}`)
})
