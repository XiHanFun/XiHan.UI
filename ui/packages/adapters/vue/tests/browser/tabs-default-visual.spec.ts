import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function mount(variant?: 'card' | 'line' | 'segment'): { list: HTMLElement, active: HTMLElement, inactive: HTMLElement, indicator: HTMLElement } {
  host = document.createElement('div')
  host.innerHTML = `
    <div data-scope="tabs" data-part="root" data-orientation="horizontal"${variant ? ` data-variant="${variant}"` : ''}>
      <div data-scope="tabs" data-part="list">
        <button data-scope="tabs" data-part="trigger" data-state="active">概览</button>
        <button data-scope="tabs" data-part="trigger" data-state="inactive">分析</button>
        <span data-scope="tabs" data-part="indicator" data-orientation="horizontal" style="inset-inline-start:0;inline-size:40px"></span>
      </div>
    </div>`
  document.body.append(host)
  return {
    list: host.querySelector<HTMLElement>('[data-part="list"]')!,
    active: host.querySelector<HTMLElement>('[data-part="trigger"][data-state="active"]')!,
    inactive: host.querySelector<HTMLElement>('[data-part="trigger"][data-state="inactive"]')!,
    indicator: host.querySelector<HTMLElement>('[data-part="indicator"]')!,
  }
}

function paint(el: HTMLElement, property: string): string {
  return getComputedStyle(el).getPropertyValue(property)
}

/** 语义形状令牌在该元素上解到的像素值。 */
function shapePx(element: HTMLElement, token: string): number {
  const probe = document.createElement('div')
  probe.style.borderTopLeftRadius = `var(${token})`
  element.append(probe)
  const value = Number.parseFloat(getComputedStyle(probe).borderTopLeftRadius)
  probe.remove()
  return value
}

describe('tabs 默认视觉', () => {
  it('不写变体与显式 line 画成同一套：透明标签带，选中项只靠文字与指示条', () => {
    const plain = mount()
    const plainPaint = {
      listBackground: paint(plain.list, 'background-color'),
      listPadding: paint(plain.list, 'padding-inline-start'),
      activeBackground: paint(plain.active, 'background-color'),
      activeShadow: paint(plain.active, 'box-shadow'),
      activeColor: paint(plain.active, 'color'),
      indicatorDisplay: paint(plain.indicator, 'display'),
    }

    const line = mount('line')
    expect({
      listBackground: paint(line.list, 'background-color'),
      listPadding: paint(line.list, 'padding-inline-start'),
      activeBackground: paint(line.active, 'background-color'),
      activeShadow: paint(line.active, 'box-shadow'),
      activeColor: paint(line.active, 'color'),
      indicatorDisplay: paint(line.indicator, 'display'),
    }).toEqual(plainPaint)
    expect(plainPaint.listBackground).toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(plainPaint.listPadding)).toBe(0)
    expect(plainPaint.activeBackground).toBe('rgba(0, 0, 0, 0)')
    expect(plainPaint.activeShadow).toBe('none')
    expect(plainPaint.activeColor).not.toBe(paint(plain.inactive, 'color'))
    expect(plainPaint.indicatorDisplay).not.toBe('none')
    expect(plain.active.offsetWidth).toBe(plain.inactive.offsetWidth)
  })

  it('segment 使用浅色标签带承载浮起的选中面，并收掉指示条', () => {
    const segment = mount('segment')
    const segmentPaint = {
      listBackground: paint(segment.list, 'background-color'),
      listPadding: paint(segment.list, 'padding-inline-start'),
      activeBackground: paint(segment.active, 'background-color'),
      activeShadow: paint(segment.active, 'box-shadow'),
    }
    expect(segmentPaint.listBackground).not.toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(segmentPaint.listPadding)).toBeGreaterThan(0)
    expect(segmentPaint.activeBackground).not.toBe('rgba(0, 0, 0, 0)')
    expect(segmentPaint.activeShadow).not.toBe('none')
    expect(paint(segment.indicator, 'display')).toBe('none')
    // 标签带是 surface 面，标签本体是 control；内层圆角不超过外层圆角减去衬距
    const listRadius = Number.parseFloat(getComputedStyle(segment.list).borderRadius)
    const triggerRadius = Number.parseFloat(getComputedStyle(segment.active).borderRadius)
    expect(listRadius).toBe(shapePx(segment.list, '--xh-shape-surface'))
    expect(triggerRadius).toBe(shapePx(segment.list, '--xh-shape-control'))
    expect(triggerRadius).toBeLessThanOrEqual(listRadius - Number.parseFloat(segmentPaint.listPadding))
    expect(segment.active.offsetWidth).toBe(segment.inactive.offsetWidth)
  })

  it('line 保持透明标签带，仅用文字与内侧指示条表达交互', async () => {
    const line = mount('line')
    const style = getComputedStyle(line.list)
    const restColor = getComputedStyle(line.inactive).color

    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(style.paddingInlineStart)).toBe(0)
    expect(Number.parseFloat(style.borderBottomWidth)).toBe(0)
    expect(getComputedStyle(line.active).boxShadow).toBe('none')
    expect(getComputedStyle(line.active).color).not.toBe(restColor)
    expect(getComputedStyle(line.indicator).bottom).toBe('0px')

    await userEvent.hover(line.inactive)
    expect(getComputedStyle(line.inactive).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(line.inactive).color).not.toBe(restColor)
  })

  it('card 只保留选中标签的卡片面', () => {
    const card = mount('card')
    const listStyle = getComputedStyle(card.list)
    const activeStyle = getComputedStyle(card.active)

    expect(listStyle.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(listStyle.paddingInlineStart)).toBe(0)
    expect(Number.parseFloat(activeStyle.borderTopWidth)).toBeGreaterThan(0)
    expect(activeStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })
})
