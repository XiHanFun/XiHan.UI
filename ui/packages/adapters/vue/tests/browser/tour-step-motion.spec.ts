// 漫游换步：气泡与聚光框同一段位移、同一条曲线一起滑到下一个目标，不是气泡先瞬移过去、光圈再慢慢追上；
// 页面滚动与视口缩放时两者照旧跟手，不拖尾。过渡在不在跑只有真实浏览器量得出来。
import type { App, Ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhTourContent,
  XhTourPositioner,
  XhTourRoot,
  XhTourSpotlight,
  XhTourTitle,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
  document.documentElement.removeAttribute('data-motion')
})

async function frames(count = 1): Promise<void> {
  await nextTick()
  await nextTick()
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='tour'][data-part='${name}']`)!
}

/** 两个目标一左一右、上下错开：换步时气泡与聚光框都要挪一大段。 */
async function mount(): Promise<Ref<number>> {
  const step = ref(0)
  // 目标另放一处：挂载会清空宿主节点里原有的内容
  const targets = document.createElement('div')
  targets.innerHTML = `
    <button id="tour-step-a" style="position: fixed; left: 40px; top: 60px; inline-size: 120px; block-size: 32px">一</button>
    <button id="tour-step-b" style="position: fixed; left: 360px; top: 240px; inline-size: 80px; block-size: 48px">二</button>`
  host = document.createElement('div')
  document.body.append(targets, host)
  app = createApp({
    render: () => h(XhTourRoot, {
      'open': true,
      'value': step.value,
      'onUpdate:value': (next: number) => (step.value = next),
      'steps': [
        { id: 'a', target: '#tour-step-a', title: '第一站' },
        { id: 'b', target: '#tour-step-b', title: '第二站' },
      ],
    }, () => [
      h(XhTourSpotlight),
      h(XhTourPositioner, null, () => h(XhTourContent, null, () => h(XhTourTitle))),
    ]),
  })
  app.mount(host)
  await frames(3)
  for (const el of [part('spotlight'), part('positioner'), part('content')]) {
    for (const animation of el.getAnimations())
      animation.finish()
  }
  return step
}

/** 节点上正在跑的 CSS 过渡：属性 → 时长与曲线。 */
function transitions(el: Element): Map<string, { duration: number, easing: string }> {
  return new Map(el.getAnimations()
    .filter(a => a instanceof CSSTransition)
    .map((a) => {
      const timing = (a as CSSTransition).effect!.getComputedTiming()
      return [(a as CSSTransition).transitionProperty, { duration: Number(timing.duration), easing: String(timing.easing) }]
    }))
}

describe('tour 换步', () => {
  it('气泡与聚光框一起滑：同一段时长、同一条曲线', async () => {
    const step = await mount()
    step.value = 1
    await frames(2)
    const card = transitions(part('positioner'))
    const ring = transitions(part('spotlight'))
    expect(card.has('left') || card.has('top'), '气泡换步走过渡').toBe(true)
    expect(ring.has('left') || ring.has('top'), '聚光框换步走过渡').toBe(true)
    const cardMove = card.get('top') ?? card.get('left')!
    const ringMove = ring.get('top') ?? ring.get('left')!
    expect(cardMove).toEqual(ringMove)
  })

  it('减弱动效下两者同时到位', async () => {
    document.documentElement.dataset.motion = 'reduce'
    const step = await mount()
    step.value = 1
    await frames(2)
    const card = transitions(part('positioner'))
    const ring = transitions(part('spotlight'))
    for (const move of [...card.values(), ...ring.values()])
      expect(move.duration).toBeLessThanOrEqual(1)
  })

  it('换步落定之后滚动页面：两者跟手，不再补过渡', async () => {
    const step = await mount()
    step.value = 1
    await frames(2)
    await Promise.all([part('positioner'), part('spotlight')].flatMap(el => el.getAnimations()).map(a => a.finished.catch(() => undefined)))
    await frames(2)
    window.dispatchEvent(new Event('resize'))
    document.querySelector<HTMLElement>('#tour-step-b')!.style.top = '200px'
    window.dispatchEvent(new Event('scroll'))
    await frames(3)
    expect([...transitions(part('spotlight')).keys()]).toEqual([])
    expect([...transitions(part('positioner')).keys()]).toEqual([])
  })
})
