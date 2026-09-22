#!/usr/bin/env node
// 列出当前检出登记的组件：标识、中文名、分类和正式状态。
// 用法：node list-components.mjs [关键词]

import { join } from 'node:path'
import process from 'node:process'
import { positional, readJson, repoRoot, run } from './lib/source.mjs'

await run(async () => {
  const root = await repoRoot()
  const manifestPath = join(root, 'ui', 'scripts', 'component-docs.manifest.json')
  const { value: manifest } = await readJson(manifestPath, '组件文档清单')
  const [rawKeyword] = positional(process.argv)
  const keyword = rawKeyword?.toLowerCase()
  // 清单条目缺省即正式；alpha / new / updated 逐条写在 status 上
  const rows = manifest.categories.flatMap(category => category.components.map(component => ({
    id: component.id,
    name: component.name,
    category: category.label,
    status: component.status ?? 'stable',
  }))).filter(row => !keyword
    || row.id.includes(keyword)
    || row.name.toLowerCase().includes(keyword)
    || row.category.toLowerCase().includes(keyword))

  process.stdout.write(`# 来源：${manifestPath}\n# 共 ${rows.length} 个\n`)
  process.stdout.write('标识\t中文名\t分类\t状态\n')
  for (const row of rows)
    process.stdout.write(`${row.id}\t${row.name}\t${row.category}\t${row.status}\n`)
})
