#!/usr/bin/env node
// 门禁：皮肤里引用的每一个全局令牌都必须在令牌产物里声明过。
// 孤儿引用不报错也不降级——整条声明在计算值阶段失效，那条样式就当没写过，
// 而 CSS 不会告诉任何人。toggle 的按下态就这么静默失效了很久。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'
const TOKENS_CSS = 'packages/design/tokens/tokens.css'

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
    if (!COLOR_LITERAL_OK.has(file) && /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\(/i.test(line))
      colors.push(`${file}:${i + 1}  ${line.trim()}`)
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
if (roleSwaps.length) {
  console.error('[check-token-refs] ✗ 底色令牌写进了前景属性：')
  for (const r of roleSwaps)
    console.error(`  ${r}`)
  console.error('前景取 --xh-fg-*。两族在浅色下常撞值，深色下才分开，所以写错了肉眼看不出来。')
}
if (orphans.length || fallbacks.length || garbage.length || colors.length || roleSwaps.length)
  process.exit(1)

console.log(`[check-token-refs] 通过：${files.length} 份皮肤的全局令牌都有声明、没有字面量兜底、没有颜色字面量、没有把底色写进前景（反白浮层 ${roleOkSeen.size} 处除外）`)
