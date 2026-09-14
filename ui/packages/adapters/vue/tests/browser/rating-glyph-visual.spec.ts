import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function mount(dir: 'ltr' | 'rtl' = 'ltr') {
  host = document.createElement('div')
  host.dir = dir
  host.innerHTML = `
    <div data-scope="rating" data-part="root">
      <div data-scope="rating" data-part="control">
        <span data-scope="rating" data-part="item" data-highlighted></span>
        <span data-scope="rating" data-part="item" data-highlighted data-half></span>
        <span data-scope="rating" data-part="item"></span>
        <span data-scope="rating" data-part="item"><svg viewBox="0 0 24 24"></svg></span>
      </div>
    </div>`
  document.body.append(host)
  return [...host.querySelectorAll<HTMLElement>('[data-part="item"]')]
}

function maskOf(element: HTMLElement, pseudo: '::after' | '::before'): string {
  const style = getComputedStyle(element, pseudo)
  return style.maskImage || style.webkitMaskImage || ''
}

describe('rating 默认星形视觉', () => {
  it('空条目由两层首方星形绘制完整、半档和未选状态', () => {
    const [full, half, empty] = mount()

    for (const item of [full!, half!, empty!]) {
      expect(item.textContent).toBe('')
      expect(maskOf(item, '::before')).toContain('data:image/svg')
      expect(maskOf(item, '::after')).toContain('data:image/svg')
      expect(item.offsetWidth).toBeGreaterThan(0)
      expect(item.offsetWidth).toBe(item.offsetHeight)
    }

    expect(getComputedStyle(full!, '::after').clipPath).toBe('inset(0px)')
    expect(getComputedStyle(half!, '::after').clipPath).toBe('inset(0px 50% 0px 0px)')
    expect(getComputedStyle(empty!, '::after').clipPath).toBe('inset(0px 100% 0px 0px)')
  })

  it('rTL 半档从右侧点亮', () => {
    const [, half] = mount('rtl')
    expect(getComputedStyle(half!, '::after').clipPath).toBe('inset(0px 0px 0px 50%)')
  })

  it('作者传入图标后皮肤字形让位', () => {
    const custom = mount()[3]!
    expect(getComputedStyle(custom, '::before').content).toBe('none')
    expect(getComputedStyle(custom, '::after').content).toBe('none')
  })
})
