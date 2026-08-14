#!/usr/bin/env node
// 门禁：每份皮肤引用的动画名，都必须在同一份皮肤里定义过。
//
// styles 的 exports 逐组件铺了一百多条子入口，`import '@xihan-ui/styles/dialog.css'` 是受支持的用法。
// 而 @keyframes 的名字查找只认「文档里有没有这个名字」——引用别处文件里的名字时，
// 那份文件不一定在场，动画会静默地整个不跑：不报错、不降级，看上去就是「没做动效」。
//
// 同名的多份定义必须逐字一致：名字是全局的，两份不同内容会按出现顺序互相覆盖。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'

/** 去掉块注释：注释里提到的动画名不是引用。 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

/** 从 open 处的左花括号配对求块尾下标。 */
function blockEnd(css, open) {
  let depth = 0
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{')
      depth++
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

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()

/** 文件 → 定义；以及全局的 名字 → [{ file, body }]。 */
const defsByFile = new Map()
const defsByName = new Map()
for (const file of files) {
  const css = stripComments(await readFile(join(STYLES_DIR, file), 'utf8'))
  const defs = definitions(css)
  defsByFile.set(file, { defs, refs: references(css) })
  for (const [name, def] of defs) {
    if (!defsByName.has(name))
      defsByName.set(name, [])
    defsByName.get(name).push({ file, ...def })
  }
}

const crossFile = []
const undefinedRefs = []
const drifted = []
const unlayered = []

for (const [file, { defs, refs }] of defsByFile) {
  for (const name of refs) {
    if (defs.has(name))
      continue
    const elsewhere = defsByName.get(name)
    if (elsewhere === undefined)
      undefinedRefs.push(`${file} 引用了 ${name}，但整个皮肤目录里都没有这个动画`)
    else
      crossFile.push(`${file} 引用了 ${name}，而它定义在 ${elsewhere.map(e => e.file).join(' / ')}——单独引入本文件时动画不跑`)
  }
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

const problems = [...undefinedRefs, ...crossFile, ...drifted, ...unlayered]
if (problems.length > 0) {
  console.error('[check-keyframe-refs] 动画名的引用与定义对不上：')
  for (const p of problems) console.error(`  ${p}`)
  console.error('  每份皮肤都要能单独引入，它用到的动画就得写在自己身上。')
  process.exit(1)
}

const total = [...defsByName.values()].reduce((n, list) => n + list.length, 0)
const shared = [...defsByName].filter(([, list]) => list.length > 1).length
console.log(`[check-keyframe-refs] 通过：${files.length} 份皮肤 · ${total} 处动画定义（${defsByName.size} 个名字，其中 ${shared} 个被多份皮肤各自带了一份），引用全部就地可解析`)
