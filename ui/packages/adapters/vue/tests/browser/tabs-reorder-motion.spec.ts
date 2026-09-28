// 标签换位之后：挪了位置的标签从原处滑到新位置，与指示条同一段时长、同一条曲线，不是标签瞬跳、指示条却在滑。
// 标签带整体位移占着标签的 translate，换位走 transform 上的一段动画。只有真实浏览器量得出动画在不在跑。
import type { App, Ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhTabsIndicator, XhTabsList, XhTabsRoot, XhTabsTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.documentElement.removeAttribute('data-motion')
})

async function frames(count = 1): Promise<void> {
  await nextTick()
  await nextTick()
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

const LABELS: Record<string, string> = { overview: '概览', members: '成员与权限', billing: '账单' }

async function mount(): Promise<Ref<string[]>> {
  const order = ref(['overview', 'members', 'billing'])
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhTabsRoot, { defaultValue: 'members' }, () =>
      h(XhTabsList, null, () => [
        h(XhTabsIndicator),
        ...order.value.map(value => h(XhTabsTrigger, { key: value, value }, () => LABELS[value])),
      ])),
  })
  app.mount(host)
  await frames(3)
  return order
}

function trigger(value: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope='tabs'][data-part='trigger'][data-value='${value}']`)!
}

/** 节点上在跑的换位动画（Web 动画，不是 CSS 过渡）。 */
function glides(el: Element): Animation[] {
  return el.getAnimations().filter(a => !(a instanceof CSSTransition) && !(a instanceof CSSAnimation))
}

describe('tabs 换位', () => {
  it('宿主按新顺序重排：挪了位置的标签从原处滑过去，时长与曲线与指示条一致', async () => {
    const order = await mount()
    const before = trigger('members').getBoundingClientRect().left
    order.value = ['members', 'overview', 'billing']
    await frames(1)
    const moving = glides(trigger('members'))
    expect(moving.length, '换位走动画').toBe(1)
    // 起帧还在原处
    moving[0]!.pause()
    moving[0]!.currentTime = 0
    expect(trigger('members').getBoundingClientRect().left).toBeCloseTo(before, 0)
    const indicator = host!.querySelector<HTMLElement>(`[data-scope='tabs'][data-part='indicator']`)!
    const slide = indicator.getAnimations().find(a => a instanceof CSSTransition) as CSSTransition | undefined
    const timing = moving[0]!.effect!.getComputedTiming()
    expect(slide, '指示条同时在滑').toBeDefined()
    expect(timing.duration).toBe(slide!.effect!.getComputedTiming().duration)
    expect(timing.easing).toBe(slide!.effect!.getComputedTiming().easing)
  })

  it('减弱动效下换位直接到位', async () => {
    document.documentElement.dataset.motion = 'reduce'
    const order = await mount()
    order.value = ['members', 'overview', 'billing']
    await frames(1)
    expect(glides(trigger('members'))).toEqual([])
  })
})
