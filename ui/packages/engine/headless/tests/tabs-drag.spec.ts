// @vitest-environment jsdom
// 标签拖拽：激活阈值、轴向跟随、键盘命令与播报。
// 一维重排的算术归 shared/drag 的 reorderFlat / flatMoveCommand，那边另有单测。
import type { TabsNode, TabsSchema } from '../src/tabs'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { connectTabs, tabsMachine } from '../src/tabs'

type Props = TabsSchema['props']
type Dict = Record<string, unknown>

const COLLECTION: TabsNode[] = [
  { value: 'one', label: '概览' },
  { value: 'two', label: '详情' },
  { value: 'three', label: '设置' },
]

/** 三个标签各占主轴 100，首尾相接。jsdom 不排版，位置逐个打上。 */
const SPAN = 100

function mount(initial: Partial<Props> = {}) {
  const props: Partial<Props> = {
    collection: COLLECTION,
    defaultValue: 'one',
    reorderable: true,
    ...initial,
  }
  const horizontal = (props.orientation ?? 'horizontal') === 'horizontal'
  const runtime = createVanillaRuntime()
  const service = createService(tabsMachine, { props: () => props, runtime })
  runtime.start()

  const root = document.createElement('div')
  root.setAttribute('data-scope', 'tabs')
  root.setAttribute('data-part', 'root')
  const list = document.createElement('div')
  list.setAttribute('data-scope', 'tabs')
  list.setAttribute('data-part', 'list')
  root.append(list)

  const triggers = new Map<string, HTMLElement>()
  ;(props.collection ?? []).forEach((node, i) => {
    const el = document.createElement('button')
    el.setAttribute('data-scope', 'tabs')
    el.setAttribute('data-part', 'trigger')
    el.setAttribute('data-value', node.value)
    if (node.disabled)
      el.setAttribute('aria-disabled', 'true')
    const at = i * SPAN
    el.getBoundingClientRect = (): DOMRect => (horizontal
      ? { x: at, y: 0, width: SPAN, height: 32, top: 0, left: at, right: at + SPAN, bottom: 32, toJSON: () => ({}) }
      : { x: 0, y: at, width: 120, height: SPAN, top: at, left: 0, right: 120, bottom: at + SPAN, toJSON: () => ({}) }
    ) as DOMRect
    list.append(el)
    triggers.set(node.value, el)
  })
  document.body.append(root)

  return {
    service,
    api: () => connectTabs(service, normalizeProps),
    trigger: (value: string) => triggers.get(value),
    dragging: () => service.context.get('draggingTab') ?? null,
    drop: () => service.context.get('dropTarget') ?? null,
    said: () => service.context.get('announcement'),
  }
}

type Harness = ReturnType<typeof mount>

function press(h: Harness, value: string, point: number, init: Partial<PointerEvent> = {}): void {
  const el = h.trigger(value)
  const props = h.api().getTriggerProps({ value }) as Dict
  ;(props.onPointerDown as (e: PointerEvent) => void)({
    button: 0,
    pointerId: 1,
    pointerType: 'mouse',
    clientX: point,
    clientY: point,
    currentTarget: el,
    target: el,
    ...init,
  } as unknown as PointerEvent)
}

/** 两轴给不同的值：量错轴的话落点会算到另一个标签上去。 */
function move(point: number, offAxis = 0): void {
  document.dispatchEvent(new PointerEvent('pointermove', {
    pointerId: 1,
    clientX: point,
    clientY: offAxis,
    bubbles: true,
  }))
}

function release(): void {
  document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }))
}

function key(h: Harness, k: string, mods: Partial<KeyboardEvent> = {}): { prevented: boolean } {
  let prevented = false
  const props = h.api().getListProps() as Dict
  ;(props.onKeydown as (e: KeyboardEvent) => void)({
    key: k,
    ...mods,
    currentTarget: document.querySelector('[data-part="list"]'),
    preventDefault: () => { prevented = true },
  } as unknown as KeyboardEvent)
  return { prevented }
}

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('标签拖拽 · 指针', () => {
  it('按下还不算拖：整个标签都是拖动源，没有把手表明意图', () => {
    const h = mount()
    press(h, 'one', 50)
    expect(h.dragging()).toBeNull()
  })

  it('走够激活距离才算，落点跟着指针走', () => {
    const h = mount()
    press(h, 'one', 50)
    move(280)
    expect(h.dragging()).toBe('one')
    expect(h.drop()).toEqual({ targetValue: 'three', position: 'after' })
  })

  it('落在自己身上不算落点，指示线消失', () => {
    const h = mount()
    press(h, 'two', 150)
    move(120)
    expect(h.drop()).toBeNull()
  })

  it('松手落定，报出重排好的整份标签序', () => {
    const onTabMove = vi.fn()
    const h = mount({ onTabMove })
    press(h, 'one', 50)
    move(280)
    release()
    expect(onTabMove).toHaveBeenCalledWith({
      value: 'one',
      from: 0,
      to: 2,
      values: ['two', 'three', 'one'],
    })
  })

  it('没走够激活距离就松手 = 只是点了一下，什么都不发', () => {
    const onTabMove = vi.fn()
    const h = mount({ onTabMove })
    press(h, 'one', 50)
    move(52)
    release()
    expect(onTabMove).not.toHaveBeenCalled()
    expect(h.said()).toBe('')
  })

  it('系统收走指针按取消算，一步不动', () => {
    const onTabMove = vi.fn()
    const h = mount({ onTabMove })
    press(h, 'one', 50)
    move(280)
    document.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1, bubbles: true }))
    expect(onTabMove).not.toHaveBeenCalled()
    expect(h.said()).toContain('canceled')
  })

  it('竖排量的是纵轴：横轴上的坐标一概不算数', () => {
    const h = mount({ orientation: 'vertical' })
    press(h, 'one', 50)
    // 纵轴走到 280（落在第三个标签的后半段），横轴故意停在 20——
    // 量错轴的话会算成落在第一个标签上，也就是原地
    document.dispatchEvent(new PointerEvent('pointermove', {
      pointerId: 1,
      clientX: 20,
      clientY: 280,
      bubbles: true,
    }))
    expect(h.drop()).toEqual({ targetValue: 'three', position: 'after' })
  })

  it('横排量的是横轴：纵轴上的坐标一概不算数', () => {
    const h = mount()
    press(h, 'one', 50)
    document.dispatchEvent(new PointerEvent('pointermove', {
      pointerId: 1,
      clientX: 280,
      clientY: 20,
      bubbles: true,
    }))
    expect(h.drop()).toEqual({ targetValue: 'three', position: 'after' })
  })

  it('触屏不开拖；右键不开拖；没声明 reorderable 也不开', () => {
    const touch = mount()
    press(touch, 'one', 50, { pointerType: 'touch' })
    move(280)
    expect(touch.dragging()).toBeNull()

    const secondary = mount()
    press(secondary, 'one', 50, { button: 2 })
    move(280)
    expect(secondary.dragging()).toBeNull()

    const off = mount({ reorderable: false })
    press(off, 'one', 50)
    move(280)
    expect(off.dragging()).toBeNull()
  })

  it('拖动中被拖的标签只落 data-dragging，不带任何位移', () => {
    const h = mount()
    press(h, 'one', 50)
    move(280)
    const props = h.api().getTriggerProps({ value: 'one' }) as Dict
    expect(props['data-dragging']).toBe('')
    expect(JSON.stringify(props.style ?? {})).not.toContain('transform')
  })

  it('落点那一侧如实发在参照标签上', () => {
    const h = mount()
    press(h, 'one', 50)
    move(280)
    expect((h.api().getTriggerProps({ value: 'three' }) as Dict)['data-drop']).toBe('after')
    expect((h.api().getTriggerProps({ value: 'two' }) as Dict)['data-drop']).toBeUndefined()
  })

  it('禁用的标签仍进落点快照——摘掉它，指针划过那一段会没有落点', () => {
    const h = mount({
      collection: [{ value: 'one' }, { value: 'two', disabled: true }, { value: 'three' }],
    })
    press(h, 'one', 50)
    move(120)
    expect(h.drop()?.targetValue).toBe('two')
  })
})

describe('标签拖拽 · 键盘命令', () => {
  it('横排按 Alt + 右键往后挪一位，一按就是一次完整提交', () => {
    const onTabMove = vi.fn()
    const h = mount({ onTabMove })
    h.service.send({ type: 'TRIGGER.FOCUS', value: 'one' })
    const { prevented } = key(h, 'ArrowRight', { altKey: true })
    expect(prevented).toBe(true)
    expect(onTabMove).toHaveBeenCalledWith({
      value: 'one',
      from: 0,
      to: 1,
      values: ['two', 'one', 'three'],
    })
  })

  it('竖排认上下键，横轴的键放行给页面', () => {
    const onTabMove = vi.fn()
    const h = mount({ orientation: 'vertical', onTabMove })
    h.service.send({ type: 'TRIGGER.FOCUS', value: 'one' })
    expect(key(h, 'ArrowRight', { altKey: true }).prevented).toBe(false)
    key(h, 'ArrowDown', { altKey: true })
    expect(onTabMove).toHaveBeenCalledTimes(1)
  })

  it('横排 rtl 下左右对调', () => {
    const onTabMove = vi.fn()
    const h = mount({ dir: 'rtl', onTabMove })
    h.service.send({ type: 'TRIGGER.FOCUS', value: 'one' })
    key(h, 'ArrowLeft', { altKey: true })
    expect(onTabMove).toHaveBeenCalledWith({
      value: 'one',
      from: 0,
      to: 1,
      values: ['two', 'one', 'three'],
    })
  })

  it('到首末就停住：挡住默认行为但不发事件', () => {
    const onTabMove = vi.fn()
    const h = mount({ onTabMove })
    h.service.send({ type: 'TRIGGER.FOCUS', value: 'one' })
    const { prevented } = key(h, 'ArrowLeft', { altKey: true })
    expect(prevented).toBe(true)
    expect(onTabMove).not.toHaveBeenCalled()
  })

  it('裸方向键仍是导航，不换位', () => {
    const onTabMove = vi.fn()
    const h = mount({ onTabMove })
    h.service.send({ type: 'TRIGGER.FOCUS', value: 'one' })
    key(h, 'ArrowRight')
    expect(onTabMove).not.toHaveBeenCalled()
  })

  it('关掉 reorderable 时 Alt + 方向键放行给页面', () => {
    const h = mount({ reorderable: false })
    h.service.send({ type: 'TRIGGER.FOCUS', value: 'one' })
    expect(key(h, 'ArrowRight', { altKey: true }).prevented).toBe(false)
  })

  it('带 Ctrl / Cmd 的组合不归它管', () => {
    const h = mount()
    h.service.send({ type: 'TRIGGER.FOCUS', value: 'one' })
    expect(key(h, 'ArrowRight', { altKey: true, ctrlKey: true }).prevented).toBe(false)
  })
})

describe('标签拖拽 · 播报与属性', () => {
  it('挪完说的是新位置，用标签文字不用 value', () => {
    const h = mount()
    h.service.send({ type: 'TRIGGER.FOCUS', value: 'one' })
    key(h, 'ArrowRight', { altKey: true })
    expect(h.said()).toBe('Moved 概览 to position 2 of 3.')
  })

  it('translations 能逐句换掉', () => {
    const h = mount({
      translations: { moved: (n: string, p: number, t: number) => `${n} 挪到第 ${p}/${t} 位` },
    })
    h.service.send({ type: 'TRIGGER.FOCUS', value: 'one' })
    key(h, 'ArrowRight', { altKey: true })
    expect(h.said()).toBe('概览 挪到第 2/3 位')
  })

  it('播报区是视觉隐藏的 status 活区', () => {
    const props = mount().api().getLiveRegionProps() as Dict
    expect(props.role).toBe('status')
    expect(props['aria-live']).toBe('polite')
    expect((props.style as Dict).clipPath).toBe('inset(50%)')
  })

  it('没声明 reorderable 时一个标签都不报可拖', () => {
    const h = mount({ reorderable: false })
    expect((h.api().getTriggerProps({ value: 'one' }) as Dict)['data-draggable']).toBeUndefined()
  })
})

describe('标签拖动把手 · 触屏那一路唯一的入口', () => {
  function pressHandle(h: Harness, value: string, point: number, init: Partial<PointerEvent> = {}): void {
    const props = h.api().getTabDragTriggerProps({ value }) as Dict
    ;(props.onPointerDown as (e: PointerEvent) => void)({
      button: 0,
      pointerId: 1,
      pointerType: 'mouse',
      clientX: point,
      clientY: point,
      currentTarget: h.trigger(value),
      target: h.trigger(value),
      preventDefault: () => {},
      ...init,
    } as unknown as PointerEvent)
  }

  it('按下即拖，不等激活距离', () => {
    const h = mount()
    pressHandle(h, 'one', 50)
    expect(h.dragging()).toBe('one')
  })

  it('触屏在把手上拖得动；整块起手那一路仍然不认触屏', () => {
    const viaHandle = mount()
    pressHandle(viaHandle, 'one', 50, { pointerType: 'touch' })
    expect(viaHandle.dragging()).toBe('one')

    const viaTab = mount()
    press(viaTab, 'one', 50, { pointerType: 'touch' })
    move(280)
    expect(viaTab.dragging()).toBeNull()
  })

  it('手势整个归拖动，且不占 Tab 位、对读屏隐藏', () => {
    const props = mount().api().getTabDragTriggerProps({ value: 'one' }) as Dict
    expect((props.style as Dict).touchAction).toBe('none')
    expect(props.tabindex).toBe(-1)
    expect(props['aria-hidden']).toBe(true)
  })

  it('禁用的标签与关掉 reorderable 时把手都拖不动', () => {
    const disabled = mount({
      collection: [{ value: 'one' }, { value: 'two', disabled: true }],
    })
    expect((disabled.api().getTabDragTriggerProps({ value: 'two' }) as Dict)['data-disabled']).toBe('')

    const off = mount({ reorderable: false })
    pressHandle(off, 'one', 50)
    expect(off.dragging()).toBeNull()
  })

  it('从把手起手，落点与松手落定跟整块起手是同一套', () => {
    const onTabMove = vi.fn()
    const h = mount({ onTabMove })
    pressHandle(h, 'one', 50)
    move(280)
    release()
    expect(onTabMove).toHaveBeenCalledWith({
      value: 'one',
      from: 0,
      to: 2,
      values: ['two', 'three', 'one'],
    })
  })
})
