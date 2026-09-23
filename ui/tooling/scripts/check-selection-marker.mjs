#!/usr/bin/env node
// 门禁：选中与当前态按语义分类，每类只有一种标记。
//
// 真源 component-design.md §7.3：
// 浮层瞬态集合与树（Select / Combobox / TreeSelect / Cascader / 时间列 / Mention / Tree）= 透明底 + 行尾对号，
//   正文颜色与字重保持 rest；
// 页内持久集合（Listbox / Table row / Transfer / TagGroup / SideNav 当前项）
//   = --xh-bg-brand-subtle 行面 + --xh-fg-on-brand-subtle；
// 导航当前页（Tabs line / Anchor / NavigationMenu）= 指示条 + --xh-fg-brand-strong + medium，
//   Breadcrumb 当前页是不可点位置，保留 --xh-fg-default + medium；两者都是 Collection Item 的 nav 语境；
// 格状当前（Pagination item / Steps indicator / Calendar 选中格）= 实心 --xh-bg-brand + --xh-fg-on-brand，不加粗；
// 有滑块开关（Segmented / Tabs segment）的 indicator = --xh-bg-surface-raised + --xh-border-default + --xh-elevation-raised；
// 无滑块开关（Toggle / ToggleGroup item / Toolbar aria-pressed）= --xh-bg-brand-subtle + --xh-fg-on-brand-subtle；
// 展开路径 / 打开中不是选中：与所在家族 hover 同档的中性面，不用品牌色、不加粗。
//
// 三条判据：
// ① connect 投影 data-xh-collection-item 的 getter 必须同时投影 data-xh-collection-context（overlay | page | nav）；
// ② 已投影 collection-item 的部件，皮肤不得再写选中态的 background / color / font-weight（由家族配方给）；
//    导航当前页（nav / nav-terminal）的部件接了配方就必须投影 nav 语境，当前页 / 不可点当前页的字色与字重
//    由配方的 nav.current / nav.terminal 给：皮肤在部件基础块里映射了 --xh-collection-fg-current /
//    -font-weight-current（terminal 同名后缀）就把映射解到底核 brand-strong + medium（terminal：fg-default +
//    medium），没映射就核配方缺省是这三值；
// ③ 未接配方的部件按 SEMANTIC 登记的语义类查上表；open / in-path 的底色要与同部件 hover 档同值；
//    投影 data-xh-action-control 的部件（无滑块开关、字段内展开钮）读它在该状态里映射的
//    --xh-action-bg-rest / --xh-action-fg-rest 桥接槽，面由 Action Control 配方按这两支画。
// 私有槽在赋值点判，兜底链看最内层。存量登 family-backlog.json selection 段，命中即放行、不命中判过期。
import { readFile } from 'node:fs/promises'
import { getterBody, getterProjects, gettersProjecting, partOfGetter } from './lib/connect-getters.mjs'
import { openBacklog } from './lib/family-backlog.mjs'
import { colorPositionOf, conditional, innermost, partOf, privateSlots, readSkins, scopeOf, splitCompounds, splitSelectors } from './lib/skin-rules.mjs'

/** 主体上另带这些时不是纯状态规则（叠加态、禁用、伪元素），不参与比对。 */
const OVERLAY_STATES = [':hover', ':active', '[data-pressed]', ':focus', '[data-highlighted]', '[data-disabled]', '[aria-disabled', '[data-in-range]', '[data-today]', '[data-indeterminate]', '[data-dragging]', '[data-loading]', '::before', '::after', '[data-tone', '[data-variant', '[hidden]', ':empty', '[data-error]', '[aria-busy']

/**
 * 组件:部件 → 语义类与状态选择器。按真源 §7.3 与 §4.1 登记。
 * kind：overlay / page / nav / nav-terminal / grid / slider / flat / open。
 * 键里的 `宿主:scope/部件` 与 check-press-feedback 同形：皮肤把规则写在了内嵌的别家部件上。
 */
const SEMANTIC = {
  // 浮层瞬态集合：透明底 + 行尾对号，正文颜色与字重保持 rest
  'select:item': [{ kind: 'overlay', state: '[data-state=\'checked\']' }],
  'combobox:item': [{ kind: 'overlay', state: '[data-state=\'checked\']' }],
  'tree-select:item': [{ kind: 'overlay', state: '[data-selected]' }],
  'tree-select:branch-control': [{ kind: 'overlay', state: '[data-selected]' }],
  'cascader:item': [{ kind: 'overlay', state: '[data-state=\'checked\']' }, { kind: 'open', state: '[data-in-path]' }],
  'cascader:search-item': [{ kind: 'overlay', state: '[data-state=\'checked\']' }],
  'mention:item': [{ kind: 'overlay', state: '[data-state=\'checked\']' }],
  'command:item': [{ kind: 'overlay', state: '[aria-selected=\'true\']' }],
  'date-picker:time-item': [{ kind: 'overlay', state: '[data-state=\'checked\']' }],
  'date-picker:preset': [{ kind: 'overlay', state: '[data-state=\'checked\']' }],
  'time-picker:item': [{ kind: 'overlay', state: '[data-state=\'checked\']' }],
  'time-picker:preset': [{ kind: 'overlay', state: '[data-state=\'checked\']' }],
  'time-range-picker:item': [{ kind: 'overlay', state: '[data-state=\'checked\']' }],
  'time-range-picker:preset': [{ kind: 'overlay', state: '[data-state=\'checked\']' }],
  // 树与树选择同一种选中读法（2026-09-24 起）：行投影 overlay 语境
  'tree:item': [{ kind: 'overlay', state: '[data-selected]' }],
  'tree:branch-control': [{ kind: 'overlay', state: '[data-selected]' }],
  // 页内持久集合：品牌淡底行面 + 行尾对号或行首勾选框
  'listbox:item': [{ kind: 'page', state: '[data-state=\'checked\']' }],
  'table:row': [{ kind: 'page', state: '[data-selected]' }],
  'transfer:item': [{ kind: 'page', state: '[data-state=\'checked\']' }],
  'tag-group:tag/root': [{ kind: 'page', state: '[data-selected]' }],
  'side-nav:link': [{ kind: 'page', state: '[data-current]' }],
  // 导航当前页：指示条 + 品牌深字 + medium；Breadcrumb 当前页不可点，保留默认字色。
  // tabs 的 segment 档是有滑块开关：没放 indicator 部件时白色抬起面长在选中标签自己身上，放了则搬到部件上滑动；
  // 滑块三件（surface-raised 底 + border-default 描边 + raised 影）两处都按 slider 类核 segment 根下的规则
  'tabs:trigger': [
    { kind: 'nav', state: '[data-state=\'active\']' },
    { kind: 'slider', state: '[data-state=\'active\']', within: '[data-variant=\'segment\']' },
  ],
  'tabs:indicator': [{ kind: 'slider', state: '[data-variant=\'segment\']' }],
  'anchor:link': [{ kind: 'nav', state: '[data-current]' }],
  'navigation-menu:link': [{ kind: 'nav', state: '[data-current]' }],
  'breadcrumb:link': [{ kind: 'nav-terminal', state: '[data-current]' }],
  // 格状当前：实心品牌
  'pagination:item': [{ kind: 'grid', state: '[data-current]' }],
  'steps:indicator': [{ kind: 'grid', state: '[data-state=\'current\']' }],
  'calendar-picker:cell-trigger': [{ kind: 'grid', state: '[data-selected]' }],
  'calendar-range-picker:cell-trigger': [{ kind: 'grid', state: '[data-selected]' }],
  // 有滑块开关：白色抬起 indicator
  'segmented:indicator': [{ kind: 'slider' }],
  // 无滑块开关：品牌淡底
  'toggle:root': [{ kind: 'flat', state: '[data-state=\'on\']' }],
  'toggle-group:item': [{ kind: 'flat', state: '[data-state=\'on\']' }],
  'toolbar:item': [{ kind: 'flat', state: '[aria-pressed=\'true\']' }],
  // 展开路径 / 打开中：与家族 hover 同档的中性面
  'menu:trigger': [{ kind: 'open', state: '[data-state=\'open\']' }],
  'menu:item': [{ kind: 'open', state: '[data-state=\'open\']' }],
  'menubar:trigger': [{ kind: 'open', state: '[data-state=\'open\']' }],
  'menubar:item': [{ kind: 'open', state: '[data-state=\'open\']' }],
  'context-menu:item': [{ kind: 'open', state: '[data-state=\'open\']' }],
  'navigation-menu:trigger': [{ kind: 'open', state: '[data-state=\'open\']' }],
  'side-nav:branch-trigger': [{ kind: 'open', state: '[data-in-path]' }],
  'date-picker:trigger': [{ kind: 'open', state: '[data-state=\'open\']' }],
  'time-picker:trigger': [{ kind: 'open', state: '[data-state=\'open\']' }],
  'time-range-picker:trigger': [{ kind: 'open', state: '[data-state=\'open\']' }],
}

const REST_WEIGHT = new Set(['--xh-font-weight-regular', '--xh-font-weight-normal', 'inherit', 'normal', '400'])
const NO_BG = new Set(['transparent', 'none', 'unset', 'initial'])

/** Collection Item 配方真源：nav 部件没在皮肤里映射当前页 / 不可点当前页的字色与字重时，核的是这里的缺省。 */
const RECIPE = JSON.parse(await readFile('packages/design/styles/recipes/collection-item.recipe.json', 'utf8'))
const NAV_EXPECTED = {
  'nav': { state: 'current', color: '--xh-fg-brand-strong', weight: '--xh-font-weight-medium', label: '导航当前页' },
  'nav-terminal': { state: 'terminal', color: '--xh-fg-default', weight: '--xh-font-weight-medium', label: '面包屑当前页是不可点位置，' },
}

const backlog = await openBacklog('selection')
const problems = [...backlog.problems]
let governed = 0

/** 选择器分支的主体是否落在 `scope/part` 上（key 里写的那种）。 */
function subjectMatches(branch, comp, target) {
  const compounds = splitCompounds(branch)
  const subject = compounds.at(-1) ?? ''
  const [scope, part] = target.includes('/') ? target.split('/') : [null, target]
  if (partOf(subject) !== part)
    return false
  const own = scopeOf(subject) ?? [...compounds].reverse().map(scopeOf).find(Boolean) ?? comp
  return own === (scope ?? comp)
}

/** 主体上除登记状态外没有别的叠加态。 */
function pure(subject, state) {
  const rest = state ? subject.replace(state, '') : subject
  // :not(…) 只是守卫
  const bare = rest.replace(/:not\([^)]*\)/g, '')
  return !OVERLAY_STATES.some(s => bare.includes(s))
}

/** 把 `:is(a, b)` 拆成并列分支。 */
function expandIs(selector) {
  const hit = /:is\(([^()]*)\)/.exec(selector)
  if (!hit)
    return [selector]
  return hit[1].split(',').flatMap(alt => expandIs(selector.slice(0, hit.index) + alt.trim() + selector.slice(hit.index + hit[0].length)))
}

/**
 * 某部件在某状态（null = 基础块，':hover' = 悬停）下合并后的声明：属性 → { value, rule }。
 * 只收主体纯粹是「部件 + 该状态」的规则；within 指定时分支里还得带那一段。
 */
function declsFor(skin, target, state, within) {
  const merged = new Map()
  for (const rule of skin.rules) {
    if (conditional(rule))
      continue
    for (const branch of splitSelectors(rule.selector).flatMap(expandIs)) {
      if (!subjectMatches(branch, skin.comp, target))
        continue
      if (within && !branch.includes(within))
        continue
      const compounds = splitCompounds(branch)
      const subject = compounds.at(-1) ?? ''
      // 祖先上带状态（禁用列里的条目、语气容器下的条目）时不是这个部件自己的那个状态
      const context = compounds
        .slice(0, -1)
        .join(' ')
        .replace(/:not\([^)]*\)/g, '')
        .replace(/\[data-(?:scope|part)=['"]?[a-z0-9-]+['"]?\]/g, '')
        .replace(within ?? '', '')
      if (/[[:]/.test(context))
        continue
      if (state === ':hover') {
        if (!subject.includes(':hover') || !pure(subject.replace(':hover', ''), null))
          continue
      }
      else if (state) {
        // 状态得写在主体上，藏在 :not(…) 守卫里的是「排除这个状态」的规则，不是这个状态自己的
        if (!subject.replace(/:not\([^)]*\)/g, '').includes(state) || !pure(subject, state))
          continue
      }
      else if (subject.replace(/:not\([^)]*\)/g, '').replace(/\[data-(?:scope|part)=['"]?[a-z0-9-]+['"]?\]/g, '') !== '') {
        // 基础块：主体上只有 scope 与 part（:not 守卫不算）
        continue
      }
      for (const decl of rule.decls)
        merged.set(decl.prop, { value: decl.value, rule })
      break
    }
  }
  return merged
}

/** 解一条声明到最内层令牌：私有槽先在同一块找赋值，再到整份皮肤找。 */
function tokenOf(decl, slots) {
  if (!decl)
    return null
  const raw = decl.value
  let token = innermost(decl.prop === 'border' ? colorPositionOf(raw) : raw)
  for (let hops = 0; token.startsWith('--xh-_') && hops < 4; hops++) {
    const own = decl.rule.decls.find(d => d.prop === token)
    const any = slots.get(token)?.[0]
    const next = own?.value ?? any?.value
    if (next == null)
      return token
    token = innermost(next)
  }
  return token
}

/**
 * 某部件在皮肤里映射的 Collection Item 桥接槽（--xh-collection-*）：主体纯粹是这个部件（只带 scope / part 与
 * :not 守卫）的所有规则都收，祖先可以带形态限定——tabs 只在 line 档下把 trigger 接进 nav 语境，映射块写在
 * [data-variant='line'] 的后代规则里。
 */
function collectionMappings(skin, target) {
  const merged = new Map()
  for (const rule of skin.rules) {
    if (conditional(rule))
      continue
    for (const branch of splitSelectors(rule.selector).flatMap(expandIs)) {
      if (!subjectMatches(branch, skin.comp, target))
        continue
      const subject = splitCompounds(branch).at(-1) ?? ''
      if (subject.replace(/:not\([^)]*\)/g, '').replace(/\[data-(?:scope|part)=['"]?[a-z0-9-]+['"]?\]/g, '') !== '')
        continue
      for (const decl of rule.decls) {
        if (decl.prop.startsWith('--xh-collection-'))
          merged.set(decl.prop, { value: decl.value, rule })
      }
      break
    }
  }
  return merged
}

const skins = await readSkins()
const byComp = new Map(skins.map(s => [s.comp, s]))

// ① / ②：投影了 collection-item 的部件
const recipeParts = new Set()
for (const skin of skins) {
  const getters = await gettersProjecting(skin.comp, 'data-xh-collection-item')
  for (const getter of getters) {
    const part = partOfGetter(getter)
    recipeParts.add(`${skin.comp}:${part}`)
    if (!await getterProjects(skin.comp, part, 'data-xh-collection-context'))
      problems.push(`${skin.comp}.connect.ts  ${getter} 投影了 data-xh-collection-item 却没投影 data-xh-collection-context——配方靠它分 overlay / page / nav 三种语境`)
  }
}

for (const [key, rules] of Object.entries(SEMANTIC)) {
  const [comp, target] = key.split(/:(.+)/)
  const skin = byComp.get(comp)
  if (!skin) {
    problems.push(`${key}：${comp}.css 读不到——SEMANTIC 名单过期`)
    continue
  }
  const slots = privateSlots(skin.rules)
  const onRecipe = recipeParts.has(key)
  const report = (message) => {
    if (!backlog.excuse(key))
      problems.push(`${skin.file}  ${key}  ${message}`)
  }

  for (const { kind, state, within } of rules) {
    governed++
    // slider 类多半是常驻的 indicator 部件（看基础块）；登记了 state 的（tabs segment 档的选中标签）看该状态块
    const decls = declsFor(skin, target, state ?? null, within)
    const bg = tokenOf(decls.get('background') ?? decls.get('background-color'), slots)
    const color = tokenOf(decls.get('color'), slots)
    const weight = tokenOf(decls.get('font-weight'), slots)
    /** 同部件基础块的字色：「保持 rest」= 与它同值（浮层里 rest 是材质前景）。 */
    const restColor = tokenOf(declsFor(skin, target, null, within).get('color'), slots)

    // ② 接了配方的导航当前页 / 不可点当前页：必须投影 nav 语境，当前页三件由配方 nav.current / nav.terminal 给；
    // 皮肤在基础块里映射了桥接槽就把映射解到底核，没映射就核配方缺省
    if (onRecipe && (kind === 'nav' || kind === 'nav-terminal')) {
      const body = await getterBody(comp, target) ?? ''
      const navContext = /'data-xh-collection-context':[^,\n]*'nav'/.test(body)
      const expected = NAV_EXPECTED[kind]
      if (!navContext)
        report(`${expected.label}接了 collection-item 配方却没投影 nav 语境——当前页由配方的 nav.${expected.state} 给，data-xh-collection-context 必须是 'nav'`)
      for (const [name, token] of [['background', bg], ['color', color], ['font-weight', weight]]) {
        if (token != null)
          report(`已投影 data-xh-collection-item，皮肤却还写了 ${state} 的 ${name}: ${token}——${expected.label}三件由 collection-item 配方的 nav 语境给`)
      }
      const mappings = collectionMappings(skin, target)
      const fgMap = mappings.get(`--xh-collection-fg-${expected.state}`)
      const weightMap = mappings.get(`--xh-collection-font-weight-${expected.state}`)
      const recipe = RECIPE.contextValues.nav[expected.state]
      const fg = fgMap ? tokenOf(fgMap, slots) : innermost(recipe.color)
      const fw = weightMap ? tokenOf(weightMap, slots) : innermost(recipe.fontWeight)
      const from = map => (map ? '映射的' : '配方 nav 缺省的')
      if (fg !== expected.color)
        report(`${expected.label}字色应为 ${expected.color}，${from(fgMap)} --xh-collection-fg-${expected.state} 解到底是 ${fg}`)
      if (fw !== expected.weight)
        report(`${expected.label}字重应为 ${expected.weight}，${from(weightMap)} --xh-collection-font-weight-${expected.state} 解到底是 ${fw}`)
      if (!mappings.has(`--xh-collection-bg-${expected.state}`) && innermost(recipe.backgroundColor) !== 'transparent')
        report(`${expected.label}是透明面，配方 nav.${expected.state} 的 backgroundColor 却是 ${recipe.backgroundColor}`)
      continue
    }
    // 登记了 within（形态限定）的语义类是那一档自己的身份：连接层按形态决定投不投家族角色（tabs 只在 line 档
    // 投影，segment 档的滑块面写在皮肤里），②「接了配方皮肤不得再写」只核没有形态限定的登记
    if (onRecipe && within == null && kind !== 'open' && kind !== 'nav' && kind !== 'nav-terminal') {
      for (const [name, token] of [['background', bg], ['color', color], ['font-weight', weight]]) {
        if (token != null)
          report(`已投影 data-xh-collection-item，皮肤却还写了 ${state} 的 ${name}: ${token}——选中标记由 collection-item 配方按 context 给`)
      }
      continue
    }

    // ② 接了配方的部件的展开路径 / 打开中：面由家族按 data-in-path 给，皮肤只在基础块里映射
    // --xh-collection-bg-open-path / -font-weight-open-path；核的是这两条映射与同部件 hover 映射同档
    // （都没映射时家族缺省两者同为 --xh-bg-subtle），皮肤不得再写该状态的 background
    if (onRecipe && kind === 'open') {
      if (bg != null || weight != null)
        report(`已投影 data-xh-collection-item，皮肤却还写了 ${state} 的面——展开路径由 collection-item 配方按 data-in-path 给`)
      const base = declsFor(skin, target, null, within)
      const openBg = tokenOf(base.get('--xh-collection-bg-open-path'), slots) ?? '--xh-bg-subtle'
      const hoverBg = tokenOf(base.get('--xh-collection-bg-hover'), slots) ?? '--xh-bg-subtle'
      const openWeight = tokenOf(base.get('--xh-collection-font-weight-open-path'), slots)
      if (openBg.startsWith('--xh-bg-brand'))
        report(`${state} 映射的 --xh-collection-bg-open-path 是 ${openBg}——打开中不是选中，不用品牌色`)
      else if (openBg !== hoverBg)
        report(`${state} 映射的 --xh-collection-bg-open-path 是 ${openBg}，同部件 --xh-collection-bg-hover 是 ${hoverBg}——打开中与所在家族 hover 同档`)
      if (openWeight != null && !REST_WEIGHT.has(openWeight))
        report(`${state} 映射的 --xh-collection-font-weight-open-path 是 ${openWeight}——打开中不加粗`)
      continue
    }

    switch (kind) {
      case 'overlay':
        if (bg != null && !NO_BG.has(bg))
          report(`浮层瞬态集合的选中底色是 ${bg}，应为透明底 + 行尾对号`)
        if (weight != null && !REST_WEIGHT.has(weight))
          report(`浮层瞬态集合的选中字重是 ${weight}，应保持 rest 不加粗`)
        if (color != null && color !== '--xh-fg-default' && color !== 'inherit' && color !== restColor)
          report(`浮层瞬态集合的选中字色是 ${color}，正文颜色应保持 rest（${restColor ?? '--xh-fg-default'}）`)
        break
      case 'page':
        if (bg !== '--xh-bg-brand-subtle')
          report(`页内持久集合的选中行面是 ${bg ?? '（没写 background）'}，应为 --xh-bg-brand-subtle`)
        if (color !== '--xh-fg-on-brand-subtle')
          report(`页内持久集合的选中字色是 ${color ?? '（没写 color）'}，应为 --xh-fg-on-brand-subtle`)
        break
      case 'grid': {
        // 投影了 Action Control 的部件（Pagination item）：底与字色由家族按 --xh-action-bg-rest / --xh-action-fg-rest 画，
        // 当前态的面是皮肤在该状态里映射的这两支桥接槽（与 flat 类同路径）；两支都按槽解析到底
        const onAction = await getterProjects(comp, target, 'data-xh-action-control')
        const gridBg = onAction ? tokenOf(decls.get('--xh-action-bg-rest'), slots) ?? bg : bg
        const gridColor = onAction ? tokenOf(decls.get('--xh-action-fg-rest'), slots) ?? color : color
        if (gridBg !== '--xh-bg-brand')
          report(`格状当前的底是 ${gridBg ?? '（没写 background）'}，应为实心 --xh-bg-brand`)
        if (gridColor !== '--xh-fg-on-brand')
          report(`格状当前的字色是 ${gridColor ?? '（没写 color）'}，应为 --xh-fg-on-brand`)
        if (weight != null && !REST_WEIGHT.has(weight))
          report(`格状当前加粗成 ${weight}，实心品牌面不加粗`)
        break
      }
      case 'nav':
        if (color !== '--xh-fg-brand-strong')
          report(`导航当前页字色是 ${color ?? '（没写 color）'}，应为 --xh-fg-brand-strong`)
        if (weight !== '--xh-font-weight-medium')
          report(`导航当前页字重是 ${weight ?? '（没写 font-weight）'}，应为 --xh-font-weight-medium`)
        break
      case 'nav-terminal':
        if (color !== '--xh-fg-default')
          report(`面包屑当前页是不可点位置，字色应保留 --xh-fg-default，实际 ${color ?? '（没写 color）'}`)
        if (weight !== '--xh-font-weight-medium')
          report(`面包屑当前页字重应为 --xh-font-weight-medium，实际 ${weight ?? '（没写 font-weight）'}`)
        break
      case 'flat': {
        // 投影了 Action Control 的部件（Toggle / Toolbar item）：底与字色由家族按 --xh-action-bg-rest /
        // --xh-action-fg-rest 画，选中态的面是皮肤在该状态里映射的这两支桥接槽；两支都按槽解析到底
        const onAction = await getterProjects(comp, target, 'data-xh-action-control')
        const flatBg = onAction ? tokenOf(decls.get('--xh-action-bg-rest'), slots) ?? bg : bg
        const flatColor = onAction ? tokenOf(decls.get('--xh-action-fg-rest'), slots) ?? color : color
        if (flatBg !== '--xh-bg-brand-subtle')
          report(`无滑块开关的选中底是 ${flatBg ?? '（没写 background）'}，应为 --xh-bg-brand-subtle`)
        if (flatColor !== '--xh-fg-on-brand-subtle')
          report(`无滑块开关的选中字色是 ${flatColor ?? '（没写 color）'}，应为 --xh-fg-on-brand-subtle`)
        break
      }
      case 'slider': {
        const border = tokenOf(decls.get('border-color') ?? decls.get('border'), slots)
        const shadow = tokenOf(decls.get('box-shadow'), slots)
        if (bg !== '--xh-bg-surface-raised')
          report(`滑块 indicator 的底是 ${bg ?? '（没写 background）'}，应为 --xh-bg-surface-raised`)
        if (border !== '--xh-border-default')
          report(`滑块 indicator 的描边是 ${border ?? '（没写 border）'}，应为 --xh-border-default`)
        if (shadow !== '--xh-elevation-raised')
          report(`滑块 indicator 的落影是 ${shadow ?? '（没写 box-shadow）'}，应为 --xh-elevation-raised`)
        break
      }
      case 'open': {
        // 投影了 Action Control 的部件（字段内的展开钮）：底由家族按 --xh-action-bg-rest 画，打开态的面
        // 是皮肤在该状态里把 --xh-action-bg-rest 映到与基础块 --xh-action-bg-hover 同一支；两支都按槽解析到底
        const onAction = await getterProjects(comp, target, 'data-xh-action-control')
        const openBg = onAction ? tokenOf(decls.get('--xh-action-bg-rest'), slots) ?? bg : bg
        const hover = tokenOf((() => {
          const h = declsFor(skin, target, onAction ? null : ':hover', within)
          return onAction ? h.get('--xh-action-bg-hover') : (h.get('background') ?? h.get('background-color'))
        })(), slots)
        if (openBg == null)
          report(`${state} 没写 background——展开路径 / 打开中要落与 hover 同档的中性面`)
        else if (openBg.startsWith('--xh-bg-brand'))
          report(`${state} 的底是 ${openBg}——打开中不是选中，不用品牌色`)
        else if (hover != null && openBg !== hover)
          report(`${state} 的底是 ${openBg}，同部件 hover 档是 ${hover}——打开中与所在家族 hover 同档`)
        if (weight != null && !REST_WEIGHT.has(weight))
          report(`${state} 加粗成 ${weight}——打开中不加粗`)
        break
      }
    }
  }
}

problems.push(...backlog.stale())

if (problems.length) {
  console.error('[check-selection-marker] ✗ 选中与当前态没按语义分类走：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('\n浮层集合透明底 + 对号 · 页内集合品牌淡底行面 · 导航当前品牌深字（配方 nav 语境） · 格状当前实心品牌 · 有滑块开关白色抬起 indicator · 无滑块开关品牌淡底 · 打开中与 hover 同档。存量登 family-backlog.json selection 段。')
  process.exit(1)
}

console.log(`[check-selection-marker] 通过：${governed} 条语义登记核过，${recipeParts.size} 个部件接了 collection-item 配方并带 context；backlog 待办 ${backlog.pending} 条，无过期豁免`)
