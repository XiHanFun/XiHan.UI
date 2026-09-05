#!/usr/bin/env node
// 门禁：浮层的默认落点与间距只许引共享常量，不许各族自己写字面量。
//
// 定位引擎收不到 placement / offset 时会用自己的缺省兜底，各族机器再各写一份
// 'bottom' / 'bottom-start' / 8，三处就会各自漂移：改一处另两处不跟，
// 使用者看到的「默认」取决于那一族恰好怎么写。headless/src/shared/overlay.ts 的
// OVERLAY_PLACEMENT_ANCHORED / OVERLAY_PLACEMENT_LIST / OVERLAY_OFFSET 是唯一真源，
// 带定位层的族在 machine / connect 里只能引它们。context-menu 与 tour 各有自己的
// offset 常量（0 与 12），它们不是兜底字面量，这里不管。
import { readdir, readFile } from 'node:fs/promises'

const HEADLESS = 'packages/engine/headless/src'
const SHARED = `${HEADLESS}/shared/overlay.ts`

/** 没有 positioner 部件、但把定位交给别的族的组合族：跟着宿主一起受管。 */
const COMPOSED = ['popconfirm']

/** 只在皮肤里用 inset 排布、不交给定位引擎的族：没有 placement / offset 可兜底。 */
const NOT_ENGINE_POSITIONED = new Set(['dialog', 'drawer', 'floating-panel', 'image-viewer'])

/** 共享常量的名字；兜底处至少要 import 其中一个。 */
const SHARED_NAMES = ['OVERLAY_PLACEMENT_ANCHORED', 'OVERLAY_PLACEMENT_LIST', 'OVERLAY_OFFSET']

/** machine / connect 里的字面量兜底：`?? 'bottom'`、`?? 'bottom-start'`、`?? 8`。 */
const RE_LITERAL_FALLBACK = /\?\?\s*(?:'bottom(?:-start|-end)?'|"bottom(?:-start|-end)?"|8)\b/g

async function read(path) {
  try {
    return await readFile(path, 'utf8')
  }
  catch {
    return null
  }
}

function lineOf(source, index) {
  let line = 1
  for (let i = 0; i < index; i++) {
    if (source[i] === '\n')
      line++
  }
  return line
}

/** 文件是否从共享模块引了至少一个默认值常量。 */
function importsShared(source) {
  const match = source.match(/import\s*\{([^}]*)\}\s*from\s*'\.\.\/shared\/overlay'/)
  if (!match)
    return false
  return match[1].split(',').some(raw => SHARED_NAMES.includes(raw.trim()))
}

/** 文件是否引了同族 machine 里由共享常量派生的 `<C>_DEFAULT_PLACEMENT`。 */
function importsFamilyDefault(source, family) {
  const re = new RegExp(`import\\s*\\{[^}]*\\b[A-Z_]+_DEFAULT_PLACEMENT\\b[^}]*\\}\\s*from\\s*'\\./${family}\\.machine'`)
  return re.test(source)
}

const shared = await read(SHARED)
if (!shared) {
  console.error(`[check-overlay-defaults] ✗ 找不到 ${SHARED}`)
  process.exit(1)
}
for (const name of SHARED_NAMES) {
  if (!new RegExp(`export const ${name}\\b`).test(shared)) {
    console.error(`[check-overlay-defaults] ✗ ${SHARED} 没有导出 ${name}`)
    process.exit(1)
  }
}

const dirs = await readdir(HEADLESS, { withFileTypes: true })
const problems = []
const families = []

for (const d of dirs) {
  if (!d.isDirectory())
    continue
  const anatomy = await read(`${HEADLESS}/${d.name}/${d.name}.anatomy.ts`)
  const positioned = anatomy?.includes('\'positioner\'') && !NOT_ENGINE_POSITIONED.has(d.name)
  if (!positioned && !COMPOSED.includes(d.name))
    continue
  families.push(d.name)
}

for (const name of COMPOSED) {
  if (!families.includes(name))
    problems.push(`COMPOSED 里登记的 ${name} 在 ${HEADLESS} 下找不到，名单过期`)
}
for (const name of NOT_ENGINE_POSITIONED) {
  const anatomy = await read(`${HEADLESS}/${name}/${name}.anatomy.ts`)
  if (!anatomy?.includes('\'positioner\''))
    problems.push(`NOT_ENGINE_POSITIONED 里登记的 ${name} 没有 positioner 部件，名单过期`)
}

let wired = 0
for (const family of families) {
  const machinePath = `${HEADLESS}/${family}/${family}.machine.ts`
  const connectPath = `${HEADLESS}/${family}/${family}.connect.ts`
  const machine = await read(machinePath)
  const connect = await read(connectPath)

  for (const [path, source] of [[machinePath, machine], [connectPath, connect]]) {
    if (!source)
      continue
    for (const match of source.matchAll(RE_LITERAL_FALLBACK))
      problems.push(`${path}:${lineOf(source, match.index)} 用字面量兜底 \`${match[0]}\`——改引 shared/overlay 的共享常量`)
  }

  // 兜底的那一处要引共享常量：有 machine 的族看 machine；组合族看 connect
  const fallbackFile = machine ? machinePath : connectPath
  const fallbackSource = machine ?? connect
  if (!fallbackSource) {
    problems.push(`${family} 既没有 machine 也没有 connect`)
    continue
  }
  if (importsShared(fallbackSource)) {
    wired++
  }
  else {
    problems.push(`${fallbackFile} 没有从 ../shared/overlay 引 ${SHARED_NAMES.join(' / ')} 之一`)
  }
  // connect 写 data-placement 的兜底要么引共享常量，要么引同族 machine 派生的默认值
  if (machine && connect && /\?\?\s*[A-Z_]+_DEFAULT_PLACEMENT\b/.test(connect)
    && !importsShared(connect) && !importsFamilyDefault(connect, family)) {
    problems.push(`${connectPath} 兜底用的 _DEFAULT_PLACEMENT 既不来自 ../shared/overlay 也不来自 ./${family}.machine`)
  }
}

if (problems.length) {
  console.error('[check-overlay-defaults] ✗ 浮层默认值没有收口：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error(`落点引 OVERLAY_PLACEMENT_ANCHORED（气泡类）或 OVERLAY_PLACEMENT_LIST（列表类），间距写 prop('offset') ?? OVERLAY_OFFSET。`)
  process.exit(1)
}

console.log(`[check-overlay-defaults] 通过：${families.length} 个浮层族（含 ${COMPOSED.length} 个组合族）的默认落点与间距都引共享常量，${wired} 处兜底接线`)
