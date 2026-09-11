import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const scopes = ['context-menu', 'hover-card', 'menu', 'menubar', 'popconfirm', 'popover', 'tour', 'tooltip']
let host: HTMLElement | null = null

function mount(scope?: string): HTMLElement {
  host = document.createElement('div')
  host.dataset.scope = scope && scopes.includes(scope) ? scope : 'popover'
  host.dataset.part = 'content'
  host.style.cssText = 'position:relative;width:100px;height:100px;--xh-_overlay-arrow-size:8px;--xh-_overlay-arrow-x:50px;--xh-_overlay-arrow-y:50px'
  const arrow = document.createElement('div')
  if (scope)
    arrow.dataset.scope = scope
  arrow.dataset.part = 'arrow'
  arrow.dataset.placement = 'bottom'
  host.append(arrow)
  document.body.append(host)
  return arrow
}

afterEach(() => {
  host?.remove()
  host = null
})

describe('共享浮层箭头的作用域', () => {
  it.each([undefined, 'business-chart', 'button'])('scope=%s：同名业务部件不被定位、旋转或摘边框', (scope) => {
    const arrow = mount(scope)
    arrow.style.cssText = 'width:24px;height:24px;border:3px solid black'
    const style = getComputedStyle(arrow)
    expect(style.position).toBe('static')
    expect(style.rotate).toBe('none')
    expect([style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth])
      .toEqual(['3px', '3px', '3px', '3px'])
  })

  it.each(scopes)('%s：四向与 RTL 保留既有几何，两条外露边不变', (scope) => {
    const arrow = mount(scope)
    const borders = {
      bottom: ['1px', '0px', '0px', '1px'],
      top: ['0px', '1px', '1px', '0px'],
      right: ['0px', '0px', '1px', '1px'],
      left: ['1px', '1px', '0px', '0px'],
    }
    for (const dir of ['ltr', 'rtl']) {
      host!.dir = dir
      for (const [side, expected] of Object.entries(borders)) {
        arrow.dataset.placement = side
        const style = getComputedStyle(arrow)
        expect(style.position).toBe('absolute')
        expect(style.rotate).toBe('45deg')
        expect(style.width).toBe(style.height)
        expect(Number.parseFloat(style.width)).toBeGreaterThan(0)
        expect([style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth], `${dir}/${side}`)
          .toEqual(expected)
      }
    }
  })
})
