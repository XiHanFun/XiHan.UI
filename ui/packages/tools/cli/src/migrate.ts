/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// migrate 命令的改写引擎：按每个 major 的规则改源码里的导入、组件、属性、事件、部件、元素、CSS 变量与关键帧，
// 改不了的（规则里的 manual 与本 major 删掉的名字）报出位置。
//
// 只按文本改，不跑类型检查：组件标签按最长的组件标识前缀归属（XhContextMenuRoot 归 context-menu），
// 属性与事件只在归属对上的标签里改；名字够独特的（Xh 开头的组件、--xh- 开头的变量）全文按整词改。
// 不碰不认识的文件：没提到 @xihan-ui、Xh 组件、xh- 元素、--xh- 变量与 data-scope 的文件原样跳过。

import type { MajorMigration, MigrationRules, SurfaceDiff } from './migrations'
import type { ComponentRename, ElementRename, EventRename, PropRename, ScopedRename } from './migrations/types'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'

export type Dialect = 'vue' | 'jsx' | 'html' | 'css' | 'script'

export interface MigrationFinding {
  readonly line: number
  readonly message: string
}

export interface SourceMigration {
  readonly text: string
  /** 改了几处。 */
  readonly edits: number
  /** 要人工处理的地方，按行号排列。 */
  readonly findings: readonly MigrationFinding[]
}

const DIALECTS: Readonly<Record<string, Dialect>> = {
  '.vue': 'vue',
  '.tsx': 'jsx',
  '.jsx': 'jsx',
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'css',
  '.sass': 'css',
  '.less': 'css',
  '.ts': 'script',
  '.mts': 'script',
  '.cts': 'script',
  '.js': 'script',
  '.mjs': 'script',
  '.cjs': 'script',
}

/** 按扩展名认写法；不认识的扩展名返回 undefined，迁移时跳过。 */
export function dialectOf(file: string): Dialect | undefined {
  const dot = file.lastIndexOf('.')
  return dot < 0 ? undefined : DIALECTS[file.slice(dot).toLowerCase()]
}

const LIBRARY = /@xihan-ui\/|\bXh[A-Z]|<xh-|['"`]xh-|--xh-|data-scope|data-xh-|xh-scope-/

const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const kebab = (name: string): string => name.replace(/[A-Z]/g, (char, index: number) => `${index > 0 ? '-' : ''}${char.toLowerCase()}`)
const camel = (name: string): string => name.replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase())
const pascal = (name: string): string => camel(name).replace(/^[a-z]/, char => char.toUpperCase())

/** 改写过程的状态：当前文本、改了几处、报了哪些。 */
class Draft {
  edits = 0
  private readonly found = new Map<string, MigrationFinding>()

  constructor(public text: string) {}

  /** 全文按正则替换，计数。 */
  replace(pattern: RegExp, replacer: (match: RegExpExecArray) => string | undefined): void {
    let out = ''
    let last = 0
    for (const match of this.text.matchAll(pattern)) {
      const next = replacer(match as RegExpExecArray)
      if (next === undefined || next === match[0])
        continue
      out += this.text.slice(last, match.index) + next
      last = match.index! + match[0].length
      this.edits++
    }
    if (last > 0)
      this.text = out + this.text.slice(last)
  }

  /** 按区间改：区间互不重叠，从后往前套用。 */
  splice(edits: Array<{ start: number, end: number, text: string }>): void {
    for (const edit of [...edits].sort((a, b) => b.start - a.start)) {
      this.text = this.text.slice(0, edit.start) + edit.text + this.text.slice(edit.end)
      this.edits++
    }
  }

  report(index: number, message: string): void {
    const line = this.text.slice(0, index).split('\n').length
    this.found.set(`${line}\u0000${message}`, { line, message })
  }

  get findings(): MigrationFinding[] {
    return [...this.found.values()].sort((a, b) => a.line - b.line)
  }
}

// —— 标签与属性 ——

interface Attribute {
  readonly start: number
  readonly end: number
  readonly name: string
  /** 值的原文（不含引号与花括号）；没写值时 undefined。 */
  readonly value?: string
  readonly quoted: boolean
  readonly braced: boolean
}

interface Tag {
  readonly start: number
  readonly end: number
  readonly name: string
  readonly attributes: readonly Attribute[]
}

/** 从 open 处的开括号走到配对的闭括号，跳过字符串。 */
function skipBalanced(text: string, open: number, close: string, start: string): number {
  let depth = 0
  for (let i = open; i < text.length; i++) {
    const char = text[i]!
    if (char === '"' || char === '\'' || char === '`') {
      i = text.indexOf(char, i + 1)
      if (i < 0)
        return text.length
      continue
    }
    if (char === start)
      depth++
    else if (char === close && --depth === 0)
      return i
  }
  return text.length
}

function parseAttributes(text: string, from: number, to: number): Attribute[] {
  const out: Attribute[] = []
  let i = from
  while (i < to) {
    const char = text[i]!
    if (/\s|\//.test(char)) {
      i++
      continue
    }
    if (char === '{') {
      i = skipBalanced(text, i, '}', '{') + 1
      continue
    }
    const name = /^[^\s=>/'"{}]+/.exec(text.slice(i, to))
    if (!name) {
      i++
      continue
    }
    const start = i
    i += name[0].length
    let j = i
    while (j < to && /\s/.test(text[j]!)) j++
    if (text[j] !== '=') {
      out.push({ start, end: i, name: name[0], quoted: false, braced: false })
      continue
    }
    j++
    while (j < to && /\s/.test(text[j]!)) j++
    const quote = text[j]
    if (quote === '"' || quote === '\'') {
      const close = text.indexOf(quote, j + 1)
      const end = close < 0 ? to : close + 1
      out.push({ start, end, name: name[0], value: text.slice(j + 1, end - 1), quoted: true, braced: false })
      i = end
    }
    else if (quote === '{') {
      const close = skipBalanced(text, j, '}', '{')
      out.push({ start, end: close + 1, name: name[0], value: text.slice(j + 1, close).trim(), quoted: false, braced: true })
      i = close + 1
    }
    else {
      const bare = /^[^\s>]*/.exec(text.slice(j, to))![0]
      out.push({ start, end: j + bare.length, name: name[0], value: bare, quoted: false, braced: false })
      i = j + bare.length
    }
  }
  return out
}

/** 文本里的 Xh 组件标签与 xh- 元素标签（开标签）。 */
function scanTags(text: string): Tag[] {
  const out: Tag[] = []
  for (const match of text.matchAll(/<(Xh[A-Z][\w.]*|xh-[a-z][\w-]*)/g)) {
    const start = match.index!
    const nameEnd = start + match[0].length
    if (!/[\s/>]/.test(text[nameEnd] ?? ''))
      continue
    let end = nameEnd
    for (; end < text.length; end++) {
      const char = text[end]!
      if (char === '"' || char === '\'') {
        const close = text.indexOf(char, end + 1)
        end = close < 0 ? text.length : close
      }
      else if (char === '{') {
        end = skipBalanced(text, end, '}', '{')
      }
      else if (char === '>' || char === '<') {
        break
      }
    }
    out.push({ start, end, name: match[1]!, attributes: parseAttributes(text, nameEnd, end) })
  }
  return out
}

/** 标签归到组件：Xh 组件按短横线写法、xh- 元素去掉前缀，取最长的组件标识前缀。 */
function scopeOf(tag: string, scopes: ReadonlySet<string>): string | undefined {
  const words = (tag.startsWith('Xh') ? kebab(tag.slice(2)) : tag.slice(3)).split('-')
  for (let size = words.length; size > 0; size--) {
    const candidate = words.slice(0, size).join('-')
    if (scopes.has(candidate))
      return candidate
  }
  return undefined
}

/** 属性名拆成前缀（: v-bind: @ v-on:）、本名与修饰符。 */
function splitName(name: string): { prefix: string, base: string, modifiers: string } {
  const match = /^(:|v-bind:|@|v-on:)?([^.]+)(\..*)?$/.exec(name)
  return { prefix: match?.[1] ?? '', base: match?.[2] ?? name, modifiers: match?.[3] ?? '' }
}

const isEventPrefix = (prefix: string): boolean => prefix === '@' || prefix === 'v-on:'

/** 新属性名按原写法的风格出：原来是短横线或在模板与 HTML 里就写短横线，JSX 里写驼峰。 */
function styled(base: string, to: string, dialect: Dialect): string {
  if (base.includes('-'))
    return kebab(to)
  if (/[A-Z]/.test(base))
    return to
  return dialect === 'jsx' ? to : kebab(to)
}

/** 属性改名；名字对上了就返回 true（改了或报了），后面不再按删除清单报它。 */
function rewriteProp(rule: PropRename, attribute: Attribute, dialect: Dialect, draft: Draft, edits: Array<{ start: number, end: number, text: string }>): boolean {
  const { prefix, base } = splitName(attribute.name)
  if (isEventPrefix(prefix) || camel(base) !== rule.from)
    return false
  const name = styled(base, rule.to, dialect)
  if (rule.booleanTo === undefined) {
    edits.push({ start: attribute.start, end: attribute.start + prefix.length + base.length, text: prefix + name })
    return true
  }
  const raw = attribute.value?.trim()
  const truthy = raw === undefined
    || (attribute.braced && raw === 'true')
    || (prefix === ':' || prefix === 'v-bind:' ? raw === 'true' : !attribute.braced)
  const falsy = (attribute.braced || prefix !== '') && raw === 'false'
  if (falsy) {
    // 连前面那个空白一起去掉，不留双空格
    const start = /\s/.test(draft.text[attribute.start - 1] ?? '') ? attribute.start - 1 : attribute.start
    edits.push({ start, end: attribute.end, text: '' })
    return true
  }
  if (!truthy) {
    draft.report(attribute.start, `${rule.from} 写了表达式：改成 ${rule.to}，开着时取 ${JSON.stringify(rule.booleanTo)}，关着时不写`)
    return true
  }
  const value = rule.booleanTo
  const text = typeof value === 'string'
    ? `${name}="${value}"`
    : dialect === 'jsx' ? `${name}={${value}}` : dialect === 'vue' ? `:${name}="${value}"` : `${name}="${value}"`
  edits.push({ start: attribute.start, end: attribute.end, text })
  return true
}

/** 事件改名；名字对上了就返回 true。 */
function rewriteEvent(rule: EventRename, attribute: Attribute, edits: Array<{ start: number, end: number, text: string }>): boolean {
  const { prefix, base, modifiers } = splitName(attribute.name)
  if (isEventPrefix(prefix) && kebab(camel(base)) === rule.from) {
    edits.push({ start: attribute.start, end: attribute.start + attribute.name.length, text: `${prefix}${base.includes('-') || base === base.toLowerCase() ? rule.to : camel(rule.to)}${modifiers}` })
    return true
  }
  if (prefix === '' && base === `on${pascal(rule.from)}`) {
    edits.push({ start: attribute.start, end: attribute.start + base.length, text: `on${pascal(rule.to)}` })
    return true
  }
  return false
}

/** 标签里的属性与事件改名，顺带报出本 major 删掉的属性。 */
function rewriteTags(draft: Draft, dialect: Dialect, rules: MigrationRules, surface: SurfaceDiff): void {
  const scopes = new Set(surface.scopes)
  const elementTags = new Set(surface.tags)
  const edits: Array<{ start: number, end: number, text: string }> = []
  for (const tag of scanTags(draft.text)) {
    const scope = scopeOf(tag.name, scopes)
    if (!scope)
      continue
    const isElement = elementTags.has(tag.name)
    // JSX 里写的 xh- 元素按 HTML 的 attribute 写法
    const tagDialect: Dialect = tag.name.startsWith('xh-') && dialect !== 'vue' ? 'html' : dialect
    const removedProps = new Set(surface.removed.props[scope] ?? [])
    const removedAttributes = new Set(isElement ? surface.removed.elementAttributes[tag.name] ?? [] : [])
    for (const attribute of tag.attributes) {
      let handled = false
      for (const rule of rules.props ?? []) {
        if (!rule.components.includes(scope))
          continue
        if (rule.only === 'web-components' && !(isElement && dialect !== 'vue'))
          continue
        handled = rewriteProp(rule, attribute, tagDialect, draft, edits) || handled
      }
      for (const rule of rules.events ?? []) {
        if (rule.components.includes(scope))
          handled = rewriteEvent(rule, attribute, edits) || handled
      }
      if (handled)
        continue
      const { prefix, base } = splitName(attribute.name)
      const asProp = isEventPrefix(prefix) ? `on${pascal(base)}` : camel(base)
      if (removedProps.has(asProp) || removedAttributes.has(base))
        draft.report(attribute.start, `${scope} 的 ${attribute.name} 在 ${rules.major}.0 删除了，按更新日志改写`)
    }
  }
  draft.splice(edits)
}

// —— 导入 ——

interface ImportSpecifier {
  readonly type: boolean
  readonly name: string
  readonly alias?: string
}

function parseSpecifiers(list: string): ImportSpecifier[] {
  return list.split(',').map(part => part.trim()).filter(Boolean).map((part) => {
    const match = /^(type\s+)?([\w$]+)(?:\s+as\s+([\w$]+))?$/.exec(part)
    return match ? { type: Boolean(match[1]), name: match[2]!, alias: match[3] } : { type: false, name: part }
  })
}

const printSpecifier = (spec: ImportSpecifier): string => `${spec.type ? 'type ' : ''}${spec.name}${spec.alias ? ` as ${spec.alias}` : ''}`

/** 一组名字从一个模块搬到另一个模块：改导入语句，没起别名的顺带改文件里的用处。 */
function moveImports(draft: Draft, from: string, to: string, names: Readonly<Record<string, string | true>>): void {
  const locals = new Map<string, string>()
  const pattern = /import\s+(type\s+)?\{([^}]*)\}\s*from\s*(['"])([^'"]+)\3(\s*;)?/g
  draft.replace(pattern, (match) => {
    if (match[4] !== from)
      return undefined
    const specifiers = parseSpecifiers(match[2]!)
    const moving = specifiers.filter(spec => Object.hasOwn(names, spec.name))
    if (moving.length === 0)
      return undefined
    const staying = specifiers.filter(spec => !moving.includes(spec))
    const moved = moving.map((spec) => {
      const renamed = names[spec.name] === true ? spec.name : names[spec.name] as string
      if (!spec.alias && renamed !== spec.name)
        locals.set(spec.name, renamed)
      return { ...spec, name: renamed }
    })
    const keyword = match[1] ?? ''
    const quote = match[3]!
    const semi = match[5] ?? ''
    const statement = (specs: ImportSpecifier[], module: string): string => `import ${keyword}{ ${specs.map(printSpecifier).join(', ')} } from ${quote}${module}${quote}${semi}`
    return staying.length > 0 ? `${statement(staying, from)}\n${statement(moved, to)}` : statement(moved, to)
  })
  for (const [name, renamed] of locals)
    draft.replace(new RegExp(`(?<![\\w$.])${escape(name)}(?![\\w$])`, 'g'), () => renamed)
}

/** 从 @xihan-ui 各包导入的名字（导入时的原名）。 */
function libraryImports(text: string): Set<string> {
  const out = new Set<string>()
  for (const match of text.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"]@xihan-ui\/[^'"]+['"]/g)) {
    for (const spec of parseSpecifiers(match[1]!)) out.add(spec.name)
  }
  return out
}

// —— 一个 major ——

function migrateMajor(draft: Draft, dialect: Dialect, { rules, surface }: MajorMigration): void {
  for (const check of rules.manual ?? []) {
    for (const match of draft.text.matchAll(new RegExp(check.pattern.source, `${check.pattern.flags.replace('g', '')}g`)))
      draft.report(match.index!, check.message)
  }

  const modules = Object.entries(rules.modules ?? {}).sort(([a], [b]) => b.length - a.length)
  for (const [from, to] of modules)
    draft.replace(new RegExp(`(['"\`])${escape(from)}(?=(?:/[^'"\`]*)?\\1)`, 'g'), match => `${match[1]}${to}`)

  for (const moved of rules.imports ?? [])
    moveImports(draft, moved.from, moved.to, moved.names)

  if (dialect !== 'css')
    rewriteTags(draft, dialect, rules, surface)

  const identifiers: Record<string, string | ComponentRename> = { ...surface.renamed.identifiers, ...rules.identifiers }
  const imported = libraryImports(draft.text)
  for (const [from, rename] of Object.entries(identifiers)) {
    const to = typeof rename === 'string' ? rename : rename.to
    const attrs = typeof rename === 'string' ? undefined : rename.attrs
    // Xh 开头的组件在模板里可以不经导入（自动引入、全量注册）；其余名字（TimeValue 这类）只在从库里导入了它的文件里改
    if (!from.startsWith('Xh') && !imported.has(from))
      continue
    if (from.startsWith('Xh')) {
      // 开标签补属性；Vue 模板里的短横线写法一起改
      for (const [old, next] of [[from, to], [`xh-${kebab(from.slice(2))}`, `xh-${kebab(to.slice(2))}`]] as const) {
        draft.replace(new RegExp(`<${escape(old)}(?=[\\s/>])`, 'g'), () => `<${next}${attrs ? ` ${attrs}` : ''}`)
        draft.replace(new RegExp(`</${escape(old)}(?=\\s*>)`, 'g'), () => `</${next}`)
      }
    }
    draft.replace(new RegExp(`(?<![\\w$])${escape(from)}(?![\\w$])`, 'g'), () => to)
  }

  const elements: ElementRename[] = [
    ...Object.entries(surface.renamed.elements).map(([from, to]) => ({ from, to })),
    ...rules.elements ?? [],
  ]
  for (const element of elements)
    renameElement(draft, dialect, element)

  for (const rename of rules.parts ?? [])
    renamePart(draft, rename)

  for (const rule of rules.events ?? [])
    rewriteListeners(draft, rule)

  const cssVariables = { ...surface.renamed.cssVariables, ...rules.cssVariables }
  for (const [from, to] of Object.entries(cssVariables))
    draft.replace(new RegExp(`${escape(from)}(?![\\w-])`, 'g'), () => to)
  for (const [from, to] of [...Object.entries(rules.keyframes ?? {}), ...Object.entries(rules.dataAttributes ?? {})])
    draft.replace(new RegExp(`(?<![\\w-])${escape(from)}(?![\\w-])`, 'g'), () => to)

  reportRemoved(draft, rules.major, surface)
}

/** 元素改名：先改元素里的部件，再改开闭标签、字符串里的元素名与样式表里的元素选择器。 */
function renameElement(draft: Draft, dialect: Dialect, { from, to, attrs, parts }: ElementRename): void {
  if (parts)
    renamePartsInside(draft, from, parts)
  draft.replace(new RegExp(`<${escape(from)}(?=[\\s/>])`, 'g'), () => `<${to}${attrs ? ` ${attrs}` : ''}`)
  draft.replace(new RegExp(`</${escape(from)}(?=\\s*>)`, 'g'), () => `</${to}`)
  draft.replace(new RegExp(`(['"\`])${escape(from)}\\1`, 'g'), match => `${match[1]}${to}${match[1]}`)
  if (dialect === 'css' || dialect === 'vue' || dialect === 'html')
    draft.replace(new RegExp(`(?<![\\w-])${escape(from)}(?=[\\s.:#\\[{,>+~)])`, 'g'), () => to)
}

/** 元素块（开标签到同名闭标签）里的 data-xh-part 改名。 */
function renamePartsInside(draft: Draft, tag: string, parts: Readonly<Record<string, string>>): void {
  const block = new RegExp(`<${escape(tag)}(?=[\\s/>])[\\s\\S]*?</${escape(tag)}\\s*>`, 'g')
  draft.replace(block, match => match[0].replace(/data-xh-part=(["'])([\w-]+)\1/g, (whole, quote: string, part: string) => {
    const next = parts[part]
    return next ? `data-xh-part=${quote}${next}${quote}` : whole
  }))
}

/** 部件改名：自写皮肤里 [data-scope][data-part] 与挂载类的写法，Web Components 元素里的 data-xh-part。 */
function renamePart(draft: Draft, { components, from, to }: ScopedRename): void {
  for (const scope of components) {
    const part = `(\\[data-part=(['"]?))${escape(from)}(\\2\\])`
    draft.replace(new RegExp(`(\\[data-scope=(['"]?)${escape(scope)}\\2\\]|\\.xh-scope-${escape(scope)}(?![\\w-]))${part}`, 'g'), match => `${match[1]}${match[3]}${to}${match[5]}`)
    renamePartsInside(draft, `xh-${scope}`, { [from]: to })
  }
}

/** Web Components 的事件监听：够独特的事件直接改名，与原生事件同名的只报出来。 */
function rewriteListeners(draft: Draft, rule: EventRename): void {
  const pattern = new RegExp(`((?:add|remove)EventListener\\(\\s*)(['"\`])${escape(rule.from)}\\2`, 'g')
  if (rule.distinctive) {
    draft.replace(pattern, match => `${match[1]}${match[2]}${rule.to}${match[2]}`)
    return
  }
  const uses = new RegExp(rule.components.map(scope => `<xh-${escape(scope)}(?=[\\s/>])|['"\`]xh-${escape(scope)}['"\`]|Xh${pascal(scope)}Element`).join('|'))
  if (!uses.test(draft.text))
    return
  for (const match of draft.text.matchAll(pattern))
    draft.report(match.index!, `${rule.components.join('、')} 的 ${rule.from} 事件改名 ${rule.to}；这里监听的若是这些元素，改成 '${rule.to}'`)
}

/** 本 major 删掉、迁移后仍出现的名字逐个报出来。 */
function reportRemoved(draft: Draft, major: number, surface: SurfaceDiff): void {
  const { removed } = surface
  const text = draft.text
  const words = new Map<string, number>()
  for (const match of text.matchAll(/[A-Z_$][\w$]*/gi)) {
    if (!words.has(match[0]))
      words.set(match[0], match.index!)
  }
  // 名字 → 从哪些模块导入。只报确实从删掉它的那个包导入的名字（搬去别处的已经改了导入）；
  // Xh 组件在模板里可以不经导入，没被任何导入认领时按出现的位置报
  const importedFrom = new Map<string, string[]>()
  for (const match of text.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g)) {
    for (const spec of parseSpecifiers(match[1]!))
      importedFrom.set(spec.name, [...importedFrom.get(spec.name) ?? [], match[2]!])
  }
  for (const [pkg, names] of Object.entries(removed.exports)) {
    for (const name of names) {
      const at = words.get(name)
      const modules = importedFrom.get(name)
      const fromPackage = modules?.some(module => module === pkg || module.startsWith(`${pkg}/`))
      if (at !== undefined && (fromPackage || (!modules && name.startsWith('Xh'))))
        draft.report(at, `${name}（${pkg}）在 ${major}.0 删除了，按更新日志改写`)
    }
  }
  for (const subpath of removed.subpaths) {
    const at = text.search(new RegExp(`['"]${escape(subpath)}['"]`))
    if (at >= 0)
      draft.report(at, `子入口 ${subpath} 在 ${major}.0 删除了`)
  }
  const tokens = (pattern: RegExp): Map<string, number> => {
    const out = new Map<string, number>()
    for (const match of text.matchAll(pattern)) {
      if (!out.has(match[1]!))
        out.set(match[1]!, match.index!)
    }
    return out
  }
  const variables = tokens(/(--xh-[\w-]+)/g)
  for (const name of removed.cssVariables) {
    const at = variables.get(name)
    if (at !== undefined)
      draft.report(at, `${name} 在 ${major}.0 删除了，按更新日志改写`)
  }
  const kebabWords = tokens(/(?<![\w-])((?:xh|data)-[\w-]+)/g)
  for (const name of [...removed.keyframes, ...removed.dataAttributes]) {
    const at = kebabWords.get(name)
    if (at !== undefined)
      draft.report(at, `${name} 在 ${major}.0 删除了，按更新日志改写`)
  }
  for (const element of removed.elements) {
    const at = text.search(new RegExp(`<${escape(element)}(?=[\\s/>])|['"\`]${escape(element)}['"\`]`))
    if (at >= 0)
      draft.report(at, `<${element}> 在 ${major}.0 删除了，按更新日志改写`)
  }
  for (const [scope, parts] of Object.entries(removed.parts)) {
    for (const part of parts) {
      const at = text.search(new RegExp(`(?:\\[data-scope=(['"]?)${escape(scope)}\\1\\]|\\.xh-scope-${escape(scope)}(?![\\w-]))\\[data-part=(['"]?)${escape(part)}\\2\\]`))
      if (at >= 0)
        draft.report(at, `${scope} 的部件 ${part} 在 ${major}.0 删除了，按更新日志改写选择器`)
    }
  }
}

/** 按从低到高的几套规则改一份源码。 */
export function migrateSource(text: string, dialect: Dialect, migrations: readonly MajorMigration[]): SourceMigration {
  if (!LIBRARY.test(text))
    return { text, edits: 0, findings: [] }
  const draft = new Draft(text)
  for (const migration of migrations)
    migrateMajor(draft, dialect, migration)
  return { text: draft.text, edits: draft.edits, findings: draft.findings }
}

// —— 整个项目 ——

/** 不进去的目录：依赖、产物与点开头的目录（.git、.nuxt 一类）。 */
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'coverage', 'out'])

export interface FileMigration {
  /** 相对 cwd 的路径，斜杠分隔。 */
  readonly file: string
  readonly edits: number
  readonly findings: readonly MigrationFinding[]
}

export interface MigrateReport {
  readonly from: number
  readonly to: number
  /** 依次套用了哪几个 major 的规则。 */
  readonly majors: readonly number[]
  /** 改了或有要人工处理的文件。 */
  readonly files: readonly FileMigration[]
  /** 各 major 升级须知里改不了代码的那几条。 */
  readonly notes: ReadonlyArray<{ readonly major: number, readonly notes: readonly string[] }>
  /** 是否写回了文件。 */
  readonly written: boolean
}

export interface MigrateOptions {
  readonly migrations: readonly MajorMigration[]
  readonly from: number
  readonly to: number
  /** 要迁移的文件或目录，相对 cwd。 */
  readonly paths: readonly string[]
  readonly cwd: string
  readonly write: boolean
}

function* sourceFiles(entry: string): Generator<string> {
  let stat
  try {
    stat = statSync(entry)
  }
  catch {
    return
  }
  if (stat.isFile()) {
    if (dialectOf(entry))
      yield entry
    return
  }
  for (const dirent of readdirSync(entry, { withFileTypes: true })) {
    if (dirent.name.startsWith('.') || SKIP_DIRS.has(dirent.name))
      continue
    yield* sourceFiles(join(entry, dirent.name))
  }
}

/** 迁移一组文件或目录；write 为假时只算不写。 */
export function migrateProject(options: MigrateOptions): MigrateReport {
  const files: FileMigration[] = []
  for (const path of options.paths) {
    for (const file of sourceFiles(resolve(options.cwd, path))) {
      const text = readFileSync(file, 'utf8')
      const result = migrateSource(text, dialectOf(file)!, options.migrations)
      if (result.edits === 0 && result.findings.length === 0)
        continue
      if (options.write && result.text !== text)
        writeFileSync(file, result.text)
      files.push({ file: relative(options.cwd, file).split(sep).join('/'), edits: result.edits, findings: result.findings })
    }
  }
  return {
    from: options.from,
    to: options.to,
    majors: options.migrations.map(({ rules }) => rules.major),
    files: files.sort((a, b) => a.file.localeCompare(b.file)),
    notes: options.migrations.map(({ rules }) => ({ major: rules.major, notes: rules.notes })),
    written: options.write,
  }
}

/** 迁移结果写成给人看的 markdown。 */
export function renderMigration(report: MigrateReport): string {
  const changed = report.files.filter(file => file.edits > 0)
  const edits = changed.reduce((sum, file) => sum + file.edits, 0)
  const lines = [
    `# 迁移 ${report.from}.x → ${report.to}.0`,
    '',
    `依次套用 ${report.majors.map(major => `${major}.0`).join('、')} 的规则：${changed.length > 0 ? `改写 ${changed.length} 个文件，共 ${edits} 处` : '没有要改的地方'}${report.written || changed.length === 0 ? '' : '（未写回）'}。`,
  ]
  if (changed.length > 0)
    lines.push('', ...changed.map(file => `- ${file.file}：${file.edits} 处`))
  const findings = report.files.flatMap(file => file.findings.map(finding => `- ${file.file}:${finding.line}  ${finding.message}`))
  if (findings.length > 0)
    lines.push('', `## 要人工处理（${findings.length} 处）`, '', ...findings)
  for (const { major, notes } of report.notes) {
    if (notes.length > 0)
      lines.push('', `## ${major}.0 升级须知里改不了代码的`, '', ...notes.map(note => `- ${note}`))
  }
  return lines.join('\n')
}

export type { MajorMigration, ScopedRename }
