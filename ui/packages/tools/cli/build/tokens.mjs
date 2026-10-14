// 汇总设计令牌：名字与缺省取值来自 tokens.json，类型与改写档来自 DTCG 令牌源，语气族来自皮肤的语气层。
// @xihan-ui/cli 的离线数据与文档站的 llms-tokens.txt 都由它产出。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

/** 缺省档自身的令牌源，不算「改写档」。 */
const DEFAULT_LAYERS = new Set(['primitive', 'base', 'light'])

/** DTCG 组树展开成 { 令牌名: 类型 }，与令牌生成器同一套命名规则。 */
function flattenTypes(node, path = [], out = {}) {
  if (node && typeof node === 'object' && '$value' in node) {
    out[`--xh-${path.join('-').replace(/\./g, '_')}`] = node.$type ?? ''
    return out
  }
  for (const [key, child] of Object.entries(node ?? {})) {
    if (child && typeof child === 'object')
      flattenTypes(child, [...path, key], out)
  }
  return out
}

/** 沿 var() 把取值展开到不再引用已知令牌为止。 */
export function resolveTokenValue(values, value, depth = 0) {
  if (depth > 16)
    return value
  const next = value.replace(/var\((--[\w-]+)\)/g, (whole, name) => (name in values ? values[name] : whole))
  return next === value ? value : resolveTokenValue(values, next, depth + 1)
}

/**
 * 读出全部令牌。uiRoot 是 XiHan.UI 的 ui/ 目录。
 * @returns {Promise<{ tokens: { name: string, type: string, value: string, resolved: string, layers: string[] }[], tone: string[] }>}
 */
export async function collectTokens(uiRoot) {
  const tokensDir = join(uiRoot, 'packages/design/tokens/tokens')
  const values = JSON.parse(await readFile(join(uiRoot, 'packages/design/tokens/tokens.json'), 'utf8'))

  const types = {}
  const layers = {}
  for (const file of (await readdir(tokensDir)).sort()) {
    if (!file.endsWith('.json'))
      continue
    const layer = file.replace(/^semantic\./, '').replace(/\.json$/, '')
    const flat = flattenTypes(JSON.parse(await readFile(join(tokensDir, file), 'utf8')))
    for (const [name, type] of Object.entries(flat)) {
      types[name] ??= type
      ;(layers[name] ??= []).push(layer)
    }
  }

  const tokens = Object.entries(values).map(([name, value]) => ({
    name,
    type: types[name] ?? '',
    value,
    resolved: resolveTokenValue(values, value),
    layers: (layers[name] ?? []).filter(layer => !DEFAULT_LAYERS.has(layer)),
  }))

  const toneCss = await readFile(join(uiRoot, 'packages/design/styles/css/tone.css'), 'utf8')
  const tone = [...new Set([...toneCss.matchAll(/^\s*(--xh-tone-[\w-]+):/gm)].map(hit => hit[1]))].sort()

  return { tokens, tone }
}
