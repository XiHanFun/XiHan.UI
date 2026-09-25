// 圆点呼吸：进行中、给不出进度的状态点。钉住三件事：圆点挂上共享关键帧与呼吸令牌，
// 光环只播 3 轮，减弱动效下两者都停、圆点停在满不透明度。数字角标不呼吸。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhBadge } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null
let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

async function mount(props: Record<string, unknown>, motion?: 'reduce'): Promise<HTMLElement> {
  host = document.createElement('div')
  if (motion)
    host.dataset.motion = motion
  host.style.cssText = 'padding: 24px'
  document.body.append(host)
  app = createApp({ render: () => h(XhBadge, props, () => h('span', '录制')) })
  app.mount(host)
  await nextTick()
  return host.querySelector<HTMLElement>('[data-scope="badge"][data-part="indicator"]')!
}

describe('圆点呼吸', () => {
  it('圆点挂上 xh-breathe，周期与缓动取呼吸令牌；光环 xh-breathe-halo 只播 3 轮', async () => {
    const dot = await mount({ dot: true, pulse: true, tone: 'danger', label: '录制中' })
    const style = getComputedStyle(dot)
    expect(style.animationName).toBe('xh-breathe')
    expect(style.animationDuration).toBe('3.6s')
    expect(style.animationIterationCount).toBe('infinite')
    expect(style.animationTimingFunction).toBe('cubic-bezier(0.37, 0, 0.63, 1)')
    const halo = getComputedStyle(dot, '::after')
    expect(halo.animationName).toBe('xh-breathe-halo')
    expect(halo.animationIterationCount).toBe('3')
  })

  it('减弱动效下两者都停，圆点停在满不透明度', async () => {
    const dot = await mount({ dot: true, pulse: true, tone: 'danger', label: '录制中' }, 'reduce')
    expect(getComputedStyle(dot).animationName).toBe('none')
    expect(getComputedStyle(dot).opacity).toBe('1')
    expect(getComputedStyle(dot, '::after').animationName).toBe('none')
  })

  it('数字角标写了 pulse 也不呼吸', async () => {
    const badge = await mount({ count: 3, pulse: true, tone: 'danger' })
    expect(getComputedStyle(badge).animationName).toBe('none')
  })
})
