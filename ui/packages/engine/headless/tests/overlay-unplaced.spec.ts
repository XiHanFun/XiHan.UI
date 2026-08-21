// @vitest-environment jsdom
// 浮层从展开到可见要过四个状态，它们互不相同、不能混成一件事：
//
//   closed              → 没打开，不谈落位
//   open + unplaced     → 打开了，引擎还没量完（坐标是兜底的 0）——藏
//   open + placed       → 算出坐标了——露
//   open + 引擎置 hidden → 算过了，但锚点被滚出可视区——藏
//
// 坐标算不出来是因为它依赖浮层自己的尺寸，而尺寸要等元素进 DOM 参与排版才量得到，
// 「先定位再展开」做不到。能做的是把「已经在渲染」与「用户已经看得见」分开。
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { describe, expect, it } from 'vitest'
import { connectMenu, menuMachine } from '../src/menu'
import { overlayUnplaced } from '../src/shared/overlay'

describe('四个状态', () => {
  it('closed：没打开就不谈落位，不该挂多余的信号', () => {
    expect(overlayUnplaced(false, undefined)).toBe(false)
    // 关闭流程里还留着上一次的坐标，同样不该藏
    expect(overlayUnplaced(false, { x: 10, y: 20 })).toBe(false)
  })

  it('open + unplaced：打开了但引擎还没回报——藏', () => {
    expect(overlayUnplaced(true, undefined)).toBe(true)
    expect(overlayUnplaced(true, null)).toBe(true)
    // 只有一半坐标也算没算完
    expect(overlayUnplaced(true, { y: 20 })).toBe(true)
  })

  it('open + placed：算出坐标就露出来', () => {
    expect(overlayUnplaced(true, { x: 10, y: 20 })).toBe(false)
    // 贴在左上角是合法结果，不能与「还没算」混为一谈
    expect(overlayUnplaced(true, { x: 0, y: 0 })).toBe(false)
  })

  it('open + 引擎置 hidden：算过了，但锚点被滚出可视区——藏', () => {
    expect(overlayUnplaced(true, { x: 10, y: 20, hidden: true })).toBe(true)
  })
})

describe('落到浮层上', () => {
  function menu(open: boolean) {
    const runtime = createVanillaRuntime()
    const service = createService(menuMachine, { props: () => ({ defaultOpen: open }), runtime })
    runtime.start()
    return { service, api: () => connectMenu(service, normalizeProps) }
  }

  it('收起态不发 data-hidden', () => {
    const positioner = menu(false).api().getPositionerProps() as Record<string, unknown>
    expect(positioner['data-hidden']).toBeUndefined()
  })

  it('刚展开、引擎还没回报时发 data-hidden', () => {
    const positioner = menu(true).api().getPositionerProps() as Record<string, unknown>
    expect(positioner['data-hidden']).toBe('')
  })

  it('引擎给出坐标后撤掉', () => {
    const { service, api } = menu(true)
    service.context.set('position', { x: 12, y: 34, placement: 'bottom-start' })
    const positioner = api().getPositionerProps() as Record<string, unknown>
    expect(positioner['data-hidden']).toBeUndefined()
  })

  it('锚点滚出可视区后重新挂上', () => {
    const { service, api } = menu(true)
    service.context.set('position', { x: 12, y: 34, placement: 'bottom-start', hidden: true })
    const positioner = api().getPositionerProps() as Record<string, unknown>
    expect(positioner['data-hidden']).toBe('')
  })
})
