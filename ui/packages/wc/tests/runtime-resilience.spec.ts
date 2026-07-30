// @vitest-environment jsdom
import type { ReactiveControllerHost } from '../src/reactive'
import { describe, expect, it } from 'vitest'
import { XhReactiveElement } from '../src/reactive'
import { createLitRuntime } from '../src/runtime/lit-runtime'

function fakeHost(updateComplete: () => Promise<boolean> = () => Promise.resolve(true)): ReactiveControllerHost {
  return {
    addController: () => {},
    removeController: () => {},
    requestUpdate: () => {},
    get updateComplete() {
      return updateComplete()
    },
  }
}

describe('runTrackers：抛错的 tracker 不吞变化', () => {
  it('fn 抛错后同一次依赖变化会补跑，成功后不重复跑', () => {
    const runtime = createLitRuntime(fakeHost())
    let dep = 0
    let calls = 0
    const fired: number[] = []
    runtime.track([() => dep], () => {
      calls += 1
      if (calls === 1)
        throw new Error('boom')
      fired.push(dep)
    })

    dep = 1
    expect(() => runtime.runTrackers()).toThrow('boom')
    expect(fired).toEqual([])

    // 依赖没有再变，靠补跑把这次变化交付出去
    runtime.runTrackers()
    expect(fired).toEqual([1])

    // 已交付，不再重复触发
    runtime.runTrackers()
    expect(fired).toEqual([1])
  })

  it('连续抛错期间依赖继续变化，补跑交付的是最新值', () => {
    const runtime = createLitRuntime(fakeHost())
    let dep = 0
    let ok = false
    const fired: number[] = []
    runtime.track([() => dep], () => {
      if (!ok)
        throw new Error('boom')
      fired.push(dep)
    })

    dep = 1
    expect(() => runtime.runTrackers()).toThrow('boom')
    dep = 2
    expect(() => runtime.runTrackers()).toThrow('boom')
    ok = true
    runtime.runTrackers()
    expect(fired).toEqual([2])
  })
})

describe('runTrackers：单个 tracker 抛错不挡后面的', () => {
  it('前一个恒抛，后一个每次依赖变化都照跑', () => {
    const runtime = createLitRuntime(fakeHost())
    let dep = 0
    const fired: number[] = []
    runtime.track([() => dep], () => {
      throw new Error('t1')
    })
    runtime.track([() => dep], () => {
      fired.push(dep)
    })

    dep = 1
    expect(() => runtime.runTrackers()).toThrow('t1')
    expect(fired).toEqual([1])

    dep = 2
    expect(() => runtime.runTrackers()).toThrow('t1')
    expect(fired).toEqual([1, 2])
  })

  it('异常不被吞掉：多个 tracker 同时抛错时抛 AggregateError 带上全部原因', () => {
    const runtime = createLitRuntime(fakeHost())
    let dep = 0
    const fired: number[] = []
    runtime.track([() => dep], () => {
      throw new Error('t1')
    })
    runtime.track([() => dep], () => {
      fired.push(dep)
    })
    runtime.track([() => dep], () => {
      throw new Error('t3')
    })

    dep = 1
    let caught: unknown
    try {
      runtime.runTrackers()
    }
    catch (error) {
      caught = error
    }
    expect(caught).toBeInstanceOf(AggregateError)
    expect((caught as AggregateError).errors.map(e => (e as Error).message)).toEqual(['t1', 't3'])
    expect(fired).toEqual([1])
  })
})

class XhFlushProbeElement extends XhReactiveElement {
  readonly log: string[] = []
  private rounds = 0

  protected override updated(): void {
    this.rounds += 1
    this.log.push(`update:${this.rounds}`)
    // 第一轮里再排一轮：本轮的 updateComplete 会 resolve 成 false
    if (this.rounds === 1)
      this.requestUpdate()
  }
}
customElements.define('xh-flush-probe', XhFlushProbeElement)

describe('flush：等 DOM 真正落定', () => {
  it('宿主在 updated 里又排了一轮时，回调排在最后一轮之后', async () => {
    const el = document.createElement('xh-flush-probe') as XhFlushProbeElement
    document.body.appendChild(el)
    const runtime = createLitRuntime(el)
    runtime.flush(() => el.log.push('flush-callback'))

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(el.log).toEqual(['update:1', 'update:2', 'flush-callback'])
    el.remove()
  })

  it('宿主永远落不定时不死等，回调仍会跑', async () => {
    let reads = 0
    const runtime = createLitRuntime(fakeHost(() => {
      reads += 1
      return Promise.resolve(false)
    }))
    let done = false
    runtime.flush(() => {
      done = true
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(done).toBe(true)
    expect(reads).toBeGreaterThan(1)
  })
})
