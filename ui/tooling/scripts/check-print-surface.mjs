#!/usr/bin/env node
// 门禁：打印时纯交互性的节点要收起，投影要由令牌层取消。
//
// 打印结果只能人眼验，但漏没漏是查得出来的，而且漏了在开发机上一点征兆都没有——
// 没人会为了改一个下拉去点一次打印预览，浮层就那么原样印在纸上，盖着底下的正文。
//
// 四件事：
// ① 有 positioner / backdrop 部件的皮肤，各自要在 @media print 里把它 display: none。
//    这条只能落在皮肤里：reset 层排在组件层之前，写在那儿会被组件层任何一条 display 压掉，
//    而拆层版本里两者又按特指度重新竞争，两份入口的表现会当场分叉。
// ② 滚动条与回到顶部/底部的按钮同理收起，逐处登记，登了却扫不到即名单过期。
// ③ 投影走令牌层重映射：三支海拔角色在 @media print 里取消。皮肤消费的是
//    var(--xh-<组件>-…-shadow, var(--xh-elevation-<角色>))，角色一变 none 就整层不画，
//    不必去跟六个属性深的皮肤选择器比特指度。
// ④ 只有颜色通道承载语义的表面（热度色阶、标出来的行）必须在打印档另开一条非颜色通道：
//    多数打印默认丢背景色，只剩灰度相近的一堆字。逐处登记，登了却扫不到即名单过期。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'
const TOKENS_CSS = 'packages/design/tokens/tokens.css'

/** 纯交互性节点：靠属性钩子认得出的两类，有就必须收。 */
const AUTO_PARTS = ['positioner', 'backdrop']

/**
 * 认不出的那几处：滚在纸上没有意义的条子，以及"回到某一端"的按钮。
 * 它们没有共同的部件名，只能逐处登记；登了却扫不到会报名单过期，免得名单变成免检通行证。
 */
const REGISTERED = {
  'scrollbar.css': ['root', 'corner'],
  'back-top.css': ['root'],
  'log.css': ['scroll-to-end-trigger'],
  'message-feed.css': ['scroll-to-end-trigger'],
  // 钉在视口上的那几处：纸上没有视口，它们会印在页面某处盖住正文
  'float-button.css': ['root'],
  'loading-bar.css': ['root'],
  'toast.css': ['group'],
  'notification.css': ['group'],
}

/**
 * 钉住的是作者自己的内容，不能收起，只把它放回正常流——保持 fixed 会让部分打印引擎每页重复一次。
 * 与 REGISTERED 分开是因为要查的声明不同：那边查 display: none，这边查 position: static。
 */
const UNPINNED = {
  'affix.css': ['content'],
}

/**
 * 只有颜色通道承载语义的表面：热度色阶、标出来的行。多数打印默认丢背景色，
 * 剩下的只是灰度相近的一堆字，深浅与标记在纸上一点都读不出来。
 * 这几处必须在 @media print 里另给一条非颜色通道——边框、描边、字形或字重都算。
 * 登了却扫不到即名单过期。
 */
const COLOR_ONLY = {
  'heatmap.css': ['cell', 'legend-item'],
  'code-view.css': ['line'],
}

/**
 * 印在纸上还看得见的非颜色通道：描边的宽与线型、字形、下划线、字重与字形斜正。
 * 只写 -color / -offset / -radius 的那几个不算——颜色本身正是打印会丢掉的那一支，
 * 偏移与圆角画不出任何东西。
 */
const INK_CHANNEL = /(?:border(?:-(?:block|inline)(?:-(?:start|end))?|-(?:top|right|bottom|left))?(?:-(?:width|style))?|outline(?:-(?:width|style))?|content|text-decoration(?:-(?:line|style))?|font-weight|font-style)\s*:/

/** 海拔角色：令牌层必须在打印档把它们全部取消。 */
const ELEVATION_ROLES = ['raised', 'lifted', 'floating', 'sheet']

/** 去掉块注释但保留换行，行号才对得上源文件。 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ''))
}

/** 从 open 处的左花括号配对求块尾下标。 */
function blockEnd(css, open) {
  let depth = 0
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') {
      depth++
    }
    else if (css[i] === '}') {
      depth--
      if (depth === 0)
        return i
    }
  }
  return css.length
}

/** 一份 CSS 里所有 `@media print` 块的正文拼起来。 */
function printBody(css) {
  let out = ''
  const re = /@media\s+print\s*\{/g
  for (let m = re.exec(css); m !== null; m = re.exec(css)) {
    const open = m.index + m[0].length - 1
    out += `${css.slice(open + 1, blockEnd(css, open))}\n`
  }
  return out
}

/** 打印块里有没有把 scope/part 收成 display: none。选择器列表逐项看，末端就是被作用的那个元素。 */
function hiddenInPrint(body, scope, part) {
  const head = `[data-scope='${scope}'][data-part='${part}']`
  for (const rule of body.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!/display:\s*none/.test(rule[2]))
      continue
    const hit = rule[1]
      .split(',')
      .map(s => s.replace(/\s+/g, ' ').trim())
      // 后代 / 兄弟选择器作用在末端那个元素上，开头是谁不算数
      .some(s => s.startsWith(head) && !/^[\s>+~]/.test(s.slice(head.length)))
    if (hit)
      return true
  }
  return false
}

/** 打印块里有没有给这个部件另开一条非颜色通道。 */
function inkedInPrint(body, scope, part) {
  const head = `[data-scope='${scope}'][data-part='${part}']`
  for (const rule of body.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!INK_CHANNEL.test(rule[2]))
      continue
    const hit = rule[1]
      .split(',')
      .map(s => s.replace(/\s+/g, ' ').trim())
      .some(s => s.includes(head))
    if (hit)
      return true
  }
  return false
}

const problems = []
const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()
let hidden = 0
let unpinned = 0
let inked = 0

for (const file of files) {
  const scope = file.replace(/\.css$/, '')
  const css = stripComments(await readFile(join(STYLES_DIR, file), 'utf8'))
  // reset.css 里那两条 positioner 规则不属于任何一个 scope，它管的是所有浮层的落位契约
  if (!css.includes(`[data-scope='${scope}']`))
    continue
  const body = printBody(css)

  const want = new Set(REGISTERED[file] ?? [])
  for (const part of AUTO_PARTS) {
    if (css.includes(`[data-scope='${scope}'][data-part='${part}']`))
      want.add(part)
  }

  for (const part of want) {
    if (!css.includes(`[data-scope='${scope}'][data-part='${part}']`)) {
      problems.push(`REGISTERED['${file}'] 登着 ${part}，但这份皮肤里没有这个部件——名单过期`)
      continue
    }
    if (hiddenInPrint(body, scope, part))
      hidden++
    else
      problems.push(`${file} 的 ${part} 在 @media print 里没有 display: none——它会原样印在纸上`)
  }

  for (const part of UNPINNED[file] ?? []) {
    if (!css.includes(`[data-scope='${scope}'][data-part='${part}']`)) {
      problems.push(`UNPINNED['${file}'] 登着 ${part}，但这份皮肤里没有这个部件——名单过期`)
      continue
    }
    const rule = new RegExp(`\\[data-scope='${scope}'\\]\\[data-part='${part}'\\][^{]*\\{[^}]*position:\\s*static`)
    if (rule.test(body))
      unpinned++
    else
      problems.push(`${file} 的 ${part} 在 @media print 里没有 position: static——固定定位会让它每页重复一次`)
  }

  for (const part of COLOR_ONLY[file] ?? []) {
    if (!css.includes(`[data-scope='${scope}'][data-part='${part}']`)) {
      problems.push(`COLOR_ONLY['${file}'] 登着 ${part}，但这份皮肤里没有这个部件——名单过期`)
      continue
    }
    if (inkedInPrint(body, scope, part))
      inked++
    else
      problems.push(`${file} 的 ${part} 只有颜色通道承载语义，在 @media print 里没有另开一条非颜色通道——多数打印丢背景色，纸上读不出深浅`)
  }
}

for (const file of [...Object.keys(REGISTERED), ...Object.keys(UNPINNED), ...Object.keys(COLOR_ONLY)]) {
  if (!files.includes(file))
    problems.push(`名单登着 ${file}，但皮肤目录里没有这份文件——名单过期`)
}

// 令牌层：三支海拔角色在打印档取消
const tokens = printBody(stripComments(await readFile(TOKENS_CSS, 'utf8')))
if (!tokens.trim()) {
  problems.push(`${TOKENS_CSS} 没有 @media print 块——投影在纸上会印成一片脏灰`)
}
else {
  if (!/:where\(\[data-scope\]\)/.test(tokens))
    problems.push(`${TOKENS_CSS} 的打印块落点不是 :where([data-scope])——打在 :root 上会替宿主页面决定打印样式`)
  for (const role of ELEVATION_ROLES) {
    if (!new RegExp(`--xh-elevation-${role}:\\s*none;`).test(tokens))
      problems.push(`${TOKENS_CSS} 的打印块没有取消 --xh-elevation-${role}`)
  }
}

if (problems.length) {
  console.error('[check-print-surface] ✗ 打印档有缺口：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('浮层定位层、遮罩、滚动条与回到两端的按钮在 @media print 里收起；投影由令牌层的打印块取消。')
  process.exit(1)
}

console.log(`[check-print-surface] 通过：${files.length} 份皮肤 · ${hidden} 处交互性节点在打印时收起、${unpinned} 处钉住的内容放回正常流、${inked} 处只有颜色通道的表面另开了非颜色通道，${ELEVATION_ROLES.length} 支海拔角色由令牌层取消`)
