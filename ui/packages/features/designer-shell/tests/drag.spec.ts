// @vitest-environment jsdom

import type { DesignerPaletteDragPayload, DropOver } from '../src'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineDesignerShell, registerDropTarget, startDrag } from '../src'

defineDesignerShell()

let target: HTMLElement
let source: HTMLElement
let pointed: Element | null

beforeEach(() => {
  source = document.createElement('button')
  source.textContent = '审批'
  target = document.createElement('div')
  document.body.append(source, target)
  pointed = null
  document.elementFromPoint = () => pointed
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.useRealTimers()
})

function pointer(type: string, x: number, y: number, init: PointerEventInit = {}): PointerEvent {
  return new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, isPrimary: true, pointerType: 'mouse', clientX: x, clientY: y, ...init })
}

function down(init: PointerEventInit = {}): PointerEvent {
  const event = pointer('pointerdown', 10, 10, init)
  source.dispatchEvent(event)
  return event
}

function move(x: number, y: number, init: PointerEventInit = {}): void {
  document.dispatchEvent(pointer('pointermove', x, y, init))
}

function up(x: number, y: number, init: PointerEventInit = {}): void {
  document.dispatchEvent(pointer('pointerup', x, y, init))
}

function preview(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-xh-designer-drag-preview]')
}

function dropTarget(answer: DropOver = { accept: true }) {
  const calls: unknown[] = []
  const unregister = registerDropTarget<string>(target, {
    over: (point, payload) => {
      calls.push(['over', point, payload])
      return answer
    },
    drop: (point, payload) => calls.push(['drop', point, payload]),
    leave: () => calls.push(['leave']),
  })
  return { calls, unregister }
}

describe('通用拖放', () => {
  it('移动过激活距离才开始拖，预览是拖动源的副本；在接受的目标上松手即放下', () => {
    const { calls } = dropTarget()
    const ends: unknown[] = []
    let session!: ReturnType<typeof startDrag>
    source.addEventListener('pointerdown', (event) => {
      session = startDrag(event, { payload: 'approve', onEnd: result => ends.push(result) })
    })
    down()
    move(12, 11)
    expect(session.active).toBe(false)
    expect(preview()).toBeNull()
    pointed = target
    move(40, 30)
    expect(session.active).toBe(true)
    expect(preview()!.textContent).toBe('审批')
    expect(preview()!.getAttribute('aria-hidden')).toBe('true')
    up(42, 31)
    expect(calls).toEqual([
      ['over', { x: 40, y: 30 }, 'approve'],
      ['over', { x: 42, y: 31 }, 'approve'],
      ['drop', { x: 42, y: 31 }, 'approve'],
    ])
    expect(ends).toEqual([{ dragged: true, dropped: true }])
    expect(preview()).toBeNull()
  })

  it('不接受时松手即取消并调 leave；离开目标时调 leave；ghost 为 hide 时藏起预览', () => {
    let answer: DropOver = { accept: true, ghost: 'hide' }
    const calls: unknown[] = []
    registerDropTarget(target, { over: () => answer, drop: () => calls.push('drop'), leave: () => calls.push('leave') })
    const ends: unknown[] = []
    source.addEventListener('pointerdown', event => startDrag(event, { payload: 1, onEnd: result => ends.push(result) }))
    down()
    pointed = target
    move(40, 30)
    expect(preview()!.hidden).toBe(true)
    pointed = source
    move(50, 30)
    expect(calls).toEqual(['leave'])
    expect(preview()!.hidden).toBe(false)
    pointed = target
    answer = { accept: false }
    move(60, 30)
    up(60, 30)
    expect(calls).toEqual(['leave', 'leave'])
    expect(ends).toEqual([{ dragged: true, dropped: false }])
  })

  it('按 Esc 取消拖动；取消登记后不再是放置目标', () => {
    const { calls, unregister } = dropTarget()
    const ends: unknown[] = []
    source.addEventListener('pointerdown', event => startDrag(event, { payload: 'x', onEnd: result => ends.push(result) }))
    down()
    pointed = target
    move(40, 30)
    const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    document.dispatchEvent(escape)
    expect(escape.defaultPrevented).toBe(true)
    expect(ends).toEqual([{ dragged: true, dropped: false }])
    expect(calls.at(-1)).toEqual(['leave'])
    move(50, 30)
    expect(calls).toHaveLength(2)

    unregister()
    down()
    move(40, 30)
    up(40, 30)
    expect(calls).toHaveLength(2)
    expect(ends.at(-1)).toEqual({ dragged: true, dropped: false })
  })

  it('没拖起来就松手不算拖动，指针离开窗口时取消', () => {
    dropTarget()
    const ends: unknown[] = []
    source.addEventListener('pointerdown', event => startDrag(event, { payload: 'x', onEnd: result => ends.push(result) }))
    down()
    up(11, 11)
    expect(ends).toEqual([{ dragged: false, dropped: false }])
    down()
    pointed = target
    move(40, 30)
    document.dispatchEvent(new PointerEvent('pointerout', { pointerId: 1, relatedTarget: null }))
    expect(ends).toEqual([{ dragged: false, dropped: false }, { dragged: true, dropped: false }])
  })

  it('触屏长按到时开始拖，长按前先移动视为滚动、放弃这次拖动', () => {
    vi.useFakeTimers()
    const { calls } = dropTarget()
    const ends: unknown[] = []
    source.addEventListener('pointerdown', event => startDrag(event, { payload: 'x', onEnd: result => ends.push(result) }))
    down({ pointerType: 'touch' })
    move(10, 40, { pointerType: 'touch' })
    expect(ends).toEqual([{ dragged: false, dropped: false }])
    vi.advanceTimersByTime(1000)
    expect(preview()).toBeNull()

    down({ pointerType: 'touch' })
    const menu = new Event('contextmenu', { bubbles: true, cancelable: true })
    source.dispatchEvent(menu)
    expect(menu.defaultPrevented).toBe(true)
    vi.advanceTimersByTime(500)
    expect(preview()).not.toBeNull()
    pointed = target
    move(80, 60, { pointerType: 'touch' })
    up(80, 60, { pointerType: 'touch' })
    expect(calls.at(-1)).toEqual(['drop', { x: 80, y: 60 }, 'x'])
    expect(ends.at(-1)).toEqual({ dragged: true, dropped: true })
  })

  it('物料面板按下物料即开始拖动，载荷带上来源与物料数据；拖过之后的点击不派发 item-activate', async () => {
    document.body.innerHTML = ''
    const palette = document.createElement('xh-designer-palette')
    palette.groups = [{ id: 'g', label: 'G', items: [{ id: 'approve', label: '审批', payload: { type: 'approve' } }] }]
    document.body.append(palette, target)
    await palette.updateComplete
    const dropped: DesignerPaletteDragPayload[] = []
    registerDropTarget<DesignerPaletteDragPayload>(target, { over: () => ({ accept: true }), drop: (_point, payload) => dropped.push(payload) })
    const activated: unknown[] = []
    palette.addEventListener('item-activate', event => activated.push((event as CustomEvent).detail))
    const button = palette.querySelector<HTMLButtonElement>('button[data-part="item"]')!
    button.dispatchEvent(pointer('pointerdown', 10, 10, { button: 0 }))
    pointed = target
    move(60, 60)
    up(60, 60)
    button.click()
    expect(dropped).toEqual([{ source: 'palette', id: 'approve', payload: { type: 'approve' } }])
    expect(activated).toEqual([])
    button.click()
    expect(activated).toEqual([{ id: 'approve', payload: { type: 'approve' } }])
  })
})
