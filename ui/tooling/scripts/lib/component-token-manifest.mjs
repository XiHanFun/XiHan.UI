import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const UI_ROOT = fileURLToPath(new URL('../../..', import.meta.url))

export const COMPONENT_TOKEN_MANIFEST_PATH = join(UI_ROOT, 'packages/design/styles/components.tokens.json')
export const COMPONENT_TOKEN_TYPES_PATH = join(UI_ROOT, 'packages/design/styles/component-tokens.d.ts')
export const COMPONENT_TOKEN_DOCS_START = '<!-- xh-component-tokens:start -->'
export const COMPONENT_TOKEN_DOCS_END = '<!-- xh-component-tokens:end -->'

const COMPONENT_DOCS_MANIFEST_PATH = join(UI_ROOT, 'scripts/component-docs.manifest.json')
const DESIGN_TOKENS_PATH = join(UI_ROOT, 'packages/design/tokens/tokens.json')
const STYLES_DIR = join(UI_ROOT, 'packages/design/styles/css')

const PRIVATE_PREFIX = '--xh-_'
const TOKEN_VERSION = 1

const compareText = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
const sorted = values => [...new Set(values)].sort(compareText)
const normalizeCss = value => value.trim().replace(/\s+/g, ' ')
const lineAt = (source, index) => source.slice(0, index).split('\n').length

export function serializeComponentTokenArtifact(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, comment => comment.replace(/[^\n]/g, ' '))
}

function skipString(source, start, end = source.length) {
  const quote = source[start]
  for (let index = start + 1; index < end; index++) {
    if (source[index] === '\\') {
      index += 1
      continue
    }
    if (source[index] === quote)
      return index
  }
  return end - 1
}

function findClosing(source, start, open, close, end = source.length) {
  let depth = 0
  for (let index = start; index < end; index++) {
    const char = source[index]
    if (char === '"' || char === '\'') {
      index = skipString(source, index, end)
      continue
    }
    if (char === open)
      depth += 1
    else if (char === close && --depth === 0)
      return index
  }
  return -1
}

function findStructure(source, start, end) {
  let parentheses = 0
  for (let index = start; index < end; index++) {
    const char = source[index]
    if (char === '"' || char === '\'') {
      index = skipString(source, index, end)
      continue
    }
    if (char === '(')
      parentheses += 1
    else if (char === ')')
      parentheses = Math.max(0, parentheses - 1)
    else if (parentheses === 0 && (char === '{' || char === ';' || char === '}'))
      return index
  }
  return -1
}

function findDeclarationColon(source, start, end) {
  let parentheses = 0
  for (let index = start; index < end; index++) {
    const char = source[index]
    if (char === '"' || char === '\'') {
      index = skipString(source, index, end)
      continue
    }
    if (char === '(')
      parentheses += 1
    else if (char === ')')
      parentheses = Math.max(0, parentheses - 1)
    else if (char === ':' && parentheses === 0)
      return index
  }
  return -1
}

function visitDeclarations(source, start, end, selector, atRules, visit) {
  let cursor = start
  let parentheses = 0
  for (let index = start; index <= end; index++) {
    const char = source[index]
    if (char === '"' || char === '\'') {
      index = skipString(source, index, end)
      continue
    }
    if (char === '(')
      parentheses += 1
    else if (char === ')')
      parentheses = Math.max(0, parentheses - 1)
    if (index < end && (char !== ';' || parentheses !== 0))
      continue
    const colon = findDeclarationColon(source, cursor, index)
    if (colon !== -1) {
      const property = source.slice(cursor, colon).trim()
      const value = source.slice(colon + 1, index).trim()
      if (property && value)
        visit({ property, value, valueOffset: colon + 1, selector, atRules })
    }
    cursor = index + 1
  }
}

function walkCss(source, start, end, atRules, visit) {
  let cursor = start
  while (cursor < end) {
    while (cursor < end && /[\s;]/.test(source[cursor])) cursor += 1
    if (cursor >= end)
      return
    const delimiter = findStructure(source, cursor, end)
    if (delimiter === -1 || source[delimiter] === '}')
      return
    if (source[delimiter] === ';') {
      cursor = delimiter + 1
      continue
    }
    const header = source.slice(cursor, delimiter).trim()
    const close = findClosing(source, delimiter, '{', '}', end)
    if (close === -1)
      throw new Error(`[component-tokens] CSS 块没有闭合：${header}`)
    if (header.startsWith('@')) {
      walkCss(source, delimiter + 1, close, [...atRules, normalizeCss(header)], visit)
    }
    else {
      visitDeclarations(source, delimiter + 1, close, normalizeCss(header), atRules, visit)
    }
    cursor = close + 1
  }
}

function splitVarArguments(value) {
  let parentheses = 0
  for (let index = 0; index < value.length; index++) {
    const char = value[index]
    if (char === '"' || char === '\'') {
      index = skipString(value, index)
      continue
    }
    if (char === '(')
      parentheses += 1
    else if (char === ')')
      parentheses = Math.max(0, parentheses - 1)
    else if (char === ',' && parentheses === 0)
      return [value.slice(0, index).trim(), value.slice(index + 1).trim()]
  }
  return [value.trim(), null]
}

function varCalls(value) {
  const calls = []
  const pattern = /\bvar\s*\(/g
  for (let match = pattern.exec(value); match; match = pattern.exec(value)) {
    const open = value.indexOf('(', match.index)
    const close = findClosing(value, open, '(', ')')
    if (close === -1)
      throw new Error(`[component-tokens] var() 没有闭合：${value}`)
    const [name, fallback] = splitVarArguments(value.slice(open + 1, close))
    calls.push({ name, fallback, offset: match.index })
    // 从 var( 后继续找，嵌套 fallback 里的引用也必须接受归属校验。
    pattern.lastIndex = open + 1
  }
  return calls
}

function partsOf(selector) {
  const parts = [...selector.matchAll(/\[data-part\s*=\s*['"]([^'"]+)['"]\]/g)].map(match => match[1])
  return parts.length ? sorted(parts) : ['*']
}

function statesOf(selector, atRules) {
  const states = []
  for (const match of selector.matchAll(/\[([^\]]+)\]/g)) {
    const content = match[1].trim()
    if (!content.startsWith('data-'))
      continue
    const declaration = content.slice('data-'.length)
    const equal = declaration.indexOf('=')
    const attribute = (equal === -1 ? declaration : declaration.slice(0, equal)).replace(/[~|^$*]\s*$/, '').trim()
    if (attribute === 'scope' || attribute === 'part')
      continue
    if (equal === -1) {
      states.push(attribute)
      continue
    }
    const rawValue = declaration.slice(equal + 1).trim()
    const value = /^(['"]).*\1$/.test(rawValue) ? rawValue.slice(1, -1) : rawValue
    states.push(`${attribute}=${value}`)
  }
  for (const match of selector.matchAll(/:{1,2}([a-z-]+)(?:\(([^)]*)\))?/g)) {
    const pseudo = match[1]
    if (pseudo === 'before' || pseudo === 'after')
      continue
    states.push(match[2] == null ? pseudo : `${pseudo}(${normalizeCss(match[2])})`)
  }
  states.push(...atRules.filter(rule => !rule.startsWith('@layer')))
  return states.length ? sorted(states) : ['default']
}

function defaultTokenOf(fallback) {
  const nested = fallback.match(/var\(\s*(--xh-[\w-]+)/)
  return nested?.[1] ?? normalizeCss(fallback)
}

function ownerOf(name, componentIds) {
  return componentIds.find(component => name.startsWith(`--xh-${component}-`)) ?? null
}

function isSkinMarker(name) {
  return name.endsWith('-skin')
}

function addUsage(records, name, component, usage) {
  let record = records.get(name)
  if (!record) {
    record = {
      name,
      component,
      parts: new Set(),
      properties: new Set(),
      states: new Set(),
      defaults: new Set(),
    }
    records.set(name, record)
  }
  if (record.component !== component)
    throw new Error(`[component-tokens] ${name} 同时归属 ${record.component} 与 ${component}`)
  usage.parts.forEach(value => record.parts.add(value))
  record.properties.add(usage.property)
  usage.states.forEach(value => record.states.add(value))
  record.defaults.add(usage.defaultToken)
}

function tokenDescription(record) {
  const parts = sorted(record.parts).join('、')
  const properties = sorted(record.properties).join('、')
  return `${record.component} 的 ${parts} 部件 ${properties} 覆盖槽。`
}

function mergeFacet(inherited, current, neutral) {
  const values = sorted([...inherited, ...current])
  return values.length > 1 ? values.filter(value => value !== neutral) : values
}

/** 把公开槽经过私有计算变量继续投影到最终 CSS 属性；状态与部件沿链合并。 */
function projectedUsages(declaration, consumers, inheritedParts = [], inheritedStates = [], trail = new Set()) {
  const parts = mergeFacet(inheritedParts, partsOf(declaration.selector), '*')
  const states = mergeFacet(inheritedStates, statesOf(declaration.selector, declaration.atRules), 'default')
  if (!declaration.property.startsWith(PRIVATE_PREFIX) || trail.has(declaration))
    return [{ parts, property: declaration.property, states }]
  const next = consumers.get(declaration.property) ?? []
  if (!next.length)
    return [{ parts, property: declaration.property, states }]
  const nextTrail = new Set(trail).add(declaration)
  return next.flatMap(consumer => projectedUsages(consumer, consumers, parts, states, nextTrail))
}

export async function buildComponentTokenManifest(options = {}) {
  const componentDocs = JSON.parse(await readFile(options.componentsPath ?? COMPONENT_DOCS_MANIFEST_PATH, 'utf8'))
  const componentIds = componentDocs.categories
    .flatMap(category => category.components.map(component => component.id))
    .sort((a, b) => b.length - a.length || compareText(a, b))
  const designTokens = new Set(Object.keys(JSON.parse(await readFile(options.designTokensPath ?? DESIGN_TOKENS_PATH, 'utf8'))))
  const stylesDir = options.stylesDir ?? STYLES_DIR
  const records = new Map()
  const noFallback = []
  const errors = []

  for (const sourceComponent of componentIds.slice().sort(compareText)) {
    const file = join(stylesDir, `${sourceComponent}.css`)
    let source
    try {
      source = stripComments(await readFile(file, 'utf8'))
    }
    catch {
      errors.push(`${sourceComponent}: 缺少独立组件皮肤 ${file}`)
      continue
    }
    const declarations = []
    walkCss(source, 0, source.length, [], declaration => declarations.push({
      ...declaration,
      calls: varCalls(declaration.value),
    }))
    const consumers = new Map()
    for (const declaration of declarations) {
      for (const call of declaration.calls) {
        if (!call.name.startsWith(PRIVATE_PREFIX))
          continue
        const list = consumers.get(call.name) ?? []
        if (!list.includes(declaration))
          list.push(declaration)
        consumers.set(call.name, list)
      }
    }

    for (const declaration of declarations) {
      for (const call of declaration.calls) {
        const { name, fallback } = call
        if (!/^--xh-[\w-]+$/.test(name))
          continue
        if (name.startsWith(PRIVATE_PREFIX) || designTokens.has(name) || isSkinMarker(name))
          continue
        const owner = ownerOf(name, componentIds)
        const line = lineAt(source, declaration.valueOffset + call.offset)
        if (!owner) {
          errors.push(`${sourceComponent}.css:${line} 消费了无组件归属的公开槽 ${name}`)
          continue
        }
        if (fallback == null) {
          noFallback.push({ name, file: `${sourceComponent}.css`, line })
          continue
        }
        for (const usage of projectedUsages(declaration, consumers)) {
          addUsage(records, name, owner, {
            ...usage,
            defaultToken: defaultTokenOf(fallback),
          })
        }
      }
    }
  }

  for (const usage of noFallback) {
    if (!records.has(usage.name))
      errors.push(`${usage.file}:${usage.line} 的公开槽 ${usage.name} 没有任何带 fallback 的生成事实源`)
  }
  if (errors.length)
    throw new Error(`[component-tokens] 组件公开槽合同无效：\n${errors.map(error => `  - ${error}`).join('\n')}`)

  const tokens = [...records.values()]
    .sort((a, b) => compareText(a.component, b.component) || compareText(a.name, b.name))
    .map(record => ({
      name: record.name,
      component: record.component,
      part: sorted(record.parts),
      property: sorted(record.properties),
      state: sorted(record.states),
      defaultToken: sorted(record.defaults),
      visibility: 'public',
      description: tokenDescription(record),
    }))

  return {
    $comment: '由 tooling/scripts/lib/component-token-manifest.mjs 从独立组件 CSS 的 var(public-slot, fallback) 消费位生成，禁止手改。',
    version: TOKEN_VERSION,
    tokens,
  }
}

export async function readComponentTokenManifest(path = COMPONENT_TOKEN_MANIFEST_PATH) {
  return JSON.parse(await readFile(path, 'utf8'))
}

export function componentTokensByComponent(manifest) {
  const out = new Map()
  for (const token of manifest.tokens ?? []) {
    const list = out.get(token.component) ?? []
    list.push(token)
    out.set(token.component, list)
  }
  return out
}

export function renderComponentTokenTypes(manifest) {
  const names = sorted(manifest.tokens.map(token => token.name))
  const components = sorted(manifest.tokens.map(token => token.component))
  const union = values => values.map(value => `  | '${value}'`).join('\n')
  return `// 由 component-token-manifest.mjs 生成，禁止手改。\n\nexport type ComponentTokenName =\n${union(names)}\n\nexport type ComponentTokenComponent =\n${union(components)}\n\nexport interface ComponentTokenDefinition {\n  readonly name: ComponentTokenName\n  readonly component: ComponentTokenComponent\n  readonly part: readonly string[]\n  readonly property: readonly string[]\n  readonly state: readonly string[]\n  readonly defaultToken: readonly string[]\n  readonly visibility: 'public'\n  readonly description: string\n}\n\nexport interface ComponentTokenManifest {\n  readonly version: ${TOKEN_VERSION}\n  readonly tokens: readonly ComponentTokenDefinition[]\n}\n`
}

function markdownCodeList(values) {
  return values.map(value => `\`${String(value).replace(/\|/g, '\\|')}\``).join('<br>')
}

export function renderComponentTokenDocs(tokens) {
  if (!tokens.length)
    return ''
  const lines = [
    COMPONENT_TOKEN_DOCS_START,
    '## CSS 变量',
    '',
    '本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。',
    '',
    '| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |',
    '| --- | --- | --- | --- | --- | --- |',
  ]
  for (const token of tokens) {
    lines.push(`| \`${token.name}\` | ${markdownCodeList(token.part)} | ${markdownCodeList(token.property)} | ${markdownCodeList(token.state)} | ${markdownCodeList(token.defaultToken)} | ${token.description} |`)
  }
  lines.push(COMPONENT_TOKEN_DOCS_END)
  return lines.join('\n')
}

export async function writeComponentTokenArtifacts(options = {}) {
  const manifest = await buildComponentTokenManifest(options)
  const manifestPath = options.manifestPath ?? COMPONENT_TOKEN_MANIFEST_PATH
  const typesPath = options.typesPath ?? COMPONENT_TOKEN_TYPES_PATH
  await writeFile(manifestPath, serializeComponentTokenArtifact(manifest), 'utf8')
  await writeFile(typesPath, renderComponentTokenTypes(manifest), 'utf8')
  return { manifest, manifestPath, typesPath }
}
