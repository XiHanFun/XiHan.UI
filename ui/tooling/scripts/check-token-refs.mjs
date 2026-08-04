#!/usr/bin/env node
// 门禁：皮肤里引用的每一个全局令牌都必须在令牌产物里声明过。
// 孤儿引用不报错也不降级——整条声明在计算值阶段失效，那条样式就当没写过，
// 而 CSS 不会告诉任何人。toggle 的按下态就这么静默失效了很久。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/styled/styles'
const TOKENS_CSS = 'packages/system/tokens.css'

/** 组件私有槽：由皮肤自己声明或留给使用者覆盖，不在令牌产物里。 */
function isComponentSlot(name, declaredInStyles) {
  return name.startsWith('--xh-_') || declaredInStyles.has(name)
}

const tokensCss = await readFile(TOKENS_CSS, 'utf8')
const declared = new Set([...tokensCss.matchAll(/^\s*(--xh-[a-z0-9-]+)\s*:/gm)].map(m => m[1]))

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css'))
const sources = new Map()
for (const f of files)
  sources.set(f, await readFile(join(STYLES_DIR, f), 'utf8'))

// 皮肤自己声明过的槽位（含组件级覆盖点）不算孤儿
const declaredInStyles = new Set()
for (const src of sources.values()) {
  for (const m of src.matchAll(/^\s*(--xh-[a-z0-9-]+)\s*:/gm))
    declaredInStyles.add(m[1])
}

const orphans = []
for (const [file, src] of sources) {
  const lines = src.split(/\r?\n/)
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/var\(\s*(--xh-[a-z0-9-]+)/g)) {
      const name = m[1]
      if (declared.has(name) || isComponentSlot(name, declaredInStyles))
        continue
      // 组件级覆盖点的形状是 --xh-<组件名>-*，由使用者声明，缺省走兜底
      if (new RegExp(`^--xh-${file.replace(/\.css$/, '')}-`).test(name))
        continue
      orphans.push(`${file}:${i + 1}  ${name}`)
    }
  })
}

if (orphans.length) {
  console.error('[check-token-refs] ✗ 皮肤引用了未声明的全局令牌：')
  for (const o of orphans)
    console.error(`  ${o}`)
  console.error('孤儿引用会让整条声明在计算值阶段失效，且不报任何错。')
  process.exit(1)
}
console.log(`[check-token-refs] 通过：${files.length} 份皮肤引用的全局令牌都有声明`)
