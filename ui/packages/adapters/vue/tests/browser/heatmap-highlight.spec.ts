// 热力图的悬停：详情条与其余图表的提示框同样淡入，指针停着的那一格描一圈。
// jsdom 不跑过渡、没有计算样式，要在真实浏览器里看。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhHeatmapRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

/** 部件身上正在播的过渡属性。 */
function transitions(el: HTMLElement): string[] {
  return el.getAnimations()
    .filter((animation): animation is CSSTransition => animation instanceof CSSTransition)
    .map(animation => animation.transitionProperty)
}

describe('heatmap 悬停', () => {
  it('悬停一格：详情条淡入（不是 display 一下子冒出来），这一格描一圈、其余格不描', async () => {
    host = document.createElement('div')
    host.style.marginBlockStart = '120px'
    document.body.append(host)
    app = createApp({
      render: () => h(XhHeatmapRoot, {
        value: [{ date: '2024-01-03', count: 5 }],
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        animated: false,
      }, {
        // 写了详情条插槽才铺设 tooltip 部件
        tooltip: (details: { count: number } | null) => (details ? [`${details.count} 次`] : []),
      }),
    })
    app.mount(host)
    await nextTick()
    const tooltip = host.querySelector<HTMLElement>(`[data-scope='heatmap'][data-part='tooltip']`)!
    expect(tooltip.dataset.state).toBe('hidden')
    expect(getComputedStyle(tooltip).display).not.toBe('none')
    expect(getComputedStyle(tooltip).visibility).toBe('hidden')

    const cell = host.querySelector<HTMLElement>(`[data-scope='heatmap'][data-part='cell'][data-value='2024-01-03']`)!
    const plainShadow = getComputedStyle(cell).boxShadow
    await userEvent.hover(cell)
    await expect.poll(() => tooltip.dataset.state).toBe('visible')
    expect(transitions(tooltip)).toContain('opacity')
    expect(cell.hasAttribute('data-highlighted')).toBe(true)
    expect(host.querySelectorAll('[data-scope="heatmap"][data-part="cell"][data-highlighted]')).toHaveLength(1)
    await Promise.all(cell.getAnimations().map(animation => animation.finished.catch(() => undefined)))
    expect(getComputedStyle(cell).boxShadow).not.toBe(plainShadow)
  })
})
