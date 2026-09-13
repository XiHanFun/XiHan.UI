import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function mount(orientation: 'horizontal' | 'vertical' = 'horizontal') {
  const states = ['completed', 'current', 'incomplete']
  host = document.createElement('div')
  host.innerHTML = `
    <div data-scope="steps" data-part="root" data-orientation="${orientation}">
      <div data-scope="steps" data-part="list" data-orientation="${orientation}">
        ${states.map((state, index) => `
          <div data-scope="steps" data-part="item" data-orientation="${orientation}" data-state="${state}">
            <button data-scope="steps" data-part="trigger" data-state="${state}">
              <span data-scope="steps" data-part="indicator" data-state="${state}">${index + 1}</span>
              <span data-scope="steps" data-part="title" data-state="${state}">步骤 ${index + 1}</span>
              <span data-scope="steps" data-part="description" data-state="${state}">步骤说明</span>
            </button>
            <span data-scope="steps" data-part="separator" data-orientation="${orientation}" data-state="${state}"></span>
          </div>
        `).join('')}
      </div>
    </div>`
  document.body.append(host)

  return {
    list: host.querySelector<HTMLElement>('[data-part="list"]')!,
    items: [...host.querySelectorAll<HTMLElement>('[data-part="item"]')],
    indicators: [...host.querySelectorAll<HTMLElement>('[data-part="indicator"]')],
    separators: [...host.querySelectorAll<HTMLElement>('[data-part="separator"]')],
  }
}

describe('steps 默认视觉', () => {
  it('横向流程保持在同一条轴上', () => {
    const steps = mount()
    const style = getComputedStyle(steps.list)
    const tops = steps.items.map(item => item.getBoundingClientRect().top)

    expect(style.flexDirection).toBe('row')
    expect(style.flexWrap).toBe('nowrap')
    expect(new Set(tops).size).toBe(1)
    expect(steps.items.every(item => item.scrollWidth <= item.clientWidth)).toBe(true)
  })

  it('当前、已完成与未开始标记具有不同层级', () => {
    const steps = mount()
    const [completed, current, incomplete] = steps.indicators.map(indicator => getComputedStyle(indicator))

    expect(current!.backgroundColor).not.toBe(completed!.backgroundColor)
    expect(completed!.backgroundColor).not.toBe(incomplete!.backgroundColor)
    expect(current!.color).not.toBe(incomplete!.color)
    expect(current!.boxShadow).not.toBe('none')
  })

  it('纵向连接线保持清晰长度并与标记同轴', () => {
    const steps = mount('vertical')
    const listStyle = getComputedStyle(steps.list)
    const itemStyle = getComputedStyle(steps.items[0]!)
    const separatorStyle = getComputedStyle(steps.separators[0]!)

    expect(listStyle.flexDirection).toBe('column')
    expect(itemStyle.flexDirection).toBe('column')
    expect(Number.parseFloat(separatorStyle.inlineSize)).toBeGreaterThan(0)
    expect(Number.parseFloat(separatorStyle.blockSize)).toBeGreaterThanOrEqual(28)
    expect(Number.parseFloat(separatorStyle.marginInlineStart)).toBeGreaterThan(0)
  })
})
