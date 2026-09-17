import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function resolvedToken(name: string, prop: 'color' | 'box-shadow' = 'color'): string {
  const probe = document.createElement('span')
  probe.style.cssText = `${prop}: var(${name})`
  document.body.append(probe)
  const value = prop === 'color' ? getComputedStyle(probe).color : getComputedStyle(probe).boxShadow
  probe.remove()
  return value
}

/** 排序列表的静态投影：两项各带一颗把手，第一项处于拖起态。 */
function mount() {
  host = document.createElement('div')
  // 断言读的是终值：悬停、按压与释放的过渡时长归零
  host.style.setProperty('--xh-motion-duration-micro', '0ms')
  host.style.setProperty('--xh-motion-duration-press', '0ms')
  host.style.setProperty('--xh-motion-duration-release', '0ms')
  const handle = (extra = '') => `<button type="button" data-scope="sortable" data-part="item-drag-trigger"
    data-xh-action-control="" data-xh-action-profile="icon" data-xh-action-variant="ghost"
    data-xh-action-display="always" data-xh-action-size="xs" aria-roledescription="sortable" ${extra}></button>`
  host.innerHTML = `
    <div data-scope="sortable" data-part="root" data-orientation="vertical">
      <div data-scope="sortable" data-part="item" data-dragging>${handle('data-dragging aria-pressed="true"')}<span>一</span></div>
      <div data-scope="sortable" data-part="item">${handle('aria-pressed="false"')}<span>二</span></div>
      <div data-scope="sortable" data-part="item">${handle('data-disabled aria-disabled="true"')}<span>三</span></div>
    </div>`
  document.body.append(host)
  return {
    items: [...host.querySelectorAll<HTMLElement>('[data-part="item"]')],
    handles: [...host.querySelectorAll<HTMLElement>('[data-part="item-drag-trigger"]')],
  }
}

describe('sortable 把手与拖起面', () => {
  it('把手是 24px 正方的 icon ghost 钮：静息透明、control 圆角、grab 手型，抓手由描边画出', () => {
    const { handles } = mount()
    const handle = handles[1]!
    const rect = handle.getBoundingClientRect()
    expect(rect.width).toBe(24)
    expect(rect.height).toBe(24)
    const style = getComputedStyle(handle)
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.borderTopLeftRadius).toBe('4px')
    expect(style.cursor).toBe('grab')
    expect(style.color).toBe(resolvedToken('--xh-fg-muted'))
    expect(getComputedStyle(handle, '::after').borderLeftWidth).toBe('1px')
  })

  it('白底承载的阶梯：hover 100 → pressed 200 并 0.97 缩放，按住时手型 grabbing', async () => {
    const { handles } = mount()
    const handle = handles[1]!
    await userEvent.hover(handle)
    expect(getComputedStyle(handle).backgroundColor).toBe(resolvedToken('--xh-bg-subtle'))
    expect(getComputedStyle(handle).color).toBe(resolvedToken('--xh-fg-default'))
    handle.setAttribute('data-pressed', '')
    expect(getComputedStyle(handle).backgroundColor).toBe(resolvedToken('--xh-bg-subtle-hover'))
    expect(getComputedStyle(handle).scale).toBe('0.97')
    expect(getComputedStyle(handle).cursor).toBe('grabbing')
  })

  it('拖起的那一项走 lifted 海拔；拖动中的把手各态都是 grabbing 手型', async () => {
    const { items, handles } = mount()
    expect(getComputedStyle(items[0]!).boxShadow).toBe(resolvedToken('--xh-elevation-lifted', 'box-shadow'))
    expect(getComputedStyle(items[1]!).boxShadow).toBe('none')
    expect(getComputedStyle(handles[0]!).cursor).toBe('grabbing')
    await userEvent.hover(handles[0]!)
    expect(getComputedStyle(handles[0]!).cursor).toBe('grabbing')
  })

  it('禁用的把手：禁用前景、无悬停反馈、not-allowed 手型', async () => {
    const { handles } = mount()
    const handle = handles[2]!
    expect(getComputedStyle(handle).color).toBe(resolvedToken('--xh-fg-disabled'))
    await userEvent.hover(handle)
    expect(getComputedStyle(handle).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(handle).cursor).toBe('not-allowed')
  })
})
