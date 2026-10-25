// 深色专属规则的系统档：皮肤里写 [data-theme='dark'] 的每条规则，紧随其后补一份
// @media (prefers-color-scheme: dark) 包着的副本，选择器里的 [data-theme='dark'] 换成 [data-theme='system']。
//
// data-theme='system' 是不经 JS 跟随系统明暗的纯 CSS 路径：令牌那边由 tokens.css 的 @media 块接管，
// 皮肤里少数只在深色下成立的规则（语气、按钮实底、热力图灰阶这几处）也得跟上，否则系统深色时令牌翻了、
// 这几处还停在浅色。源文件只写 dark 一种，副本由 build 照抄，两边不会走样。
//
// 副本紧跟原规则：同特指度下与原规则同一个源序位置，全量入口与按需注入各自转换后逐字一致。

const DARK = '[data-theme=\'dark\']'
const SYSTEM = '[data-theme=\'system\']'
export const SYSTEM_MEDIA = '(prefers-color-scheme: dark)'

/** 从 i（指向引号）跳到配对的引号，返回它的下标。 */
function skipString(css, i) {
  const quote = css[i]
  let j = i + 1
  while (j < css.length && css[j] !== quote) {
    if (css[j] === '\\')
      j++
    j++
  }
  return j
}

/** 顶层逗号切开选择器列表（括号里的逗号不算）。 */
function splitSelectorList(selector) {
  const out = []
  let depth = 0
  let start = 0
  for (let i = 0; i < selector.length; i++) {
    const c = selector[i]
    if (c === '(') {
      depth++
    }
    else if (c === ')') {
      depth--
    }
    else if (c === '"' || c === '\'') {
      i = skipString(selector, i)
    }
    else if (c === ',' && depth === 0) {
      out.push(selector.slice(start, i).trim())
      start = i + 1
    }
  }
  out.push(selector.slice(start).trim())
  return out
}

/** 从 i（指向 {）找到配对的 }，注释与字符串里的括号不算。 */
function matchBrace(css, i) {
  let depth = 0
  for (let j = i; j < css.length; j++) {
    const c = css[j]
    if (c === '/' && css[j + 1] === '*') {
      j = css.indexOf('*/', j + 2) + 1
      if (j === 0)
        return css.length - 1
      continue
    }
    if (c === '"' || c === '\'') {
      j = skipString(css, j)
      continue
    }
    if (c === '{')
      depth++
    else if (c === '}' && --depth === 0)
      return j
  }
  return css.length - 1
}

/**
 * 逐条扫：@ 规则块（@layer、@media、@supports）递归进去，样式规则的选择器里带 [data-theme='dark'] 的
 * 照抄一份系统档。选择器列表里只挑带 dark 的那几支进副本。
 * @param {string} css 皮肤或入口的全文
 * @returns {string} 补上系统档副本后的全文
 */
export function systemModeVariants(css) {
  if (!css.includes(DARK))
    return css
  let out = ''
  let segment = 0
  let i = 0
  while (i < css.length) {
    const c = css[i]
    if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      i = end === -1 ? css.length : end + 2
      continue
    }
    if (c === '"' || c === '\'') {
      i = skipString(css, i) + 1
      continue
    }
    if (c === ';' || c === '}') {
      i++
      out += css.slice(segment, i)
      segment = i
      continue
    }
    if (c !== '{') {
      i++
      continue
    }
    const prelude = css.slice(segment, i)
    const close = matchBrace(css, i)
    const selector = prelude.replace(/\/\*[\s\S]*?\*\//g, '').trim()
    if (selector.startsWith('@')) {
      // @ 规则块：块头照抄，块体递归
      out += `${prelude}{${systemModeVariants(css.slice(i + 1, close))}}`
    }
    else {
      const rule = css.slice(segment, close + 1)
      out += rule
      const dark = splitSelectorList(selector).filter(branch => branch.includes(DARK))
      if (dark.length > 0) {
        const indent = /^[ \t]*/.exec(prelude.slice(prelude.lastIndexOf('\n') + 1))[0]
        const body = css.slice(i + 1, close)
        out += `\n${indent}@media ${SYSTEM_MEDIA} {\n${indent}  ${dark.map(branch => branch.replaceAll(DARK, SYSTEM)).join(`,\n${indent}  `)} {${body.replace(/\n/g, '\n  ')}}\n${indent}}`
      }
    }
    i = close + 1
    segment = i
  }
  return out + css.slice(segment)
}
