// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { INSTANT_ATTR, STAGGER_INDEX_PROPERTY, trackListMotion } from '../src/behavior/arrival'

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
