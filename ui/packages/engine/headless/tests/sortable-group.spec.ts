// @vitest-environment jsdom
import type { SortableSchema } from '../src/sortable'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { connectSortable, sortableAnnouncement, sortableMachine } from '../src/sortable'

const H = 100
const W = 200

function box(x: number, y: number, width: number, height: number): DOMRect {
  return { x, y, width, height, top: y, left: x, right: x + width, bottom: y + height, toJSON: () => ({}) } as DOMRect
}

/**
 * 一个竖排列表：容器左上角在 (x, 0)，每项 200×100、首尾相接。jsdom 不排版，矩形打在真实节点上；
 * 容器至少高两项，空列表也有落脚的地方。
 */
function mountList(ids: readonly string[], x: number, label: string): HTMLElement {
  const root = document.createElement('div')
  root.setAttribute('data-scope', 'sortable')
  root.setAttribute('data-part', 'root')
  root.setAttribute('aria-label', label)
  ids.forEach((id, i) => {
    const item = document.createElement('div')
    item.setAttribute('data-scope', 'sortable')
    item.setAttribute('data-part', 'item')
    item.setAttribute('data-value', id)
    item.textContent = id
    item.getBoundingClientRect = () => box(x, i * H, W, H)
    root.append(item)
  })
  root.getBoundingClientRect = () => box(x, 0, W, Math.max(ids.length, 2) * H)
  document.body.append(root)
  return root
}

const stops: Array<() => void> = []

function makeList(listId: string, ids: string[], x: number, props: Partial<SortableSchema['props']> = {}) {
  const root = mountList(ids, x, `列 ${listId}`)
  const runtime = createVanillaRuntime()
  const service = createService(sortableMachine, {
    runtime,
    props: () => ({ ids, group: 'board', listId, ...props }) as SortableSchema['props'],
  })
  service.refs.set('getRootEl', () => root)
  runtime.start()
  stops.push(() => runtime.stop())
  return {
    service,
    root,
    api: () => connectSortable(service, normalizeProps),
    rootProps: () => connectSortable(service, normalizeProps).getRootProps() as Record<string, unknown>,
    indicator: () => connectSortable(service, normalizeProps).getDropIndicatorProps() as Record<string, unknown>,
  }
}

/** 看板：A 列在 x 0..200，B 列在 x 300..500。 */
function board(props: { a?: Partial<SortableSchema['props']>, b?: Partial<SortableSchema['props']> } = {}, bIds = ['b1', 'b2']) {
  const a = makeList('A', ['a1', 'a2', 'a3'], 0, props.a)
  const b = makeList('B', bIds, 300, props.b)
  return { a, b }
}

const point = (clientX: number, clientY: number) => ({ clientX, clientY })

beforeEach(() => {
  document.body.innerHTML = ''
})

afterEach(() => {
  while (stops.length) stops.pop()!()
})

describe('排序组 · 指针拖进别的列表', () => {
  it('被拖项的中心进了别的列表：落点换到那个列表，它的插入点及其后的项让出一格', () => {
    const { a, b } = board()
    a.service.send({ type: 'ITEM.POINTER_DOWN', id: 'a1', point: point(100, 50), pointerId: 1 })
    // 位移 (300, 100)：中心到 (400, 150)，越过 b1 的中心、还没越过 b2 的
    a.service.send({ type: 'POINTER.MOVE', point: point(400, 150) })
    expect(a.service.context.get('toList')).toBe('B')
    expect(a.api().to).toBe(1)
    expect(b.service.context.get('incoming')).toMatchObject({ id: 'a1', fromList: 'A', index: 1, mode: 'pointer' })
    expect(b.api().items.map(item => item.offset)).toEqual([{ x: 0, y: 0 }, { x: 0, y: H }])
    // 源列表：被拖项跟手，它后面的各项合拢
    expect(a.api().items.map(item => item.offset)).toEqual([{ x: 300, y: 100 }, { x: 0, y: -H }, { x: 0, y: -H }])
  })

  it('目标列表的根报 data-drop=inside 并写出落进来那一格的尺寸，落点线画在那一格的起始缘上', () => {
    const { a, b } = board()
    a.service.send({ type: 'ITEM.POINTER_DOWN', id: 'a1', point: point(100, 50), pointerId: 1 })
    a.service.send({ type: 'POINTER.MOVE', point: point(400, 150) })
    expect(b.rootProps()['data-drop']).toBe('inside')
    expect((b.rootProps().style as Record<string, string>)['--xh-_sortable-incoming-size']).toBe(`${H}px`)
    expect(b.indicator().hidden).toBeUndefined()
    expect((b.indicator().style as Record<string, string>).translate).toBe('0px 100px')
    // 源列表的线收起：落点不在它这里
    expect(a.indicator().hidden).toBe(true)
    expect(a.rootProps()['data-drop']).toBeUndefined()
  })

  it('松手：源列表发一次 transfer，两个列表的新顺序都算好；不发 sort，目标列表撤掉让位', () => {
    const onTransfer = vi.fn()
    const onSort = vi.fn()
    const onDragEnd = vi.fn()
    const { a, b } = board({ a: { onTransfer, onSort, onDragEnd } })
    a.service.send({ type: 'ITEM.POINTER_DOWN', id: 'a1', point: point(100, 50), pointerId: 1 })
    a.service.send({ type: 'POINTER.MOVE', point: point(400, 150) })
    a.service.send({ type: 'POINTER.END' })
    expect(onTransfer).toHaveBeenCalledTimes(1)
    expect(onTransfer.mock.calls[0]![0]).toEqual({
      id: 'a1',
      fromList: 'A',
      toList: 'B',
      from: 0,
      to: 1,
      fromIds: ['a2', 'a3'],
      toIds: ['b1', 'a1', 'b2'],
    })
    expect(onSort).not.toHaveBeenCalled()
    expect(onDragEnd.mock.calls[0]![0]).toMatchObject({ id: 'a1', from: 0, to: 1, canceled: false, fromList: 'A', toList: 'B' })
    expect(b.service.context.get('incoming')).toBeNull()
    expect(a.service.context.get('toList')).toBeNull()
  })

  it('拖回源列表：目标列表撤掉让位，落点回到源列表里按中心判', () => {
    const { a, b } = board()
    a.service.send({ type: 'ITEM.POINTER_DOWN', id: 'a1', point: point(100, 50), pointerId: 1 })
    a.service.send({ type: 'POINTER.MOVE', point: point(400, 150) })
    a.service.send({ type: 'POINTER.MOVE', point: point(100, 160) })
    expect(b.service.context.get('incoming')).toBeNull()
    expect(a.service.context.get('toList')).toBeNull()
    expect(a.api().to).toBe(1)
  })

  it('中心落在两列之间的空白里：落点留在上一个列表，不来回跳', () => {
    const { a, b } = board()
    a.service.send({ type: 'ITEM.POINTER_DOWN', id: 'a1', point: point(100, 50), pointerId: 1 })
    a.service.send({ type: 'POINTER.MOVE', point: point(400, 150) })
    a.service.send({ type: 'POINTER.MOVE', point: point(250, 150) })
    expect(a.service.context.get('toList')).toBe('B')
    expect(b.service.context.get('incoming')?.index).toBe(1)
  })

  it('系统收走指针：目标列表撤掉让位，不发 transfer，收尾标 canceled 且列表回到源列表', () => {
    const onTransfer = vi.fn()
    const onDragEnd = vi.fn()
    const { a, b } = board({ a: { onTransfer, onDragEnd } })
    a.service.send({ type: 'ITEM.POINTER_DOWN', id: 'a1', point: point(100, 50), pointerId: 1 })
    a.service.send({ type: 'POINTER.MOVE', point: point(400, 150) })
    a.service.send({ type: 'POINTER.CANCEL' })
    expect(onTransfer).not.toHaveBeenCalled()
    expect(b.service.context.get('incoming')).toBeNull()
    expect(onDragEnd.mock.calls[0]![0]).toMatchObject({ canceled: true, from: 0, to: 0, fromList: 'A', toList: 'A' })
  })

  it('拖进空列表：落在第 0 位，落点线在内容盒起点', () => {
    const onTransfer = vi.fn()
    const { a, b } = board({ a: { onTransfer } }, [])
    a.service.send({ type: 'ITEM.POINTER_DOWN', id: 'a2', point: point(100, 150), pointerId: 1 })
    a.service.send({ type: 'POINTER.MOVE', point: point(400, 50) })
    expect(b.service.context.get('incoming')?.index).toBe(0)
    expect((b.indicator().style as Record<string, string>).translate).toBe('0px')
    a.service.send({ type: 'POINTER.END' })
    expect(onTransfer.mock.calls[0]![0]).toMatchObject({ id: 'a2', from: 1, to: 0, fromIds: ['a1', 'a3'], toIds: ['a2'] })
  })
})

describe('排序组 · 键盘在列表间挪', () => {
  it('另一条轴上的键挪进下一个列表：位次沿用、被拖项平移进那一格', () => {
    const { a, b } = board()
    a.service.send({ type: 'ITEM.PICKUP', id: 'a2' })
    a.service.send({ type: 'KEY.MOVE_LIST', step: 1 })
    expect(a.service.context.get('toList')).toBe('B')
    expect(a.api().to).toBe(1)
    expect(b.service.context.get('incoming')).toMatchObject({ index: 1, mode: 'keyboard' })
    // a2 原在 (0, 100)，那一格是 b2 此刻的起点 (300, 100)
    expect(a.api().items[1]?.offset).toEqual({ x: 300, y: 0 })
  })

  it('在别的列表里方向键逐格挪，可以排到末项之后，再往后不动', () => {
    const { a, b } = board()
    a.service.send({ type: 'ITEM.PICKUP', id: 'a1' })
    a.service.send({ type: 'KEY.MOVE_LIST', step: 1 })
    a.service.send({ type: 'KEY.MOVE', step: 1 })
    a.service.send({ type: 'KEY.MOVE', step: 1 })
    expect(b.service.context.get('incoming')?.index).toBe(2)
    a.service.send({ type: 'KEY.MOVE', step: 1 })
    expect(b.service.context.get('incoming')?.index).toBe(2)
    // 末项之后那一格：接在 b2 之后
    expect(a.api().items[0]?.offset).toEqual({ x: 300, y: 2 * H })
  })

  it('到了组的两头不动，也不回绕；挪回源列表时位次夹在源列表的长度内', () => {
    const { a, b } = board()
    a.service.send({ type: 'ITEM.PICKUP', id: 'a3' })
    a.service.send({ type: 'KEY.MOVE_LIST', step: -1 })
    // 已是组里第一个列表：落点不动
    expect(a.service.context.get('toList') ?? null).toBeNull()
    a.service.send({ type: 'KEY.MOVE_LIST', step: 1 })
    // 源列表第 2 位挪进只有两项的 B：排到末尾
    expect(b.service.context.get('incoming')?.index).toBe(2)
    a.service.send({ type: 'KEY.MOVE_LIST', step: 1 })
    expect(a.service.context.get('toList')).toBe('B')
    a.service.send({ type: 'KEY.MOVE_LIST', step: -1 })
    expect(b.service.context.get('incoming')).toBeNull()
    expect(a.api().to).toBe(2)
  })

  it('放下发 transfer；Escape 取消时目标列表撤掉让位、一次都不发', () => {
    const onTransfer = vi.fn()
    const { a, b } = board({ a: { onTransfer } })
    a.service.send({ type: 'ITEM.PICKUP', id: 'a1' })
    a.service.send({ type: 'KEY.MOVE_LIST', step: 1 })
    a.service.send({ type: 'KEY.CANCEL' })
    expect(onTransfer).not.toHaveBeenCalled()
    expect(b.service.context.get('incoming')).toBeNull()

    a.service.send({ type: 'ITEM.PICKUP', id: 'a1' })
    a.service.send({ type: 'KEY.MOVE_LIST', step: 1 })
    a.service.send({ type: 'KEY.DROP' })
    expect(onTransfer.mock.calls[0]![0]).toMatchObject({ id: 'a1', fromList: 'A', toList: 'B', from: 0, to: 0, toIds: ['a1', 'b1', 'b2'] })
  })

  it('竖排列表入组后左右键归列表间，rtl 下对调；未入组时照旧放行', () => {
    const { a } = board()
    a.service.send({ type: 'ITEM.PICKUP', id: 'a1' })
    const key = (k: string) => new KeyboardEvent('keydown', { key: k, cancelable: true })
    const right = key('ArrowRight')
    ;(a.api().getItemDragTriggerProps({ id: 'a1' }) as { onKeyDown: (e: KeyboardEvent) => void }).onKeyDown(right)
    expect(right.defaultPrevented).toBe(true)
    expect(a.service.context.get('toList')).toBe('B')

    const rtl = makeList('R', ['r1'], 600, { group: 'rtl-board', dir: 'rtl' })
    makeList('S', ['s1'], 900, { group: 'rtl-board', dir: 'rtl' })
    rtl.service.send({ type: 'ITEM.PICKUP', id: 'r1' })
    ;(rtl.api().getItemDragTriggerProps({ id: 'r1' }) as { onKeyDown: (e: KeyboardEvent) => void }).onKeyDown(key('ArrowLeft'))
    expect(rtl.service.context.get('toList')).toBe('S')

    const alone = makeList('C', ['c1'], 1200, { group: undefined, listId: undefined })
    alone.service.send({ type: 'ITEM.PICKUP', id: 'c1' })
    const pass = key('ArrowRight')
    ;(alone.api().getItemDragTriggerProps({ id: 'c1' }) as { onKeyDown: (e: KeyboardEvent) => void }).onKeyDown(pass)
    expect(pass.defaultPrevented).toBe(false)
  })
})

describe('排序组 · 播报', () => {
  it('挪进别的列表先说列表名与它在组里排第几，再说位次；在那个列表里再挪只说位次', () => {
    const { a } = board()
    a.service.send({ type: 'ITEM.PICKUP', id: 'a1' })
    a.service.send({ type: 'KEY.MOVE_LIST', step: 1 })
    expect(a.service.context.get('announcement')).toBe('Moved to 列 B, list 2 of 2. Position 1 of 3.')
    a.service.send({ type: 'KEY.MOVE', step: 1 })
    expect(a.service.context.get('announcement')).toBe('Moved to position 2 of 3.')
    a.service.send({ type: 'KEY.DROP' })
    expect(a.service.context.get('announcement')).toBe('a1 dropped into 列 B, list 2, at position 2.')
  })

  it('挪回源列表同样报出列表', () => {
    const { a } = board()
    a.service.send({ type: 'ITEM.PICKUP', id: 'a2' })
    a.service.send({ type: 'KEY.MOVE_LIST', step: 1 })
    a.service.send({ type: 'KEY.MOVE_LIST', step: -1 })
    expect(a.service.context.get('announcement')).toBe('Moved to 列 A, list 1 of 2. Position 2 of 3.')
  })

  it('列表名优先取 aria-labelledby 指向的文字', () => {
    const { a, b } = board()
    const heading = document.createElement('h3')
    heading.id = 'col-b'
    heading.textContent = '进行中'
    document.body.append(heading)
    b.root.setAttribute('aria-labelledby', 'col-b')
    a.service.send({ type: 'ITEM.PICKUP', id: 'a1' })
    a.service.send({ type: 'KEY.MOVE_LIST', step: 1 })
    expect(a.service.context.get('announcement')).toContain('Moved to 进行中')
  })

  it('两句跨列表的话都能整句覆盖', () => {
    expect(sortableAnnouncement('movedToList', {
      id: 'x',
      position: 2,
      total: 4,
      list: { name: '进行中', position: 2, total: 3 },
      translations: { movedToList: (name, lp, lt, p, t) => `移到第 ${lp}/${lt} 列「${name}」第 ${p}/${t} 位` },
    })).toBe('移到第 2/3 列「进行中」第 2/4 位')
    expect(sortableAnnouncement('droppedInList', {
      id: 'x',
      position: 1,
      total: 4,
      list: { name: '已完成', position: 3, total: 3 },
      translations: { droppedInList: (name, list, lp, p) => `${name} 放进第 ${lp} 列「${list}」第 ${p} 位` },
    })).toBe('x 放进第 3 列「已完成」第 1 位')
  })
})

describe('排序组 · 非法组合立即报错', () => {
  it('写了 group 不写 listId', () => {
    const s = makeList('A', ['a1'], 0, { listId: undefined })
    expect(() => s.api()).toThrow(/listId/)
  })

  it('换行网格不能入组', () => {
    const s = makeList('A', ['a1'], 0, { orientation: 'both' })
    expect(() => s.api()).toThrow(/orientation="both"/)
  })

  it('组内 listId 重复：拖动开始即报错', () => {
    const a = makeList('A', ['a1'], 0)
    makeList('A', ['b1'], 300)
    expect(() => a.service.send({ type: 'ITEM.PICKUP', id: 'a1' })).toThrow(/listId/)
  })

  it('不同组的列表互不认得', () => {
    const a = makeList('A', ['a1'], 0)
    const b = makeList('B', ['b1'], 300, { group: 'other' })
    a.service.send({ type: 'ITEM.PICKUP', id: 'a1' })
    a.service.send({ type: 'KEY.MOVE_LIST', step: 1 })
    expect(a.service.context.get('toList') ?? null).toBeNull()
    expect(b.service.context.get('incoming') ?? null).toBeNull()
  })
})
