// @vitest-environment jsdom
// 浮层定位层的生命周期契约：渲染 → 量 → 定位 → 才露。
// 皮肤基线把定位层默认藏着，只有连接层打了 data-positioned 才显示。四个状态各自分明：
//   closed                → 收起；坐标若还留着，退场照常可见
//   open + 还没量完       → 藏
//   open + 有坐标         → 露
//   open + 引擎置 hidden  → 锚点滚出可视区——藏
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { describe, expect, it } from 'vitest'
import { connectMenu, menuMachine } from '../src/menu'
import { overlayPositioned } from '../src/shared/overlay'

describe('落位判据', () => {
  it('还没有结果时不算落位——展开那几帧就是这个状态', () => {
    expect(overlayPositioned(undefined)).toBe(false)
    expect(overlayPositioned(null)).toBe(false)
    // 只有一半坐标也算没算完
    expect(overlayPositioned({ y: 20 })).toBe(false)
  })

  it('算出坐标就落位了；(0, 0) 是合法结果，不能与「还没算」混为一谈', () => {
    expect(overlayPositioned({ x: 10, y: 20 })).toBe(true)
    expect(overlayPositioned({ x: 0, y: 0 })).toBe(true)
  })

  it('引擎置 hidden（锚点滚出可视区）不算落位', () => {
    expect(overlayPositioned({ x: 10, y: 20, hidden: true })).toBe(false)
  })

  it('判据与展开态无关：收起中的面板留着坐标，退场才看得见', () => {
    expect(overlayPositioned({ x: 10, y: 20 })).toBe(true)
  })
})

describe('落到浮层上', () => {
  function menu(open: boolean) {
    const runtime = createVanillaRuntime()
    const service = createService(menuMachine, { props: () => ({ defaultOpen: open }), runtime })
    runtime.start()
    return { service, api: () => connectMenu(service, normalizeProps) }
  }

  it('刚展开、引擎还没回报时不带 data-positioned——皮肤基线据此藏着', () => {
    const positioner = menu(true).api().getPositionerProps() as Record<string, unknown>
    expect(positioner['data-positioned']).toBeUndefined()
  })

  it('引擎给出坐标后带上', () => {
    const { service, api } = menu(true)
    service.context.set('position', { x: 12, y: 34, placement: 'bottom-start', hidden: false })
    const positioner = api().getPositionerProps() as Record<string, unknown>
    expect(positioner['data-positioned']).toBe('')
    expect(positioner['data-hidden']).toBeUndefined()
  })

  it('锚点滚出可视区：data-hidden 挂上、落位信号撤掉', () => {
    const { service, api } = menu(true)
    service.context.set('position', { x: 12, y: 34, placement: 'bottom-start', hidden: true })
    const positioner = api().getPositionerProps() as Record<string, unknown>
    expect(positioner['data-hidden']).toBe('')
    expect(positioner['data-positioned']).toBeUndefined()
  })

  it('重开先清账：上次的坐标不作数，再次落位前藏着', () => {
    const { service, api } = menu(true)
    service.context.set('position', { x: 12, y: 34, placement: 'bottom-start', hidden: false })
    service.send({ type: 'CLOSE' })
    // 收起中坐标还留着——退场要用
    expect((api().getPositionerProps() as Record<string, unknown>)['data-positioned']).toBe('')
    service.send({ type: 'OPEN' })
    // 进入展开态的效应先把坐标清掉
    expect((api().getPositionerProps() as Record<string, unknown>)['data-positioned']).toBeUndefined()
  })
})

describe('定位层带方向', () => {
  function menu(dir?: 'ltr' | 'rtl') {
    const runtime = createVanillaRuntime()
    const service = createService(menuMachine, { props: () => ({ defaultOpen: true, dir }), runtime })
    runtime.start()
    return connectMenu(service, normalizeProps).getPositionerProps() as Record<string, unknown>
  }

  it('作者给了 dir 就打在 positioner 上：定位层被搬到 portal 落点，继承不到作者子树上的方向', () => {
    expect(menu('rtl').dir).toBe('rtl')
  })

  it('没给就不写：写死 ltr 会切断落点处本来的继承', () => {
    expect(menu().dir).toBeUndefined()
  })
})
