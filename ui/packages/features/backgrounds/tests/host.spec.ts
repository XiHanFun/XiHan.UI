// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { meshEffect } from '../src/effects/flow'
import { createBackgroundSurface } from '../src/engine/surface'

/** 手动触发的 ResizeObserver 替身：jsdom 没有这个 API。 */
class FakeResizeObserver {
  static instances: FakeResizeObserver[] = []
  targets: Element[] = []
  disconnected = false
  constructor(private callback: () => void) {
    FakeResizeObserver.instances.push(this)
  }

  observe(target: Element): void {
    this.targets.push(target)
  }

  disconnect(): void {
    this.disconnected = true
  }

  /** 模拟宿主拿到盒子；撤销观察之后不再响，与真实观察器一致。 */
  fire(): void {
    if (!this.disconnected)
      this.callback()
  }
}

function canvasOf(host: HTMLElement): HTMLCanvasElement | null {
  return host.querySelector('canvas')
}

describe('宿主定位', () => {
  beforeEach(() => {
    FakeResizeObserver.instances = []
    vi.stubGlobal('ResizeObserver', FakeResizeObserver)
    // 没有 WebGL2 一律走降级面，本组断言只关心画布怎么挂、宿主定位怎么写
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('宿主量出来是 static 时写一句内联 relative', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)

    createBackgroundSurface(host, { effect: meshEffect })

    expect(host.style.position).toBe('relative')
    expect(canvasOf(host)).not.toBeNull()
  })

  it('宿主自带内联定位时一个字都不动', () => {
    const host = document.createElement('div')
    host.style.position = 'absolute'
    document.body.appendChild(host)

    createBackgroundSurface(host, { effect: meshEffect })

    expect(host.style.position).toBe('absolute')
  })

  it('宿主的定位来自样式表时也不动它', () => {
    const style = document.createElement('style')
    style.textContent = '.positioned { position: absolute; }'
    document.head.appendChild(style)
    const host = document.createElement('div')
    host.className = 'positioned'
    document.body.appendChild(host)

    createBackgroundSurface(host, { effect: meshEffect })

    expect(host.style.position).toBe('')
    style.remove()
  })

  it('宿主还没进文档时不写定位、也不挂画布', () => {
    const host = document.createElement('div')

    createBackgroundSurface(host, { effect: meshEffect })

    expect(host.style.position).toBe('')
    expect(canvasOf(host)).toBeNull()
    expect(FakeResizeObserver.instances).toHaveLength(1)
  })

  it('游离宿主进文档后才定：用类名定位的不会被内联覆盖', () => {
    const style = document.createElement('style')
    style.textContent = '.backdrop { position: absolute; }'
    document.head.appendChild(style)
    const host = document.createElement('div')
    host.className = 'backdrop'

    createBackgroundSurface(host, { effect: meshEffect })
    expect(host.style.position).toBe('')

    document.body.appendChild(host)
    FakeResizeObserver.instances[0]!.fire()

    expect(host.style.position).toBe('')
    expect(canvasOf(host)).not.toBeNull()
    expect(FakeResizeObserver.instances[0]!.disconnected).toBe(true)
    style.remove()
  })

  it('游离宿主进文档后量到 static，才补内联 relative', () => {
    const host = document.createElement('div')

    createBackgroundSurface(host, { effect: meshEffect })
    document.body.appendChild(host)
    FakeResizeObserver.instances[0]!.fire()

    expect(host.style.position).toBe('relative')
    expect(canvasOf(host)).not.toBeNull()
  })

  it('销毁时撤掉观察，不再有未决的写入', () => {
    const host = document.createElement('div')
    const surface = createBackgroundSurface(host, { effect: meshEffect })

    surface.destroy()
    document.body.appendChild(host)
    FakeResizeObserver.instances[0]!.fire()

    expect(host.style.position).toBe('')
    expect(canvasOf(host)).toBeNull()
  })

  it('没有 ResizeObserver 时退回先写下兜底定位', () => {
    vi.stubGlobal('ResizeObserver', undefined)
    const host = document.createElement('div')

    createBackgroundSurface(host, { effect: meshEffect })

    expect(host.style.position).toBe('relative')
    expect(canvasOf(host)).not.toBeNull()
  })
})
