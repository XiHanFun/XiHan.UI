// 浮层门禁共享：族发现、名单与皮肤排布核验。
// 供 check-overlay-strategy / check-overlay-size / check-overlay-positioned 三道门禁引用，
// 每道只取自己需要的那份名单，覆盖范围由各脚本显式挑选。
import { readdir, readFile } from 'node:fs/promises'

export const HEADLESS = 'packages/engine/headless/src'
export const SKINS = 'packages/design/styles/css'

/**
 * 定位不吃引擎坐标的 positioner，连同理由。
 * 名单之外的 positioner 一律受坐标系门禁管辖——族成员从解剖里扫出来，手写清单会漏。
 * check-overlay-strategy 用全表；check-overlay-size 用 SIZE_NOT_ENGINE_POSITIONED 子集。
 */
export const NOT_ENGINE_POSITIONED = {
  'dialog': '居中由皮肤的 inset + flex 排布，不问引擎要坐标',
  'drawer': '贴边由皮肤的 inset 排布，不问引擎要坐标',
  'floating-panel': '位置由用户拖出来、存在机器里，不问引擎要坐标',
  'image-viewer': '全屏居中由皮肤的 inset + flex 排布，不问引擎要坐标',
}

/**
 * check-overlay-size 跳过可用高度检查的「不吃引擎坐标」子集。
 * 与 NOT_ENGINE_POSITIONED 的差异：不含 floating-panel——它在 size 门禁里走 SIZE_EXEMPT，
 * 名单过期时（已接上可用高度）仍会被揪出来。
 */
export const SIZE_NOT_ENGINE_POSITIONED = new Set(['dialog', 'drawer', 'image-viewer'])

/**
 * 没有自己机器、跑别人机器的：坐标系与 size 开关都在被复用的那台机器上。
 * check-overlay-strategy 与 check-overlay-size 共用；check-overlay-positioned 只看 connect，不用。
 */
export const COMPOSED = {
  popconfirm: 'popover',
  popselect: 'popover',
}

/**
 * 皮肤不给 positioner 定坐标系的：定位模式与坐标全部由连接层写进内联 style。
 *
 * 从前这里是一个只有名字的 Set——「皮肤不管定位」是一句自述，没人核得出真假，
 * 后来有人在那份皮肤里补一条 position: absolute 也不会有任何提示（内联赢，那条是死声明，
 * 却会让读代码的人以为坐标系是 absolute）。改成带理由的对象，并由门禁反过来核实：
 * 登记了就**不许**在 positioner 上声明 position。
 * 只有 check-overlay-strategy 用。
 */
export const NO_SKIN_RULE = {
  tour: '坐标与定位模式全由连接层写进内联 style，皮肤这一层只管层号、指针与居中步的铺满',
}

/**
 * 没有 positioner 部件、面板由皮肤 position: absolute 排布的浮层，连同理由。
 * 按解剖发现不到它们，三道门禁都用 verifySkinPositioned 逐项核实登记理由仍成立：
 * 解剖没有 positioner、connect 不碰定位引擎、皮肤 content 是 absolute 且层级走 --xh-layer-popover
 * （直接引用或经 --xh-<名>-layer 槽兜底）。
 */
export const SKIN_POSITIONED = {
  'navigation-menu': '面板贴着自己那一项落在列表下方，由皮肤 position: absolute 排布，不需要 flip / shift',
}

export async function read(path) {
  try {
    return await readFile(path, 'utf8')
  }
  catch {
    return null
  }
}

/** 取出 [data-scope='<名>'][data-part='content'] 那条规则的声明块。 */
export function contentRule(css, name) {
  const m = css.match(new RegExp(`\\[data-scope='${name}'\\]\\[data-part='content'\\]\\s*\\{([^}]*)\\}`))
  return m ? m[1] : null
}

/** 登记为皮肤排布的浮层，三处事实都对得上才算成立。 */
export async function verifySkinPositioned(name) {
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

/** 有 positioner 部件的组件即浮层族。 */
export async function discoverFamilies() {
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
