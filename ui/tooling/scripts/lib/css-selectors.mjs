// 皮肤门禁共用的选择器拆解：取出样式规则的选择器，按组合符拆成复合选择器，并按浏览器的取法求特征。
//
// 浏览器匹配与失效都按「特征」分组：类名、id、属性名、标签名。匹配时按规则最右侧那一节（主体）
// 归桶；某个属性或伪类翻转时，按非主体位置登记的失效集决定要重算哪些后代或兄弟——失效集只按
// 属性名 / 伪类登记、不看取值，也不看同一节里的其他条件。主体没有可认的特征时，失效面就是
// 整棵子树。下面的取键对照 Chrome 实测：同类特征后写的覆盖先写的（纯属性复合按最后一个属性归桶），
// 类名优先于属性，:where() / :is() 里的类同样算作失效特征。

/** 逐字符取出样式规则的选择器（含 @media 内与 CSS 嵌套的内层规则），注释与字符串跳过。 */
export function collectSelectors(css) {
  const out = []
  let prelude = ''
  let i = 0
  while (i < css.length) {
    const c = css[i]
    if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      i = end === -1 ? css.length : end + 2
      continue
    }
    if (c === '"' || c === '\'') {
      const end = skipString(css, i)
      prelude += css.slice(i, end + 1)
      i = end + 1
      continue
    }
    if (c === ';' || c === '}') {
      prelude = ''
      i++
      continue
    }
    if (c === '{') {
      const head = prelude.trim()
      prelude = ''
      const close = matchBrace(css, i)
      const body = css.slice(i + 1, close === -1 ? css.length : close)
      // @keyframes 的帧选择器不是样式规则
      if (!head.startsWith('@'))
        out.push(...splitTop(head, ','))
      if (!/^@(?:-[a-z]+-)?keyframes\b/.test(head))
        out.push(...collectSelectors(body))
      i = close === -1 ? css.length : close + 1
      continue
    }
    prelude += c
    i++
  }
  return out.map(s => s.trim()).filter(Boolean)
}

/** 顶层切分：括号与方括号里的分隔符不算。 */
export function splitTop(text, separator) {
  const parts = []
  let depth = 0
  let current = ''
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '"' || c === '\'') {
      const end = skipString(text, i)
      current += text.slice(i, end + 1)
      i = end
      continue
    }
    if (c === '(' || c === '[')
      depth++
    else if (c === ')' || c === ']')
      depth--
    if (depth === 0 && c === separator) {
      parts.push(current)
      current = ''
      continue
    }
    current += c
  }
  parts.push(current)
  return parts
}

/** 按顶层组合符（空白、>、+、~）拆成复合选择器；comb 是它前面那个组合符，第一节为 null。 */
export function compoundsOf(selector) {
  const out = []
  let depth = 0
  let current = ''
  let pending = null
  const flush = () => {
    if (current.trim()) {
      out.push({ text: current.trim(), comb: out.length === 0 ? null : (pending ?? ' ') })
      pending = null
    }
    current = ''
  }
  for (let i = 0; i < selector.length; i++) {
    const c = selector[i]
    if (c === '"' || c === '\'') {
      const end = skipString(selector, i)
      current += selector.slice(i, end + 1)
      i = end
      continue
    }
    if (c === '(' || c === '[')
      depth++
    else if (c === ')' || c === ']')
      depth--
    if (depth === 0 && /[\s>+~]/.test(c)) {
      flush()
      if (c !== ' ' && c !== '\n' && c !== '\t')
        pending = c
      continue
    }
    current += c
  }
  flush()
  return out
}

/** 最右侧的复合选择器：主体。 */
export function subjectOf(selector) {
  return compoundsOf(selector).at(-1)?.text ?? ''
}

/** 复合选择器的顶层：括号里的内容折成 ()，伪类参数单列。 */
export function topLevel(compound) {
  let flat = ''
  const args = []
  let depth = 0
  let arg = ''
  for (let i = 0; i < compound.length; i++) {
    const c = compound[i]
    if (c === '"' || c === '\'') {
      const end = skipString(compound, i)
      if (depth > 0)
        arg += compound.slice(i, end + 1)
      else
        flat += compound.slice(i, end + 1)
      i = end
      continue
    }
    if (c === '(') {
      if (depth === 0)
        arg = ''
      else
        arg += c
      depth++
      continue
    }
    if (c === ')') {
      depth--
      if (depth === 0) {
        args.push({ pseudo: (flat.match(/:{1,2}[\w-]+$/) ?? [''])[0], text: arg })
        flat += '()'
      }
      else {
        arg += c
      }
      continue
    }
    if (depth > 0) {
      arg += c
      continue
    }
    flat += c
  }
  return { flat, args }
}

const last = (re, text) => [...text.matchAll(re)].at(-1)?.[1]

/**
 * 复合选择器的分桶键：id > 类 > 属性名 > 标签 > 通配，同类取最后一个。
 * 单参数的 :is() / :where() 里的键与顶层同等对待（实测 `:where(.x)[data-part]` 归进类桶），
 * 皮肤的组件限定正是这样写的：`:where(.xh-scope-x)[data-part='y']`。
 */
export function bucketOf(compound) {
  const { flat, args } = topLevel(compound)
  const inner = args
    .filter(({ pseudo, text }) => (pseudo === ':is' || pseudo === ':where') && splitTop(text, ',').length === 1)
    .map(({ text }) => bucketOf(subjectOf(text)))
  const noAttrs = flat.replace(/\[[^\]]*\]/g, '[]')
  const id = last(/#([\w-]+)/g, noAttrs) ?? inner.find(k => k.startsWith('id:'))?.slice(3)
  if (id)
    return `id:${id}`
  const cls = last(/\.([\w-]+)/g, noAttrs) ?? inner.find(k => k.startsWith('class:'))?.slice(6)
  if (cls)
    return `class:${cls}`
  const attr = last(/\[\s*([\w-]+)/g, flat) ?? inner.find(k => k.startsWith('attr:'))?.slice(5)
  if (attr)
    return `attr:${attr}`
  const tag = flat.match(/^([a-z][\w-]*)/i)?.[1] ?? inner.find(k => k.startsWith('tag:'))?.slice(4)
  if (tag)
    return `tag:${tag.toLowerCase()}`
  return 'universal'
}

export function matchBrace(css, open) {
  let depth = 0
  for (let i = open; i < css.length; i++) {
    const c = css[i]
    if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      i = end === -1 ? css.length : end + 1
      continue
    }
    if (c === '"' || c === '\'') {
      i = skipString(css, i)
      continue
    }
    if (c === '{') {
      depth++
    }
    else if (c === '}') {
      depth--
      if (depth === 0)
        return i
    }
  }
  return -1
}

export function skipString(css, start) {
  const quote = css[start]
  for (let i = start + 1; i < css.length; i++) {
    if (css[i] === '\\') {
      i++
      continue
    }
    if (css[i] === quote)
      return i
  }
  return css.length
}
