// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { hasUserActivated, INSTANT_ATTR, STAGGER_CAP, STAGGER_INDEX_PROPERTY, trackArrivals } from '../src/behavior/arrival'

let stops: Array<() => void> = []

afterEach(() => {
  stops.forEach(stop => stop())
  stops = []
  document.body.innerHTML = ''
})

function list(count: number): HTMLElement {
  const container = document.createElement('div')
  for (let i = 0; i < count; i++)
    container.append(item(`old-${i}`))
  document.body.append(container)
  return container
}

function item(id: string): HTMLElement {
  const el = document.createElement('div')
  el.dataset.part = 'item'
  el.id = id
  return el
}

function track(container: Element): void {
  stops.push(trackArrivals(container, { item: '[data-part="item"]' }))
}

/** 等 MutationObserver 的回调：它排在微任务里。 */
async function flush(): Promise<void> {
  await Promise.resolve()
}

function index(el: Element): string {
  return (el as HTMLElement).style.getPropertyValue(STAGGER_INDEX_PROPERTY)
}

describe('trackArrivals', () => {
  it('开始时已在的条目打上 data-instant，不写错开序号', () => {
    const container = list(3)
    track(container)
    for (const el of container.children) {
      expect(el.hasAttribute(INSTANT_ATTR)).toBe(true)
      expect(index(el)).toBe('')
    }
  })

  it('之后插入的一批按到达顺序排号，不按 DOM 位置：插在末尾的新条目从 0 起', async () => {
    const container = list(6)
    track(container)
    const a = item('a')
    const b = item('b')
    container.append(a, b)
    await flush()
    expect(index(a)).toBe('0')
    expect(index(b)).toBe('1')
    expect(a.hasAttribute(INSTANT_ATTR)).toBe(false)
  })

  it('一批里按文档顺序排号：先插到后面、再插到前面的，前面那条排 0', async () => {
    const container = list(2)
    track(container)
    const tail = item('tail')
    const head = item('head')
    container.append(tail)
    container.prepend(head)
    await flush()
    expect(index(head)).toBe('0')
    expect(index(tail)).toBe('1')
  })

  it('不同批次各自从 0 起', async () => {
    const container = list(1)
    track(container)
    const first = item('first')
    container.append(first)
    await flush()
    const second = item('second')
    container.append(second)
    await flush()
    expect(index(first)).toBe('0')
    expect(index(second)).toBe('0')
  })

  it('序号封顶：一批来得再多，最后几条都停在封顶那一档', async () => {
    const container = list(0)
    track(container)
    const batch = Array.from({ length: STAGGER_CAP + 3 }, (_, i) => item(`n-${i}`))
    container.append(...batch)
    await flush()
    expect(batch.map(index)).toEqual(['0', '1', '2', '3', '4', '4', '4'])
  })

  it('条目可以包在分组里：插入整个分组时，里面的条目都算这一批', async () => {
    const container = list(0)
    track(container)
    const group = document.createElement('section')
    const a = item('a')
    const b = item('b')
    group.append(a, b)
    container.append(group)
    await flush()
    expect([index(a), index(b)]).toEqual(['0', '1'])
  })

  it('撤掉 hidden 重新露出来算到达：首帧的标记随之撤掉，按这一批重新排号', async () => {
    const container = list(3)
    const [first, second, third] = [...container.children] as HTMLElement[]
    first!.hidden = true
    third!.hidden = true
    track(container)
    third!.hidden = false
    first!.hidden = false
    await flush()
    expect(first!.hasAttribute(INSTANT_ATTR)).toBe(false)
    expect(index(first!)).toBe('0')
    expect(index(third!)).toBe('1')
    // 一直露着的那条不受影响
    expect(second!.hasAttribute(INSTANT_ATTR)).toBe(true)
  })

  it('加上 hidden 不算到达；藏在 hidden 分组里的新条目等分组露出来才算', async () => {
    const container = list(1)
    track(container)
    const [only] = [...container.children] as HTMLElement[]
    only!.hidden = true
    const group = document.createElement('section')
    group.hidden = true
    const inner = item('inner')
    group.append(inner)
    container.append(group)
    await flush()
    expect(index(inner)).toBe('')

    group.hidden = false
    await flush()
    expect(index(inner)).toBe('0')
    expect(index(only!)).toBe('')
  })

  it('停止后不再标记', async () => {
    const container = list(0)
    const stop = trackArrivals(container, { item: '[data-part="item"]' })
    stop()
    const late = item('late')
    container.append(late)
    await flush()
    expect(index(late)).toBe('')
  })
})

describe('hasUserActivated', () => {
  it('读 navigator.userActivation.hasBeenActive', () => {
    const win = { navigator: { userActivation: { hasBeenActive: false } } } as unknown as Window
    expect(hasUserActivated(win)).toBe(false)
    const active = { navigator: { userActivation: { hasBeenActive: true } } } as unknown as Window
    expect(hasUserActivated(active)).toBe(true)
  })

  it('宿主没有这个接口时按已动过手算，进场照常播', () => {
    expect(hasUserActivated({ navigator: {} } as unknown as Window)).toBe(true)
  })
})
