#!/usr/bin/env node
// 门禁：每份皮肤引用的动画名，都必须在「本皮肤 + 本皮肤 @import 的家族文件」里定义过。
//
// styles 的 exports 逐组件铺了一百多条子入口，`import '@xihan-ui/styles/dialog.css'` 是受支持的用法。
// 而 @keyframes 的名字查找只认「文档里有没有这个名字」——引用别处文件里的名字时，
// 那份文件不一定在场，动画会静默地整个不跑：不报错、不降级，看上去就是「没做动效」。
//
// 单独引入成立的条件是「名字随本文件一起到场」：要么写在本皮肤身上（组件专属关键帧），
// 要么由本皮肤 @import 的 family/motion.css 带到场（跨皮肤共用的关键帧）。
// 只在 index.css 引一次不算：按需引入的人拿不到它。
//
// 共享关键帧只许住在 family/motion.css：皮肤内重定义同名会按出现顺序互相覆盖，而两份帧体
// 迟早分叉。反过来，@import 了 motion.css 却一个共享名字都没引用，是死引入，同样判红。
//
// 同名的多份定义必须逐字一致：名字是全局的，两份不同内容会按出现顺序互相覆盖。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ADAPTERS, reactCovered, reactProgress } from './lib/adapters.mjs'

const STYLES_DIR = 'packages/design/styles/css'
const FAMILY_DIR = 'packages/design/styles/family'
/** 共享关键帧的唯一真源；皮肤靠这条相对 @import 把它带到场。 */
const MOTION_FAMILY = 'motion.css'
const MOTION_IMPORT = `@import '../family/${MOTION_FAMILY}';`
/** 组件总数的分母：一个组件一份套件。 */
const SUITES_DIR = 'tooling/testing/src/suites'
/** 适配器源码：内联样式里不许引用动画名，它们不归任何一份皮肤管，名字在不在场没人保证。 */
const ADAPTER_DIRS = Object.values(ADAPTERS).map(a => ({ label: a.label, dir: `${a.root}/src`, name: a.name }))

/** 去掉块注释：注释里提到的动画名不是引用。 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

/** 从 open 处的左花括号配对求块尾下标。 */
function blockEnd(css, open) {
  let depth = 0
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') {
      depth++
    }
    else if (css[i] === '}') {
      depth--
      if (depth === 0)
        return i
    }
  }
  return css.length
}

/** 动效层的区间：关键帧只许写在这一层。 */
function motionRanges(css) {
  const out = []
  const re = /@layer\s+xihan\.motion\s*\{/g
  for (let m = re.exec(css); m !== null; m = re.exec(css)) {
    const open = m.index + m[0].length - 1
    out.push([open, blockEnd(css, open)])
  }
  return out
}

/** 取一份皮肤定义的动画名 → { 归一化后的帧体, 是否在动效层内 }。 */
function definitions(css) {
  const out = new Map()
  const ranges = motionRanges(css)
  const re = /@keyframes\s+([\w-]+)\s*\{/g
  for (let m = re.exec(css); m !== null; m = re.exec(css)) {
    const open = m.index + m[0].length - 1
    const end = blockEnd(css, open)
    out.set(m[1], {
      body: css.slice(open + 1, end).replace(/\s+/g, ' ').trim(),
      layered: ranges.some(([from, to]) => m.index > from && end < to),
    })
  }
  return out
}

/**
 * 取一份皮肤引用的动画名。
 *
 * 只扫 animation / animation-name 与自定义属性的值：前两者是直接引用，
 * 后者是把名字存进私有槽再由 animation-name 取出来（marquee 走这条）。
 * `--xh-` 开头的是属性名不是动画名，靠 `xh-` 前面不许是连字符排掉。
 */
function references(css) {
  const out = new Set()
  for (const [, prop, value] of css.matchAll(/([\w-]+)\s*:\s*([^;{}]+)/g)) {
    if (prop !== 'animation' && prop !== 'animation-name' && !prop.startsWith('--'))
      continue
    for (const [name] of value.matchAll(/(?<![-\w])xh-[a-z0-9-]+/g))
      out.add(name)
  }
  return out
}

/** 皮肤里的相对 @import，只认 ../family/ 下的文件；别的相对引入（./scrollbar.css 一类）不带关键帧。 */
function familyImports(css) {
  return [...css.matchAll(/^\s*@import\s+['"]\.\.\/family\/([\w-]+\.css)['"]\s*;/gm)].map(m => m[1])
}

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()

/** 家族文件里的定义：名字 → { body, layered }。当前只有 motion.css 带关键帧。 */
const familyDefs = new Map()
for (const file of (await readdir(FAMILY_DIR)).filter(f => f.endsWith('.css')).sort()) {
  const css = stripComments(await readFile(join(FAMILY_DIR, file), 'utf8'))
  for (const [name, def] of definitions(css)) {
    if (familyDefs.has(name))
      familyDefs.set(name, { ...def, file: `family/${file}`, duplicate: true })
    else
      familyDefs.set(name, { ...def, file: `family/${file}` })
  }
}
const motionNames = new Set([...familyDefs].filter(([, d]) => d.file === `family/${MOTION_FAMILY}`).map(([name]) => name))
if (motionNames.size === 0) {
  console.error(`[check-keyframe-refs] ✗ ${FAMILY_DIR}/${MOTION_FAMILY} 里一个 @keyframes 都没有——共享关键帧的真源不在场`)
  process.exit(1)
}

/** 文件 → 定义；以及全局的 名字 → [{ file, body }]。 */
const defsByFile = new Map()
const defsByName = new Map()
for (const file of files) {
  const css = stripComments(await readFile(join(STYLES_DIR, file), 'utf8'))
  const defs = definitions(css)
  defsByFile.set(file, { defs, refs: references(css), imports: familyImports(css) })
  for (const [name, def] of defs) {
    if (!defsByName.has(name))
      defsByName.set(name, [])
    defsByName.get(name).push({ file, ...def })
  }
}
for (const [name, def] of familyDefs) {
  if (!defsByName.has(name))
    defsByName.set(name, [])
  defsByName.get(name).push({ file: def.file, body: def.body, layered: def.layered })
  if (def.duplicate)
    defsByName.get(name).push({ file: def.file, body: def.body, layered: def.layered })
}

const crossFile = []
const undefinedRefs = []
const drifted = []
const unlayered = []
const redefined = []
const deadImport = []
const missingImport = []

for (const [file, { defs, refs, imports }] of defsByFile) {
  // 本皮肤 @import 的家族文件带到场的名字
  const inScope = new Set()
  for (const [name, def] of familyDefs) {
    if (imports.includes(def.file.slice('family/'.length)))
      inScope.add(name)
  }
  for (const name of refs) {
    if (defs.has(name) || inScope.has(name))
      continue
    const elsewhere = defsByName.get(name)
    if (elsewhere === undefined)
      undefinedRefs.push(`${file} 引用了 ${name}，但整个皮肤目录里都没有这个动画`)
    else
      crossFile.push(`${file} 引用了 ${name}，而它定义在 ${elsewhere.map(e => e.file).join(' / ')}——单独引入本文件时动画不跑`)
  }
  // (a) 皮肤内重定义共享关键帧：名字是全局的，两份定义按出现顺序互相覆盖
  for (const name of defs.keys()) {
    if (motionNames.has(name))
      redefined.push(`${file} 重定义了 ${name}——共享关键帧只许住在 family/${MOTION_FAMILY}，皮肤改成 @import 它`)
  }
  // (b) 引入与引用双向对账：死引入与漏引入都判红
  const usesShared = [...refs].some(name => motionNames.has(name))
  const importsMotion = imports.includes(MOTION_FAMILY)
  if (importsMotion && !usesShared)
    deadImport.push(`${file} @import 了 family/${MOTION_FAMILY}，却没有引用其中任何一个关键帧——死引入，删掉那条 @import`)
  if (usesShared && !importsMotion)
    missingImport.push(`${file} 引用了 family/${MOTION_FAMILY} 里的关键帧却没有 ${MOTION_IMPORT}——单独引入本文件时动画不跑`)
}

for (const [name, list] of defsByName) {
  const bodies = new Set(list.map(e => e.body))
  if (bodies.size > 1)
    drifted.push(`${name} 在 ${list.map(e => e.file).join(' / ')} 里的帧体不一致——同名动画是全局的，会互相覆盖`)
  for (const e of list) {
    if (!e.layered)
      unlayered.push(`${e.file} 的 ${name} 不在 @layer xihan.motion 里——使用者按层覆盖关键帧时会盖不住`)
  }
}

/** 递归列出目录下的源码文件。 */
async function walk(dir) {
  const out = []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  }
  catch {
    return out
  }
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory())
      out.push(...await walk(path))
    else if (/\.(?:ts|tsx|vue)$/.test(entry.name) && !/\.(?:test|spec)\./.test(entry.name))
      out.push(path)
  }
  return out
}

const covered = await reactCovered()
const suiteCount = (await readdir(SUITES_DIR)).filter(f => f.endsWith('.suite.ts')).length

/** React 侧还没铺到的组件：目录不该有文件，真有也先不核，铺开进度由 react-coverage.json 单点控制。 */
function skipUnrolled(adapter, path) {
  if (adapter !== 'react')
    return false
  const at = path.replace(/\\/g, '/').match(/\/src\/components\/([^/]+)\//)
  return at !== null && !covered.has(at[1])
}

/** 适配器里写进内联样式的动画名：模板不附属于任何皮肤，引用名字的那份皮肤不一定在场。 */
const inlined = []
const scanned = new Map()
for (const { label, dir, name } of ADAPTER_DIRS) {
  let count = 0
  for (const path of await walk(dir)) {
    if (skipUnrolled(name, path))
      continue
    count++
    const src = stripComments(await readFile(path, 'utf8')).replace(/(^|[^:])\/\/.*$/gm, '$1')
    for (const m of src.matchAll(/animation(?:Name|-name)?['"]?\s*[:=]\s*[`'"][^`'"]*?(?<![-\w])(xh-[a-z0-9-]+)/g))
      inlined.push(`${label}：${path.replace(/\\/g, '/')} 在内联样式里引用了动画名 ${m[1]}——适配器代码不附属于任何皮肤，改用 Web Animations 或由皮肤按 data 属性播`)
  }
  scanned.set(label, count)
}

const problems = [...undefinedRefs, ...crossFile, ...redefined, ...deadImport, ...missingImport, ...drifted, ...unlayered, ...inlined]
if (problems.length > 0) {
  console.error('[check-keyframe-refs] 动画名的引用与定义对不上：')
  for (const p of problems) console.error(`  ${p}`)
  console.error(`  每份皮肤都要能单独引入：组件专属关键帧写在自己身上，共享关键帧由 ${MOTION_IMPORT} 带到场。`)
  process.exit(1)
}

const total = [...defsByName.values()].reduce((n, list) => n + list.length, 0)
const importers = [...defsByFile.values()].filter(({ imports }) => imports.includes(MOTION_FAMILY)).length
console.log(`[check-keyframe-refs] 通过：${files.length} 份皮肤 · ${total} 处动画定义（${defsByName.size} 个名字，其中 ${motionNames.size} 个共享关键帧只定义在 family/${MOTION_FAMILY}、由 ${importers} 份皮肤 @import），引用全部就地可解析`)
console.log(
  `[check-keyframe-refs] 三个适配器的源码里没有内联的动画名：`
  + `${[...scanned].map(([label, n]) => `${label} ${n} 份`).join(' · ')}`
  + `（${reactProgress(covered, suiteCount)}，没铺到的组件不核）`,
)
