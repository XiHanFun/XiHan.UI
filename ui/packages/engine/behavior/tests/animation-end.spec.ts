// @vitest-environment jsdom

// 退场租约靠 animationend 归还。凡是「animationName 算得出、动画却不会播」的情形，
// 那个事件永远不来，presence 就被永久钉在退场态——组件的遮罩会一直盖在页面上。
//
// jsdom 不把样式表里的 animation 简写算进 getComputedStyle（animationName 恒为空串），
// 所以这条路在 jsdom 里天然走不到，装真实皮肤跑组件也复现不出来。
// 这里直接桩掉 getComputedStyle，把浏览器里的取值喂进来。
import type { RuntimeConfig } from '@xihan-ui/kernel'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPresence } from '../src/presence'
import { attachCssExit } from '../src/presence/animation-end'

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

  it('真有动画时申领租约，animationend 到达才卸载', () => {
    const el = mount()
    stubStyle(el, { animationName: 'xh-dialog-out', animationDuration: '0.2s' })
    const p = createPresence({ config: fakeConfig(), open: true, onRenderedChange: () => {} })
    attachCssExit(el, p, { win: window })
    p.update(false)
    expect(p.rendered, '动画期间要留在 DOM 里').toBe(true)

    el.dispatchEvent(animationEvent('animationend', 'xh-dialog-out'))
    expect(p.rendered).toBe(false)
  })

  // 收起发生在进场还没播完时,进场那支会先抛一个 animationcancel。拿它当退场结束,
  // 退场就一帧都不播——开得越快关,收得越突然
  it('进场被打断抛出的 animationcancel 不算退场结束', () => {
    const el = mount()
    stubStyle(el, { animationName: 'xh-pop-out', animationDuration: '0.12s' })
    const p = createPresence({ config: fakeConfig(), open: true, onRenderedChange: () => {} })
    attachCssExit(el, p, { win: window })
    p.update(false)

    // 进场那支被取消:名字对不上,租约不该归还
    el.dispatchEvent(animationEvent('animationcancel', 'xh-pop-in'))
    expect(p.rendered, '进场那支的取消不该把退场收掉').toBe(true)

    // 退场那支真的结束了才算数
    el.dispatchEvent(animationEvent('animationend', 'xh-pop-out'))
    expect(p.rendered).toBe(false)
  })

  // 动画可能被作者中途换掉、被 UA 跳过、或压根没触发，届时 animationend 同样不来。
  // 租约必须有回收路径，否则一次意外就把组件钉死
  it('animationend 迟迟不来时，兜底票到期自行归还', () => {
    vi.useFakeTimers()
    const el = mount()
    stubStyle(el, { animationName: 'xh-dialog-out', animationDuration: '0.2s', animationDelay: '0.1s' })
    const p = createPresence({ config: fakeConfig(), open: true, onRenderedChange: () => {} })
    attachCssExit(el, p, { win: window })
    p.update(false)
    expect(p.rendered).toBe(true)

    // 时长 200ms + 延迟 100ms + 余量，过了就该自己归还
    vi.advanceTimersByTime(600)
    expect(p.rendered, '兜底票没生效，租约永久挂住').toBe(false)
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
