import { cdp } from '@vitest/browser/context'
import { expect } from 'vitest'

/** 伪元素在视口坐标里的盒：由宿主的盒与伪元素的计算样式（定位、inset、尺寸、translate）折算。 */
export interface PseudoBox {
  x: number
  y: number
  width: number
  height: number
  centerX: number
  centerY: number
}

function lengthOf(value: string, base: number): number {
  if (value === 'auto' || value === 'none' || value === '')
    return 0
  return value.endsWith('%') ? base * Number.parseFloat(value) / 100 : Number.parseFloat(value) || 0
}

/**
 * 伪元素的视口盒。getBoundingClientRect 量不到伪元素，只能从计算样式折算：
 * position: static 时盒的起点取宿主的内容起点（行内流里的字形、抓手都从那儿起排，本用例只关心尺寸）；
 * position: absolute 时包含块是宿主的内边距盒：起点从描边内侧算，百分比按内边距盒解析，translate 再按盒自身解析。
 * 只处理横排 LTR，这里的用例都在这一种书写模式下量。
 */
export function pseudoBox(host: HTMLElement, pseudo: '::before' | '::after'): PseudoBox {
  const style = getComputedStyle(host, pseudo)
  const rect = host.getBoundingClientRect()
  const width = Number.parseFloat(style.width) || 0
  const height = Number.parseFloat(style.height) || 0
  let x = rect.left
  let y = rect.top
  if (style.position === 'absolute') {
    const hostStyle = getComputedStyle(host)
    const borderLeft = Number.parseFloat(hostStyle.borderLeftWidth) || 0
    const borderTop = Number.parseFloat(hostStyle.borderTopWidth) || 0
    const paddingBoxWidth = rect.width - borderLeft - (Number.parseFloat(hostStyle.borderRightWidth) || 0)
    const paddingBoxHeight = rect.height - borderTop - (Number.parseFloat(hostStyle.borderBottomWidth) || 0)
    x = rect.left + borderLeft + lengthOf(style.left, paddingBoxWidth)
    y = rect.top + borderTop + lengthOf(style.top, paddingBoxHeight)
  }
  if (style.translate !== 'none') {
    const [tx = '0', ty = '0'] = style.translate.split(' ')
    x += lengthOf(tx, width)
    y += lengthOf(ty, height)
  }
  return { x, y, width, height, centerX: x + width / 2, centerY: y + height / 2 }
}

/** 打开触屏模拟：Chromium 由此把 (pointer: coarse) 置真，家族的 44px 热区规则随之生效。 */
export async function coarsePointer(): Promise<void> {
  await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
  expect(matchMedia('(pointer: coarse)').matches).toBe(true)
}

export async function finePointer(): Promise<void> {
  await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: false })
  expect(matchMedia('(pointer: coarse)').matches).toBe(false)
}
