// @vitest-environment jsdom

import type { App } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhMasonry } from '../src'

class RecordingResizeObserver {
  static instances: RecordingResizeObserver[] = []
  observed: Element[] = []

  constructor() {
    RecordingResizeObserver.instances.push(this)
  }

  observe(el: Element): void {
    this.observed.push(el)
  }

  disconnect(): void {
    this.observed = []
  }
}

function rect(width: number, height: number): DOMRect {
  return { bottom: height, height, left: 0, right: width, top: 0, width, x: 0, y: 0, toJSON: () => ({}) }
}

function items(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="masonry"][data-part="item"]')]
}

function rootEl(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-scope="masonry"][data-part="root"]')!
}

let app: App | null = null
let host: HTMLElement | null = null

beforeEach(() => {
  RecordingResizeObserver.instances = []
  vi.stubGlobal('ResizeObserver', RecordingResizeObserver)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (this.dataset.part === 'root')
      return rect(800, 0)
    if (this.dataset.part === 'item')
      return rect(0, [100, 10, 10][Number(this.dataset.index)] ?? 0)
    return rect(0, 0)
  })
})

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

async function mountMasonry(): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhMasonry, { columns: 2 }, {
      default: () => [h('div', '甲'), h('div', '乙'), h('div', '丙')],
    }),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

describe('masonry 的量测观察器', () => {
  it('容器与 Headless 返回的每一项都在观察名单里', async () => {
    await mountMasonry()

    const observer = RecordingResizeObserver.instances[0]!
    expect(observer.observed).toEqual([rootEl(), ...items()])
  })

  it('按 Headless 测量投影后的作者序高度重排', async () => {
    await mountMasonry()

    const assignment = Object.fromEntries(items().map(item => [item.dataset.index, item.dataset.column]))
    expect(assignment).toEqual({ 0: '0', 1: '1', 2: '1' })
  })
})
