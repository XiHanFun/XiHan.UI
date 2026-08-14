// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { animate } from '../src/animate'
import { easing } from '../src/easing'
import { setMotionOverride } from '../src/reduced-motion'

interface FakeAnimation {
  finished: Promise<void>
  cancel: () => void
  finish: () => void
}

/** 造一个可手动结算的 Animation，并把它挂到元素上。 */
function stubAnimate(element: HTMLElement): {
  calls: Array<[Keyframe[], KeyframeAnimationOptions]>
  settle: () => void
  abort: () => void
} {
  const calls: Array<[Keyframe[], KeyframeAnimationOptions]> = []
  let settle = (): void => {}
  let abort = (): void => {}

  const create = (frames: Keyframe[], options: KeyframeAnimationOptions): FakeAnimation => {
    calls.push([frames, options])
    let done = (): void => {}
    let fail = (reason: unknown): void => void reason
    const finished = new Promise<void>((resolve, reject) => {
      done = () => resolve()
      fail = reject
    })
    settle = done
    abort = () => fail(new DOMException('aborted', 'AbortError'))
    return {
      finished,
      cancel: () => abort(),
      finish: () => done(),
    }
  }

  Object.defineProperty(element, 'animate', { value: create, configurable: true, writable: true })
  return { calls, settle: () => settle(), abort: () => abort() }
}

function element(): HTMLElement {
  const el = document.createElement('div')
  document.body.append(el)
  return el
}

afterEach(() => {
  setMotionOverride(null)
  document.body.innerHTML = ''
})

describe('减弱动效降级', () => {
  it('不产生中间帧，finished 立即以 finished 结算', async () => {
    setMotionOverride('reduce')
    const el = element()
    const stub = stubAnimate(el)

    const handle = animate(el, [{ opacity: '0' }, { opacity: '1' }], { fill: 'forwards' })

    await expect(handle.finished).resolves.toBe('finished')
    expect(stub.calls).toHaveLength(0)
  })

  it('fill 留值时把末帧写到元素上', async () => {
    setMotionOverride('reduce')
    const el = element()

    animate(el, [{ opacity: '0' }, { opacity: '1', transform: 'none' }], { fill: 'both' })

    expect(el.style.opacity).toBe('1')
    expect(el.style.transform).toBe('none')
  })

  it('fill 不留值时不动元素样式', () => {
    setMotionOverride('reduce')
    const el = element()

    animate(el, [{ opacity: '0' }, { opacity: '1' }], { fill: 'none' })

    expect(el.style.opacity).toBe('')
  })

  it('缺省 fill 就是不留值', () => {
    setMotionOverride('reduce')
    const el = element()

    animate(el, [{ opacity: '1' }])

    expect(el.style.opacity).toBe('')
  })

  it('末帧里的时序字段不当样式写', () => {
    setMotionOverride('reduce')
    const el = element()

    animate(el, [{ opacity: '1', offset: 1, easing: 'linear', composite: 'add' }], { fill: 'forwards' })

    expect(el.style.opacity).toBe('1')
    expect(el.getAttribute('style')).not.toContain('offset')
    expect(el.getAttribute('style')).not.toContain('composite')
  })

  it('camelCase 属性名按连字符写法落地', () => {
    setMotionOverride('reduce')
    const el = element()

    animate(el, [{ backgroundColor: 'red' }], { fill: 'forwards' })

    expect(el.style.backgroundColor).toBe('red')
  })

  it('自定义属性按原名落地', () => {
    setMotionOverride('reduce')
    const el = element()

    animate(el, [{ '--shift': '4px' } as Keyframe], { fill: 'forwards' })

    expect(el.style.getPropertyValue('--shift')).toBe('4px')
  })

  it('空关键帧不抛', async () => {
    setMotionOverride('reduce')
    const handle = animate(element(), [], { fill: 'forwards' })
    await expect(handle.finished).resolves.toBe('finished')
  })
})

describe('宿主缺少 Element.animate', () => {
  it('走同一条降级路径', async () => {
    setMotionOverride('no-preference')
    const el = element()
    Object.defineProperty(el, 'animate', { value: undefined, configurable: true })

    const handle = animate(el, [{ opacity: '1' }], { fill: 'forwards' })

    await expect(handle.finished).resolves.toBe('finished')
    expect(el.style.opacity).toBe('1')
  })
})

describe('走 Web Animations', () => {
  it('把选项按缺省值补全后交给宿主', () => {
    setMotionOverride('no-preference')
    const el = element()
    const stub = stubAnimate(el)

    animate(el, [{ opacity: '0' }, { opacity: '1' }])

    expect(stub.calls).toHaveLength(1)
    expect(stub.calls[0][1]).toEqual({
      duration: 200,
      easing: easing.standard,
      delay: 0,
      iterations: 1,
      direction: 'normal',
      composite: 'replace',
      fill: 'none',
    })
  })

  it('缓动名换算成 cubic-bezier 串', () => {
    setMotionOverride('no-preference')
    const el = element()
    const stub = stubAnimate(el)

    animate(el, [{ opacity: '1' }], { easing: 'easeOut' })

    expect(stub.calls[0][1].easing).toBe(easing.easeOut)
  })

  it('任意 CSS 缓动串原样透传', () => {
    setMotionOverride('no-preference')
    const el = element()
    const stub = stubAnimate(el)

    animate(el, [{ opacity: '1' }], { easing: 'linear(0, 0.5, 1)' })

    expect(stub.calls[0][1].easing).toBe('linear(0, 0.5, 1)')
  })

  it('播完结算成 finished', async () => {
    setMotionOverride('no-preference')
    const el = element()
    const stub = stubAnimate(el)

    const handle = animate(el, [{ opacity: '1' }])
    stub.settle()

    await expect(handle.finished).resolves.toBe('finished')
  })

  it('被打断结算成 cancelled，不抛出去', async () => {
    setMotionOverride('no-preference')
    const el = element()
    stubAnimate(el)

    const handle = animate(el, [{ opacity: '1' }])
    handle.cancel()

    await expect(handle.finished).resolves.toBe('cancelled')
  })

  it('finish 直接跳到终点并结算', async () => {
    setMotionOverride('no-preference')
    const el = element()
    stubAnimate(el)

    const handle = animate(el, [{ opacity: '1' }])
    handle.finish()

    await expect(handle.finished).resolves.toBe('finished')
  })

  it('降级路径下 cancel 与 finish 是空操作', async () => {
    setMotionOverride('reduce')
    const el = element()
    const handle = animate(el, [{ opacity: '1' }])

    expect(() => {
      handle.cancel()
      handle.finish()
    }).not.toThrow()
    await expect(handle.finished).resolves.toBe('finished')
  })

  it('不改元素的内联样式', () => {
    setMotionOverride('no-preference')
    const el = element()
    stubAnimate(el)

    animate(el, [{ opacity: '0' }, { opacity: '1' }], { fill: 'forwards' })

    expect(el.getAttribute('style')).toBeNull()
  })
})

describe('偏好在每次调用时读', () => {
  it('同一元素先降级后正常，各走各的路', async () => {
    const el = element()
    const stub = stubAnimate(el)

    setMotionOverride('reduce')
    await expect(animate(el, [{ opacity: '1' }]).finished).resolves.toBe('finished')
    expect(stub.calls).toHaveLength(0)

    setMotionOverride('no-preference')
    animate(el, [{ opacity: '1' }])
    expect(stub.calls).toHaveLength(1)

    vi.clearAllMocks()
  })
})
