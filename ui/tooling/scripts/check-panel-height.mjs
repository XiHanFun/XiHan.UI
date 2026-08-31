#!/usr/bin/env node
// 门禁：面板与列表的高度只走三档滚动面令牌，并排成对的面板一律定高。
//
// 面板高度散着写就会长出一堆并存的上限（11.25rem / 12rem / 14rem / 16rem / 20rem / 24rem），
// 谁也说不清哪个是「一列该多高」。并排成对的两块面板若按内容收，搬走几条之后整块矮一截，
// 旁边那块跟着错位——这是穿梭框搬完条目整体变矮的根因。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'

/** 高度属性。 */
const HEIGHT_PROPS = new Set(['block-size', 'min-block-size', 'max-block-size'])

/** 滚动面高度令牌：三档定高、页内滚动面上限、菜单族上限、列表族上限。 */
const HEIGHT_TOKENS = /--xh-(?:viewport-h-(?:sm|md|lg)|viewport-max-h|overlay-menu-max-h|overlay-max-h)\b/

/** 不带尺寸的取值：把高度交给外层或视口，或者明说「不设下限 / 不设上限」。 */
const PASS_THROUGH = /^(?:0|none|100%|auto|inherit|unset|revert|fit-content|max-content|min-content)$/

/** 并排成对的面板：两块并排，其中一块按内容收就会与另一块错位，必须定高。 */
const PAIRED = {
  'transfer': ['list'],
  'cascader': ['column'],
  'time-picker': ['column'],
  'date-picker': ['time-column'],
}

/**
 * 高度不上滚动面这把尺的面板，连同理由。键写成「组件 部件」。
 * 登记后既不要求写高度声明（不限高），也不管它已有的高度取值（高度由别的尺给）。
 * 名单之外的滚动面板一律受本门禁管辖。
 */
const EXEMPT = {
  'tooltip content': '一句话气泡，高度就是那一两行字，限高只会把提示裁掉',
  'popconfirm content': '确认气泡是一段问句加两颗按钮，内容有多高就多高',
  'cascader content': '横排面板：滚的是列的方向（overflow-x），纵向高度由最高的那一列给',
  'navigation-menu content': '横排导航面板，内容分栏铺开，纵向不滚',
  'tour content': '引导卡片不是浮层菜单，卡片文案有多长就多高',
  'code-block pre': '代码块滚的是横向长行，纵向由代码行数决定，截断会把代码读断',
  'code-view pre': '同 code-block：纵向高度由行数算出来写进内联样式，折叠时夹到 clamp 行，不是预设的档',
  'floating-panel body': '面板高度由用户拖出来、存在机器里，不是预设的档',
  'heatmap root': '热力图滚的是横向的周列，纵向就是七行格子的高度',
  'drawer content': '贴边抽屉的厚度走 --xh-overlay-drawer-w-* 档，不是滚动面高度',
  'layout sider': '贴边侧栏的高度是视口减去顶栏偏移，跟着页面走',
  'log viewport': '日志窗高度是「显示几行」乘行高，行数由使用者给',
  'marquee root': '跑马灯的高度是内容轨道自己的高度',
  'scroll-area viewport': '视口高度是容器高度减去滚动条厚度，容器多高就多高',
}

/** 去掉注释。 */
function strip(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '')
}

/** 拆成最内层规则：[{ selectors, decls }]，decls 是 [属性, 值] 对。 */
function parseRules(src) {
  const rules = []
  for (const m of src.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = m[1].split(',').map(s => s.trim().replace(/\s+/g, ' ')).filter(Boolean)
    if (selectors.length === 0 || selectors[0].startsWith('@'))
      continue
    const decls = []
    for (const d of m[2].matchAll(/(?:^|;)\s*(--[\w-]+|[a-z-]+)\s*:\s*([^;]+)/g))
      decls.push([d[1], d[2].trim().replace(/\s+/g, ' ')])
    rules.push({ selectors, decls })
  }
  return rules
}

/** 选择器里最后一个 data-part。 */
function lastPart(selector) {
  const parts = [...selector.matchAll(/\[data-part='([\w-]+)'\]/g)]
  return parts.length ? parts.at(-1)[1] : null
}

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css'))
const problems = new Map()
/** 每份皮肤出现过的 data-part，用来核验名单里的条目还在不在。 */
const partsBySkin = new Map()
/** 收进来的滚动面板，键写成「组件 部件」。 */
const panelsBySkin = new Map()
/** 用上了的例外条目。 */
const usedExempt = new Set()
let governed = 0

function report(comp, detail) {
  if (!problems.has(comp))
    problems.set(comp, [])
  problems.get(comp).push(detail)
}

for (const file of files) {
  const comp = file.replace(/\.css$/, '')
  const src = strip(await readFile(join(STYLES_DIR, file), 'utf8'))
  const rules = parseRules(src)

  const slots = new Map()
  for (const rule of rules) {
    for (const [name, value] of rule.decls) {
      if (name.startsWith('--'))
        slots.set(name, [...(slots.get(name) ?? []), value])
    }
  }

  /**
   * 值本身或它的组件槽回退链上出现过滚动面令牌。
   * `min(那把尺, var(--xh-_<c>-available-h))` 这种写法算数：可用高度是定位引擎算出的视口余量，
   * 它只负责在屏幕装不下时再收一截，尺仍是 min() 里的另一半。
   */
  const onScale = (value, depth = 0) => {
    if (PASS_THROUGH.test(value) || HEIGHT_TOKENS.test(value))
      return true
    if (depth >= 4)
      return false
    const refs = [...value.matchAll(/var\(\s*(--[\w-]+)/g)]
    return refs.some(ref => (slots.get(ref[1]) ?? []).some(declared => onScale(declared, depth + 1)))
  }

  // 一、收面板：规则里滚起来的部件就是面板，各皮肤的部件名不止一套，按实际 overflow 收
  const panels = new Map()
  const allParts = new Set()
  for (const rule of rules) {
    const scrolls = rule.decls.some(([name, value]) => /^overflow(?:-[xy]|-block|-inline)?$/.test(name) && /\b(?:auto|scroll)\b/.test(value))
    for (const selector of rule.selectors) {
      const part = lastPart(selector)
      if (part == null)
        continue
      allParts.add(part)
      if (!scrolls)
        continue
      if (!panels.has(part))
        panels.set(part, { heights: new Map() })
    }
  }
  partsBySkin.set(comp, allParts)

  // 二、面板上的高度声明：基础块与带状态的块都算，同一属性后写的覆盖先写的
  for (const rule of rules) {
    for (const selector of rule.selectors) {
      const part = lastPart(selector)
      if (part == null || !panels.has(part))
        continue
      for (const [name, value] of rule.decls) {
        if (!HEIGHT_PROPS.has(name))
          continue
        panels.get(part).heights.set(name, { value, selector })
      }
    }
  }

  for (const [part, panel] of panels) {
    const key = `${comp} ${part}`
    panel.onScale = panel.heights.size > 0 && [...panel.heights.values()].every(h => onScale(h.value))
    panelsBySkin.set(key, panel)
    if (key in EXEMPT) {
      usedExempt.add(key)
      continue
    }

    // 三、高度取值只许落在滚动面令牌上
    for (const [name, { value }] of panel.heights) {
      if (onScale(value)) {
        governed++
        continue
      }
      report(comp, `${part} 的 ${name}: ${value} —— 没走 --xh-viewport-h-* / --xh-viewport-max-h / --xh-overlay-menu-max-h / --xh-overlay-max-h`)
    }

    // 四、面板必须写高度声明；不上这把尺的登在名单里
    if (panel.heights.size === 0)
      report(comp, `${part} 是滚动面板却一条高度声明都没有（不限高就登进 EXEMPT 名单）`)
  }

  // 五、并排成对的面板必须定高
  for (const part of PAIRED[comp] ?? []) {
    const panel = panels.get(part)
    if (panel == null) {
      report(comp, `${part} 登在并排面板名单里，但皮肤里没有这个部件`)
      continue
    }
    if (!panel.heights.has('block-size'))
      report(comp, `${part} 是并排成对的面板，必须写 block-size 定高，现在只有 ${[...panel.heights.keys()].join(' / ') || '（无高度声明）'}`)
  }
}

// 名单核验：部件没了、或者它已经上了滚动面这把尺，这条例外就该删
for (const key of Object.keys(EXEMPT)) {
  const [comp, part] = key.split(' ')
  if (!partsBySkin.get(comp)?.has(part))
    report(comp, `例外 ${key} 指的部件在皮肤里已经没有了，删掉这条`)
  else if (usedExempt.has(key) && panelsBySkin.get(key)?.onScale === true)
    report(comp, `例外 ${key} 的高度已经走滚动面令牌了，删掉这条`)
}

if (problems.size) {
  console.error('[check-panel-height] ✗ 面板高度没走同一把尺：')
  for (const [comp, list] of [...problems].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.error(`\n  ${comp}（${list.length} 条）`)
    for (const p of list)
      console.error(`    ${p}`)
  }
  console.error('\n口径：滚动面高度取 --xh-viewport-h-sm/md/lg（定高）或 --xh-viewport-max-h / --xh-overlay-menu-max-h / --xh-overlay-max-h（上限），')
  console.error('      可包一层组件槽；并排成对的面板写 block-size，单个浮层面板写 max-block-size。')
  process.exit(1)
}

console.log(`[check-panel-height] 通过：${files.length} 份皮肤 · ${governed} 处面板高度都锚在滚动面令牌上（不上这把尺 ${usedExempt.size} 处）`)
