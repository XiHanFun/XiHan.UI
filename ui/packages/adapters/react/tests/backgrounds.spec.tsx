// @vitest-environment jsdom
//
// 背景层子入口的接线：画面跟着元素与 props 走。
//
// jsdom 没有 WebGL2，引擎按设计降级成 CSS 静态背景——画布照样挂进宿主、
// 换效果照样重画、destroy 照样把画布摘掉，这三件正是适配器要接对的。
// 断言全部落在真实引擎产出的 DOM 上，没有替身。
import type { BackgroundEffect } from '@xihan-ui/backgrounds'
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useBackground, XhBackground } from '../src/backgrounds'

/** 两个只有降级背景不同的效果，用来看「换效果」有没有真的推下去。 */
const redEffect: BackgroundEffect = {
  name: 'test-red',
  params: {},
  fallback: () => 'rgb(255, 0, 0)',
}

const blueEffect: BackgroundEffect = {
  name: 'test-blue',
  params: {},
  fallback: () => 'rgb(0, 0, 255)',
}

/** 降级背景由参数算出，用来看「换参数」有没有真的推下去。 */
const tunableEffect: BackgroundEffect = {
  name: 'test-tunable',
  params: { level: { kind: 'number', label: '亮度', min: 0, max: 255, step: 1, default: 10 } },
  fallback: params => `rgb(${params.level as number}, 0, 0)`,
}

let container: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  // jsdom 的 getContext 本就返回 null（还带一条 not implemented 噪声），显式钉住它，
  // 让「走降级面」是这组用例声明的前提而不是撞上的
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
})

afterEach(() => {
  act(() => root?.unmount())
  container?.remove()
  container = null
  root = null
  vi.restoreAllMocks()
})

function mount(node: ReactNode): void {
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  act(() => root!.render(node))
}

function render(node: ReactNode): void {
  act(() => root!.render(node))
}

function canvasesIn(el: Element | null): HTMLCanvasElement[] {
  return el === null ? [] : [...el.querySelectorAll('canvas')]
}

describe('xhBackground', () => {
  it('挂上就有画布，卸载就收干净', () => {
    mount(<XhBackground effect={redEffect} data-testid="host" />)
    const host = container!.querySelector('[data-testid="host"]')

    expect(canvasesIn(host)).toHaveLength(1)
    expect(canvasesIn(host)[0]!.style.background).toBe('rgb(255, 0, 0)')

    act(() => root!.unmount())
    root = null
    expect(canvasesIn(container)).toHaveLength(0)
  })

  it('换效果：同一张画布重画，不留下旧的那一张', () => {
    mount(<XhBackground effect={redEffect} data-testid="host" />)
    const host = container!.querySelector('[data-testid="host"]')
    const first = canvasesIn(host)[0]

    render(<XhBackground effect={blueEffect} data-testid="host" />)

    expect(canvasesIn(host)).toHaveLength(1)
    expect(canvasesIn(host)[0]).toBe(first)
    expect(canvasesIn(host)[0]!.style.background).toBe('rgb(0, 0, 255)')
  })

  it('换参数：原地改参数对象里的一项也收得到', () => {
    const params = { level: 10 }
    mount(<XhBackground effect={tunableEffect} params={params} data-testid="host" />)
    const host = container!.querySelector('[data-testid="host"]')
    expect(canvasesIn(host)[0]!.style.background).toBe('rgb(10, 0, 0)')

    // 对象身份不变，只改里面的值：跟着依赖数组走的实现在这里收不到
    params.level = 200
    render(<XhBackground effect={tunableEffect} params={params} data-testid="host" />)

    expect(canvasesIn(host)[0]!.style.background).toBe('rgb(200, 0, 0)')
  })

  it('as 换标签，其余 props 照常落到根元素上', () => {
    mount(<XhBackground as="section" effect={redEffect} className="cover" data-testid="host" />)
    const host = container!.querySelector('[data-testid="host"]')!

    expect(host.tagName.toLowerCase()).toBe('section')
    expect(host.className).toBe('cover')
  })

  it('作者自己的 ref 与内部的 ref 都收得到根元素', () => {
    let seen: Element | null = null
    const capture = (el: Element | null): void => {
      seen = el
    }
    mount(<XhBackground effect={redEffect} ref={capture} data-testid="host" />)
    const host = container!.querySelector('[data-testid="host"]')

    expect(seen).toBe(host)
    expect(canvasesIn(host)).toHaveLength(1)
  })
})

describe('useBackground', () => {
  function Probe({ target }: { target: 'a' | 'b' | 'none' }): ReactNode {
    const visual = useBackground({ effect: redEffect })
    return (
      <>
        <div data-testid="a" ref={target === 'a' ? visual.ref : undefined} />
        <div data-testid="b" ref={target === 'b' ? visual.ref : undefined} />
      </>
    )
  }

  it('ref 挂到哪个元素，画布就在哪个元素里', () => {
    mount(<Probe target="a" />)
    expect(canvasesIn(container!.querySelector('[data-testid="a"]'))).toHaveLength(1)
    expect(canvasesIn(container!.querySelector('[data-testid="b"]'))).toHaveLength(0)
  })

  it('换元素：新元素上建起来，旧元素上收干净', () => {
    mount(<Probe target="a" />)
    render(<Probe target="b" />)

    expect(canvasesIn(container!.querySelector('[data-testid="a"]'))).toHaveLength(0)
    expect(canvasesIn(container!.querySelector('[data-testid="b"]'))).toHaveLength(1)
  })

  it('ref 收到 null：画布收干净，surface 归 null', () => {
    let api: ReturnType<typeof useBackground> | null = null
    function Holder({ on }: { on: boolean }): ReactNode {
      api = useBackground({ effect: redEffect })
      return <div data-testid="a" ref={on ? api.ref : undefined} />
    }

    mount(<Holder on />)
    expect(api!.surface.current).not.toBeNull()

    render(<Holder on={false} />)

    expect(canvasesIn(container!.querySelector('[data-testid="a"]'))).toHaveLength(0)
    expect(api!.surface.current).toBeNull()
  })

  it('换元素时按最近一次渲染的选项建画面，不是第一次渲染那份', () => {
    function Swap({ effect, target }: { effect: BackgroundEffect, target: 'a' | 'b' }): ReactNode {
      const visual = useBackground({ effect })
      return (
        <>
          <div data-testid="a" ref={target === 'a' ? visual.ref : undefined} />
          <div data-testid="b" ref={target === 'b' ? visual.ref : undefined} />
        </>
      )
    }

    mount(<Swap effect={redEffect} target="a" />)
    // 选项换了但元素没换，画面还是原来那张，此时不重建
    render(<Swap effect={blueEffect} target="a" />)
    render(<Swap effect={blueEffect} target="b" />)

    expect(canvasesIn(container!.querySelector('[data-testid="b"]'))[0]!.style.background)
      .toBe('rgb(0, 0, 255)')
  })

  it('同一个元素再交一遍不重建画面', () => {
    let api: ReturnType<typeof useBackground> | null = null
    function Holder(): ReactNode {
      api = useBackground({ effect: redEffect })
      return <div data-testid="a" ref={api.ref} />
    }

    mount(<Holder />)
    const host = container!.querySelector('[data-testid="a"]')!
    const surface = api!.surface.current

    // 自己拿着 ref 往同一个元素上再挂一次：画面不该跟着重建，
    // 重建会让参数与点云的进度全部回到创建那一刻
    act(() => api!.ref(host))

    expect(api!.surface.current).toBe(surface)
    expect(canvasesIn(host)).toHaveLength(1)
  })

  it('重渲染不重建画面：ref 的身份跨渲染稳定', () => {
    const refs: ((element: Element | null) => void)[] = []
    function Counter({ tick }: { tick: number }): ReactNode {
      const visual = useBackground({ effect: redEffect })
      refs.push(visual.ref)
      return <div data-testid="a" data-tick={tick} ref={visual.ref} />
    }

    mount(<Counter tick={1} />)
    const host = container!.querySelector('[data-testid="a"]')
    const first = canvasesIn(host)[0]

    render(<Counter tick={2} />)
    render(<Counter tick={3} />)

    // 回调式 ref 的身份换了，React 会先用 null 调旧的、再用节点调新的，画面跟着销毁重建；
    // 身份稳住，React 一次都不会再调它，画面就是原来那张
    expect(refs.length).toBeGreaterThan(1)
    expect(new Set(refs).size).toBe(1)
    expect(canvasesIn(host)).toHaveLength(1)
    expect(canvasesIn(host)[0]).toBe(first)
  })
})
