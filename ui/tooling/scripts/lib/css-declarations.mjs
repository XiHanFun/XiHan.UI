// 皮肤门禁共用的 CSS 拆解：把一份样式拆成逐条声明，连同它所在规则的选择器栈。
//
// 按行取声明只看得见行首那一条：`color: red; border-width: 1px;` 里的第二条、
// 以及整条规则挤成一行的写法，都落在扫描面之外。这里按结构走——`{` 压选择器、
// `}` 弹选择器，`;` 与块尾各收一条声明（CSS 允许块内最后一条省略分号），
// 与声明写在第几行、一行里排第几个都无关。

/** 去掉块注释但保留它占的行数，报错行号才对得上源文件。 */
export function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ' '))
}

/** 建一个「字符偏移 → 行号」的换算器，行首位置只算一遍。 */
export function lineCounter(css) {
  const starts = [0]
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '\n')
      starts.push(i + 1)
  }
  return (index) => {
    let lo = 0
    let hi = starts.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (starts[mid] <= index)
        lo = mid
      else
        hi = mid - 1
    }
    return lo + 1
  }
}

/** 属性名的形态：自定义属性与普通属性都只由字母、数字、连字符组成。 */
const PROP = /^-{0,2}[a-z][\w-]*$/i

/**
 * 逐条声明走一遍，给出属性名、值、属性名的起点偏移，以及所在规则的选择器栈
 * （栈顶是最内层那条选择器，`@layer` / `@media` / `@keyframes` 也各占一层）。
 * 自定义属性赋值同样算一条声明；顶层的 `@import`、`@charset` 不算。
 *
 * 入参先过一遍 stripComments：注释横在属性名前面时，那一条声明的属性名会连着注释一起被读出来。
 */
export function* declarations(css) {
  const stack = []
  let start = 0

  /** 把 start..end 之间的文本当一条声明收下；不成形的（选择器残留、块尾空白）跳过。 */
  function take(end) {
    const text = css.slice(start, end)
    const colon = text.indexOf(':')
    if (colon <= 0)
      return null
    const lead = /\S/.exec(text)
    if (!lead)
      return null
    const prop = text.slice(0, colon).trim()
    if (!PROP.test(prop))
      return null
    return {
      prop,
      value: text.slice(colon + 1).trim(),
      index: start + lead.index,
      selectors: stack.slice(),
    }
  }

  for (let i = 0; i < css.length; i++) {
    const c = css[i]
    if (c === '{') {
      stack.push(css.slice(start, i).trim())
      start = i + 1
    }
    else if (c === '}') {
      // 块尾那一段可能是省略了分号的最后一条声明
      if (stack.length > 0) {
        const decl = take(i)
        if (decl)
          yield decl
      }
      stack.pop()
      start = i + 1
    }
    else if (c === ';') {
      if (stack.length > 0) {
        const decl = take(i)
        if (decl)
          yield decl
      }
      start = i + 1
    }
  }
}
