#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildComponentTokenManifest,
  COMPONENT_TOKEN_DOCS_END,
  COMPONENT_TOKEN_DOCS_START,
  COMPONENT_TOKEN_MANIFEST_PATH,
  COMPONENT_TOKEN_TYPES_PATH,
  componentTokensByComponent,
  renderComponentTokenDocs,
  renderComponentTokenTypes,
  serializeComponentTokenArtifact,
} from './lib/component-token-manifest.mjs'

const problems = []
const docsDir = fileURLToPath(new URL('../../../docs/components/', import.meta.url))

const expected = await buildComponentTokenManifest()
const expectedByComponent = componentTokensByComponent(expected)
const componentDocs = JSON.parse(await readFile(new URL('../../scripts/component-docs.manifest.json', import.meta.url), 'utf8'))
const components = componentDocs.categories.flatMap(category => category.components.map(component => component.id)).sort()

async function expectFile(path, content, label) {
  const actual = await readFile(path, 'utf8').catch(() => null)
  if (actual !== content)
    problems.push(`${label} 不能由当前 CSS 重现：${path}`)
}

await expectFile(COMPONENT_TOKEN_MANIFEST_PATH, serializeComponentTokenArtifact(expected), 'manifest')
await expectFile(COMPONENT_TOKEN_TYPES_PATH, renderComponentTokenTypes(expected), 'TS 声明')

const publicSurface = JSON.parse(await readFile(new URL('../public-surface.json', import.meta.url), 'utf8'))
const expectedNames = expected.tokens.map(token => token.name).sort()
if (JSON.stringify(publicSurface.cssSlots) !== JSON.stringify(expectedNames))
  problems.push('tooling/public-surface.json 的 cssSlots 与组件令牌 manifest 不一致')

const cemPath = new URL('../../packages/adapters/web-components/custom-elements.json', import.meta.url)
const cem = JSON.parse(await readFile(cemPath, 'utf8'))
const cemByTag = new Map()
for (const mod of cem.modules ?? []) {
  for (const declaration of mod.declarations ?? []) {
    if (declaration.tagName)
      cemByTag.set(declaration.tagName, declaration)
  }
}

for (const component of components) {
  const expectedNames = (expectedByComponent.get(component) ?? []).map(token => token.name)
  const declaration = cemByTag.get(`xh-${component}`)
  if (!declaration) {
    problems.push(`CEM 缺少 xh-${component}，无法登记组件覆盖槽`)
    continue
  }
  const actualNames = (declaration.cssProperties ?? []).map(property => property.name)
  if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames))
    problems.push(`CEM xh-${component} 的 cssProperties 与 manifest 不一致`)

  const docsPath = join(docsDir, `${component}.md`)
  const docs = await readFile(docsPath, 'utf8').catch(() => null)
  if (docs == null) {
    problems.push(`组件文档缺失：${docsPath}`)
    continue
  }
  const expectedBlock = renderComponentTokenDocs(expectedByComponent.get(component) ?? [], { headingLevel: 3 })
  const start = docs.indexOf(COMPONENT_TOKEN_DOCS_START)
  const end = docs.indexOf(COMPONENT_TOKEN_DOCS_END)
  if (!expectedBlock) {
    if (start !== -1 || end !== -1)
      problems.push(`${component}.md 不应保留空的组件令牌区块`)
    continue
  }
  if (start === -1 || end === -1) {
    problems.push(`${component}.md 缺少 manifest 生成的组件令牌区块`)
    continue
  }
  const actualBlock = docs.slice(start, end + COMPONENT_TOKEN_DOCS_END.length)
  if (actualBlock !== expectedBlock)
    problems.push(`${component}.md 的组件令牌表与 manifest 不一致`)
  if (docs.slice(start + 1).includes(COMPONENT_TOKEN_DOCS_START) || docs.slice(end + 1).includes(COMPONENT_TOKEN_DOCS_END))
    problems.push(`${component}.md 出现重复的组件令牌区块`)
}

if (problems.length) {
  console.error('[check-component-tokens] ✗ CSS / manifest / TS / 文档 / CEM 未闭环：')
  problems.forEach(problem => console.error(`  - ${problem}`))
  process.exit(1)
}

console.log(`[check-component-tokens] 通过：${components.length} 个组件、${expected.tokens.length} 个公开槽六方完全一致`)
