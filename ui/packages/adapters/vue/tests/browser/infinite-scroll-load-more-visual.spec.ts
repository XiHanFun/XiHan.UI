// InfiniteScroll 的取下一页按钮走 Action Control row outline 档：铺满一行、高度随内容、中性描边透明底，
// 白底承载 hover 100 → pressed 200，按下只换面不缩放。盒尺寸、各态底色与按压几何依赖真实布局与伪类，
// 只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhInfiniteScrollLoadMoreTrigger, XhInfiniteScrollRoot, XhInfiniteScrollSentinel } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

/** 列表装在一个 320px 宽的容器里，按钮该铺满这一行。 */
function mountList(): void {
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhInfiniteScrollRoot, null, () => [
      h('div', null, '第 1 条'),
      h(XhInfiniteScrollSentinel),
      h(XhInfiniteScrollLoadMoreTrigger, null, () => '加载更多'),
    ]),
  })
  app.mount(host)
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => setTimeout(resolve, 180))
}

function trigger(): HTMLElement {
  const element = document.querySelector<HTMLElement>('[data-scope=\'infinite-scroll\'][data-part=\'load-more-trigger\']')
  if (!element)
    throw new Error('找不到 infinite-scroll/load-more-trigger')
  return element
}

/** 把令牌解析成这台浏览器上的最终颜色，用来与各态底色对账。 */
function tokenColor(token: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${token})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('取下一页按钮', () => {
  it('铺满一行的中性描边行：宽度由容器给、至少一个控件高、透明底、border-control、控件圆角、无影', async () => {
    mountList()
    await settle()
    const button = trigger()
    const rect = button.getBoundingClientRect()
    expect(rect.width).toBe(320)
    expect(rect.height).toBeGreaterThanOrEqual(36)
    const style = getComputedStyle(button)
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.borderTopColor).toBe(tokenColor('--xh-border-control'))
    expect(style.borderTopWidth).toBe('1px')
    expect(style.borderRadius).toBe('4px')
    expect(style.boxShadow).toBe('none')
    expect(style.color).toBe(tokenColor('--xh-fg-default'))
    expect(style.fontSize).toBe('14px')
    // 文案在这一行里居中
    expect(style.justifyContent).toBe('center')
  })

  it('悬停落白底阶梯的 100 并加深描边', async () => {
    mountList()
    await settle()
    await userEvent.hover(trigger())
    await settle()
    const style = getComputedStyle(trigger())
    expect(style.backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
    expect(style.borderTopColor).toBe(tokenColor('--xh-border-control-hover'))
  })

  it('按住落 200 且只换面不缩放', async () => {
    mountList()
    await settle()
    const button = trigger()
    await userEvent.hover(button)
    await press(button)
    await settle()
    expect(getComputedStyle(button).backgroundColor).toBe(tokenColor('--xh-bg-subtle-hover'))
    expect(getComputedStyle(button).scale).toBe('none')
    await release(button)
    await settle()
  })
})

/**
 * 元素中心在顶层页面上的坐标：测试跑在被缩放过的 iframe 里，CDP 的指针事件按顶层页面的坐标派，
 * 直接拿 getBoundingClientRect 会落到别的地方。
 */
function pagePoint(element: HTMLElement): { x: number, y: number } {
  const rect = element.getBoundingClientRect()
  const frame = window.frameElement?.getBoundingClientRect()
  const scale = frame ? frame.width / window.innerWidth : 1
  const left = frame?.left ?? 0
  const top = frame?.top ?? 0
  return { x: left + (rect.left + rect.width / 2) * scale, y: top + (rect.top + rect.height / 2) * scale }
}

/** 按下与松手拆开派：按住的中间帧只有真实的指针事件才看得见。 */
async function press(element: HTMLElement): Promise<void> {
  const { x, y } = pagePoint(element)
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 })
}

async function release(element: HTMLElement): Promise<void> {
  const { x, y } = pagePoint(element)
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 })
}
