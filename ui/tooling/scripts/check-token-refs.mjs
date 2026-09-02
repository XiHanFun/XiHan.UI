#!/usr/bin/env node
// 门禁：皮肤里引用的每一个全局令牌都必须在令牌产物里声明过。
// 孤儿引用不报错也不降级——整条声明在计算值阶段失效，那条样式就当没写过，
// 而 CSS 不会告诉任何人。toggle 的按下态就这么静默失效了很久。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'
const TOKENS_CSS = 'packages/design/tokens/tokens.css'
const SPACE_ANATOMY = 'packages/engine/headless/src/space/space.anatomy.ts'

/** 组件私有槽：由皮肤自己声明或留给使用者覆盖，不在令牌产物里。 */
function isComponentSlot(name, declaredInStyles) {
  return name.startsWith('--xh-_') || declaredInStyles.has(name)
}

const tokensCss = await readFile(TOKENS_CSS, 'utf8')
const declared = new Set([...tokensCss.matchAll(/^\s*(--xh-[a-z0-9_-]+)\s*:/gm)].map(m => m[1]))

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css'))
const sources = new Map()
for (const f of files)
  sources.set(f, await readFile(join(STYLES_DIR, f), 'utf8'))

// 皮肤自己声明过的槽位（含组件级覆盖点）不算孤儿
const declaredInStyles = new Set()
for (const src of sources.values()) {
  for (const m of src.matchAll(/^\s*(--xh-[a-z0-9_-]+)\s*:/gm))
    declaredInStyles.add(m[1])
}

const orphans = []
const fallbacks = []
const garbage = []
const colors = []
/** 允许颜色字面量的皮肤：取色器的色相带画的是光谱，不是设计色。 */
const COLOR_LITERAL_OK = new Set(['color-picker.css'])

/**
 * 角色错位：底色令牌（--xh-bg-*）写进了文字色。
 *
 * 两族在浅色主题下常常撞值（bg.brand 与 fg.brand 都是 brand-600），所以写错了也看不出来；
 * 深色下才分开——bg.brand 走到 brand-500(4.76)、fg.brand 走到 brand-400(6.59)，
 * 拿底色当字色的那几处就在深色下擦着 AA 线过。
 *
 * 只管文字色：SVG 的 fill / stroke 与描边式图形（进度环、加载圈）是「形状即填色」，本来就该取 bg 族。
 * 反白浮层同理正当：它把「面的颜色」当字色使。
 */
const FOREGROUND_PROP = /^\s*(?:color|-webkit-text-fill-color)\s*:/
const BG_AS_FOREGROUND_OK = {
  'heatmap.css': '提示气泡是反白的实心面，字色取的就是面色',
  'tooltip.css': '同上：一行字的反色气泡',
}
const roleSwaps = []
const roleOkSeen = new Set()
for (const [file, src] of sources) {
  const lines = src.split(/\r?\n/)
  // 注释内容抹成空格、换行留着：颜色字面量那一条只看代码，行号仍与原文对得上
  const blanked = src.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')).split('\n')
  lines.forEach((line, i) => {
    if (FOREGROUND_PROP.test(line) && /var\(\s*--xh-bg-/.test(line)) {
      if (file in BG_AS_FOREGROUND_OK)
        roleOkSeen.add(file)
      else
        roleSwaps.push(`${file}:${i + 1}  ${line.trim()}`)
    }
    for (const m of line.matchAll(/var\(\s*(--xh-[a-z0-9_-]+)/g)) {
      const name = m[1]
      if (declared.has(name) || isComponentSlot(name, declaredInStyles))
        continue
      // 组件级覆盖点的形状是 --xh-<组件名>-*，由使用者声明，缺省走兜底
      if (new RegExp(`^--xh-${file.replace(/\.css$/, '')}-`).test(name))
        continue
      orphans.push(`${file}:${i + 1}  ${name}`)
    }
    // 颜色一律走令牌：皮肤里不许出现 hex / rgb / hsl / oklch 字面量。取色器的色相带是光谱本身，不是设计色，放行。
    // 三类不算画出来的颜色：注释里提到的（皮肤常写「这条为什么这么算」的说明）、
    // @supports 的条件（特性探测，不落到任何元素上）、
    // 以及相对颜色语法 `fn(from var(--xh-…) …)`（源色本身就是令牌，算数的还是那个令牌）。
    const bare = blanked[i]
    const isFeatureProbe = /^\s*@supports\b/.test(bare)
    const isTokenDerived = /\b(?:color|oklch|oklab|lab|lch|hsla?|rgba?)\(\s*from\s+var\(\s*--xh-/i.test(bare)
    if (!COLOR_LITERAL_OK.has(file) && !isFeatureProbe && !isTokenDerived
      && /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\(/i.test(bare)) {
      colors.push(`${file}:${i + 1}  ${line.trim()}`)
    }
    // 一轮扫齐两件事：全局令牌不许带字面量兜底，任何兜底里不许出现 $1 这类正则替换残留
    for (const m of line.matchAll(/var\(\s*(--xh-[a-z0-9_-]+)\s*,([^;()]*)\)/g)) {
      const [, name, fb] = m
      if (declared.has(name) && !fb.trim().startsWith('var('))
        fallbacks.push(`${file}:${i + 1}  ${name} 的兜底「${fb.trim()}」`)
      if (/[$\\]/.test(fb))
        garbage.push(`${file}:${i + 1}  ${name} 的兜底「${fb.trim()}」`)
    }
  })
}

// ── --xh-space-* 命名空间 ──
//
// 全局间距原语占着这个前缀：--xh-space-0 … --xh-space-8 与 --xh-space-0_5 / -1_5 / -2_5，
// 后缀一律是数字与下划线。前缀底下再出现一个词形的名字，使用者在 :root 上写它时
// 会以为自己在改全站间距——而它其实只管一个组件；反过来，日后往令牌表里加一支同名的，
// 那个组件的缺省间距会被悄悄接管，其余判据一条都不会响（引用「声明过就算数」）。
//
// 允许两类：
//   一、原语本身；
//   二、space 皮肤的使用者覆盖槽，形状是 --xh-space-<部件>-<属性>，部件段取自 space 的解剖。
//      部件名改了这里立刻跟着红，槽名与解剖对不上就查得出来。
// 另有一个登记：皮肤在场标记 --xh-space-skin，名字由 check-skin-markers 按 --xh-<scope>-skin 规定死。
const SPACE_PRIMITIVE = /^\d+(?:_\d+)?$/
const SPACE_MARKER = '--xh-space-skin'
const spaceParts = [...(await readFile(SPACE_ANATOMY, 'utf8')).matchAll(/'([a-z][a-z0-9-]*)'/g)]
  .map(m => m[1])
  .filter(name => name !== 'space')
const spaceSquatters = []
let markerSeen = false
for (const [file, src] of [...sources, ['tokens.css', tokensCss]]) {
  src.split(/\r?\n/).forEach((line, i) => {
    for (const m of line.matchAll(/--xh-space-([a-z0-9_-]+)/g)) {
      const [full, rest] = m
      if (SPACE_PRIMITIVE.test(rest))
        continue
      if (full === SPACE_MARKER) {
        markerSeen = true
        continue
      }
      if (spaceParts.some(part => rest === part || rest.startsWith(`${part}-`)))
        continue
      spaceSquatters.push(`${file}:${i + 1}  ${full}`)
    }
  })
}
if (!markerSeen)
  spaceSquatters.push(`${SPACE_MARKER}  登记在这里却没被扫到——名单过期了`)

if (colors.length) {
  console.error('[check-token-refs] ✗ 皮肤里写了颜色字面量：')
  for (const c of colors)
    console.error(`  ${c}`)
  console.error('颜色只从令牌来；语法高亮走 --xh-syntax-*，主题明暗由令牌层切换。')
}
if (orphans.length) {
  console.error('[check-token-refs] ✗ 皮肤引用了未声明的全局令牌：')
  for (const o of orphans)
    console.error(`  ${o}`)
  console.error('孤儿引用会让整条声明在计算值阶段失效，且不报任何错。')
}
if (fallbacks.length) {
  console.error('[check-token-refs] ✗ 全局令牌带了字面量兜底：')
  for (const f of fallbacks)
    console.error(`  ${f}`)
  console.error('删掉第二个参数即可——令牌是唯一事实源。')
}
if (garbage.length) {
  console.error('[check-token-refs] ✗ var() 兜底里混进了非 CSS 值：')
  for (const g of garbage)
    console.error(`  ${g}`)
  console.error('多半是正则替换的残留（$1 这类捕获组引用）。它让整条声明在计算期失效，且不报任何错。')
}
for (const file of Object.keys(BG_AS_FOREGROUND_OK)) {
  if (!roleOkSeen.has(file))
    roleSwaps.push(`${file}  登记在 BG_AS_FOREGROUND_OK 里却没被扫到——名单过期了`)
}
if (spaceSquatters.length) {
  console.error('[check-token-refs] ✗ --xh-space-* 是全局间距原语的命名空间，这些名字占了它：')
  for (const s of spaceSquatters)
    console.error(`  ${s}`)
  console.error(`原语的后缀只有数字与下划线；组件槽写成 --xh-space-<部件>-<属性>，部件取自 space 的解剖（${spaceParts.join(' / ')}）。`)
}
if (roleSwaps.length) {
  console.error('[check-token-refs] ✗ 底色令牌写进了前景属性：')
  for (const r of roleSwaps)
    console.error(`  ${r}`)
  console.error('前景取 --xh-fg-*。两族在浅色下常撞值，深色下才分开，所以写错了肉眼看不出来。')
}
if (orphans.length || fallbacks.length || garbage.length || colors.length || roleSwaps.length || spaceSquatters.length)
  process.exit(1)

console.log(`[check-token-refs] 通过：${files.length} 份皮肤的全局令牌都有声明、没有字面量兜底、没有颜色字面量、没有把底色写进前景（反白浮层 ${roleOkSeen.size} 处除外），--xh-space-* 底下只有间距原语与 space 自己的部件槽`)
