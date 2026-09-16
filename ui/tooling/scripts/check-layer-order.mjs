#!/usr/bin/env node
// 门禁：层序声明在皮肤与令牌两份产物里逐字一致、在 tokens.css 里排在 @layer 块之前，
// 两份入口里层序与令牌都排在任何样式规则之前，且 reset 层全部选择器为 (0,0,0)——
// 无层产物里配方排在 reset 之前，reset 只有低一档才不会靠源序压掉配方的字号。
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

// 聚焦环公共层排在全部组件皮肤之前：它与组件皮肤同特指度（0,3,0），同层内靠源序定胜负。
// 一旦被某份皮肤挤到后面，那份皮肤要另画环的规则就压不过公共层，而两边取值都合法、
// 门禁与构建全绿，只有真去 Tab 一遍才看得出环没变。
const focusAt = imports.indexOf('./css/focus.css')
if (focusAt === -1)
  errors.push(`${ENTRIES.layered} 里找不到 ./css/focus.css 的 @import——聚焦环公共层没被引入`)
else if (focusAt !== 2)
  errors.push(`${ENTRIES.layered} 的第三条 @import 是 ${imports[2] ?? '(没有)'}，聚焦环公共层必须紧随令牌、排在全部组件皮肤之前`)

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

// reset 层特指度压到 (0,0,0)：无层产物里没有层序可依，只按特指度竞争。Family Recipe 的
// 根规则（[data-xh-action-control] 一类，(0,1,0)）在产物里排在 reset 段之前；reset 若仍是
// (0,1,0)，其 `font: inherit` 就靠源序压掉配方的三档字号——文档站 Button 无论 sm/md/lg
// 全是 16px，而有层产物、单测与其余门禁全绿。修法是压低 reset，不是抬高配方：reset 层的
// 每条选择器剥去伪元素后必须整个由 :where() 包住。伪元素自身带 (0,0,1)，无法再低。
const RESET = 'packages/design/styles/css/reset.css'
const RESET_MARKER = '/* styles/reset.css */'
const FAMILY_ROOTS = ['[data-xh-action-control]', '[data-xh-field-chrome]', '[data-xh-collection-item]']

/** 去掉块注释，避免注释里的花括号与选择器示例混进解析。 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

/** 从 `{` 出发找到配对的 `}`。 */
function matchBrace(css, open) {
  let depth = 0
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{')
      depth++
    else if (css[i] === '}' && --depth === 0)
      return i
  }
  return -1
}

/** 按括号外的逗号拆选择器列表：`:where(button, input)` 里的逗号不是分隔。 */
function splitSelectorList(prelude) {
  const out = []
  let depth = 0
  let current = ''
  for (const char of prelude) {
    if (char === '(')
      depth++
    else if (char === ')')
      depth--
    if (char === ',' && depth === 0) {
      out.push(current)
      current = ''
      continue
    }
    current += char
  }
  out.push(current)
  return out.map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean)
}

/** 取一段 CSS 里全部顶层规则的选择器；跳过 @ 规则本身，只看样式规则。 */
function selectorsOf(css) {
  const out = []
  let i = 0
  while (i < css.length) {
    const brace = css.indexOf('{', i)
    if (brace === -1)
      break
    const close = matchBrace(css, brace)
    if (close === -1)
      break
    const prelude = css.slice(i, brace).trim()
    if (!prelude.startsWith('@'))
      out.push(...splitSelectorList(prelude))
    i = close + 1
  }
  return out
}

/**
 * 剥去伪元素后，选择器是否整个由 :where() 包住（即 (0,0,0)）。
 * 伪元素后面只允许跟用户动作伪类（Selectors 4 §3.6：hover / active / focus 一族），
 * 它们只匹配伪元素本身（`::-webkit-scrollbar-thumb:hover` 是滑块被悬停，不是宿主元素被悬停），
 * 与配方、皮肤在真实元素上的规则互不竞争，随伪元素一起剥掉。
 */
function isZeroSpecificity(selector) {
  let rest = selector.replace(/::[\w-]+(\([^()]*\))?(?::(?:hover|active|focus|focus-visible|focus-within))*/g, '')
  let previous
  do {
    previous = rest
    rest = rest.replace(/:where\([^()]*\)/g, '')
  } while (rest !== previous)
  return /^[\s>+~*]*$/.test(rest)
}

const resetCss = await readFile(RESET, 'utf8')
const resetBlockAt = resetCss.search(/@layer\s+xihan\.reset\s*\{/)
if (resetBlockAt === -1) {
  errors.push(`${RESET} 里找不到 @layer xihan.reset 块`)
}
else {
  const open = resetCss.indexOf('{', resetBlockAt)
  const close = matchBrace(resetCss, open)
  const resetSelectors = selectorsOf(stripComments(resetCss.slice(open + 1, close)))
  if (resetSelectors.length === 0)
    errors.push(`${RESET} 的 @layer xihan.reset 块里没有任何样式规则`)
  for (const selector of resetSelectors) {
    if (!isZeroSpecificity(selector))
      errors.push(`${RESET} 的选择器 \`${selector}\` 没有整个由 :where() 包住：reset 层必须是 (0,0,0)，否则无层产物里 reset 会压掉配方字号`)
  }

  // 无层产物里的同一段：配方在前、reset 在后、但 reset 更低。
  const markerAt = unlayeredCss.indexOf(RESET_MARKER)
  if (markerAt === -1) {
    errors.push(`${ENTRIES.unlayered} 里找不到 ${RESET_MARKER} 段——reset 没被内联进无层产物`)
  }
  else {
    const segmentStart = markerAt + RESET_MARKER.length
    const nextMarkerAt = unlayeredCss.slice(segmentStart).search(/\n\/\* (?:styles|family)\/[\w-]+\.css \*\//)
    const segment = unlayeredCss.slice(segmentStart, nextMarkerAt === -1 ? unlayeredCss.length : segmentStart + nextMarkerAt)
    const unlayeredSelectors = selectorsOf(stripComments(segment))
    if (unlayeredSelectors.length !== resetSelectors.length)
      errors.push(`${ENTRIES.unlayered} 的 reset 段有 ${unlayeredSelectors.length} 条选择器，源文件有 ${resetSelectors.length} 条——先跑 pnpm --filter @xihan-ui/styles gen`)
    for (const selector of unlayeredSelectors) {
      if (!isZeroSpecificity(selector))
        errors.push(`${ENTRIES.unlayered} 的 reset 段选择器 \`${selector}\` 不是 (0,0,0)：无层产物里 reset 会压掉配方字号`)
    }

    const before = unlayeredCss.slice(0, markerAt)
    for (const root of FAMILY_ROOTS) {
      const rule = `\n${root} {`
      if (!unlayeredCss.includes(rule))
        errors.push(`${ENTRIES.unlayered} 里找不到配方根规则 \`${root}\`——无层产物没把 Family Recipe 内联进来`)
    }
    // 现状只有 action-control 内联在 reset 之前（field-chrome / collection-item 的首个消费者
    // 在 index.css 里排在 reset.css 之后）；这条守的正是「配方在前、reset 在后」的失效场景真实存在。
    if (!before.includes(`\n${FAMILY_ROOTS[0]} {`))
      errors.push(`${ENTRIES.unlayered} 里 \`${FAMILY_ROOTS[0]}\` 根规则没有排在 reset 段之前——配方与 reset 的先后变了，重新核对特指度取舍`)
  }
}

if (errors.length > 0) {
  console.error('[check-layer-order] ✗')
  for (const error of errors)
    console.error(`  ${error}`)
  console.error('层序由首次声明定死：任一入口被单独引用时都必须把完整层序摆出来。')
  process.exit(1)
}

console.log(`[check-layer-order] 通过：${orders.layers.join(' → ')}；reset 层 (0,0,0)，无层产物里配方先于 reset`)
