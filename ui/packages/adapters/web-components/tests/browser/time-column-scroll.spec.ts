// Web Components 的时间列滚动定位：浮层在 Light DOM 里先带 hidden、打开时才摘掉，列量得出高度要晚一拍；
// 打开之后各列仍要把选中的那一格停在列顶。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface TimePickerElement extends HTMLElement {
  open?: boolean
  updateComplete: Promise<unknown>
}

defineXhElements()

afterEach(() => {
  document.body.innerHTML = ''
})

function items(count: number): string {
  return Array.from({ length: count }, (_, i) => `<div data-xh-part="item" value="${String(i).padStart(2, '0')}"></div>`).join('')
}

function mount(open: boolean): TimePickerElement {
  document.body.innerHTML = `<xh-time-picker ${open ? 'default-open ' : ''}default-value="14:35">
    <div data-xh-part="root">
      <div data-xh-part="control"><span data-xh-part="segment" segment="hour"></span><span data-xh-part="segment" segment="minute"></span><button data-xh-part="trigger"></button></div>
      <div data-xh-part="positioner"><div data-xh-part="content">
        <div data-xh-part="column" unit="hour">${items(24)}</div>
        <div data-xh-part="column" unit="minute">${items(60)}</div>
      </div></div>
    </div>
  </xh-time-picker>`
  return document.querySelector<TimePickerElement>('xh-time-picker')!
}

async function settle(element: TimePickerElement): Promise<void> {
  for (let round = 0; round < 4; round++) {
    await Promise.resolve()
    await element.updateComplete
  }
  for (let frame = 0; frame < 3; frame++)
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function column(unit: string): HTMLElement {
  const found = [...document.querySelectorAll<HTMLElement>(`[data-scope='time-picker'][data-part='column']`)]
    .find(el => el.getAttribute('data-value') === unit)
  if (!found)
    throw new Error(`找不到 ${unit} 列`)
  return found
}

/** 选中的那一格停到列顶时列该滚到的位置。 */
function alignedTop(list: HTMLElement): number {
  const options = [...list.querySelectorAll<HTMLElement>('[role="option"]')]
  const selected = options.find(el => el.getAttribute('aria-selected') === 'true')
  if (!selected)
    throw new Error('这一列没有选中的格')
  const distance = selected.getBoundingClientRect().top - options[0]!.getBoundingClientRect().top
  return Math.min(distance, list.scrollHeight - list.clientHeight)
}

describe('xh-time-picker 时间列滚动定位', () => {
  it.each([true, false])('default-open=%s：打开后各列停在选中的那一格', async (openAtMount) => {
    const element = mount(openAtMount)
    await settle(element)
    if (!openAtMount) {
      element.open = true
      await settle(element)
    }
    for (const unit of ['hour', 'minute']) {
      const list = column(unit)
      expect(alignedTop(list), unit).toBeGreaterThan(0)
      expect(Math.abs(list.scrollTop - alignedTop(list)), unit).toBeLessThanOrEqual(1)
    }
  })
})
