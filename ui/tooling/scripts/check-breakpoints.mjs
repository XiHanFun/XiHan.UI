#!/usr/bin/env node
// 门禁：皮肤里的断点字面量必须出自令牌清单。
//
// CSS 自定义属性在 @media 条件里不生效——`@media (min-width: var(--xh-breakpoint-md))`
// 是不成立的写法。所以断点只能在皮肤里写字面量，令牌那份清单管不住它。
// 这条门禁替代了 var() 的约束力：每个 @media 宽度条件里的值，都得在
// packages/system 的断点令牌里找得到，否则各写各的、迟早对不齐。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES = 'packages/styled/styles'
const TOKENS = 'packages/system/tokens.json'

/** 从令牌产物里取断点清单：`--xh-breakpoint-md` → `768px` */
async function declaredBreakpoints() {
  const tokens = JSON.parse(await readFile(TOKENS, 'utf8'))
  const out = new Map()
  for (const [name, value] of Object.entries(tokens)) {
    const m = /^--xh-breakpoint-([a-z0-9]+)$/.exec(name)
    if (m)
      out.set(String(value), m[1])
  }
  return out
}

// 只查宽度条件；forced-colors、prefers-reduced-motion、hover 这些不带长度，不在此列
const WIDTH_QUERY = /@media[^{]*?\((?:min|max)-width:\s*([^)]+)\)/g

const declared = await declaredBreakpoints()
if (declared.size === 0) {
  console.error('[check-breakpoints] 令牌里一个断点都没有，先在 packages/system 里声明')
  process.exit(1)
}

const offenders = []
for (const file of await readdir(STYLES)) {
  if (!file.endsWith('.css'))
    continue
  const css = await readFile(join(STYLES, file), 'utf8')
  for (const m of css.matchAll(WIDTH_QUERY)) {
    const value = m[1].trim()
    if (!declared.has(value))
      offenders.push(`${file}: ${value}`)
  }
}

if (offenders.length) {
  console.error('[check-breakpoints] 皮肤里的断点值不在令牌清单里：')
  for (const o of offenders) console.error(`  ${o}`)
  console.error(`  清单：${[...declared].map(([v, k]) => `${k}=${v}`).join(' · ')}`)
  process.exit(1)
}

console.log(
  `[check-breakpoints] 通过：断点只有 ${[...declared].map(([v, k]) => `${k}=${v}`).join(' · ')} 这几档，皮肤没有另起炉灶`,
)
