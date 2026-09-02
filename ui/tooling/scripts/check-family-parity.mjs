#!/usr/bin/env node
// 门禁：同一家族的成员，指定属性逐条同值。
//
// 家族 = 共用同一台机器、或结构同构的一组组件。菜单三家跑的是同一台 menu 机器，
// DOM 与状态完全一样，皮肤却各写各的：一个的子菜单触发项展开时加粗，另一个不加粗，
// 用的人看到的是「同一个东西有两种表现」。分段族与下拉族同理，盒内布局各长各的。
//
// 取值按组件名归一后比较：var(--xh-menu-item-px, …) 与 var(--xh-menubar-item-px, …)
// 是同一件事，命名里那截组件名不算差异；槽名本身不一致（-menu- 这类多出来的段）算差异。
//
// 登记的部件 + 状态在全族一条规则都匹配不上时判红：不查的话，部件改名或状态换写法之后
// 这一条就只是空转，逐条列属性的家族尤其看不出来。
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'

/**
 * 家族与受管辖的属性。
 * parts 里每项：part 是部件名，state 是部件后面跟的附加选择器（没有就是基础块），
 * props 列出要逐条同值的属性；props 写成 '*' 表示这个部件的全部声明都要同值。
 */
const FAMILIES = [
  {
    name: '菜单族',
    members: ['menu', 'menubar', 'context-menu'],
    parts: [
      { part: 'item', state: '', props: ['padding-block', 'padding-inline', 'font-size', 'border-radius', 'line-height'] },
      { part: 'item', state: `[data-state='open']`, props: ['background', 'font-weight'] },
      { part: 'item', state: '[data-highlighted]', props: ['background'] },
      { part: 'content', state: '', props: ['border', 'border-radius', 'background', 'box-shadow', 'padding-block', 'padding-inline', 'min-inline-size', 'max-block-size'] },
      { part: 'separator', state: '', props: '*' },
      { part: 'group-label', state: '', props: '*' },
    ],
  },
  {
    name: '分段族',
    members: ['date-field', 'time-field', 'date-picker', 'time-picker'],
    parts: [
      { part: 'control', state: '', props: ['display', 'align-items', 'gap', 'block-size', 'padding-inline'] },
      { part: 'segment', state: '', props: ['padding-inline'], only: ['date-field', 'time-field'] },
      { part: 'segment-group', state: '', props: ['flex'] },
    ],
  },
  {
    name: '气泡族',
    members: ['popover', 'popconfirm', 'hover-card'],
    parts: [
      { part: 'content', state: '', props: ['gap', 'padding-block', 'padding-inline', 'border', 'border-radius', 'background', 'box-shadow'] },
    ],
  },
  {
    name: '下拉族',
    members: ['select', 'cascader', 'tree-select', 'popselect', 'color-picker'],
    parts: [
      // 盒宽的上下限一起管：只有一家给盒封顶，同一行栅格里它就比邻座窄一截
      { part: 'control', state: '', props: ['display', 'align-items', 'block-size', 'padding-inline', 'min-inline-size', 'max-inline-size'] },
      { part: 'trigger', state: '', props: ['flex', 'border', 'background', 'padding'] },
    ],
  },
  {
    // 两份皮肤连注释都互相点名（dialog.css 与 drawer.css 各写了一句「与对方一致」），
    // 遮罩、标题、说明与关闭钮是同一件东西的两种摆法
    name: '模态族',
    members: ['dialog', 'drawer'],
    parts: [
      // 层号不在此列：两家遮罩排的是不同的层序角色（modal / drawer），取值本就该不一样
      { part: 'backdrop', state: '', props: ['position', 'inset', 'background'] },
      { part: 'backdrop', state: `[data-state='open']`, props: ['animation'] },
      { part: 'backdrop', state: `[data-state='closed']`, props: ['animation'] },
      { part: 'title', state: '', props: '*' },
      { part: 'description', state: '', props: '*' },
      { part: 'close-trigger', state: '', props: '*' },
      { part: 'close-trigger', state: '[hidden]', props: '*' },
    ],
  },
  {
    // 展开收起的触发条：两家跑的是同一套开合，触发条从盒型到字号逐条同源
    name: '折叠族',
    members: ['accordion', 'collapsible'],
    parts: [
      { part: 'trigger', state: '', props: '*' },
      { part: 'trigger', state: '[data-disabled]', props: '*' },
      { part: 'trigger', state: '[hidden]', props: '*' },
    ],
  },
  {
    // 一张图标、一行标题、一段说明、一排按钮，两家排的是同一张空面
    name: '空态族',
    members: ['empty-state', 'result'],
    parts: [
      { part: 'description', state: '', props: '*' },
      { part: 'action', state: '', props: '*' },
      { part: 'action', state: '[hidden]', props: '*' },
      // color 不在此列：result 的图标按状态取色（成功绿、错误红），empty-state 恒是 fg-subtle
      { part: 'icon', state: '', props: ['display', 'align-items', 'justify-content', 'flex', '--xh-icon-size', 'block-size', 'inline-size', 'font-size', 'line-height'] },
      { part: 'icon', state: '[hidden]', props: '*' },
    ],
  },
]

/** 去掉注释。 */
function strip(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '')
}

/** 按顶层逗号拆选择器列表：`:is(a, b)` 括号里的逗号不是分隔符，拆开就把选择器切断了。 */
function splitSelectors(text) {
  const out = []
  let depth = 0
  let current = ''
  for (const ch of text) {
    if (ch === '(')
      depth++
    else if (ch === ')')
      depth--
    if (ch === ',' && depth === 0) {
      out.push(current)
      current = ''
      continue
    }
    current += ch
  }
  out.push(current)
  return out.map(s => s.trim().replace(/\s+/g, ' ')).filter(Boolean)
}

/** 拆成最内层规则：[{ selectors, decls }]，decls 是 [属性, 值] 对。 */
function parseRules(src) {
  const rules = []
  for (const m of src.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = splitSelectors(m[1])
    if (selectors.length === 0 || selectors[0].startsWith('@'))
      continue
    const decls = []
    for (const d of m[2].matchAll(/(?:^|;)\s*(--[\w-]+|[a-z-]+)\s*:\s*([^;]+)/g))
      decls.push([d[1], d[2].trim().replace(/\s+/g, ' ')])
    rules.push({ selectors, decls })
  }
  return rules
}

/**
 * 把 `:is(a, b)` 拆成并列的几条选择器——它就是一个「或」。
 *
 * 不拆的话两类写法整条看不见：`[data-scope='x']:is([data-part='root'], [data-part='positioner'])`
 * 里 part 不紧跟 scope，下面那条正则匹配不上；`[data-part='item']:is(:hover, [data-highlighted])`
 * 这种把悬停与键盘锚点并成一条的写法，则因为整段带冒号被当成别的状态丢掉。
 */
function expandIs(selector) {
  const hit = /:is\(([^()]*)\)/.exec(selector)
  if (!hit)
    return [selector]
  return hit[1].split(',').flatMap(alt =>
    expandIs(selector.slice(0, hit.index) + alt.trim() + selector.slice(hit.index + hit[0].length)))
}

/** 把取值里的组件名换成占位符：命名里那截组件名不是差异。 */
function normalize(value, comp) {
  return value
    .replace(new RegExp(`--xh-_${comp}-`, 'g'), '--xh-_<c>-')
    .replace(new RegExp(`--xh-${comp}-`, 'g'), '--xh-<c>-')
    .replace(/\s+/g, ' ')
    .trim()
}

const problems = new Map()
let governed = 0

function report(family, detail) {
  if (!problems.has(family))
    problems.set(family, [])
  problems.get(family).push(detail)
}

for (const family of FAMILIES) {
  /** 组件 → 选择器 → 属性 → 归一后的取值。 */
  const byMember = new Map()
  for (const comp of family.members) {
    const src = strip(await readFile(join(STYLES_DIR, `${comp}.css`), 'utf8'))
    const rules = parseRules(src)
    const byPart = []
    for (const rule of rules) {
      for (const selector of rule.selectors.flatMap(expandIs)) {
        const m = /^\[data-scope='([\w-]+)'\]\[data-part='([\w-]+)'\](.*)$/.exec(selector)
        if (m == null || m[1] !== comp)
          continue
        // :not(…) 只是「别落在禁用项上」的守卫，不改这条规则说的是哪个状态；
        // 其余伪类（:hover / :focus-visible）是另一个状态，不并进来
        const rest = m[3].replace(/:not\([^)]*\)/g, '')
        if (/[:>+~ ]/.test(rest))
          continue
        const decls = new Map()
        for (const [name, value] of rule.decls)
          decls.set(name, normalize(value, comp))
        byPart.push({ part: m[2], rest, decls })
      }
    }
    byMember.set(comp, byPart)
  }

  for (const { part, state, props, only } of family.parts) {
    // only：这条只在真有该部件规则的成员之间比对（别家的段位戴着别人的 scope 或叫别的名字）
    const members = only ?? family.members
    const key = `${part}${state}`
    /** 某个成员在这个部件+状态上的全部声明，同状态的多条规则并成一份。 */
    const declsOf = (comp) => {
      const merged = new Map()
      for (const rule of byMember.get(comp)) {
        if (rule.part !== part)
          continue
        if (state === '' ? rule.rest !== '' : !rule.rest.includes(state))
          continue
        for (const [name, value] of rule.decls)
          merged.set(name, value)
      }
      return merged
    }
    const declsByMember = new Map(members.map(comp => [comp, declsOf(comp)]))

    // 名单过期反查：这个部件+状态在全族一条规则都匹配不上，登记就再也查不到东西了。
    // 部件改名、状态换写法（悬停与键盘锚点并成 :is(:hover, [data-highlighted]) 那次）
    // 都会走到这里；不查的话判据不是判红而是空转，逐条列属性的家族尤其看不出来
    const matched = members.some(comp => byMember.get(comp).some(rule =>
      rule.part === part && (state === '' ? rule.rest === '' : rule.rest.includes(state))))
    if (!matched) {
      report(family.name, `${key}：全族一条规则都匹配不上——名单过期了，改成新的部件 / 状态写法，或删掉这一条`)
      continue
    }

    // '*' 的属性集合取全族并集：某一家多写了一条，也是差异
    const names = props === '*'
      ? [...new Set([...declsByMember.values()].flatMap(d => [...d.keys()]))].sort()
      : props

    for (const name of names) {
      const values = new Map()
      for (const comp of members)
        values.set(comp, declsByMember.get(comp).get(name) ?? null)

      const counts = new Map()
      for (const value of values.values())
        counts.set(value, (counts.get(value) ?? 0) + 1)
      if (counts.size === 1) {
        governed++
        continue
      }

      const [majority] = [...counts].sort((a, b) => b[1] - a[1])
      const lines = [`${key} 的 ${name}：多数派 ${majority[0] ?? '（未声明）'}（${majority[1]}/${family.members.length}）`]
      for (const [comp, value] of values) {
        if (value !== majority[0])
          lines.push(`  少数派 ${comp} = ${value ?? '（未声明）'}`)
      }
      report(family.name, lines.join('\n    '))
    }
  }
}

if (problems.size) {
  console.error('[check-family-parity] ✗ 家族成员没逐条同值：')
  for (const [family, list] of problems) {
    console.error(`\n  ${family}（${list.length} 条）`)
    for (const p of list)
      console.error(`    ${p}`)
  }
  console.error('\n口径：同族同结构的部件，名单里的属性逐条同值；取值按组件名归一，槽名本身也算在内。')
  process.exit(1)
}

console.log(`[check-family-parity] 通过：${FAMILIES.length} 个家族 · ${governed} 处属性全族同值`)
