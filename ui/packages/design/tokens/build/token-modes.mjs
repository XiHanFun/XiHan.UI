// 从生成好的 tokens.css 里拆出各环境档改写的取值（深色、紧凑、减弱动效、高对比），并按 CSS 的 var() 规则展开。
// 令牌包的 JS 入口只导出缺省档；文档站的令牌表要并排列出各档，CLI 的离线文档要把同一张表压成 Markdown，
// 两处都从这里取，不各写一份解析。只解析令牌产物用到的那部分 CSS：规则块、@layer / @media / @supports 嵌套与自定义属性声明。
// 只认环境档自己的属性选择器（如 :where([data-theme='dark'])），@media 里与之同值的那一份不重复取。

/** 环境档 → 它在 tokens.css 里的选择器。 */
const MODE_SELECTORS = {
  dark: ':where([data-theme=\'dark\'])',
  compact: ':where([data-density=\'compact\'])',
  reduce: ':where([data-motion=\'reduce\'])',
  more: ':where([data-contrast=\'more\'])',
}

/** 按顶层分隔符切开，括号里的不切。 */
function splitTopLevel(text, separator) {
  const parts = []
  let depth = 0
  let start = 0
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '(') {
      depth++
    }
    else if (char === ')') {
      depth--
    }
    else if (char === separator && depth === 0) {
      parts.push(text.slice(start, i))
      start = i + 1
    }
  }
  parts.push(text.slice(start))
  return parts.map(part => part.trim()).filter(Boolean)
}

/** 拆成规则块：选择器列表、是否包在 @media / @supports 里、自定义属性声明。 */
function parseBlocks(css) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const blocks = []
  const stack = []
  let buffer = ''
  for (const char of text) {
    if (char === '{') {
      stack.push({ prelude: buffer.trim(), body: '' })
      buffer = ''
    }
    else if (char === '}') {
      const frame = stack.pop()
      const body = (frame?.body ?? '') + buffer
      buffer = ''
      if (!frame || frame.prelude.startsWith('@'))
        continue
      const decls = {}
      for (const decl of splitTopLevel(body, ';')) {
        const colon = decl.indexOf(':')
        if (colon > 0 && decl.startsWith('--'))
          decls[decl.slice(0, colon).trim()] = decl.slice(colon + 1).trim().replace(/\s+/g, ' ')
      }
      blocks.push({
        selectors: splitTopLevel(frame.prelude, ','),
        conditional: stack.some(outer => /^@(?:media|supports)\b/.test(outer.prelude)),
        decls,
      })
    }
    else {
      buffer += char
      // 分号收口一条声明（或顶层的 @layer 语句），下一个块的选择器从这之后算起
      if (char === ';') {
        if (stack.length)
          stack[stack.length - 1].body += buffer
        buffer = ''
      }
    }
  }
  return blocks
}

function collect(blocks, selector) {
  const decls = {}
  for (const block of blocks) {
    if (block.selectors.includes(selector))
      Object.assign(decls, block.decls)
  }
  return decls
}

/** 缺省档（:where(:root) 上的全部声明，含高对比开关这类内部变量）与各环境档改写的声明。 */
export function collectTokenData(css) {
  const blocks = parseBlocks(css).filter(block => !block.conditional)
  const modes = {}
  for (const [mode, selector] of Object.entries(MODE_SELECTORS))
    modes[mode] = collect(blocks, selector)
  return { base: collect(blocks, ':where(:root)'), modes }
}

/** 找出 text 里从 start 起那个 var( 的参数：名字与回退值（逗号之后的全部）。 */
function readVar(text, start) {
  let depth = 0
  let comma = -1
  for (let i = start + 4; i < text.length; i++) {
    const char = text[i]
    if (char === '(') {
      depth++
    }
    else if (char === ')') {
      if (depth === 0) {
        const inner = text.slice(start + 4, i)
        const split = comma < 0 ? inner.length : comma - (start + 4)
        return { end: i + 1, name: inner.slice(0, split).trim(), fallback: comma < 0 ? undefined : inner.slice(split + 1).trim() }
      }
      depth--
    }
    else if (char === ',' && depth === 0 && comma < 0) {
      comma = i
    }
  }
  return null
}

/**
 * 某一档里一个令牌的取值。内部变量（--xh-_ 开头，如高对比的空格开关）总是展开，得到这一档真正生效的那条写法；
 * resolve 打开时连公开的别名也一路展开到字面量（150ms、4px），关着时保留 var(--xh-…) 写法。
 */
export function createTokenResolver(data) {
  const raw = (name, env) => (env === 'default' ? undefined : data.modes[env][name]) ?? data.base[name]

  function expand(text, env, resolve, depth) {
    if (depth > 32 || !text.includes('var('))
      return text
    let out = ''
    let i = 0
    while (i < text.length) {
      const at = text.indexOf('var(', i)
      if (at < 0) {
        out += text.slice(i)
        break
      }
      const ref = readVar(text, at)
      if (!ref) {
        out += text.slice(i)
        break
      }
      out += text.slice(i, at)
      if (ref.name.startsWith('--xh-_') || resolve) {
        const own = raw(ref.name, env)
        // 未定义或 initial：取回退值；空串：替换成空（空格开关的「关」）
        const picked = own === undefined || own.trim() === 'initial' ? ref.fallback ?? '' : own
        out += expand(picked, env, resolve, depth + 1)
      }
      else {
        out += text.slice(at, ref.end)
      }
      i = ref.end
    }
    return out.replace(/\s+/g, ' ').trim()
  }

  return {
    raw,
    value(name, env, resolve) {
      const own = raw(name, env)
      return own === undefined ? undefined : expand(own, env, resolve, 0)
    },
  }
}
