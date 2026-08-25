#!/usr/bin/env node
// 门禁：阴影只走海拔角色令牌，且角色与部件对得上。
//
// 三档角色：raised = 静态抬起面（卡片的 elevated 变体、分段控制器的滑块、滑杆拇指）；
// floating = 锚定浮层（下拉、菜单、popover、hover-card、tooltip，它们 portal 到同一落点，投影同深）；
// sheet = 遮罩式与通知（dialog / drawer / toast / tour / floating-panel / float-button / back-top）。
// 皮肤直接引 --xh-shadow-* 原语或给 box-shadow 写字面值，海拔就脱离了层级阶梯。
//
// 允许：组件槽包着角色令牌 / 私有槽 / none / 0 / inset 描边式阴影（focus ring 与分割线那种）。
// box-shadow 直接写 var(--xh-elevation-<role>) 也拦：使用者没有槽可以改这块面的投影，
// 其余皮肤都留了 var(--xh-<组件>-…-shadow, var(--xh-elevation-<role>))，这里不许例外。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'

const ROLE = /--xh-elevation-(raised|floating|sheet)\b/
/** 使用者槽包着角色令牌：var(--xh-<组件>-…, var(--xh-elevation-<role>)) */
const SLOTTED = /^var\(--xh-[a-z][a-z0-9-]*,\s*var\(--xh-elevation-(?:raised|floating|sheet)\)\)$/
/** 锚定浮层与遮罩面的内容部件该落在哪一档；不在表里的部件只要求走角色令牌。 */
/**
 * 哪个组件的哪个部件该是哪一档。
 *
 * 从前这里只登记组件名，"哪个部件算面"交给一句
 * `[data-part='(content|positioner|root|panel)']` 的正则去猜——猜漏的（side-nav 的
 * branch-content、heatmap 的 tooltip、thread 的 scroll-button）就整个不受管，
 * 而登记了却早已没有任何海拔的（image-viewer）也没人发现。
 * 改成逐部件登记，两个方向都查得出来：登了没有即死登记，有了没登即漏管。
 */
const EXPECTED = {
  floating: {
    'cascader': ['content'],
    'color-picker': ['content'],
    'combobox': ['content', 'empty'],
    'context-menu': ['content'],
    'date-picker': ['content'],
    'heatmap': ['tooltip'],
    'hover-card': ['content'],
    'mention': ['content'],
    'menu': ['content'],
    'menubar': ['content'],
    'navigation-menu': ['content', 'viewport'],
    'popconfirm': ['content'],
    'popover': ['content'],
    'popselect': ['content'],
    'select': ['content'],
    'side-nav': ['branch-content'],
    'time-picker': ['content'],
    'tooltip': ['content'],
    'tree-select': ['content'],
  },
  sheet: {
    'back-top': ['trigger'],
    'dialog': ['content'],
    'drawer': ['content'],
    'float-button': ['trigger'],
    'floating-panel': ['content'],
    'notification': ['item'],
    'thread': ['scroll-button'],
    'toast': ['root'],
    'tour': ['content'],
  },
}

/** 见到的 `角色/组件/部件`，用于反查死登记。 */
const seenRoles = new Set()

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
      if (decl[1] === 'box-shadow' && !SLOTTED.test(value))
        problems.push(`${file}  ${selector.slice(0, 60)}  box-shadow: ${value.slice(0, 60)}  —— 没给使用者留 --xh-<组件>-…-shadow 槽`)
      // 这条规则落在哪个部件上：取选择器里最后一个 data-part，那才是被样式作用的那个
      const part = [...selector.matchAll(/\[data-part='([a-z0-9-]+)'\]/g)].map(m => m[1]).at(-1)
      if (!part)
        continue
      seenRoles.add(`${role}/${comp}/${part}`)
      const want = EXPECTED.floating[comp]?.includes(part)
        ? 'floating'
        : EXPECTED.sheet[comp]?.includes(part) ? 'sheet' : null
      if (want && role !== want)
        problems.push(`${file}  ${selector.slice(0, 60)}  用了 ${role}，这个面该是 ${want}`)
      // 登记过这个组件、这次却落在没登记的部件上：要么补登，要么那一处不该用面档
      const registered = EXPECTED.floating[comp] ?? EXPECTED.sheet[comp]
      if (!want && registered && role !== 'raised') {
        problems.push(
          `${file}  ${selector.slice(0, 60)}  ${comp} 的 ${part} 用了 ${role} 却没登记——`
          + `补进 EXPECTED，或改用 raised（它不是一个面）`,
        )
      }
    }
  }
}

// 死登记反查：登了却一处也没出现
for (const [role, byComp] of Object.entries(EXPECTED)) {
  for (const [comp, parts] of Object.entries(byComp)) {
    for (const part of parts) {
      if (!seenRoles.has(`${role}/${comp}/${part}`))
        problems.push(`EXPECTED.${role} 里登着 ${comp} 的 ${part}，但那里根本没有这一档海拔——名单过期`)
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
