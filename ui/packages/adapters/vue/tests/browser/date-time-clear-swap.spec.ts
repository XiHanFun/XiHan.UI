import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const FAMILIES = ['date-picker', 'time-picker'] as const

let host: HTMLElement | null = null

function mount(): void {
  host = document.createElement('div')
  host.innerHTML = FAMILIES.map(family => `
    <div data-family="${family}">
      <div data-scope="${family}" data-part="root">
        <div data-scope="${family}" data-part="control">
          <div data-scope="${family}" data-part="segment-group"></div>
          <button data-scope="${family}" data-part="clear-trigger" hidden></button>
          <button data-scope="${family}" data-part="trigger"></button>
        </div>
      </div>
    </div>
  `).join('')
  document.body.append(host)
}

function part(family: typeof FAMILIES[number], name: string): HTMLElement {
  const element = host?.querySelector<HTMLElement>(`[data-family='${family}'] [data-part='${name}']`)
  if (!element)
    throw new Error(`缺少 ${family}/${name}`)
  return element
}

afterEach(() => {
  host?.remove()
  host = null
})

describe('日期与时间选择器的尾部动作互斥', () => {
  it.each(FAMILIES)('%s：空值显示选择图标，有值时清空按钮原位接替，清空后恢复', (family) => {
    mount()
    const control = part(family, 'control')
    const clear = part(family, 'clear-trigger')
    const trigger = part(family, 'trigger')
    const width = control.getBoundingClientRect().width

    expect(getComputedStyle(clear).display).toBe('none')
    expect(getComputedStyle(trigger).display).toBe('flex')

    clear.removeAttribute('hidden')
    expect(getComputedStyle(clear).display).toBe('flex')
    expect(getComputedStyle(trigger).display).toBe('none')
    expect(control.getBoundingClientRect().width).toBe(width)

    clear.setAttribute('hidden', '')
    expect(getComputedStyle(clear).display).toBe('none')
    expect(getComputedStyle(trigger).display).toBe('flex')
    expect(control.getBoundingClientRect().width).toBe(width)
  })
})
