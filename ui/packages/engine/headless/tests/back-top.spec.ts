/**
 * 滚动量由观察器从容器上量：jsdom 不排版，滚动量靠钉，滚动靠派 scroll 事件模拟。
 *
 * @vitest-environment jsdom
 */

import type { BackTopSchema, BackTopVisibilityChangeDetails } from '../src/back-top'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BACK_TOP_VISIBILITY_HEIGHT, backTopMachine, connectBackTop, resolveBackTopVisibilityHeight } from '../src/back-top'

type Props = BackTopSchema['props']

const flush = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

function makeBackTop(initial: Props = {}) {
  const changes: BackTopVisibilityChangeDetails[] = []
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ ...initial, onVisibilityChange: d => changes.push(d) })
  const service = createService(backTopMachine, { props: () => props.get(), runtime })
  const container = document.createElement('div')
  document.body.append(container)
  let scrollTop = 0
  Object.defineProperty(container, 'scrollTop', {
    get: () => scrollTop,
    set: (v: number) => {
      scrollTop = v
    },
    configurable: true,
  })
  const scrollTo = vi.fn((o: { top: number }) => {
    scrollTop = o.top
  })
  container.scrollTo = scrollTo as unknown as HTMLElement['scrollTo']
  service.refs.set('getTargetEl', () => container)
  runtime.start()
  return {
    service,
    changes,
    scrollTo,
    state: () => service.state.get(),
    api: () => connectBackTop(service, normalizeProps),
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    scroll: async (top: number) => {
      scrollTop = top
      container.dispatchEvent(new Event('scroll'))
      await flush()
    },
    stop: () => {
      runtime.stop()
      container.remove()
    },
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('resolveBackTopVisibilityHeight', () => {
  it('缺省 200；负数夹到 0；非有限数退回缺省', () => {
    expect(BACK_TOP_VISIBILITY_HEIGHT).toBe(200)
    expect(resolveBackTopVisibilityHeight(undefined)).toBe(200)
    expect(resolveBackTopVisibilityHeight(80)).toBe(80)
    expect(resolveBackTopVisibilityHeight(-5)).toBe(0)
    expect(resolveBackTopVisibilityHeight(Number.NaN)).toBe(200)
    expect(resolveBackTopVisibilityHeight(Number.POSITIVE_INFINITY)).toBe(200)
  })
})

describe('backTopMachine 露面与收起', () => {
  it('起点收着：壳带 hidden，按钮是 type=button 并自带名字，三轴落在壳上', async () => {
    const b = makeBackTop({ variant: 'solid', tone: 'brand', size: 'sm' })
    await flush()
    expect(b.state()).toBe('hidden')
    const root = b.api().getRootProps() as Record<string, unknown>
    expect(root).toMatchObject({ 'data-state': 'hidden', 'hidden': true, 'data-variant': 'solid', 'data-tone': 'brand', 'data-size': 'sm' })
    const trigger = b.api().getTriggerProps() as Record<string, unknown>
    expect(trigger).toMatchObject({ 'type': 'button', 'aria-label': 'Back to top', 'data-state': 'hidden' })
    expect(b.changes).toEqual([])
    b.stop()
  })

  it('滚过阈值露面并通知一次；线上再滚不重复；退回线内收起再通知一次', async () => {
    const b = makeBackTop({ visibilityHeight: 100 })
    await flush()

    await b.scroll(99)
    expect(b.state()).toBe('hidden')
    await b.scroll(100)
    expect(b.state()).toBe('visible')
    expect(b.api().visible).toBe(true)
    expect((b.api().getRootProps() as Record<string, unknown>).hidden).toBeUndefined()
    expect(b.changes).toEqual([{ visible: true }])

    await b.scroll(300)
    expect(b.changes).toEqual([{ visible: true }])

    await b.scroll(20)
    expect(b.state()).toBe('hidden')
    expect(b.changes).toEqual([{ visible: true }, { visible: false }])
    b.stop()
  })

  it('页面一进来就滚在半路：挂上后立刻结算，不等第一次滚动', async () => {
    const runtime = createVanillaRuntime()
    const service = createService(backTopMachine, { props: () => ({ visibilityHeight: 50 }), runtime })
    const container = document.createElement('div')
    Object.defineProperty(container, 'scrollTop', { value: 400, configurable: true })
    document.body.append(container)
    service.refs.set('getTargetEl', () => container)
    runtime.start()
    await flush()
    expect(service.state.get()).toBe('visible')
    runtime.stop()
  })

  it('translations.trigger 换掉按钮名字', async () => {
    const b = makeBackTop({ translations: { trigger: '回到顶部' } })
    await flush()
    expect((b.api().getTriggerProps() as Record<string, unknown>)['aria-label']).toBe('回到顶部')
    b.stop()
  })

  it('触发器接 Action Control floating 档：缺省 outline、md，data-variant 与 data-xh-action-variant 同源', async () => {
    const b = makeBackTop()
    await flush()
    const trigger = b.api().getTriggerProps() as Record<string, unknown>
    expect(trigger['data-xh-action-control']).toBe('')
    expect(trigger['data-xh-action-profile']).toBe('floating')
    expect(trigger['data-xh-action-display']).toBe('always')
    expect(trigger['data-xh-action-size']).toBe('md')
    // 缺省中性：描边 + 磨砂面（真源 §7.2 第 2 条），不传 variant 时显式落 outline
    expect(trigger['data-xh-action-variant']).toBe('outline')
    expect((b.api().getRootProps() as Record<string, unknown>)['data-variant']).toBe('outline')
    expect(trigger['data-pressed']).toBeUndefined()
    b.stop()

    const solid = makeBackTop({ variant: 'solid', size: 'lg' })
    await flush()
    expect((solid.api().getRootProps() as Record<string, unknown>)['data-variant']).toBe('solid')
    const solidTrigger = solid.api().getTriggerProps() as Record<string, unknown>
    expect(solidTrigger['data-xh-action-variant']).toBe('solid')
    expect(solidTrigger['data-xh-action-size']).toBe('lg')
    solid.stop()
  })
})

describe('backTopMachine 按压通道：Space / Enter 与触屏按住投影 data-pressed', () => {
  type Dict = Record<string, unknown>
  const key = (name: string): KeyboardEvent => ({ key: name, repeat: false, isComposing: false, keyCode: 0 } as KeyboardEvent)
  const fire = (props: Dict, name: string, event: unknown): void => (props[name] as (e: unknown) => void)(event)

  it('静息不带 data-pressed；keydown 期间在场，keyup 撤下；触屏按下在场、抬起撤下；失焦撤下', async () => {
    const b = makeBackTop()
    await flush()
    const trigger = (): Dict => b.api().getTriggerProps() as Dict
    expect(trigger()['data-pressed']).toBeUndefined()
    fire(trigger(), 'onKeyDown', key(' '))
    expect(trigger()['data-pressed']).toBe('')
    fire(trigger(), 'onKeyUp', key(' '))
    expect(trigger()['data-pressed']).toBeUndefined()
    fire(trigger(), 'onPointerDown', { pointerType: 'touch' })
    expect(trigger()['data-pressed']).toBe('')
    fire(trigger(), 'onPointerUp', {})
    expect(trigger()['data-pressed']).toBeUndefined()
    fire(trigger(), 'onKeyDown', key('Enter'))
    expect(trigger()['data-pressed']).toBe('')
    fire(trigger(), 'onBlur', {})
    expect(trigger()['data-pressed']).toBeUndefined()
    b.stop()
  })
})

describe('backTopMachine 点按', () => {
  it('点按钮滚回容器顶部，缺省平滑；状态不由点击改，由随后的滚动结算收起', async () => {
    const b = makeBackTop({ visibilityHeight: 50 })
    await flush()
    await b.scroll(500)
    expect(b.state()).toBe('visible')

    ;(b.api().getTriggerProps() as { onClick: () => void }).onClick()
    expect(b.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    expect(b.state()).toBe('visible')

    await b.scroll(0)
    expect(b.state()).toBe('hidden')
    b.stop()
  })

  it('behavior=auto 直接跳；api.scrollToTop 与点按钮同一条路', async () => {
    const b = makeBackTop({ behavior: 'auto' })
    await flush()
    b.api().scrollToTop()
    expect(b.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
    b.stop()
  })
})
