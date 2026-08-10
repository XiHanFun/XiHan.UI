// 产物拼装：IconRecord 数组 -> index.mjs / index.d.mts / types.d.mts。
// 每个图标一个顶层 export const，纯对象字面量，打包器能逐个证明未被引用。

const BARE_KEY = /^[a-z_$][\w$]*$/i

/** 生成头，指回真源。 */
export const GENERATED_HEADER = '// 由 build/build-icons.mjs 从 src/svg 生成，勿手改。'

/** 类型副本头，指回 core 的真源。 */
export const TYPES_HEADER = '// 由 core 的 icon 类型生成，勿手改。'

function quote(text) {
  return `'${text.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/\n/g, '\\n')}'`
}

function key(name) {
  return BARE_KEY.test(name) ? name : quote(name)
}

function attrsLiteral(attrs) {
  return `{ ${Object.entries(attrs).map(([k, v]) => `${key(k)}: ${quote(v)}`).join(', ')} }`
}

function nodeLiteral(node) {
  const parts = [`tag: ${quote(node.tag)}`]
  if (node.attrs)
    parts.push(`attrs: ${attrsLiteral(node.attrs)}`)
  if (node.children)
    parts.push(`children: [${node.children.map(nodeLiteral).join(', ')}]`)
  return `{ ${parts.join(', ')} }`
}

/** 一条记录的 JS 字面量。 */
export function recordLiteral(record) {
  const parts = [`name: ${quote(record.name)}`, `viewBox: ${quote(record.viewBox)}`]
  if (record.attrs)
    parts.push(`attrs: ${attrsLiteral(record.attrs)}`)
  parts.push(`nodes: [${record.nodes.map(nodeLiteral).join(', ')}]`)
  return `{ ${parts.join(', ')} }`
}

/** arrow-down -> ArrowDownIcon */
export function exportNameOf(name) {
  const pascal = name.split('-').map(seg => seg[0].toUpperCase() + seg.slice(1)).join('')
  return `${pascal}Icon`
}

/** 运行期模块。 */
export function renderModule(icons) {
  const lines = [GENERATED_HEADER, '']
  for (const { exportName, record } of icons)
    lines.push(`export const ${exportName} = ${recordLiteral(record)}`)
  lines.push('')
  return lines.join('\n')
}

/** 类型声明。类型从同目录的 types 副本来，包本身零依赖。 */
export function renderDeclaration(icons) {
  const lines = [
    GENERATED_HEADER,
    '',
    'import type { IconRecord } from \'./types.mjs\'',
    '',
    'export type { IconNode, IconRecord, IconTag } from \'./types.mjs\'',
    '',
  ]
  for (const { exportName, record } of icons)
    lines.push(`/** ${record.name} */\nexport declare const ${exportName}: IconRecord`)
  lines.push('')
  return lines.join('\n')
}

/** 类型副本：头 + core 那份逐字节原文。 */
export function renderTypes(coreSource) {
  return `${TYPES_HEADER}\n${coreSource}`
}

/** 类型副本对应的运行期空模块，让 ./types.mjs 这个说明符在工具链里解析得到。 */
export function renderTypesRuntime() {
  return `${GENERATED_HEADER}\n\nexport {}\n`
}
