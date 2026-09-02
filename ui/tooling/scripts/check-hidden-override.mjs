// 收起态不许被 display 悄悄掀开。
//
// 皮肤里给某个 part 声明 display，就盖掉了 UA 的 `[hidden] { display: none }`，
// 所以每份皮肤都会自己补一条 `[data-part=x][hidden] { display: none }` 还回去。
// 麻烦在于这条补回来的规则救不了「排在它后面、特指度又相同」的规则：
// 那样的规则会反过来把收起态掀开，浮层于是恒亮、还因为没定位而糊在视口左上角。
//
// 判据：某个 part 已经有了 [hidden] 那条兜底，其后又出现同一个 part 的规则把 display
// 改成非 none，且选择器里既没带 [hidden] 也没带 :not([hidden])——这种就是隐患。
// 想加这类规则，把 :not([hidden]) 写进选择器即可，与顺序和特指度都无关了。
//
// 判据落到规则块前的每一条选择器上：多行逗号列表里排在前面的那些行同样算数。

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const cssDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../packages/design/styles/css',
)

/**
 * 选择器开头那个 `[data-scope=x][data-part=y]`；取不到就不是 part 级规则。
 *
 * 后代 / 兄弟选择器里被样式作用的是末端那个元素，不是开头这个，所以那类一律不判。
 * 先剥掉行尾的 `{` 再看：不剥的话「开头即末端」的那种最常见写法
 * （`[data-scope=x][data-part=y] {`，中间隔着一个空格）会被当成后代选择器整条跳过——
 * 那是本门禁最大的一块盲区，104 个部件因此从没被查过。
 */
function leadingPart(selector) {
  const head = selector.replace(/\s*\{\s*$/, '').trim()
  const m = head.match(/^\[data-scope='([^']+)'\]\[data-part='([^']+)'\]/)
  if (!m)
    return null
  // 后面还跟着组合符或另一个元素：作用点在末端，交给那一端自己的规则去判
  if (/^[\s>+~]/.test(head.slice(m[0].length)))
    return null
  return `${m[1]}/${m[2]}`
}

/**
 * 把一段选择器文本按顶层逗号拆成一条条选择器。
 *
 * 只在括号外的逗号处断开：`:is(:hover, [data-highlighted])` 里的那个逗号属于伪类参数，
 * 从那儿断开会把一条选择器劈成两截残句。
 */
function splitSelectorList(text) {
  const out = []
  let depth = 0
  let buf = ''
  for (const ch of text) {
    if (ch === '(' || ch === '[') {
      depth++
    }
    else if (ch === ')' || ch === ']') {
      depth--
    }
    else if (ch === ',' && depth === 0) {
      out.push(buf.trim())
      buf = ''
      continue
    }
    buf += ch
  }
  out.push(buf.trim())
  return out.filter(Boolean)
}

/**
 * 逐行给出该行所在规则块的完整选择器列表。
 *
 * 只认带 `{` 的那一行，多行逗号列表里排在前面的选择器就整个进不了判据——
 * `[data-part=prev-trigger],` 换行再写 `[data-part=next-trigger] {` 时只有 next 被查过。
 * 这里把规则块前所有逗号分隔的行一起收进来。
 *
 * 收续行的时机看最内层那个块是不是样式规则：at 规则（@layer / @media / @supports）与文件顶层
 * 里以逗号收尾的行是选择器续行，而样式规则里以逗号收尾的行是多值声明的续行，不能收。
 * 传进来的行须先把注释抹成空白——注释里成对出现的 `{}` 会把块的层级算歪。
 */
function selectorListPerLine(lines) {
  const perLine = Array.from({ length: lines.length }).fill(null)
  /** 每个已打开的块是不是样式规则 */
  const stack = []
  /** 已读到、还在等 `{` 的选择器续行 */
  let pending = []
  let current = null

  lines.forEach((line, i) => {
    const brace = line.indexOf('{')
    if (brace >= 0) {
      const prelude = [...pending, line.slice(0, brace)].join(' ').trim()
      pending = []
      const isRule = prelude !== '' && !prelude.startsWith('@')
      stack.push(isRule)
      if (isRule)
        current = splitSelectorList(prelude)
    }
    else if (line.includes('}')) {
      stack.pop()
      pending = []
    }
    else if (stack.at(-1) !== true && line.trim().endsWith(',')) {
      pending.push(line.trim())
    }
    perLine[i] = stack.at(-1) === true ? current : null

    // 一行写完的规则（`选择器 { 声明 }`）在上面只入栈、不出栈：`}` 落在同一行，
    // 走不到出栈那一支。栈顶从此恒是「样式规则」，后面所有逗号续行都被当成多值声明
    // 的续行丢掉，判据静默退回只认带 `{` 的那一行。所以本行的 `}` 要单独补一遍。
    for (let k = brace >= 0 ? brace + 1 : 0; k < line.length; k++) {
      if (line[k] === '}') {
        stack.pop()
        pending = []
        current = null
      }
    }
  })
  return perLine
}

const offenders = []
/** 那个部件一条 [hidden] 兜底都没写：作者给它加 hidden 也不会消失。 */
const unguarded = []
let scanned = 0
let guarded = 0

for (const file of fs.readdirSync(cssDir).filter(f => f.endsWith('.css')).sort()) {
  scanned++
  const text = fs.readFileSync(path.join(cssDir, file), 'utf8')
  // 注释抹成等长空白：行号与列宽都不动，块的层级不会被注释里的 `{}` 算歪
  const code = text.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')).split('\n')
  const selectorsAt = selectorListPerLine(code)

  // 哪些 part 的可见性由 animation 驱动：presence 会把它留在布局里播完退场再卸载，
  // 这段时间它身上就带着 hidden。给这类补 display:none 会把退场整段掐掉。
  //
  // 只认落在部件自己身上的动画。伪元素上的动画（加载环那种）转的是伪元素的盒子，
  // 宿主该消失照样消失，拿它当免检理由会把宿主缺兜底这件事一起盖住。
  const animated = new Set()
  code.forEach((line, i) => {
    if (!/^\s*animation:/.test(line))
      return
    for (const sel of selectorsAt[i] ?? []) {
      if (/::(?:before|after)/.test(sel))
        continue
      const part = leadingPart(sel)
      if (part)
        animated.add(part)
    }
  })

  // 先记下每个 part 的 [hidden] 兜底出现在第几行
  const hiddenAt = new Map()
  code.forEach((line, i) => {
    const m = line.match(/\[data-scope='([^']+)'\]\[data-part='([^']+)'\]\[hidden\]/)
    if (m && !hiddenAt.has(`${m[1]}/${m[2]}`)) {
      hiddenAt.set(`${m[1]}/${m[2]}`, i)
      guarded++
    }
  })

  code.forEach((line, i) => {
    const decl = line.match(/^\s*display:\s*([a-z-]+)/)
    if (!decl || decl[1] === 'none')
      return
    // 逐条选择器各判各的：同一条规则里可以一半带 [hidden]、一半不带
    for (const selector of selectorsAt[i] ?? []) {
      const part = leadingPart(selector)
      if (!part)
        continue
      // 自己带了 [hidden] / :not([hidden]) 的说明作者想清楚了
      if (/\[hidden\]|:not\(\[hidden\]\)/.test(selector))
        continue
      // 伪元素的 display 管的是它自己的盒子：宿主一旦 display:none，伪元素根本不生成
      if (/::(?:before|after)/.test(selector))
        continue
      const at = hiddenAt.get(part)
      // 一条兜底都没写：整个部件的收起态都是坏的。这一支此前直接放行，
      // 于是「从没写过兜底」比「写了但排在前面」还安全——恰好反了。
      //
      // 被 animation 驱动的部件除外：它们的 hidden 是退场那一段的中间态，节点要留在布局里
      // 把退场动画播完（presence 播完才卸载）。给它们补 display:none 等于把退场掐掉。
      if (at == null) {
        if (!animated.has(part))
          unguarded.push(`${file}:${i + 1}  display: ${decl[1]}\n    ${selector}`)
        continue
      }
      // 排在兜底之前的规则不成问题：兜底在后面，收起态照样赢
      if (i <= at)
        continue
      offenders.push(`${file}:${i + 1}  display: ${decl[1]}\n    ${selector}`)
    }
  })
}

if (unguarded.length > 0) {
  console.error(`[check-hidden-override] 失败：${unguarded.length} 个部件声明了 display 却一条 [hidden] 兜底都没写，`)
  console.error('作者给这些节点加 hidden 不会让它们消失——UA 的 [hidden]{display:none} 已经被那条 display 盖掉了。')
  console.error('在文件末尾补一条 [data-scope=…][data-part=…][hidden] { display: none }。\n')
  console.error(unguarded.map(o => `  ${o}`).join('\n\n'))
  process.exit(1)
}

if (offenders.length > 0) {
  console.error(`[check-hidden-override] 失败：${offenders.length} 条规则排在 [hidden] 兜底之后又把 display 改回可见，`)
  console.error('收起态会被它们掀开（浮层恒亮，且因未定位而糊在视口左上角）。')
  console.error('把 :not([hidden]) 写进选择器即可，与顺序和特指度都无关。\n')
  console.error(offenders.map(o => `  ${o}`).join('\n\n'))
  process.exit(1)
}

console.log(`[check-hidden-override] 通过：${scanned} 份皮肤 · ${guarded} 条 [hidden] 兜底，声明过 display 的部件都有兜底，也没有被后面的 display 掀开`)
