// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { glideBy, glideFrom, INSTANT_ATTR, STAGGER_INDEX_PROPERTY, trackListMotion, trackReorder } from '../src/behavior/arrival'

let stops: Array<() => void> = []

afterEach(() => {
  stops.forEach(stop => stop())
  stops = []
  vi.restoreAllMocks()
  delete (HTMLElement.prototype as { getAnimations?: unknown }).getAnimations
  document.body.innerHTML = ''
})

/** jsdom 不排版：给条目钉一个排布位，offsetParent 指向容器。 */
function place(el: HTMLElement, container: HTMLElement, top: number): void {
  let slot = top
  Object.defineProperty(el, 'offsetParent', { configurable: true, get: () => (el.isConnected ? container : null) })
  Object.defineProperty(el, 'offsetLeft', { configurable: true, get: () => 0 })
  Object.defineProperty(el, 'offsetTop', { configurable: true, get: () => slot })
  Object.defineProperty(el, 'offsetWidth', { configurable: true, get: () => 120 })
  Object.defineProperty(el, 'offsetHeight', { configurable: true, get: () => 32 })
  ;(el as HTMLElement & { moveTo: (next: number) => void }).moveTo = (next: number) => {
    slot = next
  }
}

function item(id: string): HTMLElement {
  const el = document.createElement('div')
  el.dataset.part = 'item'
  el.id = id
  const input = document.createElement('input')
  input.name = `rows.${id}`
  input.id = `${id}-input`
  el.append(input)
  el.setAttribute('data-xh-part', 'item')
  return el
}

function list(count: number): HTMLElement {
  const container = document.createElement('div')
  document.body.append(container)
  for (let i = 0; i < count; i++) {
    const el = item(`old-${i}`)
    container.append(el)
    place(el, container, i * 40)
  }
  return container
}

function track(container: Element): void {
  stops.push(trackListMotion(container, { item: '[data-part="item"]' }))
}

/** MutationObserver 的回调排在微任务里。 */
async function flush(): Promise<void> {
  await Promise.resolve()
}

/** 让离场节点身上有一段在播的退场动画，返回结束它的函数。 */
function stubExitAnimation(): () => void {
  let end = (): void => {}
  const finished = new Promise<void>((resolve) => {
    end = resolve
  })
  const animation = {
    animationName: 'xh-fade-out',
    playState: 'running',
    finished,
    effect: { getComputedTiming: () => ({ endTime: 120 }) },
  }
  const original = window.getComputedStyle.bind(window)
  vi.spyOn(window, 'getComputedStyle').mockImplementation((el: Element, pseudo?: string | null) => {
    const style = original(el, pseudo)
    if ((el as HTMLElement).dataset?.state !== 'closed')
      return style
    return new Proxy(style, {
      get: (target, key) => (key === 'animationName' ? 'xh-fade-out' : Reflect.get(target, key)),
    })
  })
  Object.defineProperty(HTMLElement.prototype, 'getAnimations', {
    configurable: true,
    value(this: HTMLElement) {
      return this.dataset.state === 'closed' ? [animation] : []
    },
  })
  return () => {
    animation.playState = 'finished'
    end()
  }
}

describe('到达', () => {
  it('开始时已在的条目属于首帧，之后同一批新到的按到达顺序排号', async () => {
    const container = list(2)
    track(container)
    expect([...container.children].every(el => el.hasAttribute(INSTANT_ATTR))).toBe(true)

    const a = item('a')
    const b = item('b')
    container.append(a, b)
    await flush()
    expect(a.style.getPropertyValue(STAGGER_INDEX_PROPERTY)).toBe('0')
    expect(b.style.getPropertyValue(STAGGER_INDEX_PROPERTY)).toBe('1')
  })

  it('同一批里被挪了位置的已知条目是换位，不算到达', async () => {
    const container = list(3)
    track(container)
    const first = container.children[0] as HTMLElement
    container.append(first)
    await flush()
    expect(first.isConnected).toBe(true)
    expect(first.hasAttribute(INSTANT_ATTR)).toBe(true)
    expect(first.style.getPropertyValue(STAGGER_INDEX_PROPERTY)).toBe('')
    expect(container.querySelectorAll('[data-state="closed"]')).toHaveLength(0)
  })
})

describe('离场', () => {
  it('删掉的条目在原处留一个退场态的替身：摘掉 id、表单名与部件声明，不可交互，表单值照旧', async () => {
    const container = list(3)
    track(container)
    const end = stubExitAnimation()
    const gone = container.children[1] as HTMLElement
    gone.querySelector('input')!.value = '正在填的字'
    gone.remove()
    await flush()

    // 原节点仍归宿主处置，放回去的是替身
    expect(gone.isConnected).toBe(false)
    const ghost = container.querySelector<HTMLElement>('[data-state="closed"]')!
    expect(ghost).not.toBeNull()
    expect(ghost).not.toBe(gone)
    expect(ghost.nextElementSibling?.id).toBe('old-2')
    expect(ghost.dataset.part).toBe('item')
    expect(ghost.hasAttribute('inert')).toBe(true)
    expect(ghost.getAttribute('aria-hidden')).toBe('true')
    expect(ghost.hasAttribute(INSTANT_ATTR)).toBe(false)
    expect(ghost.id).toBe('')
    expect(ghost.hasAttribute('data-xh-part')).toBe(false)
    const input = ghost.querySelector('input')!
    expect(input.id).toBe('')
    expect(input.hasAttribute('name')).toBe(false)
    expect(input.value).toBe('正在填的字')
    expect(ghost.style.position).toBe('absolute')
    expect(ghost.style.top).toBe('40px')
    expect(ghost.style.width).toBe('120px')
    expect(ghost.style.height).toBe('32px')
    // 替身不算条目：它的插入与移除都不再触发到达或离场
    expect(container.querySelectorAll('[data-state="closed"]')).toHaveLength(1)

    end()
    for (let i = 0; i < 5; i++)
      await flush()
    expect(ghost.isConnected).toBe(false)
    expect(container.querySelectorAll('[data-state="closed"]')).toHaveLength(0)
  })

  it('没有退场动画时当场移除', async () => {
    const container = list(2)
    track(container)
    const gone = container.children[0] as HTMLElement
    gone.remove()
    await flush()
    expect(container.querySelector('[data-state="closed"]')).toBeNull()
    expect(container.children).toHaveLength(1)
  })

  it('depart: false 时不放离场替身，留下来的条目照样从旧位置换位', async () => {
    const container = list(2)
    stops.push(trackListMotion(container, { item: '[data-part="item"]', depart: false }))
    stubExitAnimation()
    const gone = container.children[0] as HTMLElement
    const stay = container.children[1] as HTMLElement & { moveTo: (next: number) => void }
    gone.remove()
    stay.moveTo(0)
    const writes: string[] = []
    const setProperty = stay.style.setProperty.bind(stay.style)
    vi.spyOn(stay.style, 'setProperty').mockImplementation((name, value, priority) => {
      if (name === 'translate')
        writes.push(String(value))
      setProperty(name, value, priority)
    })
    await flush()
    expect(container.querySelector('[data-state="closed"]')).toBeNull()
    expect(container.children).toHaveLength(1)
    // 反向补偿：从旧位置（下移 40px）起步
    expect(writes).toContain('0px 40px')
  })

  it('reflow: false 时离场替身照放，留下来的条目不做换位补偿', async () => {
    const container = list(2)
    stops.push(trackListMotion(container, { item: '[data-part="item"]', reflow: false }))
    stubExitAnimation()
    const gone = container.children[0] as HTMLElement
    const stay = container.children[1] as HTMLElement & { moveTo: (next: number) => void }
    gone.remove()
    stay.moveTo(0)
    const writes: string[] = []
    const setProperty = stay.style.setProperty.bind(stay.style)
    vi.spyOn(stay.style, 'setProperty').mockImplementation((name, value, priority) => {
      if (name === 'translate')
        writes.push(String(value))
      setProperty(name, value, priority)
    })
    await flush()
    expect(container.querySelector('[data-state="closed"]')).not.toBeNull()
    expect(writes).toEqual([])
  })

  it('wrapped: true 时删掉包着条目的外壳，里面的条目在外壳原处留替身；缺省不认', async () => {
    for (const wrapped of [true, false]) {
      const container = document.createElement('div')
      document.body.append(container)
      const shells = [0, 1].map((i) => {
        const shell = document.createElement('section')
        const el = item(`wrapped-${i}`)
        shell.append(el)
        container.append(shell)
        place(el, container, i * 40)
        return shell
      })
      stops.push(trackListMotion(container, { item: '[data-part="item"]', wrapped }))
      const end = stubExitAnimation()
      shells[0]!.remove()
      await flush()
      const ghost = container.querySelector<HTMLElement>('[data-state="closed"]')
      if (wrapped) {
        expect(ghost).not.toBeNull()
        expect(ghost!.nextElementSibling).toBe(shells[1])
        expect(ghost!.style.top).toBe('0px')
      }
      else {
        expect(ghost).toBeNull()
      }
      end()
      for (let i = 0; i < 5; i++)
        await flush()
      stops.forEach(stop => stop())
      stops = []
      vi.restoreAllMocks()
      delete (HTMLElement.prototype as { getAnimations?: unknown }).getAnimations
      container.remove()
    }
  })

  it('容器自己被卸下时不放回', async () => {
    const container = list(2)
    track(container)
    stubExitAnimation()
    const gone = container.children[0] as HTMLElement
    gone.remove()
    container.remove()
    await flush()
    expect(container.querySelector('[data-state="closed"]')).toBeNull()
  })

  it('停止时还在播退场的替身立即移除', async () => {
    const container = list(2)
    const stop = trackListMotion(container, { item: '[data-part="item"]' })
    stubExitAnimation()
    const gone = container.children[0] as HTMLElement
    gone.remove()
    await flush()
    expect(container.querySelector('[data-state="closed"]')).not.toBeNull()
    stop()
    expect(container.querySelector('[data-state="closed"]')).toBeNull()
  })

  it('没量到排布位的条目（藏着的）不放回', async () => {
    const container = list(1)
    const hidden = item('hidden')
    container.append(hidden)
    track(container)
    stubExitAnimation()
    hidden.remove()
    await flush()
    expect(container.querySelector('[data-state="closed"]')).toBeNull()
  })
})

describe('换位', () => {
  it('留下来的条目先写反向的 translate，再撤掉交给过渡', async () => {
    const container = list(3)
    track(container)
    const last = container.children[2] as HTMLElement & { moveTo: (next: number) => void }
    const writes: string[] = []
    const setProperty = last.style.setProperty.bind(last.style)
    vi.spyOn(last.style, 'setProperty').mockImplementation((name: string, value: string | null, priority?: string) => {
      if (name === 'translate')
        writes.push(String(value))
      setProperty(name, value, priority)
    })

    ;(container.children[0] as HTMLElement).remove()
    last.moveTo(40)
    await flush()

    expect(writes).toEqual(['0px 40px'])
    expect(last.style.getPropertyValue('translate')).toBe('')
    expect(last.style.getPropertyValue('transition')).toBe('')
  })

  it('排布位没变的条目不动', async () => {
    const container = list(2)
    track(container)
    const first = container.children[0] as HTMLElement
    const spy = vi.spyOn(first.style, 'setProperty')
    container.append(item('tail'))
    await flush()
    expect(spy.mock.calls.filter(([name]) => name === 'translate')).toHaveLength(0)
  })
})

describe('一次换位', () => {
  /** 记下写进 translate 的每一个值。 */
  function translateWrites(el: HTMLElement): string[] {
    const writes: string[] = []
    const setProperty = el.style.setProperty.bind(el.style)
    vi.spyOn(el.style, 'setProperty').mockImplementation((name: string, value: string | null, priority?: string) => {
      if (name === 'translate')
        writes.push(String(value))
      setProperty(name, value, priority)
    })
    return writes
  }

  it('宿主重建了节点也按身份认回：新节点从旧排布位反向补偿后交给过渡，随即停止', async () => {
    const container = list(3)
    stops.push(trackReorder(container, { item: '[data-part="item"]', key: el => el.id }))
    // 宿主把第 1 条卸掉、在末尾挂一个同身份的新节点；中间那条跟着上移
    const moved = item('old-0')
    const middle = container.children[1] as HTMLElement & { moveTo: (next: number) => void }
    const movedWrites = translateWrites(moved)
    const middleWrites = translateWrites(middle)
    ;(container.children[0] as HTMLElement).remove()
    container.append(moved)
    place(moved, container, 80)
    middle.moveTo(0)
    await flush()

    expect(movedWrites).toEqual(['0px -80px'])
    expect(middleWrites).toEqual(['0px 40px'])
    expect(moved.style.getPropertyValue('translate')).toBe('')

    // 只管这一次：之后的变更不再补偿
    const again = translateWrites(container.children[1] as HTMLElement)
    ;(container.children[0] as HTMLElement).remove()
    ;(container.children[0] as HTMLElement & { moveTo: (next: number) => void }).moveTo(0)
    await flush()
    expect(again).toEqual([])
  })

  it('没有增删条目的变更（加非条目节点）不算那一次换位，接着等', async () => {
    const container = list(2)
    stops.push(trackReorder(container, { item: '[data-part="item"]' }))
    const second = container.children[1] as HTMLElement & { moveTo: (next: number) => void }
    const writes = translateWrites(second)
    container.append(document.createElement('span'))
    await flush()
    expect(writes).toEqual([])

    container.prepend(second)
    second.moveTo(0)
    await flush()
    expect(writes).toEqual(['0px 40px'])
  })

  it('条目里嵌着的条目随外层一起走，不再各补一次', async () => {
    const container = list(2)
    const first = container.children[0] as HTMLElement & { moveTo: (next: number) => void }
    const nested = item('nested') as HTMLElement & { moveTo: (next: number) => void }
    first.append(nested)
    place(nested, container, 8)
    stops.push(trackReorder(container, { item: '[data-part="item"]' }))
    const outerWrites = translateWrites(first)
    const nestedWrites = translateWrites(nested)
    container.append(first)
    first.moveTo(40)
    nested.moveTo(48)
    ;(container.children[0] as HTMLElement & { moveTo: (next: number) => void }).moveTo(0)
    await flush()
    expect(outerWrites).toEqual(['0px -40px'])
    expect(nestedWrites).toEqual([])
  })

  it('停止之后不再补偿', async () => {
    const container = list(2)
    const stop = trackReorder(container, { item: '[data-part="item"]' })
    stop()
    const second = container.children[1] as HTMLElement & { moveTo: (next: number) => void }
    const writes = translateWrites(second)
    container.prepend(second)
    second.moveTo(0)
    await flush()
    expect(writes).toEqual([])
  })
})

/** 给节点装一个会记账的 Element.animate：jsdom 没有 Web Animations。 */
function stubAnimate(el: HTMLElement): Array<{ keyframes: Keyframe[], options: KeyframeAnimationOptions }> {
  const calls: Array<{ keyframes: Keyframe[], options: KeyframeAnimationOptions }> = []
  Object.defineProperty(el, 'animate', {
    configurable: true,
    value: (keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
      calls.push({ keyframes, options })
      return { finished: new Promise(() => {}), cancel: () => {}, finish: () => {} }
    },
  })
  return calls
}

describe('沿 transform 换位', () => {
  it('glideBy：从 (dx, dy) 沿 transform 回到原处，时长取 move、曲线取 continuous', () => {
    const el = document.createElement('div')
    document.body.append(el)
    const calls = stubAnimate(el)
    glideBy(el, 24, 0)
    expect(calls).toHaveLength(1)
    expect(calls[0]!.keyframes).toEqual([{ transform: 'translate(24px, 0px)' }, { transform: 'none' }])
    expect(calls[0]!.options.duration).toBe(200)
  })

  it('glideBy：位移为零不播', () => {
    const el = document.createElement('div')
    document.body.append(el)
    const calls = stubAnimate(el)
    glideBy(el, 0, 0)
    expect(calls).toHaveLength(0)
  })

  it('glideFrom：按此前量下的屏幕位置算出位移', () => {
    const el = document.createElement('div')
    document.body.append(el)
    const calls = stubAnimate(el)
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({ left: 100, top: 40 } as DOMRect)
    glideFrom(el, { left: 60, top: 40 })
    expect(calls[0]!.keyframes[0]).toEqual({ transform: 'translate(-40px, 0px)' })
  })

  it('channel: transform 时留下来的条目不写 translate，改播 transform 上的换位', async () => {
    const container = list(3)
    stops.push(trackListMotion(container, { item: '[data-part="item"]', channel: 'transform' }))
    const last = container.children[2] as HTMLElement & { moveTo: (next: number) => void }
    const calls = stubAnimate(last)
    const spy = vi.spyOn(last.style, 'setProperty')
    ;(container.children[0] as HTMLElement).remove()
    last.moveTo(40)
    await flush()
    expect(spy.mock.calls.filter(([name]) => name === 'translate')).toHaveLength(0)
    expect(calls[0]!.keyframes[0]).toEqual({ transform: 'translate(0px, 40px)' })
  })

  it('一批里有条目换了位才回调 onReflow', async () => {
    const container = list(3)
    const onReflow = vi.fn()
    stops.push(trackListMotion(container, { item: '[data-part="item"]', channel: 'transform', onReflow }))
    const last = container.children[2] as HTMLElement & { moveTo: (next: number) => void }
    stubAnimate(last)
    container.append(item('tail'))
    await flush()
    expect(onReflow).not.toHaveBeenCalled()
    ;(container.children[0] as HTMLElement).remove()
    last.moveTo(40)
    await flush()
    expect(onReflow).toHaveBeenCalledTimes(1)
  })
})
