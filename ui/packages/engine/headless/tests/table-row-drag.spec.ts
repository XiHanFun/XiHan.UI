// @vitest-environment jsdom
// 行拖拽：纯算法（行组并块、降级判定、命令）与机器/连接层（激活阈值、长按、播报）。
import type { TableRowDef, TableSchema } from '../src/table'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flatMoveCommand, flatMoveIntentFromKey, reorderFlat } from '../src/shared/drag'
import {
  connectTable,
  rowGroupRects,
  rowReorderReason,
  tableMachine,
} from '../src/table'

describe('行组并块', () => {
  it('没有详情行时，一行就是一块', () => {
    expect(rowGroupRects([
      { value: 'a', kind: 'data', start: 0, size: 40 },
      { value: 'b', kind: 'data', start: 40, size: 40 },
    ])).toEqual([
      { value: 'a', start: 0, size: 40 },
      { value: 'b', start: 40, size: 40 },
    ])
  })

  it('详情行并进它所属的数据行——否则拖过展开着的行时落点会来回跳', () => {
    expect(rowGroupRects([
      { value: 'a', kind: 'data', start: 0, size: 40 },
      { value: 'a', kind: 'expanded', start: 40, size: 60 },
      { value: 'b', kind: 'data', start: 100, size: 40 },
    ])).toEqual([
      { value: 'a', start: 0, size: 100 },
      { value: 'b', start: 100, size: 40 },
    ])
  })

  it('并出来的块取两者的外接范围，顺序颠倒也不出负数', () => {
    expect(rowGroupRects([
      { value: 'a', kind: 'data', start: 50, size: 40 },
      { value: 'a', kind: 'expanded', start: 10, size: 20 },
    ])).toEqual([{ value: 'a', start: 10, size: 80 }])
  })

  it('孤立的详情行（前面没有数据行）丢掉，不凭空造一块', () => {
    expect(rowGroupRects([
      { value: 'ghost', kind: 'expanded', start: 0, size: 40 },
      { value: 'a', kind: 'data', start: 40, size: 40 },
    ])).toEqual([{ value: 'a', start: 40, size: 40 }])
  })

  it('空进空出', () => {
    expect(rowGroupRects([])).toEqual([])
  })
})

describe('行拖不动的原因', () => {
  it('都不占时能拖', () => {
    expect(rowReorderReason(0, false, 3, 3)).toBeNull()
  })

  it('排序链非空：拖出来的新序下一帧就被排序键覆盖', () => {
    expect(rowReorderReason(1, false, 3, 3)).toBe('sorted')
  })

  it('树形行：换父两个下标说不出来', () => {
    expect(rowReorderReason(0, true, 3, 3)).toBe('hierarchical')
  })

  it('量到的行数与数据行数对不上 = 宿主只渲了一段，窗口外的行没有矩形', () => {
    expect(rowReorderReason(0, false, 10, 500)).toBe('virtualized')
  })

  it('排序优先于树形，树形优先于虚拟——先报最上游那条', () => {
    expect(rowReorderReason(1, true, 10, 500)).toBe('sorted')
    expect(rowReorderReason(0, true, 10, 500)).toBe('hierarchical')
  })

  it('渲染期量不到行数，两者都不给时不判虚拟', () => {
    expect(rowReorderReason(0, false)).toBeNull()
  })
})

describe('行的键盘命令', () => {
  const IDS = ['a', 'b', 'c']

  it('上一格 = 落在前一行之前，下一格 = 落在后一行之后', () => {
    expect(flatMoveCommand(IDS, 'b', 'prev')).toEqual({ targetValue: 'a', position: 'before' })
    expect(flatMoveCommand(IDS, 'b', 'next')).toEqual({ targetValue: 'c', position: 'after' })
  })

  it('到首末就停住，不回绕', () => {
    expect(flatMoveCommand(IDS, 'a', 'prev')).toBeNull()
    expect(flatMoveCommand(IDS, 'c', 'next')).toBeNull()
  })

  it('不在可见行里的行一个命令都不认', () => {
    expect(flatMoveCommand(IDS, 'ghost', 'next')).toBeNull()
  })

  it('纵轴与文字方向无关，不翻', () => {
    expect(flatMoveIntentFromKey('ArrowUp', 'vertical')).toBe('prev')
    expect(flatMoveIntentFromKey('ArrowDown', 'vertical')).toBe('next')
    expect(flatMoveIntentFromKey('ArrowLeft', 'vertical')).toBeNull()
  })
})

describe('搬完之后的行序', () => {
  const IDS = ['a', 'b', 'c', 'd']

  it('往后搬吃到先摘后插的修正', () => {
    expect(reorderFlat(IDS, 'a', { targetValue: 'c', position: 'after' }))
      .toEqual({ from: 0, to: 2, ids: ['b', 'c', 'a', 'd'] })
  })

  it('往前搬', () => {
    expect(reorderFlat(IDS, 'd', { targetValue: 'a', position: 'before' }))
      .toEqual({ from: 3, to: 0, ids: ['d', 'a', 'b', 'c'] })
  })

  it('落点算下来还是原位时返回 null，不发一次空提交', () => {
    expect(reorderFlat(IDS, 'b', { targetValue: 'a', position: 'after' })).toBeNull()
  })

  it('认不出的行返回 null', () => {
    expect(reorderFlat(IDS, 'ghost', { targetValue: 'a', position: 'before' })).toBeNull()
  })
})

// ——— 以下是机器与连接层 ———

type Props = TableSchema['props']
type Dict = Record<string, unknown>

const ROWS: TableRowDef[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]
const COLUMNS = [{ id: 'name', label: '名称' }]

/**
 * 最小标记：表体里四行，每行 40px 首尾相接。
 * jsdom 不排版，落点判定要的纵向位置打在行上。
 */
function mount(initial: Partial<Props> = {}) {
  const props: Partial<Props> = { columns: COLUMNS, rows: ROWS, rowReorderable: true, ...initial }
  const runtime = createVanillaRuntime()
  const service = createService(tableMachine, { props: () => props, runtime })
  runtime.start()

  const rowEls = new Map<string, HTMLElement>()
  const root = document.createElement('div')
  root.setAttribute('data-scope', 'table')
  root.setAttribute('data-part', 'root')
  const body = document.createElement('div')
  body.setAttribute('data-scope', 'table')
  body.setAttribute('data-part', 'body')

  let top = 0
  const box = (el: HTMLElement, start: number, size: number): void => {
    el.getBoundingClientRect = (): DOMRect =>
      ({ x: 0, y: start, width: 200, height: size, top: start, left: 0, right: 200, bottom: start + size, toJSON: () => ({}) }) as DOMRect
  }
  for (const row of props.rows ?? []) {
    const el = document.createElement('div')
    el.setAttribute('data-scope', 'table')
    el.setAttribute('data-part', 'row')
    el.setAttribute('data-value', row.id)
    box(el, top, 40)
    top += 40
    body.append(el)
    rowEls.set(row.id, el)
    // 展开着的行后面跟一条详情行，落点判定要把两者算作一整块
    if ((props.defaultExpanded ?? []).includes(row.id)) {
      const detail = document.createElement('div')
      detail.setAttribute('data-scope', 'table')
      detail.setAttribute('data-part', 'expanded-row')
      detail.setAttribute('data-value', row.id)
      box(detail, top, 60)
      top += 60
      body.append(detail)
    }
  }
  root.append(body)
  document.body.append(root)

  return {
    service,
    api: () => connectTable(service, normalizeProps),
    row: (id: string) => rowEls.get(id),
    body,
    state: () => service.state.get(),
    dragging: () => service.context.get('draggingRow') ?? null,
    said: () => service.context.get('announcement'),
  }
}

type Harness = ReturnType<typeof mount>

function press(
  h: Harness,
  id: string,
  clientY: number,
  init: { button?: number, pointerType?: string, target?: HTMLElement } = {},
): void {
  const props = h.api().getRowProps({ value: id }) as Dict
  const el = h.row(id)
  ;(props.onPointerDown as ((e: PointerEvent) => void) | undefined)?.({
    button: init.button ?? 0,
    pointerId: 1,
    clientY,
    pointerType: init.pointerType ?? 'mouse',
    currentTarget: el,
    target: init.target ?? el,
    preventDefault: () => {},
  } as unknown as PointerEvent)
}

function move(clientY: number, pointerId = 1): void {
  document.dispatchEvent(new PointerEvent('pointermove', { pointerId, clientY, bubbles: true }))
}

function release(): void {
  document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }))
}

function bodyKey(h: Harness, k: string, mods: Partial<KeyboardEvent> = {}): { prevented: boolean } {
  let prevented = false
  const props = h.api().getBodyProps() as Dict
  ;(props.onKeyDown as (e: KeyboardEvent) => void)({
    key: k,
    ...mods,
    currentTarget: h.body,
    target: h.body,
    preventDefault: () => { prevented = true },
  } as unknown as KeyboardEvent)
  return { prevented }
}

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('行拖拽 · 激活', () => {
  it('按下只是按住，还不是拖动——整行可拖，没有把手表明意图', () => {
    const h = mount()
    press(h, 'a', 20)
    expect(h.state()).toBe('rowDragging')
    expect(h.dragging()).toBeNull()
    expect((h.api().getRowProps({ value: 'a' }) as Dict)['data-dragging']).toBeUndefined()
  })

  it('鼠标走够阈值才算开始拖', () => {
    const h = mount()
    press(h, 'a', 20)
    move(23)
    expect(h.dragging()).toBeNull()
    move(30)
    expect(h.dragging()).toBe('a')
  })

  it('没走够就抬手 = 点了一下，什么都不发生也不播报', () => {
    const onRowMove = vi.fn()
    const h = mount({ onRowMove })
    press(h, 'a', 20)
    move(22)
    release()
    expect(h.state()).toBe('idle')
    expect(onRowMove).not.toHaveBeenCalled()
    expect(h.said()).toBe('')
  })

  it('触屏按下一律不开拖：纵向手势在按下那一刻就归了浏览器滚动', () => {
    // touch-action 在按下那一刻锁定，事后改不回来；而拖行恰好也是纵向。
    // 认了这一按就等于要么抢走整张表的滚动、要么第一次移动即被 pointercancel
    const h = mount()
    press(h, 'a', 20, { pointerType: 'touch' })
    expect(h.state()).toBe('idle')
  })

  it('右键不开拖', () => {
    const h = mount()
    press(h, 'a', 20, { button: 2 })
    expect(h.state()).toBe('idle')
  })

  it('按在行里的交互控件上不起拖：那儿按下去是要点它', () => {
    const h = mount()
    const button = document.createElement('button')
    h.row('a')?.append(button)
    press(h, 'a', 20, { target: button })
    expect(h.state()).toBe('idle')
  })
})

describe('行拖拽 · 落点与提交', () => {
  it('拖到别的行上，落点跟着走；松手报给宿主', () => {
    const onRowMove = vi.fn()
    const h = mount({ onRowMove })
    press(h, 'a', 20)
    // 四行各 40px：d 占 120-160，落在后半才是 after
    move(150)
    expect(h.api().dropTarget).toEqual({ targetValue: 'd', position: 'after' })

    release()
    expect(onRowMove).toHaveBeenCalledWith({ id: 'a', from: 0, to: 3, ids: ['b', 'c', 'd', 'a'] })
    expect(h.state()).toBe('idle')
  })

  it('落在自己身上不算落点，指示线消失', () => {
    const h = mount()
    press(h, 'b', 50)
    move(60)
    expect(h.api().dropTarget).toBeNull()
  })

  it('展开着的行按整块算：详情行不自成一个落点', () => {
    const h = mount({ defaultExpanded: ['b'] })
    press(h, 'a', 20)
    // b 占 40-80，它的详情行占 80-140；并块之后 40-140 整段都是 b
    move(120)
    expect(h.api().dropTarget).toEqual({ targetValue: 'b', position: 'after' })
  })

  it('系统收走指针按取消算，行序一步不动', () => {
    const onRowMove = vi.fn()
    const h = mount({ onRowMove })
    press(h, 'a', 20)
    move(130)
    document.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1, bubbles: true }))
    expect(onRowMove).not.toHaveBeenCalled()
    expect(h.said()).toContain('canceled')
  })

  it('第二根手指不劫持正在进行的这一场', () => {
    const h = mount()
    press(h, 'a', 20)
    move(130, 2)
    expect(h.dragging()).toBeNull()
  })

  it('被拖的行与它的详情行一起标 data-dragging：它们是同一块', () => {
    const h = mount({ defaultExpanded: ['a'] })
    press(h, 'a', 20)
    move(30)
    expect((h.api().getRowProps({ value: 'a' }) as Dict)['data-dragging']).toBe('')
    expect((h.api().getExpandedRowProps({ value: 'a' }) as Dict)['data-dragging']).toBe('')
  })

  it('拖动中不写任何位移：斑马纹与行间线按 DOM 位置算，跟手让位会让它们与行错开', () => {
    const h = mount()
    press(h, 'a', 20)
    move(130)
    const props = h.api().getRowProps({ value: 'a' }) as Dict
    expect(JSON.stringify(props.style ?? {})).not.toContain('transform')
  })
})

describe('行拖拽 · 三条降级', () => {
  it('排序链非空：拖出来的新序下一帧就被排序键覆盖', () => {
    const h = mount({ defaultSort: [{ id: 'name', direction: 'asc' }] })
    expect(h.api().rowReorderDisabledReason).toBe('sorted')
    press(h, 'a', 20)
    expect(h.state()).toBe('idle')
    expect((h.api().getRowProps({ value: 'a' }) as Dict)['data-row-draggable']).toBeUndefined()
  })

  it('有可展开的行不算树形：详情行是跟着数据行一起搬的，不妨碍换位', () => {
    // 判据是「有行声明了 parentId」，不是「有行可展开」——后者把详情行也算了进去
    const h = mount({ rows: [{ id: 'a', expandable: true }, { id: 'b' }], defaultExpanded: ['a'] })
    expect(h.api().rowReorderDisabledReason).toBeNull()
    press(h, 'a', 20)
    expect(h.state()).toBe('rowDragging')
  })

  it('树形行：换父两个下标说不出来，那是 tree 承担的语义', () => {
    const h = mount({ rows: [{ id: 'a' }, { id: 'b', parentId: 'a' }] })
    expect(h.api().rowReorderDisabledReason).toBe('hierarchical')
    press(h, 'a', 20)
    expect(h.state()).toBe('idle')
  })

  it('宿主只渲了一段：量到的行数与数据行数对不上，按下即退出并记下原因', () => {
    const h = mount()
    // 摘掉两行模拟窗口渲染
    h.row('c')?.remove()
    h.row('d')?.remove()
    press(h, 'a', 20)
    expect(h.state()).toBe('idle')
    expect(h.api().rowReorderDisabledReason).toBe('virtualized')
  })

  it('没声明 rowReorderable 时一条都不报，也拖不动', () => {
    const h = mount({ rowReorderable: false, defaultSort: [{ id: 'name', direction: 'asc' }] })
    expect(h.api().rowReorderDisabledReason).toBeNull()
    press(h, 'a', 20)
    expect(h.state()).toBe('idle')
  })
})

describe('行拖拽 · 键盘命令', () => {
  it('按 Alt + 上下键挪一格，一按就是一次完整提交', () => {
    const onRowMove = vi.fn()
    const h = mount({ onRowMove })
    h.service.send({ type: 'ROW.FOCUS', value: 'a' })
    const { prevented } = bodyKey(h, 'ArrowDown', { altKey: true })
    expect(prevented).toBe(true)
    expect(onRowMove).toHaveBeenCalledWith({ id: 'a', from: 0, to: 1, ids: ['b', 'a', 'c', 'd'] })
    expect(h.state()).toBe('idle')
  })

  it('到首末就停住：挡住默认行为但不发事件', () => {
    const onRowMove = vi.fn()
    const h = mount({ onRowMove })
    h.service.send({ type: 'ROW.FOCUS', value: 'a' })
    const { prevented } = bodyKey(h, 'ArrowUp', { altKey: true })
    expect(prevented).toBe(true)
    expect(onRowMove).not.toHaveBeenCalled()
  })

  it('降级时 Alt 方向键照样挡住默认行为，但不改行序', () => {
    const onRowMove = vi.fn()
    const h = mount({ onRowMove, defaultSort: [{ id: 'name', direction: 'asc' }] })
    h.service.send({ type: 'ROW.FOCUS', value: 'a' })
    bodyKey(h, 'ArrowDown', { altKey: true })
    expect(onRowMove).not.toHaveBeenCalled()
  })

  it('裸方向键仍是导航，没被换位抢走', () => {
    const onRowMove = vi.fn()
    const h = mount({ onRowMove })
    h.service.send({ type: 'ROW.FOCUS', value: 'a' })
    bodyKey(h, 'ArrowDown')
    expect(onRowMove).not.toHaveBeenCalled()
  })

  it('带 Ctrl + Alt 之类的组合不归它管', () => {
    const onRowMove = vi.fn()
    const h = mount({ onRowMove })
    h.service.send({ type: 'ROW.FOCUS', value: 'a' })
    const { prevented } = bodyKey(h, 'ArrowDown', { altKey: true, ctrlKey: true })
    expect(prevented).toBe(false)
    expect(onRowMove).not.toHaveBeenCalled()
  })

  it('焦点锚点跟着搬走的那一行，连着挪几格不会挪一次就丢起点', () => {
    const onRowMove = vi.fn()
    const h = mount({ onRowMove })
    h.service.send({ type: 'ROW.FOCUS', value: 'a' })
    bodyKey(h, 'ArrowDown', { altKey: true })
    expect(h.service.context.get('focusedRow')).toBe('a')
  })
})

describe('行拖拽 · 播报', () => {
  it('挪完说的是可见数据行里的新位置', () => {
    const h = mount()
    h.service.send({ type: 'ROW.FOCUS', value: 'a' })
    bodyKey(h, 'ArrowDown', { altKey: true })
    expect(h.said()).toBe('Moved a to position 2 of 4.')
  })

  it('松手落定说 dropped', () => {
    const h = mount()
    press(h, 'a', 20)
    move(150)
    release()
    expect(h.said()).toBe('a dropped at position 4.')
  })

  it('松手时没有合法落点，读屏里也得有人说一句', () => {
    const h = mount()
    press(h, 'a', 20)
    move(30)
    // 拖到所有行之外
    move(9999)
    release()
    expect(h.said()).toContain('cannot be dropped')
  })
})

describe('行拖动把手 · 触屏那一路唯一的入口', () => {
  /** 在把手上按下。把手的宿主行要在 DOM 里，连接层要从它往上找表体。 */
  function pressHandle(h: Harness, id: string, clientY: number, init: Partial<PointerEvent> = {}): void {
    const props = h.api().getRowDragTriggerProps({ value: id }) as Dict
    ;(props.onPointerDown as (e: PointerEvent) => void)({
      button: 0,
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 0,
      clientY,
      currentTarget: h.row(id),
      target: h.row(id),
      preventDefault: () => {},
      ...init,
    } as unknown as PointerEvent)
  }

  it('按下即拖，不等激活距离——把手是专门的拖动入口，意图无歧义', () => {
    const h = mount()
    pressHandle(h, 'a', 20)
    expect(h.dragging()).toBe('a')
  })

  it('触屏在把手上拖得动；整行起手那一路仍然不认触屏', () => {
    const viaHandle = mount()
    pressHandle(viaHandle, 'a', 20, { pointerType: 'touch' })
    expect(viaHandle.dragging()).toBe('a')

    const viaRow = mount()
    press(viaRow, 'a', 20, { pointerType: 'touch' })
    move(140)
    expect(viaRow.dragging()).toBeNull()
  })

  it('手势整个归拖动：把手自带 touch-action none', () => {
    const props = mount().api().getRowDragTriggerProps({ value: 'a' }) as Dict
    expect((props.style as Dict).touchAction).toBe('none')
  })

  it('不占 Tab 位、对读屏隐藏——键盘那一路由表体的 Alt + 上下键承担', () => {
    const props = mount().api().getRowDragTriggerProps({ value: 'a' }) as Dict
    expect(props.tabindex).toBe(-1)
    expect(props['aria-hidden']).toBe(true)
  })

  it('拖不动时把手报禁用，也不再让出滚动', () => {
    const h = mount({ defaultSort: [{ id: 'name', direction: 'asc' }] })
    const props = h.api().getRowDragTriggerProps({ value: 'a' }) as Dict
    expect(props['data-disabled']).toBe('')
    expect((props.style as Dict).touchAction).toBeUndefined()
    pressHandle(h, 'a', 20)
    expect(h.dragging()).toBeNull()
  })

  it('从把手起手，落点与松手落定跟整行起手是同一套', () => {
    const onRowMove = vi.fn()
    const h = mount({ onRowMove })
    pressHandle(h, 'a', 20)
    // 四行各 40px：d 占 120-160，落在后半才是 after
    move(150)
    release()
    expect(onRowMove).toHaveBeenCalledWith({ id: 'a', from: 0, to: 3, ids: ['b', 'c', 'd', 'a'] })
  })
})

describe('禁用的行不是拖动源', () => {
  it('整行起手拖不动', () => {
    const h = mount({ rows: [{ id: 'a', disabled: true }, { id: 'b' }, { id: 'c' }, { id: 'd' }] })
    press(h, 'a', 20)
    move(150)
    expect(h.dragging()).toBeNull()
  })

  it('alt + 上下键也搬不动', () => {
    const onRowMove = vi.fn()
    const h = mount({
      rows: [{ id: 'a', disabled: true }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
      onRowMove,
    })
    h.service.send({ type: 'ROW.FOCUS', value: 'a' })
    const body = h.api().getBodyProps() as Dict
    ;(body.onKeyDown as (e: KeyboardEvent) => void)({
      key: 'ArrowDown',
      altKey: true,
      preventDefault: () => {},
      currentTarget: document.createElement('div'),
    } as unknown as KeyboardEvent)
    expect(onRowMove).not.toHaveBeenCalled()
  })

  it('不自报可拖，皮肤才不会给它一只抓手', () => {
    const h = mount({ rows: [{ id: 'a', disabled: true }, { id: 'b' }, { id: 'c' }, { id: 'd' }] })
    expect((h.api().getRowProps({ value: 'a' }) as Dict)['data-row-draggable']).toBeUndefined()
    expect((h.api().getRowProps({ value: 'b' }) as Dict)['data-row-draggable']).toBe('')
  })

  it('别人仍可以落在它前后——禁用的是拖动源，不是落点', () => {
    const onRowMove = vi.fn()
    const h = mount({
      rows: [{ id: 'a' }, { id: 'b', disabled: true }, { id: 'c' }, { id: 'd' }],
      onRowMove,
    })
    press(h, 'a', 20)
    move(70)
    release()
    expect(onRowMove).toHaveBeenCalledWith({ id: 'a', from: 0, to: 1, ids: ['b', 'a', 'c', 'd'] })
  })
})

describe('行拖不动的判定要能恢复，也别把别人的行算进来', () => {
  /** 只渲前 rendered 行的表体，模拟窗口化渲染。 */
  function windowed(total: number, rendered: number) {
    const rows = Array.from({ length: total }, (_, i) => ({ id: `r${i}` }))
    const props: Partial<Props> = { rows, columns: COLUMNS, rowReorderable: true }
    const runtime = createVanillaRuntime()
    const service = createService(tableMachine, { props: () => props, runtime })
    runtime.start()

    const root = document.createElement('div')
    root.setAttribute('data-scope', 'table')
    root.setAttribute('data-part', 'root')
    const body = document.createElement('div')
    body.setAttribute('data-scope', 'table')
    body.setAttribute('data-part', 'body')
    root.append(body)

    const addRow = (id: string, index: number): HTMLElement => {
      const el = document.createElement('div')
      el.setAttribute('data-scope', 'table')
      el.setAttribute('data-part', 'row')
      el.setAttribute('data-value', id)
      const top = index * 40
      el.getBoundingClientRect = (): DOMRect =>
        ({ x: 0, y: top, width: 200, height: 40, top, left: 0, right: 200, bottom: top + 40, toJSON: () => ({}) }) as DOMRect
      body.append(el)
      return el
    }
    const els = new Map<string, HTMLElement>()
    rows.slice(0, rendered).forEach((r, i) => els.set(r.id, addRow(r.id, i)))
    document.body.append(root)

    return {
      service,
      api: () => connectTable(service, normalizeProps),
      press: (id: string) => {
        const p = connectTable(service, normalizeProps).getRowProps({ value: id }) as Dict
        ;(p.onPointerDown as (e: PointerEvent) => void)({
          button: 0,
          pointerId: 1,
          pointerType: 'mouse',
          clientY: 10,
          currentTarget: els.get(id),
          target: els.get(id),
          preventDefault: () => {},
        } as unknown as PointerEvent)
      },
      renderRest: () => rows.slice(rendered).forEach((r, i) => els.set(r.id, addRow(r.id, rendered + i))),
    }
  }

  it('按下时才发现只渲了一段，把原因记下来', () => {
    const h = windowed(3, 2)
    h.press('r0')
    expect(h.api().rowReorderDisabledReason).toBe('virtualized')
    expect(h.service.state.get()).toBe('idle')
  })

  it('整份渲出来之后再按就恢复——判定不能是一记就锁死', () => {
    const h = windowed(3, 2)
    h.press('r0')
    h.renderRest()
    h.press('r0')
    expect(h.api().rowReorderDisabledReason).toBeNull()
    expect(h.service.state.get()).toBe('rowDragging')
  })

  it('详情行里嵌一张完整的表，外层照样拖得动', () => {
    const rows = [{ id: 'a', expandable: true }, { id: 'b' }]
    const props: Partial<Props> = {
      rows,
      columns: COLUMNS,
      rowReorderable: true,
      defaultExpanded: ['a'],
    }
    const runtime = createVanillaRuntime()
    const service = createService(tableMachine, { props: () => props, runtime })
    runtime.start()

    const mk = (part: string, value: string | null, top: number, into: HTMLElement): HTMLElement => {
      const el = document.createElement('div')
      el.setAttribute('data-scope', 'table')
      el.setAttribute('data-part', part)
      if (value)
        el.setAttribute('data-value', value)
      el.getBoundingClientRect = (): DOMRect =>
        ({ x: 0, y: top, width: 200, height: 40, top, left: 0, right: 200, bottom: top + 40, toJSON: () => ({}) }) as DOMRect
      into.append(el)
      return el
    }
    const root = document.createElement('div')
    root.setAttribute('data-scope', 'table')
    root.setAttribute('data-part', 'root')
    const body = mk('body', null, 0, root)
    const rowA = mk('row', 'a', 0, body)
    const detail = mk('expanded-row', 'a', 40, body)
    // 详情里放一张完整的内层表：它的行不该被外层量进去
    const innerBody = mk('body', null, 40, detail)
    mk('row', 'x', 40, innerBody)
    mk('row', 'y', 80, innerBody)
    mk('row', 'b', 120, body)
    document.body.append(root)

    const p = connectTable(service, normalizeProps).getRowProps({ value: 'a' }) as Dict
    ;(p.onPointerDown as (e: PointerEvent) => void)({
      button: 0,
      pointerId: 1,
      pointerType: 'mouse',
      clientY: 10,
      currentTarget: rowA,
      target: rowA,
      preventDefault: () => {},
    } as unknown as PointerEvent)
    expect(service.state.get()).toBe('rowDragging')
  })
})
