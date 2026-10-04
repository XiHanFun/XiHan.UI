#!/usr/bin/env node
// 门禁：组件与适配器里不写死界面文字，一律从语言包取。
//
// 读屏名、按钮字、空态、校验报错……没配语言包时用的是 en-US 语言包里该组件那一桶，
// 组件源码里不该再出现第二份英文：两份迟早对不上，而换了语言之后漏网的那一句照旧是英文。
// 本门禁拦三种写法：
//   `?? 'Close'`                带大写或空格的文字串当兜底（'md'、'outline'、'B' 这类取值记号不拦）
//   `?? (n => \`Page ${n}\`)`   箭头函数拼出英文句子当兜底
//   `<a>Open source</a>`        React 里直接写的英文文本节点
//   `metaText(x, 'Document')`   给 *Text / *Label 这类出文字的函数直接传英文
// 例外逐条登记在 ALLOWED，写明它为什么不是界面文字。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const ROOTS = [
  'packages/engine/headless/src',
  'packages/adapters/vue/src',
  'packages/adapters/react/src',
  'packages/adapters/web-components/src',
]

/** 语言包本身就是文字的真源。 */
const SKIP_DIRS = new Set(['locale'])

/** 「文件:匹配到的文字」→ 理由。 */
const ALLOWED = {}

const TEXT_FALLBACK = /\?\?\s*(?:'([^']*)'|"([^"]*)")/g
/** 出文字的函数（名字以 Text / Label 收尾）的实参段。 */
const TEXT_CALL = /\b\w*(?:Text|Label)\(([^()]*)\)/g
/** 实参里首字母大写、带小写字母的英文串。 */
const ENGLISH_ARG = /'([A-Z][a-z][^']*)'/g
/** 箭头的形参段：只有标识符、类型标注与括号。 */
const ARROW_PARAMS = /^[\w\s(),:?]*$/

/** 一行里每个 `??` 后面紧跟的箭头函数若直接返回模板串，取出那段模板。 */
function arrowTemplates(code) {
  const out = []
  let at = code.indexOf('??')
  while (at !== -1) {
    const rest = code.slice(at + 2)
    const arrow = rest.indexOf('=>')
    if (arrow !== -1 && ARROW_PARAMS.test(rest.slice(0, arrow))) {
      const body = rest.slice(arrow + 2).trimStart()
      const end = body.indexOf('`', 1)
      if (body.startsWith('`') && end !== -1)
        out.push(body.slice(1, end))
    }
    at = code.indexOf('??', at + 2)
  }
  return out
}
// 文本节点夹在标签与闭合标签之间；`=> Promise<` 这类泛型前面是箭头、后面不是 </，不算
const JSX_TEXT = /(?<![=-])>\s*([A-Z][a-z]+(?: [a-z]+)*[.…]?)\s*<\//g

async function files(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name))
        out.push(...await files(join(dir, entry.name)))
    }
    else if (/\.(?:ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      out.push(join(dir, entry.name))
    }
  }
  return out
}

/** 模板里去掉 `${…}` 之后还剩英文单词，才算拼出了一句话。 */
function spellsWords(template) {
  return /[A-Z]?[a-z]{2,}/.test(template.replace(/\$\{[^}]*\}/g, ''))
}

const problems = []
const usedAllowed = new Set()
let scanned = 0

for (const root of ROOTS) {
  for (const file of await files(root)) {
    scanned++
    const where = file.replaceAll('\\', '/')
    const lines = (await readFile(file, 'utf8')).split('\n')
    lines.forEach((line, index) => {
      const code = line.replace(/\/\/.*$/, '')
      if (/^\s*\*/.test(code))
        return
      const hits = []
      for (const match of code.matchAll(TEXT_FALLBACK)) {
        const text = match[1] ?? match[2]
        // 带大写或空格才像一句话；'md'、'outline' 是取值记号，'B' 这类单个字母是条码码集
        if (/[A-Z\s]/.test(text) && /[a-z]{2,}/i.test(text))
          hits.push(text)
      }
      for (const template of arrowTemplates(code)) {
        if (spellsWords(template))
          hits.push(template)
      }
      for (const call of code.matchAll(TEXT_CALL)) {
        for (const arg of call[1].matchAll(ENGLISH_ARG))
          hits.push(arg[1])
      }
      if (where.endsWith('.tsx')) {
        for (const match of code.matchAll(JSX_TEXT))
          hits.push(match[1])
      }
      for (const text of hits) {
        const key = `${where}:${text}`
        if (key in ALLOWED) {
          usedAllowed.add(key)
          continue
        }
        problems.push(`${where}:${index + 1} 写死了界面文字「${text}」——放进语言包（locale/en-US.ts 该组件那一桶与其余各语言），组件里从 translations 取`)
      }
    })
  }
}

for (const key of Object.keys(ALLOWED)) {
  if (!usedAllowed.has(key))
    problems.push(`ALLOWED 里的「${key}」没被扫到——登记过期了`)
}

if (problems.length > 0) {
  console.error('[check-builtin-text] ✗')
  for (const problem of problems)
    console.error(`  ${problem}`)
  process.exit(1)
}

console.log(`[check-builtin-text] 通过：${scanned} 份源码没有写死的界面文字，文案一律从语言包取`)
