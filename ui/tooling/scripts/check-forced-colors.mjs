#!/usr/bin/env node
// 门禁：高对比档（forced-colors: active）里靠底色表达的状态必须另有通道，补救块里只许写系统调色板关键字。
//
// 这一档由系统接管配色：作者写的颜色被逐个换成系统调色板里的对应角色，box-shadow 与
// background-image 直接丢弃。于是「两个状态只差一个底色」在这一档里塌成同一个样子——
// 悬停与展开路径、勾上与没勾上、当前页与别的页，屏幕上分毫不差。这一类失效在开发机上
// 一点征兆都没有：没人会为了改一个下拉去开一次高对比模式。
//
// 五条判据：
//   ① 公共补救层在场——forced-colors.css 里那两档状态环与浮层面的边，各自要真在。
//   ② 逐条规则——选择器带状态钩子、声明里改了底色、这条规则自己又没有 border / outline / 字形
//      通道的，那个钩子必须落在公共补救层的选择器里，或者本皮肤自带的 forced-colors 块里选到了它。
//      扫描面取自状态词汇表（state-vocabulary.json）的全集，新加一个状态属性自动进扫描面。
//   ③ 靠 background-image 承载信息的皮肤必须自带 forced-colors 块——那一层在这一档里整个丢弃。
//   ④ 补救块里的颜色只许 system color keyword：令牌在这一档已经不生效，写了是误导。
//      判法是把 var() 顺着解到最终值，解出来是颜色的就判红；宽度、时长那些照旧可以引令牌。
//   ⑤ 公共补救层排在最后一条皮肤 @import 上——它与组件皮肤同层同特指度，谁赢全看源序。
//      挪到前面去的话有层版与无层版一起失效，而且常态渲染完全看不出来。
//
// 两份登记名单（EXEMPT / DECORATIVE）都做过期反查：登了却没被用来放行过即判失败，
// 免得名单变成一张没人走的免检通行证。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const STYLES_DIR = 'packages/design/styles/css'
const TOKENS_CSS = 'packages/design/tokens/tokens.css'
const VOCABULARY = 'tooling/scripts/state-vocabulary.json'
const SHARED = 'forced-colors.css'
const ENTRY = 'packages/design/styles/index.css'
/** 无层版是按源序内联出来的产物，同一件事在它里面按位置查。 */
const UNLAYERED = 'packages/design/styles/index.unlayered.css'

/** 只有这九个关键字在这一档里拿得到系统当前主题的对应角色。 */
const SYSTEM_COLORS = new Set([
  'Canvas',
  'CanvasText',
  'ButtonFace',
  'ButtonText',
  'ButtonBorder',
  'Highlight',
  'HighlightText',
  'LinkText',
  'GrayText',
])

/** 会吃颜色的属性：判据④在这些属性上查取值。 */
const COLOR_PROP = /^(?:color|background|background-color|background-image|border(?:-(?:block|inline)(?:-(?:start|end))?|-(?:top|right|bottom|left))?(?:-color)?|outline|outline-color|fill|stroke|text-decoration-color|caret-color|-webkit-text-fill-color)$/

/**
 * 逐处放行：这个状态在这一档里确实没有单独的视觉，但那件事由别的东西表出。
 * 键写成「皮肤:钩子」，值写清承载它的是什么。
 */
const EXEMPT = {
  'approval.css:data-state=denied': '判定结果由结果区的文字直接写出来，底色只是重复一遍',
  'approval.css:data-state=expired': '同上，超时按拒绝收口，文字里写着',
  'context-menu.css:data-pressing': '长按还没到阈值那一小段的临时反馈，手指正按在触发区上',
  'diff-view.css:data-empty': '并排视图里空的那一侧本来就没有内容，空这件事由没有字表出',
  'image-cropper.css:data-resizing': '正在拖动改尺寸时的临时反馈，指针正按在把手上',
  'list.css:data-hoverable': '悬停反馈是指针停在条目上那一刻的临时表达，指针本身就在那儿',
  'qr-code.css:data-state=empty': '没有内容与出错都另渲一段提示文字，底色只是衬它',
  'qr-code.css:data-state=error': '同上',
  'scrollbar.css:data-dragging': '正在拖动滑块时的临时反馈，指针正按在滑块上',
  'slider.css:data-invalid': '校验失败的表达在字段层：错误文案由 field 渲出来并由 aria-describedby 念出',
  'splitter.css:data-dragging': '正在拖动分隔条时的临时反馈，指针正按在把手上',
  'table.css:data-resizing': '正在拖动列宽时的临时反馈，指针正按在列边上',
  'table.css:data-striped': '斑马纹是读长表的辅助，行与行的分界由行盒自己的排版给出',
  'tags-input.css:data-editing': '原地改字时输入框有插入符与聚焦环，两条在这一档里都还在',
  'tool-call.css:data-state=awaiting-approval': '各档状态由状态区的文字写出来，底色只是重复一遍',
  'tool-call.css:data-state=output-available': '同上',
  'tool-call.css:data-state=output-error': '同上',
}

/**
 * 画的就是装饰、不承载信息的 background-image，逐份放行。
 * 承载信息的那几份（色相带、删除行的斜纹、半颗星、扫光裁进字形）各自带 forced-colors 块。
 */
const DECORATIVE = {
  'image-cropper.css': '三分参考线是构图辅助，裁切框自己的描边与四角把手在这一档里都还在',
}

/** 去掉块注释但保留换行，行号才对得上源文件。 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ' '))
}

/** 从 open 处那个左花括号配对求块尾下标。 */
function blockEnd(css, open) {
  let depth = 0
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{')
      depth++
    else if (css[i] === '}' && --depth === 0)
      return i
  }
  return css.length
}

/** 一份 CSS 里所有 `@media (forced-colors: active)` 块的正文拼起来。 */
function forcedBody(css) {
  let out = ''
  const re = /@media\s*\(\s*forced-colors\s*:\s*active\s*\)\s*\{/g
  for (let m = re.exec(css); m !== null; m = re.exec(css)) {
    const open = m.index + m[0].length - 1
    out += `${css.slice(open + 1, blockEnd(css, open))}\n`
  }
  return out
}

/** 同上，但把这些块从原文里抹掉（换行留着）——常态规则的扫描面不该包含补救块。 */
function withoutForced(css) {
  let out = css
  for (;;) {
    const at = out.search(/@media\s*\(\s*forced-colors\s*:\s*active\s*\)\s*\{/)
    if (at === -1)
      return out
    const open = out.indexOf('{', at)
    const end = blockEnd(out, open) + 1
    out = out.slice(0, at) + out.slice(at, end).replace(/[^\n]/g, ' ') + out.slice(end)
  }
}

// —— 令牌表：顺着 var() 解到最终值，判据④按它认「这是不是一个颜色」——
const tokensRaw = new Map()
for (const m of stripComments(await readFile(TOKENS_CSS, 'utf8')).matchAll(/^\s*(--xh-[a-z0-9_-]+)\s*:([^;]+);/gm)) {
  if (!tokensRaw.has(m[1]))
    tokensRaw.set(m[1], m[2].trim())
}
function resolveToken(name, seen = new Set()) {
  const value = tokensRaw.get(name)
  if (value == null || seen.has(name))
    return null
  seen.add(name)
  const ref = /^var\(\s*(--xh-[a-z0-9_-]+)\s*\)$/.exec(value)
  return ref ? resolveToken(ref[1], seen) : value
}
/** 取值看起来是不是一个颜色。 */
function looksLikeColor(value) {
  return /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\(/i.test(value)
}

const vocab = JSON.parse(await readFile(VOCABULARY, 'utf8'))
/** 布尔状态属性全集。 */
const BOOLEAN_HOOKS = new Set(Object.keys(vocab.boolean).filter(name => name.startsWith('data-')))
/** data-state 的取值全集，逐族摊平。 */
const STATE_VALUES = new Set(Object.values(vocab['data-state']).flatMap(family => family.values ?? []))

const files = (await readdir(STYLES_DIR)).filter(name => name.endsWith('.css')).sort()
const problems = []

// —— 判据①：公共补救层在场 ——
const sharedCss = stripComments(await readFile(join(STYLES_DIR, SHARED), 'utf8'))
const sharedForced = forcedBody(sharedCss)
if (!sharedForced.trim())
  problems.push(`${SHARED} 里没有 @media (forced-colors: active) 块——公共补救层是空的`)
if (!/\[data-part='positioner'\][^{,]*\[data-part='content'\][^{]*\{[^}]*border:/.test(sharedForced))
  problems.push(`${SHARED} 的补救块里没有给定位层里那张面补 border——阴影在这一档被丢弃，浮层与页面之间会零分界`)

/** 公共补救层选到的钩子：判据②照它算「已被公共层接住」。 */
const covered = new Set()
for (const rule of sharedForced.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  for (const hook of hooksIn(rule[1]))
    covered.add(hook)
}
if (covered.size === 0)
  problems.push(`${SHARED} 的补救块里一个状态钩子都没选到——那两档状态环没写`)

// —— 判据⑤：公共补救层排在最后 ——
const entryCss = await readFile(ENTRY, 'utf8')
const imports = [...entryCss.matchAll(/@import\s+'\.\/css\/([a-z0-9-]+\.css)'/g)].map(hit => hit[1])
if (imports.at(-1) !== SHARED) {
  problems.push(
    `${ENTRY} 里最后一条皮肤 @import 是 ${imports.at(-1) ?? '（一条都没有）'}，不是 ${SHARED}——`
    + '公共补救层与组件皮肤同层同特指度，谁赢全看源序；排到前面去，组件里那条 '
    + `\`:focus:not(:focus-visible) { outline: none }\` 就会把状态环压掉`,
  )
}
// 无层版是按同一份源序内联出来的：补救块必须落在最后一个皮肤标记之后
const unlayeredCss = await readFile(UNLAYERED, 'utf8')
const lastMarker = [...unlayeredCss.matchAll(/--xh-[a-z0-9-]+-skin:\s*1;/g)].at(-1)
const sharedAt = unlayeredCss.search(/@media\s*\(\s*forced-colors\s*:\s*active\s*\)[\s\S]{0,400}?\[data-scope\]\[data-highlighted\]/)
if (lastMarker == null || sharedAt === -1)
  problems.push(`${UNLAYERED} 里找不到皮肤标记或公共补救层——产物过期了，跑一次 styles 的 gen`)
else if (sharedAt < lastMarker.index)
  problems.push(`${UNLAYERED} 里公共补救层排在组件皮肤中间——无层版只剩源序，这一档会被后面的皮肤压掉`)

/** 一条选择器里出现的状态钩子。`:not()` 里的是条件不是状态，先摘掉。 */
function hooksIn(selector) {
  const bare = selector.replace(/:not\([^()]*\)/g, ' ')
  const found = new Set()
  for (const m of bare.matchAll(/\[(data-[a-z0-9-]+)(?:\s*=\s*'([a-z0-9-]+)')?\]/g)) {
    if (m[1] === 'data-state') {
      if (m[2] && STATE_VALUES.has(m[2]))
        found.add(`data-state=${m[2]}`)
    }
    else if (BOOLEAN_HOOKS.has(m[1])) {
      found.add(m[1])
    }
  }
  return found
}

const exemptSeen = new Set()
const decorativeSeen = new Set()
let checkedRules = 0
let patched = 0

for (const file of files) {
  const css = stripComments(await readFile(join(STYLES_DIR, file), 'utf8'))
  const forced = forcedBody(css)
  const normal = withoutForced(css)
  if (forced.trim() && file !== SHARED)
    patched++

  /** 本皮肤自己的补救块选到的钩子。 */
  const selfCovered = new Set()
  for (const rule of forced.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    for (const hook of hooksIn(rule[1]))
      selfCovered.add(hook)
  }

  // —— 判据②：靠底色表达的状态要有活得下来的通道 ——
  for (const rule of normal.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = rule[1].replace(/\s+/g, ' ').trim()
    const body = rule[2]
    // 只看改了底的规则
    if (!/(?:^|[\s;{])background(?:-color)?\s*:/.test(body))
      continue
    // 这条规则自己就带 border / outline 的，通道在这一档里活得下来
    if (/(?:^|[\s;])(?:border|outline)[\w-]*\s*:/.test(body))
      continue
    // 字形节点：底色是拿来填 mask 图形的，画出来的是真字形，不是一块底
    if (/(?:^|[\s;])(?:-webkit-)?mask[\w-]*\s*:/.test(body))
      continue
    const hooks = hooksIn(selector)
    if (hooks.size === 0)
      continue
    checkedRules++
    for (const hook of hooks) {
      if (covered.has(hook) || selfCovered.has(hook))
        continue
      const key = `${file}:${hook}`
      if (key in EXEMPT) {
        exemptSeen.add(key)
        continue
      }
      problems.push(
        `${file}  ${selector.slice(0, 88)}\n`
        + `      ${hook} 只改了底色，高对比档里这一档与别的档塌成同一个样子。`
        + `补一条 border / outline / 字形通道（写进本皮肤的 @media (forced-colors: active) 块），`
        + `或者登记进 EXEMPT 并写清那件事由什么表出`,
      )
    }
  }

  // —— 判据③：靠 background-image 承载信息的必须自带补救块 ——
  const hasImage = /(?:^|[\s;])background(?:-image)?\s*:[^;]*(?:url\(|(?:linear|radial|conic)-gradient\()/.test(normal)
  if (hasImage) {
    if (file in DECORATIVE)
      decorativeSeen.add(file)
    else if (!forced.trim())
      problems.push(`${file} 里有 background-image，而这一档会把它整层丢弃，皮肤却没有 @media (forced-colors: active) 块——补一块，或者登记进 DECORATIVE 说明它只是装饰`)
  }

  // —— 判据④：补救块里的颜色只许系统调色板关键字 ——
  for (const rule of forced.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    for (const declaration of rule[2].matchAll(/([\w-]+)\s*:([^;]+)(?:;|$)/g)) {
      const prop = declaration[1].trim()
      const value = declaration[2].trim()
      if (!COLOR_PROP.test(prop))
        continue
      for (const ref of value.matchAll(/var\(\s*(--xh-[a-z0-9_-]+)\s*(?:,\s*var\(\s*(--xh-[a-z0-9_-]+)\s*\))?/g)) {
        const resolved = resolveToken(ref[1]) ?? (ref[2] ? resolveToken(ref[2]) : null)
        if (resolved != null && looksLikeColor(resolved)) {
          problems.push(`${file} 的补救块里 ${prop} 引了颜色令牌 ${ref[1]}——这一档里令牌不生效，改写 ${[...SYSTEM_COLORS].join(' / ')} 里的一个`)
        }
      }
      // 具名色与十六进制由 check-color-literals 全库拦；这里只补一句：写死的颜色同样不许进补救块
      if (/#[0-9a-f]{3,8}\b/i.test(value))
        problems.push(`${file} 的补救块里 ${prop} 写了颜色字面量——改写系统调色板关键字`)
    }
  }
}

// —— 名单过期反查 ——
for (const key of Object.keys(EXEMPT)) {
  if (!exemptSeen.has(key))
    problems.push(`EXEMPT 里登着 ${key}，却没有一条规则是靠它放行的——名单过期了，删掉这一条`)
}
for (const file of Object.keys(DECORATIVE)) {
  if (!decorativeSeen.has(file))
    problems.push(`DECORATIVE 里登着 ${file}，而这份皮肤里已经没有 background-image 了——名单过期了，删掉这一条`)
}

if (problems.length > 0) {
  console.error('[check-forced-colors] ✗ 高对比档有缺口：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  console.error('规则见设计系统规范的 forced-colors 一节：只有 border、outline 与真实字形节点在这一档里活得下来。')
  process.exit(1)
}

console.log(`[check-forced-colors] 通过：${files.length} 份皮肤 · 公共补救层接住 ${covered.size} 个状态钩子 · ${patched} 份皮肤自带补救块 · ${checkedRules} 条只改底色的状态规则逐条有通道（登记放行 ${exemptSeen.size} 处、装饰性背景图 ${decorativeSeen.size} 份）`)
