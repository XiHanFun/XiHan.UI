// 值气泡挂在拇指里：拖动时拇指按 --xh-motion-scale-drag 放大，气泡与文字不跟着放大。
// 静态夹具照抄连接层投影的属性，只量皮肤。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function mount(scope: 'slider' | 'color-slider', orientation: 'horizontal' | 'vertical', dir: 'ltr' | 'rtl'): { thumb: HTMLElement, bubble: HTMLElement } {
  const axis = orientation === 'horizontal' ? 'inset-inline-start' : 'inset-block-end'
  host = document.createElement('div')
  host.dir = dir
  host.style.cssText = 'padding: 64px'
  host.innerHTML = `
    <div data-scope="${scope}" data-part="root" data-orientation="${orientation}" style="${orientation === 'horizontal' ? 'inline-size: 240px' : 'block-size: 200px'}">
      <div data-scope="${scope}" data-part="control" data-orientation="${orientation}">
        <div data-scope="${scope}" data-part="track" data-orientation="${orientation}"></div>
        <span data-scope="${scope}" data-part="thumb" data-orientation="${orientation}" data-dragging style="${axis}: 50%">
          <span data-scope="${scope}" data-part="value-text" data-orientation="${orientation}" data-dragging>128</span>
        </span>
      </div>
    </div>`
  document.body.append(host)
  for (const animation of document.getAnimations())
    animation.finish()
  return {
    thumb: host.querySelector<HTMLElement>(`[data-part='thumb']`)!,
    bubble: host.querySelector<HTMLElement>(`[data-part='value-text']`)!,
  }
}

describe.each(['slider'] as const)('%s 值气泡', (scope) => {
  it.each([
    ['horizontal', 'ltr'],
    ['horizontal', 'rtl'],
    ['vertical', 'ltr'],
    ['vertical', 'rtl'],
  ] as const)('%s / %s：拇指放大时气泡按原尺寸画', (orientation, dir) => {
    const { thumb, bubble } = mount(scope, orientation, dir)
    // 拇指确实放大了
    expect(thumb.getBoundingClientRect().width / thumb.offsetWidth).toBeGreaterThan(1.05)
    // 气泡与文字不跟着放大
    const rect = bubble.getBoundingClientRect()
    expect(rect.width / bubble.offsetWidth).toBeCloseTo(1, 2)
    expect(rect.height / bubble.offsetHeight).toBeCloseTo(1, 2)
  })

  it('横排气泡仍在拇指正上方居中', () => {
    for (const dir of ['ltr', 'rtl'] as const) {
      const { thumb, bubble } = mount(scope, 'horizontal', dir)
      const t = thumb.getBoundingClientRect()
      const b = bubble.getBoundingClientRect()
      expect(Math.abs((b.left + b.width / 2) - (t.left + t.width / 2)), dir).toBeLessThanOrEqual(1)
      expect(b.bottom, dir).toBeLessThanOrEqual(t.top)
      host!.remove()
    }
  })
})
