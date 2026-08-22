#!/usr/bin/env node
// 门禁：接了定位引擎可用高度通道的浮层，机器、connect、皮肤三处必须齐。
//
// 这道检查存在的理由是「半接线」不会有任何别的判据报错：
// 皮肤写了 max-block-size: min(静态档, var(--xh-_x-available-h))、connect 也确实发这个槽，
// 唯独机器没传 size —— 引擎于是从不回报 availableHeight，槽恒为空串，min() 恒取静态档。
// 页面看着正常，动态限高其实从未生效。check-private-slots 只问「声明了且被消费吗」，
// 两边都在，照样放行；测试也抓不住，因为单测是直接往 context 里塞 position 的，绕开了引擎。
//
// 三段的对应关系：
//   ① 机器（COMPOSED 的查被复用的那台）传 size: true
//   ② <名>.connect.ts 发 --xh-_<名>-available-h
//   ③ <名>.css 里该槽既有兜底声明、又被 min( 消费
import { readdir, readFile } from 'node:fs/promises'

const HEADLESS = 'packages/engine/headless/src'
const SKINS = 'packages/design/styles/css'

/** 不吃引擎坐标的 positioner：连坐标都不问引擎要，更谈不上可用高度。 */
const NOT_ENGINE_POSITIONED = new Set(['dialog', 'drawer', 'image-viewer'])

/** 没有自己机器、跑别人机器的：size 开关在被复用的那台上。 */
const COMPOSED = {
  popconfirm: 'popover',
  popselect: 'popover',
}

/**
 * 不接可用高度通道的浮层，连同理由。
 * 判据是「高度不由结构封顶」且「现有机制兜不住」，两条都成立才该接；下面这些至少缺一条。
 */
const SIZE_EXEMPT = {
  'cascader': '每列高度定死且列内自滚，面板高度不随数据增长',
  'time-picker': '每列各自限高自滚；整面板滚会让时列与分列一起走，反而不能对齐着挑',
  'popconfirm': '定长栅格，没有可滚的正文部件，高度上界由一句说明文案决定',
  'tooltip': 'role=tooltip 不可聚焦，内部滚动区键盘用户够不到，加滚动是制造无障碍陷阱',
  'floating-panel': '尺寸是用户自己拖出来的，由 minSize/maxSize 夹取，不从锚点下的可用空间推',
}

/**
 * 没有 positioner 部件、面板由皮肤 position: absolute 排布的浮层，连同理由。
 * 不问引擎要坐标也就没有可用高度可接；按解剖发现不到它们，所以逐项核实登记理由仍成立：
 * 解剖没有 positioner、connect 不碰定位引擎、皮肤 content 是 absolute 且层级走 --xh-layer-popover。
 */
const SKIN_POSITIONED = {
  'navigation-menu': '面板贴着自己那一项落在列表下方，由皮肤 position: absolute 排布，不需要 flip / shift',
}

/** 取出 [data-scope='<名>'][data-part='content'] 那条规则的声明块。 */
function contentRule(css, name) {
  const m = css.match(new RegExp(`\\[data-scope='${name}'\\]\\[data-part='content'\\]\\s*\\{([^}]*)\\}`))
  return m ? m[1] : null
}

/** 登记为皮肤排布的浮层，三处事实都对得上才算成立。 */
async function verifySkinPositioned(name) {
  const anatomy = await read(`${HEADLESS}/${name}/${name}.anatomy.ts`)
  const connect = await read(`${HEADLESS}/${name}/${name}.connect.ts`)
  const css = await read(`${SKINS}/${name}.css`)
  const errs = []
  if (anatomy == null)
    errs.push('找不到解剖')
  else if (anatomy.includes('\'positioner\''))
    errs.push('解剖里已有 positioner 部件，它会被当作引擎浮层发现，不该再留在 SKIN_POSITIONED')
  if (connect == null)
    errs.push('找不到 connect')
  else if (/overlayPositioned|computePosition/.test(connect))
    errs.push('connect 已接定位引擎（overlayPositioned / computePosition），登记理由不再成立')
  if (css == null) {
    errs.push('找不到皮肤')
  }
  else {
    const rule = contentRule(css, name)
    const layer = new RegExp(`z-index:\\s*var\\((?:--xh-${name}-layer,\\s*var\\(--xh-layer-popover\\)|--xh-layer-popover)\\)`)
    if (rule == null)
      errs.push('皮肤里找不到 content 规则')
    else if (!/position:\s*absolute/.test(rule))
      errs.push('皮肤的 content 不是 position: absolute')
    else if (!layer.test(rule))
      errs.push(`皮肤的 content 层级没走 --xh-layer-popover（允许 var(--xh-${name}-layer, var(--xh-layer-popover)) 或 var(--xh-layer-popover)）`)
  }
  return errs
}

async function read(path) {
  try {
    return await readFile(path, 'utf8')
  }
  catch {
    return null
  }
}

/** 有 positioner 部件的组件即浮层族。 */
async function discoverFamilies() {
  const dirs = await readdir(HEADLESS, { withFileTypes: true })
  const found = []
  for (const d of dirs) {
    if (!d.isDirectory())
      continue
    const anatomy = await read(`${HEADLESS}/${d.name}/${d.name}.anatomy.ts`)
    if (anatomy?.includes('\'positioner\''))
      found.push(d.name)
  }
  return found.sort()
}

/** 一个组件的三段各自成立与否。 */
async function wiringOf(name) {
  const machineOwner = COMPOSED[name] ?? name
  const machine = await read(`${HEADLESS}/${machineOwner}/${machineOwner}.machine.ts`)
  const connect = await read(`${HEADLESS}/${name}/${name}.connect.ts`)
  const css = await read(`${SKINS}/${name}.css`)
  const slot = `--xh-_${name}-available-h`
  return {
    machineOwner,
    machine: !!machine?.includes('size: true'),
    connect: !!connect?.includes(slot),
    // 声明兜底与消费是两回事：只声明不消费等于白写，只消费不声明则未落位时没有退路
    skinDeclares: !!css?.includes(`${slot}:`),
    skinConsumes: !!css?.includes(`var(${slot})`),
  }
}

const families = await discoverFamilies()
const problems = []
const wired = []

for (const name of Object.keys(SKIN_POSITIONED)) {
  for (const err of await verifySkinPositioned(name))
    problems.push(`${name} 记在 SKIN_POSITIONED 里（${SKIN_POSITIONED[name]}），但 ${err}`)
}

for (const name of families) {
  if (NOT_ENGINE_POSITIONED.has(name))
    continue
  const w = await wiringOf(name)
  const any = w.machine || w.connect || w.skinDeclares || w.skinConsumes

  if (name in SIZE_EXEMPT) {
    // 名单会过期：登记了不接、却已经接上了，说明理由已不成立，该把它从名单里划掉
    if (w.connect && w.skinConsumes) {
      problems.push(
        `${name} 记在 SIZE_EXEMPT 里（${SIZE_EXEMPT[name]}），但它已经接上了可用高度——`
        + `把它从名单里删掉，或说明为什么两者并存`,
      )
    }
    continue
  }

  if (!any) {
    problems.push(
      `${name} 是锚定浮层，却一段都没接可用高度通道——矮视口下面板会整块伸出视口且滚不到。`
      + `要么补齐三段，要么写进 SIZE_EXEMPT 并给出理由`,
    )
    continue
  }

  const missing = []
  if (!w.machine)
    missing.push(`${w.machineOwner}.machine.ts 没传 size: true（引擎从不回报可用高度，下游那两段是死的）`)
  if (!w.connect)
    missing.push(`${name}.connect.ts 没发 --xh-_${name}-available-h（引擎算了没人接）`)
  if (!w.skinDeclares)
    missing.push(`${name}.css 没给 --xh-_${name}-available-h 兜底声明（未落位时没有退路）`)
  if (!w.skinConsumes)
    missing.push(`${name}.css 没有 var(--xh-_${name}-available-h) 的消费点（值传到了没人用）`)

  if (missing.length)
    problems.push(`${name} 只接了一半：\n      ${missing.join('\n      ')}`)
  else
    wired.push(name)
}

if (problems.length) {
  console.error('[check-overlay-size] ✗ 可用高度通道没接齐：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('三段缺任何一段都不会有别的判据报错，页面看着正常，动态限高其实从未生效。')
  process.exit(1)
}

const exempt = Object.keys(SIZE_EXEMPT).length
console.log(`[check-overlay-size] 通过：${wired.length} 个浮层的可用高度三段齐（另有 ${exempt} 个按名单不接、${NOT_ENGINE_POSITIONED.size} 个不吃引擎坐标、${Object.keys(SKIN_POSITIONED).length} 个由皮肤排布）`)
