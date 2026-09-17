#!/usr/bin/env node
// 门禁：阴影只走海拔角色令牌，且角色与部件对得上。
//
// 四档角色：raised = 静态抬起面（卡片、分段控制器的滑块、静止的滑杆拇指）；
// lifted = 被指针拎起、正跟着手走的东西（拖动中的滑杆拇指），比 raised 高一档、不到 floating；
// floating = 锚定浮层（下拉、菜单、popover、hover-card、tooltip，它们 portal 到同一落点，投影同深）；
// sheet = 遮罩式与通知（dialog / drawer / toast / tour）；浮动面板与悬浮动作走 M2 frosted。
// 皮肤直接引 --xh-shadow-* 原语或给 box-shadow 写字面值，海拔就脱离了层级阶梯。
//
// 允许：组件槽包着角色令牌 / 私有槽 / none / 0 / inset 描边式阴影（focus ring 与分割线那种）。
// box-shadow 直接写 var(--xh-elevation-<role>) 也拦：使用者没有槽可以改这块面的投影，
// 其余皮肤都留了 var(--xh-<组件>-…-shadow, var(--xh-elevation-<role>))，这里不许例外。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { openBacklog } from './lib/family-backlog.mjs'
import { colorPositionOf, innermost } from './lib/skin-rules.mjs'

const STYLES_DIR = 'packages/design/styles/css'

const ROLE = /--xh-elevation-(raised|lifted|floating|sheet)\b/
// M1 是内容面贴地接触影，独立于浮层海拔；只允许在已登记的消费部件使用。
const MATERIAL_SOFT = /--xh-material-soft-shadow\b/
// M2 是锚定浮层的材质配方，海拔等价于 floating；单列名字才能拦住组件退回普通实体投影。
const MATERIAL_FROSTED = /--xh-material-frosted-(?:compact-)?shadow\b/
// M4 是 sheet 级遮罩式高层面（sheet = material-elevated 三件套：-bg / -border / -shadow，§8.4）；
// 只允许逐件登记过的部件消费，未迁移的 sheet 面仍走 --xh-elevation-sheet，随各组件迁移逐件补登。
const MATERIAL_ELEVATED = /--xh-material-elevated-shadow\b/
/** 已迁到 material-elevated 三件套的 sheet 面：`组件/部件`。 */
const ELEVATED_CONSUMERS = new Set(['dialog/content', 'toast/root', 'notification/item', 'layout/sider'])
/**
 * 使用者槽包着角色令牌：var(--xh-<组件>-…, var(--xh-elevation-<role>))。
 * 允许套多层：加法式改名把新槽名排在外层、旧名留在它的兜底位上，链因此不止一层。
 */
const SLOTTED = /^var\((?:--xh-[a-z][a-z0-9-]*,\s*var\()+--xh-elevation-(?:raised|lifted|floating|sheet)\)+$/
/**
 * 哪个组件的哪个部件该是哪几档：`组件 → 部件 → 允许的角色`。
 *
 * 从前这里只登记组件名，"哪个部件算面"交给一句
 * `[data-part='(content|positioner|root|panel)']` 的正则去猜——猜漏的（side-nav 的
 * branch-content、heatmap 的 tooltip）就整个不受管，
 * 而登记了却早已没有任何海拔的（image-viewer）也没人发现。
 * 改成逐部件登记，两个方向都查得出来：登了没有即死登记，有了没登即漏管。
 *
 * 值是数组：同一个部件在不同状态下换档的（滑杆拇指静态一档、拖动中另一档）逐档登记，
 * 每一档都要在皮肤里真出现，否则算死登记。
 *
 * raised 同样逐部件登记（真源 §8）：它只给 Card 与可抬起 / 可拖起的部件，且描边必须在——
 * raised 所在规则块（或同部件基础块）必须声明 border，颜色位落 --xh-border-default /
 * --xh-material-solid-border；影只是加成，不作边界。存量的 raised 记在 family-backlog.json
 * edge 段（键 组件:部件:raised），随各组件迁移逐条删除。
 */
const EXPECTED = {
  'back-top': { root: ['frosted'] },
  'button': { root: ['soft', 'raised'] },
  'card': { root: ['raised'] },
  'color-picker': { 'content': ['frosted'], 'area-thumb': ['raised'] },
  'segmented': { indicator: ['raised'] },
  'sortable': { item: ['raised'] },
  'checkbox': { root: ['soft'] },
  'checkbox-group': { 'root': ['soft'], 'select-all-trigger': ['soft'] },
  'cascader': { content: ['frosted'] },
  'combobox': { content: ['frosted'] },
  // 命令面板是盖在页面上、带遮罩的一面，与对话框同档
  'command': { content: ['sheet'] },
  'context-menu': { content: ['frosted'] },
  // 含日历网格与时间列的锚定面板：floating（实体底 + border-default + elevation-floating，§8.4）
  'date-picker': { content: ['floating'] },
  // 含两张日历网格的锚定面板：floating（§8.4）
  'date-range-picker': { content: ['floating'] },
  'dialog': { content: ['sheet'] },
  'drawer': { content: ['sheet'] },
  'float-button': { root: ['frosted'] },
  'floating-panel': { content: ['frosted'] },
  // 网格里跟着格子走的反白详情条：与 Tooltip 同一副气泡，描边 + frosted 紧凑影（§8.4）
  'heatmap': { tooltip: ['frosted'] },
  // 浮在视口一角的回底钮：与 back-top / float-button 同属角落浮钮族，走 frosted 四件套
  'log': { 'scroll-to-end-trigger': ['frosted'] },
  'message-feed': { 'scroll-to-end-trigger': ['frosted'] },
  'hover-card': { content: ['frosted'] },
  // 覆盖档的侧栏是盖在内容之上、带遮罩的一面，与抽屉同档；占位档的侧栏不画投影
  'layout': { sider: ['sheet'] },
  'mention': { content: ['frosted'] },
  'menu': { content: ['frosted'] },
  'menubar': { content: ['frosted'] },
  'navigation-menu': { content: ['floating'], viewport: ['floating'] },
  'notification': { item: ['sheet'] },
  // 摊开的页码面板是锚在省略号上的浮层：有 positioner、有 pop-in 进场、吃 --xh-overlay-max-h
  'pagination': { content: ['floating'] },
  'popconfirm': { 'content': ['frosted'], 'confirm-trigger': ['soft'], 'cancel-trigger': ['soft'] },
  'popover': { content: ['frosted'] },
  'select': { content: ['frosted'] },
  'side-nav': { 'branch-content': ['floating'] },
  // 拇指静止时是 raised，带 data-dragging 的那一档走 lifted：跟着手走的元素抬高一档，
  // 又不与下拉面板同深
  'slider': { thumb: ['raised', 'lifted'] },
  'color-slider': { thumb: ['raised', 'lifted'] },
  'switch': { thumb: ['soft', 'raised'] },
  'tag': { root: ['soft'] },
  // 含时分秒多列的锚定面板：floating（§8.4）
  'time-picker': { content: ['floating'] },
  // 两组时列并排的锚定面板：floating（§8.4）
  'time-range-picker': { content: ['floating'] },
  'toast': { root: ['sheet'] },
  'tooltip': { content: ['frosted'] },
  'tour': { content: ['sheet'] },
  'tree-select': { content: ['frosted'] },
}

/** 见到的 `组件/部件/角色`，用于反查死登记。 */
const seenRoles = new Set()
/** raised 退役的存量：登在 edge 段、键以 :raised 结尾的那些。 */
const backlog = await openBacklog('edge', { owns: key => key.endsWith(':raised') })
/** raised 的描边必须是这两种边色之一。 */
const RAISED_BORDER = new Set(['--xh-border-default', '--xh-material-solid-border'])

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()
const problems = [...backlog.problems]
let checked = 0

for (const file of files) {
  const comp = file.replace(/\.css$/, '')
  const src = (await readFile(join(STYLES_DIR, file), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '')
  const allRules = [...src.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(rule => ({
    selector: rule[1].replace(/\s+/g, ' ').trim(),
    body: rule[2],
  }))
  /** 一块规则里 border 简写 / border-color 的颜色位（最内层）；没写返回 null。 */
  const borderOf = (body) => {
    let token = null
    for (const decl of body.matchAll(/(?:^|;)\s*(border|border-color)\s*:\s*([^;}]+)/g))
      token = innermost(decl[1] === 'border' ? colorPositionOf(decl[2].trim()) : decl[2].trim())
    return token
  }
  /** 同部件基础块（主体只有 scope + part）的边色。 */
  const baseBorderOf = (part) => {
    const base = allRules.find(r => r.selector === `[data-scope='${comp}'][data-part='${part}']`)
    return base ? borderOf(base.body) : null
  }
  for (const rule of src.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = rule[1].replace(/\s+/g, ' ').trim()
    for (const decl of rule[2].matchAll(/(?:^|;|\{)\s*(box-shadow|--xh-_[\w-]*shadow[\w-]*)\s*:\s*([^;}]+)/g)) {
      const value = decl[2].trim()
      // 不是海拔的阴影：inset、零偏移的描边式扩散（头像组的描边、聚光灯的环、裁切框外的遮罩）、只引私有槽、
      // 兜底 none，以及使用者槽兜底「0 0 0 transparent」的零影占位（无影面要与语气色条叠成一条 box-shadow 时的写法）
      if (value === 'none' || value === '0' || /^inset\b/.test(value) || value.startsWith('0 0 0 ') || /,\s*(?:none|0 0 0 transparent)\)$/.test(value))
        continue
      // 只引私有槽（或组件槽包着私有槽）的消费点：角色在私有槽的赋值点那里查
      if (/^var\((?:--xh-[a-z0-9-]+,\s*var\()*--xh-_[\w-]+\)+$/.test(value))
        continue
      checked++
      // 这条规则落在哪个部件上：取选择器里最后一个 data-part，那才是被样式作用的那个
      const part = [...selector.matchAll(/\[data-part='([a-z0-9-]+)'\]/g)].map(m => m[1]).at(-1)
      const isElevated = MATERIAL_ELEVATED.test(value)
      if (isElevated && !ELEVATED_CONSUMERS.has(`${comp}/${part}`)) {
        problems.push(`${file}  ${selector.slice(0, 60)}  M4 Elevated sheet 尚未登记给 ${comp} 的 ${part ?? '未知部件'}——迁到三件套后补进 ELEVATED_CONSUMERS`)
        continue
      }
      const role = MATERIAL_SOFT.test(value)
        ? 'soft'
        : MATERIAL_FROSTED.test(value)
          ? 'frosted'
          : isElevated
            ? 'sheet'
            : value.match(ROLE)?.[1]
      if (!role) {
        problems.push(`${file}  ${selector.slice(0, 60)}  ${decl[1]}: ${value.slice(0, 60)}  —— 没走 --xh-elevation-raised / floating / sheet 或已登记材质投影`)
        continue
      }
      if (decl[1] === 'box-shadow' && !SLOTTED.test(value)
        && !/^var\(--xh-[a-z][a-z0-9-]*,\s*var\(--xh-material-(?:soft|frosted(?:-compact)?|elevated)-shadow\)\)$/.test(value)) {
        problems.push(`${file}  ${selector.slice(0, 60)}  box-shadow: ${value.slice(0, 60)}  —— 没给使用者留 --xh-<组件>-…-shadow 槽`)
      }
      if (!part)
        continue
      seenRoles.add(`${comp}/${part}/${role}`)
      const want = EXPECTED[comp]?.[part]
      if (want) {
        if (!want.includes(role)) {
          if (!(role === 'raised' && backlog.excuse(`${comp}:${part}:raised`)))
            problems.push(`${file}  ${selector.slice(0, 60)}  用了 ${role}，这个面该是 ${want.join(' 或 ')}`)
        }
        else if (role === 'raised') {
          // raised 必带描边：本块没写 border 就看同部件基础块，颜色位得是 border-default 系
          const border = borderOf(rule[2]) ?? baseBorderOf(part)
          if (border == null || !RAISED_BORDER.has(border)) {
            if (!backlog.excuse(`${comp}:${part}:raised`))
              problems.push(`${file}  ${selector.slice(0, 60)}  ${comp} 的 ${part} 用了 raised，描边却是 ${border ?? '（没写 border）'}——raised 面必带 --xh-border-default 描边，影只是加成`)
          }
        }
      }
      // 没登记过的部件用了面档：要么补登，要么那一处不该用面档。
      // 判据不看这个组件在表里有没有别的条目——一个组件一条都没登记时也照查，
      // 否则整份皮肤只要不登记就整个不受管（slider 与 pagination 曾这样落在盲区里）
      else if (role === 'raised') {
        if (!backlog.excuse(`${comp}:${part}:raised`)) {
          problems.push(
            `${file}  ${selector.slice(0, 60)}  ${comp} 的 ${part} 用了 raised 却没登记——`
            + `raised 只给 Card 与可抬起 / 可拖起部件，逐部件登进 EXPECTED 并带 --xh-border-default 描边；不是的改成描边面（§8.3）`,
          )
        }
      }
      else {
        problems.push(
          `${file}  ${selector.slice(0, 60)}  ${comp} 的 ${part} 用了 ${role} 却没登记——`
          + `补进 EXPECTED`,
        )
      }
    }
  }
}

problems.push(...backlog.stale())

// 死登记反查：登了却一处也没出现
let registrations = 0
for (const [comp, byPart] of Object.entries(EXPECTED)) {
  for (const [part, roles] of Object.entries(byPart)) {
    for (const role of roles) {
      registrations++
      if (!seenRoles.has(`${comp}/${part}/${role}`))
        problems.push(`EXPECTED 里登着 ${comp} 的 ${part} 用 ${role}，但那里根本没有这一档海拔——名单过期，删掉这一档`)
    }
  }
}

if (problems.length) {
  console.error('[check-elevation-role] ✗ 海拔没按角色走：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('静态抬起面 raised · M1 内容面 soft · M2 锚定浮层 frosted · 遮罩式与通知 sheet；原语 --xh-shadow-* 只该由令牌层引用。')
  process.exit(1)
}

console.log(`[check-elevation-role] 通过：${files.length} 份皮肤 · ${checked} 处阴影全部按角色走（${registrations} 条逐部件登记，每一处都在其中；raised 退役待办 ${backlog.pending} 条，无过期豁免）`)
