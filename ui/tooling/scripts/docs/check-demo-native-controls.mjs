#!/usr/bin/env node
// 门禁：文档站示例里的控件一律用组件库自己的，不写原生 <button> / <input> / <select> / <textarea>。
//
// 示例是拿来照抄的：一颗手写的原生按钮、一个手写外观的输入框，抄走的就是一套与组件库不同的观感，
// 组件库改了外观，这些地方还停在旧样子，构建与其余门禁全绿。判据：
//
// - .vue（只看 <template>）、.tsx、.html（剥掉 <script>）里的原生 button / input / select / textarea 起始标签都算；
// - 组件契约本身要作者自带的节点放行：
//   · .html 里带 data-xh-part 的节点——那就是 Web Components 的 Light DOM 部件；
//   · 放在 Field 的 control 里的原生控件：Vue / React 祖先里有 XhFieldControl，
//     .html 祖先里有 data-xh-part="control"、再往上是 xh-field；
//   · 浮动按钮展开列表里的动作钮：皮肤按 list > button 给它们配外观，那就是作者自带动作的写法；
//   · type="hidden" 或带 hidden 属性的节点：不画任何东西（隐藏的文件选择器由组件库按钮去点开）；
// - 确实要原生控件的示例逐条登在 EXEMPT，写明为什么。
//
// 用法：node tooling/scripts/docs/check-demo-native-controls.mjs
import { readdir, readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import process from 'node:process'

const DEMOS = '../docs/.vitepress/demos'
const NATIVE = new Set(['button', 'input', 'select', 'textarea'])
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])

/** 确实要原生控件的示例：'目录/文件名' → 理由。 */
const EXEMPT = {
  'switch/08-content.vue': '演示用 useSwitch 自己写轨道：开关的视觉节点由作者自带，正是这份示例要讲的',
  'switch/08-content.tsx': '演示用 useSwitch 自己写轨道：开关的视觉节点由作者自带，正是这份示例要讲的',
}

const problems = []
let scanned = 0
let natives = 0
const usedExempt = new Set()

function lineOf(source, index) {
  return source.slice(0, index).split('\n').length
}

/**
 * 逐个扫出起始与结束标签：属性值按引号配对，JSX 的 {…} 按花括号配对（箭头函数的 => 不会提前收尾），
 * 属性可以跨行。
 */
function* tags(source, jsx) {
  const re = /<(\/?)([A-Z][\w.-]*)/gi
  for (const m of source.matchAll(re)) {
    let i = m.index + m[0].length
    let depth = 0
    let quote = null
    while (i < source.length) {
      const ch = source[i]
      if (quote) {
        if (ch === quote)
          quote = null
      }
      else if (ch === '"' || ch === '\'') {
        quote = ch
      }
      else if (jsx && ch === '{') {
        depth++
      }
      else if (jsx && ch === '}') {
        depth--
      }
      else if (ch === '>' && depth === 0) {
        break
      }
      i++
    }
    const attrs = source.slice(m.index + m[0].length, i)
    yield { closing: m[1] === '/', name: m[2], attrs, selfClosing: attrs.trimEnd().endsWith('/'), index: m.index }
    re.lastIndex = i
  }
}

function partOf(attrs) {
  return attrs.match(/\sdata-xh-part=["']([\w-]+)["']/)?.[1] ?? null
}

function allowed(tag, stack, html) {
  if (html && partOf(tag.attrs))
    return true
  if (/\stype=["']hidden["']/.test(tag.attrs) || /\shidden(?:[\s=/]|$)/.test(tag.attrs))
    return true
  // 浮动按钮展开列表的直接孩子
  const parent = stack.at(-1)
  if (parent && (parent.name === 'XhFloatButtonList' || (html && parent.part === 'list' && stack.some(entry => entry.name === 'xh-float-button'))))
    return true
  if (stack.some(entry => entry.name === 'XhFieldControl'))
    return true
  if (html) {
    const control = stack.findLastIndex(entry => entry.part === 'control')
    if (control >= 0 && stack.slice(0, control).some(entry => entry.name === 'xh-field'))
      return true
  }
  return false
}

function scan(rel, source, kind) {
  const jsx = kind === '.tsx'
  const html = kind === '.html'
  const stack = []
  for (const tag of tags(source, jsx)) {
    if (tag.closing) {
      const at = stack.findLastIndex(entry => entry.name === tag.name)
      if (at >= 0)
        stack.length = at
      continue
    }
    const lower = tag.name.toLowerCase()
    if (NATIVE.has(tag.name)) {
      natives++
      if (!allowed(tag, stack, html)) {
        if (EXEMPT[rel])
          usedExempt.add(rel)
        else
          problems.push(`${rel}:${lineOf(source, tag.index)} 原生 <${tag.name}>：换成组件库的组件（按钮、文本框、选择器……）`)
      }
    }
    if (!tag.selfClosing && !(VOID.has(lower) && tag.name === lower))
      stack.push({ name: tag.name, part: partOf(tag.attrs) })
  }
}

for (const dir of (await readdir(DEMOS, { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name).sort()) {
  for (const file of (await readdir(join(DEMOS, dir))).sort()) {
    const kind = extname(file)
    if (!['.vue', '.tsx', '.html'].includes(kind))
      continue
    let source = await readFile(join(DEMOS, dir, file), 'utf8')
    source = source.replace(/<!--[\s\S]*?-->/g, m => m.replace(/\S/g, ' '))
    if (kind === '.vue') {
      const start = source.indexOf('<template>')
      const end = source.lastIndexOf('</template>')
      if (start < 0 || end < start)
        continue
      source = source.slice(0, start).replace(/[^\n]/g, ' ') + source.slice(start, end)
    }
    else if (kind === '.html') {
      source = source.replace(/<script\b[\s\S]*?<\/script>/g, m => m.replace(/[^\n]/g, ' '))
    }
    else {
      source = source.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    }
    scanned++
    scan(`${dir}/${file}`, source, kind)
  }
}

for (const rel of Object.keys(EXEMPT)) {
  if (!usedExempt.has(rel))
    problems.push(`EXEMPT 里的 ${rel} 已经没有原生控件了——名单过期，删掉这条`)
}

if (problems.length) {
  console.error('[check-demo-native-controls] ✗ 示例里有没走组件库的原生控件：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  process.exit(1)
}
console.log(`[check-demo-native-controls] 通过：${scanned} 份示例里 ${natives} 处原生控件都是组件契约要作者自带的节点（登记豁免 ${usedExempt.size} 份）`)
