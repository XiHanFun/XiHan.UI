#!/usr/bin/env node
// 门禁：接了定位引擎可用空间通道的浮层，机器、connect、皮肤三处必须齐。宽高各是一条通道。
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
import {
  COMPOSED,
  discoverFamilies,
  HEADLESS,
  read,
  SIZE_NOT_ENGINE_POSITIONED,
  SKIN_POSITIONED,
  SKINS,
  verifySkinPositioned,
} from './lib/overlay-families.mjs'

/**
 * 不接可用高度通道的浮层，连同理由。
 * 判据是「高度不由结构封顶」且「现有机制兜不住」，两条都成立才该接；下面这些至少缺一条。
 * 每条都要真被用来放行过一次——组件改名、不再是浮层族，登记就成了没人走的死条目，
 * 由下面的名单核验报出来。
 */
const SIZE_EXEMPT = {
  'cascader': '每列高度定死且列内自滚，面板高度不随数据增长',
  'time-picker': '每列各自限高自滚；整面板滚会让时列与分列一起走，反而不能对齐着挑',
  'tooltip': 'role=tooltip 不可聚焦，内部滚动区键盘用户够不到，加滚动是制造无障碍陷阱',
  'floating-panel': '尺寸是用户自己拖出来的，由 minSize/maxSize 夹取，不从锚点下的可用空间推',
}

/**
 * 不接可用宽度通道的浮层，连同理由。
 * 判据是「行内轴上没有会超出可用区的静态档」——有静态档且那个档可能大过可用区的，
 * 就必须接这条通道，否则窄屏上面板越界、最边上的内容点不到。
 * 与高度那张表分开记：一个组件可以只需要其中一条通道。
 */
const WIDTH_EXEMPT = {
  'tooltip': '行内轴静态档是 --xh-overlay-max-w = 20rem = 320px，比最窄可用区（375 视口下 367px）还小，越不出去',
  'time-picker': '列由两位数字撑宽且 flex: none，几列合计远小于最窄可用区；行内轴上没有静态档',
  'floating-panel': '几何由 headless 的 geometry 层给，不经定位引擎的可用区通道。它确实会越界（默认右缘 384 > 375 视口），修法在几何层不在这条通道上',
}

/** 一个组件的三段各自成立与否。 */
async function wiringOf(name, axis = 'h') {
  const machineOwner = COMPOSED[name] ?? name
  const machine = await read(`${HEADLESS}/${machineOwner}/${machineOwner}.machine.ts`)
  const connect = await read(`${HEADLESS}/${name}/${name}.connect.ts`)
  const css = await read(`${SKINS}/${name}.css`)
  const slot = `--xh-_${name}-available-${axis}`
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
/** 真的按名单放行过的浮层。 */
const usedExempt = new Set()

for (const name of Object.keys(SKIN_POSITIONED)) {
  for (const err of await verifySkinPositioned(name))
    problems.push(`${name} 记在 SKIN_POSITIONED 里（${SKIN_POSITIONED[name]}），但 ${err}`)
}

for (const name of families) {
  if (SIZE_NOT_ENGINE_POSITIONED.has(name))
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
    else {
      usedExempt.add(name)
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

for (const name of Object.keys(SIZE_EXEMPT)) {
  if (!usedExempt.has(name))
    problems.push(`${name} 登记在 SIZE_EXEMPT 里却没被扫到——名单过期了`)
}

// 宽度那条通道：同一套三段判据，另一张豁免表
const wiredW = []
const usedExemptW = new Set()

for (const family of families) {
  const name = family.name ?? family
  if (SIZE_NOT_ENGINE_POSITIONED.has(name) || name in SKIN_POSITIONED)
    continue
  if (name in WIDTH_EXEMPT) {
    usedExemptW.add(name)
    // 登记了却其实接上了，说明这条结论过期
    const w = await wiringOf(name, 'w')
    if (w.connect && w.skinDeclares && w.skinConsumes)
      problems.push(`${name} 登记在 WIDTH_EXEMPT 里，可它三段都接齐了——把登记删掉`)
    continue
  }

  const w = await wiringOf(name, 'w')
  const missing = []
  if (!w.machine)
    missing.push(`${w.machineOwner}.machine.ts 没传 size: true（引擎从不回报可用宽度）`)
  if (!w.connect)
    missing.push(`${name}.connect.ts 没发 --xh-_${name}-available-w（引擎算了没人接）`)
  if (!w.skinDeclares)
    missing.push(`${name}.css 没给 --xh-_${name}-available-w 兜底声明（未落位时没有退路）`)
  if (!w.skinConsumes)
    missing.push(`${name}.css 没有 var(--xh-_${name}-available-w) 的消费点（值传到了没人用）`)

  if (missing.length)
    problems.push(`${name} 的可用宽度通道只接了一半：\n      ${missing.join('\n      ')}`)
  else
    wiredW.push(name)
}

for (const name of Object.keys(WIDTH_EXEMPT)) {
  if (!usedExemptW.has(name))
    problems.push(`${name} 登记在 WIDTH_EXEMPT 里却没被扫到——名单过期了`)
}

if (problems.length) {
  console.error('[check-overlay-size] ✗ 可用空间通道没接齐：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('三段缺任何一段都不会有别的判据报错，页面看着正常，动态限高其实从未生效。')
  process.exit(1)
}

console.log(`[check-overlay-size] 通过：可用高度 ${wired.length} 个浮层三段齐、可用宽度 ${wiredW.length} 个三段齐（宽度另有 ${usedExemptW.size} 个按名单不接）（另有 ${usedExempt.size} 个按名单不接、${SIZE_NOT_ENGINE_POSITIONED.size} 个不吃引擎坐标、${Object.keys(SKIN_POSITIONED).length} 个由皮肤排布）`)
