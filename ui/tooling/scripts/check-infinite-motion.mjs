#!/usr/bin/env node
// 门禁：皮肤里每一处无限循环的动画，都必须在同一份皮肤里被减弱动效停掉——两个触发条件各一份。
//
// 令牌层的减弱档只把时长压到 1ms，压不住 `infinite`：1ms 一圈的转圈仍然在转，只是快到看不清。
// 所以写了 `infinite` 的那个部件，要在 `@media (prefers-reduced-motion: reduce)` 里被 `animation: none`，
// 还要有一份 `:where([data-motion='reduce']) <同样的选择器>`——作者在容器上打 data-motion="reduce"
// 局部减弱时，媒体查询不会命中，只有这份选择器版本接得住。
// 停掉的规则可以落在部件本身，也可以落在它的 ::before / ::after 上（转圈多画在伪元素上）。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'
const REDUCE_MEDIA = /^@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)$/
const DATA_MOTION = /^:where\(\[data-motion=['"]reduce['"]\]\)\s+/

/** 去掉块注释但保留换行，报错行号才对得上源文件。 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ''))
}

/**
 * 把一份皮肤拆成规则：每条带它的选择器列表、外层 at 规则栈与声明文本。
 * 逐字符配对花括号，`{` 前的文本是序言，`}` 前的文本是声明。
 */
function rules(css) {
  const out = []
  const stack = []
  let buf = ''
  let line = 1
  for (const ch of css) {
    if (ch === '{') {
      // 序言起始行 = 当前行减去序言正文里的换行数
      const body = buf.trimStart()
      const prelude = body.trim().replace(/\s+/g, ' ')
      stack.push({ prelude, line: line - (body.match(/\n/g) ?? []).length })
      buf = ''
    }
    else if (ch === '}') {
      const top = stack.pop()
      if (top && !top.prelude.startsWith('@')) {
        out.push({
          line: top.line,
          selectors: top.prelude.split(',').map(s => s.trim()).filter(Boolean),
          ats: stack.map(s => s.prelude).filter(p => p.startsWith('@')),
          decls: buf,
        })
      }
      buf = ''
    }
    else {
      if (ch === '\n')
        line++
      buf += ch
    }
  }
  return out
}

/** 取声明文本里某个属性的值；同名多次取最后一次。 */
function valueOf(decls, prop) {
  let found = null
  for (const [, name, value] of decls.matchAll(/(?<![\w-])([\w-]+)\s*:\s*([^;]+)/g)) {
    if (name === prop)
      found = value.trim()
  }
  return found
}

/** 去掉选择器末尾的伪元素，得到部件本身。 */
function partOf(selector) {
  return selector.replace(/::?(?:before|after)$/, '').trim()
}

function isInfinite(decls) {
  const animation = valueOf(decls, 'animation')
  if (animation && /(?<![\w-])infinite(?![\w-])/.test(animation))
    return true
  const count = valueOf(decls, 'animation-iteration-count')
  return count !== null && /(?<![\w-])infinite(?![\w-])/.test(count)
}

function isStopped(decls) {
  return valueOf(decls, 'animation') === 'none' || valueOf(decls, 'animation-name') === 'none'
}

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()
const problems = []
let loops = 0
let skins = 0

for (const file of files) {
  const css = stripComments(await readFile(join(STYLES_DIR, file), 'utf8'))
  const all = rules(css)

  const loopsHere = []
  const mediaStops = new Set()
  const dataStops = new Set()
  for (const rule of all) {
    const inMedia = rule.ats.some(a => REDUCE_MEDIA.test(a))
    if (isStopped(rule.decls)) {
      for (const selector of rule.selectors) {
        if (inMedia)
          mediaStops.add(partOf(selector))
        if (DATA_MOTION.test(selector))
          dataStops.add(partOf(selector.replace(DATA_MOTION, '')))
      }
    }
    if (!inMedia && !rule.selectors.some(s => DATA_MOTION.test(s)) && isInfinite(rule.decls))
      loopsHere.push(rule)
  }

  if (loopsHere.length)
    skins++
  for (const rule of loopsHere) {
    for (const selector of rule.selectors) {
      loops++
      const part = partOf(selector)
      const at = `${file}:${rule.line}  ${selector}`
      if (!mediaStops.has(part))
        problems.push(`${at}  —— 无限循环的动画没有在 @media (prefers-reduced-motion: reduce) 里被 animation: none 停掉`)
      if (!dataStops.has(part))
        problems.push(`${at}  —— 缺 :where([data-motion='reduce']) ${part} 这份规则，作者在容器上打 data-motion 时停不下来`)
    }
  }
}

if (problems.length) {
  console.error('[check-infinite-motion] ✗ 无限循环动画没有被减弱动效停掉：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('写了 infinite 的部件，在同一份皮肤里要有 @media (prefers-reduced-motion: reduce) 与 :where([data-motion=\'reduce\']) 两份 animation: none。')
  process.exit(1)
}

console.log(`[check-infinite-motion] 通过：${files.length} 份皮肤 · ${skins} 份里共 ${loops} 处无限循环动画都有两份停掉的规则`)
