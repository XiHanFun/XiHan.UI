// @vitest-environment jsdom
// 抽屉的改尺：把手拖动或方向键推面板的厚度、夹在上下限与视口之间；推向页面那一侧变厚；
// 受控时只发意图；没开改尺时把手收起、一概不动。几何交给浏览器用例，这里桩出面板的矩形与书写方向。
import type { DrawerPanelSizeChangeDetails, DrawerSchema } from '../src/drawer'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { connectDrawer, drawerMachine } from '../src/drawer'

type Dict = Record<string, any>

const live: Array<() => void> = []
afterEach(() => {
  for (const stop of live.splice(0))
    stop()
  document.body.innerHTML = ''
})

/** 面板贴在 1024×768 视口的一条边上，厚度按 panelSize 走、没调过时是 320。 */
function makeDrawer(props: DrawerSchema['props'] = {}, dir: 'ltr' | 'rtl' = 'ltr') {
  const runtime = createVanillaRuntime()
  const changes: DrawerPanelSizeChangeDetails[] = []
  const service = createService(drawerMachine, {
    props: () => ({ defaultOpen: true, resizable: true, onPanelSizeChange: d => changes.push(d), ...props }),
    runtime,
  })
  const content = document.createElement('div')
  content.dir = dir
  content.style.direction = dir
  document.body.append(content)
  content.getBoundingClientRect = () => {
    const size = service.context.get('panelSize') ?? 320
    return { width: size, height: size, left: 0, top: 0, right: size, bottom: size, x: 0, y: 0, toJSON: () => ({}) } as DOMRect
  }
  service.refs.set('getContentEl', () => content)
  runtime.start()
  live.push(() => runtime.stop())
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 768 })
  const api = () => connectDrawer(service, normalizeProps)
  return { service, api, changes }
}

function keydown(api: () => ReturnType<typeof connectDrawer>, key: string, shiftKey = false): KeyboardEvent {
  const event = new window.KeyboardEvent('keydown', { key, shiftKey, cancelable: true })
  ;((api().getResizeTriggerProps() as Dict).onKeyDown as (e: KeyboardEvent) => void)(event)
  return event
}

function down(api: () => ReturnType<typeof connectDrawer>, x: number, y: number): void {
  const event = new window.Event('pointerdown', { cancelable: true }) as PointerEvent
  Object.defineProperties(event, { button: { value: 0 }, clientX: { value: x }, clientY: { value: y }, pointerId: { value: 1 } })
  ;((api().getResizeTriggerProps() as Dict).onPointerDown as (e: PointerEvent) => void)(event)
}

function move(x: number, y: number, type = 'pointermove'): void {
  const event = new window.Event(type) as PointerEvent
  Object.defineProperties(event, { clientX: { value: x }, clientY: { value: y }, pointerId: { value: 1 }, pressure: { value: 0.5 } })
  document.dispatchEvent(event)
}

describe('把手', () => {
  it('是 role=separator：朝向随贴边的方向，读屏报得出上下限；没调过时不报当前值', () => {
    const d = makeDrawer({ maxPanelSize: 600 })
    const handle = d.api().getResizeTriggerProps() as Dict
    expect(handle.role).toBe('separator')
    expect(handle['aria-orientation']).toBe('vertical')
    expect(handle['aria-valuemin']).toBe('160')
    expect(handle['aria-valuemax']).toBe('600')
    expect(handle['aria-valuenow']).toBeUndefined()
    expect(handle.hidden).toBeUndefined()
    expect((makeDrawer({ side: 'top' }).api().getResizeTriggerProps() as Dict)['aria-orientation']).toBe('horizontal')
  })

  it('得焦时量一次实际厚度，报给读屏，不对外通知', () => {
    const d = makeDrawer()
    ;((d.api().getResizeTriggerProps() as Dict).onFocus as () => void)()
    expect((d.api().getResizeTriggerProps() as Dict)['aria-valuenow']).toBe('320')
    expect(d.changes).toEqual([])
  })

  it('没开改尺：把手收起，按键与按下都不动', () => {
    const d = makeDrawer({ resizable: false })
    expect((d.api().getResizeTriggerProps() as Dict).hidden).toBe(true)
    keydown(d.api, 'ArrowLeft')
    expect(d.api().panelSize).toBeNull()
  })
})

describe('键盘', () => {
  it('贴右边：左键变厚、右键变薄，Shift 大步；推到的厚度写进 content 的私有槽', () => {
    const d = makeDrawer()
    const left = keydown(d.api, 'ArrowLeft')
    expect(left.defaultPrevented).toBe(true)
    expect(d.api().panelSize).toBe(328)
    keydown(d.api, 'ArrowRight', true)
    expect(d.api().panelSize).toBe(288)
    expect((d.api().getContentProps() as Dict).style['--xh-_drawer-panel-size']).toBe('288px')
    expect(d.changes.map(c => c.panelSize)).toEqual([328, 288])
  })

  it('贴左边与从右往左排版时方向翻过来：推向页面那一侧才变厚', () => {
    const left = makeDrawer({ side: 'left' })
    keydown(left.api, 'ArrowRight')
    expect(left.api().panelSize).toBe(328)
    const rtl = makeDrawer({ side: 'right' }, 'rtl')
    keydown(rtl.api, 'ArrowRight')
    expect(rtl.api().panelSize).toBe(328)
  })

  it('贴底边：上键变厚；横向键不推', () => {
    const d = makeDrawer({ side: 'bottom' })
    keydown(d.api, 'ArrowUp')
    expect(d.api().panelSize).toBe(328)
    keydown(d.api, 'ArrowLeft')
    expect(d.api().panelSize).toBe(328)
  })

  it('home / End 推到上下限；没给上限时推到视口能放下的厚度', () => {
    const d = makeDrawer({ minPanelSize: 200 })
    keydown(d.api, 'Home')
    expect(d.api().panelSize).toBe(200)
    keydown(d.api, 'End')
    expect(d.api().panelSize).toBe(1024)
    const capped = makeDrawer({ maxPanelSize: 480 })
    keydown(capped.api, 'End')
    expect(capped.api().panelSize).toBe(480)
  })
})

describe('指针', () => {
  it('按住把手跟手推，夹在上下限之间；松手收尾', () => {
    const d = makeDrawer({ maxPanelSize: 500 })
    down(d.api, 704, 300)
    expect(d.api().resizing).toBe(true)
    expect((d.api().getContentProps() as Dict)['data-resizing']).toBe('')
    move(604, 300)
    expect(d.api().panelSize).toBe(420)
    move(0, 300)
    expect(d.api().panelSize).toBe(500)
    move(2000, 300)
    expect(d.api().panelSize).toBe(160)
    move(2000, 300, 'pointerup')
    expect(d.api().resizing).toBe(false)
  })
})

describe('受控', () => {
  it('给了 panelSize：推只发意图，面板厚度由宿主写回', () => {
    const d = makeDrawer({ panelSize: 300 })
    keydown(d.api, 'ArrowLeft')
    expect(d.changes).toEqual([{ panelSize: 308 }])
    expect(d.api().panelSize).toBe(300)
  })

  it('defaultPanelSize 是初始厚度', () => {
    const d = makeDrawer({ defaultPanelSize: 400 })
    expect(d.api().panelSize).toBe(400)
    expect((d.api().getContentProps() as Dict).style['--xh-_drawer-panel-size']).toBe('400px')
  })
})
