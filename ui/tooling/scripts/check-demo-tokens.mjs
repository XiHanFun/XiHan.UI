#!/usr/bin/env node
// 门禁：文档站示例里引用的令牌必须真的存在。
//
// 皮肤那侧有 check-token-refs 盯着孤儿引用，文档站不在它的管辖里（STYLES_DIR 只有皮肤目录，
// 而 docs/ 还在 ui/ 的上一级）。于是删掉一个令牌之后，示例里的引用会静默失效——
// elevation-0..4 归并成三个角色档之后，吸底工具条的示例引的还是 --xh-elevation-2，
// 渲染出来是一块没有投影的工具条，而它演示的恰好就是那层投影。
import { readdir, readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

const TOKENS_CSS = 'packages/design/tokens/tokens.css'
const STYLES_DIR = 'packages/design/styles/css'
/** 文档站在仓库根，跟 ui/ 是兄弟。 */
const DOCS = '../docs'
/** 生成物与依赖不看。 */
const SKIP_DIRS = new Set(['node_modules', 'dist', 'cache', '.vitepress-cache'])

/** 正文里的占位写法，不是真名字。 */
const PLACEHOLDERS = new Set(['--xh-x-y'])

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

const problems = []
let scanned = 0
let refs = 0

for await (const file of walk(DOCS)) {
  scanned += 1
  const src = await readFile(file, 'utf8')
  src.split('\n').forEach((line, i) => {
    for (const [, name] of line.matchAll(/var\(\s*(--xh-[a-z0-9_-]+)/g)) {
      refs += 1
      if (declared.has(name) || PLACEHOLDERS.has(name))
        continue
      problems.push(`${file.split('\\').join('/')}:${i + 1}  ${name}`)
    }
  })
}

if (problems.length) {
  console.error('[check-demo-tokens] ✗ 文档站引用了不存在的令牌：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  console.error('\n孤儿引用让整条声明在计算值阶段失效，且不报任何错——示例演示的效果就此消失。')
  process.exit(1)
}

console.log(`[check-demo-tokens] 通过：扫描文档站 ${scanned} 个文件 · ${refs} 处令牌引用都有声明`)
