// @vitest-environment jsdom
// 列拖拽：纯算法（谁能拖、落点折算）与机器/连接层（指针拖动、键盘命令、播报）。
import type { TableColumn, TableColumnDef, TableSchema } from '../src/table'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  columnDragRects,
  columnMoveCommand,
  columnMoveIntentFromKey,
  connectTable,
  draggableColumnIds,
  tableMachine,
  toColumnPreferenceIndex,
} from '../src/table'

/** 裸字符串 = 声明了 reorderable 的数据列；[id,'sticky'] = 冻结列；['plain',id] = 没声明可拖的列。 */
function cols(...spec: (string | [string, 'sticky'] | ['prefix', string] | ['plain', string])[]): TableColumn[] {
  return spec.map((item) => {
    if (Array.isArray(item) && item[0] === 'prefix')
      return { id: item[1], kind: 'index' } as TableColumn
    if (Array.isArray(item) && item[0] === 'plain')
      return { id: item[1], kind: 'data' } as TableColumn
    if (Array.isArray(item))
      return { id: item[0], kind: 'data', sticky: true, reorderable: true } as TableColumn
    return { id: item, kind: 'data', reorderable: true } as TableColumn
  })
}

describe('谁能拖', () => {
  it('前缀列不是作者的列，列偏好里根本没有它们', () => {
    expect(draggableColumnIds(cols(['prefix', '__select__'], 'a', 'b'))).toEqual(['a', 'b'])
  })

  it('没声明 reorderable 的列不产出把手——每个把手都是一个 Tab 位', () => {
    expect(draggableColumnIds(cols(['plain', 'a'], 'b', 'c'))).toEqual(['b', 'c'])
  })

  it('不可拖的列与冻结列一样是屏障，跨过它去落会把它挤走', () => {
    expect(draggableColumnIds(cols('a', ['plain', 'fixed'], 'c', 'd'))).toEqual(['c', 'd'])
  })

  it('冻结列自己不参与', () => {
    expect(draggableColumnIds(cols(['a', 'sticky'], 'b', 'c'))).toEqual(['b', 'c'])
  })

  it('两端各钉一列时，中间整段都能拖——这是最常见的排法', () => {
    expect(draggableColumnIds(cols(['name', 'sticky'], 'b', 'c', 'd', ['ops', 'sticky'])))
      .toEqual(['b', 'c', 'd'])
  })

  it('冻结列夹在中间时取最长的一段，短的那段退出', () => {
    // 跨过冻结列去落，落下来那一列会夹在钉住的列当中一起悬在滚动之上
    expect(draggableColumnIds(cols('a', ['pin', 'sticky'], 'c', 'd', 'e'))).toEqual(['c', 'd', 'e'])
  })

  it('全是冻结列时一列都不能拖', () => {
    expect(draggableColumnIds(cols(['a', 'sticky'], ['b', 'sticky']))).toEqual([])
  })

  it('只有一列时段落成立但拖不动（命令层挡住）', () => {
    expect(draggableColumnIds(cols('a'))).toEqual(['a'])
    expect(columnMoveCommand(['a'], 'a', 'next')).toBeNull()
  })
})

describe('矩形快照', () => {
  it('只收可拖的列，量不到的跳过', () => {
    const boxes: Record<string, { start: number, size: number }> = {
      b: { start: 100, size: 80 },
      c: { start: 180, size: 80 },
    }
    const rects = columnDragRects(
      cols(['prefix', '__index__'], ['a', 'sticky'], 'b', 'c', 'd'),
      id => boxes[id] ?? null,
    )
    expect(rects).toEqual([
      { value: 'b', start: 100, size: 80 },
      { value: 'c', start: 180, size: 80 },
    ])
  })
})

describe('落点折算成列偏好下标', () => {
  const AUTHOR = ['name', 'owner', 'status', 'time']

  it('没有偏好时基线就是作者给的原顺序', () => {
    expect(toColumnPreferenceIndex(AUTHOR, undefined, 'time', { targetValue: 'name', position: 'before' }))
      .toBe(0)
  })

  it('有 order 时按 order 排过再算', () => {
    // 生效列序是 time, name, owner, status
    expect(toColumnPreferenceIndex(AUTHOR, ['time'], 'status', { targetValue: 'time', position: 'after' }))
      .toBe(1)
  })

  it('隐藏列仍在作者列序里，落点跨过它时它留在原本的邻居旁边', () => {
    // owner 藏着但仍占 order 的一个位；name 落到 status 前面 = 插在 owner 与 status 之间
    const to = toColumnPreferenceIndex(AUTHOR, undefined, 'name', { targetValue: 'status', position: 'before' })
    expect(to).toBe(1)
    const ordered = [...AUTHOR]
    ordered.splice(ordered.indexOf('name'), 1)
    ordered.splice(to!, 0, 'name')
    expect(ordered).toEqual(['owner', 'name', 'status', 'time'])
  })

  it('落到自己身上不是一次移动', () => {
    expect(toColumnPreferenceIndex(AUTHOR, undefined, 'name', { targetValue: 'name', position: 'after' }))
      .toBeNull()
  })

  it('算下来还是原位时返回 null，不发一次空提交', () => {
    expect(toColumnPreferenceIndex(AUTHOR, undefined, 'owner', { targetValue: 'name', position: 'after' }))
      .toBeNull()
  })

  it('往后搬吃到先摘后插的修正', () => {
    // name 落到 status 后面：摘掉 name 之后 status 在 1，插到它后面是 2
    expect(toColumnPreferenceIndex(AUTHOR, undefined, 'name', { targetValue: 'status', position: 'after' }))
      .toBe(2)
  })
})

describe('键盘命令', () => {
  const D = ['b', 'c', 'd']

  it('往前一格 = 落在前一列之前，往后一格 = 落在后一列之后', () => {
    expect(columnMoveCommand(D, 'c', 'prev')).toEqual({ targetValue: 'b', position: 'before' })
    expect(columnMoveCommand(D, 'c', 'next')).toEqual({ targetValue: 'd', position: 'after' })
  })

  it('到段首末就停住，不回绕——回绕会让人以为按坏了', () => {
    expect(columnMoveCommand(D, 'b', 'prev')).toBeNull()
    expect(columnMoveCommand(D, 'd', 'next')).toBeNull()
  })

  it('按 Home / End 直接到段首末', () => {
    expect(columnMoveCommand(D, 'd', 'first')).toEqual({ targetValue: 'b', position: 'before' })
    expect(columnMoveCommand(D, 'b', 'last')).toEqual({ targetValue: 'd', position: 'after' })
  })

  it('已经在段首末时 Home / End 不动', () => {
    expect(columnMoveCommand(D, 'b', 'first')).toBeNull()
    expect(columnMoveCommand(D, 'd', 'last')).toBeNull()
  })

  it('不在可拖段里的列（冻结列）一个命令都不认', () => {
    expect(columnMoveCommand(D, 'pinned', 'next')).toBeNull()
  })

  it('方向键跟着文字方向翻', () => {
    expect(columnMoveIntentFromKey('ArrowLeft', false)).toBe('prev')
    expect(columnMoveIntentFromKey('ArrowLeft', true)).toBe('next')
    expect(columnMoveIntentFromKey('Home', false)).toBe('first')
    expect(columnMoveIntentFromKey('Home', true)).toBe('last')
  })

  it('不归它管的键返回 null，绝不 preventDefault', () => {
    expect(columnMoveIntentFromKey('Enter', false)).toBeNull()
    expect(columnMoveIntentFromKey('ArrowUp', false)).toBeNull()
  })
})

// ——— 以下是机器与连接层 ———

type Props = TableSchema['props']
type Dict = Record<string, unknown>

const COLUMNS: TableColumnDef[] = [
  { id: 'name', label: '名称', width: 100, reorderable: true },
  { id: 'owner', label: '负责人', width: 100, reorderable: true },
  { id: 'status', label: '状态', width: 100, reorderable: true },
  { id: 'fixed', label: '不可拖', width: 100 },
]

/**
 * 最小标记：表头一行，每列一个表头格 + 一个拖拽把手。
 * jsdom 不排版，落点判定要的横向位置打在表头格上：四列各占 100px，首尾相接。
 */
function mount(initial: Partial<Props> = {}) {
  const props: Partial<Props> = { columns: COLUMNS, rows: [{ id: 'a' }], ...initial }
  const runtime = createVanillaRuntime()
  const service = createService(tableMachine, { props: () => props, runtime })
  runtime.start()

  const triggers = new Map<string, HTMLElement>()
  const root = document.createElement('div')
  root.setAttribute('data-scope', 'table')
  root.setAttribute('data-part', 'root')
  const row = document.createElement('div')
  row.setAttribute('data-scope', 'table')
  row.setAttribute('data-part', 'row')

  ;(props.columns ?? []).forEach((column, i) => {
    const header = document.createElement('div')
    header.setAttribute('data-scope', 'table')
    header.setAttribute('data-part', 'column-header')
    header.setAttribute('data-value', column.id)
    const left = i * 100
    header.getBoundingClientRect = (): DOMRect =>
      ({ x: left, y: 0, width: 100, height: 32, top: 0, left, right: left + 100, bottom: 32, toJSON: () => ({}) }) as DOMRect

    const trigger = document.createElement('span')
    trigger.setAttribute('data-scope', 'table')
    trigger.setAttribute('data-part', 'column-drag-trigger')
    header.append(trigger)
    row.append(header)
    triggers.set(column.id, trigger)
  })
  root.append(row)
  document.body.append(root)

  return {
    service,
    api: () => connectTable(service, normalizeProps),
    trigger: (id: string) => triggers.get(id),
    state: () => service.state.get(),
    order: () => service.context.get('columnPreference').order,
    said: () => service.context.get('announcement'),
    visible: () => connectTable(service, normalizeProps).columns.map(c => c.id),
  }
}

type Harness = ReturnType<typeof mount>

function press(h: Harness, id: string, clientX: number, button = 0): void {
  const props = h.api().getColumnDragTriggerProps({ value: id }) as Dict
  ;(props.onPointerDown as (e: PointerEvent) => void)({
    button,
    pointerId: 1,
    clientX,
    currentTarget: h.trigger(id),
    preventDefault: () => {},
  } as unknown as PointerEvent)
}

function move(clientX: number, pointerId = 1): void {
  document.dispatchEvent(new PointerEvent('pointermove', { pointerId, clientX, bubbles: true }))
}

function release(): void {
  document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }))
}

function key(h: Harness, id: string, k: string, mods: Partial<KeyboardEvent> = {}): { prevented: boolean } {
  let prevented = false
  const props = h.api().getColumnDragTriggerProps({ value: id }) as Dict
  ;(props.onKeyDown as (e: KeyboardEvent) => void)(
    { key: k, ...mods, preventDefault: () => { prevented = true } } as KeyboardEvent,
  )
  return { prevented }
}

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('列拖拽 · 指针', () => {
  it('按下即进拖动态，落点先空着——指示线要等指针真的走到某一列上', () => {
    const h = mount()
    press(h, 'name', 50)
    expect(h.state()).toBe('columnDragging')
    expect(h.api().dropTarget).toBeNull()
  })

  it('右键不开拖', () => {
    const h = mount()
    press(h, 'name', 50, 2)
    expect(h.state()).toBe('idle')
  })

  it('没声明 reorderable 的列按不动', () => {
    const h = mount()
    press(h, 'fixed', 350)
    expect(h.state()).toBe('idle')
  })

  it('指针走到别的列上，落点跟着走；松手就落在那儿', () => {
    const h = mount()
    press(h, 'name', 50)
    move(280)
    expect(h.api().dropTarget).toEqual({ targetValue: 'status', position: 'after' })

    release()
    expect(h.state()).toBe('idle')
    expect(h.visible()).toEqual(['owner', 'status', 'name', 'fixed'])
  })

  it('落在自己身上不算落点，指示线消失', () => {
    const h = mount()
    press(h, 'owner', 150)
    move(120)
    expect(h.api().dropTarget).toBeNull()
  })

  it('指针在可拖列之外时没有落点，松手一步不动并播报一句', () => {
    const h = mount()
    press(h, 'name', 50)
    // 350 落在不可拖的 fixed 上——它不在快照里
    move(350)
    expect(h.api().dropTarget).toBeNull()

    release()
    expect(h.order()).toBeUndefined()
    // 视觉上「那条线没出现」已经说明了，读屏里得有人说一句
    expect(h.said()).toContain('cannot be dropped')
  })

  it('系统收走指针按取消算，列序一步不动', () => {
    const h = mount()
    press(h, 'name', 50)
    move(280)
    document.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1, bubbles: true }))
    expect(h.state()).toBe('idle')
    expect(h.order()).toBeUndefined()
    expect(h.said()).toContain('canceled')
  })

  it('第二根手指不劫持正在进行的这一场', () => {
    const h = mount()
    press(h, 'name', 50)
    move(280, 2)
    expect(h.api().dropTarget).toBeNull()
  })

  it('拖动中被拖的列只落 data-dragging，不带任何位移', () => {
    const h = mount()
    press(h, 'name', 50)
    const header = h.api().getColumnHeaderProps({ value: 'name' }) as Dict
    expect(header['data-dragging']).toBe('')
    // 祖先一有 transform，冻结列的 sticky 就掉出吸附
    expect(JSON.stringify(header.style ?? {})).not.toContain('transform')
  })

  it('落点那一列在表头与单元格上都发 data-drop——指示线要贯穿整张表', () => {
    const h = mount()
    press(h, 'name', 50)
    move(280)
    expect((h.api().getColumnHeaderProps({ value: 'status' }) as Dict)['data-drop']).toBe('after')
    expect((h.api().getCellProps({ value: 'status', row: 'a' }) as Dict)['data-drop']).toBe('after')
  })
})

describe('列拖拽 · 键盘命令', () => {
  it('方向键挪一位，一按就是一次完整提交——没有拾起放下两态', () => {
    const h = mount()
    const { prevented } = key(h, 'name', 'ArrowRight')
    expect(prevented).toBe(true)
    expect(h.visible()).toEqual(['owner', 'name', 'status', 'fixed'])
    expect(h.state()).toBe('idle')
  })

  it('到可拖区段的末尾，不越过不可拖的列', () => {
    const h = mount()
    key(h, 'name', 'End')
    // fixed 不可拖，段末是 status
    expect(h.visible()).toEqual(['owner', 'status', 'name', 'fixed'])
  })

  it('到段首末就停住：挡住默认行为但不发事件', () => {
    const h = mount()
    const { prevented } = key(h, 'name', 'ArrowLeft')
    expect(prevented).toBe(true)
    expect(h.order()).toBeUndefined()
  })

  it('rtl 下左右对调', () => {
    const h = mount({ dir: 'rtl' })
    key(h, 'name', 'ArrowLeft')
    expect(h.visible()).toEqual(['owner', 'name', 'status', 'fixed'])
  })

  it('带 Ctrl / Cmd / Alt 的组合不归它管，也不挡浏览器的默认行为', () => {
    for (const mods of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
      const h = mount()
      const { prevented } = key(h, 'name', 'ArrowRight', mods)
      expect(prevented).toBe(false)
      expect(h.order()).toBeUndefined()
    }
  })

  it('不可拖的列一个键都不认', () => {
    const h = mount()
    const { prevented } = key(h, 'fixed', 'ArrowLeft')
    expect(prevented).toBe(false)
  })
})

describe('列拖拽 · 播报', () => {
  it('挪完说的是可拖那一段里的新位置，用列名不用列 id', () => {
    const h = mount()
    key(h, 'name', 'ArrowRight')
    expect(h.said()).toBe('Moved 名称 to position 2 of 3.')
  })

  it('松手落定说 dropped', () => {
    const h = mount()
    press(h, 'name', 50)
    move(280)
    release()
    expect(h.said()).toBe('名称 dropped at position 3.')
  })

  it('translations 能逐句换掉', () => {
    const h = mount({
      translations: { moved: (n: string, p: number, t: number) => `${n} 挪到第 ${p}/${t} 位` },
    })
    key(h, 'name', 'ArrowRight')
    expect(h.said()).toBe('名称 挪到第 2/3 位')
  })
})

describe('列拖拽 · 把手产出的属性', () => {
  it('可拖的列自占一个 Tab 位，不可拖的退出 Tab 序列', () => {
    const h = mount()
    expect((h.api().getColumnDragTriggerProps({ value: 'name' }) as Dict).tabindex).toBe(0)
    expect((h.api().getColumnDragTriggerProps({ value: 'fixed' }) as Dict).tabindex).toBe(-1)
  })

  it('与同一个列头里的改宽把手角色不同，读屏说得清按的是哪一个', () => {
    const h = mount()
    const drag = h.api().getColumnDragTriggerProps({ value: 'name' }) as Dict
    const resize = h.api().getColumnResizeTriggerProps({ value: 'name' }) as Dict
    expect(drag.role).toBe('button')
    expect(drag['aria-roledescription']).toBe('draggable column')
    expect(resize.role).toBe('separator')
  })

  it('不可拖的列报 aria-disabled，但仍在标记里——列头构成随拖动变会让 Tab 序列跳动', () => {
    const h = mount()
    const props = h.api().getColumnDragTriggerProps({ value: 'fixed' }) as Dict
    expect(props['aria-disabled']).toBe('true')
    expect(props['data-disabled']).toBe('')
  })

  it('api 报出可拖的那一段，使用者据此决定渲不渲把手', () => {
    expect(mount().api().draggableColumns).toEqual(['name', 'owner', 'status'])
  })

  it('播报区是视觉隐藏的 status 活区', () => {
    const props = mount().api().getLiveRegionProps() as Dict
    expect(props.role).toBe('status')
    expect(props['aria-live']).toBe('polite')
    expect((props.style as Dict).clipPath).toBe('inset(50%)')
  })
})

describe('列拖拽 · 受控', () => {
  it('受控时只发通知，内部列序一步不动', () => {
    const onColumnPreferenceChange = vi.fn()
    const h = mount({ columnPreference: {}, onColumnPreferenceChange })
    key(h, 'name', 'ArrowRight')
    expect(onColumnPreferenceChange).toHaveBeenCalledWith({ value: { order: ['owner', 'name', 'status', 'fixed'] } })
    expect(h.visible()).toEqual(['name', 'owner', 'status', 'fixed'])
  })

  it('已有列偏好时在它的基础上改，别的字段不动', () => {
    const h = mount({ defaultColumnPreference: { hidden: ['owner'], widths: { name: 150 } } })
    key(h, 'name', 'ArrowRight')
    const pref = h.service.context.get('columnPreference')
    expect(pref.hidden).toEqual(['owner'])
    expect(pref.widths).toEqual({ name: 150 })
    expect(pref.order).toBeDefined()
  })
})
