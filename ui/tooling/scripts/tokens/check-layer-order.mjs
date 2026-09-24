#!/usr/bin/env node
// 门禁：层序声明在皮肤与令牌两份产物里逐字一致、在 tokens.css 里排在 @layer 块之前，
// 源入口与两份扁平产物里层序与令牌都排在任何样式规则之前，且 reset 层全部选择器为 (0,0,0)——
// 无层产物里配方排在 reset 之前，reset 只有低一档才不会靠源序压掉配方的字号；反向断言产物里
// 每条声明 font / font-size 的规则都高于 (0,0,0)。两份扁平产物里每份家族配方都只内联一次、
// 落在四份公共层之后、一切组件皮肤之前：配方与皮肤同层同档，皮肤对配方的覆盖只有配方先出现
// 才成立；配方对公共层的覆盖（field-chrome 把内嵌 input 的聚焦环置 none，与 focus.css 同为
// (0,3,0)）只有公共层先出现才成立。产物里不得残留皮肤自带的 family @import（否则不去重
// @import 的打包器会把家族复制几十份、副本反超皮肤）。
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

// 源入口开头的顺序：层序必须先声明，令牌必须排在任何样式规则之前。
//
// 这条守的是 index.source.css 里 @import 的次序。把某份皮肤插到 layers.css / 令牌之前，
// 生成器按原序内联，令牌那条 @import 一旦被样式规则挤到后面，按 CSS 规范整条失效，
// 于是全部令牌取不到值，每个组件同时失去底色、高度与圆角，而构建、门禁与测试全绿，
// 没有任何地方报错。两份扁平产物各自再查一遍同一件事。
const ENTRIES = {
  source: 'packages/design/styles/index.source.css',
  layered: 'packages/design/styles/index.css',
  unlayered: 'packages/design/styles/index.unlayered.css',
}

const sourceCss = await readFile(ENTRIES.source, 'utf8')
const imports = [...sourceCss.matchAll(/^@import\s+['"]([^'"]+)['"];/gm)].map(m => m[1])
if (imports[0] !== './css/layers.css')
  errors.push(`${ENTRIES.source} 的第一条 @import 是 ${imports[0] ?? '(没有)'}，层序声明必须打头`)
if (imports[1] !== '@xihan-ui/tokens/tokens.css')
  errors.push(`${ENTRIES.source} 的第二条 @import 是 ${imports[1] ?? '(没有)'}，令牌必须紧随层序`)

// 聚焦环公共层排在全部组件皮肤之前：它与组件皮肤同特指度（0,3,0），同层内靠源序定胜负。
// 一旦被某份皮肤挤到后面，那份皮肤要另画环的规则就压不过公共层，而两边取值都合法、
// 门禁与构建全绿，只有真去 Tab 一遍才看得出环没变。
const focusAt = imports.indexOf('./css/focus.css')
if (focusAt === -1)
  errors.push(`${ENTRIES.source} 里找不到 ./css/focus.css 的 @import——聚焦环公共层没被引入`)
else if (focusAt !== 2)
  errors.push(`${ENTRIES.source} 的第三条 @import 是 ${imports[2] ?? '(没有)'}，聚焦环公共层必须紧随令牌、排在全部组件皮肤之前`)

if (orders.layers && orders.tokens && orders.layers.join(',') !== orders.tokens.join(','))
  errors.push(`层序不一致：\n    ${FILES.layers}  ${orders.layers.join(', ')}\n    ${FILES.tokens}  ${orders.tokens.join(', ')}`)

// reset 层特指度压到 (0,0,0)：无层产物里没有层序可依，只按特指度竞争。Family Recipe 的
// 根规则（[data-xh-action-control] 一类，(0,1,0)）在产物里排在 reset 段之前；reset 若仍是
// (0,1,0)，其 `font: inherit` 就靠源序压掉配方的三档字号——文档站 Button 无论 sm/md/lg
// 全是 16px，而有层产物、单测与其余门禁全绿。修法是压低 reset，不是抬高配方：reset 层的
// 每条选择器剥去伪元素后必须整个由 :where() 包住。伪元素自身带 (0,0,1)，无法再低。
const RESET = 'packages/design/styles/css/reset.css'
const RESET_MARKER = '/* styles/reset.css */'
// 无层产物里的根规则形态：emit-entries 给家族属性加了 [data-scope] 前缀，抬到 (0,2,0)
// 与皮肤同档，才压得住宿主 `.article a` 这类 (0,1,1) 的标签规则；有层产物与源文件仍是 (0,1,0)，
// 查有层产物时把前缀摘掉再找
/**
 * 排在全部组件皮肤之前的公共层：组件与家族配方照写同特指度规则即可压过它们。
 * 家族配方必须内联在这四份之后（field-chrome 用 (0,3,0) 把内嵌 input 的聚焦环置 none，
 * 与 focus.css 的公共环同档，先出现就输）、其余一切皮肤之前。与 index.source.css 的内联点一致。
 */
const PUBLIC_LAYERS = ['focus.css', 'label.css', 'description.css', 'pointer.css']
const FAMILY_ROOTS = [
  '[data-scope][data-xh-action-control]',
  '[data-scope][data-xh-field-chrome]',
  '[data-scope][data-xh-collection-item]',
  '[data-scope][data-xh-swatch]',
]

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

const layeredCss = await readFile(ENTRIES.layered, 'utf8')
const unlayeredCss = await readFile(ENTRIES.unlayered, 'utf8')
for (const [key, css] of [['layered', layeredCss], ['unlayered', unlayeredCss]]) {
  const file = ENTRIES[key]
  const statements = [...css.matchAll(/^\s*@import\s+['"]([^'"]+)['"]/gm)].map(m => m[1])
  // 扁平产物里只许剩令牌这一条 @import：家族与皮肤都已内联，残留的相对 @import 落在样式规则之后
  // 整条失效；主入口若还留着皮肤头上的 family @import，不去重的打包器就会把家族复制几十份
  if (statements.length !== 1 || statements[0] !== '@xihan-ui/tokens/tokens.css')
    errors.push(`${file} 里的 @import 应只剩令牌一条，实际是：${statements.join(', ') || '(没有)'}——家族或皮肤没被内联干净`)
  const tokenImportAt = css.search(/^@import\s+['"]@xihan-ui\/tokens/m)
  if (tokenImportAt === -1) {
    errors.push(`${file} 里找不到令牌的 @import`)
    continue
  }
  // 它之前只许有注释、空行与 @layer / @charset 语句，出现选择器块就说明已经失效
  const before = css.slice(0, tokenImportAt).replace(/\/\*[\s\S]*?\*\//g, '')
  if (before.includes('{'))
    errors.push(`${file} 的令牌 @import 被样式规则挤到了后面，按规范会被整条忽略`)
  if (key === 'layered' && !/^@layer\s[^;{]+;/m.test(before))
    errors.push(`${file} 的令牌 @import 之前没有 @layer 层序声明——有层产物的层序必须由首次声明定死`)
  if (key === 'unlayered' && /@layer/.test(css.replace(/\/\*[\s\S]*?\*\//g, '')))
    errors.push(`${file} 里还留着 @layer——无层产物必须把层壳拆干净`)

  // 每份家族配方只内联一次，落在公共层之后、第一份组件皮肤之前：配方与皮肤同层（有层）/ 同档
  // （无层），皮肤对配方物理属性的直接覆盖只有配方先出现才成立，副本排在皮肤之后就反超；
  // 配方对公共层的覆盖（field-chrome 把内嵌 input 的聚焦环置 none，与 focus.css 的公共环同为
  // (0,3,0)）只有公共层先出现才成立，配方排在公共层之前 input 就多画一圈
  const segments = [...css.matchAll(/\n\/\* (styles|family)\/([\w-]+\.css) \*\//g)]
    .map(m => ({ dir: m[1], name: m[2], at: m.index }))
  const familyAt = segments.filter(seg => seg.dir === 'family').map(seg => seg.at)
  const seen = new Map()
  for (const seg of segments.filter(seg => seg.dir === 'family'))
    seen.set(seg.name, (seen.get(seg.name) ?? 0) + 1)
  for (const [name, count] of seen) {
    if (count !== 1)
      errors.push(`${file} 里 family/${name} 内联了 ${count} 次——家族只许出现一份`)
  }
  if (familyAt.length === 0) {
    errors.push(`${file} 里找不到任何 family/ 段——产物没把 Family Recipe 内联进来`)
    continue
  }
  const familyStart = Math.min(...familyAt)
  const familyEnd = Math.max(...familyAt)
  for (const seg of segments.filter(seg => seg.dir === 'styles')) {
    if (seg.name === 'layers.css')
      continue
    if (PUBLIC_LAYERS.includes(seg.name)) {
      if (seg.at > familyStart)
        errors.push(`${file} 里公共层 styles/${seg.name} 排在家族配方之后——配方对公共层的同特指度覆盖会被反超；内联点必须在四份公共层之后`)
    }
    else if (seg.at < familyEnd) {
      errors.push(`${file} 里皮肤 styles/${seg.name} 排在家族配方之前——同层同档靠源序竞争，皮肤对配方的覆盖会被反超；emit-entries 必须把 family/ 全部配方内联在一切组件皮肤之前`)
    }
  }
  for (const name of PUBLIC_LAYERS) {
    if (!segments.some(seg => seg.dir === 'styles' && seg.name === name))
      errors.push(`${file} 里找不到公共层 styles/${name} 的段——产物过期了，跑一次 styles 的 gen`)
  }
  for (const root of FAMILY_ROOTS) {
    // 有层产物里根规则住在 @layer 块内、缩进两格，且没有无层版那个 [data-scope] 前缀
    const rule = key === 'layered' ? `\n  ${root.replace('[data-scope]', '')} {` : `\n${root} {`
    const at = css.indexOf(rule)
    if (at === -1)
      errors.push(`${file} 里找不到配方根规则 \`${rule.trim()}\`——产物没把 Family Recipe 内联进来`)
    else if (at < familyStart || at > (segments.find(seg => seg.at > familyEnd)?.at ?? css.length))
      errors.push(`${file} 里 \`${rule.trim()}\` 根规则落在 family/ 段之外——配方被展开到了别的位置`)
    if (at !== -1 && css.slice(at + 1).includes(rule))
      errors.push(`${file} 里 \`${rule.trim()}\` 根规则出现了不止一次——家族被重复内联`)
  }
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

    // 配方还得排在 reset 之前：同为按源序竞争时，reset 只有低一档才不会压掉配方的字号
    const before = unlayeredCss.slice(0, markerAt)
    for (const root of FAMILY_ROOTS) {
      const rule = `\n${root} {`
      if (unlayeredCss.includes(rule) && !before.includes(rule))
        errors.push(`${ENTRIES.unlayered} 里 \`${root}\` 根规则没有排在 reset 段之前——配方与 reset 的先后变了，重新核对特指度取舍`)
    }

    // 反向那一半：reset 压到 (0,0,0) 只保证它不靠源序赢，前提是每条要定字号的规则都比它高。
    // 无层产物里任何声明 font / font-size 的规则（含 @media 一类条件块内的），选择器剥去伪元素后
    // 都不得同为 (0,0,0)——否则排在 reset 之前的那条会被 `font: inherit` 按源序压回继承值，
    // 且有层产物、单测与其余门禁照样全绿。reset 那条 `font: inherit` 自身是唯一豁免。
    const RESET_FONT_RULE = ':where([data-scope]):where(button, input, optgroup, select, textarea)'
    for (const { selectors, body } of styleRulesOf(stripComments(unlayeredCss))) {
      if (!/(?:^|[;\s])font(?:-size)?\s*:/.test(body))
        continue
      for (const selector of selectors) {
        if (selector === RESET_FONT_RULE)
          continue
        if (isZeroSpecificity(selector))
          errors.push(`${ENTRIES.unlayered} 里声明字号的规则 \`${selector}\` 是 (0,0,0)，与 reset 的 font: inherit 同档、只能靠源序竞争——给它至少 (0,0,1) 的特指度`)
      }
    }
  }
}

/** 递归取一段 CSS 里全部样式规则（含条件 @ 块内的）的选择器与声明体。 */
function styleRulesOf(css) {
  const out = []
  let i = 0
  while (i < css.length) {
    const brace = css.indexOf('{', i)
    if (brace === -1)
      break
    const close = matchBrace(css, brace)
    if (close === -1)
      break
    // 顶层规则之间可能夹着 @import 一类语句，只取最后一个分号之后的那段作为 prelude
    const raw = css.slice(i, brace)
    const prelude = raw.slice(raw.lastIndexOf(';') + 1).trim()
    const body = css.slice(brace + 1, close)
    if (prelude.startsWith('@')) {
      // @keyframes 的百分比帧、@font-face 一类没有选择器；@media / @supports / @container 内才有样式规则
      if (/^@(?:media|supports|container|layer)\b/.test(prelude))
        out.push(...styleRulesOf(body))
    }
    else {
      out.push({ selectors: splitSelectorList(prelude), body })
    }
    i = close + 1
  }
  return out
}

if (errors.length > 0) {
  console.error('[check-layer-order] ✗')
  for (const error of errors)
    console.error(`  ${error}`)
  console.error('层序由首次声明定死：任一入口被单独引用时都必须把完整层序摆出来。')
  process.exit(1)
}

console.log(`[check-layer-order] 通过：${orders.layers.join(' → ')}；reset 层 (0,0,0)，两份扁平产物里 ${FAMILY_ROOTS.length} 条家族根规则各内联一次、落在 ${PUBLIC_LAYERS.length} 份公共层之后、全部组件皮肤与 reset 之前，字号规则都高于 reset`)
