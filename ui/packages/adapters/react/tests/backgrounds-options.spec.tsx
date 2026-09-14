// @vitest-environment jsdom
//
// 选项过不过得去，以及卸载有没有真的销毁。
//
// 引擎照常跑真的那一份，只在 createBackgroundSurface 外面套一层记账：
// 记下每次建画面收到的选项，并给返回的画面的 destroy 挂个计数。
//
// 为什么这几条不落在 DOM 上：respectReducedMotion / pauseOffscreen / pointer / autoplay
// 都只在 WebGL2 那条路上有行为，jsdom 里引擎走的是降级面，画面没有时间轴也不绑指针，
// 从 DOM 上看不出任何差别。所以这里只核「适配器有没有把它们原样交下去」——
// 交下去之后引擎怎么用，是引擎自己的事。
import type { BackgroundEffect, BackgroundSurface, BackgroundSurfaceOptions } from '@xihan-ui/backgrounds'
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { XhBackground } from '../src/backgrounds'

interface Creation {
  options: BackgroundSurfaceOptions
  surface: BackgroundSurface
}

const { created } = vi.hoisted(() => ({ created: [] as Creation[] }))

vi.mock('@xihan-ui/backgrounds', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@xihan-ui/backgrounds')>()
  return {
    ...actual,
    createBackgroundSurface(target: HTMLElement, options: BackgroundSurfaceOptions): BackgroundSurface {
      const surface = actual.createBackgroundSurface(target, options)
      // 这几件在降级面上都是空实现，DOM 上看不出来，只能数调用
      for (const method of ['destroy', 'setQuality', 'setCloud', 'play', 'pause'] as const)
        vi.spyOn(surface, method)
      created.push({ options, surface })
      return surface
    },
  }
})

const redEffect: BackgroundEffect = {
  name: 'test-red',
  params: {},
  fallback: () => 'rgb(255, 0, 0)',
}

let container: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  created.length = 0
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

describe('选项转发', () => {
  it('缺省：四个开关都以 true 交给引擎', () => {
    mount(<XhBackground effect={redEffect} />)

    expect(created).toHaveLength(1)
    expect(created[0]!.options).toMatchObject({
      effect: redEffect,
      pointer: true,
      autoplay: true,
      respectReducedMotion: true,
      pauseOffscreen: true,
    })
  })

  it('写了就按写的交：respectReducedMotion 关掉也要原样到引擎手上', () => {
    mount(
      <XhBackground
        effect={redEffect}
        quality="eco"
        params={{ level: 3 }}
        pointer={false}
        autoplay={false}
        respectReducedMotion={false}
        pauseOffscreen={false}
      />,
    )

    expect(created).toHaveLength(1)
    expect(created[0]!.options).toMatchObject({
      quality: 'eco',
      params: { level: 3 },
      pointer: false,
      autoplay: false,
      respectReducedMotion: false,
      pauseOffscreen: false,
    })
  })
})

describe('推到画面上的那几件', () => {
  it('画质换了才调 setQuality，没换不调', () => {
    mount(<XhBackground effect={redEffect} quality="eco" />)
    const { surface } = created[0]!

    // 建画面时就吃了 eco，重渲染同一份不该再推一遍
    render(<XhBackground effect={redEffect} quality="eco" />)
    expect(surface.setQuality).not.toHaveBeenCalled()

    render(<XhBackground effect={redEffect} quality="high" />)
    expect(surface.setQuality).toHaveBeenCalledExactlyOnceWith('high')
  })

  it('autoplay 翻转时才 pause / play', () => {
    mount(<XhBackground effect={redEffect} />)
    const { surface } = created[0]!

    render(<XhBackground effect={redEffect} autoplay={false} />)
    expect(surface.pause).toHaveBeenCalledTimes(1)
    expect(surface.play).not.toHaveBeenCalled()

    render(<XhBackground effect={redEffect} autoplay={false} />)
    expect(surface.pause).toHaveBeenCalledTimes(1)

    render(<XhBackground effect={redEffect} autoplay />)
    expect(surface.play).toHaveBeenCalledTimes(1)
  })

  it('第一份点云直接就位，换形态才走过渡时长', () => {
    const first = { count: 1, positions: new Float32Array(3), colors: new Float32Array(3) }
    const second = { count: 1, positions: new Float32Array(3), colors: new Float32Array(3) }

    mount(<XhBackground effect={redEffect} cloud={first} morphDuration={2} />)
    const { surface } = created[0]!
    expect(surface.setCloud).toHaveBeenCalledExactlyOnceWith(first, { duration: 0 })

    // 同一份点云再渲一遍不重传
    render(<XhBackground effect={redEffect} cloud={first} morphDuration={2} />)
    expect(surface.setCloud).toHaveBeenCalledTimes(1)

    render(<XhBackground effect={redEffect} cloud={second} morphDuration={2} />)
    expect(surface.setCloud).toHaveBeenLastCalledWith(second, { duration: 2 })
  })
})

describe('卸载', () => {
  it('卸载时销毁画面', () => {
    mount(<XhBackground effect={redEffect} />)
    const { surface } = created[0]!

    act(() => root!.unmount())
    root = null

    expect(surface.destroy).toHaveBeenCalledTimes(1)
  })
})
