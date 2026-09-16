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
//
// 真源 §4 的家族（内容面 / 列表容器 / 反馈面 / 字段 / 值选择 / 导航 / 开关 / 按钮形触发器）
// 在存量上会大面积分叉，迁移按组件逐个进仓。这些家族读 family-backlog.json：成员在任何一段
// 里还挂着豁免的，先不参与比对；已迁移成员 ≥ 2 才比——首个迁移组件进仓时
// 门禁就能运行，第二个进仓时开始钉住同值。部件与状态可以按成员分别登记（partBy / stateBy），
// 同一件东西在不同成员里叫不同的部件名、挂不同的状态属性。
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { readBacklog } from './lib/family-backlog.mjs'

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
    // 盒的 display / align-items / 高度 / 内距 / 间距改由 Field Chrome 配方按 chrome 节点生成，
    // 已迁移成员的皮肤只把使用者槽映射到桥接槽——比对的是这些映射声明（几何四条 + 边与影两条）；
    // 成员逐个迁移，未迁移的读 family-backlog.json 先不参与
    name: '分段族',
    backlog: true,
    members: ['date-field', 'time-field', 'date-picker', 'date-range-picker', 'time-picker', 'time-range-picker'],
    parts: [
      {
        part: 'control',
        state: '',
        props: [
          '--xh-field-control-height',
          '--xh-field-control-gap',
          '--xh-field-control-padding-inline',
          '--xh-field-control-min-inline-size',
          '--xh-field-border-rest',
          '--xh-field-shadow-rest',
        ],
      },
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
    members: ['select', 'cascader', 'tree-select', 'color-picker'],
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
    // 钉在视口一角、浮在内容之上的圆钮：两家的按钮块从盒型到三轴取值逐条同源。
    // 宽高与圆角不在此列——一颗是回顶钮（缺省中档），一颗是悬浮动作钮（缺省大一档），
    // 那是两件东西各自的身量，不是分叉
    name: '角落浮钮族',
    members: ['float-button', 'back-top'],
    parts: [
      { part: 'trigger', state: '', props: ['display', 'align-items', 'justify-content', 'padding', 'border', 'background', 'color', 'box-shadow', 'cursor', 'transition'] },
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
  // ——以下家族按真源 §4 登记，读 family-backlog.json，已迁移成员 ≥ 2 才比——
  {
    // 静态内容面：边界三选一（§8.3），根面的边、底、影同源
    name: '内容面族',
    backlog: true,
    members: ['card', 'alert', 'code-view', 'diff-view', 'log', 'json-viewer', 'tool-call', 'reasoning', 'approval', 'question-flow'],
    parts: [
      { part: 'root', state: '', props: ['border', 'background', 'box-shadow'] },
    ],
  },
  {
    // 列表容器面：Collection 容器的 outline 档与 Surface 家族同一套描边面
    name: '列表容器族',
    backlog: true,
    members: ['tree', 'listbox', 'transfer', 'list', 'descriptions', 'table'],
    parts: [
      {
        partBy: { tree: 'tree', listbox: 'content', transfer: 'source-panel', list: 'root', descriptions: 'root', table: 'root' },
        stateBy: { tree: '', listbox: '', transfer: '', list: '[data-variant=\'outline\']', descriptions: '[data-variant=\'outline\']', table: '[data-variant=\'outline\']' },
        props: ['border', 'background', 'box-shadow'],
      },
    ],
  },
  {
    // 反馈面：sheet 三件套（§8.4）
    name: '反馈面族',
    backlog: true,
    members: ['toast', 'notification'],
    parts: [
      { partBy: { toast: 'root', notification: 'item' }, state: '', props: ['border', 'background', 'box-shadow'] },
    ],
  },
  {
    // 字段外壳：视觉盒的桥接槽映射同源（§8.3）
    name: '字段族',
    backlog: true,
    members: [
      'field',
      'text-field',
      'select',
      'cascader',
      'combobox',
      'tree-select',
      'date-field',
      'time-field',
      'date-picker',
      'time-picker',
      'date-range-picker',
      'time-range-picker',
      'number-field',
      'pin-input',
      'password-input',
      'tags-input',
      'editable',
      'mention',
      'color-field',
      'color-picker',
    ],
    parts: [
      // 边、底、影、圆角与三档 variant 由 Field Chrome 配方按 chrome 节点的 data-variant 生成，
      // 已迁移成员的皮肤只把使用者槽映射到桥接槽——比对的是这些映射声明本身（槽名与缺省都要同源）。
      // pin-input 的视觉盒是每一格 input，使用者槽按 box 命名，不与 control 的映射比对
      {
        part: 'control',
        state: '',
        props: [
          '--xh-field-control-radius',
          '--xh-field-bg-rest',
          '--xh-field-bg-hover',
          '--xh-field-bg-read-only',
          '--xh-field-bg-disabled',
          '--xh-field-border-rest',
          '--xh-field-border-hover',
          '--xh-field-border-focus',
          '--xh-field-border-invalid',
          '--xh-field-ring-focus',
          '--xh-field-ring-invalid',
          '--xh-field-shadow-rest',
        ],
        only: [
          'field',
          'text-field',
          'select',
          'cascader',
          'combobox',
          'tree-select',
          'date-field',
          'time-field',
          'date-picker',
          'time-picker',
          'date-range-picker',
          'time-range-picker',
          'number-field',
          'password-input',
          'tags-input',
          'editable',
          'mention',
          'color-field',
          'color-picker',
        ],
      },
    ],
  },
  {
    // 值选择：选中行的底、字色与字重按集合语境走（§7.3）
    name: '值选择族',
    backlog: true,
    members: ['select', 'listbox', 'combobox', 'cascader', 'tree-select', 'tree', 'date-picker', 'time-picker', 'time-range-picker'],
    parts: [
      {
        partBy: { 'select': 'item', 'listbox': 'item', 'combobox': 'item', 'cascader': 'item', 'tree-select': 'item', 'tree': 'item', 'date-picker': 'time-item', 'time-picker': 'item', 'time-range-picker': 'item' },
        stateBy: {
          'select': '[data-state=\'checked\']',
          'listbox': '[data-state=\'checked\']',
          'combobox': '[data-state=\'checked\']',
          'cascader': '[data-state=\'checked\']',
          'tree-select': '[data-selected]',
          'tree': '[data-selected]',
          'date-picker': '[data-state=\'checked\']',
          'time-picker': '[data-state=\'checked\']',
          'time-range-picker': '[data-state=\'checked\']',
        },
        props: ['background', 'color', 'font-weight'],
      },
    ],
  },
  {
    // 导航当前页：字色与字重（§7.3）；Breadcrumb 当前页不可点，是登记的例外，不在族内
    name: '导航族',
    backlog: true,
    members: ['tabs', 'anchor', 'navigation-menu', 'side-nav'],
    parts: [
      {
        partBy: { 'tabs': 'trigger', 'anchor': 'link', 'navigation-menu': 'link', 'side-nav': 'link' },
        stateBy: { 'tabs': '[data-state=\'active\']', 'anchor': '[data-current]', 'navigation-menu': '[data-current]', 'side-nav': '[data-current]' },
        props: ['color', 'font-weight'],
      },
    ],
  },
  {
    // 开关型：选中段的底与影（§7.3）
    name: '开关族',
    backlog: true,
    members: ['segmented', 'toggle-group', 'tabs'],
    parts: [
      {
        partBy: { 'segmented': 'item', 'toggle-group': 'item', 'tabs': 'trigger' },
        stateBy: { 'segmented': '[data-state=\'checked\']', 'toggle-group': '[data-state=\'on\']', 'tabs': '[data-state=\'active\']' },
        props: ['background', 'box-shadow'],
      },
    ],
  },
  {
    // 按钮形触发器：缺省中性，hover / active 的底按承载面阶梯走（§7.2）
    name: '按钮形触发器族',
    backlog: true,
    members: ['toggle', 'clipboard', 'download-trigger', 'float-button', 'back-top', 'toolbar', 'pagination'],
    parts: [
      {
        partBy: { 'toggle': 'root', 'clipboard': 'copy-trigger', 'download-trigger': 'root', 'float-button': 'trigger', 'back-top': 'trigger', 'toolbar': 'item', 'pagination': 'item' },
        state: ':hover',
        props: ['background'],
      },
      {
        partBy: { 'toggle': 'root', 'clipboard': 'copy-trigger', 'download-trigger': 'root', 'float-button': 'trigger', 'back-top': 'trigger', 'toolbar': 'item', 'pagination': 'item' },
        state: ':active',
        props: ['background'],
      },
    ],
  },
]

/** 豁免表里全部分段的键，判成员是否「尚未迁移」。 */
const backlogKeys = new Set()
{
  const { sections, problems: backlogProblems } = await readBacklog()
  for (const entries of Object.values(sections)) {
    for (const key of Object.keys(entries))
      backlogKeys.add(key)
  }
  if (backlogProblems.length) {
    console.error('[check-family-parity] ✗ family-backlog.json 本身有错：')
    for (const problem of backlogProblems)
      console.error(`  ${problem}`)
    process.exit(1)
  }
}

/**
 * 成员在任何一段豁免表里还有条目：尚未迁移，先不参与比对。
 * 按组件而不按部件判——迁移是一个组件八个维度一次做完，表里还剩一条它就还没进仓。
 */
function pending(comp) {
  return [...backlogKeys].some(key => key.startsWith(`${comp}:`))
}

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
/** 读豁免表的家族里，已迁移成员不足两个而跳过的条目数。 */
let skipped = 0

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
        // 其余伪类（:hover / :focus-visible）是另一个状态：只在登记了那个伪类的家族里比，且要整条恰好是它
        const rest = m[3].replace(/:not\([^)]*\)/g, '')
        if (/[>+~ ]/.test(rest))
          continue
        if (rest.includes(':') && !family.parts.some(p => typeof p.state === 'string' && p.state.startsWith(':') && rest === p.state))
          continue
        const decls = new Map()
        for (const [name, value] of rule.decls)
          decls.set(normalize(name, comp), normalize(value, comp))
        byPart.push({ part: m[2], rest, decls })
      }
    }
    byMember.set(comp, byPart)
  }

  for (const entry of family.parts) {
    const { props, only } = entry
    /** 部件与状态可以按成员分别登记。 */
    const partFor = comp => entry.partBy?.[comp] ?? entry.part
    const stateFor = comp => entry.stateBy?.[comp] ?? entry.state ?? ''
    // only：这条只在真有该部件规则的成员之间比对（别家的段位戴着别人的 scope 或叫别的名字）；
    // 读豁免表的家族里，受管部件上还挂着豁免的成员尚未迁移，先不参与比对
    let members = only ?? family.members
    if (family.backlog) {
      members = members.filter(comp => !pending(comp))
      if (members.length < 2) {
        skipped++
        continue
      }
    }
    const key = entry.partBy
      ? `${[...new Set(members.map(partFor))].join('|')}${[...new Set(members.map(stateFor))].join('|')}`
      : `${entry.part}${entry.state ?? ''}`
    const matches = (rule, comp) => {
      const state = stateFor(comp)
      if (rule.part !== partFor(comp))
        return false
      if (state === '')
        return rule.rest === ''
      return state.startsWith(':') ? rule.rest === state : rule.rest.includes(state)
    }
    /** 某个成员在这个部件+状态上的全部声明，同状态的多条规则并成一份。 */
    const declsOf = (comp) => {
      const merged = new Map()
      for (const rule of byMember.get(comp)) {
        if (!matches(rule, comp))
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
    const matched = members.some(comp => byMember.get(comp).some(rule => matches(rule, comp)))
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
      const lines = [`${key} 的 ${name}：多数派 ${majority[0] ?? '（未声明）'}（${majority[1]}/${members.length}）`]
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

console.log(`[check-family-parity] 通过：${FAMILIES.length} 个家族 · ${governed} 处属性全族同值（读豁免表的家族里 ${skipped} 条因已迁移成员不足两个暂不比）`)
