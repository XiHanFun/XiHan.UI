/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// Portal 视觉桥的文档级样式表索引。
//
// 桥每次同步都要回答两件事：哪些自定义属性可能在「壳自己复现不出来的地方」被改写（决定读多少），
// 以及一次 class 变更能不能改写自定义属性（决定要不要重算）。两件事都只由文档样式表里
// 「声明了自定义属性的规则」决定，与页面上有多少浮层无关，因此按文档索引一次、全部桥共用。
//
// 索引只给上界：多留一个名字只是多读一次，漏一个才会让壳停在旧值上。凡是判不准的形式
// ——跨域样式表、[class] 属性选择器、看不懂的选择器——一律放弃对应优化，退回整表枚举与照旧重算。

export interface PortalVisualIndexInput {
  /** 桥会逐项复制到壳上的属性名；只由这些属性选中的规则，壳自己就能解析出同样的值。 */
  readonly reproduced: ReadonlySet<string>
}

export interface PortalVisualIndex {
  /**
   * 可能在壳复现不出来的位置被改写的自定义属性名。
   * null 表示样式表读不全（跨域等），调用方必须枚举整张计算样式表。
   */
  readonly names: ReadonlySet<string> | null
  /**
   * 出现在「声明了自定义属性」的规则选择器里的 class 名。
   * null 表示判不准（出现了 [class] 属性选择器等），调用方必须对任何 class 变更重算。
   */
  readonly classes: ReadonlySet<string> | null
}

interface Collector {
  readonly names: Set<string>
  readonly classes: Set<string>
  readonly reproduced: ReadonlySet<string>
  readonly rootIsHtml: boolean
  namesUsable: boolean
  classesUsable: boolean
}

interface CacheEntry {
  readonly signature: string
  readonly reproduced: ReadonlySet<string>
  readonly index: PortalVisualIndex
}

const cache = new WeakMap<Document, CacheEntry>()

/** CSS 标识符字符：ASCII 字母数字、-、_ 与任何非 ASCII 码位。 */
const IDENT_CHAR = /^[\w\P{ASCII}-]$/u
const CLASS_TOKEN = /\.((?:[\w\P{ASCII}-]|\\[\s\S])+)/gu
/** 任何按 class 属性本身匹配的选择器都让 class 名集合失去意义。 */
const CLASS_ATTRIBUTE = /\[\s*class\b/i
const ATTRIBUTE_NAME = /^\s*([\w\P{ASCII}-]+)/u
const ATTRIBUTE_TAIL = /^\s*(?:[~^|$*]?=|$)/
const TEXT_NODE = 3

function unescapeIdent(raw: string): string {
  if (!raw.includes('\\'))
    return raw
  return raw.replace(
    /\\(?:([0-9a-f]{1,6})[ \t\n]?|([\s\S]))/gi,
    (_, hex: string | undefined, literal: string | undefined) =>
      hex ? String.fromCodePoint(Number.parseInt(hex, 16)) : literal!,
  )
}

/** 从 index 处的 ( 或 [ 找到配对的闭合位置；引号内不计。找不到返回 -1。 */
function matchingBracket(text: string, index: number): number {
  const open = text[index]
  const close = open === '(' ? ')' : ']'
  let depth = 0
  let quote = ''
  for (let cursor = index; cursor < text.length; cursor++) {
    const char = text[cursor]!
    if (quote) {
      if (char === '\\')
        cursor++
      else if (char === quote)
        quote = ''
      continue
    }
    if (char === '"' || char === '\'') {
      quote = char
      continue
    }
    if (char === '\\') {
      cursor++
      continue
    }
    if (char === open)
      depth++
    else if (char === close && --depth === 0)
      return cursor
  }
  return -1
}

/** 按顶层逗号拆分选择器列表；括号、方括号与引号内的逗号不算。括号不配对时返回 null。 */
function splitSelectorList(text: string): string[] | null {
  const parts: string[] = []
  let start = 0
  let quote = ''
  let depth = 0
  for (let cursor = 0; cursor < text.length; cursor++) {
    const char = text[cursor]!
    if (quote) {
      if (char === '\\')
        cursor++
      else if (char === quote)
        quote = ''
      continue
    }
    if (char === '"' || char === '\'') {
      quote = char
      continue
    }
    if (char === '\\') {
      cursor++
      continue
    }
    if (char === '(' || char === '[') {
      depth++
    }
    else if (char === ')' || char === ']') {
      depth--
    }
    else if (char === ',' && depth === 0) {
      parts.push(text.slice(start, cursor))
      start = cursor + 1
    }
    if (depth < 0)
      return null
  }
  if (depth !== 0 || quote)
    return null
  parts.push(text.slice(start))
  return parts
}

function attributeName(text: string): string | null {
  const matched = ATTRIBUTE_NAME.exec(text)
  if (!matched)
    return null
  if (!ATTRIBUTE_TAIL.test(text.slice(matched[0].length)))
    return null
  return matched[1]!.toLowerCase()
}

/**
 * 这一段复合选择器选中的元素，壳能不能自己复现。
 *
 * 只认三样：`:root` 与 `html`（文档根，壳与来源同样靠继承拿到）、桥会复制到壳上的那些属性
 * （壳带着同样的属性，同一条规则会在壳上再命中一次），以及把它们包起来的 `:where()` / `:is()`。
 * 出现组合符、class、id、`*`、`&` 或任何别的伪类一律判不准，按「复现不出来」处理。
 */
function reproducibleCompound(text: string, collector: Collector): boolean {
  const selector = text.trim()
  let cursor = 0
  let matched = false
  while (cursor < selector.length) {
    const char = selector[cursor]!
    if (char === ':') {
      cursor++
      if (selector[cursor] === ':')
        return false
      const start = cursor
      while (cursor < selector.length && IDENT_CHAR.test(selector[cursor]!))
        cursor++
      const name = selector.slice(start, cursor).toLowerCase()
      if (selector[cursor] === '(') {
        if (name !== 'where' && name !== 'is')
          return false
        const end = matchingBracket(selector, cursor)
        if (end < 0)
          return false
        const inner = splitSelectorList(selector.slice(cursor + 1, end))
        if (!inner || !inner.every(part => reproducibleCompound(part, collector)))
          return false
        cursor = end + 1
        matched = true
        continue
      }
      if (name !== 'root')
        return false
      matched = true
      continue
    }
    if (char === '[') {
      const end = matchingBracket(selector, cursor)
      if (end < 0)
        return false
      const name = attributeName(selector.slice(cursor + 1, end))
      if (!name || !collector.reproduced.has(name))
        return false
      cursor = end + 1
      matched = true
      continue
    }
    if (IDENT_CHAR.test(char)) {
      const start = cursor
      while (cursor < selector.length && IDENT_CHAR.test(selector[cursor]!))
        cursor++
      if (!collector.rootIsHtml || selector.slice(start, cursor).toLowerCase() !== 'html')
        return false
      matched = true
      continue
    }
    return false
  }
  return matched
}

function reproducibleSelector(text: string, collector: Collector): boolean {
  const parts = splitSelectorList(text)
  if (!parts)
    return false
  return parts.every(part => reproducibleCompound(part, collector))
}

function collectClasses(text: string, collector: Collector, into: string[]): void {
  if (CLASS_ATTRIBUTE.test(text)) {
    collector.classesUsable = false
    return
  }
  CLASS_TOKEN.lastIndex = 0
  for (let matched = CLASS_TOKEN.exec(text); matched; matched = CLASS_TOKEN.exec(text))
    into.push(unescapeIdent(matched[1]!))
}

function customPropertyNames(style: CSSStyleDeclaration): string[] {
  const names: string[] = []
  for (let index = 0; index < style.length; index++) {
    const name = style.item(index)
    if (name.startsWith('--'))
      names.push(name)
  }
  return names
}

function selectorOf(rule: CSSRule): string | null {
  const text = (rule as CSSStyleRule).selectorText
  return typeof text === 'string' ? text : null
}

function walkRules(rules: CSSRuleList | undefined, collector: Collector, classes: readonly string[], reproducible: boolean): void {
  if (!rules)
    return
  for (let index = 0; index < rules.length; index++)
    walkRule(rules[index]!, collector, classes, reproducible)
}

function walkRule(rule: CSSRule, collector: Collector, classes: readonly string[], reproducible: boolean): void {
  const imported = (rule as CSSImportRule).styleSheet
  if (imported) {
    walkSheet(imported, collector, classes, reproducible)
    return
  }

  const selector = selectorOf(rule)
  const scoped = 'start' in rule
  let nested = classes
  let inherited = reproducible
  // 带选择器的是样式规则；@scope 的 start / end 也是选择器，但它限定的子树里没有壳。
  if (selector !== null || scoped) {
    const found = [...classes]
    const texts = selector !== null ? [selector] : [(rule as CSSScopeRule).start, (rule as CSSScopeRule).end]
    for (const text of texts)
      collectClasses(text ?? '', collector, found)
    nested = found
    inherited = reproducible && selector !== null && reproducibleSelector(selector, collector)
  }

  const style = (rule as CSSStyleRule).style as CSSStyleDeclaration | undefined
  if (style && style.length) {
    const declared = customPropertyNames(style)
    if (declared.length) {
      // 没有选择器却带声明的（@font-face、关键帧、@page）一律按壳复现不出来处理。
      if (!inherited || selector === null) {
        for (const name of declared)
          collector.names.add(name)
      }
      for (const name of nested)
        collector.classes.add(name)
    }
  }

  walkRules((rule as CSSGroupingRule).cssRules, collector, nested, inherited)
}

function walkSheet(sheet: CSSStyleSheet, collector: Collector, classes: readonly string[], reproducible: boolean): void {
  let rules: CSSRuleList | null = null
  try {
    rules = sheet.cssRules
  }
  catch {
    // 跨域样式表读不到规则：名字集合不再是上界，class 集合同样不完整。
    collector.namesUsable = false
    collector.classesUsable = false
    return
  }
  walkRules(rules ?? undefined, collector, classes, reproducible)
}

function sheetsOf(doc: Document): CSSStyleSheet[] {
  const adopted = doc.adoptedStyleSheets
  return adopted && adopted.length ? [...doc.styleSheets, ...adopted] : [...doc.styleSheets]
}

/**
 * 样式表指纹：表数量、每张表的顶层规则数，以及 `<style>` 的文本长度。
 * 顶层增删表与整段替换样式文本都会改变它；通过 CSSOM 往已有分组规则里插规则不会，
 * 那种改动要靠显式 sync()。
 */
function signatureOf(sheets: readonly CSSStyleSheet[]): string {
  const parts: string[] = []
  for (const sheet of sheets) {
    let count = -1
    try {
      count = sheet.cssRules?.length ?? -1
    }
    catch {
      count = -1
    }
    const owner = sheet.ownerNode
    const first = owner?.firstChild
    parts.push(`${count}.${first && first.nodeType === TEXT_NODE ? (first as Text).length : -1}`)
  }
  return `${sheets.length}|${parts.join(',')}`
}

/** 读取文档的 Portal 视觉索引；样式表指纹不变时复用上次的结果。 */
export function portalVisualIndex(doc: Document, input: PortalVisualIndexInput): PortalVisualIndex {
  const sheets = sheetsOf(doc)
  const signature = signatureOf(sheets)
  const cached = cache.get(doc)
  if (cached && cached.signature === signature && cached.reproduced === input.reproduced)
    return cached.index

  const collector: Collector = {
    names: new Set<string>(),
    classes: new Set<string>(),
    reproduced: input.reproduced,
    rootIsHtml: doc.documentElement.localName === 'html',
    namesUsable: true,
    classesUsable: true,
  }
  for (const sheet of sheets)
    walkSheet(sheet, collector, [], true)

  const index: PortalVisualIndex = {
    names: collector.namesUsable ? collector.names : null,
    classes: collector.namesUsable && collector.classesUsable ? collector.classes : null,
  }
  cache.set(doc, { signature, reproduced: input.reproduced, index })
  return index
}
