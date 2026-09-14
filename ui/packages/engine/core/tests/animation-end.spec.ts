// @vitest-environment jsdom

// 退场租约靠 animationend 归还。凡是「animationName 算得出、动画却不会播」的情形，
// 那个事件永远不来，presence 就被永久钉在退场态——组件的遮罩会一直盖在页面上。
//
// jsdom 不把样式表里的 animation 简写算进 getComputedStyle（animationName 恒为空串），
// 所以这条路在 jsdom 里天然走不到，装真实皮肤跑组件也复现不出来。
// 这里直接桩掉 getComputedStyle，把浏览器里的取值喂进来。
import type { RuntimeConfig } from '../src/kernel'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPresence } from '../src/behavior/presence'
import { attachCssExit } from '../src/behavior/presence/animation-end'

const realGetComputedStyle = window.getComputedStyle.bind(window)

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
  document.body.innerHTML = ''
})

function fakeConfig(): RuntimeConfig {
  return { reducedMotion: () => false } as RuntimeConfig
}

/** 把节点的计算样式桩成浏览器里的取值。 */
function stubStyle(node: HTMLElement, style: Partial<CSSStyleDeclaration>): void {
  vi.spyOn(window, 'getComputedStyle').mockImplementation(((el: Element, pseudo?: string | null) => {
    if (el === node)
      return { animationName: 'none', animationDuration: '0s', animationDelay: '0s', display: 'block', ...style } as CSSStyleDeclaration
    return realGetComputedStyle(el as HTMLElement, pseudo)
  }) as typeof window.getComputedStyle)
  // 模拟浏览器实际创建的 CSSAnimation；事件仅用于兑现此测试动画的 finished。
  const finished = new Promise<Animation>((resolve, reject) => {
    node.addEventListener('animationend', (event) => {
      if (event.target === node && (event as AnimationEvent).animationName === style.animationName)
        resolve({} as Animation)
    })
    node.addEventListener('animationcancel', (event) => {
      if (event.target === node && (event as AnimationEvent).animationName === style.animationName)
        reject(new Error('动画已取消'))
    })
  })
  Object.defineProperty(node, 'getAnimations', {
    configurable: true,
    value: () => [{
      animationName: style.animationName,
      playState: 'running',
      effect: { getComputedTiming: () => ({ endTime: 200 }) },
      finished,
    }],
  })
}

async function settle(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
}

function mount(): HTMLElement {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

/** 造一个带 animationName 的动画事件:jsdom 未必有 AnimationEvent 构造器。 */
function animationEvent(type: string, animationName: string): AnimationEvent {
  const ev = new Event(type) as AnimationEvent
  Object.defineProperty(ev, 'animationName', { value: animationName })
  return ev
}

describe('attachCssExit', () => {
  it('没有退场动画时不申领租约，关闭即卸载', () => {
    const el = mount()
    stubStyle(el, { animationName: 'none' })
    const onRenderedChange = vi.fn()
    const p = createPresence({ config: fakeConfig(), open: true, onRenderedChange })
    attachCssExit(el, p, { win: window })
    p.update(false)
    expect(p.rendered).toBe(false)
  })

  // 收起态被皮肤 display:none 的组件正好走这条路：规则匹配得上、animationName 算得出，
  // 但不生成盒子的元素不播动画，animationend 永远不来
  it('元素不生成盒子时不申领租约', () => {
    const el = mount()
    stubStyle(el, { animationName: 'xh-dialog-out', animationDuration: '0.2s', display: 'none' })
    const p = createPresence({ config: fakeConfig(), open: true, onRenderedChange: () => {} })
    attachCssExit(el, p, { win: window })
    p.update(false)
    expect(p.rendered, 'display:none 却申领了租约，退场会永久挂住').toBe(false)
  })

  it('真有动画时申领租约，animationend 到达才卸载', async () => {
    const el = mount()
    stubStyle(el, { animationName: 'xh-dialog-out', animationDuration: '0.2s' })
    const p = createPresence({ config: fakeConfig(), open: true, onRenderedChange: () => {} })
    attachCssExit(el, p, { win: window })
    p.update(false)
    expect(p.rendered, '动画期间要留在 DOM 里').toBe(true)

    el.dispatchEvent(animationEvent('animationend', 'xh-dialog-out'))
    await settle()
    expect(p.rendered).toBe(false)
  })

  // 收起发生在进场还没播完时,进场那支会先抛一个 animationcancel。拿它当退场结束,
  // 退场就一帧都不播——开得越快关,收得越突然
  it('进场被打断抛出的 animationcancel 不算退场结束', async () => {
    const el = mount()
    stubStyle(el, { animationName: 'xh-pop-out', animationDuration: '0.12s' })
    const p = createPresence({ config: fakeConfig(), open: true, onRenderedChange: () => {} })
    attachCssExit(el, p, { win: window })
    p.update(false)

    // 进场那支被取消:名字对不上,租约不该归还
    el.dispatchEvent(animationEvent('animationcancel', 'xh-pop-in'))
    await settle()
    expect(p.rendered, '进场那支的取消不该把退场收掉').toBe(true)

    // 退场那支真的结束了才算数
    el.dispatchEvent(animationEvent('animationend', 'xh-pop-out'))
    await settle()
    expect(p.rendered).toBe(false)
  })

  it('超过声明时长也不猜测完成，实际动画取消后才归还', async () => {
    vi.useFakeTimers()
    const el = mount()
    stubStyle(el, { animationName: 'xh-dialog-out', animationDuration: '0.2s', animationDelay: '0.1s' })
    const p = createPresence({ config: fakeConfig(), open: true, onRenderedChange: () => {} })
    attachCssExit(el, p, { win: window })
    p.update(false)
    expect(p.rendered).toBe(true)

    vi.advanceTimersByTime(10000)
    expect(p.rendered, '暂停或被业务延长的动画不能按声明时长提前结束').toBe(true)
    el.dispatchEvent(animationEvent('animationcancel', 'xh-dialog-out'))
    await vi.runAllTimersAsync()
    expect(p.rendered).toBe(false)
  })

  it('子元素冒泡上来的 animationend 不算数', () => {
    const el = mount()
    const child = document.createElement('span')
    el.appendChild(child)
    stubStyle(el, { animationName: 'xh-dialog-out', animationDuration: '0.2s' })
    const p = createPresence({ config: fakeConfig(), open: true, onRenderedChange: () => {} })
    attachCssExit(el, p, { win: window })
    p.update(false)

    child.dispatchEvent(new Event('animationend', { bubbles: true }))
    expect(p.rendered, '子元素的动画结束不该顶掉自己的租约').toBe(true)
  })
})
