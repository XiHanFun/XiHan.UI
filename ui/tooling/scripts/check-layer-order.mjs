#!/usr/bin/env node
// 门禁：层序声明在皮肤与令牌两份产物里逐字一致、在 tokens.css 里排在 @layer 块之前，
// 且两份入口里层序与令牌都排在任何样式规则之前。
import { readFile } from 'node:fs/promises'

const FILES = {
  layers: 'packages/design/styles/css/layers.css',
  tokens: 'packages/design/tokens/tokens.css',
}

/** 取第一条 `@layer a, b;` 声明语句，归一化空白后返回层名数组。 */
function statement(css) {
  const matched = css.match(/@layer\s([^;{}]+);/)
  return matched ? matched[1].split(',').map(name => name.trim()).filter(Boolean) : null
}

const errors = []
const orders = {}

for (const [key, file] of Object.entries(FILES)) {
  const css = await readFile(file, 'utf8')
  const order = statement(css)
  if (order === null)
    errors.push(`${file} 里没有 @layer 层序声明语句`)
  else
    orders[key] = order

  if (key === 'tokens') {
    const statementIndex = css.search(/@layer\s[^;{}]+;/)
    const blockIndex = css.search(/@layer\s[^;{}]+\{/)
    if (statementIndex !== -1 && blockIndex !== -1 && statementIndex > blockIndex)
      errors.push(`${file} 的层序声明排在 @layer 块之后`)
  }
}

// 两份入口开头的顺序：层序必须先声明，令牌必须排在任何样式规则之前。
//
// 这条守的是 index.css 里 @import 的次序。把某份皮肤插到 layers.css / 令牌之前，
// 有层版只是层序不再由首次出现定死；无层版要命得多——生成器按原序内联，令牌那条
// @import 一旦被样式规则挤到后面，按 CSS 规范整条失效，于是全部令牌取不到值，
// 每个组件同时失去底色、高度与圆角，而构建、门禁与测试全绿，没有任何地方报错。
const ENTRIES = {
  layered: 'packages/design/styles/index.css',
  unlayered: 'packages/design/styles/index.unlayered.css',
}

const layeredCss = await readFile(ENTRIES.layered, 'utf8')
const imports = [...layeredCss.matchAll(/^@import\s+['"]([^'"]+)['"];/gm)].map(m => m[1])
if (imports[0] !== './css/layers.css')
  errors.push(`${ENTRIES.layered} 的第一条 @import 是 ${imports[0] ?? '(没有)'}，层序声明必须打头`)
if (imports[1] !== '@xihan-ui/tokens/tokens.css')
  errors.push(`${ENTRIES.layered} 的第二条 @import 是 ${imports[1] ?? '(没有)'}，令牌必须紧随层序`)

const unlayeredCss = await readFile(ENTRIES.unlayered, 'utf8')
const tokenImportAt = unlayeredCss.search(/^@import\s+['"]@xihan-ui\/tokens/m)
if (tokenImportAt === -1) {
  errors.push(`${ENTRIES.unlayered} 里找不到令牌的 @import`)
}
else {
  // 它之前只许有注释、空行与 @layer / @charset 语句，出现选择器块就说明已经失效
  const before = unlayeredCss.slice(0, tokenImportAt).replace(/\/\*[\s\S]*?\*\//g, '')
  if (before.includes('{'))
    errors.push(`${ENTRIES.unlayered} 的令牌 @import 被样式规则挤到了后面，按规范会被整条忽略`)
}

if (orders.layers && orders.tokens && orders.layers.join(',') !== orders.tokens.join(','))
  errors.push(`层序不一致：\n    ${FILES.layers}  ${orders.layers.join(', ')}\n    ${FILES.tokens}  ${orders.tokens.join(', ')}`)

if (errors.length > 0) {
  console.error('[check-layer-order] ✗')
  for (const error of errors)
    console.error(`  ${error}`)
  console.error('层序由首次声明定死：任一入口被单独引用时都必须把完整层序摆出来。')
  process.exit(1)
}

console.log(`[check-layer-order] 通过：${orders.layers.join(' → ')}`)
