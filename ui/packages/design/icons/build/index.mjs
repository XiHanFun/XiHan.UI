// 管线出口。测试只从这里进，不碰过滤器内部函数。
import { readdir, readFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { exportNameOf } from './emit.mjs'
import { IconPipelineError } from './error.mjs'
import { svgToIconRecord } from './to-record.mjs'

export {
  exportNameOf,
  GENERATED_HEADER,
  recordLiteral,
  renderDeclaration,
  renderModule,
  renderTypes,
  renderTypesRuntime,
  TYPES_HEADER,
} from './emit.mjs'
export { IconPipelineError } from './error.mjs'
export { svgToIconRecord } from './to-record.mjs'

/**
 * 扫一个目录里的 *.svg，按文件名排序产出图标集。
 * 同一集合内的 id 全局去重在这里兜底断言（记录内的重写已按图标名分段）。
 */
export async function buildIconSet(dir) {
  const files = (await readdir(dir)).filter(f => f.endsWith('.svg')).sort()
  const icons = []
  const seenIds = []
  for (const file of files) {
    const name = basename(file, '.svg')
    const source = await readFile(join(dir, file), 'utf8')
    const { record, notes } = svgToIconRecord(source, name, file)
    icons.push({ name, exportName: exportNameOf(name), record, notes })
    collectIds(record.nodes, seenIds)
  }
  if (seenIds.length !== new Set(seenIds).size)
    throw new IconPipelineError(`${dir}：集合内出现重复的 id`)
  return icons
}

function collectIds(nodes, into) {
  for (const node of nodes) {
    if (node.attrs?.id !== undefined)
      into.push(node.attrs.id)
    if (node.children)
      collectIds(node.children, into)
  }
}
