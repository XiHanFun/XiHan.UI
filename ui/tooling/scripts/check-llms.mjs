#!/usr/bin/env node
// 门禁：文档站构建期产出的机读资产与库对得上。
//
// 四条判据：
//   一、索引一份、汇编四份，加上每页的 .md，都在；
//   二、llms-components.txt 收的组件页数 = 组件清单八个类目求和（不写死数字，清单增删跟着走）；
//   三、任何一份产物里都不许残留 <XhDemo> 标签——模型读到的必须是可运行的代码，
//       不是一个它不认识的站点组件；
//   四、llms-tokens.txt 的令牌行数 = tokens.json 的条目数。
//
// 它吃的是构建产物，所以必须排在文档站构建之后：先在 docs/ 下跑 pnpm build。
import { readdir, readFile, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const UI = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const DOCS = join(UI, '..', 'docs')
const DIST = join(DOCS, '.vitepress', 'dist')

const ASSETS = ['llms.txt', 'llms-full.txt', 'llms-components.txt', 'llms-guide.txt', 'llms-tokens.txt']

function bail(message) {
  console.error(`[check-llms] ✗ ${message}`)
  process.exit(1)
}

async function exists(path) {
  try {
    await stat(path)
    return true
  }
  catch {
    return false
  }
}

/** 目录下递归取相对 root 的 .md 路径，跳过站点自身的目录。 */
async function markdownFiles(root, base = '') {
  const out = []
  for (const entry of await readdir(join(root, base), { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.vitepress' || entry.name === 'public')
      continue
    const rel = base ? `${base}/${entry.name}` : entry.name
    if (entry.isDirectory())
      out.push(...await markdownFiles(root, rel))
    else if (entry.name.endsWith('.md'))
      out.push(rel)
  }
  return out
}

// 产物目录不在就是错，不是跳过：这道门禁验的正是产出这一步跑过没有
if (!(await exists(DIST)))
  bail(`找不到 ${DIST}——先在 docs/ 下跑 pnpm build`)

const sources = new Map()
for (const name of ASSETS) {
  const path = join(DIST, name)
  if (!(await exists(path)))
    bail(`缺少 ${name}；生成器是 docs/.vitepress/gen-llms.mjs，接在 config.ts 的 buildEnd 上`)
  sources.set(name, await readFile(path, 'utf8'))
}

// 每页一份 .md
const pages = await markdownFiles(DOCS)
const missingPages = []
for (const rel of pages) {
  if (!(await exists(join(DIST, rel))))
    missingPages.push(rel)
}
if (missingPages.length) {
  bail(`${missingPages.length} 页没落 .md 直链副本，首三条：${missingPages.slice(0, 3).join('、')}`)
}
for (const rel of pages) sources.set(rel, await readFile(join(DIST, rel), 'utf8'))

// 残留的站点组件标签
const residue = [...sources].filter(([, text]) => text.includes('<XhDemo'))
if (residue.length) {
  bail(
    `${residue.length} 份产物里还有 <XhDemo> 没被换成代码块，首三条：${residue.slice(0, 3).map(([name]) => name).join('、')}`,
  )
}

// 组件页数对账
const manifest = JSON.parse(await readFile(join(UI, 'scripts', 'component-docs.manifest.json'), 'utf8'))
const expected = manifest.categories.reduce((sum, category) => sum + category.components.length, 0)
const listed = new Set(
  [...sources.get('llms-components.txt').matchAll(/^来源：\S+\/components\/([a-z0-9-]+)$/gm)].map(hit => hit[1]),
)
if (listed.size !== expected) {
  bail(
    `llms-components.txt 收了 ${listed.size} 个组件页，组件清单是 ${expected} 个——`
    + '两边对不上说明有组件没进产物，或产物是旧的',
  )
}

// 令牌行数对账
const tokens = JSON.parse(await readFile(join(UI, 'packages', 'design', 'tokens', 'tokens.json'), 'utf8'))
const rows = sources
  .get('llms-tokens.txt')
  .split('\n')
  .filter(line => /^\| `--xh-/.test(line) && line.split('|').length === 6)
  .length
if (rows !== Object.keys(tokens).length) {
  bail(`llms-tokens.txt 列了 ${rows} 支令牌，tokens.json 是 ${Object.keys(tokens).length} 支`)
}

console.log(
  `[check-llms] 通过：${ASSETS.length} 份机读资产 · ${pages.length} 页 .md 直链 · 组件 ${listed.size} · 令牌 ${rows}`,
)
