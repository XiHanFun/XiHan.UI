/**
 * 判定线靠占位盒的 rect 与可视区量：jsdom 不排版，盒子全靠钉；滚动就靠"改盒子 + 派 scroll 事件"模拟。
 *
 * @vitest-environment jsdom
 */

import type { AffixChangeDetails, AffixSchema } from '../src/affix'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { AFFIX_DEFAULT_OFFSET, affixMachine, connectAffix, isAffixed } from '../src/affix'

type Props = AffixSchema['props']

const stubs: Array<() => void> = []
function stubMetric(target: object, key: string, value: number): void {
  const original = Object.getOwnPropertyDescriptor(target, key)
  Object.defineProperty(target, key, { value, configurable: true })
  stubs.push(() => {
    if (original)
      Object.defineProperty(target, key, original)
    else
      delete (target as Record<string, unknown>)[key]
  })
}

function stubRect(el: HTMLElement, box: { top: number, left?: number, width?: number, height?: number }): void {
  const { top, left = 0, width = 0, height = 0 } = box
  el.getBoundingClientRect = () => ({
    top,
    left,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect
}

const flush = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

function makeAffix(initial: Props = {}) {
  const changes: AffixChangeDetails[] = []
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ ...initial, onAffixChange: d => changes.push(d) })
  const service = createService(affixMachine, { props: () => props.get(), runtime })
  const root = document.createElement('div')
  document.body.append(root)
  // 缺省摆在视口中段：没滚到线上
  stubRect(root, { top: 300, left: 40, width: 320, height: 48 })
  service.refs.set('getRootEl', () => root)
  runtime.start()
  return {
    service,
    root,
    changes,
    state: () => service.state.get(),
    api: () => connectAffix(service, normalizeProps),
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    scrollTo: async (top: number) => {
      stubRect(root, { top, left: 40, width: 320, height: 48 })
      // 观察器只在量到的滚动量变了才回调：页面的 scrollTop 也得跟着动
      stubMetric(document.documentElement, 'scrollTop', 300 - top)
      window.dispatchEvent(new Event('scroll'))
      await flush()
    },
    stop: () => {
      runtime.stop()
      root.remove()
    },
  }
}

afterEach(() => {
  for (const undo of stubs.splice(0)) undo()
  document.body.innerHTML = ''
})

describe('isAffixed 判定线', () => {
  it('贴上边：占位盒上边到达 offset 即吸住，容差半像素内也算', () => {
    expect(isAffixed({ side: 'top', offset: 0, start: 10, end: 58, viewport: 800 })).toBe(false)
    expect(isAffixed({ side: 'top', offset: 0, start: 0, end: 48, viewport: 800 })).toBe(true)
    expect(isAffixed({ side: 'top', offset: 0, start: -30, end: 18, viewport: 800 })).toBe(true)
    expect(isAffixed({ side: 'top', offset: 12, start: 12.4, end: 60, viewport: 800 })).toBe(true)
    expect(isAffixed({ side: 'top', offset: 12, start: 13, end: 60, viewport: 800 })).toBe(false)
  })

  it('贴下边：占位盒下边越过 viewport - offset 即吸住', () => {
    expect(isAffixed({ side: 'bottom', offset: 0, start: 700, end: 748, viewport: 800 })).toBe(false)
    expect(isAffixed({ side: 'bottom', offset: 0, start: 760, end: 808, viewport: 800 })).toBe(true)
    expect(isAffixed({ side: 'bottom', offset: 20, start: 740, end: 780, viewport: 800 })).toBe(true)
    expect(isAffixed({ side: 'bottom', offset: 20, start: 700, end: 779, viewport: 800 })).toBe(false)
  })

  it('缺省不留空隙', () => {
    expect(AFFIX_DEFAULT_OFFSET).toBe(0)
  })
})

describe('affixMachine 随滚动进出', () => {
  it('起点 released：占位盒不撑高，content 不带 data-fixed，四个定位键写空清掉', async () => {
    const a = makeAffix()
    await flush()
    expect(a.state()).toBe('released')
    expect(a.api().affixed).toBe(false)
    expect((a.api().getRootProps() as Record<string, unknown>).style).toEqual({ blockSize: '' })
    const content = a.api().getContentProps() as Record<string, unknown>
    expect(content['data-fixed']).toBeUndefined()
    expect(content.style).toEqual({ top: '', bottom: '', left: '', width: '' })
    expect(a.changes).toEqual([])
    a.stop()
  })

  it('滚过上边：吸住，钉在 offsetTop 处，占位盒撑成脱流前的高度；滚回去松开，两头各通知一次', async () => {
    const a = makeAffix({ offsetTop: 16 })
    await flush()

    await a.scrollTo(-40)
    expect(a.state()).toBe('affixed')
    expect(a.api().affixed).toBe(true)
    expect((a.api().getRootProps() as Record<string, unknown>).style).toEqual({ blockSize: '48px' })
    const content = a.api().getContentProps() as Record<string, unknown>
    expect(content['data-fixed']).toBe('')
    expect(content.style).toEqual({ top: '16px', bottom: '', left: '40px', width: '320px' })
    expect(a.changes).toEqual([{ affixed: true }])

    // 仍在线上再滚一格：状态不变、不重复通知，几何照旧跟着量
    await a.scrollTo(-80)
    expect(a.state()).toBe('affixed')
    expect(a.changes).toEqual([{ affixed: true }])

    await a.scrollTo(200)
    expect(a.state()).toBe('released')
    expect(a.changes).toEqual([{ affixed: true }, { affixed: false }])
    expect((a.api().getContentProps() as Record<string, unknown>).style).toEqual({ top: '', bottom: '', left: '', width: '' })
    a.stop()
  })

  it('给了 offsetBottom 就改贴下边：钉住的距离按窗口视口底边算', async () => {
    stubMetric(document.documentElement, 'clientHeight', 600)
    const a = makeAffix({ offsetBottom: 24 })
    await flush()
    expect(a.state()).toBe('released')

    // 下边 620 越过 600 - 24 的线
    await a.scrollTo(572)
    expect(a.state()).toBe('affixed')
    const content = a.api().getContentProps() as Record<string, unknown>
    expect(content.style).toMatchObject({ top: '', bottom: '24px' })
    expect(a.changes).toEqual([{ affixed: true }])
    a.stop()
  })
})
