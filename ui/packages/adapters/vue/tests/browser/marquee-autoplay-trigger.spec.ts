// 跑马灯的暂停：开关、悬停与聚焦三条路都落到轨道的 animation-play-state 上。
// 钉住四件事：按开关停住与继续即时生效，指针与焦点停在开关上不算悬停 / 聚焦；
// 悬停与聚焦暂停缺省开，写 false 才关；减弱动效下轨道不走，开关一并收起。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhMarqueeAutoplayTrigger, XhMarqueeContent, XhMarqueeRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null
let app: App | null = null

afterEach(async () => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

async function mount(props: Record<string, unknown> = {}, motion?: 'reduce'): Promise<void> {
  host = document.createElement('div')
  if (motion)
    host.dataset.motion = motion
  host.style.cssText = 'padding: 24px; inline-size: 480px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhMarqueeRoot, props, () => [
      h(XhMarqueeContent, null, () => h('a', { href: '#notice' }, '曦寒前端组件库')),
      h(XhMarqueeAutoplayTrigger),
    ]),
  })
  app.mount(host)
  await nextTick()
}

function part(name: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope="marquee"][data-part="${name}"]`)!
}

function playState(): string {
  return getComputedStyle(part('content')).animationPlayState
}

/** 计算后的颜色是否不透明：rgba(…, a) 与 oklch(… / a) 两种写法的 alpha 都得是 1。 */
function opaque(color: string): boolean {
  if (color === 'transparent')
    return false
  const alpha = /\/\s*([\d.]+)\)$/.exec(color) ?? /^rgba\(.*,\s*([\d.]+)\)$/.exec(color)
  return !alpha || Number(alpha[1]) === 1
}

describe('跑马灯的暂停', () => {
  it('按开关停住、再按继续：指针与焦点都还在开关上，轨道也当场跟着走', async () => {
    await mount()
    const trigger = part('autoplay-trigger')
    expect(playState()).toBe('running')
    expect(trigger.getAttribute('aria-label')).toBe('Pause scrolling')

    await userEvent.click(trigger)
    expect(document.activeElement).toBe(trigger)
    expect(playState()).toBe('paused')
    expect(trigger.getAttribute('aria-label')).toBe('Resume scrolling')

    await userEvent.click(trigger)
    expect(trigger.getAttribute('aria-label')).toBe('Pause scrolling')
    expect(playState()).toBe('running')
  })

  it('开关压在窗口行尾一端、上下居中，是可按的方钮', async () => {
    await mount()
    const root = part('root').getBoundingClientRect()
    const trigger = part('autoplay-trigger').getBoundingClientRect()
    expect(Math.abs(root.right - trigger.right)).toBeLessThanOrEqual(8)
    expect(Math.abs((root.top + root.bottom) / 2 - (trigger.top + trigger.bottom) / 2)).toBeLessThanOrEqual(1)
    expect(trigger.width).toBeGreaterThanOrEqual(24)
    expect(Math.round(trigger.width)).toBe(Math.round(trigger.height))
    // 不给内容时画图标：在走是暂停，停住是播放
    expect(getComputedStyle(part('autoplay-trigger'), '::before').maskImage).toContain('url(')
  })

  it('开关压在走动的内容上：静息与悬停的底都不透明，后面的字透不上来', async () => {
    await mount()
    const trigger = part('autoplay-trigger')
    expect(opaque(getComputedStyle(trigger).backgroundColor)).toBe(true)
    await userEvent.hover(trigger)
    expect(opaque(getComputedStyle(trigger).backgroundColor)).toBe(true)
  })

  it('悬停与聚焦暂停缺省开：指针停在轨道上、焦点落进轨道里的链接都会停住', async () => {
    await mount()
    // 轨道一直在动，Playwright 等不到它「稳定」；停在不动的窗口中央，落点同样在轨道上方
    await userEvent.hover(part('root'))
    expect(playState()).toBe('paused')
    await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
    expect(playState()).toBe('running')

    part('content').querySelector<HTMLElement>('a')!.focus()
    expect(playState()).toBe('paused')
  })

  it('pauseOnHover 写 false 才关：悬停与聚焦都不再停住，开关照样管用', async () => {
    await mount({ pauseOnHover: false })
    await userEvent.hover(part('root'))
    expect(playState()).toBe('running')
    part('content').querySelector<HTMLElement>('a')!.focus()
    expect(playState()).toBe('running')

    await userEvent.click(part('autoplay-trigger'))
    expect(playState()).toBe('paused')
  })

  it('减弱动效：轨道不走，开关没有可停的东西，一并收起', async () => {
    await mount({}, 'reduce')
    expect(getComputedStyle(part('content')).animationName).toBe('none')
    expect(getComputedStyle(part('autoplay-trigger')).display).toBe('none')
  })
})
