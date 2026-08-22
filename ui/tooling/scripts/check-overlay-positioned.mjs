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
import { discoverFamilies, HEADLESS, read, SKIN_POSITIONED, verifySkinPositioned } from './lib/overlay-families.mjs'

const families = await discoverFamilies()
const problems = []

for (const name of Object.keys(SKIN_POSITIONED)) {
  for (const err of await verifySkinPositioned(name))
    problems.push(`${name} 记在 SKIN_POSITIONED 里（${SKIN_POSITIONED[name]}），但 ${err}`)
}

for (const name of families) {
  const connect = await read(`${HEADLESS}/${name}/${name}.connect.ts`)
  if (!connect?.includes('\'data-positioned\'')) {
    problems.push(
      `${name} 的解剖里有 positioner，connect 却不发 data-positioned——`
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

console.log(`[check-overlay-positioned] 通过：${families.length} 个浮层族的定位层都发落位信号（另有 ${Object.keys(SKIN_POSITIONED).length} 个由皮肤排布）`)
