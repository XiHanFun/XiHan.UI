#!/usr/bin/env node
// 门禁:皮肤不得使用会抬高浏览器硬底线的无兜底特性;允许的增强特性必须带级联兜底。
//
// 硬底线由三个无兜底特性(@layer / oklch() / color-mix())钉死,见 docs/guide/versioning.md。
// 低于底线时皮肤整体无样式,所以「写了一个新特性」等于「悄悄抬了底线」——此前没有任何一条
// 门禁会响。这条门禁把底线钉进 .browserslistrc 与一份拒绝名单:
//
//   拒绝名单    → 高于地板且无从兜底的特性,出现即失败(@container 会把底线从 2023-03 抬到 2023-09)
//   级联兜底    → 允许的增强特性(light-dark / 动态视口单位)必须同级联兜底:同一规则块内,
//                 同一属性先写一条旧引擎认的取值,再写新特性,旧引擎丢弃后一条、保留前一条
//   白名单      → field-sizing 的退化路径是 textarea 的 rows 属性(HTML 侧),CSS 里没有可机械
//                 验证的兜底,按文件白名单放行,新用法必须来这条名单面前说清退化路径
//
// .browserslistrc 只作记录,不参与判定:判定依据是拒绝名单与兜底检查,两者都以文档化的
// 硬底线为基准,改名单时必须同步改 versioning.md 的支持面表格。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES = 'packages/design/styles/css'
const BROWSERSLIST = '.browserslistrc'

// —— 拒绝名单:出现即抬底线,无一例外 ——
const REJECT = [
  { name: '@container 容器查询', re: /@container\b/, reason: 'size 查询把底线从 2023-03 抬到 2023-09' },
  { name: '@scope 作用域规则', re: /@scope\b/, reason: 'Chrome 118 起,高于底线' },
  { name: '@starting-style 起始样式', re: /@starting-style\b/, reason: 'Firefox 129 / Safari 17.5 起,高于底线' },
  { name: 'view-transition 视图过渡', re: /view-transition|::view-transition/, reason: 'Firefox / Safari 晚于底线' },
  { name: 'animation-timeline 滚动驱动动画', re: /animation-timeline|scroll-timeline|timeline-scope/, reason: 'Chrome 115 起,高于底线' },
  { name: 'interpolate-size 插值尺寸', re: /interpolate-size\b/, reason: 'Chrome 129 起,高于底线' },
  { name: 'text-box-trim 行盒裁剪', re: /text-box-(?:trim|edge)/, reason: 'Chrome 133 起,高于底线' },
  { name: 'CSS 嵌套选择器', re: /^[^\S\n]*&[^=]|^[^\S\n]*:is\(&|^[^\S\n]*:not\(&/m, reason: 'Chrome 120 / Firefox 117 起,高于底线' },
]

// —— 级联兜底:允许使用,但同一规则块内同一属性必须先有旧写法 ——
const CASCADE = [
  { name: 'light-dark()', marker: /light-dark\(/, fallbackOf: value => !value.includes('light-dark('), hint: '同一属性先写一条普通颜色声明,再写 light-dark() 那条' },
  { name: '动态视口单位 svh/lvh/dvh', marker: /(?:^|[^a-z-])(?:svh|lvh|dvh)\b/, fallbackOf: value => /(?:^|[^a-z-])vh\b/.test(value), hint: '同一属性先写 vh 声明,再写动态视口单位那条' },
]

// —— 白名单:退化路径在 CSS 外,逐文件放行 ——
const ALLOWLIST = new Map([
  ['composer.css', 'field-sizing:退化路径是 <textarea> 的 rows 属性定下的固定行数(HTML 侧),CSS 里无法机械验证'],
])

// 把文件切成顶层规则块:'{' 深度归零处切开。@media 等 at-rule 与其后的规则块各自成块,
// 级联判定落在同一块内的「先旧后新」上。
function ruleBlocks(css) {
  const blocks = []
  let depth = 0
  let start = 0
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '{') {
      if (depth === 0)
        start = i
      depth++
    }
    else if (css[i] === '}') {
      depth--
      if (depth === 0)
        blocks.push(css.slice(start, i + 1))
    }
  }
  return blocks
}

/** 块内声明行:缩进 + 属性名 + 冒号 + 值。属性名覆盖 --xh-* 与普通属性;空白只吃水平空白。 */
function declarationsOf(block) {
  return [...block.matchAll(/^[^\S\n]*((--[\w-]+|[a-z-]+))[^\S\n]*:([^\n]*)$/gm)]
    .map(m => ({ name: m[1], value: m[2].trim(), line: m[0].trim() }))
}

const errors = []

// .browserslistrc 必须存在:它是地板的书面记录,拒绝名单与之对照
try {
  const floor = await readFile(BROWSERSLIST, 'utf8')
  if (!floor.trim()) {
    console.error(`[check-css-floor] ✗ ${BROWSERSLIST} 是空的,硬底线没有记录`)
    process.exit(1)
  }
}
catch {
  console.error(`[check-css-floor] ✗ 缺少 ${BROWSERSLIST},硬底线没有书面记录,拒绝名单失去对照`)
  process.exit(1)
}

const files = (await readdir(STYLES)).filter(name => name.endsWith('.css'))
for (const file of files) {
  const css = await readFile(join(STYLES, file), 'utf8')
  // 注释里的特性名不算使用——皮肤常写「不要用 @container」这类说明,照字面扫会误报
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '')

  for (const item of REJECT) {
    if (item.re.test(noComments))
      errors.push(`${file}:用了「${item.name}」——${item.reason},会悄悄抬高浏览器硬底线`)
  }

  for (const block of ruleBlocks(css)) {
    const prev = new Map()
    for (const decl of declarationsOf(block)) {
      for (const item of CASCADE) {
        if (item.marker.test(decl.value)) {
          const before = prev.get(decl.name)
          if (before === undefined || !item.fallbackOf(before.value))
            errors.push(`${file}:${decl.line.slice(0, 80)} —— ${item.name} 缺级联兜底,${item.hint}`)
        }
      }
      prev.set(decl.name, decl)
    }
  }

  // field-sizing 只允许出现在白名单文件里
  if (/field-sizing/.test(noComments) && !ALLOWLIST.has(file))
    errors.push(`${file}:用了 field-sizing,但不在白名单里——先说明退化路径再放进 ALLOWLIST`)
}

// 空转保护:目录层级变了会一个文件都扫不到却照样绿
if (files.length === 0) {
  console.error('[check-css-floor] ✗ 一份皮肤都没扫到,styles/css 目录层级变了')
  process.exit(1)
}

if (errors.length > 0) {
  console.error('[check-css-floor] ✗')
  for (const e of errors)
    console.error(`  ${e}`)
  process.exit(1)
}

console.log(`[check-css-floor] 通过:${files.length} 份皮肤没有抬底线的特性,增强特性都带级联兜底(白名单 ${ALLOWLIST.size} 条)`)
