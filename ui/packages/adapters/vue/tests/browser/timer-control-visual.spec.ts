// Timer 起停钮走 Action Control text outline 档：中性描边、透明底，白底承载 hover 100 → pressed 200，
// 不再抬升、焦点边不随语气。盒尺寸、各态底色与按压缩放依赖真实布局和伪类，只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhTimerControl, XhTimerDisplay, XhTimerItem, XhTimerRoot, XhTimerSeparator } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mountTimer(props: Record<string, unknown> = {}): void {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhTimerRoot, { countdown: true, startMs: 90_000, ...props }, () => [
      h(XhTimerDisplay, null, () => [
        h(XhTimerItem, { unit: 'minutes' }),
        h(XhTimerSeparator),
        h(XhTimerItem, { unit: 'seconds' }),
      ]),
      h(XhTimerControl, null, () => '起停'),
    ]),
  })
  app.mount(host)
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => setTimeout(resolve, 180))
}

function control(): HTMLElement {
  const element = document.querySelector<HTMLElement>('[data-scope=\'timer\'][data-part=\'control\']')
  if (!element)
    throw new Error('找不到 timer/control')
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

describe('计时器的起停钮', () => {
  it('静息是一个控件高的中性描边钮：透明底、border-control、控件圆角、无影', async () => {
    mountTimer()
    await settle()
    const button = control()
    expect(button.getBoundingClientRect().height).toBe(36)
    const style = getComputedStyle(button)
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.borderTopColor).toBe(tokenColor('--xh-border-control'))
    expect(style.borderTopWidth).toBe('1px')
    expect(style.borderRadius).toBe('4px')
    expect(style.boxShadow).toBe('none')
    expect(style.color).toBe(tokenColor('--xh-fg-default'))
  })

  it('尺寸档随 size 换：sm 32px、lg 40px', async () => {
    mountTimer({ size: 'sm' })
    await settle()
    expect(control().getBoundingClientRect().height).toBe(32)
    app?.unmount()
    host?.remove()
    mountTimer({ size: 'lg' })
    await settle()
    expect(control().getBoundingClientRect().height).toBe(40)
  })

  it('悬停落白底阶梯的 100 并加深描边，不再抬升', async () => {
    mountTimer()
    await settle()
    await userEvent.hover(control())
    await settle()
    const style = getComputedStyle(control())
    expect(style.backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
    expect(style.borderTopColor).toBe(tokenColor('--xh-border-control-hover'))
    expect(style.boxShadow).toBe('none')
  })

  it('按住落 200 并缩到 0.97，松手回 1', async () => {
    mountTimer()
    await settle()
    const button = control()
    await userEvent.hover(button)
    await press(button)
    await settle()
    expect(getComputedStyle(button).backgroundColor).toBe(tokenColor('--xh-bg-subtle-hover'))
    expect(getComputedStyle(button).scale).toBe('0.97')
    await release(button)
    // 回程 200ms 缓动，采样时可能还差最后一点
    await settle()
    await settle()
    expect(Number(getComputedStyle(button).scale === 'none' ? 1 : getComputedStyle(button).scale)).toBeCloseTo(1, 2)
  })

  it('键盘聚焦时描边不随语气：焦点环由家族给，边仍是中性 border-control', async () => {
    mountTimer()
    await settle()
    const button = control()
    button.style.setProperty('--xh-_tone', 'rgb(255, 0, 0)')
    await userEvent.tab()
    await settle()
    expect(document.activeElement).toBe(button)
    const style = getComputedStyle(button)
    expect(style.borderTopColor).not.toBe('rgb(255, 0, 0)')
    expect(style.borderTopColor).toBe(tokenColor('--xh-border-control'))
    expect(style.outlineStyle).not.toBe('none')
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
