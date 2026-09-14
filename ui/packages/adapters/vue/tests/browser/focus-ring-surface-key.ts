// 把一条皮肤选择器写成静态门禁 check-focus-ring-surface 登记表里那种键。
//
// 键的形状：`${组件} ${祖先…} ${主语}`，每个复合按属性名排序写成 [key='value']，
// 只写属性名的写成 [key]，:is() 里几个取值合成 [key=:is(a,b)]；聚焦伪类不进键，
// :not() 里的属性条件与其余伪类按名排序接在属性后面。组件取选择器里最后一个 data-scope 的取值。
// 浏览器态拿到的是 CSSOM 序列化过的选择器（双引号、逗号后带空格），源码里是单引号，
// 两种写法解出来是同一个键。

/** 属性存在但没写取值时占位。 */
const ANY = `${String.fromCharCode(0)}any`

export interface StaticCompound {
  attrs: Map<string, Set<string>>
  /** :not() 排掉的属性条件，只收纯属性的那些。 */
  nots: StaticCompound[]
  /** 聚焦伪类之外剩下的伪类，带实参的连实参一起记。 */
  pseudos: string[]
}

export interface StaticBranch {
  subject: StaticCompound
  ancestors: StaticCompound[]
}

/** 与 expr[start] 处的左括号配对的括号内容。 */
function innerOf(expr: string, start: number): string {
  let depth = 0
  for (let i = start; i < expr.length; i++) {
    if (expr[i] === '(')
      depth++
    if (expr[i] === ')' && --depth === 0)
      return expr.slice(start + 1, i)
  }
  throw new Error(`括号不配对：${expr}`)
}

/** 按顶层分隔符拆分，括号与方括号里的不拆。 */
export function splitTop(text: string, isSep: (ch: string) => boolean): string[] {
  const out: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!
    if (ch === '(' || ch === '[') {
      depth++
    }
    else if (ch === ')' || ch === ']') {
      depth--
    }
    else if (depth === 0 && isSep(ch)) {
      out.push(text.slice(start, i))
      start = i + 1
    }
  }
  out.push(text.slice(start))
  return out.map(s => s.trim()).filter(Boolean)
}

/** CSSOM 把属性值序列化成双引号，源码里是单引号：伪类实参里的引号统一成单引号。 */
function normalizeQuotes(text: string): string {
  return text.replace(/"/g, `'`)
}

export function parseStaticCompound(text: string): StaticCompound | null {
  const attrs = new Map<string, Set<string>>()
  const pseudos: string[] = []
  const nots: StaticCompound[] = []
  const add = (key: string, value: string): void => {
    if (!attrs.has(key))
      attrs.set(key, new Set())
    attrs.get(key)!.add(value)
  }
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (ch === '[') {
      const end = text.indexOf(']', i)
      const body = text.slice(i + 1, end)
      const m = /^([\w-]+)(?:\s*[~|^$*]?=\s*(['"])(.*?)\2)?$/.exec(body)
      if (!m)
        return null
      add(m[1]!, m[3] ?? ANY)
      i = end + 1
      continue
    }
    if (ch === ':') {
      const name = /^::?([\w-]+)/.exec(text.slice(i))
      if (!name)
        return null
      let arg: string | null = null
      let next = i + name[0].length
      if (text[next] === '(') {
        arg = innerOf(text.slice(next), 0)
        next += arg.length + 2
      }
      if (name[1] === 'is' || name[1] === 'where') {
        const branches = splitTop(arg ?? '', c => c === ',').map(parseStaticCompound)
        if (branches.includes(null))
          return null
        const parsed = branches as StaticCompound[]
        const keys = new Set(parsed.flatMap(b => [...b.attrs.keys()]))
        const mergeable = parsed.every(b => !b.pseudos.length) && [...keys].every(key => parsed.every(b => b.attrs.has(key)))
        if (!mergeable) {
          pseudos.push(`${name[1]}(${normalizeQuotes(arg ?? '')})`)
        }
        else {
          for (const key of keys) {
            for (const b of parsed) {
              for (const v of b.attrs.get(key)!) add(key, v)
            }
          }
        }
      }
      else if (name[1] === 'not') {
        for (const branch of splitTop(arg ?? '', c => c === ',').map(parseStaticCompound)) {
          if (branch && branch.attrs.size && !branch.pseudos.length)
            nots.push(branch)
        }
      }
      else if (!/^focus(?:-visible|-within)?$/.test(name[1]!)) {
        pseudos.push(arg === null ? name[1]! : `${name[1]}(${normalizeQuotes(arg)})`)
      }
      i = next
      continue
    }
    i++
  }
  return { attrs, pseudos, nots }
}

export function parseStaticBranch(branch: string): StaticBranch | null {
  const compounds = splitTop(branch, ch => ch === ' ' || ch === '\t' || ch === '\n' || ch === '>' || ch === '+' || ch === '~')
    .map(parseStaticCompound)
  if (compounds.includes(null) || !compounds.length)
    return null
  const parsed = compounds as StaticCompound[]
  const subject = parsed[parsed.length - 1]!
  const ancestors = parsed.slice(0, -1).filter(c => c.attrs.has('data-part') || c.attrs.has('data-scope'))
  return { subject, ancestors }
}

export function renderStaticCompound(c: StaticCompound): string {
  const bits: string[] = []
  for (const key of [...c.attrs.keys()].sort()) {
    const vals = [...c.attrs.get(key)!].sort()
    bits.push(vals[0] === ANY ? `[${key}]` : vals.length === 1 ? `[${key}='${vals[0]}']` : `[${key}=:is(${vals.join(',')})]`)
  }
  for (const n of [...c.nots].map(renderStaticCompound).sort())
    bits.push(`:not(${n})`)
  for (const p of [...c.pseudos].sort())
    bits.push(`:${p}`)
  return bits.join('')
}

export function renderStaticBranch(b: StaticBranch): string {
  return [...b.ancestors.map(renderStaticCompound), renderStaticCompound(b.subject)].join(' ')
}

/** 选择器里最后一个 data-scope 的取值，就是它所在皮肤文件的名字。 */
export function componentOf(branch: string): string | null {
  const scopes = [...branch.matchAll(/\[data-scope=["']([\w-]+)["']\]/g)].map(m => m[1]!)
  return scopes.length ? scopes[scopes.length - 1]! : null
}

/** 一条选择器分支的登记表键；读不出形态或没点名组件时返回 null。 */
export function staticKey(branch: string): string | null {
  const comp = componentOf(branch)
  const parsed = parseStaticBranch(branch)
  return comp && parsed ? `${comp} ${renderStaticBranch(parsed)}` : null
}

// ── 两侧的键归到同一形态 ──

/** 把键里 `[key=:is(a,b)]` 的取值逐个展开，一个键拆成若干个。 */
function expandIs(key: string): string[] {
  const m = /\[([\w-]+)=:is\(([^()]*)\)\]/.exec(key)
  if (!m)
    return [key]
  return m[2]!.split(',').flatMap(value =>
    expandIs(`${key.slice(0, m.index)}[${m[1]}='${value.trim()}']${key.slice(m.index + m[0].length)}`),
  )
}

/** 键 = `${组件} ${选择器}`：组件名到第一个空格为止。 */
export function splitKey(key: string): { comp: string, selector: string } {
  const at = key.indexOf(' ')
  return at === -1 ? { comp: key, selector: '' } : { comp: key.slice(0, at), selector: key.slice(at + 1) }
}

/**
 * 一个键的规范形态：`:is()` 里的取值逐个展开；祖先里只写了 root（或 root/positioner 二选一）
 * 与本组件 scope、再无别的条件的那一节摘掉——静态门禁把槽声明在 root 上时会把它写进键，
 * 浏览器态补出来的 root 不写进键，这一层两侧指的是同一棵树。主语是 root 的不摘。
 */
export function canonicalKeys(key: string): string[] {
  const { comp, selector } = splitKey(key)
  const bareRoot = new Set([
    `[data-part='root'][data-scope='${comp}']`,
    `[data-part='positioner'][data-scope='${comp}']`,
    `[data-part=:is(positioner,root)][data-scope='${comp}']`,
  ])
  const compounds = splitTop(selector, ch => ch === ' ')
  const kept = compounds.filter((c, i) => i === compounds.length - 1 || !bareRoot.has(c))
  return [...new Set(expandIs(`${comp} ${kept.join(' ')}`))]
}

/** 规范形态的键解成组件 + 分支；解不出返回 null。 */
export function parseKey(key: string): { comp: string, branch: StaticBranch } | null {
  const { comp, selector } = splitKey(key)
  const branch = parseStaticBranch(selector)
  return branch ? { comp, branch } : null
}

/** 一组属性条件在档位上是否全部成立：档位写了这个属性，取值也都落在条件里。 */
function holds(cond: StaticCompound, tier: StaticCompound): boolean {
  for (const [key, vals] of cond.attrs) {
    const have = tier.attrs.get(key)
    if (!have)
      return false
    if (vals.has(ANY))
      continue
    for (const v of have) {
      if (!vals.has(v))
        return false
    }
  }
  return true
}

/** 规则的一节复合对档位的一节复合：条件都成立、排掉的条件都不成立、伪类档位上也写着。 */
function compoundCovers(rule: StaticCompound, tier: StaticCompound): boolean {
  if (rule.pseudos.some(p => !tier.pseudos.includes(p)))
    return false
  if (rule.nots.some(n => holds(n, tier)))
    return false
  return holds(rule, tier)
}

/** 规则是否覆盖档位：主语条件被满足，规则写出来的祖先在档位的祖先里都找得到。 */
export function coversBranch(rule: StaticBranch, tier: StaticBranch): boolean {
  if (!compoundCovers(rule.subject, tier.subject))
    return false
  return rule.ancestors.every(ra => tier.ancestors.some(ta => compoundCovers(ra, ta)))
}

/** 两个规范形态的键：前者当规则、后者当档位，同组件且规则覆盖档位。 */
export function coversKey(rule: string, tier: string): boolean {
  const r = parseKey(rule)
  const t = parseKey(tier)
  return !!r && !!t && r.comp === t.comp && coversBranch(r.branch, t.branch)
}
