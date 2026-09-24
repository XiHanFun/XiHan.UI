#!/usr/bin/env node
// 门禁：组件总览预览（docs/.vitepress/catalog/*.vue）只展示 md 默认档，尺寸与间距只引令牌。
//
// 总览卡片不再缩放：预览按真实像素渲染，卡片以 --xh-doc-catalog-w /
// --xh-doc-catalog-w-narrow / --xh-doc-catalog-h 三个变量下发宽高真源。预览文件里任何一处散值
// 都会在 133 张卡片里显出一张不一样的，而构建与其余门禁全绿。判据逐条对应设计真源「组件总览」一节：
//
// - 一律 md 默认档、默认 variant：`size="sm|lg|xs|xl"` 判红，`variant="…"` 判红。
//   以尺寸本身为身份的组件登记在 SIZE_EXEMPT（两侧反查：登记了却没用到同样判红）。
// - tone 只在组件核心用途即语气时允许一个非 neutral 值：TONE_ALLOWED 之外出现 tone / :tone 判红。
//   [data-demo-block] 上的 data-tone 是占位色，不是组件 tone，不在判据里。
// - 禁止内联 font-size / padding / gap / margin 的 px 字面值，只引令牌。
// - 禁止裸 overflow: auto | scroll：要么加 data-xh-scroll 取 reset 层的细条，要么是自绘条的宿主
//   （同文件里接了 XhScrollbarRoot 的 :scrollable）。
// - 文字用 span / div，不用 p / li / a。
// - 预览根的 inline-size / max-inline-size 必须取 var(--xh-doc-catalog-w…)，不写散值。
//
// 用法：node tooling/scripts/docs/check-catalog-preview.mjs
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const CATALOG = '../docs/.vitepress/catalog'

/** 以尺寸本身为身份的组件，允许的那一档。 */
const SIZE_EXEMPT = {
  'color-swatch': 'lg',
  'icon': 'lg',
  'number-animation': 'lg',
}

/** 核心用途即语气的组件，允许一个非 neutral 的 tone。 */
const TONE_ALLOWED = new Set(['alert', 'toast', 'notification', 'badge', 'progress'])

const problems = []
const usedExempt = new Set()

/** 去掉 HTML 注释：注释里的示意代码不算。 */
function stripComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '')
}

/** 取 <template> 段；预览文件的脚本段里没有标记，不看。 */
function templateOf(source) {
  const m = source.match(/<template>([\s\S]*)<\/template>/)
  return m ? stripComments(m[1]) : ''
}

/** 把模板拆成一个个起始标签（含属性），并记下行号。 */
function* tags(template, offset) {
  // 属性值里可能出现 >（箭头函数一类），按引号配对跳过。
  // 属性段的字符类本就含空白与 /，结尾不再另写 \s* 与 \/?：两处都能吃同一段空白，正则会二次回溯
  const re = /<([A-Z][\w-]*)((?:\s(?:[^<>"']|"[^"]*"|'[^']*')*)?)>/gi
  for (const m of template.matchAll(re)) {
    const line = offset + template.slice(0, m.index).split('\n').length - 1
    yield { name: m[1], attrs: m[2] ?? '', line, index: m.index }
  }
}

/** 预览根：template 段里第一个起始标签。 */
function rootOf(template) {
  return tags(template, 0).next().value ?? null
}

function styleOf(attrs) {
  const m = attrs.match(/\sstyle="([^"]*)"/)
  return m ? m[1] : ''
}

const files = (await readdir(CATALOG)).filter(file => file.endsWith('.vue')).sort()

for (const file of files) {
  const id = file.slice(0, -'.vue'.length)
  const source = await readFile(join(CATALOG, file), 'utf8')
  const template = templateOf(source)
  const templateAt = source.indexOf('<template>')
  const offset = templateAt === -1 ? 1 : source.slice(0, templateAt).split('\n').length
  const where = line => `${CATALOG}/${file}:${line}`
  const hostsScrollbar = /<XhScrollbarRoot\b[^>]*:scrollable=/.test(template)

  const root = rootOf(template)
  if (root) {
    const style = styleOf(root.attrs)
    for (const m of style.matchAll(/(?:^|;)\s*(max-)?inline-size\s*:\s*([^;]+)/g)) {
      if (!/^var\(--xh-doc-catalog-w(?:-narrow)?\)$/.test(m[2].trim()))
        problems.push(`${where(root.line)}  预览根 ${m[1] ?? ''}inline-size: ${m[2].trim()} —— 宽度由卡片以 --xh-doc-catalog-w / --xh-doc-catalog-w-narrow 下发，预览根只引这两个变量`)
    }
  }

  for (const tag of tags(template, offset)) {
    const { name, attrs, line } = tag

    if (/^(?:p|li|a)$/.test(name))
      problems.push(`${where(line)}  <${name}> —— 总览预览的文字用 span / div，不用 p / li / a`)

    const size = attrs.match(/\ssize="(sm|lg|xs|xl)"/)
    if (size) {
      if (SIZE_EXEMPT[id] === size[1])
        usedExempt.add(id)
      else
        problems.push(`${where(line)}  <${name} size="${size[1]}"> —— 总览预览一律 md 默认档；以尺寸为身份的组件登记进 SIZE_EXEMPT`)
    }

    if (/\svariant="/.test(attrs))
      problems.push(`${where(line)}  <${name} variant> —— 总览预览一律默认 variant，删掉这个属性`)

    if (/\s:?tone="/.test(attrs) && !TONE_ALLOWED.has(id))
      problems.push(`${where(line)}  <${name} tone> —— 只有 ${[...TONE_ALLOWED].join(' / ')} 的总览预览允许非 neutral 的 tone`)

    const style = styleOf(attrs)
    if (style) {
      for (const m of style.matchAll(/(?:^|;)\s*((?:font-size|padding|gap|margin)[a-z-]*)\s*:([^;]*\dpx[^;]*)/g))
        problems.push(`${where(line)}  ${m[1]}: ${m[2].trim()} —— 预览里的字号、内衬与间距只引令牌，不写 px 字面值`)

      if (/overflow(?:-x|-y)?\s*:\s*(?:auto|scroll)\b/.test(style) && !/\sdata-xh-scroll\b/.test(attrs) && !(hostsScrollbar && /\sref=/.test(attrs)))
        problems.push(`${where(line)}  <${name}> 裸 overflow: auto | scroll —— 加 data-xh-scroll 取 reset 层的细条，或改用 ScrollArea`)

      if (/scrollbar-width\s*:/.test(style))
        problems.push(`${where(line)}  scrollbar-width —— 细条由 reset 层统一给，自绘条宿主的原生条由 [data-xh-scrollbar] 隐藏，预览不手写`)
    }
  }
}

for (const id of Object.keys(SIZE_EXEMPT)) {
  if (!files.includes(`${id}.vue`))
    problems.push(`SIZE_EXEMPT 登记了 ${id}，但 ${CATALOG}/${id}.vue 不存在——名单过期了，删掉这条`)
  else if (!usedExempt.has(id))
    problems.push(`SIZE_EXEMPT 登记了 ${id} 的 size="${SIZE_EXEMPT[id]}"，但预览里没用到——名单过期了，删掉这条`)
}

if (problems.length) {
  console.error('[check-catalog-preview] ✗ 组件总览预览偏离 md 默认档或写了散值：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  process.exit(1)
}

console.log(`[check-catalog-preview] 通过：${files.length} 份总览预览一律 md 默认档、尺寸与间距只引令牌（size 例外 ${usedExempt.size} 个）`)
