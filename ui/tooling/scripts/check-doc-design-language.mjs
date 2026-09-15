#!/usr/bin/env node
// 门禁：组件文档的展示外壳与组件库共用一套视觉语言。
//
// 组件皮肤已经由 shape / elevation / motion / focus 等门禁逐份检查；文档主题位于
// ui/ 之外，stylelint 与这些门禁都扫不到。结果是组件本体使用 4/8/12px、120/200ms
// 与语义海拔，包住它的示例框和总览卡片却另写 14/18px、150/200ms 与私有阴影，
// 用户看到的仍是两套系统。本检查只管承载全部组件示例的公共展示层，不扫描单个示例。
import { readFile } from 'node:fs/promises'

const ROOT = '../docs/.vitepress/theme'
const FILES = [
  'XhComponentCard.vue',
  'XhDemo.vue',
  'XhFrameworkSwitch.vue',
  'XhStageAxes.vue',
  'overrides.css',
  'vars.css',
]

const sources = new Map()
for (const file of FILES)
  sources.set(file, await readFile(`${ROOT}/${file}`, 'utf8'))

const problems = []

function lineOf(source, index) {
  return source.slice(0, index).split('\n').length
}

function report(file, source, match, message) {
  problems.push(`${file}:${lineOf(source, match.index)}  ${message}`)
}

for (const [file, source] of sources) {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, '')

  for (const match of css.matchAll(/border-radius\s*:\s*([^;\n}]+)/g)) {
    const value = match[1].trim()
    if (value === '0' || /var\(--xh-shape-(?:inset|control|surface|overlay|circle|pill)\)/.test(value))
      continue
    report(file, source, match, `圆角 ${value} 没有走 --xh-shape-* 语义身份`)
  }

  for (const match of css.matchAll(/(?:transition|animation)(?:-[a-z-]+)?\s*:\s*([^;\n}]+)/g)) {
    const value = match[1].trim()
    if (!/(?<![-\w])\d+(?:\.\d+)?m?s\b|\bcubic-bezier\(|(?<![-\w])(?:ease|ease-in|ease-out|ease-in-out|linear)\b/.test(value))
      continue
    report(file, source, match, `动效 ${value} 含字面时长或曲线，应走 --xh-motion-*`)
  }

  for (const match of css.matchAll(/box-shadow\s*:\s*([^;\n}]+)/g)) {
    const value = match[1].trim()
    if (value === 'none' || /var\(--xh-elevation-(?:raised|lifted|floating|sheet)\)/.test(value))
      continue
    report(file, source, match, `阴影 ${value} 没有走 --xh-elevation-* 层级`)
  }
}

const vars = sources.get('vars.css')
const requiredAliases = {
  '--xh-doc-accent': '--xh-fg-brand',
  '--xh-doc-ink': '--xh-fg-default',
  '--xh-doc-muted': '--xh-fg-muted',
  '--xh-doc-canvas': '--xh-bg-page',
  '--xh-doc-surface': '--xh-bg-surface',
  '--xh-doc-surface-2': '--xh-bg-subtle',
  '--xh-doc-surface-3': '--xh-bg-subtle-hover',
  '--xh-doc-border': '--xh-border-default',
}
for (const [name, token] of Object.entries(requiredAliases)) {
  if (!vars.includes(`${name}: var(${token});`))
    problems.push(`vars.css:1  ${name} 应直接映射 ${token}，文档展示面才与组件主题同步`)
}

const focusContracts = [
  ['XhDemo.vue', '.xh-demo__btn:focus-visible'],
  ['XhFrameworkSwitch.vue', '.xh-framework__item:focus-visible'],
  ['XhStageAxes.vue', '.xh-axes__select:focus-visible'],
  ['XhStageAxes.vue', '.xh-axes__reset:focus-visible'],
  ['overrides.css', '.xh-resource-links a:focus-visible'],
]
for (const [file, selector] of focusContracts) {
  const source = sources.get(file)
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const block = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`).exec(source)?.[1] ?? ''
  for (const token of ['--xh-ring-width', '--xh-ring-focus', '--xh-ring-offset']) {
    if (!block.includes(token))
      problems.push(`${file}:1  ${selector} 缺少 ${token}，文档控制与组件焦点环不一致`)
  }
}

if (problems.length) {
  console.error(`[check-doc-design-language] ✗ ${problems.length} 处文档展示面脱离设计真源：`)
  for (const problem of problems)
    console.error(`  ${problem}`)
  process.exit(1)
}

console.log(`[check-doc-design-language] 通过：${FILES.length} 份公共展示文件共用语义表面、形状、海拔、焦点与动效`)
