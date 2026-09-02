#!/usr/bin/env node
// 门禁：文档站示例里引用的令牌必须真的存在。
//
// 皮肤那侧有 check-token-refs 盯着孤儿引用，文档站不在它的管辖里（STYLES_DIR 只有皮肤目录，
// 而 docs/ 还在 ui/ 的上一级）。于是删掉一个令牌之后，示例里的引用会静默失效——
// elevation-0..4 归并成三个角色档之后，吸底工具条的示例引的还是 --xh-elevation-2，
// 渲染出来是一块没有投影的工具条，而它演示的恰好就是那层投影。
//
// 示例目录另有一条更严的判据：示例是拿来照抄的，而 --xh-_ 前缀下同时躺着两类东西——
// 语气轴那一组（受约束，改名走 major）与皮肤内部的回退中转（随时可改）。名字长得一模一样，
// 照抄的人分不出来。所以示例里出现的每个 --xh-_ 名字都要登记，且只有语气轴槽登得进去。
import { readdir, readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { declarations, stripComments } from './lib/css-declarations.mjs'

const TOKENS_CSS = 'packages/design/tokens/tokens.css'
const STYLES_DIR = 'packages/design/styles/css'
/** 语气轴槽的声明处。 */
const TONE_CSS = 'packages/design/styles/css/tone.css'
/** 文档站在仓库根，跟 ui/ 是兄弟。 */
const DOCS = '../docs'
/** 示例目录：这里的判据比正文严一档。 */
const DEMOS = '../docs/.vitepress/demos'
/** 生成物与依赖不看。 */
const SKIP_DIRS = new Set(['node_modules', 'dist', 'cache', '.vitepress-cache'])

/** 正文里的占位写法，不是真名字。 */
const PLACEHOLDERS = new Set(['--xh-x-y'])

/**
 * 示例可以消费的私有槽，连同理由。名单之外的 --xh-_* 在示例里一律判红。
 * 每条都要真是语气轴槽——脚本另行复核它在 tone.css 的 [data-tone] 规则里声明过。
 */
const DEMO_PRIVATE_SLOTS = {
  '--xh-_tone-fg': '语气轴的文字色：示例把它接到组件槽上，演示同一块配色跟着 data-tone 换族',
  '--xh-_tone-soft': '语气轴的装饰强调色：同上，用在描边与色条这类非文字图形上',
}

const declared = new Set(
  [...(await readFile(TOKENS_CSS, 'utf8')).matchAll(/^\s*(--xh-[a-z0-9_-]+)\s*:/gm)].map(m => m[1]),
)
// 皮肤自己声明的槽（含留给使用者的覆盖点）同样算数
for (const file of (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css'))) {
  for (const m of (await readFile(join(STYLES_DIR, file), 'utf8')).matchAll(/^\s*(--xh-[a-z0-9_-]+)\s*:/gm))
    declared.add(m[1])
  // 皮肤里的组件覆盖槽是「使用者声明、皮肤兜底」，只在 var() 里出现，也要收进来
  for (const m of (await readFile(join(STYLES_DIR, file), 'utf8')).matchAll(/var\(\s*(--xh-[a-z0-9_-]+)/g))
    declared.add(m[1])
}

// 运行期由 JS 写上去的自定义属性（滚动锁的让位宽度、浮层的可用高度这类）不在任何 CSS 里声明，
// 但它们是真名字：库源码里以字符串常量的形式出现过，就算数。
async function* walkSrc(dir) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  }
  catch {
    return
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name))
      continue
    const full = join(dir, entry.name)
    if (entry.isDirectory())
      yield* walkSrc(full)
    else if (['.ts', '.tsx'].includes(extname(entry.name)))
      yield full
  }
}
for await (const file of walkSrc('packages')) {
  for (const [, name] of (await readFile(file, 'utf8')).matchAll(/['"`](--xh-[a-z0-9_-]+)['"`]/g))
    declared.add(name)
}

async function* walk(dir) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  }
  catch {
    return
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.vitepress/dist'))
      continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (full.split('\\').join('/').includes('.vitepress/dist'))
        continue
      yield* walk(full)
    }
    else if (['.vue', '.md', '.html', '.ts', '.css'].includes(extname(entry.name))) {
      yield full
    }
  }
}

// 语气轴槽：tone.css 里由 [data-tone…] 规则声明的那一组
const toneSlots = new Set()
{
  const tone = stripComments(await readFile(TONE_CSS, 'utf8'))
  for (const { prop, selectors } of declarations(tone)) {
    if (prop.startsWith('--xh-_') && (selectors.at(-1) ?? '').includes('[data-tone'))
      toneSlots.add(prop)
  }
}

const problems = []
const usedPrivate = new Set()
let scanned = 0
let refs = 0
let decls = 0

const demosPrefix = `${DEMOS.split('\\').join('/')}/`

for await (const file of walk(DOCS)) {
  scanned += 1
  const path = file.split('\\').join('/')
  const inDemos = path.startsWith(demosPrefix)
  const src = await readFile(file, 'utf8')
  src.split('\n').forEach((line, i) => {
    const where = `${path}:${i + 1}`

    /** 示例里的私有槽：登记过的放行，其余判红。 */
    const guardPrivate = (name, kind) => {
      if (!inDemos || !name.startsWith('--xh-_'))
        return false
      if (name in DEMO_PRIVATE_SLOTS) {
        usedPrivate.add(name)
        return true
      }
      problems.push(`${where}  ${name}  （${kind}）  —— 示例不许消费皮肤内部的私有槽，改用公开令牌或组件覆盖槽；确属语气轴槽的登记进 DEMO_PRIVATE_SLOTS`)
      return true
    }

    for (const [, name] of line.matchAll(/var\(\s*(--xh-[a-z0-9_-]+)/g)) {
      refs += 1
      if (guardPrivate(name, '引用'))
        continue
      if (declared.has(name) || PLACEHOLDERS.has(name))
        continue
      problems.push(`${where}  ${name}  （引用）`)
    }
    // 示例覆盖组件槽走的是声明而不是引用：style="--xh-transfer-gap: 8px"。
    // 只查引用的话，槽改名之后示例里那半边照样是死名，而且一个字都不报。
    for (const [, name] of line.matchAll(/(--xh-[a-z0-9_-]+)\s*:/g)) {
      decls += 1
      if (guardPrivate(name, '声明'))
        continue
      if (declared.has(name) || PLACEHOLDERS.has(name))
        continue
      problems.push(`${where}  ${name}  （声明）`)
    }
  })
}

for (const [name, reason] of Object.entries(DEMO_PRIVATE_SLOTS)) {
  if (!toneSlots.has(name)) {
    problems.push(`${name}  登记在 DEMO_PRIVATE_SLOTS 里（${reason}），但 tone.css 的 [data-tone] 规则没声明它——它不是语气轴槽，示例不能消费`)
    continue
  }
  if (!usedPrivate.has(name))
    problems.push(`${name}  登记在 DEMO_PRIVATE_SLOTS 里却没被任何示例用到——名单过期了，删掉这条`)
}

if (problems.length) {
  console.error('[check-demo-tokens] ✗ 文档站写了库里不存在的名字：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  console.error('\n引用是孤儿：整条声明在计算值阶段失效。声明是空转：没有任何规则读它，示例演示的那一档纹丝不动。两种都不报错。')
  process.exit(1)
}

console.log(`[check-demo-tokens] 通过：扫描文档站 ${scanned} 个文件 · ${refs} 处引用 · ${decls} 处声明都对得上库里的名字（示例里的私有槽 ${usedPrivate.size} 个，全在语气轴那 ${toneSlots.size} 个之内）`)
