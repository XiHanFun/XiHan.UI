/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 把查询结果渲染成 Markdown，命令行与 MCP 工具输出同一份文本。

import type { ComponentEntry, Framework, Knowledge, PageEntry } from './knowledge'
import type { ChangelogSection, ComponentGroup, DemoResult, DocResult, TokenResult } from './query'

const code = (s: string): string => `\`${s.replace(/`/g, '')}\``
const cell = (s: string): string => s.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|')
const codeCell = (s: string): string => cell(code(s))

function table(head: readonly string[], rows: readonly (readonly string[])[]): string[] {
  return [
    `| ${head.join(' | ')} |`,
    `| ${head.map(() => '---').join(' | ')} |`,
    ...rows.map(row => `| ${row.join(' | ')} |`),
  ]
}

/** Vue / React 的根组件名：Root 优先，其次同名组件。 */
export function rootComponent(entry: ComponentEntry): string | undefined {
  const names = entry.artifacts.components
  return names.find(n => n === `Xh${entry.title}Root`) ?? names.find(n => n === `Xh${entry.title}`) ?? names[0]
}

export function renderList(knowledge: Knowledge, groups: readonly ComponentGroup[]): string {
  const total = groups.reduce((sum, g) => sum + g.components.length, 0)
  const L = [`# XiHan.UI 组件 · v${knowledge.meta.version}`, '', `共 ${total} 个。查看某个组件用 info，完整文档用 doc。`, '']
  for (const group of groups) {
    L.push(`## ${group.label}（${group.id}）`, '')
    if (group.description)
      L.push(group.description, '')
    L.push(...table(
      ['组件', '名称', 'Vue / React 根组件', '自定义元素', '状态'],
      group.components.map(c => [
        `${c.title}（${code(c.id)}）`,
        cell(c.name),
        rootComponent(c) ? code(rootComponent(c)!) : '—',
        c.artifacts.tag ? code(`<${c.artifacts.tag}>`) : '—',
        c.status ?? '',
      ]),
    ), '')
  }
  return L.join('\n')
}

function fieldTable(rows: readonly { name: string, type: string, optional: boolean, doc: string }[]): string[] {
  return table(['属性', '类型', '必填', '说明'], rows.map(r => [codeCell(r.name), codeCell(r.type), r.optional ? '' : '是', cell(r.doc)]))
}

export function renderInfo(knowledge: Knowledge, entry: ComponentEntry): string {
  const a = entry.artifacts
  const L = [`# ${entry.title} ${entry.name}`, '']
  if (entry.status)
    L.push(`状态：${code(entry.status)}`, '')
  if (entry.overview)
    L.push(entry.overview, '')
  L.push(`分类：${entry.categoryLabel}（${entry.category}）· 文档：${knowledge.meta.site}/components/${entry.id}`, '')

  L.push('## 产物', '')
  const artifactRows: string[][] = []
  if (a.components.length)
    artifactRows.push(['Vue / React 组件', a.components.map(code).join(' ')])
  if (a.composable)
    artifactRows.push(['Vue 组合式函数', code(a.composable)])
  if (a.tag)
    artifactRows.push(['自定义元素', code(`<${a.tag}>`)])
  artifactRows.push(['状态机', a.machine ? code(a.machine) : '无'])
  if (a.skin)
    artifactRows.push(['皮肤', code(a.skin)])
  L.push(...table(['层', '值'], artifactRows), '')

  const required = new Set(entry.requiredParts)
  L.push('## 部件', '', `${code(`data-scope="${entry.id}"`)}：${entry.parts.map(p => (required.has(p) ? `**${code(p)}**` : code(p))).join(' · ')}（加粗为必需部件）`, '')

  if (entry.props.length)
    L.push('## Props', '', ...fieldTable(entry.props), '')
  for (const node of entry.nodes)
    L.push(`### ${node.name}`, '', `${code(node.via)} 的元素。`, '', ...fieldTable(node.fields), '')
  if (entry.events.length) {
    L.push('## 事件', '', '自定义元素的载荷在 `detail`；Vue 为同名 emit。', '')
    L.push(...table(['事件', '载荷', '说明'], entry.events.map(e => [codeCell(e.name), e.type ? codeCell(e.type) : '', cell(e.description)])), '')
  }
  if (entry.slots.length) {
    L.push('## Vue 插槽（带载荷）', '')
    L.push(...table(['组件', '插槽', '载荷', '说明'], entry.slots.map(s => [code(s.component), code(s.name), s.payload ? codeCell(s.payload) : '—', cell(s.doc)])), '')
  }
  if (entry.reactProps.length) {
    L.push('## React 适配器 props', '', '只列 React 组件自己声明的属性，DOM 属性与上面 Props 表里同名的不重复列。', '')
    L.push(...table(['组件', '属性', '类型', '必填', '说明'], entry.reactProps.map(r => [code(r.component), codeCell(r.name), codeCell(r.type), r.optional ? '' : '是', cell(r.doc)])), '')
  }
  const states = entry.dataAttributes.filter(d => d.attr === 'data-state')
  if (states.length)
    L.push('## 状态', '', ...table(['部件', 'data-state'], states.map(s => [code(s.part), cell(s.value)])), '')
  if (entry.api.length) {
    L.push('## connect API', '', '`getXxxProps()` 返回对应部件的宿主属性，组合式函数与自定义布局用它。', '')
    L.push(...table(['成员', '类型', '说明'], entry.api.map(x => [codeCell(x.name), codeCell(x.type), cell(x.doc)])), '')
  }
  L.push('## 键盘', '')
  if (entry.keyboard.rows.length)
    L.push(...table(['按键', '生效条件', '行为'], entry.keyboard.rows.map(r => [r.keys.map(code).join(' / '), cell(r.when), cell(r.does)])), '')
  else
    L.push('无键盘交互。', '')
  for (const title of ['何时使用', '何时不用', '反模式']) {
    const text = entry.guidance[title]
    if (text)
      L.push(`## ${title}`, '', text, '')
  }
  if (entry.demos.length)
    L.push('## 示例', '', ...entry.demos.map((d, i) => `${i + 1}. ${d.title}${d.description ? `：${d.description}` : ''}（${code(d.src)}）`), '')
  return L.join('\n')
}

export function renderParts(entry: ComponentEntry): string {
  const L = [`# ${entry.title} 的样式钩子`, '']
  L.push(
    '皮肤按部件选择器书写；覆盖样式写进 `@layer xihan.overrides`（无层皮肤时用不低于 `[data-scope][data-part]` 的特异性），',
    '颜色、间距、圆角等只取语义令牌或下面的组件覆盖槽，不写散值。',
    '',
  )
  L.push('## 部件选择器', '')
  const required = new Set(entry.requiredParts)
  L.push(...table(['部件', '选择器', '必需'], entry.parts.map(p => [code(p), code(`[data-scope="${entry.id}"][data-part="${p}"]`), required.has(p) ? '是' : ''])), '')
  if (entry.dataAttributes.length) {
    L.push('## 数据属性', '', '由 connect 写入；条件不成立时不输出。', '')
    L.push(...table(['部件', '属性', '值'], entry.dataAttributes.map(d => [code(d.part), code(d.attr), cell(d.value)])), '')
  }
  if (entry.aria.length) {
    L.push('## ARIA', '', '由 connect 写入，不要手写。', '')
    L.push(...table(['部件', '属性', '值'], entry.aria.map(d => [code(d.part), code(d.attr), cell(d.value)])), '')
  }
  if (entry.componentTokens.length) {
    L.push('## 组件覆盖槽', '', '在组件根或任意祖先上设置即可覆盖，缺省值取后面的令牌。', '')
    L.push(...table(
      ['变量', '部件', '属性', '状态', '缺省'],
      entry.componentTokens.map(t => [code(t.name), t.part.map(code).join(' '), t.property.map(code).join(' '), t.state.map(code).join(' '), t.defaultToken.map(code).join(' ')]),
    ), '')
  }
  else {
    L.push('## 组件覆盖槽', '', '本组件没有专属覆盖槽，外观由语义令牌决定。', '')
  }
  return L.join('\n')
}

export function renderDoc(doc: DocResult): string {
  return doc.markdown
}

export function renderPages(knowledge: Knowledge, pages: readonly PageEntry[]): string {
  const L = [`# XiHan.UI 文档页 · v${knowledge.meta.version}`, '', '组件页用组件标识读取（如 `select`），其余页面用下列路径读取。', '']
  L.push(...table(['路径', '标题', '摘要'], pages.map(p => [code(p.path), cell(p.title), cell(p.summary)])), '')
  return L.join('\n')
}

const FRAMEWORK_LABEL: Record<Framework, string> = { 'vue': 'Vue', 'react': 'React', 'web-components': 'Web Components' }

export function renderDemoList(entry: ComponentEntry): string {
  if (entry.demos.length === 0)
    return `# ${entry.title} 的示例\n\n本组件还没有示例。`
  const L = [`# ${entry.title} 的示例`, '', '按序号或文件基名取源码，写法可选 Vue、React、Web Components。', '']
  L.push(...table(['#', '示例', '标题', '说明'], entry.demos.map((d, i) => [String(i + 1), code(d.src.slice(d.src.indexOf('/') + 1)), cell(d.title), cell(d.description)])), '')
  return L.join('\n')
}

export function renderDemo(result: DemoResult): string {
  const lang = result.framework === 'vue' ? 'vue' : result.framework === 'react' ? 'tsx' : 'html'
  const L = [`# ${result.component.title} · ${result.demo.title}（${FRAMEWORK_LABEL[result.framework]}）`, '']
  if (result.demo.description)
    L.push(result.demo.description, '')
  L.push(`\`\`\`${lang}`, result.source, '```', '')
  return L.join('\n')
}

export function renderTokens(result: TokenResult): string {
  if (result.kind === 'families') {
    const L = ['# 设计令牌族', '', '用关键字查具体令牌（如 `bg-brand`、`shape`、`control-h`），用 component 查某个组件的覆盖槽。', '']
    L.push(...table(['族', '令牌数', '示例前缀'], result.families.map(f => [code(f.family), String(f.count), code(`--xh-${f.family}-*`)])), '')
    return L.join('\n')
  }
  if (result.kind === 'component') {
    const entry = result.component
    if (result.tokens.length === 0)
      return `# ${entry.title} 的覆盖槽\n\n本组件没有专属覆盖槽，外观由语义令牌决定。`
    const L = [`# ${entry.title} 的覆盖槽`, '']
    L.push(...table(
      ['变量', '部件', '属性', '状态', '缺省', '说明'],
      result.tokens.map(t => [code(t.name), t.part.map(code).join(' '), t.property.map(code).join(' '), t.state.map(code).join(' '), t.defaultToken.map(code).join(' '), cell(t.description)]),
    ), '')
    return L.join('\n')
  }
  const L = [`# 令牌 · ${result.query}`, '', '取值是缺省档（浅色 · 舒适 · 基础对比度）下的值；「改写档」是还重新给过它的令牌源（深色、紧凑、高对比度、减弱动效、打印等）。', '']
  if (result.tokens.length) {
    L.push(...table(
      ['令牌', '类型', '取值', '展开后', '改写档'],
      result.tokens.map(t => [code(t.name), t.type, codeCell(t.value), t.resolved === t.value ? '' : codeCell(t.resolved), t.layers.join(' / ') || '—']),
    ), '')
  }
  if (result.tone.length) {
    L.push('## 语气族', '', '只在写了 `data-tone` 的节点及其后代里有取值。', '')
    L.push(...result.tone.map(name => `- ${code(name)}`), '')
  }
  return L.join('\n')
}

export function renderChangelog(sections: readonly ChangelogSection[]): string {
  if (sections.length === 0)
    return '没有匹配的更新条目。'
  return sections.map(s => `## v${s.version}${s.date ? ` (${s.date})` : ''}\n\n${s.body}`).join('\n\n')
}
