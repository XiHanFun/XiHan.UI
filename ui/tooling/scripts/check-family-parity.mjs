#!/usr/bin/env node
// 门禁：同一家族的成员，指定属性逐条同值。
//
// 家族 = 共用同一台机器、或结构同构的一组组件。菜单三家跑的是同一台 menu 机器，
// DOM 与状态完全一样，皮肤却各写各的：一个的子菜单触发项展开时加粗，另一个不加粗，
// 用的人看到的是「同一个东西有两种表现」。分段族与下拉族同理，盒内布局各长各的。
//
// 取值按组件名归一后比较：var(--xh-menu-item-px, …) 与 var(--xh-menubar-item-px, …)
// 是同一件事，命名里那截组件名不算差异；槽名本身不一致（-menu- 这类多出来的段）算差异。
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
]

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
      for (const selector of rule.selectors) {
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

    // '*' 的属性集合取全族并集：某一家多写了一条，也是差异
    const names = props === '*'
      ? [...new Set([...declsByMember.values()].flatMap(d => [...d.keys()]))].sort()
      : props

    if (props === '*' && names.length === 0) {
      report(family.name, `${key}：全族都没有这个部件的规则`)
      continue
    }

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
