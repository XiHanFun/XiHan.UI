#!/usr/bin/env node
// 打印当前检出的全局设计令牌与语气槽，可按名字片段过滤。
// 用法：node get-tokens.mjs [名字片段]

import { join } from 'node:path'
import process from 'node:process'
import { positional, readJson, readRequired, repoRoot, run } from './lib/source.mjs'

await run(async () => {
  const root = await repoRoot()
  const tokenPath = join(root, 'ui', 'packages', 'design', 'tokens', 'tokens.json')
  const tonePath = join(root, 'ui', 'packages', 'design', 'styles', 'css', 'tone.css')
  const [{ value: tokens }, tone] = await Promise.all([
    readJson(tokenPath, '设计令牌'),
    readRequired(tonePath, '语气皮肤'),
  ])
  const [rawKeyword] = positional(process.argv)
  const keyword = rawKeyword?.toLowerCase()
  const rows = Object.entries(tokens).map(([name, value]) => ({
    name,
    value: typeof value === 'string' ? value : JSON.stringify(value),
    source: 'tokens',
  }))
  const toneNames = [...new Set(
    [...tone.text.matchAll(/^\s*(--xh-tone-[\w-]+):/gm)].map(match => match[1]),
  )].sort()
  for (const name of toneNames)
    rows.push({ name, value: '需由 data-tone 激活', source: 'tone.css' })

  const hits = rows.filter(row => !keyword || row.name.toLowerCase().includes(keyword))
  process.stdout.write(`# 来源：${tokenPath} + ${tonePath}\n# 共 ${hits.length} 支\n`)
  process.stdout.write('令牌\t值\t来源\n')
  for (const row of hits)
    process.stdout.write(`${row.name}\t${row.value}\t${row.source}\n`)
})
