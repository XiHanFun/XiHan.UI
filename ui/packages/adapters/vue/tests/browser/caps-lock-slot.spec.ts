// 大写锁定提示不许改变控件尺寸。
//
// 控件根是 inline-flex（收缩包裹），提示区从前是流内文本：一开大写锁定，区内多出一整句话，
// 控件当场宽出那句话的宽度。这一条钉住「两态同宽」，并钉住文字仍留在活区域里。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

/** 收缩包裹的外层：控件的宽由内容决定，撑宽才量得出来。 */
function mount(message: string): { control: HTMLElement, indicator: HTMLElement } {
  host?.remove()
  host = document.createElement('div')
  host.style.cssText = 'inline-size: 900px; display: flex'
  host.innerHTML = `
    <div data-scope="password-input" data-part="root">
      <div data-scope="password-input" data-part="control">
        <input data-scope="password-input" data-part="input" />
        <span data-scope="password-input" data-part="caps-lock-indicator"
              role="status" aria-live="polite"
              data-state="${message ? 'visible' : 'hidden'}">${message}</span>
        <button data-scope="password-input" data-part="visibility-trigger"></button>
      </div>
    </div>`
  document.body.append(host)
  return {
    control: host.querySelector('[data-part="control"]')!,
    indicator: host.querySelector('[data-part="caps-lock-indicator"]')!,
  }
}

const 提示语 = '大写锁定已打开'

describe('大写锁定提示', () => {
  it('开合两态控件同宽：提示不再把控件撑出一整句话', () => {
    const 关 = mount('').control.getBoundingClientRect().width
    const 开 = mount(提示语).control.getBoundingClientRect().width
    expect(开).toBe(关)
  })

  it('那一格恒占一个字形宽，开合都不变', () => {
    const 关 = mount('').indicator.getBoundingClientRect().width
    const 开 = mount(提示语).indicator.getBoundingClientRect().width
    expect(开).toBe(关)
    expect(开).toBeGreaterThan(0)
  })

  it('开着时画出字形，关着时不画', () => {
    const 开 = getComputedStyle(mount(提示语).indicator, '::before')
    expect(开.maskImage).toContain('data:image/svg')
    const 关 = getComputedStyle(mount('').indicator, '::before')
    expect(关.content).toBe('none')
  })

  it('文字仍在盒里：活区域念的是内容，不是名字', () => {
    const { indicator } = mount(提示语)
    expect(indicator.textContent).toBe(提示语)
    expect(indicator.getAttribute('aria-live')).toBe('polite')
    // 只是被推出可视范围，不是从渲染树里摘掉
    expect(getComputedStyle(indicator).display).not.toBe('none')
    expect(getComputedStyle(indicator).visibility).not.toBe('hidden')
  })

  it('长文案照样不撑宽：换语言换不动控件尺寸', () => {
    const 短 = mount(提示语).control.getBoundingClientRect().width
    const 长 = mount('Caps Lock is on — passwords are case sensitive').control.getBoundingClientRect().width
    expect(长).toBe(短)
  })
})
