#!/usr/bin/env node
// 门禁：文档站示例里的作者滚动容器必须接 data-xh-scroll，自绘条宿主不手写 scrollbar-width。
//
// 原生细条住在 reset 层 `:where([data-scope][data-part], [data-xh-scroll])`：库节点
// 自动取到，作者自建的 overflow: auto | scroll 容器要自己写 data-xh-scroll 才有。示例是拿来照抄的，
// 一份漏写就是一处原生粗条，而构建、其余门禁全绿。判据：
//
// - .vue / .html：起始标签的 style 属性、<style> 块里按类名 / 属性选择器命中的元素，
//   只要声明了 overflow(-x|-y): auto | scroll，该元素必须带 data-xh-scroll，或本身是库节点
//   （Xh* 组件、xh-* 元素、带 data-xh-part 的作者角色节点——reset 的 [data-scope][data-part] 分支已覆盖）。
// - .tsx：JSX 标签的 style={{ … }}，或 style={name} 引用的 const name = { … } 样式对象，判据同上，
//   写法是 data-xh-scroll=""。
// - scrollbar/ 目录的示例是自绘条宿主：原生条由机器打的 [data-xh-scrollbar] 隐藏，不加 data-xh-scroll，
//   也不得手写 scrollbar-width / scrollbarWidth（那是与皮肤重复的声明）。其余示例同样不许手写。
//
// 用法：node tooling/scripts/docs/check-demo-scroll.mjs
import { readdir, readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import process from 'node:process'

const DEMOS = '../docs/.vitepress/demos'
/** 自绘条宿主目录：容器的原生条由 [data-xh-scrollbar] 隐藏，不走 data-xh-scroll。 */
const SCROLLBAR_HOST_DIRS = new Set(['scrollbar'])

const OVERFLOW_CSS = /(?:^|[;\s{"'])overflow(?:-x|-y)?\s*:\s*(?:auto|scroll)\b/
const OVERFLOW_JS = /\boverflow(?:X|Y)?\s*:\s*["'](?:auto|scroll)["']/
const SCROLLBAR_WIDTH_CSS = /(?:^|[;\s{"'])scrollbar-width\s*:/
const SCROLLBAR_WIDTH_JS = /\bscrollbarWidth\s*:/

const problems = []
let scanned = 0
let containers = 0

function lineOf(source, index) {
  return source.slice(0, index).split('\n').length
}

/**
 * 扫出起始标签：标签名、属性文本、位置。属性值按引号配对，JSX 的 {…} 按花括号配对，
 * 属性可以跨行（示例里多行 style 是常态）。
 */
function* tags(source, jsx) {
  const re = /<([A-Z][\w.-]*)/gi
  for (const m of source.matchAll(re)) {
    let i = m.index + m[0].length
    let depth = 0
    let quote = null
    while (i < source.length) {
      const ch = source[i]
      if (quote) {
        if (ch === quote)
          quote = null
        i++
        continue
      }
      if (ch === '"' || ch === '\'') {
        quote = ch
        i++
        continue
      }
      if (jsx && ch === '{') {
        depth++
        i++
        continue
      }
      if (jsx && ch === '}') {
        depth--
        i++
        continue
      }
      if (ch === '>' && depth === 0)
        break
      i++
    }
    yield { name: m[1], attrs: source.slice(m.index + m[0].length, i), index: m.index }
    re.lastIndex = i
  }
}

/** 库节点：Xh* 组件、xh-* 自定义元素、带 data-xh-part 的作者角色节点。 */
function isLibraryNode(name, attrs) {
  return /^Xh[A-Z]/.test(name) || name.startsWith('xh-') || /\sdata-xh-part=/.test(attrs)
}

function hasScrollAttr(attrs, jsx) {
  return jsx ? /\sdata-xh-scroll(?:=""|=''|\s|$)/.test(attrs) : /\sdata-xh-scroll(?:\s|$|=)/.test(attrs)
}

function classesOf(attrs, jsx) {
  const m = attrs.match(jsx ? /\sclassName=["']([^"']*)["']/ : /\sclass=["']([^"']*)["']/)
  return m ? m[1].split(/\s+/).filter(Boolean) : []
}

function styleAttrOf(attrs, jsx) {
  if (jsx) {
    const m = attrs.match(/\sstyle=\{([\s\S]*)$/)
    if (!m)
      return ''
    // 只取 style={ … } 这一对花括号里的内容
    let depth = 0
    for (let i = 0; i < m[1].length; i++) {
      if (m[1][i] === '{')
        depth++
      else if (m[1][i] === '}' && --depth === 0)
        return m[1].slice(0, i + 1)
    }
    return m[1]
  }
  const m = attrs.match(/\sstyle="([^"]*)"/)
  return m ? m[1] : ''
}

/** <style> 块里声明了 overflow 的规则：返回选择器列表。 */
function overflowSelectorsOf(css) {
  const out = []
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const re = /([^{}]+)\{([^{}]*)\}/g
  for (const m of stripped.matchAll(re)) {
    if (OVERFLOW_CSS.test(m[2]))
      out.push(...m[1].split(',').map(s => s.trim()).filter(Boolean))
  }
  return out
}

function checkElement(where, name, attrs, jsx, hostDir) {
  containers += 1
  if (isLibraryNode(name, attrs))
    return
  if (hostDir) {
    if (hasScrollAttr(attrs, jsx))
      problems.push(`${where}  <${name}> 是自绘条宿主，原生条由 [data-xh-scrollbar] 隐藏，不加 data-xh-scroll`)
    return
  }
  if (!hasScrollAttr(attrs, jsx))
    problems.push(`${where}  <${name}> 声明了 overflow: auto | scroll 却没带 ${jsx ? 'data-xh-scroll=""' : 'data-xh-scroll'}——作者容器要自己接 reset 层的细条`)
}

function checkMarkup(file, source, hostDir) {
  const where = i => `${file}:${lineOf(source, i)}`
  const all = [...tags(source, false)]
  for (const tag of all) {
    if (OVERFLOW_CSS.test(styleAttrOf(tag.attrs, false)))
      checkElement(where(tag.index), tag.name, tag.attrs, false, hostDir)
    if (SCROLLBAR_WIDTH_CSS.test(styleAttrOf(tag.attrs, false)))
      problems.push(`${where(tag.index)}  <${tag.name}> 手写了 scrollbar-width——细条由 reset 层统一给，自绘条宿主由 [data-xh-scrollbar] 隐藏原生条`)
  }
  // <style> 块：按选择器最后一个复合选择器找元素
  for (const block of source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    const at = block.index
    if (SCROLLBAR_WIDTH_CSS.test(block[1].replace(/\/\*[\s\S]*?\*\//g, '')))
      problems.push(`${where(at)}  <style> 里手写了 scrollbar-width——细条由 reset 层统一给`)
    for (const selector of overflowSelectorsOf(block[1])) {
      const last = selector.split(/[\s>+~]+/).filter(Boolean).at(-1) ?? ''
      let matched = []
      const cls = last.match(/^\.([\w-]+)$/)
      const attr = last.match(/^\[([\w-]+)(?:=["']?([^"'\]]*)["']?)?\]$/)
      if (cls) {
        matched = all.filter(t => classesOf(t.attrs, false).includes(cls[1]))
      }
      else if (attr) {
        matched = all.filter(t => (attr[2] === undefined
          ? new RegExp(`\\s${attr[1]}(?:\\s|$|=)`)
          : new RegExp(`\\s${attr[1]}=["']${attr[2]}["']`)).test(t.attrs))
      }
      else {
        problems.push(`${where(at)}  <style> 选择器 \`${selector}\` 声明了 overflow: auto | scroll，但门禁只认类名 / 属性选择器，改成能对上元素的写法`)
      }
      if ((cls || attr) && matched.length === 0)
        problems.push(`${where(at)}  <style> 选择器 \`${selector}\` 声明了 overflow: auto | scroll，但模板里没有匹配的元素`)
      for (const tag of matched)
        checkElement(where(tag.index), tag.name, tag.attrs, false, hostDir)
    }
  }
  // 脚本里以 cssText 一类字符串写下的样式：不能对回元素，直接判红，改成模板里的写法
  for (const m of source.matchAll(/cssText\s*=\s*["'`][^"'`]*["'`]/g)) {
    if (OVERFLOW_CSS.test(m[0]) && !hostDir)
      problems.push(`${where(m.index)}  cssText 里声明了 overflow: auto | scroll，对不回元素——把容器写进模板并带 data-xh-scroll`)
    if (SCROLLBAR_WIDTH_CSS.test(m[0]))
      problems.push(`${where(m.index)}  cssText 里手写了 scrollbar-width——细条由 reset 层统一给`)
  }
}

function checkJsx(file, source, hostDir) {
  const where = i => `${file}:${lineOf(source, i)}`
  const all = [...tags(source, true)]
  // 顶层样式对象：const name(: CSSProperties)? = { … }
  const objects = new Map()
  for (const m of source.matchAll(/const\s+(\w+)\s*(?::\s*[\w.<>]+\s*)?=\s*\{([\s\S]*?)\n\}/g))
    objects.set(m[1], m[2])
  for (const [name, body] of objects) {
    if (SCROLLBAR_WIDTH_JS.test(body))
      problems.push(`${file}  样式对象 ${name} 手写了 scrollbarWidth——细条由 reset 层统一给`)
  }
  for (const tag of all) {
    const style = styleAttrOf(tag.attrs, true)
    if (!style)
      continue
    const ref = style.match(/^\{\s*(\w+)\s*\}$/)
    const body = ref ? objects.get(ref[1]) : style
    if (body === undefined) {
      if (ref)
        problems.push(`${where(tag.index)}  <${tag.name} style={${ref[1]}}> 引用的样式对象不是本文件顶层 const，门禁对不回去——改成顶层 const 或内联对象`)
      continue
    }
    if (OVERFLOW_JS.test(body))
      checkElement(where(tag.index), tag.name, tag.attrs, true, hostDir)
    if (!ref && SCROLLBAR_WIDTH_JS.test(body))
      problems.push(`${where(tag.index)}  <${tag.name}> 手写了 scrollbarWidth——细条由 reset 层统一给`)
  }
}

for (const dir of (await readdir(DEMOS, { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name).sort()) {
  const hostDir = SCROLLBAR_HOST_DIRS.has(dir)
  for (const name of (await readdir(join(DEMOS, dir))).sort()) {
    const ext = extname(name)
    if (!['.vue', '.html', '.tsx'].includes(ext))
      continue
    scanned += 1
    const file = `${DEMOS}/${dir}/${name}`
    const source = await readFile(join(DEMOS, dir, name), 'utf8')
    if (ext === '.tsx')
      checkJsx(file, source, hostDir)
    else
      checkMarkup(file, source, hostDir)
  }
}

if (problems.length) {
  console.error('[check-demo-scroll] ✗ 示例里的滚动容器没接细条入口，或手写了 scrollbar-width：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  process.exit(1)
}

console.log(`[check-demo-scroll] 通过：扫描 ${scanned} 份示例，${containers} 处滚动容器都接了 data-xh-scroll 或是库节点 / 自绘条宿主，无手写 scrollbar-width`)
