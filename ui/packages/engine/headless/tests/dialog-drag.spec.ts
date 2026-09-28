// @vitest-environment jsdom
// 对话框的拖动：按住标题栏或把手跟手挪、夹在视口内；方向键在把手上挪一步、Shift 大步、Enter 回到居中；
// 标题栏里的按钮照常点；每次打开从居中起；没开拖动时一概不动。几何交给浏览器用例，这里桩出面板的矩形。
import type { DialogSchema } from '../src/dialog'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { connectDialog, dialogMachine } from '../src/dialog'
import { clampDialogOffset, dialogDragBounds } from '../src/dialog/dialog.gesture'

type Dict = Record<string, any>

const live: Array<() => void> = []
afterEach(() => {
  for (const stop of live.splice(0))
    stop()
  document.body.innerHTML = ''
})

/** 面板 200×100，居中在 1024×768 的视口里：左上角落在 (412, 334)，矩形随位移平移。 */
function makeDialog(props: DialogSchema['props'] = {}) {
  const runtime = createVanillaRuntime()
  const service = createService(dialogMachine, { props: () => ({ defaultOpen: true, draggable: true, ...props }), runtime })
  const content = document.createElement('div')
  document.body.append(content)
  content.getBoundingClientRect = () => {
    const o = service.context.get('offset')
    return { left: 412 + o.x, top: 334 + o.y, width: 200, height: 100, right: 612 + o.x, bottom: 434 + o.y, x: 412 + o.x, y: 334 + o.y, toJSON: () => ({}) } as DOMRect
  }
  service.refs.set('getContentEl', () => content)
  runtime.start()
  live.push(() => runtime.stop())
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 768 })
  const api = () => connectDialog(service, normalizeProps)
  return { service, api, content }
}

function down(handler: (event: PointerEvent) => void, target: Element, currentTarget: Element, x: number, y: number): PointerEvent {
  const event = new window.Event('pointerdown', { cancelable: true }) as PointerEvent
  Object.defineProperties(event, {
    button: { value: 0 },
    clientX: { value: x },
    clientY: { value: y },
    pointerId: { value: 1 },
    target: { value: target },
    currentTarget: { value: currentTarget },
  })
  handler(event)
  return event
}

function move(x: number, y: number, type = 'pointermove'): void {
  const event = new window.Event(type) as PointerEvent
  Object.defineProperties(event, { clientX: { value: x }, clientY: { value: y }, pointerId: { value: 1 }, pressure: { value: 0.5 } })
  document.dispatchEvent(event)
}

function key(name: string, shiftKey = false): KeyboardEvent {
  return new window.KeyboardEvent('keydown', { key: name, shiftKey, cancelable: true })
}

describe('几何', () => {
  it('边界按居中落点算：四边都留在视口里', () => {
    const bounds = dialogDragBounds({ left: 422, top: 334, width: 200, height: 100 }, { x: 10, y: 0 }, { width: 1024, height: 768 })
    expect(bounds).toEqual({ minX: -412, maxX: 412, minY: -334, maxY: 334 })
    expect(clampDialogOffset({ x: 900, y: -900 }, bounds)).toEqual({ x: 412, y: -334 })
  })

  it('面板比视口还大时起始缘留在视口里', () => {
    const bounds = dialogDragBounds({ left: -100, top: 0, width: 1200, height: 100 }, { x: 0, y: 0 }, { width: 1024, height: 768 })
    expect(clampDialogOffset({ x: 50, y: 0 }, bounds).x).toBe(100)
  })
})

describe('指针拖动', () => {
  it('按住标题栏跟手挪，松手停在原处；content 带位移私有槽与拖动标记', () => {
    const d = makeDialog()
    const header = document.createElement('div')
    const event = down(d.api().getHeaderProps().onPointerDown as (e: PointerEvent) => void, header, header, 500, 350)
    expect(event.defaultPrevented).toBe(true)
    expect(d.api().dragging).toBe(true)
    expect((d.api().getContentProps() as Dict)['data-dragging']).toBe('')
    move(560, 390)
    expect(d.api().offset).toEqual({ x: 60, y: 40 })
    const style = (d.api().getContentProps() as Dict).style
    expect(style['--xh-_dialog-drag-x']).toBe('60px')
    expect(style['--xh-_dialog-drag-y']).toBe('40px')
    move(560, 390, 'pointerup')
    expect(d.api().dragging).toBe(false)
    expect(d.api().offset).toEqual({ x: 60, y: 40 })
  })

  it('拖出视口的那一截被夹住：面板四边留在视口里', () => {
    const d = makeDialog()
    const header = document.createElement('div')
    down(d.api().getHeaderProps().onPointerDown as (e: PointerEvent) => void, header, header, 500, 350)
    move(-2000, 5000)
    expect(d.api().offset).toEqual({ x: -412, y: 334 })
  })

  it('标题栏里的按钮照常点：按在按钮上不起拖', () => {
    const d = makeDialog()
    const header = document.createElement('div')
    const button = document.createElement('button')
    header.append(button)
    const event = down(d.api().getHeaderProps().onPointerDown as (e: PointerEvent) => void, button, header, 500, 350)
    expect(event.defaultPrevented).toBe(false)
    expect(d.api().dragging).toBe(false)
  })

  it('没开拖动：标题栏不接指针，content 不带位移', () => {
    const d = makeDialog({ draggable: false })
    expect(d.api().getHeaderProps().onPointerDown).toBeUndefined()
    const content = d.api().getContentProps() as Dict
    expect(content['data-draggable']).toBeUndefined()
    expect(content.style).toEqual({ '--xh-_dialog-drag-x': '', '--xh-_dialog-drag-y': '' })
    const trigger = d.api().getDragTriggerProps() as Dict
    expect(trigger['aria-disabled']).toBe('true')
  })

  it('每次打开从居中落点起', () => {
    const d = makeDialog()
    d.service.send({ type: 'DRAG.NUDGE', dx: 30, dy: 0 })
    expect(d.api().offset.x).toBe(30)
    d.service.send({ type: 'CLOSE' })
    d.service.send({ type: 'OPEN' })
    expect(d.api().offset).toEqual({ x: 0, y: 0 })
  })
})

describe('键盘', () => {
  it('把手上方向键挪一步、Shift 大步、Enter 回到居中；带 Ctrl 的组合放行', () => {
    const d = makeDialog()
    const onKeyDown = (d.api().getDragTriggerProps() as Dict).onKeyDown as (e: KeyboardEvent) => void
    const right = key('ArrowRight')
    onKeyDown(right)
    expect(right.defaultPrevented).toBe(true)
    expect(d.api().offset).toEqual({ x: 10, y: 0 })
    onKeyDown(key('ArrowDown', true))
    expect(d.api().offset).toEqual({ x: 10, y: 50 })
    const ctrl = new window.KeyboardEvent('keydown', { key: 'ArrowLeft', ctrlKey: true, cancelable: true })
    onKeyDown(ctrl)
    expect(ctrl.defaultPrevented).toBe(false)
    expect(d.api().offset).toEqual({ x: 10, y: 50 })
    onKeyDown(key('Enter'))
    expect(d.api().offset).toEqual({ x: 0, y: 0 })
  })

  it('键盘同样夹在视口里', () => {
    const d = makeDialog()
    const onKeyDown = (d.api().getDragTriggerProps() as Dict).onKeyDown as (e: KeyboardEvent) => void
    for (let i = 0; i < 20; i++)
      onKeyDown(key('ArrowUp', true))
    expect(d.api().offset.y).toBe(-334)
  })

  it('把手有可及名，可替换', () => {
    const d = makeDialog({ translations: { dragTrigger: '移动对话框' } })
    expect((d.api().getDragTriggerProps() as Dict)['aria-label']).toBe('移动对话框')
    expect((makeDialog().api().getDragTriggerProps() as Dict)['aria-label']).toBe('Move dialog')
  })
})
