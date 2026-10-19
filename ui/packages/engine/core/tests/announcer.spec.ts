// @vitest-environment jsdom
// 页面级的礼貌播报器：整页一个 role=status 的播报区，挂在 body 末尾；先清空再写，同一句话也能再播一次；
// 播完一阵清空；被摘掉了下次播时补回来；页面上几份 core 共用同一个；模态打开时不被藏起来。
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { announce, resetAnnouncer } from '../src/kernel/capability/a11y/announcer'
import { hideOutside } from '../src/kernel/capability/a11y/hide-outside'
import { createCounterIdGenerator } from '../src/kernel/id-generator'
import { createScope } from '../src/kernel/scope'
import { getLayerRegistry } from '../src/kernel/structure/layer-registry'

const regions = (doc: Document = document): HTMLElement[] => [...doc.querySelectorAll<HTMLElement>('[data-xh-announcer]')]

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  resetAnnouncer(document)
  vi.useRealTimers()
  document.body.replaceChildren()
})

describe('页面级礼貌播报器', () => {
  it('第一次播报时在 body 末尾建一个礼貌级播报区，空一拍再写下这句话', () => {
    document.body.append(document.createElement('main'))
    announce('已移到左栏第 2 位')
    const [region] = regions()
    expect(regions()).toHaveLength(1)
    expect(document.body.lastElementChild).toBe(region)
    expect([region!.getAttribute('role'), region!.getAttribute('aria-live'), region!.getAttribute('aria-atomic')]).toEqual(['status', 'polite', 'true'])
    expect(region!.textContent).toBe('')
    vi.advanceTimersByTime(50)
    expect(region!.textContent).toBe('已移到左栏第 2 位')
  })

  it('同一句话连播两次：先清空再写，读屏会再读一遍；之后的播报复用同一个播报区', () => {
    announce('已撤销')
    vi.advanceTimersByTime(50)
    announce('已撤销')
    const [region] = regions()
    expect(region!.textContent).toBe('')
    vi.advanceTimersByTime(50)
    expect(region!.textContent).toBe('已撤销')
    expect(regions()).toHaveLength(1)
  })

  it('一拍之内连着播两句只留后一句', () => {
    announce('第一句')
    announce('第二句')
    vi.advanceTimersByTime(50)
    expect(regions()[0]!.textContent).toBe('第二句')
  })

  it('播完一阵清空，读屏的浏览模式翻到页尾时读不到过时的话', () => {
    announce('已清空历史')
    vi.advanceTimersByTime(50)
    vi.advanceTimersByTime(6999)
    expect(regions()[0]!.textContent).toBe('已清空历史')
    vi.advanceTimersByTime(1)
    expect(regions()[0]!.textContent).toBe('')
  })

  it('空字符串只清空，不写', () => {
    announce('一句话')
    vi.advanceTimersByTime(50)
    announce('')
    vi.advanceTimersByTime(50)
    expect(regions()[0]!.textContent).toBe('')
  })

  it('播报区被宿主从 DOM 里摘掉了：下次播报时补回来，仍只有一个', () => {
    announce('一')
    vi.advanceTimersByTime(50)
    document.body.replaceChildren()
    announce('二')
    vi.advanceTimersByTime(50)
    expect(regions()).toHaveLength(1)
    expect(regions()[0]!.textContent).toBe('二')
  })

  it('页面上装了几份 core 也共用同一个播报区', async () => {
    announce('来自第一份')
    vi.resetModules()
    const other = await import('../src/kernel/capability/a11y/announcer')
    other.announce('来自第二份')
    vi.advanceTimersByTime(50)
    expect(regions()).toHaveLength(1)
    expect(regions()[0]!.textContent).toBe('来自第二份')
  })

  it('每个文档各一个：给了 document 就播在那个文档里', () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const doc = frame.contentDocument!
    announce('在小窗里', { document: doc })
    vi.advanceTimersByTime(50)
    expect(regions(doc)).toHaveLength(1)
    expect(regions(doc)[0]!.textContent).toBe('在小窗里')
    expect(regions()).toHaveLength(0)
    resetAnnouncer(doc)
  })

  it('模态打开、背景被藏起来时，播报区不跟着藏', () => {
    const background = document.createElement('main')
    const dialog = document.createElement('div')
    document.body.append(background, dialog)
    announce('先建好播报区')
    vi.advanceTimersByTime(50)
    const stop = hideOutside(() => [dialog], { scope: createScope(null, createCounterIdGenerator()), layerRegistry: getLayerRegistry(document) })
    vi.runOnlyPendingTimers()
    expect(background.getAttribute('aria-hidden')).toBe('true')
    expect(regions()[0]!.hasAttribute('aria-hidden')).toBe(false)
    stop()
  })
})
