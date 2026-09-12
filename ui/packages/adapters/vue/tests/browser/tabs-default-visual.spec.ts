import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function mount(variant?: 'card' | 'line' | 'segment'): { list: HTMLElement, active: HTMLElement } {
  host = document.createElement('div')
  host.innerHTML = `
    <div data-scope="tabs" data-part="root" data-orientation="horizontal"${variant ? ` data-variant="${variant}"` : ''}>
      <div data-scope="tabs" data-part="list">
        <button data-scope="tabs" data-part="trigger" data-state="active">概览</button>
        <button data-scope="tabs" data-part="trigger" data-state="inactive">分析</button>
      </div>
    </div>`
  document.body.append(host)
  return {
    list: host.querySelector<HTMLElement>('[data-part="list"]')!,
    active: host.querySelector<HTMLElement>('[data-part="trigger"][data-state="active"]')!,
  }
}

function paint(el: HTMLElement, property: string): string {
  return getComputedStyle(el).getPropertyValue(property)
}

describe('tabs 默认视觉', () => {
  it('不写变体与显式 segment 画成同一套主标签带', () => {
    const plain = mount()
    const plainPaint = {
      listBackground: paint(plain.list, 'background-color'),
      listPadding: paint(plain.list, 'padding-inline-start'),
      activeBackground: paint(plain.active, 'background-color'),
      activeShadow: paint(plain.active, 'box-shadow'),
    }

    const segment = mount('segment')
    expect({
      listBackground: paint(segment.list, 'background-color'),
      listPadding: paint(segment.list, 'padding-inline-start'),
      activeBackground: paint(segment.active, 'background-color'),
      activeShadow: paint(segment.active, 'box-shadow'),
    }).toEqual(plainPaint)
    expect(plainPaint.listBackground).not.toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(plainPaint.listPadding)).toBeGreaterThan(0)
    expect(plainPaint.activeBackground).not.toBe('rgba(0, 0, 0, 0)')
    expect(plainPaint.activeShadow).not.toBe('none')
  })

  it('line 保持透明标签带与底部基线', () => {
    const line = mount('line')
    const style = getComputedStyle(line.list)

    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(style.paddingInlineStart)).toBe(0)
    expect(Number.parseFloat(style.borderBottomWidth)).toBeGreaterThan(0)
    expect(getComputedStyle(line.active).boxShadow).toBe('none')
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
