#!/usr/bin/env node
// 门禁：输入与选择族的「盒」结构逐条同构。
//
// 盒 = 画描边、底色、圆角、控件高度、行内内衬的那一层，也是聚焦环落的那一层。
// 一族十六个控件，盒是哪个部件、盒内谁占满剩余宽度、尾部动作钮多大、聚焦环画在哪、不传尺寸时多宽，
// 五件事各自散开就会长成十六种做法：✕ 有的靠右有的紧跟文字，钮有的 24px 有的跟控件一样高，
// 宽有的随内容走有的钉死。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'
const FAMILY_DIR = 'packages/design/styles/family'
const HEADLESS_DIR = 'packages/engine/headless/src'

/** 受管辖的输入与选择族。 */
const COMPONENTS = [
  'select',
  'cascader',
  'tree-select',
  'color-picker',
  'combobox',
  'text-field',
  'color-field',
  'number-field',
  'password-input',
  'tags-input',
  'date-field',
  'time-field',
  'date-picker',
  'date-range-picker',
  'time-picker',
  'time-range-picker',
  'mention',
  'pin-input',
]

/**
 * 单元素控件：盒就是那个 input 自己，里面没有并排的子节点。
 * 只在解剖里没有 control 时生效——补上 control 之后盒换人，整套并排规则重新受管。
 * 解剖里有 control 的组件登在这里等于一条走不到的死登记，会被下面的名单核验报出来。
 */
const SINGLE_ELEMENT = {
  'mention': '单行 input 自身即视觉盒（自身投影 Field Chrome），没有尾钮',
  'pin-input': '每格一个 input 即视觉盒（自身投影 Field Chrome），格与格之间由 root 排布',
}

/** 盒内的内容区：占满剩余宽度、把尾钮顶到最右的那个部件。 */
const CONTENT_PARTS = new Set(['input', 'value-text', 'segment-group'])

/**
 * trigger 在两类控件里是两种角色：
 * 下拉族的 trigger 是那颗装着值与箭头的按钮，它就是内容区；
 * 可输入控件（combobox / date-picker / time-picker）的 trigger 是右侧那颗展开小钮，属尾钮。
 */
const TRIGGER_IS_CONTENT = new Set(['select', 'cascader', 'tree-select', 'color-picker'])

/**
 * 按模式二选一的内容区：同一时刻只有一个撑开，另一个由连接层带 hidden，或收成定宽（flex: none）让位。
 * 登记的是这一对部件与理由，两者各自仍须是盒里唯一撑开的那一个。
 */
const ALTERNATE_CONTENT = {
  'date-picker': { parts: ['segment-group', 'tag-list'], why: '单选是一组段位、多选是一行标签，按 selectionMode 二选一' },
  'time-picker': { parts: ['segment-group', 'tag-list'], why: '同 date-picker' },
  'color-picker': { parts: ['trigger', 'tag-list'], why: '单选是装着色块与值串的触发钮撑满盒；多选是一行标签，触发钮只剩色块、收成定宽让位' },
}

/** 内容区里还能再套一层撑开的文字区：下拉族的 value-text 长在 trigger 里面。 */
const NESTED_CONTENT = new Set(['value-text'])

/** 盒内的尾部动作钮。 */
const ACTION_PARTS = ['clear-trigger', 'trigger', 'visibility-trigger', 'eye-dropper-trigger', 'increment-trigger', 'decrement-trigger']

/** 已迁到共享 Field Chrome / Action Control 的组件；这里登记的是可验证的家族接线，不是放行名单。 */
const SHARED_FAMILY = {
  'text-field': {
    boxSelector: '[data-xh-field-chrome]',
    contentSelector: '[data-xh-field-input]',
    actionParts: new Set(['clear-trigger']),
  },
  'color-field': {
    boxSelector: '[data-xh-field-chrome]',
    contentSelector: '[data-xh-field-input]',
    actionParts: new Set(['clear-trigger']),
  },
  'number-field': {
    boxSelector: '[data-xh-field-chrome]',
    contentSelector: '[data-xh-field-input]',
    actionParts: new Set(['increment-trigger', 'decrement-trigger']),
  },
  'password-input': {
    boxSelector: '[data-xh-field-chrome]',
    contentSelector: '[data-xh-field-input]',
    actionParts: new Set(['visibility-trigger']),
  },
  // 分段框：段位是 div 而非原生输入，内容区是 segment-group 自己的解剖部件，不投影 data-xh-field-input
  'date-field': {
    boxSelector: '[data-xh-field-chrome]',
    contentSelector: `[data-scope='date-field'][data-part='segment-group']`,
    actionParts: new Set(['clear-trigger']),
  },
  'time-field': {
    boxSelector: '[data-xh-field-chrome]',
    contentSelector: `[data-scope='time-field'][data-part='segment-group']`,
    actionParts: new Set(['clear-trigger']),
  },
  'tags-input': {
    boxSelector: '[data-xh-field-chrome]',
    contentSelector: '[data-xh-field-input]',
    actionParts: new Set(['clear-trigger']),
  },
  // 可输入的组合框：展开小钮与清空钮都是盒内尾钮，同走 field-inset 档
  'combobox': {
    boxSelector: '[data-xh-field-chrome]',
    contentSelector: '[data-xh-field-input]',
    actionParts: new Set(['trigger', 'clear-trigger']),
  },
  // 下拉族：内容区是撑满盒的 trigger 按钮（自己的解剖部件，不是原生输入），尾钮只有清空钮
  'select': {
    boxSelector: '[data-xh-field-chrome]',
    contentSelector: `[data-scope='select'][data-part='trigger']`,
    actionParts: new Set(['clear-trigger']),
  },
  // 盒里只有那颗装着色块与值文本的触发器；吸管钮长在浮层里，不是盒内尾钮
  'color-picker': {
    boxSelector: '[data-xh-field-chrome]',
    contentSelector: `[data-scope='color-picker'][data-part='trigger']`,
    actionParts: new Set(),
  },
  'tree-select': {
    boxSelector: '[data-xh-field-chrome]',
    contentSelector: `[data-scope='tree-select'][data-part='trigger']`,
    actionParts: new Set(['clear-trigger']),
    // data-xh-field-input 投影在浮层面板内嵌的搜索框上（只为家族的重置与占位前景），不在盒里
    panelSearchInput: true,
  },
  'cascader': {
    boxSelector: '[data-xh-field-chrome]',
    contentSelector: `[data-scope='cascader'][data-part='trigger']`,
    actionParts: new Set(['clear-trigger']),
    // data-xh-field-input 投影在浮层面板内嵌的搜索框上（只为家族的重置与占位前景），不在盒里
    panelSearchInput: true,
  },
  // 分段日期框 + 日历钮：内容区是 segment-group，尾钮是日历钮与清空钮
  'date-picker': {
    boxSelector: '[data-xh-field-chrome]',
    contentSelector: `[data-scope='date-picker'][data-part='segment-group']`,
    actionParts: new Set(['trigger', 'clear-trigger']),
  },
  // 分段日期区间框 + 日历钮：起止两组 segment-group 与分隔符是内容区，尾钮是日历钮与清空钮
  'date-range-picker': {
    boxSelector: '[data-xh-field-chrome]',
    contentSelector: `[data-scope='date-range-picker'][data-part='segment-group']`,
    actionParts: new Set(['trigger', 'clear-trigger']),
  },
  // 分段时间框 + 展开钮：内容区是 segment-group，尾钮是展开钮与清空钮
  'time-picker': {
    boxSelector: '[data-xh-field-chrome]',
    contentSelector: `[data-scope='time-picker'][data-part='segment-group']`,
    actionParts: new Set(['trigger', 'clear-trigger']),
  },
  // 分段时间区间框 + 展开钮：起止两组 segment-group 与分隔符是内容区，尾钮是展开钮与清空钮
  'time-range-picker': {
    boxSelector: '[data-xh-field-chrome]',
    contentSelector: `[data-scope='time-range-picker'][data-part='segment-group']`,
    actionParts: new Set(['trigger', 'clear-trigger']),
  },
  // 单元素：input 自身即 chrome（盒是 input 而非 control），盒内没有内容区与尾钮，不投影 data-xh-field-input
  'mention': {
    boxSelector: '[data-xh-field-chrome]',
    boxPart: 'input',
    contentSelector: null,
    actionParts: new Set(),
  },
}

/** Field Chrome 的原生输入角色；内容区登记成它的组件，连接层必须把它投影到 input 上。 */
const FIELD_INPUT_SELECTOR = '[data-xh-field-input]'

/**
 * 两套盒的控件：写了 control 由 control 画盒，不写则那个 input 自己画盒。
 * 两种用法都得有聚焦环，所以 input 上那条不算出格。
 * 每条都要真被用来放行过一次，一次都没用上的会被下面的名单核验报出来。
 * password-input 接入 Field Chrome 后无 control 的结构不再画盒，名单现为空。
 */
const DUAL_BOX = new Set([])

/** 盒与盒内文字区：聚焦环只许画在其中的盒上。浮层里的条目、列表另说，不在此列。 */
const BOX_AREA_PARTS = new Set(['control', 'input', 'trigger', 'value-text', 'segment-group', 'segment'])

/**
 * 盒外的部件：它们在 positioner/content 里面，不在盒里。
 * flex:1 与 margin 顶不顶的那两条只管盒内，这些部件的排布是列表自己的事。
 * 每条都要真被用来放行过一次，一次都没用上的会被下面的名单核验报出来。
 */
const OUTSIDE_BOX = {
  list: 'select 的列表在浮层里撑满面板高度',
  empty: 'cascader 空态铺满面板',
  tree: 'tree-select 的树在浮层里撑满面板高度',
}

/**
 * 逐条登记的例外，键写成「组件 检查项」。检查项名见 CHECKS。
 * 名单之外的组件一律受本门禁管辖。
 */
const EXEMPT = {
  'pin-input box-h': '每格是等宽方框，宽高同取 --xh-pin-input-box-size 一个尺寸，不走控件行高',
  'pin-input box-px': '方格内距归零，留了内距单字符居中后可用宽度不足',
  'pin-input box-min-w': '格宽即方格边长，再给最小宽会把方框拉成长方形',
  'pin-input root-w': '根的宽由格数与格宽决定，不吃字段缺省宽',
}

/** 检查项的说明，用在报告里。 */
const CHECKS = {
  'box-part': '盒的判据：解剖里有 control 就用 control，没有才用 input',
  'box-display': '盒是 inline-flex 或 flex',
  'box-align': '盒 align-items: center',
  'box-gap': '盒 gap 走 --xh-<c>-…-gap 槽',
  'box-h': '盒高走 --xh-<c>-…-h 槽',
  'box-px': '盒行内内衬走 --xh-<c>-…-px 槽',
  'box-min-w': '盒最小宽走 --xh-<c>-…-min-w 槽并回退 --xh-control-min-w',
  'root-w': '根的缺省宽走 --xh-<c>-…-w 槽并回退 --xh-control-w，不传尺寸时一族同宽',
  'content-flex': '盒内恰有一个 flex:1 的内容区，且它是 input / value-text / segment-group',
  'action-flex': '尾部动作钮 flex: none',
  'action-size': '尾部动作钮宽高走 --xh-control-action-size',
  'margin-auto': '盒内不许用 margin-inline-start: auto 顶尾钮',
  'focus-box': '聚焦环画在盒上',
}

/** 去掉注释。 */
function strip(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '')
}

/** 拆成最内层规则：[{ selectors, decls }]，decls 是 [属性, 值] 对。 */
function parseRules(src) {
  const rules = []
  for (const m of src.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = m[1].split(',').map(s => s.trim().replace(/\s+/g, ' ')).filter(Boolean)
    if (selectors.length === 0 || selectors[0].startsWith('@'))
      continue
    const decls = []
    for (const d of m[2].matchAll(/(?:^|;)\s*(--[\w-]+|[a-z-]+)\s*:\s*([^;]+)/g))
      decls.push([d[1], d[2].trim().replace(/\s+/g, ' ')])
    rules.push({ selectors, decls })
  }
  return rules
}

/** 选择器里最后一个 data-part。 */
function lastPart(selector) {
  const parts = [...selector.matchAll(/\[data-part='([\w-]+)'\]/g)]
  return parts.length ? parts.at(-1)[1] : null
}

/** 共享家族选择器没有 data-part，由组件接线把稳定角色映回解剖部件。 */
function effectivePart(selector, comp) {
  const direct = lastPart(selector)
  if (direct)
    return direct
  const family = SHARED_FAMILY[comp]
  if (family && selector.includes(family.boxSelector))
    return family.boxPart ?? 'control'
  if (family?.contentSelector && selector.includes(family.contentSelector))
    return 'input'
  return null
}

const fieldChromeRules = parseRules(strip(await readFile(join(FAMILY_DIR, 'field-chrome.css'), 'utf8')))
const actionControlSource = strip(await readFile(join(FAMILY_DIR, 'action-control.css'), 'utf8'))
const actionControlHasInsetContract = actionControlSource.includes('[data-xh-action-control][data-xh-action-profile=\'field-inset\']')
  && /\[data-xh-action-control\]\s*\{[\s\S]*?block-size:\s*var\(--xh-action-visual-size/.test(actionControlSource)
  && /\[data-xh-action-control\]\[data-xh-action-profile='field-inset'\]\s*\{[\s\S]*?flex:\s*none;[\s\S]*?inline-size:\s*var\(--xh-action-visual-size/.test(actionControlSource)

const files = new Set(await readdir(STYLES_DIR))
const problems = new Map()
const usedExempt = new Set()
/** 真的按单元素放行过的组件。 */
const usedSingle = new Set()
/** 真的按盒外部件放行过的 part。 */
const usedOutside = new Set()
/** 真的按两套盒放行过的组件。 */
const usedDual = new Set()
let governed = 0

function report(comp, check, detail) {
  const key = `${comp} ${check}`
  if (key in EXEMPT) {
    usedExempt.add(key)
    return
  }
  if (!problems.has(comp))
    problems.set(comp, [])
  problems.get(comp).push(`${check}：${detail}`)
}

for (const comp of COMPONENTS) {
  const file = `${comp}.css`
  if (!files.has(file)) {
    report(comp, 'box-part', `皮肤 ${file} 不存在`)
    continue
  }
  const rawSrc = await readFile(join(STYLES_DIR, file), 'utf8')
  const src = strip(rawSrc)
  const family = SHARED_FAMILY[comp]
  const usesFieldChrome = family != null
  const rules = [...parseRules(src), ...(usesFieldChrome ? fieldChromeRules : [])]
  const connectSource = usesFieldChrome
    ? await readFile(join(HEADLESS_DIR, comp, `${comp}.connect.ts`), 'utf8')
    : ''

  if (usesFieldChrome) {
    if (!rawSrc.includes('@import \'../family/field-chrome.css\''))
      report(comp, 'box-part', '登记为 Field Chrome 使用者却没有传递引入 field-chrome.css')
    if (!connectSource.includes(`'data-xh-field-chrome': ''`))
      report(comp, 'box-part', '连接层没有把 Field Chrome 的 chrome 稳定角色投影到解剖部件')
    // 内容区登记成家族 input 角色的，连接层必须投影它；登记成自己的解剖部件的，投影了反而说明登记过期
    const projectsInput = connectSource.includes(`'data-xh-field-input': ''`)
    if (family.contentSelector === FIELD_INPUT_SELECTOR && !projectsInput)
      report(comp, 'box-part', '连接层没有把 Field Chrome 的 input 稳定角色投影到解剖部件')
    if (family.contentSelector !== FIELD_INPUT_SELECTOR && projectsInput && !family.panelSearchInput)
      report(comp, 'box-part', `内容区登记为 ${family.contentSelector ?? '无（单元素）'}，连接层却投影了 data-xh-field-input——登记过期了`)
  }

  // 本文件里每个自定义属性声明过的值，用来把组件槽的回退链走通
  const slots = new Map()
  for (const rule of rules) {
    for (const [name, value] of rule.decls) {
      if (name.startsWith('--'))
        slots.set(name, [...(slots.get(name) ?? []), value])
    }
  }
  const reaches = (value, re, depth = 0) => {
    if (re.test(value))
      return true
    if (depth >= 4)
      return false
    for (const ref of value.matchAll(/var\(\s*(--[\w-]+)/g)) {
      for (const declared of slots.get(ref[1]) ?? []) {
        if (reaches(declared, re, depth + 1))
          return true
      }
    }
    return false
  }

  // ① 盒的判据：解剖里有 control 就是 control，否则是 input
  let anatomy = ''
  try {
    anatomy = await readFile(join(HEADLESS_DIR, comp, `${comp}.anatomy.ts`), 'utf8')
  }
  catch {
    report(comp, 'box-part', `读不到解剖 ${comp}.anatomy.ts`)
    continue
  }
  const parts = new Set([...anatomy.matchAll(/'([\w-]+)',?\s*$/gm)].map(m => m[1]))
  const box = parts.has('control') ? 'control' : 'input'
  const single = box === 'input' && comp in SINGLE_ELEMENT
  if (single)
    usedSingle.add(comp)
  if (box === 'input' && !single)
    report(comp, 'box-part', `解剖里没有 control，盒退给 input，但它不在 SINGLE_ELEMENT 名单里`)

  // ② 盒规则：基础块（无附加选择器那条）里的五件事
  const boxSelector = family?.boxSelector ?? `[data-scope='${comp}'][data-part='${box}']`
  const boxDecls = new Map()
  for (const rule of rules) {
    if (!rule.selectors.includes(boxSelector))
      continue
    for (const [name, value] of rule.decls)
      boxDecls.set(name, value)
  }
  if (boxDecls.size === 0) {
    report(comp, 'box-part', `找不到基础块 ${boxSelector}`)
  }
  else {
    governed++
    const has = (name, test, check, want) => {
      const value = boxDecls.get(name)
      if (value == null)
        report(comp, check, `基础块缺 ${name}`)
      else if (!test(value))
        report(comp, check, `${name}: ${value} —— ${want}`)
    }
    if (!single) {
      has('display', v => v === 'inline-flex' || v === 'flex', 'box-display', '该是 inline-flex 或 flex')
      has('align-items', v => v === 'center', 'box-align', '该是 center')
      has('gap', v => reaches(v, new RegExp(`--xh-${comp}-[\\w-]*gap\\b`)), 'box-gap', `该走 var(--xh-${comp}-…-gap, …)`)
    }
    if (boxDecls.has('block-size'))
      has('block-size', v => reaches(v, new RegExp(`--xh-${comp}-[\\w-]*-h\\b`)), 'box-h', `该走 var(--xh-${comp}-…-h, …)`)
    else if (boxDecls.has('min-block-size'))
      report(comp, 'box-h', `基础块写的是 min-block-size 而不是 block-size：${boxDecls.get('min-block-size')}`)
    else
      report(comp, 'box-h', '基础块缺 block-size')
    has('padding-inline', v => reaches(v, new RegExp(`--xh-${comp}-[\\w-]*px\\b`)), 'box-px', `该走 var(--xh-${comp}-…-px, …)`)
    has(
      'min-inline-size',
      v => reaches(v, new RegExp(`--xh-${comp}-[\\w-]*min-w\\b`)) && reaches(v, /--xh-control-min-w\b/),
      'box-min-w',
      `该走 var(--xh-${comp}-…-min-w, var(--xh-control-min-w))`,
    )
  }

  // ②′ 根的缺省宽：不传尺寸时一族同宽，宽度不随内容走。根是收缩到内容宽的那个元素，
  //     只写在盒上根会塌（见 fc77e4d16），所以量的是根的基础块
  {
    const rootSelector = `[data-scope='${comp}'][data-part='root']`
    const rootDecls = new Map()
    for (const rule of rules) {
      if (!rule.selectors.includes(rootSelector))
        continue
      for (const [name, value] of rule.decls)
        rootDecls.set(name, value)
    }
    const width = rootDecls.get('inline-size')
    if (width == null)
      report(comp, 'root-w', '根的基础块缺 inline-size')
    else if (!(reaches(width, new RegExp(`--xh-${comp}-[\\w-]*-w\\b`)) && reaches(width, /--xh-control-w\b/)))
      report(comp, 'root-w', `inline-size: ${width} —— 该走 var(--xh-${comp}-…-w, var(--xh-control-w))`)
  }

  // ③ 盒内恰有一个 flex:1 的内容区
  if (!single) {
    const growers = []
    for (const rule of rules) {
      const grows = rule.decls.some(([name, value]) => name === 'flex' && /^1(?:\s|$)/.test(value))
      if (!grows)
        continue
      for (const selector of rule.selectors) {
        const part = effectivePart(selector, comp)
        if (part == null)
          continue
        if (part in OUTSIDE_BOX) {
          usedOutside.add(part)
          continue
        }
        growers.push({ part, selector })
      }
    }
    const alternate = ALTERNATE_CONTENT[comp]?.parts ?? []
    const contentOk = part => CONTENT_PARTS.has(part) || (part === 'trigger' && TRIGGER_IS_CONTENT.has(comp)) || alternate.includes(part)
    // 嵌在内容区里再撑一层的（下拉族 trigger 内的 value-text）不算盒的直接内容区；
    // 按模式二选一的那一对只算一个内容区（同一时刻只有一个在场）
    const direct = growers
      .filter(g => !(NESTED_CONTENT.has(g.part) && TRIGGER_IS_CONTENT.has(comp)))
      .filter(g => !(alternate.includes(g.part) && g.part !== alternate[0]))
    if (direct.length === 0)
      report(comp, 'content-flex', `盒内没有 flex:1 的内容区（尾钮靠 margin 顶或干脆不靠右）`)
    else if (direct.length > 1)
      report(comp, 'content-flex', `有 ${direct.length} 处 flex:1：${direct.map(g => g.part).join(' / ')}，该只有一个`)
    for (const g of direct) {
      if (!contentOk(g.part))
        report(comp, 'content-flex', `flex:1 落在 ${g.part} 上（${g.selector}），该是 input / value-text / segment-group`)
    }
  }

  // ④ 尾部动作钮：flex: none + 走 --xh-control-action-size
  if (!single) {
    for (const action of ACTION_PARTS) {
      if (action === 'trigger' && TRIGGER_IS_CONTENT.has(comp))
        continue
      if (family?.actionParts.has(action)) {
        const hasActionImport = rawSrc.includes('@import \'../family/action-control.css\'')
        const hasActionProjection = connectSource.includes('\'data-xh-action-control\': \'\'')
          && connectSource.includes('\'data-xh-action-profile\': \'field-inset\'')
        if (!hasActionImport || !hasActionProjection || !actionControlHasInsetContract)
          report(comp, 'action-size', `${action} 的 Action Control field-inset 家族接线不完整`)
        continue
      }
      const selector = `[data-scope='${comp}'][data-part='${action}']`
      const decls = new Map()
      for (const rule of rules) {
        if (!rule.selectors.includes(selector))
          continue
        for (const [name, value] of rule.decls)
          decls.set(name, value)
      }
      if (decls.size === 0)
        continue
      if (decls.get('flex') !== 'none')
        report(comp, 'action-flex', `${action} 的 flex 是 ${decls.get('flex') ?? '（未声明）'}，该是 none`)
      for (const dim of ['inline-size', 'block-size']) {
        const value = decls.get(dim)
        if (value == null)
          report(comp, 'action-size', `${action} 缺 ${dim}`)
        else if (!reaches(value, /--xh-control-action-size\b/))
          report(comp, 'action-size', `${action} 的 ${dim}: ${value} —— 该回退到 --xh-control-action-size`)
      }
    }
  }

  // ⑤ 盒内不许用 margin-inline-start: auto 顶尾钮
  for (const rule of rules) {
    if (!rule.decls.some(([name, value]) => name === 'margin-inline-start' && value === 'auto'))
      continue
    for (const selector of rule.selectors) {
      const part = effectivePart(selector, comp)
      if (part == null)
        continue
      if (part in OUTSIDE_BOX) {
        usedOutside.add(part)
        continue
      }
      report(comp, 'margin-auto', `${part} 上写了 margin-inline-start: auto（${selector}），改用 flex:1 的内容区顶`)
    }
  }

  // ⑥ 聚焦环画在盒上
  for (const rule of rules) {
    const outline = rule.decls.find(([name, value]) => name === 'outline' && value !== 'none' && !value.startsWith('0'))
    if (!outline)
      continue
    for (const selector of rule.selectors) {
      if (!/:focus-within|:focus-visible/.test(selector))
        continue
      const part = effectivePart(selector, comp)
      if (part == null || !BOX_AREA_PARTS.has(part) || part === box)
        continue
      // 两套盒的控件不写 control 时，input 自己是盒，那条环同样必须在
      if (part === 'input' && DUAL_BOX.has(comp)) {
        usedDual.add(comp)
        continue
      }
      report(comp, 'focus-box', `聚焦环画在 ${part} 上（${selector}），盒是 ${box}`)
    }
  }
}

// ⑦ 别的组件改字段的缺省宽：一族一个数，只有登记过的嵌入位才能在自己的挂载点上改写字段的宽度槽，
// 且必须留自己的使用者槽（作者要还原字段缺省宽时改的是嵌入方的槽，不必知道里头装的是哪个字段）
const EMBEDDED_WIDTH = {
  'pagination:page-size-select:select': {
    slot: '--xh-pagination-page-size-select-w',
    reason: '分页行里的每页条数控制器，选项是「10 条 / 页」一类短串，字段缺省宽 16rem 在分页行里过宽，按内容定宽',
  },
}
const usedEmbedded = new Set()
for (const file of [...files].filter(f => f.endsWith('.css')).sort()) {
  const host = file.replace(/\.css$/, '')
  for (const rule of parseRules(strip(await readFile(join(STYLES_DIR, file), 'utf8')))) {
    for (const [name, value] of rule.decls) {
      const field = /^--xh-([a-z][a-z0-9-]*)-control-w$/.exec(name)?.[1]
      if (!field || field === host)
        continue
      for (const selector of rule.selectors) {
        const part = [...selector.matchAll(/\[data-part='([a-z0-9-]+)'\]/g)].at(-1)?.[1] ?? '（根）'
        const key = `${host}:${part}:${field}`
        const entry = EMBEDDED_WIDTH[key]
        if (!entry) {
          problems.set(host, [...(problems.get(host) ?? []), `root-w：${selector} 改写了 ${field} 的缺省宽 ${name}，没登记进 EMBEDDED_WIDTH——字段的缺省宽一族一个数，嵌入位要改先登记理由`])
          continue
        }
        usedEmbedded.add(key)
        if (!value.startsWith(`var(${entry.slot},`))
          problems.set(host, [...(problems.get(host) ?? []), `root-w：${selector} 改写 ${name} 没经自己的使用者槽 ${entry.slot}`])
      }
    }
  }
}
for (const key of Object.keys(EMBEDDED_WIDTH)) {
  if (!usedEmbedded.has(key))
    problems.set(key.split(':')[0], [...(problems.get(key.split(':')[0]) ?? []), `EMBEDDED_WIDTH 里的 ${key} 已经没人改写了——名单过期`])
}

for (const key of Object.keys(EXEMPT)) {
  if (!usedExempt.has(key))
    problems.set(key.split(' ')[0], [...(problems.get(key.split(' ')[0]) ?? []), `例外 ${key} 已经用不上了，删掉这条`])
}

for (const key of Object.keys(SINGLE_ELEMENT)) {
  if (!usedSingle.has(key))
    problems.set(key, [...(problems.get(key) ?? []), '登记在 SINGLE_ELEMENT 里却没被扫到——名单过期了'])
}

for (const part of Object.keys(OUTSIDE_BOX)) {
  if (!usedOutside.has(part))
    problems.set(part, [...(problems.get(part) ?? []), `${part} 登记在 OUTSIDE_BOX 里却没被扫到——名单过期了`])
}

for (const comp of DUAL_BOX) {
  if (!usedDual.has(comp))
    problems.set(comp, [...(problems.get(comp) ?? []), `${comp} 登记在 DUAL_BOX 里却没被扫到——名单过期了`])
}

if (problems.size) {
  console.error('[check-control-box] ✗ 盒结构没走同一种做法：')
  for (const [comp, list] of [...problems].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.error(`\n  ${comp}（${list.length} 条）`)
    for (const p of list)
      console.error(`    ${p}`)
  }
  console.error('\n口径：')
  for (const [check, desc] of Object.entries(CHECKS))
    console.error(`  ${check}  ${desc}`)
  process.exit(1)
}

console.log(`[check-control-box] 通过：${governed} 个控件的盒结构同构（单元素 ${Object.keys(SINGLE_ELEMENT).length} 个、盒外部件 ${usedOutside.size} 个、两套盒 ${usedDual.size} 个、例外 ${usedExempt.size} 条）`)
