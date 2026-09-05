#!/usr/bin/env node
// 读 src/svg -> 过管线 -> 写 dist/index.mjs、dist/index.d.mts、dist/types.d.mts、dist/types.mjs。
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildIconSet, renderDeclaration, renderModule, renderTypes, renderTypesRuntime } from './index.mjs'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SVG_DIR = join(ROOT, 'src', 'svg')
const DIST = join(ROOT, 'dist')

/** core 里的 icon 类型真源；这个包不依赖 core，只把它逐字节复制进产物。 */
const CORE_ICON_TYPES = join(ROOT, '..', '..', 'engine', 'core', 'src', 'kernel', 'types', 'icon.ts')

async function main() {
  const icons = await buildIconSet(SVG_DIR)
  const coreTypes = await readFile(CORE_ICON_TYPES, 'utf8')

  await mkdir(DIST, { recursive: true })
  await writeFile(join(DIST, 'index.mjs'), renderModule(icons))
  await writeFile(join(DIST, 'index.d.mts'), renderDeclaration(icons))
  await writeFile(join(DIST, 'types.d.mts'), renderTypes(coreTypes))
  await writeFile(join(DIST, 'types.mjs'), renderTypesRuntime())

  console.log(`[build-icons] ${icons.length} 个图标 → dist/index.mjs · index.d.mts · types.d.mts`)
}

main()
