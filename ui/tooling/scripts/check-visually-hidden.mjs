#!/usr/bin/env node
// 门禁：视觉隐藏配方只有一份真源。
//
// 皮肤侧的真源是 visually-hidden.css 的 .xh-visually-hidden 块；
// headless 侧的真源是 shared/visually-hidden.ts 的 VISUALLY_HIDDEN_STYLE。
// 两边的配方逐条同值，各皮肤为自己的隐藏输入 / 活动区域带一份时，也必须与真源逐条一致：
// 少一条（比如漏 white-space: nowrap）1px 宽的盒会把文本挤成竖排，撑高布局；
// 值不同（比如 clip 改 clip-path 以外的写法）在某些引擎上会露出一角。
//
// 校验两件事：
// ① 皮肤里凡含 clip-path: inset(50%) 的规则块，真源的每条声明都必须原样在场（皮肤可再追加自己的声明）；
// ② headless 的 connect 里不许再内联 clipPath: 'inset(50%)'，必须 import VISUALLY_HIDDEN_STYLE。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'
const SOURCE_CSS = join(STYLES_DIR, 'visually-hidden.css')
const SOURCE_TS = 'packages/engine/headless/src/shared/visually-hidden.ts'
const HEADLESS_SRC = 'packages/engine/headless/src'
const MARKER = /clip-path\s*:\s*inset\(50%\)/
const INLINE_MARKER = /clipPath\s*:\s*['"]inset\(50%\)['"]/

/** 去掉块注释：注释里写的声明不算。 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

/** 把一段声明文本拆成 属性 → 值（空白归一化）。 */
function declarations(body) {
  const out = new Map()
  for (const [, prop, value] of body.matchAll(/([\w-]+)\s*:\s*([^;{}]+)/g))
    out.set(prop.trim(), value.replace(/\s+/g, ' ').trim())
  return out
}

/** 取皮肤里每个最内层规则块：选择器 + 声明集合。 */
function ruleBlocks(css) {
  const out = []
  const re = /([^{};]+)\{([^{}]*)\}/g
  for (let m = re.exec(css); m !== null; m = re.exec(css)) {
    const selector = m[1].trim()
    if (selector.startsWith('@'))
      continue
    out.push({ selector, body: m[2], decls: declarations(m[2]) })
  }
  return out
}

/** camelCase → kebab-case，对齐内联样式键与 CSS 属性名。 */
function kebab(key) {
  return key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)
}

/** 递归列出 headless 源码里的 connect 文件。 */
async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory())
      out.push(...await walk(path))
    else if (entry.name.endsWith('.connect.ts'))
      out.push(path)
  }
  return out
}

const sourceCss = stripComments(await readFile(SOURCE_CSS, 'utf8'))
const sourceBlock = ruleBlocks(sourceCss).find(b => b.selector === '.xh-visually-hidden')
if (!sourceBlock || !MARKER.test(sourceBlock.body)) {
  console.error(`${SOURCE_CSS} 里找不到带 clip-path: inset(50%) 的 .xh-visually-hidden 块`)
  process.exit(1)
}
const canonical = sourceBlock.decls

const errors = []

// 真源两边对齐：TS 常量的每个键换成 kebab 后，与 CSS 块逐条同值、条数相同
const sourceTs = await readFile(SOURCE_TS, 'utf8')
const tsBody = sourceTs.match(/VISUALLY_HIDDEN_STYLE\s*=\s*\{([\s\S]*?)\}/)?.[1] ?? ''
const tsDecls = new Map()
for (const [, key, value] of tsBody.matchAll(/(\w+)\s*:\s*['"]([^'"]*)['"]/g))
  tsDecls.set(kebab(key), value.replace(/\s+/g, ' ').trim())
for (const [prop, value] of canonical) {
  if (!tsDecls.has(prop))
    errors.push(`${SOURCE_TS} 缺 ${prop}（皮肤真源为 ${prop}: ${value}）`)
  else if (tsDecls.get(prop) !== value)
    errors.push(`${SOURCE_TS} 的 ${prop} 是 ${tsDecls.get(prop)}，皮肤真源是 ${value}`)
}
for (const prop of tsDecls.keys()) {
  if (!canonical.has(prop))
    errors.push(`${SOURCE_TS} 多出 ${prop}，皮肤真源没有这条`)
}

// ① 皮肤：每个含标记的规则块都得把真源声明原样带齐
let skinBlocks = 0
const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()
for (const file of files) {
  if (file === 'visually-hidden.css')
    continue
  const css = stripComments(await readFile(join(STYLES_DIR, file), 'utf8'))
  for (const block of ruleBlocks(css)) {
    if (!MARKER.test(block.body))
      continue
    skinBlocks++
    for (const [prop, value] of canonical) {
      if (!block.decls.has(prop))
        errors.push(`${file} 的 ${block.selector} 缺 ${prop}: ${value}（与 .xh-visually-hidden 不一致）`)
      else if (block.decls.get(prop) !== value)
        errors.push(`${file} 的 ${block.selector} 把 ${prop} 写成 ${block.decls.get(prop)}，.xh-visually-hidden 是 ${value}`)
    }
  }
}

// ② headless：connect 里只许引用共享常量，不许内联配方
let connectFiles = 0
let importers = 0
for (const path of await walk(HEADLESS_SRC)) {
  connectFiles++
  const src = await readFile(path, 'utf8')
  const file = path.replaceAll('\\', '/')
  if (INLINE_MARKER.test(src))
    errors.push(`${file} 内联了 clipPath: 'inset(50%)' 配方，改为 import { VISUALLY_HIDDEN_STYLE } from '../shared/visually-hidden'`)
  if (/VISUALLY_HIDDEN_STYLE/.test(src)) {
    importers++
    if (!/import\s*\{[^}]*\bVISUALLY_HIDDEN_STYLE\b[^}]*\}\s*from\s*['"][^'"]*shared\/visually-hidden['"]/.test(src))
      errors.push(`${file} 用了 VISUALLY_HIDDEN_STYLE 却没有从 shared/visually-hidden 导入`)
  }
}

if (errors.length > 0) {
  console.error('check-visually-hidden: 视觉隐藏配方不一致')
  for (const e of errors)
    console.error(`  - ${e}`)
  process.exit(1)
}

console.log(`check-visually-hidden: 真源 ${canonical.size} 条声明；${skinBlocks} 个皮肤块一致；${connectFiles} 份 connect 无内联配方，${importers} 份引用共享常量`)
