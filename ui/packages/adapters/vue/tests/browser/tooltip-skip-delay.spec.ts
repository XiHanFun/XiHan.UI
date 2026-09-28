// 横扫一排带提示的按钮：第一个照常等 openDelay、播进场；刚关掉一个的短窗口里（或另一个还开着时）
// 指向下一个，它立即打开且不播进场，上一个随之收起。窗口过后恢复等待。
// 真指针移动、动画是否起播只有真实浏览器看得出。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhTooltipContent, XhTooltipPositioner, XhTooltipRoot, XhTooltipTrigger } from '../../src'
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

async function mount(props: Record<string, unknown> = {}): Promise<void> {
  host = document.createElement('div')
  host.style.cssText = 'display:flex;gap:8px;padding:80px'
  document.body.append(host)
  app = createApp({
    render: () => ['保存', '撤销', '重做'].map(label => h(XhTooltipRoot, { openDelay: 400, ...props }, () => [
      h(XhTooltipTrigger, null, () => label),
      h(XhTooltipPositioner, null, () => h(XhTooltipContent, null, () => `${label}的说明`)),
    ])),
  })
  app.mount(host)
  await nextTick()
}

function all(part: string): HTMLElement[] {
  return [...host!.ownerDocument.querySelectorAll<HTMLElement>(`[data-scope='tooltip'][data-part='${part}']`)]
}

function content(label: string): HTMLElement {
  return all('content').find(el => el.textContent?.startsWith(label))!
}

function trigger(label: string): HTMLElement {
  return all('trigger').find(el => el.textContent === label)!
}

describe('tooltip 跳过延迟', () => {
  it('第一个照常等待并播进场；刚打开一个时指向下一个，立即打开、不播进场，上一个随之收起', async () => {
    await mount()
    await userEvent.hover(trigger('保存'))
    const first = content('保存')
    await expect.poll(() => first.dataset.state, { timeout: 2000 }).toBe('open')
    expect(first.hasAttribute('data-instant')).toBe(false)
    expect(getComputedStyle(first).animationName).toBe('xh-overlay-slide-in')

    await userEvent.hover(trigger('撤销'))
    const second = content('撤销')
    // 不等 openDelay：指针一到就开
    await expect.poll(() => second.dataset.state, { timeout: 150 }).toBe('open')
    expect(second.hasAttribute('data-instant')).toBe(true)
    expect(getComputedStyle(second).animationName).toBe('none')
    await expect.poll(() => first.dataset.state).toBe('closed')
  })

  it('刚关掉一个的窗口内指向下一个同样立即打开；窗口过后恢复等待', async () => {
    await mount({ closeDelay: 0, skipDelayDuration: 300 })
    await userEvent.hover(trigger('保存'))
    await expect.poll(() => content('保存').dataset.state, { timeout: 2000 }).toBe('open')
    await userEvent.hover(document.body)
    await expect.poll(() => content('保存').dataset.state).toBe('closed')

    await userEvent.hover(trigger('撤销'))
    await expect.poll(() => content('撤销').dataset.state, { timeout: 150 }).toBe('open')
    await userEvent.hover(document.body)
    await expect.poll(() => content('撤销').dataset.state).toBe('closed')

    // 窗口过后：又得等 openDelay，也照常播进场
    await new Promise(resolve => setTimeout(resolve, 450))
    await userEvent.hover(trigger('重做'))
    await new Promise(resolve => setTimeout(resolve, 150))
    expect(content('重做').dataset.state).toBe('closed')
    await expect.poll(() => content('重做').dataset.state, { timeout: 2000 }).toBe('open')
    expect(content('重做').hasAttribute('data-instant')).toBe(false)
  })

  it('skipDelayDuration 为 0 时不跳过：每一个都等待', async () => {
    await mount({ closeDelay: 0, skipDelayDuration: 0 })
    await userEvent.hover(trigger('保存'))
    await expect.poll(() => content('保存').dataset.state, { timeout: 2000 }).toBe('open')
    await userEvent.hover(trigger('撤销'))
    await new Promise(resolve => setTimeout(resolve, 150))
    expect(content('撤销').dataset.state).toBe('closed')
  })
})
