#!/usr/bin/env node
// 门禁：箭头规则里不许写行内轴逻辑属性，共享皮肤要排在浮层皮肤之后引入。
//
// 箭头是正方形转 45°，构成尖角的是哪两条物理边，与文字方向无关。用 inset-inline-* 贴边、
// 用 border-inline-* 摘边框，RTL 下会贴到离锚点最远那一侧、摘错一条边，尖角朝向反 180°。
// 页面不报错、单测量不到，只有把界面切成 RTL 才看得见。
//
// 摘边框那几条与各皮肤的 border 简写等特异性，靠源序定胜负：共享皮肤排到前面去，
// 六族浮层的箭头会整片留着四条边。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES = 'packages/design/styles/css'
const INDEX = 'packages/design/styles/index.css'
const SHARED = 'overlay-arrow.css'

/** 消费引擎逻辑量的那一条，逐条写明理由。 */
const ALLOW = [
  {
    file: SHARED,
    selector: '[data-part=\'arrow\'][data-placement^=\'bottom\']',
    property: 'inset-inline-start',
    reason: '行内轴上的箭头中心：定位引擎在 RTL 下已把 arrow-x 镜像成逻辑量，逻辑量配逻辑属性才对得上',
  },
  {
    file: SHARED,
    selector: '[data-part=\'arrow\'][data-placement^=\'top\']',
    property: 'inset-inline-start',
    reason: '同上，上下两侧共用行内轴那根落点',
  },
]

/** 皮肤里没有嵌套选择器，最内层的 `{...}` 就是一条规则。注释换成等量换行，行号照原文数。 */
function rulesOf(css) {
  const found = []
  const blanked = css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
  for (const m of blanked.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const at = m.index + m[1].length - m[1].trimStart().length
    found.push({
      selector: m[1].trim().replace(/\s+/g, ' '),
      body: m[2],
      line: blanked.slice(0, at).split('\n').length,
    })
  }
  return found
}

const errors = []
const hit = new Set()

const files = (await readdir(STYLES)).filter(name => name.endsWith('.css'))
if (files.length === 0) {
  console.error(`[check-arrow-geometry] ✗ 一份皮肤都没扫到，${STYLES} 目录层级变了`)
  process.exit(1)
}

let scanned = 0
for (const file of files) {
  const css = await readFile(join(STYLES, file), 'utf8')
  for (const rule of rulesOf(css)) {
    if (!rule.selector.includes('[data-part=\'arrow\']'))
      continue
    scanned++
    for (const decl of rule.body.matchAll(/^[^\S\n]*((?:inset|border)-inline-[\w-]+)[^\S\n]*:/gm)) {
      const property = decl[1]
      const allowed = ALLOW.findIndex(a => a.file === file && a.selector === rule.selector && a.property === property)
      if (allowed === -1)
        errors.push(`${file}:${rule.line}  ${rule.selector}\n    ${property} —— 贴边与摘边框跟着物理旋转走，RTL 下逻辑属性会翻到反面`)
      else
        hit.add(allowed)
    }
  }
}

// 反向：白名单条目对不上任何一条声明，说明它已经过期，留着会放行下一次真违例
ALLOW.forEach((entry, i) => {
  if (!hit.has(i))
    errors.push(`白名单第 ${i + 1} 条已过期：${entry.file} 的 ${entry.selector} 里没有 ${entry.property}`)
})

// 共享皮肤的摘边框要压过各皮肤的 border 简写，引入顺序是唯一的胜负依据
const index = await readFile(INDEX, 'utf8')
const imported = [...index.matchAll(/@import '\.\/css\/([\w-]+\.css)'/g)].map(m => m[1])
const sharedAt = imported.indexOf(SHARED)
if (sharedAt === -1) {
  errors.push(`index.css 没引入 css/${SHARED}`)
}
else {
  for (const file of files) {
    if (file === SHARED)
      continue
    const css = await readFile(join(STYLES, file), 'utf8')
    if (!rulesOf(css).some(r => r.selector.includes('[data-part=\'arrow\']') && /^[^\S\n]*border[^\S\n]*:/m.test(r.body)))
      continue
    const at = imported.indexOf(file)
    if (at > sharedAt)
      errors.push(`index.css 里 css/${file} 排在 css/${SHARED} 之后：它的 border 简写会把摘掉的边框加回来`)
  }
}

if (errors.length > 0) {
  console.error('[check-arrow-geometry] ✗')
  for (const error of errors)
    console.error(`  ${error}`)
  process.exit(1)
}

console.log(`[check-arrow-geometry] 通过：${scanned} 条箭头规则贴边与摘边框都走物理属性（白名单 ${ALLOW.length} 条），共享皮肤排在浮层皮肤之后`)
