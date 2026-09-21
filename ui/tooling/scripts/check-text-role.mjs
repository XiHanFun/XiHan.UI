#!/usr/bin/env node
// 门禁：文字按角色取排版令牌，图标按档取字形尺寸。
//
// 真源 component-design.md §6.4 / §6.5：
// 字段标签 = --xh-text-label-size 14 / --xh-text-label-weight 500 / --xh-fg-default，贴控件 --xh-space-1，不随 size 档；
// 控件随文标签（Checkbox / Switch 的 <label> 整行：方框 / 轨道 + 它自己的文字）= 控件文字，字号随档取
// --xh-control-font-sm / md / lg（§6.4 控件字号随档，与 checkbox-group / radio-group 的条目文字同一把尺），
// 颜色 --xh-fg-default；
// 集合标题（RadioGroup / CheckboxGroup / Listbox / Tree / TagGroup / Descriptions）= --xh-fg-muted，与集合 --xh-space-2；
// 说明 = --xh-text-secondary-size 13 / --xh-fg-muted / --xh-leading-normal；错误文案 = 13 / --xh-fg-danger；
// Surface / Feedback / 浮层内标题 = --xh-text-label-size + --xh-font-weight-semibold，页面级面板（Dialog / Drawer / Tour）= heading-3；
// 禁用标签 --xh-fg-subtle；控件内图标 --xh-icon-size 兜底只能是 --xh-glyph-size-sm / md / lg（按 data-size），
// --xh-glyph-size-text 只许纯行内文字组件（Tag / Kbd / Breadcrumb / Typography / Highlight）；
// Feedback 指示符（Alert / Toast / Notification）统一 --xh-glyph-size-md。
//
// 按 scope 列表登记角色（同名部件跨组件语义不同，不通配）；判据看兜底链最内层，私有槽在赋值点判；
// 只判皮肤里写了的声明——没写的那一条由继承给，不在此列。存量登 family-backlog.json text 段，
// 键 组件:部件[:属性]，命中即放行、不命中判过期。
import { openBacklog } from './lib/family-backlog.mjs'
import { conditional, innermost, partOf, readSkins, scopeOf, splitCompounds, splitSelectors } from './lib/skin-rules.mjs'

/** 字段标签：单字段与复合单字段。 */
const FIELD_LABEL = new Set([
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
  'slider',
  'rating',
  'signature-pad',
  'color-slider',
  'color-swatch-picker',
  'file-upload',
])
/** 控件随文标签：整行 <label> 包住控件与文字，文字是控件自己的文字，字号随 size 档。 */
const CONTROL_LABEL = new Set(['checkbox', 'switch'])
/** 控件文字允许的档。 */
const CONTROL_FONT_STEPS = ['--xh-control-font-sm', '--xh-control-font-md', '--xh-control-font-lg']
/** 集合标题：scope → 标签所在的容器部件（与集合的间距读它的 gap）。Descriptions 的标签是每一格的标题，坐在 item 里。 */
const COLLECTION_TITLE = {
  'radio-group': 'root',
  'checkbox-group': 'root',
  'listbox': 'root',
  'tree': 'root',
  'tag-group': 'root',
  'descriptions': 'item',
}
/** Surface / Feedback / 浮层内标题：scope → 标题部件。 */
const SURFACE_TITLE = {
  'card': 'title',
  'alert': 'title',
  'toast': 'title',
  'notification': 'item-title',
  'floating-panel': 'title',
  'approval': 'title',
  'steps': 'title',
  'timeline': 'title',
  'popover': 'title',
  'hover-card': 'title',
  'popconfirm': 'title',
  'empty-state': 'title',
}
/** 页面级标题：heading-3（Dialog / Drawer / Tour 的面板标题与 PageHeader 的页面标题）。 */
const PAGE_TITLE = new Set(['dialog', 'drawer', 'tour', 'page-header'])
/**
 * 纯行内文字组件：图标随文（--xh-glyph-size-text）。
 * tag-group 的条目就是 tag 的 root，格子里的选中标记（item-indicator）与 tag 关闭钮的叉同一把随文尺，
 * 按 sm / md / lg 取会比旁边的叉大一圈。
 */
const INLINE_TEXT = new Set(['tag', 'tag-group', 'kbd', 'breadcrumb', 'typography', 'highlight'])
/** Feedback 指示符：scope → 声明 --xh-icon-size 的部件，统一 md。 */
const FEEDBACK_INDICATOR = { alert: 'root', toast: 'root', notification: 'item' }
/** 不是控件内图标的字形：空状态的主视觉图形按自己的尺度走；方盒里的方向指示符与方盒同边长（§6.5）。 */
const GLYPH_EXEMPT = {
  'empty-state:indicator': '空状态的主视觉字形，不是控件内图标',
  'table:expand-trigger': '展开方向 chevron 是指示符，与 16px 方盒同走 --xh-control-indicator-size，不按图标档取',
  'table:sort-trigger': '排序方向箭头是指示符，与 16px 方盒同走 --xh-control-indicator-size（公开槽 --xh-table-sort-size），不按图标档取',
  'tree:branch-trigger': '展开方向 chevron 是指示符，与 16px 箭头盒同走 --xh-control-indicator-size，不按图标档取',
  'tree:branch-indicator': '展开方向 chevron 是指示符，与 16px 箭头盒同走 --xh-control-indicator-size，不按图标档取',
  'tree:item-indicator': '叶子的对号是指示符，与 16px 对号盒同走 --xh-control-indicator-size，不按图标档取',
  'tree-select:branch-trigger': '展开方向 chevron 是指示符，与 16px 箭头盒同走 --xh-control-indicator-size，不按图标档取',
  'tree-select:branch-indicator': '展开方向 chevron 是指示符，与 16px 箭头盒同走 --xh-control-indicator-size，不按图标档取',
  'tree-select:item-indicator': '行尾的对号 / 半选杠是指示符，与 16px 对号盒同走 --xh-control-indicator-size，不按图标档取',
  'side-nav:branch-indicator': '分支行尾的展开方向 chevron 是指示符，与 16px 箭头盒同走 --xh-control-indicator-size，不按图标档取',
  'json-viewer:branch-trigger': '分支行首的展开方向 chevron 是指示符，与 16px 把手盒同走 --xh-control-indicator-size，不按图标档取',
  'menu:item-indicator': '标记位的盒是指示符，与 16px 指示符档同走 --xh-control-indicator-size，作者塞进去的图标与盒同尺，不按图标档取',
  'context-menu:item-indicator': '标记位的盒是指示符，与 16px 指示符档同走 --xh-control-indicator-size，兜底的勾与作者塞进去的图标都与盒同尺，不按图标档取',
  'menubar:item-indicator': '标记位的盒是指示符，与 16px 指示符档同走 --xh-control-indicator-size，兜底的勾与作者塞进去的图标都与盒同尺，不按图标档取',
  'cascader:item-indicator': '行尾的勾 / 半选杠是指示符，与 16px 标记盒同走 --xh-control-indicator-size，兜底字形与作者塞进去的图标都与盒同尺，不按图标档取',
  'listbox:item-indicator': '前导对号所在的标记盒是指示符，与 16px 指示符档同走 --xh-control-indicator-size，兜底的勾与作者塞进去的图标都与盒同尺，不按图标档取',
  'select:item-indicator': '浮层条目里勾选标记所在的标记盒是指示符，与 16px 指示符档同走 --xh-control-indicator-size，兜底的勾与作者塞进去的图标都与盒同尺，不按图标档取',
  'combobox:item-indicator': '浮层条目里勾选标记所在的标记盒是指示符，与 16px 指示符档同走 --xh-control-indicator-size，兜底的勾与作者塞进去的图标都与盒同尺，不按图标档取',
}
/** 控件内图标允许的档。 */
const GLYPH_STEPS = new Set(['--xh-glyph-size-sm', '--xh-glyph-size-md', '--xh-glyph-size-lg'])

const backlog = await openBacklog('text')
const problems = [...backlog.problems]
let governed = 0

const skins = await readSkins()

/**
 * 按「scope|part|state」建一次索引：每个键下是按皮肤、规则出现顺序排的 { rule, skin }，
 * 一条规则对同一键只登一次（多分支落同一键时只算首个命中的分支）。
 * declsFor 按 scope / part / state 被调上百次，不能每次都重扫全部皮肤。
 */
function indexRules() {
  const index = new Map()
  for (const skin of skins) {
    for (const rule of skin.rules) {
      if (conditional(rule))
        continue
      const seen = new Set()
      for (const branch of splitSelectors(rule.selector)) {
        const compounds = splitCompounds(branch)
        const subject = compounds.at(-1) ?? ''
        const part = partOf(subject)
        if (!part)
          continue
        const own = scopeOf(subject) ?? [...compounds].reverse().map(scopeOf).find(Boolean) ?? skin.comp
        const rest = subject
          .replace(/:not\([^)]*\)/g, '')
          .replace(/\[data-scope=['"]?[a-z0-9-]+['"]?\]/, '')
          .replace(/\[data-part=['"]?[a-z0-9-]+['"]?\]/, '')
        // 祖先带状态的不是基础块
        const context = compounds.slice(0, -1).join(' ').replace(/:not\([^)]*\)/g, '').replace(/\[data-(?:scope|part)=['"]?[a-z0-9-]+['"]?\]/g, '')
        if (/[[:]/.test(context))
          continue
        const key = `${own}|${part}|${rest}`
        if (seen.has(key))
          continue
        seen.add(key)
        let bucket = index.get(key)
        if (!bucket)
          index.set(key, bucket = [])
        bucket.push({ rule, skin })
      }
    }
  }
  return index
}

const ruleIndex = indexRules()

/** 所有皮肤里落在 `scope:part`（基础块或带 state 的块）上的声明，按出现顺序合并：属性 → { value, file, line, rule }。 */
function declsFor(scope, part, state = null) {
  const merged = new Map()
  for (const { rule, skin } of ruleIndex.get(`${scope}|${part}|${state ?? ''}`) ?? []) {
    for (const decl of rule.decls)
      merged.set(decl.prop, { value: decl.value, file: skin.file, line: decl.line, rule, skin })
  }
  return merged
}

/** 每份皮肤里私有槽的首个赋值：属性 → value，按需建一次。 */
const firstAssignment = new WeakMap()
function assignmentIn(skin, prop) {
  let map = firstAssignment.get(skin)
  if (!map) {
    map = new Map()
    for (const rule of skin.rules) {
      for (const decl of rule.decls) {
        if (decl.prop.startsWith('--xh-_') && !map.has(decl.prop))
          map.set(decl.prop, decl.value)
      }
    }
    firstAssignment.set(skin, map)
  }
  return map.get(prop)
}

/** 解到最内层：私有槽先在同一块找赋值，再到那份皮肤找。 */
function tokenOf(decl) {
  if (!decl)
    return null
  let token = innermost(decl.value)
  for (let hops = 0; token.startsWith('--xh-_') && hops < 4; hops++) {
    const own = decl.rule.decls.find(d => d.prop === token)
    const next = own?.value ?? assignmentIn(decl.skin, token)
    if (next == null)
      return token
    token = innermost(next)
  }
  return token
}

function expect(scope, part, decls, prop, want, why) {
  const decl = decls.get(prop)
  if (!decl)
    return
  governed++
  const token = tokenOf(decl)
  const ok = Array.isArray(want) ? want.includes(token) : token === want
  if (ok)
    return
  const key = `${scope}:${part}:${prop}`
  if (!backlog.excuse(key))
    problems.push(`${decl.file}:${decl.line}  ${key}  ${prop} 落 ${token}，${why}应为 ${Array.isArray(want) ? want.join(' / ') : want}`)
}

/**
 * 与相邻元素的间距：部件自己的 margin-block-end，没有就看所在容器（缺省是根）的 gap / row-gap。
 * 标签自己的 margin 写成 calc(目标 − 容器 gap) 的差值时（field、color-swatch-picker：容器的 gap 归条目之间，
 * 标签在它之上补差把到控件的距离收成目标值），真正的距离是被减项，按它判。
 */
function expectSpacing(scope, part, decls, want, why, container = 'root') {
  const margin = decls.get('margin-block-end')
  const diff = margin && /^calc\(\s*(var\([\s\S]+?\))\s*-\s*var\([\s\S]+\)\s*\)$/.exec(margin.value)
  const own = margin && !margin.value.startsWith('calc(')
    ? margin
    : diff
      ? { ...margin, value: diff[1] }
      : null
  const host = declsFor(scope, container)
  const decl = own ?? host.get('row-gap') ?? host.get('gap')
  if (!decl)
    return
  governed++
  const token = tokenOf(decl)
  if (token === want)
    return
  const key = `${scope}:${part}:spacing`
  if (!backlog.excuse(key))
    problems.push(`${decl.file}:${decl.line}  ${key}  ${own ? 'margin-block-end' : `${container} 的 gap`} 落 ${token}，${why}应为 ${want}`)
}

const scopes = new Set(skins.map(s => s.comp))

// 字段标签
for (const scope of FIELD_LABEL) {
  if (!scopes.has(scope)) {
    problems.push(`${scope}.css 读不到——FIELD_LABEL 名单过期`)
    continue
  }
  const label = declsFor(scope, 'label')
  expect(scope, 'label', label, 'font-size', '--xh-text-label-size', '字段标签字号不随档，')
  expect(scope, 'label', label, 'font-weight', '--xh-text-label-weight', '字段标签')
  expect(scope, 'label', label, 'color', '--xh-fg-default', '字段标签')
  expectSpacing(scope, 'label', label, '--xh-space-1', '字段标签贴控件')
  const disabled = declsFor(scope, 'label', '[data-disabled]')
  expect(scope, 'label', disabled, 'color', '--xh-fg-subtle', '禁用标签色统一')
}

// 控件随文标签
for (const scope of CONTROL_LABEL) {
  if (!scopes.has(scope)) {
    problems.push(`${scope}.css 读不到——CONTROL_LABEL 名单过期`)
    continue
  }
  const label = declsFor(scope, 'label')
  expect(scope, 'label', label, 'font-size', CONTROL_FONT_STEPS, '控件随文标签的字号随 size 档，')
  expect(scope, 'label', label, 'color', '--xh-fg-default', '控件随文标签')
  const disabled = declsFor(scope, 'label', '[data-disabled]')
  expect(scope, 'label', disabled, 'color', '--xh-fg-subtle', '禁用标签色统一')
}

// 集合标题
for (const [scope, container] of Object.entries(COLLECTION_TITLE)) {
  if (!scopes.has(scope)) {
    problems.push(`${scope}.css 读不到——COLLECTION_TITLE 名单过期`)
    continue
  }
  const label = declsFor(scope, 'label')
  expect(scope, 'label', label, 'font-size', '--xh-text-label-size', '集合标题')
  expect(scope, 'label', label, 'color', '--xh-fg-muted', '集合标题')
  expectSpacing(scope, 'label', label, '--xh-space-2', '集合标题与集合', container)
}

// 说明与错误文案：所有写了这两个部件的皮肤
for (const skin of skins) {
  const description = declsFor(skin.comp, 'description')
  if (description.size) {
    expect(skin.comp, 'description', description, 'font-size', '--xh-text-secondary-size', '说明文字')
    expect(skin.comp, 'description', description, 'color', '--xh-fg-muted', '说明文字')
    expect(skin.comp, 'description', description, 'line-height', '--xh-leading-normal', '说明文字')
  }
  const error = declsFor(skin.comp, 'error-text')
  if (error.size) {
    expect(skin.comp, 'error-text', error, 'font-size', '--xh-text-secondary-size', '错误文案')
    expect(skin.comp, 'error-text', error, 'color', '--xh-fg-danger', '错误文案')
  }
}

// 标题
for (const [scope, part] of [...Object.entries(SURFACE_TITLE), ...[...PAGE_TITLE].map(s => [s, 'title'])]) {
  if (!scopes.has(scope)) {
    problems.push(`${scope}.css 读不到——标题名单过期`)
    continue
  }
  const title = declsFor(scope, part)
  if (!title.size) {
    problems.push(`${scope}.css 没有 ${part} 部件的规则——标题名单过期`)
    continue
  }
  if (PAGE_TITLE.has(scope)) {
    expect(scope, part, title, 'font-size', '--xh-text-heading-3-size', '页面级标题')
    expect(scope, part, title, 'font-weight', '--xh-text-heading-3-weight', '页面级标题')
  }
  else {
    expect(scope, part, title, 'font-size', '--xh-text-label-size', 'Surface / Feedback / 浮层内标题')
    expect(scope, part, title, 'font-weight', '--xh-font-weight-semibold', 'Surface / Feedback / 浮层内标题')
  }
}

// 图标尺寸：--xh-icon-size 的兜底只能是三档之一；随文档只给纯行内文字组件；Feedback 指示符统一 md
for (const skin of skins) {
  for (const rule of skin.rules) {
    if (conditional(rule))
      continue
    for (const decl of rule.decls) {
      if (decl.prop !== '--xh-icon-size')
        continue
      governed++
      const token = tokenOf({ value: decl.value, rule, skin })
      const part = [...splitSelectors(rule.selector)].map(b => partOf(splitCompounds(b).at(-1) ?? ''))[0] ?? 'root'
      const key = `${skin.comp}:${part}:icon-size`
      const report = (message) => {
        if (!backlog.excuse(key))
          problems.push(`${skin.file}:${decl.line}  ${key}  ${message}`)
      }
      // 由盒尺寸算出来的字形（勾选框里的对号、色块上的徽标）不是按档取的图标
      if (token.startsWith('calc(') || token.startsWith('--xh-_') || `${skin.comp}:${part}` in GLYPH_EXEMPT)
        continue
      if (token === '--xh-glyph-size-text') {
        if (!INLINE_TEXT.has(skin.comp))
          report('--xh-icon-size 兜底落 --xh-glyph-size-text——随文字形只给纯行内文字组件，控件内图标按档取 --xh-glyph-size-sm / md / lg')
        continue
      }
      if (FEEDBACK_INDICATOR[skin.comp] === part && token !== '--xh-glyph-size-md') {
        report(`Feedback 指示符落 ${token}——Alert / Toast / Notification 统一 --xh-glyph-size-md`)
        continue
      }
      if (!GLYPH_STEPS.has(token))
        report(`--xh-icon-size 兜底落 ${token}——只能是 --xh-glyph-size-sm / md / lg`)
    }
  }
}

problems.push(...backlog.stale())

if (problems.length) {
  console.error('[check-text-role] ✗ 文字与图标没按角色取令牌：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('\n字段标签 14/500/fg-default 贴控件 space-1 · 集合标题 fg-muted + space-2 · 说明 13/fg-muted · 标题 14/600 · 图标随档 sm/md/lg。存量登 family-backlog.json text 段。')
  process.exit(1)
}

console.log(`[check-text-role] 通过：${governed} 条排版与图标声明按角色核过；backlog 待办 ${backlog.pending} 条，无过期豁免`)
