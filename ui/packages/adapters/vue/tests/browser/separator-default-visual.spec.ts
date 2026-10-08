import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function tokenColor(name: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

function mount(html: string): HTMLElement {
  host = document.createElement('div')
  host.innerHTML = html
  document.body.append(host)
  return host.querySelector<HTMLElement>('[data-part="root"]')!
}

describe('separator 缺省视觉', () => {
  it('横线取 border-default、上下各留 20px', () => {
    const root = mount('<div data-scope="separator" class="xh-scope-separator" data-part="root" data-orientation="horizontal" role="separator"></div>')
    const style = getComputedStyle(root)
    expect(style.backgroundColor).toBe(tokenColor('--xh-border-default'))
    expect(style.marginTop).toBe('20px')
    expect(style.marginBottom).toBe('20px')
  })

  it('竖线左右各留 12px，父容器没有高度时也有一截与文字等高的线', () => {
    const root = mount('<span style="display:inline-flex"><div data-scope="separator" class="xh-scope-separator" data-part="root" data-orientation="vertical" role="separator"></div></span>')
    const style = getComputedStyle(root)
    expect(style.marginLeft).toBe('12px')
    expect(style.marginRight).toBe('12px')
    expect(root.getBoundingClientRect().height).toBeGreaterThan(0)
  })

  it('带分节文字：文字 14px / 500 / 正文色，与两条线各隔 16px，上下留白收到 10px', () => {
    const root = mount(`
      <div data-scope="separator" class="xh-scope-separator" data-part="root" data-orientation="horizontal" role="separator">
        <span data-scope="separator" class="xh-scope-separator" data-part="line" data-orientation="horizontal"></span>
        <span data-scope="separator" class="xh-scope-separator" data-part="content">基本信息</span>
        <span data-scope="separator" class="xh-scope-separator" data-part="line" data-orientation="horizontal"></span>
      </div>`)
    const content = root.querySelector<HTMLElement>('[data-part="content"]')!
    const style = getComputedStyle(content)
    expect(style.fontSize).toBe('14px')
    expect(style.fontWeight).toBe('500')
    expect(style.color).toBe(tokenColor('--xh-fg-default'))
    expect(getComputedStyle(root).columnGap).toBe('16px')
    expect(getComputedStyle(root).marginTop).toBe('10px')
  })
})
