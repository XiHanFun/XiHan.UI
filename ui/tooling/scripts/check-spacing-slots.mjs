#!/usr/bin/env node
// 门禁：内衬与间隙必须留一个使用者覆盖槽；槽名不许指向别的部件。
//
// 皮肤是使用者唯一能改样式的口子，改法就是覆盖 --xh-<组件>-<部件>-<属性> 这些槽。
// 一条 padding 直接写 var(--xh-space-3)，使用者要改就只能提高特指度去压整条规则——
// 那等于绕开整套覆盖契约。同一个角色的部件在别的组件里都留了槽（tag 的内衬有、
// badge 的曾经没有），不留的是漏掉而不是有意。
//
// margin 不在此列：本仓的 margin 全是几何补偿（拼接组靠负外边距吃掉相邻描边、
// 标签与必填星之间的固定小位移），不是可调的内衬。
//
// 第二条判据管名字：一个槽的部件段若正好是本组件另一个真实部件的名字，使用者
// 按名字找过去改的就是另一处。number-field 的一体式盒画在 control 上，外观槽却全叫
// --xh-number-field-input-*，而 input 是同一份解剖里另一个真实部件。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'
const HEADLESS = 'packages/engine/headless/src'

/** 受管属性 → 槽名后缀。 */
const SUFFIX = {
  'padding': 'padding',
  'padding-block': 'py',
  'padding-inline': 'px',
  'padding-block-start': 'pt',
  'padding-block-end': 'pb',
  'padding-inline-start': 'ps',
  'padding-inline-end': 'pe',
  'gap': 'gap',
  'row-gap': 'row-gap',
  'column-gap': 'column-gap',
}

/**
 * 名字判据的登记：跨部件读取那个槽是有意的，逐条写明理由。
 * 键是 `<组件>.<槽名的部件段>`，值是允许读到它的部件。
 */
const CROSS_PART = {
  // 搜索结果列表与空态占的都是一格列的位置，几何跟着 column 走，三种形态才等宽等高
  'cascader.column': ['search-list', 'empty'],
  // 勾选框画在 trigger 上，checkbox-group 没有单独的 indicator 节点承载它
  'checkbox-group.indicator': ['trigger'],
  // --xh-code-view-line-height 是整块代码的行距，line 只是它头一个词，与行部件无关
  'code-view.line': ['pre'],
  // 折叠条与文件头是同一条横栏的两端，描边与字号取同一族才连成一条
  'code-view.header': ['fold-trigger'],
  // 条目是两列网格，第一列的宽度与列间距由它自己排，槽按被排的那一列取名
  'descriptions.label': ['item'],
  // 横排布局下标签的上下留白由控件高度算出来，算的就是「与控件首行对齐」这件事
  'field.control': ['label'],
  // 空态条与截断提示条与表头同一档字号，三条并排时字号一致才读得成一行
  'diff-view.header': ['empty', 'truncation'],
  // 并排视图里空的那一侧铺的就是空态底色，两处不同源会在同一屏上出现两种空白
  'diff-view.empty': ['line-content'],
  // 图例里那几个方块就是格子本身的缩略，形状与底色同源才对得上图上的深浅
  'heatmap.cell': ['legend-item'],
  // 每页条数下拉与页码钮并排在同一行，盒型取同一族才平齐
  'pagination.item': ['page-size-select'],
  // 星星之间的间距由装它们的那一行排
  'rating.item': ['control'],
  // 外壳与面板是同一片面的两种形态（单面板直接画在 content 上、多面板共用 viewport），
  // 底、描边与落影必须同源，否则两种形态并存时看得出接缝
  'navigation-menu.content': ['viewport'],
  // 竖排时连接线要缩进到序号圆点的中轴上，位移由圆点直径与触发区内衬算出来
  'steps.indicator': ['separator'],
  'steps.trigger': ['separator'],
  // 行的分隔线由单元格各自画：行盒本身不画边，画了就与单元格的边叠成两道
  'table.row': ['cell'],
  // 表头单元格铺的就是表头那一行的底色，两处不同源就会在吸顶时看出色差
  'table.header': ['column-header'],
  // 预设列与时间列并排在同一行，分隔线取同一族，两列之间只有一道等宽的线
  'time-picker.column': ['presets'],
  // 名字用等宽字族，摘要行里跟着它排；耗时与错误行与状态标签同一档字号
  'tool-call.name': ['summary'],
  'tool-call.status': ['duration', 'error'],
}

/** 注释挖空但保留换行。 */
const strip = css => css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))

/**
 * 取值里没有被别的 var() 包住的那些槽名。
 * 嵌在兜底位上的是旧名（加法式改名把旧名留在新名后面当默认值），不算使用者读到的名字。
 */
function outerVars(value) {
  const names = []
  const stack = []
  for (let i = 0; i < value.length; i += 1) {
    if (value[i] === '(') {
      const isVar = value.slice(Math.max(0, i - 3), i + 1) === 'var('
      if (isVar && !stack.includes(true)) {
        const name = /^var\(\s*(--[\w-]+)/.exec(value.slice(i - 3))?.[1]
        if (name)
          names.push(name)
      }
      stack.push(isVar)
    }
    else if (value[i] === ')') {
      stack.pop()
    }
  }
  return names
}

/** 各组件解剖里声明的部件名。 */
const anatomies = new Map()
for (const entry of await readdir(HEADLESS, { withFileTypes: true })) {
  if (!entry.isDirectory())
    continue
  let src
  try {
    src = await readFile(join(HEADLESS, entry.name, `${entry.name}.anatomy.ts`), 'utf8')
  }
  catch {
    continue
  }
  const list = /createAnatomy\([^,]+,\s*\[([\s\S]*?)\]/.exec(src)?.[1] ?? ''
  anatomies.set(entry.name, new Set([...list.matchAll(/'([a-z][a-z0-9-]*)'/g)].map(m => m[1])))
}

const problems = []
const misnamed = []
/** CROSS_PART 里真正被读到的条目，用来反查死登记。 */
const usedShared = new Set()
let withSlot = 0
let checkedNames = 0

for (const file of (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()) {
  const src = strip(await readFile(join(STYLES_DIR, file), 'utf8'))
  const comp = file.replace(/\.css$/, '')
  const anatomy = anatomies.get(comp)
  const rules = [...src.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  const lineOf = index => src.slice(0, index).split('\n').length

  for (const rule of rules) {
    const [, selector, body] = rule
    const parts = [...selector.matchAll(/data-part='([a-z-]+)'/g)].map(x => x[1])
    // 冒号后不写 \s*：它与 [^;]+ 能吃同一批字符，不匹配时会逐位回溯。值交给 trim 归一
    for (const declaration of body.matchAll(/([\w-]+)\s*:([^;]+);/g)) {
      const [, prop, value] = declaration
      const suffix = SUFFIX[prop]
      const v = value.trim()

      if (suffix && /var\(--xh-/.test(v)) {
        // 有口子 = 取值链的第一个 var() 是私有槽或本组件的使用者槽
        const first = /var\(\s*(--xh-[\w-]+)/.exec(v)?.[1] ?? ''
        if (first.startsWith('--xh-_') || first.startsWith(`--xh-${comp}-`)) {
          withSlot += 1
        }
        // 部件认不出来的（纯 scope 选择器、共享皮肤）不下判断
        else if (parts.length) {
          const part = parts.at(-1)
          const slot = part === 'root' ? `--xh-${comp}-${suffix}` : `--xh-${comp}-${part}-${suffix}`
          problems.push(`${file}  ${selector.replace(/\s+/g, ' ').trim().slice(0, 70)}  ${prop}: ${v}\n      改成 var(${slot}, ${v})`)
        }
      }

      // —— 名字判据 ——
      // root 除外：它往下发的槽本就是给后代部件用的
      const inner = parts.at(-1)
      if (!anatomy || !inner || inner === 'root')
        continue
      for (const name of outerVars(v)) {
        if (!name.startsWith(`--xh-${comp}-`))
          continue
        const rest = name.slice(`--xh-${comp}-`.length).split('-')
        // 取最长的、确实是本组件部件名的前导段
        let segment = ''
        for (let end = 1; end <= rest.length; end += 1) {
          const candidate = rest.slice(0, end).join('-')
          if (anatomy.has(candidate))
            segment = candidate
        }
        if (!segment || segment === 'root')
          continue
        checkedNames += 1
        // 槽名指的就是这条规则作用到的部件，或它的一个子部件
        if (parts.includes(segment) || inner.startsWith(`${segment}-`))
          continue
        if (CROSS_PART[`${comp}.${segment}`]?.includes(inner)) {
          usedShared.add(`${comp}.${segment} ${inner}`)
          continue
        }
        misnamed.push(`${file}:${lineOf(rule.index + rule[0].indexOf(declaration[0]))}  ${prop}: ${name}\n      规则作用在 ${inner} 上，槽名却指向部件 ${segment}`)
      }
    }
  }
}

// 登记过期就得删：留着等于给未来同名的走样预签一张免检
const dead = []
for (const [key, parts] of Object.entries(CROSS_PART)) {
  for (const part of parts) {
    if (!usedShared.has(`${key} ${part}`))
      dead.push(`${key} → ${part}`)
  }
}

if (problems.length) {
  console.error('[check-spacing-slots] ✗ 内衬 / 间隙没有使用者覆盖槽：')
  for (const problem of problems)
    console.error(`  ${problem}`)
}

if (misnamed.length) {
  console.error('[check-spacing-slots] ✗ 槽名的部件段指向别的部件：')
  for (const item of misnamed)
    console.error(`  ${item}`)
  console.error('  改法：加一个按本部件取名的新槽排在外层，旧名留在它的兜底位上；')
  console.error('  确实是几处共用同一族取值的，写进 CROSS_PART 并说明共用的理由。')
}

if (dead.length) {
  console.error('[check-spacing-slots] ✗ CROSS_PART 里这些条目已经没有对应的规则，删掉：')
  for (const item of dead)
    console.error(`  ${item}`)
}

if (problems.length || misnamed.length || dead.length)
  process.exit(1)

console.log(`[check-spacing-slots] 通过：${withSlot} 处内衬 / 间隙都经使用者覆盖槽或私有槽（margin 是几何补偿，不在此列）；${checkedNames} 处槽名的部件段与所在部件对得上，${usedShared.size} 处共用同族已登记`)
