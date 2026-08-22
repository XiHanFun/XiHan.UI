#!/usr/bin/env node
// 门禁：有定位层的浮层，连接层必须发 data-positioned。
//
// 皮肤基线把所有定位层默认藏着（reset.css），只有带 data-positioned 的才显示。
// 这是浮层的生命周期契约：渲染 → 量 → 定位 → 才露。坐标依赖浮层自己的尺寸，
// 尺寸要等元素进 DOM 参与排版才量得到，所以展开的那几帧坐标还是兜底的 0——
// 不藏的话会先在视口左上角闪一帧，快机器上赶在绘制前闭合、慢机器上画出来。
//
// 连接层忘了发这个属性，浮层就永远不显示。这比闪一帧好——响亮失败——但不该等到
// 有人打开页面才发现，这里提前到构建前。
import { readdir, readFile } from 'node:fs/promises'

const HEADLESS = 'packages/engine/headless/src'
const SKINS = 'packages/design/styles/css'

/**
 * 没有 positioner 部件、面板由皮肤 position: absolute 排布的浮层，连同理由。
 * 它们没有「还没量完」的窗口，不发 data-positioned；按解剖发现不到，所以逐项核实登记理由仍成立：
 * 解剖没有 positioner、connect 不碰定位引擎、皮肤 content 是 absolute 且层级走 --xh-layer-popover。
 */
const SKIN_POSITIONED = {
  'navigation-menu': '面板贴着自己那一项落在列表下方，由皮肤 position: absolute 排布，不需要 flip / shift',
}

async function read(path) {
  try {
    return await readFile(path, 'utf8')
  }
  catch {
    return null
  }
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

const dirs = await readdir(HEADLESS, { withFileTypes: true })
const problems = []
let families = 0

for (const name of Object.keys(SKIN_POSITIONED)) {
  for (const err of await verifySkinPositioned(name))
    problems.push(`${name} 记在 SKIN_POSITIONED 里（${SKIN_POSITIONED[name]}），但 ${err}`)
}

for (const d of dirs) {
  if (!d.isDirectory())
    continue
  const anatomy = await read(`${HEADLESS}/${d.name}/${d.name}.anatomy.ts`)
  if (!anatomy?.includes('\'positioner\''))
    continue
  families++
  const connect = await read(`${HEADLESS}/${d.name}/${d.name}.connect.ts`)
  if (!connect?.includes('\'data-positioned\'')) {
    problems.push(
      `${d.name} 的解剖里有 positioner，connect 却不发 data-positioned——`
      + `皮肤基线把定位层默认藏着，这个浮层永远不会显示`,
    )
  }
}

if (problems.length) {
  console.error('[check-overlay-positioned] ✗ 定位层没接落位信号：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('吃引擎坐标的发 overlayPositioned(position)；由皮肤 inset 直接摆的发常量——它们没有「还没量完」的窗口。')
  process.exit(1)
}

console.log(`[check-overlay-positioned] 通过：${families} 个浮层族的定位层都发落位信号（另有 ${Object.keys(SKIN_POSITIONED).length} 个由皮肤排布）`)
