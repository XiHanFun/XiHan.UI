// @vitest-environment jsdom
//
// masonry 的排布要跟着容器宽度与每一项的高度走，量测挂在 ResizeObserver 上。
// jsdom 既没有布局也没有这个构造器，量到的高度恒为 0，一致性套件因此只核得到
// 「排布参数如实落到根上」。这里换一个记录用的观察器进去——不伪造任何尺寸，只核
// 「观察名单跟着项走」与「卸载时摘干净」这两条接线；没有它，组件被拆掉之后观察器还挂着。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XhMasonry } from '../src'

/** 只记「谁被观察了、断开过几次」，不产出任何尺寸。 */
class RecordingResizeObserver {
  static instances: RecordingResizeObserver[] = []
  observed: Element[] = []
  disconnects = 0

  constructor() {
    RecordingResizeObserver.instances.push(this)
  }

  observe(el: Element): void {
    this.observed.push(el)
  }

  unobserve(el: Element): void {
    this.observed = this.observed.filter(node => node !== el)
  }

  disconnect(): void {
    this.disconnects += 1
    this.observed = []
  }
}

const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean, ResizeObserver?: unknown }

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null
let original: unknown

beforeEach(() => {
  original = globals.ResizeObserver
  globals.ResizeObserver = RecordingResizeObserver
  RecordingResizeObserver.instances = []
})

afterEach(async () => {
  await act(async () => {
    root?.unmount()
  })
  host?.remove()
  root = null
  host = null
  globals.ResizeObserver = original
})

async function mount(tree: ReactNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  globals.IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => {
    root!.render(tree)
  })
}

async function rerender(tree: ReactNode): Promise<void> {
  await act(async () => {
    root!.render(tree)
  })
}

function items(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="masonry"][data-part="item"]')]
}

function rootEl(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-scope="masonry"][data-part="root"]')!
}

describe('masonry 的量测观察器', () => {
  it('容器与每一项都在观察名单里', async () => {
    await mount(
      <XhMasonry>
        <div>甲</div>
        <div>乙</div>
        <div>丙</div>
      </XhMasonry>,
    )

    const observer = RecordingResizeObserver.instances[0]!
    expect(observer.observed).toEqual([rootEl(), ...items()])
  })

  it('项增删后名单跟着换人', async () => {
    await mount(
      <XhMasonry>
        <div>甲</div>
        <div>乙</div>
        <div>丙</div>
      </XhMasonry>,
    )
    await rerender(
      <XhMasonry>
        <div>甲</div>
        <div>乙</div>
        <div>丙</div>
        <div>丁</div>
      </XhMasonry>,
    )

    const observer = RecordingResizeObserver.instances[0]!
    expect(items()).toHaveLength(4)
    expect(observer.observed).toEqual([rootEl(), ...items()])
  })

  it('卸载时摘干净', async () => {
    await mount(
      <XhMasonry>
        <div>甲</div>
        <div>乙</div>
        <div>丙</div>
      </XhMasonry>,
    )
    const observer = RecordingResizeObserver.instances[0]!
    const before = observer.disconnects

    await act(async () => {
      root!.unmount()
    })
    root = null

    expect(observer.disconnects).toBeGreaterThan(before)
    expect(observer.observed).toEqual([])
  })
})
