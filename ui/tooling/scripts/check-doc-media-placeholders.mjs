#!/usr/bin/env node
// 门禁：文档示例只使用可控 SVG 媒体，结构占位块不靠文字撑形状。
//
// 组件文档会被直接浏览和复制。PNG/JPG 一类具体图片既不能随主题调整，也会把视觉注意力
// 从组件本身带走；Flex/Grid/Layout 等结构预览若用“模块 A / 文件 / 编辑器”撑盒子，字体
// 与文案长度还会反过来决定布局。媒体统一使用 SVG，纯结构用 data-demo-block 的淡色空块。
import { readdir, readFile, stat } from 'node:fs/promises'
import { extname, relative } from 'node:path'

const DOCS = '../docs'
const ROOTS = [`${DOCS}/.vitepress`, `${DOCS}/index.md`, './README.md', './README_cn.md']
const SKIP_DIRS = new Set(['node_modules', 'dist', 'cache', '.vitepress-cache'])
const TEXT_EXTENSIONS = new Set(['.css', '.html', '.md', '.ts', '.tsx', '.vue'])
const RASTER = /(?:\/images\/[^\s"'`)]+|https:\/\/example\.invalid\/[^\s"'`)]+|data:image\/)(?:[^\s"'`)]*\.)?(?:png|jpe?g|webp|gif|avif)\b/gi
const RASTER_MARKDOWN = /!\[[^\]]*\]\([^)]*\.(?:png|jpe?g|webp|gif|avif)(?:[?#][^)]*)?\)/gi
const STRUCTURAL_DEMOS = /\.vitepress\/demos\/(?:flex|grid|layout|masonry|resizable|scroll-area|sortable|splitter)\//
const LEGACY_BLOCK_MARKER = /\bdata-(?:box|card|item|link|tag)\b/g
const VISIBLE_BLOCK_LABEL = />\s*(?:区块(?:\s*[A-Z\d]+)?|文件|编辑器|控制台|预览|侧栏|正文|导航|项目动态|尺寸锁定|从任意边缘调整|内容区\s*\d+)\s*</g

async function* walk(path) {
  const info = await stat(path)
  if (info.isFile()) {
    yield path
    return
  }
  for (const entry of await readdir(path, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name))
      continue
    const child = `${path}/${entry.name}`
    if (entry.isDirectory())
      yield* walk(child)
    else if (TEXT_EXTENSIONS.has(extname(entry.name)))
      yield child
  }
}

function lineOf(source, index) {
  return source.slice(0, index).split('\n').length
}

const problems = []
let files = 0
let blocks = 0

for (const root of ROOTS) {
  for await (const file of walk(root)) {
    files += 1
    const source = await readFile(file, 'utf8')
    const name = relative(DOCS, file).replaceAll('\\', '/')

    for (const match of source.matchAll(RASTER))
      problems.push(`${name}:${lineOf(source, match.index)}  ${match[0]} —— 文档媒体改用 SVG`)
    for (const match of source.matchAll(RASTER_MARKDOWN))
      problems.push(`${name}:${lineOf(source, match.index)}  ${match[0]} —— Markdown 媒体改用 SVG`)

    if (STRUCTURAL_DEMOS.test(name)) {
      for (const match of source.matchAll(LEGACY_BLOCK_MARKER))
        problems.push(`${name}:${lineOf(source, match.index)}  ${match[0]} —— 结构占位统一改用 data-demo-block`)
      for (const match of source.matchAll(VISIBLE_BLOCK_LABEL))
        problems.push(`${name}:${lineOf(source, match.index)}  ${match[0]} —— 区块名称改为淡色空块与无障碍名称`)
    }

    for (const match of source.matchAll(/<([a-z][\w-]*)\b(?=[^>]*\bdata-demo-block(?:=(?:"[^"]*"|'[^']*'))?)(?![^>]*\/\s*>)[^>]*>([^<]*)<\/\1>/gi)) {
      blocks += 1
      const visible = match[2]
        .replace(/<[^>]+>/g, '')
        .replace(/\{[\s\S]*?\}/g, '')
        .trim()
      if (visible)
        problems.push(`${name}:${lineOf(source, match.index)}  data-demo-block 内仍有文字「${visible.slice(0, 40)}」`)
    }
  }
}

for (const asset of ['logo.svg', 'demo-avatar.svg']) {
  try {
    await readFile(`${DOCS}/public/images/${asset}`, 'utf8')
  }
  catch {
    problems.push(`public/images/${asset}:1  缺少统一 SVG 资产`)
  }
}

const isolation = await readFile(`${DOCS}/.vitepress/theme/demo-isolation.css`, 'utf8')
if (!isolation.includes('[data-demo-block]'))
  problems.push('.vitepress/theme/demo-isolation.css:1  缺少 data-demo-block 的共享淡色占位配方')

if (problems.length) {
  console.error(`[check-doc-media-placeholders] ✗ ${problems.length} 处文档媒体或占位脱离统一规则：`)
  for (const problem of problems)
    console.error(`  ${problem}`)
  process.exit(1)
}

console.log(`[check-doc-media-placeholders] 通过：${files} 份文档源没有位图引用，${blocks} 个结构占位块不含可见文字`)
