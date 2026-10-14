/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 各条命令与 MCP 工具共用的查询：返回结构化结果，渲染交给 render.ts。

import type { ComponentEntry, ComponentToken, DemoEntry, Framework, Knowledge, PageEntry, TokenEntry } from './knowledge'
import { findComponent, findPage, suggestComponents } from './knowledge'

/** 查询失败：带上可直接展示给使用者的说明与候选。 */
export class QueryError extends Error {
  readonly suggestions: readonly string[]

  constructor(message: string, suggestions: readonly string[] = []) {
    super(message)
    this.name = 'QueryError'
    this.suggestions = suggestions
  }
}

/** 找组件，找不到时抛出带候选的 QueryError。 */
export function requireComponent(knowledge: Knowledge, name: string): ComponentEntry {
  const entry = findComponent(knowledge, name)
  if (entry)
    return entry
  const near = suggestComponents(knowledge, name).map(c => `${c.title}（${c.id}）`)
  throw new QueryError(`没有名为「${name}」的组件。用 list 查看全部组件。`, near)
}

export interface ListOptions {
  readonly category?: string
  readonly query?: string
}

export interface ComponentGroup {
  readonly id: string
  readonly label: string
  readonly description: string
  readonly components: readonly ComponentEntry[]
}

/** 按分类列组件，可按分类标识 / 名称与关键字过滤。 */
export function listComponents(knowledge: Knowledge, options: ListOptions = {}): ComponentGroup[] {
  const category = options.category?.trim()
  const query = options.query?.trim().toLowerCase()
  if (category && !knowledge.categories.some(c => c.id === category || c.label === category)) {
    throw new QueryError(
      `没有名为「${category}」的分类。`,
      knowledge.categories.map(c => `${c.id}（${c.label}）`),
    )
  }
  return knowledge.categories
    .filter(c => !category || c.id === category || c.label === category)
    .map(c => ({
      ...c,
      components: knowledge.components.filter(entry =>
        entry.category === c.id
        && (!query
          || entry.id.includes(query)
          || entry.title.toLowerCase().includes(query)
          || entry.name.includes(query)
          || (entry.overview ?? '').toLowerCase().includes(query)),
      ),
    }))
    .filter(c => c.components.length > 0)
}

export interface DocResult {
  readonly path: string
  readonly title: string
  readonly framework: Framework
  readonly markdown: string
}

const FENCE_LANG: Record<Framework, string> = { 'vue': 'vue', 'react': 'tsx', 'web-components': 'html' }
const FRAMEWORK_LABEL: Record<Framework, string> = { 'vue': 'Vue', 'react': 'React', 'web-components': 'Web Components' }

/** 把页面里的 <XhDemo src="…" /> 换成所选写法的示例源码。 */
export function inlineDemos(knowledge: Knowledge, markdown: string, framework: Framework): string {
  return markdown.replace(/<XhDemo\s+src="([^"]+)"\s*\/>/g, (_, src: string) => {
    const source = knowledge.demos()[src]?.[framework]
    if (source === undefined)
      return `> 示例 \`${src}\` 没有 ${FRAMEWORK_LABEL[framework]} 写法。`
    return `\`\`\`${FENCE_LANG[framework]}\n${source}\n\`\`\``
  })
}

/** 组件或文档页的完整 Markdown，示例按所选写法内联。 */
export function resolveDoc(knowledge: Knowledge, name: string, framework: Framework): DocResult {
  const entry = findComponent(knowledge, name)
  const page = entry ? findPage(knowledge, `components/${entry.id}`) : findPage(knowledge, name)
  if (!page) {
    const near = [
      ...suggestComponents(knowledge, name).map(c => c.id),
      ...knowledge.pages().filter(p => p.path.includes(name.trim().toLowerCase())).map(p => p.path),
    ].slice(0, 8)
    throw new QueryError(`没有名为「${name}」的组件或文档页。组件写标识（如 select），文档页写站内路径（如 guide/theme）。`, near)
  }
  return { path: page.path, title: page.title, framework, markdown: inlineDemos(knowledge, page.markdown, framework) }
}

/** 除组件页外的全部文档页，按路径排序。 */
export function listPages(knowledge: Knowledge): PageEntry[] {
  return knowledge.pages()
    .filter(p => !p.path.startsWith('components/'))
    .sort((a, b) => a.path.localeCompare(b.path))
}

export interface DemoResult {
  readonly component: ComponentEntry
  readonly framework: Framework
  readonly demo: DemoEntry
  readonly source: string
}

/** 按序号、文件基名或标题找组件的某个示例。 */
export function findDemo(entry: ComponentEntry, name: string): DemoEntry | undefined {
  const key = name.trim()
  if (/^\d+$/.test(key))
    return entry.demos[Number(key) - 1]
  return entry.demos.find((demo) => {
    const base = demo.src.slice(demo.src.indexOf('/') + 1)
    return base === key || base.replace(/^\d+-/, '') === key || demo.title === key
  })
}

/** 一个示例在所选写法下的源码。 */
export function demoSource(knowledge: Knowledge, entry: ComponentEntry, name: string, framework: Framework): DemoResult {
  const demo = findDemo(entry, name)
  if (!demo) {
    throw new QueryError(
      `${entry.title} 没有名为「${name}」的示例。`,
      entry.demos.map((d, i) => `${i + 1}. ${d.src.slice(d.src.indexOf('/') + 1)}（${d.title}）`),
    )
  }
  const source = knowledge.demos()[demo.src]?.[framework]
  if (source === undefined) {
    const available = Object.keys(knowledge.demos()[demo.src] ?? {})
    throw new QueryError(`示例 ${demo.src} 没有 ${FRAMEWORK_LABEL[framework]} 写法。`, available)
  }
  return { component: entry, framework, demo, source }
}

export interface TokenQuery {
  readonly query?: string
  readonly component?: string
}

export type TokenResult
  = | { readonly kind: 'global', readonly query: string, readonly tokens: readonly TokenEntry[], readonly tone: readonly string[] }
    | { readonly kind: 'component', readonly component: ComponentEntry, readonly tokens: readonly ComponentToken[] }
    | { readonly kind: 'families', readonly families: readonly { readonly family: string, readonly count: number }[] }

/** 令牌族：`--xh-<族>-…` 的第一段。 */
export function tokenFamily(name: string): string {
  return name.replace(/^--xh-/, '').split('-')[0] ?? ''
}

/**
 * 查令牌：给组件时列它的覆盖槽，给关键字时按名字匹配全局令牌，都不给时列令牌族。
 * 关键字可写完整名、前缀或片段，如 `bg-brand`、`--xh-shape`。
 */
export function queryTokens(knowledge: Knowledge, options: TokenQuery = {}): TokenResult {
  if (options.component) {
    const entry = requireComponent(knowledge, options.component)
    return { kind: 'component', component: entry, tokens: entry.componentTokens }
  }
  const data = knowledge.tokens()
  const query = options.query?.trim()
  if (!query) {
    const counts = new Map<string, number>()
    for (const token of data.tokens)
      counts.set(tokenFamily(token.name), (counts.get(tokenFamily(token.name)) ?? 0) + 1)
    return {
      kind: 'families',
      families: [...counts].map(([family, count]) => ({ family, count })).sort((a, b) => a.family.localeCompare(b.family)),
    }
  }
  const needle = query.replace(/^--xh-/, '').replace(/^--/, '').toLowerCase()
  const tokens = data.tokens.filter(t => t.name.slice('--xh-'.length).toLowerCase().includes(needle))
  const tone = data.tone.filter(name => name.slice('--xh-'.length).includes(needle))
  if (tokens.length === 0 && tone.length === 0)
    throw new QueryError(`没有名字含「${query}」的令牌。不带关键字查询可列出全部令牌族。`)
  return { kind: 'global', query, tokens, tone }
}

export interface PartsResult {
  readonly component: ComponentEntry
}

/** 组件的样式钩子：部件选择器、数据属性、状态取值与覆盖槽。 */
export function componentParts(knowledge: Knowledge, name: string): PartsResult {
  return { component: requireComponent(knowledge, name) }
}

export interface ChangelogSection {
  readonly version: string
  readonly date: string
  readonly body: string
}

export interface ChangelogQuery {
  readonly from?: string
  readonly to?: string
  readonly keyword?: string
}

/** 把更新日志切成按版本的段。 */
export function parseChangelog(markdown: string): ChangelogSection[] {
  const out: ChangelogSection[] = []
  const parts = markdown.split(/^## /m).slice(1)
  for (const part of parts) {
    const newline = part.indexOf('\n')
    const heading = newline === -1 ? part : part.slice(0, newline)
    const [version = '', ...rest] = heading.trim().split(/\s+/)
    if (!version)
      continue
    out.push({
      version: version.replace(/^v/, ''),
      date: rest.join(' ').replace(/^\(|\)$/g, ''),
      body: newline === -1 ? '' : part.slice(newline + 1).trim(),
    })
  }
  return out
}

/** 语义化版本比较：预发布排在同号正式版之前。 */
export function compareVersions(a: string, b: string): number {
  const split = (v: string): [number[], string] => {
    const [core = '', pre = ''] = v.replace(/^v/, '').split('-', 2)
    return [core.split('.').map(n => Number(n) || 0), pre]
  }
  const [ca, pa] = split(a)
  const [cb, pb] = split(b)
  for (let i = 0; i < Math.max(ca.length, cb.length); i++) {
    const diff = (ca[i] ?? 0) - (cb[i] ?? 0)
    if (diff !== 0)
      return diff
  }
  if (pa === pb)
    return 0
  if (!pa)
    return 1
  if (!pb)
    return -1
  return pa.localeCompare(pb, 'en', { numeric: true })
}

/**
 * 取更新日志：只给 from 时取这一版，给 from 与 to 时取 (from, to] 区间，
 * 都不给时取最近一版；keyword 只保留含该词的条目。
 */
export function queryChangelog(knowledge: Knowledge, options: ChangelogQuery = {}): ChangelogSection[] {
  const sections = parseChangelog(knowledge.changelog())
  if (sections.length === 0)
    throw new QueryError('更新日志为空。')
  let picked: ChangelogSection[]
  if (options.from && options.to) {
    const [low, high] = compareVersions(options.from, options.to) <= 0 ? [options.from, options.to] : [options.to, options.from]
    picked = sections.filter(s => compareVersions(s.version, low) > 0 && compareVersions(s.version, high) <= 0)
  }
  else if (options.from) {
    const version = options.from.replace(/^v/, '')
    picked = sections.filter(s => s.version === version)
    if (picked.length === 0)
      throw new QueryError(`更新日志里没有 ${options.from}。`, sections.slice(0, 8).map(s => s.version))
  }
  else {
    picked = sections.slice(0, 1)
  }
  const keyword = options.keyword?.trim()
  if (!keyword)
    return picked
  const needles = keywordVariants(knowledge, keyword)
  return picked
    .map(s => ({
      ...s,
      body: s.body
        .split('\n')
        .filter(line => /^\s*[-*]\s/.test(line) && needles.some(n => line.toLowerCase().includes(n)))
        .join('\n'),
    }))
    .filter(s => s.body)
}

/** 关键字是组件名时，连同它的 PascalCase 名与中文名一起匹配。 */
function keywordVariants(knowledge: Knowledge, keyword: string): string[] {
  const entry = findComponent(knowledge, keyword)
  const words = entry ? [entry.id, entry.title, entry.name, keyword] : [keyword]
  return [...new Set(words.map(w => w.toLowerCase()))]
}
