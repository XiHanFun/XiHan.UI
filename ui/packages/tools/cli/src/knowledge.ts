/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 读取随包发布的离线数据：组件元数据、文档页、示例源码、令牌、design.md 与更新日志。

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** 示例与文档可选的三种写法。 */
export type Framework = 'vue' | 'react' | 'web-components'

export const FRAMEWORKS: readonly Framework[] = ['vue', 'react', 'web-components']

export interface FieldRow {
  readonly name: string
  readonly type: string
  readonly optional: boolean
  readonly doc: string
}

export interface AttributeRow {
  readonly part: string
  readonly attr: string
  readonly value: string
}

export interface ComponentToken {
  readonly name: string
  readonly part: readonly string[]
  readonly property: readonly string[]
  readonly state: readonly string[]
  readonly defaultToken: readonly string[]
  readonly description: string
}

export interface DemoEntry {
  readonly src: string
  readonly title: string
  readonly description: string
}

export interface ComponentEntry {
  readonly id: string
  readonly name: string
  readonly title: string
  readonly category: string
  readonly categoryLabel: string
  readonly status: string | null
  readonly overview: string | null
  readonly guidance: Readonly<Record<string, string>>
  readonly artifacts: {
    readonly components: readonly string[]
    readonly composable: string | null
    readonly tag: string | null
    readonly machine: string | null
    readonly skin: string | null
  }
  readonly parts: readonly string[]
  readonly requiredParts: readonly string[]
  readonly props: readonly FieldRow[]
  readonly nodes: readonly { readonly name: string, readonly via: string, readonly fields: readonly FieldRow[] }[]
  readonly events: readonly { readonly name: string, readonly type: string, readonly description: string }[]
  readonly slots: readonly { readonly component: string, readonly name: string, readonly optional: boolean, readonly payload: string, readonly doc: string }[]
  readonly reactProps: readonly (FieldRow & { readonly component: string })[]
  readonly machine: {
    readonly states: readonly string[] | null
    readonly events: readonly string[] | null
    readonly guards: readonly string[] | null
  }
  readonly api: readonly { readonly name: string, readonly type: string, readonly doc: string }[]
  readonly keyboard: {
    readonly source: string
    readonly rows: readonly { readonly keys: readonly string[], readonly when: string, readonly does: string }[]
  }
  readonly aria: readonly AttributeRow[]
  readonly dataAttributes: readonly AttributeRow[]
  readonly componentTokens: readonly ComponentToken[]
  readonly demos: readonly DemoEntry[]
}

export interface CategoryEntry {
  readonly id: string
  readonly label: string
  readonly description: string
}

export interface PageEntry {
  /** 站内路径，不带扩展名，如 `guide/theme`、`components/select`。 */
  readonly path: string
  readonly title: string
  readonly summary: string
  readonly markdown: string
}

export interface TokenEntry {
  readonly name: string
  readonly type: string
  /** tokens.json 里的原始取值，可能引用别的令牌。 */
  readonly value: string
  /** 沿 var() 展开后的取值。 */
  readonly resolved: string
  /** 除缺省档外还改写过它的令牌源。 */
  readonly layers: readonly string[]
}

export interface TokenData {
  readonly tokens: readonly TokenEntry[]
  /** 只在 data-tone 作用域里有取值的语气族令牌。 */
  readonly tone: readonly string[]
}

export interface Meta {
  readonly version: string
  readonly site: string
}

/** 示例源码：键是示例路径（如 `select/01-basic`），值是各写法的源码。 */
export type DemoSources = Readonly<Record<string, Partial<Record<Framework, string>>>>

export interface Knowledge {
  readonly meta: Meta
  readonly categories: readonly CategoryEntry[]
  readonly components: readonly ComponentEntry[]
  pages: () => readonly PageEntry[]
  demos: () => DemoSources
  tokens: () => TokenData
  designMd: () => string
  changelog: () => string
}

/** 包内 data/ 目录：src/ 与 dist/ 同在包根下一层。 */
export function defaultDataDir(): string {
  return join(dirname(fileURLToPath(import.meta.url)), '..', 'data')
}

function lazy<T>(load: () => T): () => T {
  let cached: { value: T } | undefined
  return () => {
    cached ??= { value: load() }
    return cached.value
  }
}

/** 从数据目录读出全部知识；大文件在首次用到时才读。 */
export function loadKnowledge(dataDir: string = defaultDataDir()): Knowledge {
  const text = (file: string): string => readFileSync(join(dataDir, file), 'utf8')
  const json = <T>(file: string): T => JSON.parse(text(file)) as T
  let meta: Meta
  try {
    meta = json<Meta>('meta.json')
  }
  catch (error) {
    throw new Error(`读不到 @xihan-ui/cli 的离线数据（${dataDir}）：${(error as Error).message}`)
  }
  const { categories, components } = json<{ categories: CategoryEntry[], components: ComponentEntry[] }>('components.json')
  return {
    meta,
    categories,
    components,
    pages: lazy(() => json<PageEntry[]>('pages.json')),
    demos: lazy(() => json<DemoSources>('demos.json')),
    tokens: lazy(() => json<TokenData>('tokens.json')),
    designMd: lazy(() => text('design.md')),
    changelog: lazy(() => text('changelog.md')),
  }
}

/** kebab-case 或带 Xh 前缀的 PascalCase 名字统一成组件标识。 */
function normalize(name: string): string {
  return name
    .trim()
    .replace(/^<|\/?>$/g, '')
    .replace(/^xh-/i, '')
    .replace(/^Xh(?=[A-Z])/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

/** 按标识、PascalCase 名、自定义元素标签、部件组件名或中文名找组件。 */
export function findComponent(knowledge: Knowledge, name: string): ComponentEntry | undefined {
  const raw = name.trim()
  if (!raw)
    return undefined
  const id = normalize(raw)
  const exact = knowledge.components.find(c => c.id === id || c.name === raw)
  if (exact)
    return exact
  const exported = /^Xh[A-Z]/.test(raw) ? raw : `Xh${raw}`
  return knowledge.components.find(c => c.artifacts.components.includes(exported))
}

/** 两个字符串的编辑距离。 */
function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]!
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const current = row[j]!
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1))
      previous = current
    }
  }
  return row[b.length]!
}

/** 找不到组件时的候选：名字互相包含或编辑距离不超过 2。 */
export function suggestComponents(knowledge: Knowledge, name: string, limit = 5): ComponentEntry[] {
  const id = normalize(name)
  if (!id)
    return []
  return knowledge.components
    .map(c => ({ c, score: c.id.includes(id) || id.includes(c.id) || c.name.includes(name.trim()) ? 0 : distance(c.id, id) }))
    .filter(x => x.score <= 2)
    .sort((a, b) => a.score - b.score || a.c.id.localeCompare(b.c.id))
    .slice(0, limit)
    .map(x => x.c)
}

/** 按站内路径找文档页：完整路径优先，其次末段同名的唯一一页。 */
export function findPage(knowledge: Knowledge, path: string): PageEntry | undefined {
  const key = path.trim().replace(/^\/+|\/+$/g, '').replace(/\.md$/, '').replace(/\/index$/, '')
  const pages = knowledge.pages()
  const exact = pages.find(p => p.path === key)
  if (exact)
    return exact
  const tail = pages.filter(p => p.path.split('/').pop() === key)
  return tail.length === 1 ? tail[0] : undefined
}

/** 把 vue / react / wc / web-components 等写法统一成框架标识。 */
export function parseFramework(value: string | undefined): Framework | undefined {
  if (value === undefined)
    return undefined
  const v = value.trim().toLowerCase()
  if (v === 'vue')
    return 'vue'
  if (v === 'react' || v === 'tsx')
    return 'react'
  if (v === 'wc' || v === 'web-components' || v === 'webcomponents' || v === 'html')
    return 'web-components'
  return undefined
}
