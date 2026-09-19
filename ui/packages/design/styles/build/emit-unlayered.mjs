// 产出 index.unlayered.css：把 index.css 引到的皮肤逐个内联，并拆掉 @layer 外壳。
//
// 为什么要这么一份：CSS 级联里无层声明胜过任何有层声明，与特异性无关。宿主应用只要
// 带一条无层的 reset/normalize（`button { padding: 0; background-color: transparent }`
// 这类），本库整套皮肤就会被压掉。而 `@import ... layer()` 只能给无层样式加层，
// 没有反向操作——所以层化是使用者无法撤销的单向门，得由库这边提供不带层的一份。
//
// 拆层后规则改按特异性竞争，三档从低到高：reset 层全部 :where() 包住为 (0,0,0)，
// Family Recipe 的规则在这一份里由 [data-scope] 前缀抬到 (0,2,0)（源文件仍是
// [data-xh-action-control] 一类的 (0,1,0)，有层产物靠层序不必抬），与皮肤选择器
// [data-scope=x][data-part=y] 同档，都稳压宿主的 button（0,0,1）与 .article a（0,1,1）
// 这类带类名的标签规则——配方直接写在 <a>、<li>、<td> 这些裸标签上的底与字，
// 否则会被宿主的正文排版压掉（文档站的 .vp-doc a 正是这样把侧栏导航链接变回 UA 蓝）。
// 家族属性只由 connect 写在角色节点上，角色节点必带 data-scope，前缀不改变命中范围。
//
// 抬到同档之后，皮肤与配方之间只剩源序竞争。有层产物里皮肤只要比配方高一级就稳赢，
// 皮肤于是直接盖配方的物理属性（InputGroup 用 (0,4,0) 把内嵌字段外壳的 outline 置 none，
// 压过配方 (0,3,0) 的聚焦环）；这一份里两边同为 (0,4,0)，配方若排在皮肤之后就反过来赢，
// 而有层产物、单测与其余门禁全绿——InputGroup 就这样在文档站叠出第二圈焦点环。
// 所以 family/ 下全部配方在这一份里紧随令牌、先于一切皮肤内联一次（皮肤自己的相对
// @import 展开到已内联的文件时跳过），同档时皮肤靠源序胜出，与有层产物「皮肤 ≥ 配方 + 1
// 即胜」等价。这也让配方排在 reset 之前：reset 只有低一档才不会靠源序把配方的字号压掉。
// 两条先后都由 check-layer-order 门禁断言。motion 层装的是 @keyframes、不参与级联，
// 一并提前只为去重。
//
// 代价是 xihan.overrides 这个覆盖槽位在这一份里不存在，使用者改用特异性覆盖。
// 两份的取舍写在文档站的「安装与接入」。
//
// 用法：node build/emit-unlayered.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyFileHeader, stripFileHeader } from '../../../../tooling/file-header.mjs'

const pkgRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const entry = path.join(pkgRoot, 'index.css')
const outFile = path.join(pkgRoot, 'index.unlayered.css')
const FAMILY_DIR = path.join(pkgRoot, 'family')
const FAMILY_ROOT_ATTR = /\[data-xh-(?:action-control|field-chrome|collection-item|collection-separator|swatch)\]/g
/**
 * 先于一切皮肤内联的配方，顺序固定：四个家族互不引用，谁先谁后不影响级联；
 * 顺序定死只为产物可比对。motion.css 只装 @keyframes，提前只为去重。
 */
const FAMILY_FILES = ['action-control.css', 'field-chrome.css', 'collection-item.css', 'swatch.css', 'motion.css']

const source = stripFileHeader(fs.readFileSync(entry, 'utf8'))

const head = [
  '/* 本文件由 build/emit-unlayered.mjs 生成，不要手改。改皮肤请改 styles/ 下的源文件。',
  ' *',
  ' * 这是 index.css 的无层版本：内容一致，只是拆掉了 @layer 外壳，供宿主应用带有',
  ' * 无层 reset/normalize 时使用。取舍见文档站的「安装与接入」。',
  ' */',
  '',
]

const out = [...head]
const inlined = new Set()
let familyEmitted = false

for (const line of source.split('\n')) {
  const imported = line.match(/^\s*@import\s+['"]([^'"]+)['"];/)
  // 只替换相对路径的 @import，其余（注释、空行、跨行注释的后续行）一律原样保留：
  // 按内容挑着丢会把多行注释拦腰截断，留下不闭合的 /*，把后面的规则整段吃掉
  if (!imported) {
    out.push(line)
    continue
  }
  const spec = imported[1]
  // 令牌来自 @xihan-ui/tokens，是自定义属性声明，没有同名的无层声明与它相争，
  // 留在层里也照样生效；保持 @import 也避免把另一个包的产物复制进来。
  if (!spec.startsWith('.')) {
    out.push(line)
    // 全部配方紧跟令牌内联一次，先于第一份皮肤。@import 一旦排在样式规则之后就整条失效，
    // 全部令牌取不到值，所以配方只能落在令牌之后
    if (!familyEmitted) {
      out.push('', ...emitFamilyRecipes())
      familyEmitted = true
    }
    continue
  }
  const file = path.join(pkgRoot, spec)
  // layers.css 只装层序声明，拆层后是空的，不算皮肤
  if (!familyEmitted && path.basename(file) !== 'layers.css')
    throw new Error(`index.css 里 ${spec} 排在令牌 @import 之前，配方无处先行内联`)
  out.push('', `/* ${path.posix.join('styles', path.basename(file))} */`)
  out.push(unwrapLayerBlocks(expandRelativeImports(file, [])).trim())
}

if (!familyEmitted)
  throw new Error('index.css 里没有令牌的 @import，配方没有内联进无层产物')

fs.writeFileSync(
  outFile,
  applyFileHeader(outFile, `${out.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`),
)
console.log(`已生成 ${path.relative(pkgRoot, outFile)}`)

/**
 * family/ 下全部配方按固定顺序内联一次，产物里紧随令牌、先于第一份皮肤。
 *
 * 为什么必须在皮肤之前：配方在这一份里被抬到与皮肤同档 (0,2,0)，同档只剩源序竞争。皮肤对配方
 * 物理属性（outline / border-color / background）的直接覆盖，只有配方先出现才成立；配方若在
 * 第一个引用它的皮肤处才展开，排在它前面的皮肤就全被反超。先行内联后皮肤靠源序胜出，与有层
 * 产物「皮肤比配方高一级即胜」等价。目录里多出的配方文件没登记进 FAMILY_FILES 就判红，
 * 免得它悄悄落回旧位置。
 */
function emitFamilyRecipes() {
  const present = fs.readdirSync(FAMILY_DIR).filter(name => name.endsWith('.css')).sort()
  const listed = [...FAMILY_FILES].sort()
  if (present.join(',') !== listed.join(','))
    throw new Error(`family/ 下的配方与 FAMILY_FILES 对不上：目录 ${present.join(', ')}；登记 ${listed.join(', ')}`)
  const lines = [
    '/* Family Recipe 先于一切皮肤内联：拆层后配方与皮肤同档 (0,2,0)，只剩源序竞争，',
    '   皮肤对配方物理属性的直接覆盖只有配方先出现才成立，与有层产物里皮肤高一级即胜等价。 */',
  ]
  for (const name of FAMILY_FILES) {
    const file = path.join(FAMILY_DIR, name)
    lines.push('', `/* family/${name} */`)
    lines.push(unwrapLayerBlocks(expandRelativeImports(file, [])).trim())
  }
  return lines
}

/**
 * 独立组件皮肤可以先 @import Family Recipe；无层入口内联时必须递归展开，
 * 否则嵌套 @import 会落到普通规则之后而成为无效声明。每个物理文件只展开一次，
 * 后续多个组件迁入同一家族时也不会把共享配方复制进 full bundle；
 * 已内联过的文件连段标记也不写，产物里每个标记都对应一段真实内容。
 */
function expandRelativeImports(file, stack) {
  const resolved = path.resolve(file)
  if (stack.includes(resolved))
    throw new Error(`样式 @import 成环：${[...stack, resolved].map(value => path.relative(pkgRoot, value)).join(' -> ')}`)
  if (inlined.has(resolved))
    return ''
  inlined.add(resolved)

  const raw = stripFileHeader(fs.readFileSync(resolved, 'utf8'))
  const source = isFamilyFile(resolved) ? raiseFamilySpecificity(raw) : raw
  const lines = []
  for (const line of source.split('\n')) {
    const imported = line.match(/^\s*@import\s+['"]([^'"]+)['"];/)
    if (!imported || !imported[1].startsWith('.')) {
      lines.push(line)
      continue
    }
    const child = path.resolve(path.dirname(resolved), imported[1])
    if (inlined.has(child))
      continue
    lines.push('', `/* ${path.relative(pkgRoot, child).replaceAll('\\', '/')} */`)
    lines.push(expandRelativeImports(child, [...stack, resolved]))
  }
  return lines.join('\n')
}

function isFamilyFile(file) {
  return path.resolve(file).startsWith(FAMILY_DIR + path.sep)
}

/**
 * 家族配方在无层产物里抬到 (0,2,0)：每个家族根属性前加 [data-scope]。
 * 只改规则前导（选择器 / @ 规则头）里的属性名；声明块内容与注释原样保留——
 * 注释里也写着这些属性名作示例，声明值里则不会出现它们。
 * 逐字符扫描：注释与字符串跳过，样式规则的声明块整体照抄，@ 规则块递归处理其中的嵌套规则。
 */
function raiseFamilySpecificity(css) {
  let out = ''
  let prelude = ''
  let i = 0
  const flush = () => {
    out += prelude.replace(FAMILY_ROOT_ATTR, m => `[data-scope]${m}`)
    prelude = ''
  }
  while (i < css.length) {
    const c = css[i]
    if (c === '/' && css[i + 1] === '*') {
      flush()
      const end = css.indexOf('*/', i + 2)
      const stop = end === -1 ? css.length : end + 2
      out += css.slice(i, stop)
      i = stop
      continue
    }
    if (c === '"' || c === '\'') {
      const end = skipString(css, i)
      prelude += css.slice(i, end + 1)
      i = end + 1
      continue
    }
    if (c === ';' || c === '}') {
      flush()
      out += c
      i++
      continue
    }
    if (c === '{') {
      const isAtRule = prelude.trimStart().startsWith('@')
      flush()
      const close = matchBrace(css, i)
      if (close === -1) {
        out += css.slice(i)
        break
      }
      const body = css.slice(i + 1, close)
      out += `{${isAtRule ? raiseFamilySpecificity(body) : body}}`
      i = close + 1
      continue
    }
    prelude += c
    i++
  }
  flush()
  return out
}

/** 逐个拆掉 `@layer <名字> { ... }` 外壳，保留块内内容；`@layer a, b;` 声明语句丢弃 */
function unwrapLayerBlocks(css) {
  let out = ''
  let i = 0
  while (i < css.length) {
    const start = css.indexOf('@layer', i)
    if (start === -1) {
      out += css.slice(i)
      break
    }
    const brace = css.indexOf('{', start)
    const semi = css.indexOf(';', start)
    if (brace === -1 || (semi !== -1 && semi < brace)) {
      // 只声明层序，无层版本里没有意义
      out += css.slice(i, start)
      i = (semi === -1 ? css.length : semi + 1)
      continue
    }
    const close = matchBrace(css, brace)
    if (close === -1) {
      out += css.slice(i)
      break
    }
    out += css.slice(i, start)
    out += dedent(unwrapLayerBlocks(css.slice(brace + 1, close)))
    i = close + 1
  }
  return out
}

/** 拆掉一层缩进，免得内容一直悬在两个空格里 */
function dedent(css) {
  return css
    .split('\n')
    .map(line => (line.startsWith('  ') ? line.slice(2) : line))
    .join('\n')
}

/** 从 `{` 出发找到配对的 `}`，跳过注释与字符串 */
function matchBrace(css, open) {
  let depth = 0
  for (let i = open; i < css.length; i++) {
    const c = css[i]
    if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      i = end === -1 ? css.length : end + 1
      continue
    }
    if (c === '"' || c === '\'') {
      i = skipString(css, i)
      continue
    }
    if (c === '{') {
      depth++
    }
    else if (c === '}') {
      depth--
      if (depth === 0)
        return i
    }
  }
  return -1
}

function skipString(css, start) {
  const quote = css[start]
  for (let i = start + 1; i < css.length; i++) {
    if (css[i] === '\\') {
      i++
      continue
    }
    if (css[i] === quote)
      return i
  }
  return css.length
}
