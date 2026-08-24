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

const offenders = []
/** 那个部件一条 [hidden] 兜底都没写：作者给它加 hidden 也不会消失。 */
const unguarded = []
let scanned = 0
let guarded = 0

for (const file of fs.readdirSync(cssDir).filter(f => f.endsWith('.css')).sort()) {
  scanned++
  const lines = fs.readFileSync(path.join(cssDir, file), 'utf8').split('\n')

  // 哪些 part 的可见性由 animation 驱动：presence 会把它留在布局里播完退场再卸载，
  // 这段时间它身上就带着 hidden。给这类补 display:none 会把退场整段掐掉。
  const animated = new Set()
  {
    let sel = null
    for (const line of lines) {
      if (line.includes('{'))
        sel = line
      if (/^\s*animation:/.test(line) && sel) {
        const part = leadingPart(sel)
        if (part)
          animated.add(part)
      }
    }
  }

  // 先记下每个 part 的 [hidden] 兜底出现在第几行
  const hiddenAt = new Map()
  lines.forEach((line, i) => {
    const m = line.match(/\[data-scope='([^']+)'\]\[data-part='([^']+)'\]\[hidden\]/)
    if (m && !hiddenAt.has(`${m[1]}/${m[2]}`)) {
      hiddenAt.set(`${m[1]}/${m[2]}`, i)
      guarded++
    }
  })

  let selector = null
  lines.forEach((line, i) => {
    if (line.includes('{'))
      selector = line
    const decl = line.match(/^\s*display:\s*([a-z-]+)/)
    if (!decl || decl[1] === 'none' || !selector)
      return
    const part = leadingPart(selector)
    if (!part)
      return
    // 自己带了 [hidden] / :not([hidden]) 的说明作者想清楚了
    if (/\[hidden\]|:not\(\[hidden\]\)/.test(selector))
      return
    // 伪元素的 display 管的是它自己的盒子：宿主一旦 display:none，伪元素根本不生成
    if (/::(?:before|after)\s*[,{]/.test(selector) || /::(?:before|after)\s*$/.test(selector.trim()))
      return
    const at = hiddenAt.get(part)
    // 一条兜底都没写：整个部件的收起态都是坏的。这一支此前直接放行，
    // 于是「从没写过兜底」比「写了但排在前面」还安全——恰好反了。
    //
    // 被 animation 驱动的部件除外：它们的 hidden 是退场那一段的中间态，节点要留在布局里
    // 把退场动画播完（presence 播完才卸载）。给它们补 display:none 等于把退场掐掉。
    if (at == null) {
      if (!animated.has(part))
        unguarded.push(`${file}:${i + 1}  display: ${decl[1]}\n    ${selector.trim()}`)
      return
    }
    // 排在兜底之前的规则不成问题：兜底在后面，收起态照样赢
    if (i <= at)
      return
    offenders.push(`${file}:${i + 1}  display: ${decl[1]}\n    ${selector.trim()}`)
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
