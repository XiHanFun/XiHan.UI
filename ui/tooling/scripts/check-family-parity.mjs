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
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { readBacklog } from './lib/family-backlog.mjs'

const STYLES_DIR = 'packages/design/styles/css'
const FAMILY_DIR = 'packages/design/styles/family'

/**
 * 家族与受管辖的属性。
 * parts 里每项：part 是部件名，state 是部件后面跟的附加选择器（没有就是基础块），
 * props 列出要逐条同值的属性；props 写成 '*' 表示这个部件的全部声明都要同值。
 */
const FAMILIES = [
  {
    // 条目接了 Collection Item 配方：悬停 / 键盘锚点 / 打开路径的面由家族按 data-highlighted / data-in-path 给，
    // 三份皮肤不再各写这些状态的规则，一致性由配方保证；这里比的是基础块里的布局与映射到桥接槽的几何
    name: '菜单族',
    members: ['menu', 'menubar', 'context-menu'],
    parts: [
      { part: 'item', state: '', props: ['--xh-collection-block-padding', '--xh-collection-inline-padding', '--xh-collection-font-size', '--xh-collection-radius', '--xh-collection-bg-hover', '--xh-collection-bg-pressed', '--xh-collection-bg-open-path', 'line-height'] },
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
    // 盒的 display / align-items / 高度 / 内距 / 间距 / 最小宽改由 Field Chrome 配方按 chrome 节点生成，
    // 已迁移成员的皮肤只把使用者槽映射到桥接槽——比对的是这些映射声明（几何四条 + 边与影两条 + 盒上指针）；
    // 成员逐个迁移，未迁移的读 family-backlog.json 先不参与
    name: '下拉族',
    backlog: true,
    members: ['select', 'cascader', 'tree-select', 'color-picker'],
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
          '--xh-field-cursor-rest',
        ],
      },
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
    // 钉在视口一角、浮在内容之上的圆钮：两家的触发器都接了 Action Control floating 档，盒型、四态面、
    // 按压与命中区由配方给，皮肤只剩把使用者槽映射到桥接槽——比的是这些映射声明（面、字、边、影、几何）
    // 缺省 outline 那一档的磨砂桥接写在 root[data-variant] 的后代规则里，本门禁不比后代规则，由两家的浏览器
    // 材质用例各自钉住。
    // 两家的槽名都不带部件段（--xh-float-button-bg / --xh-back-top-bg），slotBy 给空串
    name: '角落浮钮族',
    members: ['float-button', 'back-top'],
    parts: [
      {
        part: 'trigger',
        slotBy: { 'float-button': '', 'back-top': '' },
        state: '',
        props: [
          '--xh-action-bg-rest',
          '--xh-action-bg-hover',
          '--xh-action-bg-pressed',
          '--xh-action-bg-focus-visible',
          '--xh-action-bg-disabled',
          '--xh-action-fg-rest',
          '--xh-action-fg-hover',
          '--xh-action-fg-pressed',
          '--xh-action-fg-focus-visible',
          '--xh-action-border-rest',
          '--xh-action-border-hover',
          '--xh-action-border-pressed',
          '--xh-action-border-focus-visible',
          '--xh-action-border-disabled',
          '--xh-action-shadow-rest',
          '--xh-action-shadow-hover',
          '--xh-action-shadow-pressed',
          '--xh-action-shadow-focus-visible',
          '--xh-action-shadow-disabled',
          '--xh-action-radius',
          '--xh-action-visual-size',
          '--xh-icon-size',
          'display',
          'border',
          'background',
          'color',
          'box-shadow',
          'cursor',
          'transition',
        ],
      },
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
    // 两份日历共用同一套部件名与皮肤槽（doc.md 互相点名）：日期格接了 Action Control text 档，悬停 / 按下 / 禁用面由家族
    // 按桥接槽给，两份皮肤不再各写 :hover / :active 规则；比的是基础块（含映射到桥接槽的几何与三支私有槽）、
    // 今天换的三支私有槽、选中格重写的桥接槽三态。范围日历多出的区间轨道与端点规则带 [data-in-range]，不在匹配面里
    name: '日历族',
    backlog: true,
    members: ['calendar-picker', 'calendar-range-picker'],
    parts: [
      { part: 'cell-trigger', state: '', props: '*' },
      { part: 'cell-trigger', state: '[data-today]', props: ['--xh-_<c>-cell-bg', '--xh-_<c>-cell-border', '--xh-_<c>-cell-fg'] },
      { part: 'cell-trigger', state: '[data-selected]', props: ['--xh-action-bg-rest', '--xh-action-bg-hover', '--xh-action-bg-pressed', '--xh-action-border-rest', '--xh-action-fg-rest', '--xh-action-ring-color-focus-visible'] },
    ],
  },
  // ——以下家族按真源 §4 登记，读 family-backlog.json，已迁移成员 ≥ 2 才比——
  {
    // 静态内容面：边界三选一（§8.3），根面的边、底同源；影只在 Card 之外比——
    // 真源 §5.3 把 raised 落影只给 Card（check-elevation-role EXPECTED card.root=['raised']），
    // 其余静态面一律无影，Card 的影是它一家的登记身份，不是分叉
    name: '内容面族',
    backlog: true,
    members: ['card', 'alert', 'code-view', 'diff-view', 'log', 'json-viewer', 'tool-call', 'reasoning', 'approval', 'question-flow'],
    parts: [
      // json-viewer 的 root 只是壳，面画在树档容器 tree 上（原文档 text 与它同一套声明）；
      // reasoning 的缺省档按契约是 subtle 淡底，描边面写在 outline 档那条规则里，按那一档比
      { part: 'root', partBy: { 'json-viewer': 'tree' }, state: '', stateBy: { reasoning: '[data-variant=\'outline\']' }, props: ['border', 'background'] },
      { part: 'root', partBy: { 'json-viewer': 'tree' }, state: '', props: ['box-shadow'], only: ['alert', 'code-view', 'diff-view', 'log', 'json-viewer', 'tool-call', 'reasoning', 'approval', 'question-flow'] },
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
        // 面就是 root（list / descriptions / table）或组件本体（tree）的成员，槽名不带部件段（--xh-list-border）；
        // transfer 两侧面板共用 panel 段（--xh-transfer-panel-border）；listbox 的面是 content，槽名按部件取
        slotBy: { tree: '', transfer: 'panel', list: '', descriptions: '', table: '' },
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
      // toast 的面就是 root，使用者槽不带部件段（--xh-toast-border）；notification 的面是 item（--xh-notification-item-border）
      { partBy: { toast: 'root', notification: 'item' }, slotBy: { toast: '' }, state: '', props: ['border', 'background', 'box-shadow'] },
    ],
  },
  {
    // Feedback 三家的排版与指示符：标题 14/600、说明 13/fg-muted（§6.4），指示符统一 md 档（§6.5）
    name: 'Feedback 族',
    backlog: true,
    members: ['alert', 'toast', 'notification'],
    parts: [
      // notification 的标题 / 说明部件叫 item-title / item-description，使用者槽却按 title / description 取名
      // （--xh-notification-title-*，check-spacing-slots 已登记），槽名的部件段按 slotBy 归一
      { partBy: { alert: 'title', toast: 'title', notification: 'item-title' }, slotBy: { notification: 'title' }, state: '', props: ['font-size', 'font-weight'] },
      { partBy: { alert: 'description', toast: 'description', notification: 'item-description' }, slotBy: { notification: 'description' }, state: '', props: ['font-size', 'color'] },
      { partBy: { alert: 'root', toast: 'root', notification: 'item' }, state: '', props: ['--xh-icon-size'] },
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
      // pin-input 的视觉盒是每一格 input，使用者槽按 box 命名；mention 没有 control，输入框自身即视觉盒，
      // 使用者槽按 input 命名：两家都不与 control 的映射比对
      {
        part: 'control',
        state: '',
        props: [
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
          'color-field',
          'color-picker',
        ],
      },
      // 圆角的使用者槽 --xh-<c>-control-radius 在 field 身上就是家族读的桥接槽 --xh-field-control-radius 本身
      // （组件名恰是家族前缀），使用者写它即被家族直接读到，皮肤无法再写一条映射（会自引用）；field 不在这条里比
      {
        part: 'control',
        state: '',
        props: ['--xh-field-control-radius'],
        only: [
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
          'color-field',
          'color-picker',
        ],
      },
    ],
  },
  {
    // 值选择：选中行的底、字色与字重按集合语境走（§7.3）。选中 / 悬停 / 按下各态由 Collection Item 配方
    // 按 data-xh-collection-context 生成，已迁移成员的皮肤只在行的基础规则里把使用者槽映射到桥接槽——
    // 比对的是这些映射声明：悬停 / 高亮 / 按下面全族同源；选中字色、字重与选中叠加面只在浮层瞬态语境
    // （overlay）的成员间比，页内持久集合（listbox / tree）的选中面是品牌淡底 + 淡底前景，另一档取值
    name: '值选择族',
    backlog: true,
    members: ['select', 'listbox', 'combobox', 'cascader', 'tree-select', 'tree', 'date-picker', 'time-picker', 'time-range-picker'],
    parts: [
      {
        partBy: { 'select': 'item', 'listbox': 'item', 'combobox': 'item', 'cascader': 'item', 'tree-select': 'item', 'tree': 'item', 'date-picker': 'time-item', 'time-picker': 'item', 'time-range-picker': 'item' },
        // tree 的叶子与分支行共用一套按 row 取名的公开槽（--xh-tree-row-*，check-spacing-slots 已登记共用）
        slotBy: { tree: 'row' },
        state: '',
        props: ['--xh-collection-bg-hover', '--xh-collection-bg-keyboard-highlight', '--xh-collection-bg-pressed'],
      },
      {
        partBy: { 'select': 'item', 'combobox': 'item', 'cascader': 'item', 'tree-select': 'item', 'date-picker': 'time-item', 'time-picker': 'item', 'time-range-picker': 'item' },
        state: '',
        props: ['--xh-collection-fg-selected', '--xh-collection-font-weight-selected', '--xh-collection-bg-selected-hover', '--xh-collection-bg-selected-pressed'],
        only: ['select', 'combobox', 'cascader', 'tree-select', 'date-picker', 'time-picker', 'time-range-picker'],
      },
    ],
  },
  // 导航当前页与开关型（§7.3）不再按皮肤原文逐条比对：导航当前页三家（tabs line / anchor / navigation-menu）
  // 接 Collection Item nav 语境，当前页的透明面 + --xh-fg-brand-strong + medium 由配方给，皮肤只在基础块里把
  // 公开槽映射到 --xh-collection-fg-current / -font-weight-current 桥接槽（公开槽名后缀各随自家状态词汇
  // -active / -current），取值由配方与 check-selection-marker 的映射核保证；开关型的选中面长在不同的结构上——
  // tabs 的抬起面是 segment 档下的后代规则、segmented 的抬起面是 indicator 部件、toggle-group 的品牌淡底经
  // Action Control 桥接槽给，原文同值只有改公开槽名才做得到，由 check-selection-marker 按 slider / flat 两类
  // 逐成员核到令牌（surface-raised + border-default + raised、brand-subtle + on-brand-subtle）。
  {
    // 按钮形触发器：缺省中性，hover / active 的底按承载面阶梯走（§7.2）。已迁移成员都接了 Action Control
    // 形态矩阵，悬停 / 按下面不再在皮肤里写 :hover / :active 规则，而是在部件基础规则里把使用者槽映射到
    // 桥接槽 --xh-action-bg-hover / -pressed（兜底 --xh-_action-variant-*），比的是这两条映射声明
    name: '按钮形触发器族',
    backlog: true,
    members: ['toggle', 'clipboard', 'download-trigger', 'float-button', 'back-top', 'toolbar', 'pagination'],
    parts: [
      {
        partBy: { 'toggle': 'root', 'clipboard': 'copy-trigger', 'download-trigger': 'root', 'float-button': 'trigger', 'back-top': 'trigger', 'toolbar': 'item', 'pagination': 'item' },
        // 面就是 root 的成员，槽名不带部件段（--xh-toggle-bg-hover / --xh-download-trigger-bg-hover）
        slotBy: { 'toggle': '', 'download-trigger': '', 'float-button': '', 'back-top': '' },
        state: '',
        props: ['--xh-action-bg-hover', '--xh-action-bg-pressed'],
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

/**
 * 去掉注释与条件块（@media / @supports / @container 整块连同内部规则）：
 * 打印、粗指针、强制色这些环境分支说的不是这块面的基础取值，混进来会把一家的
 * `@media print { title { font-weight: bold } }` 当成它的基础字重去比。@layer 不是条件，保留。
 */
function strip(src) {
  const text = src.replace(/\/\*[\s\S]*?\*\//g, '')
  let out = ''
  let i = 0
  while (i < text.length) {
    const at = text.indexOf('@', i)
    if (at < 0) {
      out += text.slice(i)
      break
    }
    const open = text.indexOf('{', at)
    const prelude = open < 0 ? '' : text.slice(at, open)
    if (open < 0 || /^@layer\b/.test(prelude) || /[;}]/.test(prelude)) {
      out += text.slice(i, at + 1)
      i = at + 1
      continue
    }
    // 跳过整个条件块：从 { 起数括号到配对的 }
    let depth = 0
    let j = open
    for (; j < text.length; j++) {
      if (text[j] === '{')
        depth++
      else if (text[j] === '}' && --depth === 0)
        break
    }
    out += text.slice(i, at)
    i = j + 1
  }
  return out
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

/**
 * 家族配方里出现的槽名（桥接槽 --xh-field-* 与私有槽 --xh-_field-* 这类）：组件名恰是家族前缀的成员
 * （field）归一时不能把它们当成自己的槽名换掉，否则它的映射声明在全族里永远对不上。
 */
const familySlots = new Set()
for (const file of (await readdir(FAMILY_DIR)).filter(name => name.endsWith('.css'))) {
  const src = await readFile(join(FAMILY_DIR, file), 'utf8')
  for (const m of src.matchAll(/--xh-_?[a-z0-9-]+/g))
    familySlots.add(m[0])
}

/** 把取值里的组件名换成占位符：命名里那截组件名不是差异；家族配方的槽名照抄。 */
function normalize(value, comp) {
  const own = new RegExp(`--xh-(_?)${comp}-[a-z0-9-]+`, 'g')
  return value
    .replace(own, (name, priv) => familySlots.has(name) ? name : `--xh-${priv}<c>-${name.slice(`--xh-${priv}${comp}-`.length)}`)
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 按部件分别登记（partBy）的条目里，各成员的槽名部件段必然是自己那个部件（check-spacing-slots 要求槽名的
 * 部件段与规则所在部件一致：date-picker 的行是 time-item，别家是 item），比对时把这一段也归一成 <p>，
 * 槽名的后缀仍逐字比。槽名部件段与部件名不同的成员（notification 的 item-title 用 --xh-notification-title-*）
 * 由条目的 slotBy 指明那一段；slotBy 给空串表示这个成员的槽名不带部件段（toast 的面就是 root）。
 */
function normalizePart(value, part) {
  // 槽名不带部件段的成员（面就是 root）：把 <p> 段补进去，与带部件段的成员同形
  if (part === '')
    return value.replace(/--xh-(_?)<c>-/g, '--xh-$1<c>-<p>-')
  return value.replace(new RegExp(`--xh-(_?)<c>-${part}-`, 'g'), '--xh-$1<c>-<p>-')
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
          merged.set(name, entry.partBy ? normalizePart(value, entry.slotBy?.[comp] ?? partFor(comp)) : value)
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
