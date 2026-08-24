#!/usr/bin/env node
// 门禁：适配器里发出去的每一个 data-scope，都要有同名皮肤接着。
//
// data-scope 是「这个节点归某份皮肤管」的契约，开发模式的皮肤在场探测（startSkinCheck）
// 就按它逐个探 --xh-<scope>-skin 标记。发了 scope 而仓里根本没有那份皮肤时，
// 探测会给出一条**永远修不掉**的警告——使用者按提示去 import 也没有那个文件。
// 反过来，解剖里明明有皮肤却不发 scope，那份皮肤的规则一条都不会命中。
import { readdir, readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

const ADAPTERS = 'packages/adapters'
const STYLES_DIR = 'packages/design/styles/css'

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'tests')
      continue
    const full = join(dir, entry.name)
    if (entry.isDirectory())
      yield* walk(full)
    else if (['.ts', '.tsx'].includes(extname(entry.name)))
      yield full
  }
}

const skins = new Set((await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).map(f => f.replace(/\.css$/, '')))

const problems = []
const seen = new Map()
let scanned = 0

for await (const file of walk(ADAPTERS)) {
  scanned += 1
  const src = (await readFile(file, 'utf8')).replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
  src.split('\n').forEach((line, i) => {
    if (line.trim().startsWith('//'))
      return
    // 只认写死的字面量：经变量交进来的 scope 由解剖那一层负责
    for (const [, scope] of line.matchAll(/['"]data-scope['"]\s*:\s*['"]([a-z][a-z0-9-]*)['"]/g)) {
      if (!seen.has(scope))
        seen.set(scope, `${file.split('\\').join('/')}:${i + 1}`)
    }
  })
}

for (const [scope, where] of seen) {
  if (!skins.has(scope))
    problems.push(`${where}  发了 data-scope='${scope}'，而 styles/css 里没有 ${scope}.css——皮肤在场探测会报一条修不掉的警告`)
}

if (problems.length) {
  console.error('[check-scope-has-skin] ✗ scope 发了没人接：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  console.error('\n要么补上那份皮肤，要么别发 scope——不归皮肤管的宿主（features 的画布这类）不该冒充组件节点。')
  process.exit(1)
}

console.log(`[check-scope-has-skin] 通过：扫描 ${scanned} 个适配器源文件，${seen.size} 个写死的 data-scope 都有同名皮肤`)
