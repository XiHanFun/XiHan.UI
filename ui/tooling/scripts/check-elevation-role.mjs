#!/usr/bin/env node
// 门禁：阴影只走海拔角色令牌，且角色与部件对得上。
//
// 三档角色：raised = 静态抬起面（卡片的 elevated 变体、分段控制器的滑块、滑杆拇指）；
// floating = 锚定浮层（下拉、菜单、popover、hover-card、tooltip，它们 portal 到同一落点，投影同深）；
// sheet = 遮罩式与通知（dialog / drawer / toast / tour / floating-panel / float-button / back-top）。
// 皮肤直接引 --xh-shadow-* 原语或给 box-shadow 写字面值，海拔就脱离了层级阶梯。
//
// 允许：var(--xh-elevation-<role>) / 组件槽包着它 / 私有槽 / none / 0 / inset 描边式阴影（focus ring 与分割线那种）。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'

const ROLE = /--xh-elevation-(raised|floating|sheet)\b/
/** 锚定浮层与遮罩面的内容部件该落在哪一档；不在表里的部件只要求走角色令牌。 */
const EXPECTED = {
  floating: new Set(['select', 'combobox', 'cascader', 'tree-select', 'mention', 'popselect', 'menu', 'menubar', 'context-menu', 'popover', 'popconfirm', 'hover-card', 'tooltip', 'time-picker', 'date-picker', 'color-picker', 'navigation-menu', 'side-nav', 'heatmap']),
  sheet: new Set(['dialog', 'drawer', 'toast', 'tour', 'floating-panel', 'float-button', 'back-top', 'image-viewer']),
}

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()
const problems = []
let checked = 0

for (const file of files) {
  const comp = file.replace(/\.css$/, '')
  const src = (await readFile(join(STYLES_DIR, file), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '')
  for (const rule of src.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = rule[1].replace(/\s+/g, ' ').trim()
    for (const decl of rule[2].matchAll(/(?:^|;|\{)\s*(box-shadow|--xh-_[\w-]*shadow[\w-]*)\s*:\s*([^;}]+)/g)) {
      const value = decl[2].trim()
      // 不是海拔的阴影：inset、零偏移的描边式扩散（头像组的描边、聚光灯的环、裁切框外的遮罩）、只引私有槽、兜底 none
      if (value === 'none' || value === '0' || /^inset\b/.test(value) || value.startsWith('0 0 0 ') || /,\s*none\)$/.test(value))
        continue
      // 只引私有槽（或组件槽包着私有槽）的消费点：角色在私有槽的赋值点那里查
      if (/^var\((?:--xh-[a-z0-9-]+,\s*)?var\(--xh-_[\w-]+\)\)$/.test(value) || /^var\(--xh-_[\w-]+\)$/.test(value))
        continue
      checked++
      const role = value.match(ROLE)?.[1]
      if (!role) {
        problems.push(`${file}  ${selector.slice(0, 60)}  ${decl[1]}: ${value.slice(0, 60)}  —— 没走 --xh-elevation-raised / floating / sheet`)
        continue
      }
      const want = EXPECTED.floating.has(comp) ? 'floating' : EXPECTED.sheet.has(comp) ? 'sheet' : null
      const isSurface = /\[data-part='(?:content|positioner|root|panel)'\]/.test(selector)
      if (want && isSurface && role !== want)
        problems.push(`${file}  ${selector.slice(0, 60)}  用了 ${role}，这类面该是 ${want}`)
    }
  }
}

if (problems.length) {
  console.error('[check-elevation-role] ✗ 海拔没按角色走：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('静态抬起面 raised · 锚定浮层 floating · 遮罩式与通知 sheet；原语 --xh-shadow-* 只该由令牌层引用。')
  process.exit(1)
}

console.log(`[check-elevation-role] 通过：${files.length} 份皮肤 · ${checked} 处阴影全部按角色走`)
