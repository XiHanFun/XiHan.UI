#!/usr/bin/env node
// 门禁：层序声明在皮肤与令牌两份产物里逐字一致，且在 tokens.css 里排在 @layer 块之前。
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
