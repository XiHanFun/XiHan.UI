// 浮动钮展开后触发器的「+」转成「×」读得出「再按一下就收起」；展开与收起的错开同一个封顶。
// 伪元素上的旋转与动画延迟只有真实浏览器算得出。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  delete document.documentElement.dataset.motion
})

async function mount(count = 2): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhFloatButtonRoot, null, () => [
      h(XhFloatButtonTrigger),
      h(XhFloatButtonList, null, () => Array.from({ length: count }, (_, i) => h('button', { 'type': 'button', 'aria-label': `动作 ${i + 1}` }, String(i + 1)))),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='float-button'][data-part='${name}']`)!
}

function glyph(prop: string): string {
  return getComputedStyle(part('trigger'), '::before').getPropertyValue(prop)
}

async function toggle(): Promise<void> {
  part('trigger').click()
  await nextTick()
  await nextTick()
}

describe('float-button 触发器', () => {
  it('展开后兜底的「+」转 45° 成「×」，收起转回；转动走切换档（nudge），不硬切', async () => {
    await mount()
    expect(glyph('rotate')).toBe('none')
    await toggle()
    expect(part('trigger').dataset.state).toBe('open')
    const probe = document.createElement('span')
    probe.style.transition = 'rotate var(--xh-motion-duration-nudge) var(--xh-motion-ease-enter-strong)'
    host!.append(probe)
    expect(glyph('transition-property')).toBe('rotate')
    expect(glyph('transition-duration')).toBe(getComputedStyle(probe).transitionDuration)
    expect(glyph('transition-timing-function')).toBe(getComputedStyle(probe).transitionTimingFunction)
    await expect.poll(() => glyph('rotate')).toBe('45deg')
    await toggle()
    await expect.poll(() => glyph('rotate')).toBe('none')
  })

  it('展开的错开与收起、与列表动效同一个封顶：第五条起都停在第四级', async () => {
    await mount(7)
    await toggle()
    const items = [...part('list').children] as HTMLElement[]
    // 步长令牌是 calc 表达式，借一枚探针把它解析成秒
    const probe = document.createElement('span')
    probe.style.animationDelay = 'var(--xh-motion-stagger-step)'
    host!.append(probe)
    const step = Number.parseFloat(getComputedStyle(probe).animationDelay) * 1000
    const delays = items.map(item => Number.parseFloat(getComputedStyle(item).animationDelay) * 1000)
    expect(Math.max(...delays)).toBeCloseTo(4 * step, 0)
    expect(delays[4]).toBeCloseTo(4 * step, 0)
    expect(delays[5]).toBeCloseTo(4 * step, 0)
  })
})
