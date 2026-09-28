// 提示组与跟随鼠标在真实浏览器里的表现：Provider 里的提示按组给的 openDelay 等待、组内接替、
// 组外的提示不被收走；跟随鼠标的提示按指针落点落位、随移动挪过去，触屏退回锚定到 trigger。
// 等待时长、浮层几何与指针穿透只有真实布局与计时量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhTooltipContent, XhTooltipPositioner, XhTooltipProvider, XhTooltipRoot, XhTooltipTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  await userEvent.hover(document.body)
})

function all(part: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope='tooltip'][data-part='${part}']`)]
}

function content(label: string): HTMLElement {
  return all('content').find(el => el.textContent?.startsWith(label))!
}

function trigger(label: string): HTMLElement {
  return all('trigger').find(el => el.textContent === label)!
}

function tooltip(label: string, props: Record<string, unknown> = {}) {
  return h(XhTooltipRoot, props, () => [
    h(XhTooltipTrigger, null, () => label),
    h(XhTooltipPositioner, null, () => h(XhTooltipContent, null, () => `${label}的说明`)),
  ])
}

async function mount(render: () => unknown): Promise<void> {
  host = document.createElement('div')
  host.style.cssText = 'display:flex;gap:8px;padding:80px'
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
}

const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

describe('tooltip 提示组', () => {
  it('组内提示没写 openDelay 时按组给的缺省等待；组内另一个开着时下一个直接接替', async () => {
    await mount(() => h(XhTooltipProvider, { openDelay: 150, skipDelayDuration: 300 }, () => [tooltip('保存'), tooltip('撤销')]))
    await userEvent.hover(trigger('保存'))
    await wait(60)
    expect(content('保存').dataset.state).toBe('closed')
    await expect.poll(() => content('保存').dataset.state, { timeout: 1000 }).toBe('open')

    await userEvent.hover(trigger('撤销'))
    await expect.poll(() => content('撤销').dataset.state, { timeout: 120 }).toBe('open')
    expect(content('撤销').hasAttribute('data-instant')).toBe(true)
    await expect.poll(() => content('保存').dataset.state).toBe('closed')
  })

  it('不同组互不收走：组外聚焦打开的提示，在组内提示打开后仍然开着', async () => {
    await mount(() => [
      tooltip('组外', { skipDelayDuration: 0 }),
      h(XhTooltipProvider, { openDelay: 0 }, () => [tooltip('组内')]),
    ])
    trigger('组外').focus()
    await expect.poll(() => content('组外').dataset.state).toBe('open')
    await userEvent.hover(trigger('组内'))
    await expect.poll(() => content('组内').dataset.state, { timeout: 1000 }).toBe('open')
    expect(content('组外').dataset.state).toBe('open')
  })
})

describe('tooltip 跟随鼠标', () => {
  function point(type: string, target: HTMLElement, x: number, y: number, pointerType = 'mouse'): void {
    target.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, pointerType, bubbles: type === 'pointermove' }))
  }

  function positioner(label: string): HTMLElement {
    return content(label).closest<HTMLElement>(`[data-scope='tooltip'][data-part='positioner']`)!
  }

  it('浮层按指针落点落位，指针挪动后跟过去；浮层本体不接指针', async () => {
    await mount(() => tooltip('跟随', { followCursor: true, openDelay: 0, placement: 'top' }))
    const target = trigger('跟随')
    const box = target.getBoundingClientRect()
    const y = box.top + box.height / 2
    point('pointerenter', target, box.left + 4, y)
    await expect.poll(() => content('跟随').dataset.state).toBe('open')
    await expect.poll(() => positioner('跟随').hasAttribute('data-positioned')).toBe(true)
    const first = positioner('跟随').getBoundingClientRect()
    // 零尺寸锚点在正上方居中：浮层中线对着指针，底边在指针上方
    expect((first.left + first.right) / 2).toBeCloseTo(box.left + 4, -1)
    expect(first.bottom).toBeLessThanOrEqual(y)

    point('pointermove', target, box.right - 4, y)
    await expect.poll(() => {
      const next = positioner('跟随').getBoundingClientRect()
      return Math.round((next.left + next.right) / 2 - (first.left + first.right) / 2)
    }).toBe(Math.round(box.width - 8))
    expect(getComputedStyle(content('跟随')).pointerEvents).toBe('none')
  })

  it('触屏没有悬停落点：浮层锚回 trigger 居中', async () => {
    await mount(() => tooltip('触屏', { followCursor: true, openDelay: 0, placement: 'top' }))
    const target = trigger('触屏')
    const box = target.getBoundingClientRect()
    point('pointerenter', target, box.left + 2, box.top + 2, 'touch')
    await expect.poll(() => positioner('触屏').hasAttribute('data-positioned')).toBe(true)
    const rect = positioner('触屏').getBoundingClientRect()
    expect((rect.left + rect.right) / 2).toBeCloseTo((box.left + box.right) / 2, 0)
    expect(rect.bottom).toBeLessThanOrEqual(box.top)
  })
})
