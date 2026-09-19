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

  it('当前步实心强调，已完成步与未开始步共用中性面、靠对号色分开', () => {
    const steps = mount()
    const [completed, current, incomplete] = steps.indicators.map(indicator => getComputedStyle(indicator))

    // 格状当前（§7.3）：实心品牌底 + 内高光；brand-subtle 退出 completed 语义，走过的步坐回中性面
    expect(current!.backgroundColor).not.toBe(completed!.backgroundColor)
    expect(completed!.backgroundColor).toBe(incomplete!.backgroundColor)
    expect(completed!.color).not.toBe(incomplete!.color)
    expect(current!.color).not.toBe(incomplete!.color)
    expect(current!.boxShadow).not.toBe('none')
  })

  it('已完成步没写内容时由皮肤画 16px 对号', () => {
    const steps = mount()
    const completed = steps.indicators[0]!
    completed.textContent = ''
    const mark = getComputedStyle(completed, '::before')

    expect(mark.maskImage === 'none' && mark.webkitMaskImage === 'none').toBe(false)
    expect(Number.parseFloat(mark.inlineSize)).toBe(16)
    expect(Number.parseFloat(mark.blockSize)).toBe(16)
    expect(mark.backgroundColor).toBe(getComputedStyle(completed).color)
  })

  it('触发器按下只换面不缩放', () => {
    const steps = mount()
    const trigger = steps.items[2]!.querySelector<HTMLElement>('[data-part="trigger"]')!
    const rest = getComputedStyle(trigger).backgroundColor
    trigger.setAttribute('data-pressed', '')
    const pressed = getComputedStyle(trigger)

    expect(pressed.backgroundColor).not.toBe(rest)
    expect(pressed.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(pressed.transform).toBe('none')
  })

  it('序号圆点随触发器按下按淡底容器阶梯换到 300 档，当前步换语气 active 档', () => {
    const steps = mount()
    // 断言读的是终值：按压与释放的过渡时长归零
    host!.style.setProperty('--xh-motion-duration-micro', '0ms')
    host!.style.setProperty('--xh-motion-duration-press', '0ms')
    const token = (name: string): string => {
      const probe = document.createElement('span')
      probe.style.cssText = `color: var(${name})`
      host!.append(probe)
      const value = getComputedStyle(probe).color
      probe.remove()
      return value
    }
    const [completed, current, incomplete] = steps.items.map(item => item.querySelector<HTMLElement>('[data-part="trigger"]')!)
    expect(getComputedStyle(steps.indicators[2]!).backgroundColor).toBe(token('--xh-bg-subtle'))
    incomplete!.setAttribute('data-pressed', '')
    expect(getComputedStyle(steps.indicators[2]!).backgroundColor).toBe(token('--xh-bg-subtle-active'))
    completed!.setAttribute('data-pressed', '')
    expect(getComputedStyle(steps.indicators[0]!).backgroundColor).toBe(token('--xh-bg-subtle-active'))
    current!.setAttribute('data-pressed', '')
    expect(getComputedStyle(steps.indicators[1]!).backgroundColor).toBe(token('--xh-bg-brand-active'))
    expect(getComputedStyle(steps.indicators[1]!).scale).toBe('none')
  })

  it('纵向连接线保持清晰长度并与标记同轴', () => {
    const steps = mount('vertical')
    const listStyle = getComputedStyle(steps.list)
    const itemStyle = getComputedStyle(steps.items[0]!)
    const separatorStyle = getComputedStyle(steps.separators[0]!)

    expect(listStyle.flexDirection).toBe('column')
    expect(itemStyle.flexDirection).toBe('column')
    expect(Number.parseFloat(separatorStyle.inlineSize)).toBe(2)
    expect(Number.parseFloat(separatorStyle.minInlineSize)).toBe(2)
    expect(Number.parseFloat(separatorStyle.blockSize)).toBeGreaterThanOrEqual(28)
    expect(Number.parseFloat(separatorStyle.marginInlineStart)).toBeGreaterThan(0)
  })
})
