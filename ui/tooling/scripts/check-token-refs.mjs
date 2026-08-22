#!/usr/bin/env node
// 门禁：皮肤里引用的每一个全局令牌都必须在令牌产物里声明过。
// 孤儿引用不报错也不降级——整条声明在计算值阶段失效，那条样式就当没写过，
// 而 CSS 不会告诉任何人。toggle 的按下态就这么静默失效了很久。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'
const TOKENS_CSS = 'packages/design/tokens/tokens.css'

/** 组件私有槽：由皮肤自己声明或留给使用者覆盖，不在令牌产物里。 */
function isComponentSlot(name, declaredInStyles) {
  return name.startsWith('--xh-_') || declaredInStyles.has(name)
}

const tokensCss = await readFile(TOKENS_CSS, 'utf8')
const declared = new Set([...tokensCss.matchAll(/^\s*(--xh-[a-z0-9_-]+)\s*:/gm)].map(m => m[1]))

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css'))
const sources = new Map()
for (const f of files)
  sources.set(f, await readFile(join(STYLES_DIR, f), 'utf8'))

// 皮肤自己声明过的槽位（含组件级覆盖点）不算孤儿
const declaredInStyles = new Set()
for (const src of sources.values()) {
  for (const m of src.matchAll(/^\s*(--xh-[a-z0-9_-]+)\s*:/gm))
    declaredInStyles.add(m[1])
}

const orphans = []
const fallbacks = []
const garbage = []
const colors = []
/** 允许颜色字面量的皮肤：取色器的色相带画的是光谱，不是设计色。 */
const COLOR_LITERAL_OK = new Set(['color-picker.css'])
for (const [file, src] of sources) {
  const lines = src.split(/\r?\n/)
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/var\(\s*(--xh-[a-z0-9_-]+)/g)) {
      const name = m[1]
      if (declared.has(name) || isComponentSlot(name, declaredInStyles))
        continue
      // 组件级覆盖点的形状是 --xh-<组件名>-*，由使用者声明，缺省走兜底
      if (new RegExp(`^--xh-${file.replace(/\.css$/, '')}-`).test(name))
        continue
      orphans.push(`${file}:${i + 1}  ${name}`)
    }
    // 颜色一律走令牌：皮肤里不许出现 hex / rgb / hsl / oklch 字面量。取色器的色相带是光谱本身，不是设计色，放行。
    if (!COLOR_LITERAL_OK.has(file) && /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\(/i.test(line))
      colors.push(`${file}:${i + 1}  ${line.trim()}`)
    // 一轮扫齐两件事：全局令牌不许带字面量兜底，任何兜底里不许出现 $1 这类正则替换残留
    for (const m of line.matchAll(/var\(\s*(--xh-[a-z0-9_-]+)\s*,([^;()]*)\)/g)) {
      const [, name, fb] = m
      if (declared.has(name) && !fb.trim().startsWith('var('))
        fallbacks.push(`${file}:${i + 1}  ${name} 的兜底「${fb.trim()}」`)
      if (/[$\\]/.test(fb))
        garbage.push(`${file}:${i + 1}  ${name} 的兜底「${fb.trim()}」`)
    }
  })
}

if (colors.length) {
  console.error('[check-token-refs] ✗ 皮肤里写了颜色字面量：')
  for (const c of colors)
    console.error(`  ${c}`)
  console.error('颜色只从令牌来；语法高亮走 --xh-syntax-*，主题明暗由令牌层切换。')
}
if (orphans.length) {
  console.error('[check-token-refs] ✗ 皮肤引用了未声明的全局令牌：')
  for (const o of orphans)
    console.error(`  ${o}`)
  console.error('孤儿引用会让整条声明在计算值阶段失效，且不报任何错。')
}
if (fallbacks.length) {
  console.error('[check-token-refs] ✗ 全局令牌带了字面量兜底：')
  for (const f of fallbacks)
    console.error(`  ${f}`)
  console.error('删掉第二个参数即可——令牌是唯一事实源。')
}
if (garbage.length) {
  console.error('[check-token-refs] ✗ var() 兜底里混进了非 CSS 值：')
  for (const g of garbage)
    console.error(`  ${g}`)
  console.error('多半是正则替换的残留（$1 这类捕获组引用）。它让整条声明在计算期失效，且不报任何错。')
}
if (orphans.length || fallbacks.length || garbage.length || colors.length)
  process.exit(1)

console.log(`[check-token-refs] 通过：${files.length} 份皮肤的全局令牌都有声明、没有字面量兜底、没有颜色字面量`)
