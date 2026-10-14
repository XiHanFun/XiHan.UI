// 生成 @xihan-ui/cli 的离线数据 data/：组件元数据、文档页、示例源码、令牌、design.md 与更新日志。
// 组件元数据由组件文档生成器的 --data 模式产出，与文档站组件页同源。
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, posix, relative } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { stripFileHeader } from '../../../../tooling/file-header.mjs'
import { renderDesignMd } from './design-md.mjs'
import { collectTokens } from './tokens.mjs'

const PKG = dirname(dirname(fileURLToPath(import.meta.url)))
const UI = join(PKG, '..', '..', '..')
const DOCS = join(UI, '..', 'docs')
const DEMOS = join(DOCS, '.vitepress', 'demos')
const OUT = join(PKG, 'data')

const { version } = JSON.parse(readFileSync(join(PKG, 'package.json'), 'utf8'))
const site = JSON.parse(readFileSync(join(DOCS, 'package.json'), 'utf8')).homepage.replace(/\/+$/, '')
const { frameworks } = JSON.parse(readFileSync(join(UI, 'scripts', 'demo-frameworks.json'), 'utf8'))

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
const write = (file, content) => writeFileSync(join(OUT, file), content)

// —— 组件元数据 ——
execFileSync(process.execPath, [join(UI, 'scripts', 'gen-component-docs.mjs'), '--data', join(OUT, 'components.json')], { stdio: 'inherit' })

// —— 令牌 ——
const tokenData = await collectTokens(UI)
const tokenValues = Object.fromEntries(tokenData.tokens.map(t => [t.name, t.value]))
write('tokens.json', JSON.stringify(tokenData))

// —— 示例源码 ——
/** 去掉文件头与首行的「标题 | 说明」注释，它们在文档页里已经出现过。 */
function demoBody(source) {
  return stripFileHeader(source)
    .replace(/^\s*(<!--[\s\S]*?-->|\/\/[^\n]*)\s*/, '')
    .trimEnd()
}

const demos = {}
for (const dir of readdirSync(DEMOS, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort()) {
  for (const file of readdirSync(join(DEMOS, dir)).sort()) {
    const framework = frameworks.find(f => file.endsWith(f.ext))
    if (!framework)
      continue
    const src = `${dir}/${file.slice(0, -framework.ext.length)}`
    ;(demos[src] ??= {})[framework.id] = demoBody(readFileSync(join(DEMOS, dir, file), 'utf8'))
  }
}
write('demos.json', JSON.stringify(demos))

// —— 文档页 ——
/** 行首（可缩进）的围栏标记与其后的信息串；不是围栏行时返回 null。 */
function fenceOf(line) {
  const trimmed = line.trimStart()
  const char = trimmed[0]
  if (char !== '`' && char !== '~')
    return null
  let length = 0
  while (trimmed[length] === char)
    length++
  return length >= 3 ? { marker: trimmed.slice(0, length), info: trimmed.slice(length) } : null
}

/** 按围栏代码块切段，只改写正文段；keepFences 为 false 时丢掉代码块。 */
function mapProse(text, transform, keepFences = true) {
  const out = []
  let prose = []
  let fence = ''
  const flush = () => {
    if (prose.length)
      out.push(transform(prose.join('\n')))
    prose = []
  }
  for (const line of text.split(/\r?\n/)) {
    const marker = fenceOf(line)
    if (!fence && marker) {
      flush()
      fence = marker.marker
      if (keepFences)
        out.push(line)
      continue
    }
    if (fence) {
      if (keepFences)
        out.push(line)
      if (marker && marker.marker[0] === fence[0] && marker.marker.length >= fence.length && !marker.info.trim())
        fence = ''
      continue
    }
    prose.push(line)
  }
  flush()
  return out.join('\n')
}

const inlineCode = value => `\`${value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')}\``

/** 站内链接改成完整地址，页面在 CLI 之外读也能点。 */
function absoluteLinks(text, rel) {
  const base = posix.dirname(`/${rel}`)
  return text.replace(/\]\(((?:\.{1,2}\/|\/)[^)\s]*)\)/g, (_, href) => {
    const target = href.startsWith('/') ? href : posix.join(base, href)
    return `](${site}${target.replace(/\.md(?=#|$)/, '')})`
  })
}

function tokenValue(name) {
  if (!(name in tokenValues))
    throw new Error(`[build-data] 文档引用了不存在的令牌 ${name}`)
  return tokenData.tokens.find(t => t.name === name).resolved
}

/** 只给文档站看的组件写法压成纯 Markdown。 */
function flattenSiteSyntax(text, pagePath) {
  return text
    .replace(/<code v-pre>([\s\S]*?)<\/code>/g, (_, value) => inlineCode(value))
    .replace(/<Badge\s[^>]*\/>/g, tag => inlineCode(/\btext="([^"]+)"/.exec(tag)?.[1] ?? ''))
    .replace(/^\s*\[\[toc\]\]\s*$/gim, '')
    .replace(/<div class="xh-resource-links">([\s\S]*?)<\/div>/g, (_, inner) => {
      const links = [...inner.matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map(([, href, label]) => `[${label}](${href})`)
      return `源码：${links.join(' · ')}`
    })
    .replace(/<div class="xh-component-grid">([\s\S]*?)<\/div>/g, (_, cards) => cards.trim().replace(
      /<XhComponentCard\s+src="[^"]+"\s+name="([^"]+)"\s+label="([^"]+)"\s+href="([^"]+)"[^>]*\/>/g,
      '- [$1 $2]($3)',
    ))
    .replace(/<XhTokenTable\b([\s\S]*?)\/>/g, (_, attrs) => {
      const names = [...(/:names="\[([\s\S]*?)\]"/.exec(attrs)?.[1] ?? '').matchAll(/'(--xh-[\w-]+)'/g)].map(m => m[1])
      const notes = Object.fromEntries([...(/:notes="\{([\s\S]*?)\}"/.exec(attrs)?.[1] ?? '').matchAll(/'(--xh-[\w-]+)':\s*'([^']*)'/g)].map(m => [m[1], m[2]]))
      const rows = names.map(name => `| \`${name}\` | \`${tokenValue(name).replace(/\|/g, '\\|')}\` | ${(notes[name] ?? '').replace(/\|/g, '\\|')} |`)
      return ['| 令牌 | 缺省值 | 说明 |', '| --- | --- | --- |', ...rows].join('\n')
    })
    .replace(/<XhTokenSwatches\b([^>]*)\/>/g, (_, attrs) => {
      const prefix = /prefix="([^"]+)"/.exec(attrs)?.[1]
      const label = /label="([^"]+)"/.exec(attrs)?.[1]
      if (!prefix)
        throw new Error(`[build-data] ${pagePath} 的 XhTokenSwatches 缺 prefix`)
      const list = tokenData.tokens.filter(t => t.name.startsWith(prefix) && /^[\d_]+$/.test(t.name.slice(prefix.length)))
      return `${label ? `**${label}**：` : ''}${list.map(t => `\`${t.name}\` ${t.resolved}`).join('；')}`
    })
    .replace(/<XhThemeDesigner\s*\/>/g, `> 交互式主题设计器只在文档站可用：${site}/design/theme-designer`)
}

/** 页面标题：一级标题的纯文本。 */
function titleOf(markdown) {
  return /^# (.+)$/m.exec(markdown)?.[1].replace(/<[^>]+>/g, '').replace(/`/g, '').trim() ?? ''
}

/** 摘要：一级标题后第一段正文的第一句。 */
function summaryOf(markdown) {
  const prose = mapProse(markdown, text => text, false).replace(/^# .*$/m, '')
  for (const block of prose.split(/\n\s*\n/)) {
    const paragraph = block.trim()
    if (!paragraph || /^(?:[#<|]|:::|!\[|-{3,}$|源码：)/.test(paragraph))
      continue
    const flat = paragraph.replace(/^>\s?/gm, '').replace(/\s+/g, ' ').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1')
    const stop = flat.indexOf('。')
    if (stop !== -1 && stop < 200)
      return flat.slice(0, stop + 1)
    return flat.length > 160 ? `${flat.slice(0, 160)}…` : flat
  }
  return ''
}

/** docs/ 下的 Markdown，跳过站点目录、首页与更新日志。 */
function docFiles(dir = DOCS, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.vitepress', 'public'].includes(entry.name))
      continue
    const full = join(dir, entry.name)
    if (entry.isDirectory())
      docFiles(full, out)
    else if (entry.name.endsWith('.md'))
      out.push(relative(DOCS, full).replaceAll('\\', '/'))
  }
  return out.sort()
}

const pages = []
const leftovers = []
for (const rel of docFiles()) {
  if (rel === 'index.md' || rel === 'changelog.md' || rel === 'components/index.md')
    continue
  const path = rel.replace(/\.md$/, '').replace(/(^|\/)index$/, '$1').replace(/\/$/, '')
  const source = readFileSync(join(DOCS, rel), 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
  const markdown = mapProse(source, prose => absoluteLinks(flattenSiteSyntax(prose, path), rel)).trim()
  mapProse(markdown, (prose) => {
    for (const hit of prose.replace(/``[^`]*``|`[^`\n]*`/g, '').matchAll(/<(Xh(?!Demo\b)[A-Z]\w*)/g))
      leftovers.push(`${rel}: <${hit[1]}>`)
    return prose
  })
  pages.push({ path, title: titleOf(markdown) || path, summary: summaryOf(markdown), markdown })
}
if (leftovers.length)
  throw new Error(`[build-data] 文档页里有离线数据压不平的站点组件，在 build/build-data.mjs 的 flattenSiteSyntax 里补上：\n  ${[...new Set(leftovers)].join('\n  ')}`)
for (const page of pages) {
  for (const [, src] of page.markdown.matchAll(/<XhDemo\s+src="([^"]+)"\s*\/>/g)) {
    if (!demos[src])
      throw new Error(`[build-data] ${page.path} 引用了不存在的示例 ${src}`)
  }
}
write('pages.json', JSON.stringify(pages))

// —— design.md、更新日志与元信息 ——
write('design.md', renderDesignMd({ version, site, values: tokenValues }))
write('changelog.md', readFileSync(join(DOCS, 'changelog.md'), 'utf8'))
write('meta.json', `${JSON.stringify({ version, site }, null, 2)}\n`)

if (!existsSync(join(OUT, 'components.json')))
  throw new Error('[build-data] 组件元数据没有生成')
console.log(`[build-data] ${pages.length} 页 · ${Object.keys(demos).length} 个示例 · ${tokenData.tokens.length} 支令牌 → ${relative(UI, OUT).replaceAll('\\', '/')}`)
