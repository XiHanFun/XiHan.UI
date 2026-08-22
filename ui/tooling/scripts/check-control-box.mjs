#!/usr/bin/env node
// 门禁：输入与选择族的「盒」结构逐条同构。
//
// 盒 = 画描边、底色、圆角、控件高度、行内内衬的那一层，也是聚焦环落的那一层。
// 一族十六个控件，盒是哪个部件、盒内谁占满剩余宽度、尾部动作钮多大、聚焦环画在哪，
// 四件事各自散开就会长成十六种做法：✕ 有的靠右有的紧跟文字，钮有的 24px 有的跟控件一样高。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'
const HEADLESS_DIR = 'packages/engine/headless/src'

/** 受管辖的输入与选择族。 */
const COMPONENTS = [
  'select',
  'cascader',
  'tree-select',
  'popselect',
  'color-picker',
  'combobox',
  'text-field',
  'number-field',
  'password-input',
  'tags-input',
  'date-field',
  'time-field',
  'date-picker',
  'time-picker',
  'mention',
  'pin-input',
]

/**
 * 单元素控件：盒就是那个 input 自己，里面没有并排的子节点。
 * 只在解剖里没有 control 时生效——补上 control 之后盒换人，整套并排规则重新受管。
 */
const SINGLE_ELEMENT = {
  'text-field': '无 clear 时是裸 input，盒里没有并排的尾钮',
  'mention': '多行 textarea 自画盒，没有尾钮',
  'pin-input': '每格一个 input 自画盒，格与格之间由 root 排布',
}

/** 盒内的内容区：占满剩余宽度、把尾钮顶到最右的那个部件。 */
const CONTENT_PARTS = new Set(['input', 'value-text', 'segment-group'])

/**
 * trigger 在两类控件里是两种角色：
 * 下拉族的 trigger 是那颗装着值与箭头的按钮，它就是内容区；
 * 可输入控件（combobox / date-picker / time-picker）的 trigger 是右侧那颗展开小钮，属尾钮。
 */
const TRIGGER_IS_CONTENT = new Set(['select', 'cascader', 'tree-select', 'popselect', 'color-picker'])

/** 内容区里还能再套一层撑开的文字区：下拉族的 value-text 长在 trigger 里面。 */
const NESTED_CONTENT = new Set(['value-text'])

/** 盒内的尾部动作钮。 */
const ACTION_PARTS = ['clear-trigger', 'trigger', 'visibility-trigger', 'eye-dropper-trigger', 'increment-trigger', 'decrement-trigger']

/**
 * 两套盒的控件：写了 control 由 control 画盒，不写则那个 input 自己画盒。
 * 两种用法都得有聚焦环，所以 input 上那条不算出格。
 */
const DUAL_BOX = new Set(['text-field', 'number-field', 'password-input'])

/** 盒与盒内文字区：聚焦环只许画在其中的盒上。浮层里的条目、列表另说，不在此列。 */
const BOX_AREA_PARTS = new Set(['control', 'input', 'trigger', 'value-text', 'segment-group', 'segment'])

/**
 * 浮层那一侧的部件：它们在 positioner/content 里面，不在盒里。
 * flex:1 与 margin 顶不顶的那两条只管盒内，这些部件的排布是列表自己的事。
 */
const OUTSIDE_BOX = new Set([
  'positioner',
  'content',
  'list',
  'item',
  'item-text',
  'item-indicator',
  'group',
  'group-label',
  'separator',
  'empty',
  'footer',
  'column',
  'search-list',
  'search-item',
  'tree',
  'branch',
  'branch-control',
  'branch-trigger',
  'branch-indicator',
  'branch-text',
  'branch-content',
  'presets',
  'preset',
  'calendar',
  'time-column',
  'time-item',
  'confirm-trigger',
  'area',
  'area-thumb',
  'channel-slider',
  'channel-slider-track',
  'channel-slider-thumb',
  'channel-input',
  'swatch-group',
  'swatch-item',
  'hidden-input',
  'hidden-select',
])

/**
 * 逐条登记的例外，键写成「组件 检查项」。检查项名见 CHECKS。
 * 名单之外的组件一律受本门禁管辖。
 */
const EXEMPT = {
  'tags-input box-h': '标签换行后盒要被行数撑高，定高会把第二行裁掉，故写 min-block-size',
  'pin-input box-h': '每格是等宽方框，宽高同取 --xh-pin-input-box-size 一个尺寸，不走控件行高',
  'pin-input box-px': '方格内距归零，留了内距单字符居中后可用宽度不足',
  'pin-input box-min-w': '格宽即方格边长，再给最小宽会把方框拉成长方形',
  'mention box-h': '多行 textarea 由行数撑高，纵向走 field-py 内距而不是控件行高',
}

/** 检查项的说明，用在报告里。 */
const CHECKS = {
  'box-part': '盒的判据：解剖里有 control 就用 control，没有才用 input',
  'box-display': '盒是 inline-flex 或 flex',
  'box-align': '盒 align-items: center',
  'box-gap': '盒 gap 走 --xh-<c>-…-gap 槽',
  'box-h': '盒高走 --xh-<c>-…-h 槽',
  'box-px': '盒行内内衬走 --xh-<c>-…-px 槽',
  'box-min-w': '盒最小宽走 --xh-<c>-…-min-w 槽并回退 --xh-control-min-w',
  'content-flex': '盒内恰有一个 flex:1 的内容区，且它是 input / value-text / segment-group',
  'action-flex': '尾部动作钮 flex: none',
  'action-size': '尾部动作钮宽高走 --xh-control-action-size',
  'margin-auto': '盒内不许用 margin-inline-start: auto 顶尾钮',
  'focus-box': '聚焦环画在盒上',
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

const files = new Set(await readdir(STYLES_DIR))
const problems = new Map()
const usedExempt = new Set()
let governed = 0

function report(comp, check, detail) {
  const key = `${comp} ${check}`
  if (key in EXEMPT) {
    usedExempt.add(key)
    return
  }
  if (!problems.has(comp))
    problems.set(comp, [])
  problems.get(comp).push(`${check}：${detail}`)
}

for (const comp of COMPONENTS) {
  const file = `${comp}.css`
  if (!files.has(file)) {
    report(comp, 'box-part', `皮肤 ${file} 不存在`)
    continue
  }
  const src = strip(await readFile(join(STYLES_DIR, file), 'utf8'))
  const rules = parseRules(src)

  // 本文件里每个自定义属性声明过的值，用来把组件槽的回退链走通
  const slots = new Map()
  for (const rule of rules) {
    for (const [name, value] of rule.decls) {
      if (name.startsWith('--'))
        slots.set(name, [...(slots.get(name) ?? []), value])
    }
  }
  const reaches = (value, re, depth = 0) => {
    if (re.test(value))
      return true
    if (depth >= 4)
      return false
    for (const ref of value.matchAll(/var\(\s*(--[\w-]+)/g)) {
      for (const declared of slots.get(ref[1]) ?? []) {
        if (reaches(declared, re, depth + 1))
          return true
      }
    }
    return false
  }

  // ① 盒的判据：解剖里有 control 就是 control，否则是 input
  let anatomy = ''
  try {
    anatomy = await readFile(join(HEADLESS_DIR, comp, `${comp}.anatomy.ts`), 'utf8')
  }
  catch {
    report(comp, 'box-part', `读不到解剖 ${comp}.anatomy.ts`)
    continue
  }
  const parts = new Set([...anatomy.matchAll(/'([\w-]+)',?\s*$/gm)].map(m => m[1]))
  const box = parts.has('control') ? 'control' : 'input'
  const single = box === 'input' && comp in SINGLE_ELEMENT
  if (box === 'input' && !single)
    report(comp, 'box-part', `解剖里没有 control，盒退给 input，但它不在 SINGLE_ELEMENT 名单里`)

  // ② 盒规则：基础块（无附加选择器那条）里的五件事
  const boxSelector = `[data-scope='${comp}'][data-part='${box}']`
  const boxDecls = new Map()
  for (const rule of rules) {
    if (!rule.selectors.includes(boxSelector))
      continue
    for (const [name, value] of rule.decls)
      boxDecls.set(name, value)
  }
  if (boxDecls.size === 0) {
    report(comp, 'box-part', `找不到基础块 ${boxSelector}`)
  }
  else {
    governed++
    const has = (name, test, check, want) => {
      const value = boxDecls.get(name)
      if (value == null)
        report(comp, check, `基础块缺 ${name}`)
      else if (!test(value))
        report(comp, check, `${name}: ${value} —— ${want}`)
    }
    if (!single) {
      has('display', v => v === 'inline-flex' || v === 'flex', 'box-display', '该是 inline-flex 或 flex')
      has('align-items', v => v === 'center', 'box-align', '该是 center')
      has('gap', v => new RegExp(`var\\(\\s*--xh-${comp}-[\\w-]*gap\\b`).test(v), 'box-gap', `该走 var(--xh-${comp}-…-gap, …)`)
    }
    if (boxDecls.has('block-size'))
      has('block-size', v => new RegExp(`var\\(\\s*--xh-${comp}-[\\w-]*-h\\b`).test(v), 'box-h', `该走 var(--xh-${comp}-…-h, …)`)
    else if (boxDecls.has('min-block-size'))
      report(comp, 'box-h', `基础块写的是 min-block-size 而不是 block-size：${boxDecls.get('min-block-size')}`)
    else
      report(comp, 'box-h', '基础块缺 block-size')
    has('padding-inline', v => new RegExp(`var\\(\\s*--xh-${comp}-[\\w-]*px\\b`).test(v), 'box-px', `该走 var(--xh-${comp}-…-px, …)`)
    has(
      'min-inline-size',
      v => new RegExp(`var\\(\\s*--xh-${comp}-[\\w-]*min-w\\b`).test(v) && reaches(v, /--xh-control-min-w\b/),
      'box-min-w',
      `该走 var(--xh-${comp}-…-min-w, var(--xh-control-min-w))`,
    )
  }

  // ③ 盒内恰有一个 flex:1 的内容区
  if (!single) {
    const growers = []
    for (const rule of rules) {
      const grows = rule.decls.some(([name, value]) => name === 'flex' && /^1(?:\s|$)/.test(value))
      if (!grows)
        continue
      for (const selector of rule.selectors) {
        const part = lastPart(selector)
        if (part != null && !OUTSIDE_BOX.has(part))
          growers.push({ part, selector })
      }
    }
    const contentOk = part => CONTENT_PARTS.has(part) || (part === 'trigger' && TRIGGER_IS_CONTENT.has(comp))
    // 嵌在内容区里再撑一层的（下拉族 trigger 内的 value-text）不算盒的直接内容区
    const direct = growers.filter(g => !(NESTED_CONTENT.has(g.part) && TRIGGER_IS_CONTENT.has(comp)))
    if (direct.length === 0)
      report(comp, 'content-flex', `盒内没有 flex:1 的内容区（尾钮靠 margin 顶或干脆不靠右）`)
    else if (direct.length > 1)
      report(comp, 'content-flex', `有 ${direct.length} 处 flex:1：${direct.map(g => g.part).join(' / ')}，该只有一个`)
    for (const g of direct) {
      if (!contentOk(g.part))
        report(comp, 'content-flex', `flex:1 落在 ${g.part} 上（${g.selector}），该是 input / value-text / segment-group`)
    }
  }

  // ④ 尾部动作钮：flex: none + 走 --xh-control-action-size
  if (!single) {
    for (const action of ACTION_PARTS) {
      if (action === 'trigger' && TRIGGER_IS_CONTENT.has(comp))
        continue
      const selector = `[data-scope='${comp}'][data-part='${action}']`
      const decls = new Map()
      for (const rule of rules) {
        if (!rule.selectors.includes(selector))
          continue
        for (const [name, value] of rule.decls)
          decls.set(name, value)
      }
      if (decls.size === 0)
        continue
      if (decls.get('flex') !== 'none')
        report(comp, 'action-flex', `${action} 的 flex 是 ${decls.get('flex') ?? '（未声明）'}，该是 none`)
      for (const dim of ['inline-size', 'block-size']) {
        const value = decls.get(dim)
        if (value == null)
          report(comp, 'action-size', `${action} 缺 ${dim}`)
        else if (!reaches(value, /--xh-control-action-size\b/))
          report(comp, 'action-size', `${action} 的 ${dim}: ${value} —— 该回退到 --xh-control-action-size`)
      }
    }
  }

  // ⑤ 盒内不许用 margin-inline-start: auto 顶尾钮
  for (const rule of rules) {
    if (!rule.decls.some(([name, value]) => name === 'margin-inline-start' && value === 'auto'))
      continue
    for (const selector of rule.selectors) {
      const part = lastPart(selector)
      if (part != null && !OUTSIDE_BOX.has(part))
        report(comp, 'margin-auto', `${part} 上写了 margin-inline-start: auto（${selector}），改用 flex:1 的内容区顶`)
    }
  }

  // ⑥ 聚焦环画在盒上
  for (const rule of rules) {
    const outline = rule.decls.find(([name, value]) => name === 'outline' && value !== 'none' && !value.startsWith('0'))
    if (!outline)
      continue
    for (const selector of rule.selectors) {
      if (!/:focus-within|:focus-visible/.test(selector))
        continue
      const part = lastPart(selector)
      if (part == null || !BOX_AREA_PARTS.has(part) || part === box)
        continue
      // 两套盒的控件：不写 control 时 input 自己是盒，那条环同样必须在
      if (part === 'input' && DUAL_BOX.has(comp))
        continue
      report(comp, 'focus-box', `聚焦环画在 ${part} 上（${selector}），盒是 ${box}`)
    }
  }
}

for (const key of Object.keys(EXEMPT)) {
  if (!usedExempt.has(key))
    problems.set(key.split(' ')[0], [...(problems.get(key.split(' ')[0]) ?? []), `例外 ${key} 已经用不上了，删掉这条`])
}

if (problems.size) {
  console.error('[check-control-box] ✗ 盒结构没走同一种做法：')
  for (const [comp, list] of [...problems].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.error(`\n  ${comp}（${list.length} 条）`)
    for (const p of list)
      console.error(`    ${p}`)
  }
  console.error('\n口径：')
  for (const [check, desc] of Object.entries(CHECKS))
    console.error(`  ${check}  ${desc}`)
  process.exit(1)
}

console.log(`[check-control-box] 通过：${governed} 个控件的盒结构同构（单元素 ${Object.keys(SINGLE_ELEMENT).length} 个、例外 ${usedExempt.size} 条）`)
