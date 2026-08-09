// 产出 index.unlayered.css：把 index.css 引到的皮肤逐个内联，并拆掉 @layer 外壳。
//
// 为什么要这么一份：CSS 级联里无层声明胜过任何有层声明，与特异性无关。宿主应用只要
// 带一条无层的 reset/normalize（`button { padding: 0; background-color: transparent }`
// 这类），本库整套皮肤就会被压掉。而 `@import ... layer()` 只能给无层样式加层，
// 没有反向操作——所以层化是使用者无法撤销的单向门，得由库这边提供不带层的一份。
//
// 拆层后规则改按特异性竞争：皮肤选择器至少是 [data-scope=x][data-part=y]（0,2,0），
// 稳压 button（0,0,1）。层内先后不受影响：reset 的两条规则特异性低于组件规则，
// motion 层装的是 @keyframes、不参与级联。
//
// 代价是 xihan.overrides 这个覆盖槽位在这一份里不存在，使用者改用特异性覆盖。
// 两份的取舍写在文档站的「安装与接入」。
//
// 用法：node build/emit-unlayered.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const entry = path.join(pkgRoot, 'index.css')
const outFile = path.join(pkgRoot, 'index.unlayered.css')

const source = fs.readFileSync(entry, 'utf8')

const head = [
  '/* 本文件由 build/emit-unlayered.mjs 生成，不要手改。改皮肤请改 styles/ 下的源文件。',
  ' *',
  ' * 这是 index.css 的无层版本：内容一致，只是拆掉了 @layer 外壳，供宿主应用带有',
  ' * 无层 reset/normalize 时使用。取舍见文档站的「安装与接入」。',
  ' */',
  '',
]

const out = [...head]

for (const line of source.split('\n')) {
  const imported = line.match(/^\s*@import\s+['"]([^'"]+)['"];/)
  // 只替换相对路径的 @import，其余（注释、空行、跨行注释的后续行）一律原样保留：
  // 按内容挑着丢会把多行注释拦腰截断，留下不闭合的 /*，把后面的规则整段吃掉
  if (!imported) {
    out.push(line)
    continue
  }
  const spec = imported[1]
  // 令牌来自 @xihan-ui/system，是自定义属性声明，没有同名的无层声明与它相争，
  // 留在层里也照样生效；保持 @import 也避免把另一个包的产物复制进来。
  if (!spec.startsWith('.')) {
    out.push(line)
    continue
  }
  const file = path.join(pkgRoot, spec)
  const css = fs.readFileSync(file, 'utf8')
  out.push('', `/* ${path.posix.join('styles', path.basename(file))} */`)
  out.push(unwrapLayerBlocks(css).trim())
}

fs.writeFileSync(outFile, `${out.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`)
console.log(`已生成 ${path.relative(pkgRoot, outFile)}`)

/** 逐个拆掉 `@layer <名字> { ... }` 外壳，保留块内内容；`@layer a, b;` 声明语句丢弃 */
function unwrapLayerBlocks(css) {
  let out = ''
  let i = 0
  while (i < css.length) {
    const start = css.indexOf('@layer', i)
    if (start === -1) {
      out += css.slice(i)
      break
    }
    const brace = css.indexOf('{', start)
    const semi = css.indexOf(';', start)
    if (brace === -1 || (semi !== -1 && semi < brace)) {
      // 只声明层序，无层版本里没有意义
      out += css.slice(i, start)
      i = (semi === -1 ? css.length : semi + 1)
      continue
    }
    const close = matchBrace(css, brace)
    if (close === -1) {
      out += css.slice(i)
      break
    }
    out += css.slice(i, start)
    out += dedent(unwrapLayerBlocks(css.slice(brace + 1, close)))
    i = close + 1
  }
  return out
}

/** 拆掉一层缩进，免得内容一直悬在两个空格里 */
function dedent(css) {
  return css
    .split('\n')
    .map(line => (line.startsWith('  ') ? line.slice(2) : line))
    .join('\n')
}

/** 从 `{` 出发找到配对的 `}`，跳过注释与字符串 */
function matchBrace(css, open) {
  let depth = 0
  for (let i = open; i < css.length; i++) {
    const c = css[i]
    if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      i = end === -1 ? css.length : end + 1
      continue
    }
    if (c === '"' || c === '\'') {
      i = skipString(css, i)
      continue
    }
    if (c === '{') {
      depth++
    }
    else if (c === '}') {
      depth--
      if (depth === 0)
        return i
    }
  }
  return -1
}

function skipString(css, start) {
  const quote = css[start]
  for (let i = start + 1; i < css.length; i++) {
    if (css[i] === '\\') {
      i++
      continue
    }
    if (css[i] === quote)
      return i
  }
  return css.length
}
