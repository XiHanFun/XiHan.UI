#!/usr/bin/env node
// 门禁：钉在视口上、又贴着视口边的那几处，贴边必须与安全区取大的一头。
//
// 带刘海、圆角与底部横条的移动视口上，屏幕四周有一段是系统占着的：贴边只写设计档位时，
// 提示条的一角会被圆角切掉、回到顶部的钮压在底部横条底下、抽屉的首尾两行钻进状态栏。
// 桌面上 env(safe-area-inset-*) 恒为 0，写不写这一条在开发机上看不出任何差别——
// 这正是它一直缺席的原因。
//
// 三条判据：
//   ① 机检面：一份皮肤里被声明过 position: fixed 的部件，若它还带着非零的贴边
//      （inset-* 或 padding-*），那几条声明里必须至少有一条写了 env(safe-area-inset-*)。
//   ② 登记面：认不出来的那几处——钉在铺满视口的那一层上、写的是 position: absolute 的悬浮件——
//      逐处登记在 REGISTERED 里；登记项同样要真写了 env()，扫不到那个部件即名单过期。
//   ③ EXEMPT 登记「这一处确实碰不到屏幕边」，逐条写明理由；登了却没被用来放行过即名单过期。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const STYLES_DIR = 'packages/design/styles/css'

/**
 * 贴边属性：写在这几条上的取值决定元素离视口边多远。
 * 四角简写 inset 与 padding 简写一并收，它们同样能把元素顶到边上。
 */
const EDGE_PROP = /^(?:inset(?:-block|-inline)?(?:-(?:start|end))?|padding(?:-(?:block|inline)(?:-(?:start|end))?)?)$/

/** 单独一条边的贴边属性：写成 0 就是贴死那条边，与写成一个正数一样要让安全区。 */
const SINGLE_EDGE = /^inset-(?:block|inline)-(?:start|end)$/

/**
 * 这条声明算不算「贴着视口边」。
 * auto 不算：那是不定位。0 分两种——四角简写与 padding 写 0 是「铺满 / 没有内衬」，
 * 单独一条边写 0 是贴死那条边，照样要让安全区。
 */
function isEdge(prop, value) {
  if (!EDGE_PROP.test(prop))
    return false
  const v = value.trim()
  if (v === 'auto')
    return false
  if (v === '0')
    return SINGLE_EDGE.test(prop)
  return true
}

/**
 * 认不出来的贴边处：写的是 position: absolute，钉在同组件那层铺满视口的面上。
 * 键是皮肤文件名，值是那几个部件；登记的部件必须在皮肤里真存在，也必须真写了 env()。
 */
const REGISTERED = {
  'image-viewer.css': ['toolbar', 'counter', 'prev-trigger', 'next-trigger', 'close-trigger'],
}

/**
 * 确实碰不到屏幕边的贴边处，逐条写明理由。
 */
const EXEMPT = {
  'dialog.css:positioner': '对话框恒居中，这条内衬正是把它挡在视口边之外的那一段，面板自己不贴边',
  'tooltip.css:positioner': '那两个 0 是坐标算出来之前的落点，落位由引擎写进内联样式，定位层自己不贴边',
}

/** 去掉块注释但保留换行。 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ' '))
}

const problems = []
const exemptSeen = new Set()
const registeredSeen = new Set()
let guarded = 0

const files = (await readdir(STYLES_DIR)).filter(name => name.endsWith('.css')).sort()

for (const file of files) {
  const css = stripComments(await readFile(join(STYLES_DIR, file), 'utf8'))
  /** 被声明过 position: fixed 的部件。 */
  const pinned = new Set()
  /** 部件 → 它身上那些非零贴边声明的取值。 */
  const edges = new Map()
  /** 皮肤里出现过的部件名，登记名单的过期反查照它算。 */
  const parts = new Set()

  for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = rule[1].replace(/\s+/g, ' ').trim()
    const body = rule[2]
    const named = [...selector.matchAll(/data-part='([a-z0-9-]+)'/g)].map(hit => hit[1])
    if (named.length === 0)
      continue
    // 后代选择器作用在末端那个元素上
    const part = named.at(-1)
    parts.add(part)
    if (/position:\s*fixed/.test(body))
      pinned.add(part)
    for (const declaration of body.matchAll(/([\w-]+)\s*:([^;]+)(?:;|$)/g)) {
      const prop = declaration[1].trim()
      const value = declaration[2].trim()
      if (!isEdge(prop, value))
        continue
      if (!edges.has(part))
        edges.set(part, [])
      edges.get(part).push({ prop, value })
    }
  }

  const wanted = new Set(REGISTERED[file] ?? [])
  for (const part of pinned) {
    if (edges.has(part))
      wanted.add(part)
  }

  for (const part of wanted) {
    if (!parts.has(part)) {
      problems.push(`REGISTERED['${file}'] 登着 ${part}，但这份皮肤里没有这个部件——名单过期`)
      continue
    }
    const key = `${file}:${part}`
    if (key in EXEMPT) {
      exemptSeen.add(key)
      continue
    }
    const declarations = edges.get(part) ?? []
    if (declarations.some(item => /env\(\s*safe-area-inset-/.test(item.value))) {
      guarded++
      registeredSeen.add(key)
      continue
    }
    const shown = declarations.map(item => `${item.prop}: ${item.value.replace(/\s+/g, ' ')}`).join('；') || '（这份皮肤里没有贴边声明）'
    problems.push(
      `${file} 的 ${part} 钉在视口上又贴着视口边，贴边里没有 env(safe-area-inset-*)：${shown}\n`
      + '      改成 max(<原来的贴边>, env(safe-area-inset-…))——桌面上 env() 恒为 0，取值一点不变；'
      + '确实碰不到屏幕边的登记进 EXEMPT 并写明理由',
    )
  }
}

for (const [file, list] of Object.entries(REGISTERED)) {
  if (!files.includes(file)) {
    problems.push(`REGISTERED 登着 ${file}，但皮肤目录里没有这份文件——名单过期`)
    continue
  }
  for (const part of list) {
    if (!registeredSeen.has(`${file}:${part}`))
      problems.push(`REGISTERED['${file}'] 登着 ${part}，但它没有写 env(safe-area-inset-*)——补上，或者删掉这条登记`)
  }
}

for (const key of Object.keys(EXEMPT)) {
  if (!exemptSeen.has(key))
    problems.push(`EXEMPT 里登着 ${key}，却没有一处是靠它放行的——名单过期了，删掉这一条`)
}

if (problems.length > 0) {
  console.error('[check-safe-area] ✗ 安全区有缺口：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  process.exit(1)
}

console.log(`[check-safe-area] 通过：${files.length} 份皮肤 · ${guarded} 处贴边与安全区取大的一头（登记放行 ${exemptSeen.size} 处）`)
