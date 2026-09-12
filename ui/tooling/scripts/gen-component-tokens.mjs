#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import {
  buildComponentTokenManifest,
  COMPONENT_TOKEN_MANIFEST_PATH,
  COMPONENT_TOKEN_TYPES_PATH,
  renderComponentTokenTypes,
  serializeComponentTokenArtifact,
  writeComponentTokenArtifacts,
} from './lib/component-token-manifest.mjs'

const checkOnly = process.argv.includes('--check')

if (!checkOnly) {
  const { manifest } = await writeComponentTokenArtifacts()
  console.log(`[gen-component-tokens] 已生成 ${manifest.tokens.length} 个组件公开覆盖槽`)
  process.exit(0)
}

const expected = await buildComponentTokenManifest()
const expectedManifest = serializeComponentTokenArtifact(expected)
const expectedTypes = renderComponentTokenTypes(expected)
const problems = []

for (const [path, wanted] of [
  [COMPONENT_TOKEN_MANIFEST_PATH, expectedManifest],
  [COMPONENT_TOKEN_TYPES_PATH, expectedTypes],
]) {
  const actual = await readFile(path, 'utf8').catch(() => null)
  if (actual !== wanted)
    problems.push(path)
}

if (problems.length) {
  console.error('[gen-component-tokens] ✗ 生成物与 CSS 消费位不一致：')
  problems.forEach(path => console.error(`  ${path}`))
  console.error('  运行 pnpm component-tokens 重新生成；禁止手改 manifest 或声明文件。')
  process.exit(1)
}

console.log(`[gen-component-tokens] 通过：manifest 与类型声明可由 ${expected.tokens.length} 个 CSS 覆盖槽复现`)
