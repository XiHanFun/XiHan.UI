// @vitest-environment jsdom
//
// tour 步骤的目标：选择器、元素、返回元素的函数三种写法；进入某一步时目标缺席就盯住文档等它出现，
// 等到了即锚定并量高亮框，等满 targetTimeout 仍没有则该步按居中呈现。
import type { TourSchema, TourStep } from '../src/tour'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectTour, TOUR_TARGET_TIMEOUT, tourMachine } from '../src/tour'

type Props = TourSchema['props']
type Dict = Record<string, unknown>

function stubRect(el: HTMLElement, box: { x: number, y: number, width: number, height: number }): void {
  el.getBoundingClientRect = () => ({
    ...box,
    top: box.y,
    left: box.x,
    right: box.x + box.width,
    bottom: box.y + box.height,
    toJSON: () => ({}),
  }) as DOMRect
}

function make(props: Partial<Props>) {
  const runtime = createVanillaRuntime()
  const service = createService(tourMachine, { runtime, props: () => ({ defaultOpen: true, ...props }) as Props })
  runtime.start()
  return {
    service,
    api: () => connectTour(service, normalizeProps),
    stop: () => runtime.stop(),
  }
}

/** 效应的量测推迟到宿主渲完这一轮（vanilla 运行时是微任务）。 */
async function settle(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

function targetEl(id: string): HTMLElement {
  const el = document.createElement('div')
  el.id = id
  stubRect(el, { x: 10, y: 20, width: 100, height: 40 })
  return el
}

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('引导 · 目标的三种写法', () => {
  it.each([
    ['选择器', (el: HTMLElement): TourStep['target'] => `#${el.id}`],
    ['元素', (el: HTMLElement): TourStep['target'] => el],
    ['返回元素的函数', (el: HTMLElement): TourStep['target'] => () => el],
  ])('%s：取到即锚定、量出高亮框', async (_name, write) => {
    const el = targetEl('tour-target')
    document.body.append(el)
    const t = make({ steps: [{ id: 'a', target: write(el) }] })
    await settle()
    expect(t.api().anchored).toBe(true)
    expect(t.service.context.get('spotlight')).toMatchObject({ width: expect.any(Number), height: expect.any(Number) })
    expect(t.service.context.get('spotlight')!.width).toBeGreaterThan(100)
    t.stop()
  })

  it('已脱离文档的元素按取不到处理', async () => {
    vi.useFakeTimers()
    const el = targetEl('detached')
    const t = make({ steps: [{ id: 'a', target: el }], targetTimeout: 100 })
    vi.advanceTimersByTime(100)
    expect(t.api().anchored).toBe(false)
    t.stop()
  })
})

describe('引导 · 等目标出现', () => {
  it('缺席时气泡不露面；目标挂上来即锚定并量高亮框', async () => {
    const t = make({ steps: [{ id: 'a', target: '#late' }] })
    await settle()
    expect(t.api().anchored).toBe(true)
    expect((t.api().getPositionerProps() as Dict)['data-positioned']).toBeUndefined()
    expect(t.service.context.get('spotlight') ?? null).toBeNull()

    document.body.append(targetEl('late'))
    // MutationObserver 的回调是微任务，量测再推迟一轮
    await settle()
    await settle()
    expect(t.service.context.get('spotlight')).not.toBeNull()
    expect(t.service.context.get('missingTarget')).toBe(false)
    t.stop()
  })

  it('函数写法同样等：每次节点变动后现调一次', async () => {
    let el: HTMLElement | null = null
    const t = make({ steps: [{ id: 'a', target: () => el }] })
    await settle()
    el = targetEl('late-fn')
    document.body.append(el)
    await settle()
    await settle()
    expect(t.service.context.get('spotlight')).not.toBeNull()
    t.stop()
  })

  it('等满 targetTimeout 仍没有：该步按居中呈现，不画高亮框', () => {
    vi.useFakeTimers()
    const t = make({ steps: [{ id: 'a', target: '#never' }], targetTimeout: 500 })
    vi.advanceTimersByTime(499)
    expect(t.api().anchored).toBe(true)
    vi.advanceTimersByTime(1)
    expect(t.api().anchored).toBe(false)
    const positioner = t.api().getPositionerProps() as Dict
    expect(positioner['data-position']).toBe('center')
    expect(positioner['data-positioned']).toBe('')
    expect((t.api().getSpotlightProps() as Dict).hidden).toBe(true)
    t.stop()
  })

  it('缺省等 3000ms；0 即不等', () => {
    expect(TOUR_TARGET_TIMEOUT).toBe(3000)
    vi.useFakeTimers()
    const t = make({ steps: [{ id: 'a', target: '#never' }], targetTimeout: 0 })
    vi.advanceTimersByTime(0)
    expect(t.api().anchored).toBe(false)
    t.stop()
  })

  it('超时后目标才挂上来：remeasure 重新锚定', () => {
    vi.useFakeTimers()
    const t = make({ steps: [{ id: 'a', target: '#slow' }], targetTimeout: 100 })
    vi.advanceTimersByTime(100)
    expect(t.api().anchored).toBe(false)
    document.body.append(targetEl('slow'))
    t.api().remeasure()
    expect(t.api().anchored).toBe(true)
    t.stop()
  })

  it('换步重新开始等：上一步的超时不带到下一步', () => {
    vi.useFakeTimers()
    const t = make({
      steps: [{ id: 'a', target: '#gone' }, { id: 'b', target: '#other' }],
      targetTimeout: 100,
    })
    vi.advanceTimersByTime(100)
    expect(t.api().anchored).toBe(false)
    t.api().goToNextStep()
    expect(t.api().value).toBe(1)
    expect(t.api().anchored).toBe(true)
    vi.advanceTimersByTime(100)
    expect(t.api().anchored).toBe(false)
    t.stop()
  })

  it('收起即撤掉观察与计时：之后不再发事件', () => {
    vi.useFakeTimers()
    const t = make({ steps: [{ id: 'a', target: '#never' }], targetTimeout: 100 })
    t.api().setOpen(false)
    vi.advanceTimersByTime(200)
    expect(t.service.context.get('missingTarget')).toBe(false)
    t.stop()
  })
})
