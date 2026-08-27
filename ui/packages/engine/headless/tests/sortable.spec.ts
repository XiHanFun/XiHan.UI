// @vitest-environment jsdom
import type { SortableSchema } from '../src/sortable'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { connectSortable, sortableAnnouncement, sortableMachine } from '../src/sortable'

const IDS = ['a', 'b', 'c']

/** 造一棵真实 DOM：root 下三个 item，各带 data-value 与一个手柄。 */
function mountDom(ids: readonly string[] = IDS): HTMLElement {
  const root = document.createElement('div')
  root.setAttribute('data-scope', 'sortable')
  root.setAttribute('data-part', 'root')
  ids.forEach((id) => {
    const item = document.createElement('div')
    item.setAttribute('data-scope', 'sortable')
    item.setAttribute('data-part', 'item')
    item.setAttribute('data-value', id)
    root.append(item)
  })
  document.body.append(root)
  return root
}

/** jsdom 不排版，几何全是 0×0——照 splitter 的做法把矩形打在真实节点上。 */
function layout(root: HTMLElement, height = 100): void {
  const items = [...root.querySelectorAll<HTMLElement>('[data-part="item"]')]
  items.forEach((el, i) => {
    el.getBoundingClientRect = (): DOMRect => ({
      x: 0,
      y: i * height,
      width: 200,
      height,
      top: i * height,
      left: 0,
      right: 200,
      bottom: (i + 1) * height,
      toJSON: () => ({}),
    }) as DOMRect
  })
  root.getBoundingClientRect = (): DOMRect => ({
    x: 0,
    y: 0,
    width: 200,
    height: items.length * height,
    top: 0,
    left: 0,
    right: 200,
    bottom: items.length * height,
    toJSON: () => ({}),
  }) as DOMRect
}

function makeSortable(props: Partial<SortableSchema['props']> = {}, root?: HTMLElement) {
  const el = root ?? mountDom((props.ids as string[]) ?? IDS)
  layout(el)
  const runtime = createVanillaRuntime()
  const service = createService(sortableMachine, {
    runtime,
    props: () => ({ ids: IDS, ...props }) as SortableSchema['props'],
  })
  service.refs.set('getRootEl', () => el)
  runtime.start()
  return {
    service,
    root: el,
    api: () => connectSortable(service, normalizeProps),
    state: () => service.state.get(),
  }
}

const at = (clientY: number) => ({ clientX: 0, clientY })

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('排序 · 指针拖动', () => {
  it('按下先进 pending，不算开始拖', () => {
    const s = makeSortable()
    s.service.send({ type: 'ITEM.POINTER_DOWN', id: 'a', point: at(50), pointerId: 1 })
    expect(s.state()).toBe('pending')
    expect(s.api().dragging).toBe(false)
  })

  it('没走够激活距离就抬手，视作点击，一次都不排序', () => {
    const onSort = vi.fn()
    const s = makeSortable({ onSort })
    s.service.send({ type: 'ITEM.POINTER_DOWN', id: 'a', point: at(50), pointerId: 1 })
    s.service.send({ type: 'POINTER.MOVE', point: at(52) })
    expect(s.state()).toBe('pending')
    s.service.send({ type: 'POINTER.END' })
    expect(s.state()).toBe('idle')
    expect(onSort).not.toHaveBeenCalled()
  })

  it('走够距离才升级成拖动', () => {
    const s = makeSortable()
    s.service.send({ type: 'ITEM.POINTER_DOWN', id: 'a', point: at(50), pointerId: 1 })
    s.service.send({ type: 'POINTER.MOVE', point: at(56) })
    expect(s.state()).toBe('dragging')
    expect(s.api().dragging).toBe(true)
    expect(s.api().activeId).toBe('a')
  })

  it('拖过一项的中心，落点跟着走，其余项让位', () => {
    const s = makeSortable()
    s.service.send({ type: 'ITEM.POINTER_DOWN', id: 'a', point: at(50), pointerId: 1 })
    s.service.send({ type: 'POINTER.MOVE', point: at(200) }) // 位移 150
    expect(s.api().to).toBe(1)
    const items = s.api().items
    expect(items[0]?.dragging).toBe(true)
    expect(items[0]?.offset).toEqual({ x: 0, y: 150 })
    expect(items[1]?.offset).toEqual({ x: 0, y: -100 })
    expect(items[2]?.offset).toEqual({ x: 0, y: 0 })
  })

  it('松手提交顺序，回调直接给出重排好的 ids', () => {
    const onSort = vi.fn()
    const s = makeSortable({ onSort })
    s.service.send({ type: 'ITEM.POINTER_DOWN', id: 'a', point: at(50), pointerId: 1 })
    s.service.send({ type: 'POINTER.MOVE', point: at(300) })
    s.service.send({ type: 'POINTER.END' })
    expect(onSort).toHaveBeenCalledTimes(1)
    expect(onSort.mock.calls[0][0]).toEqual({ from: 0, to: 2, id: 'a', ids: ['b', 'c', 'a'] })
    expect(s.state()).toBe('idle')
  })

  it('原地松手不发排序回调', () => {
    const onSort = vi.fn()
    const s = makeSortable({ onSort })
    s.service.send({ type: 'ITEM.POINTER_DOWN', id: 'a', point: at(50), pointerId: 1 })
    s.service.send({ type: 'POINTER.MOVE', point: at(56) })
    s.service.send({ type: 'POINTER.END' })
    expect(onSort).not.toHaveBeenCalled()
  })

  it('系统收走指针按取消算：顺序不动，收尾回调标 canceled', () => {
    const onSort = vi.fn()
    const onDragEnd = vi.fn()
    const s = makeSortable({ onSort, onDragEnd })
    s.service.send({ type: 'ITEM.POINTER_DOWN', id: 'a', point: at(50), pointerId: 1 })
    s.service.send({ type: 'POINTER.MOVE', point: at(300) })
    s.service.send({ type: 'POINTER.CANCEL' })
    expect(onSort).not.toHaveBeenCalled()
    expect(onDragEnd.mock.calls[0][0]).toMatchObject({ canceled: true, from: 0, to: 0 })
    expect(s.state()).toBe('idle')
  })

  it('disabled 时按下不进 pending', () => {
    const s = makeSortable({ disabled: true })
    s.service.send({ type: 'ITEM.POINTER_DOWN', id: 'a', point: at(50), pointerId: 1 })
    expect(s.state()).toBe('idle')
  })

  it('激活距离可调；给 0 表示按下即拖', () => {
    const s = makeSortable({ activationDistance: 0 })
    s.service.send({ type: 'ITEM.POINTER_DOWN', id: 'a', point: at(50), pointerId: 1 })
    s.service.send({ type: 'POINTER.MOVE', point: at(50) })
    expect(s.state()).toBe('dragging')
  })

  it('收尾之后会话清干净，不留残值', () => {
    const s = makeSortable()
    s.service.send({ type: 'ITEM.POINTER_DOWN', id: 'a', point: at(50), pointerId: 1 })
    s.service.send({ type: 'POINTER.MOVE', point: at(300) })
    s.service.send({ type: 'POINTER.END' })
    const api = s.api()
    expect(api.activeId).toBeNull()
    expect(api.from).toBe(-1)
    expect(api.to).toBe(-1)
    expect(api.mode).toBeNull()
    expect(api.items.every(i => i.offset.x === 0 && i.offset.y === 0)).toBe(true)
  })
})

describe('排序 · 键盘拖动', () => {
  it('拾起即进拖动态，落点先等于原位', () => {
    const s = makeSortable()
    s.service.send({ type: 'ITEM.PICKUP', id: 'b' })
    expect(s.state()).toBe('dragging')
    expect(s.api().mode).toBe('keyboard')
    expect(s.api().from).toBe(1)
    expect(s.api().to).toBe(1)
  })

  it('方向键一次挪一格，让位量与指针拖动同源', () => {
    const s = makeSortable()
    s.service.send({ type: 'ITEM.PICKUP', id: 'a' })
    s.service.send({ type: 'KEY.MOVE', step: 1 })
    expect(s.api().to).toBe(1)
    const items = s.api().items
    // 键盘模式没有跟手位移，被拖项直接落到目标槽位起点
    expect(items[0]?.offset).toEqual({ x: 0, y: 100 })
    expect(items[1]?.offset).toEqual({ x: 0, y: -100 })
  })

  it('到头不再动，也不回绕', () => {
    const last = makeSortable()
    last.service.send({ type: 'ITEM.PICKUP', id: 'c' })
    last.service.send({ type: 'KEY.MOVE', step: 1 })
    expect(last.api().to).toBe(2)

    const first = makeSortable()
    first.service.send({ type: 'ITEM.PICKUP', id: 'a' })
    first.service.send({ type: 'KEY.MOVE', step: -1 })
    expect(first.api().to).toBe(0)
  })

  it('拖动中再按拾起不会另起一场', () => {
    const s = makeSortable()
    s.service.send({ type: 'ITEM.PICKUP', id: 'a' })
    s.service.send({ type: 'ITEM.PICKUP', id: 'c' })
    expect(s.api().activeId).toBe('a')
  })

  it('放下提交顺序', () => {
    const onSort = vi.fn()
    const s = makeSortable({ onSort })
    s.service.send({ type: 'ITEM.PICKUP', id: 'a' })
    s.service.send({ type: 'KEY.MOVE', step: 1 })
    s.service.send({ type: 'KEY.DROP' })
    expect(onSort.mock.calls[0][0]).toEqual({ from: 0, to: 1, id: 'a', ids: ['b', 'a', 'c'] })
  })

  it('按 Escape 取消：顺序不动，落点退回起点', () => {
    const onSort = vi.fn()
    const onDragEnd = vi.fn()
    const s = makeSortable({ onSort, onDragEnd })
    s.service.send({ type: 'ITEM.PICKUP', id: 'a' })
    s.service.send({ type: 'KEY.MOVE', step: 2 })
    s.service.send({ type: 'KEY.CANCEL' })
    expect(onSort).not.toHaveBeenCalled()
    expect(onDragEnd.mock.calls[0][0]).toMatchObject({ canceled: true, from: 0, to: 0 })
  })
})

describe('排序 · 产出的属性', () => {
  it('root 是 group，报出方向与拖动态', () => {
    const s = makeSortable()
    const root = s.api().getRootProps() as Record<string, unknown>
    // group 而不是 list：播报区就在容器里，list 只许有 listitem 子节点
    expect(root.role).toBe('group')
    expect(root['data-orientation']).toBe('vertical')
    expect(root['data-dragging']).toBeUndefined()
  })

  it('item 带身份属性与下标，被拖的那个报 data-dragging', () => {
    const s = makeSortable()
    s.service.send({ type: 'ITEM.PICKUP', id: 'b' })
    const item = s.api().getItemProps({ id: 'b' }) as Record<string, unknown>
    expect(item['data-value']).toBe('b')
    expect(item['data-index']).toBe('1')
    expect(item['data-dragging']).toBe('')
  })

  it('让位为零时不写 transform，避免每帧都生成一条无用样式', () => {
    const s = makeSortable()
    const style = (s.api().getItemProps({ id: 'a' }) as { style: Record<string, unknown> }).style
    expect(style.transform).toBeUndefined()
  })

  it('手柄是按钮、可聚焦，且声明自己是可排序的', () => {
    const s = makeSortable()
    const handle = s.api().getItemHandleProps({ id: 'a' }) as Record<string, unknown>
    expect(handle.role).toBe('button')
    expect(handle.tabindex).toBe(0)
    expect(handle['aria-roledescription']).toBe('sortable')
    expect(handle['aria-pressed']).toBe('false')
    expect((handle.style as Record<string, unknown>).touchAction).toBe('none')
  })

  it('拖动中的手柄报 aria-pressed=true', () => {
    const s = makeSortable()
    s.service.send({ type: 'ITEM.PICKUP', id: 'a' })
    expect((s.api().getItemHandleProps({ id: 'a' }) as Record<string, unknown>)['aria-pressed']).toBe('true')
  })

  it('disabled 时手柄不可聚焦', () => {
    const s = makeSortable({ disabled: true })
    const handle = s.api().getItemHandleProps({ id: 'a' }) as Record<string, unknown>
    expect(handle.tabindex).toBeUndefined()
    expect(handle['aria-disabled']).toBe('true')
  })

  it('活动区域是视觉隐藏的 polite 状态区', () => {
    const s = makeSortable()
    const live = s.api().getLiveRegionProps() as Record<string, unknown>
    expect(live.role).toBe('status')
    expect(live['aria-live']).toBe('polite')
    expect((live.style as Record<string, unknown>).position).toBe('absolute')
  })

  it('方向不经 ARIA 表达：group 不支持 aria-orientation，只留 data-*', () => {
    for (const orientation of ['vertical', 'horizontal', 'both'] as const) {
      const root = makeSortable({ orientation }).api().getRootProps() as Record<string, unknown>
      expect(root['aria-orientation']).toBeUndefined()
      expect(root['data-orientation']).toBe(orientation)
    }
  })
})

describe('排序 · 播报', () => {
  it('拾起那句要把接下来能按什么说清楚', () => {
    const text = sortableAnnouncement('picked', { id: '任务一', position: 1, total: 3 })
    expect(text).toContain('1')
    expect(text).toContain('3')
    expect(text.toLowerCase()).toContain('arrow keys')
    expect(text.toLowerCase()).toContain('escape')
  })

  it('移动、放下、取消各有各的话', () => {
    const base = { id: 'x', position: 2, total: 5 }
    expect(sortableAnnouncement('moved', base)).toContain('2')
    expect(sortableAnnouncement('dropped', base)).toContain('2')
    expect(sortableAnnouncement('canceled', base).toLowerCase()).toContain('cancel')
  })

  it('文案可整句覆盖，项名也能自定', () => {
    const text = sortableAnnouncement('moved', {
      id: 'x',
      position: 2,
      total: 5,
      translations: {
        item: id => `第${id}项`,
        moved: (name, position, total) => `${name} 挪到了 ${position}/${total}`,
      },
    })
    expect(text).toBe('第x项 挪到了 2/5')
  })

  it('拖动过程真的往活动区域里写话', () => {
    const s = makeSortable()
    s.service.send({ type: 'ITEM.PICKUP', id: 'a' })
    const picked = s.service.context.get('announcement')
    expect(picked).not.toBe('')
    s.service.send({ type: 'KEY.MOVE', step: 1 })
    expect(s.service.context.get('announcement')).not.toBe(picked)
  })
})

describe('排序 · 不给手柄时整项可拖', () => {
  it('按在项上也能开拖', () => {
    const s = makeSortable()
    const item = s.api().getItemProps({ id: 'a' }) as Record<string, unknown>
    ;(item.onPointerDown as (e: PointerEvent) => void)(
      { button: 0, pointerId: 1, clientX: 0, clientY: 50 } as PointerEvent,
    )
    expect(s.state()).toBe('pending')
    s.service.send({ type: 'POINTER.MOVE', point: at(200) })
    expect(s.state()).toBe('dragging')
  })

  it('按在项上不拦默认行为——项里常有按钮与链接，拦掉会连它们的聚焦一起拦掉', () => {
    const s = makeSortable()
    let prevented = false
    const item = s.api().getItemProps({ id: 'a' }) as Record<string, unknown>
    ;(item.onPointerDown as (e: PointerEvent) => void)(
      { button: 0, pointerId: 1, clientX: 0, clientY: 50, preventDefault: () => { prevented = true } } as unknown as PointerEvent,
    )
    expect(prevented).toBe(false)
  })

  it('手柄冒泡上来的那一次是幂等的，不会另起一场', () => {
    const s = makeSortable()
    const api = s.api()
    const down = { button: 0, pointerId: 1, clientX: 0, clientY: 50, preventDefault: () => {} } as unknown as PointerEvent
    ;((api.getItemHandleProps({ id: 'a' }) as Record<string, unknown>).onPointerDown as (e: PointerEvent) => void)(down)
    // 手柄在项里面，同一次按下会再冒泡到项上
    ;((api.getItemProps({ id: 'a' }) as Record<string, unknown>).onPointerDown as (e: PointerEvent) => void)(down)
    expect(s.state()).toBe('pending')
    expect(s.api().activeId).toBe('a')
  })

  it('项上的键盘只认空格：Enter 通常已经是这一项的主操作', () => {
    const s = makeSortable()
    const el = {}
    const item = s.api().getItemProps({ id: 'a' }) as Record<string, unknown>
    const key = (k: string) => ({ key: k, target: el, currentTarget: el, preventDefault: () => {} }) as unknown as KeyboardEvent
    ;(item.onKeyDown as (e: KeyboardEvent) => void)(key('Enter'))
    expect(s.state()).toBe('idle')
    ;(item.onKeyDown as (e: KeyboardEvent) => void)(key(' '))
    expect(s.state()).toBe('dragging')
  })

  it('焦点在项内部的按钮上时空格不算拾起', () => {
    const s = makeSortable()
    const item = s.api().getItemProps({ id: 'a' }) as Record<string, unknown>
    ;(item.onKeyDown as (e: KeyboardEvent) => void)(
      { key: ' ', target: {}, currentTarget: {}, preventDefault: () => {} } as unknown as KeyboardEvent,
    )
    expect(s.state()).toBe('idle')
  })
})

describe('排序 · 逐项禁用', () => {
  it('禁掉的那一项拖不动，别的照拖', () => {
    const s = makeSortable()
    const down = { button: 0, pointerId: 1, clientX: 0, clientY: 50, preventDefault: () => {} } as unknown as PointerEvent
    ;((s.api().getItemProps({ id: 'a', disabled: true }) as Record<string, unknown>).onPointerDown as (e: PointerEvent) => void)(down)
    expect(s.state()).toBe('idle')
    ;((s.api().getItemProps({ id: 'b' }) as Record<string, unknown>).onPointerDown as (e: PointerEvent) => void)(down)
    expect(s.state()).toBe('pending')
  })

  it('禁掉的那一项手柄退出 Tab 序列并报 aria-disabled', () => {
    const s = makeSortable()
    const handle = s.api().getItemHandleProps({ id: 'a', disabled: true }) as Record<string, unknown>
    expect(handle.tabindex).toBeUndefined()
    expect(handle['aria-disabled']).toBe('true')
    const other = s.api().getItemHandleProps({ id: 'b' }) as Record<string, unknown>
    expect(other.tabindex).toBe(0)
    expect(other['aria-disabled']).toBe('false')
  })

  it('项级禁用与列表级禁用各管各的：列表禁了，逐项没写也一样禁', () => {
    const s = makeSortable({ disabled: true })
    const item = s.api().getItemProps({ id: 'a' }) as Record<string, unknown>
    expect(item['data-disabled']).toBe('')
  })

  it('禁掉的那一项键盘也拾不起来', () => {
    const s = makeSortable()
    const el = {}
    const item = s.api().getItemProps({ id: 'a', disabled: true }) as Record<string, unknown>
    ;(item.onKeyDown as (e: KeyboardEvent) => void)(
      { key: ' ', target: el, currentTarget: el, preventDefault: () => {} } as unknown as KeyboardEvent,
    )
    expect(s.state()).toBe('idle')
  })
})
