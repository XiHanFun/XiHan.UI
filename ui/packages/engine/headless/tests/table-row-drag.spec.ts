// @vitest-environment jsdom
// 行拖拽：纯算法（行组并块、降级判定、命令）与机器/连接层（激活阈值、长按、播报）。
import type { TableRowDef, TableSchema } from '../src/table'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flatMoveCommand, flatMoveIntentFromKey, reorderFlat } from '../src/shared/drag'
import {
  connectTable,
  flattenTableRows,
  isSelfOrDescendantRow,
  reorderTableRows,
  rowGroupRects,
  rowReorderReason,
  tableMachine,
  tableRowMoveCommand,
  tableRowMoveOf,
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
    expect(rowReorderReason(0, 3, 3)).toBeNull()
  })

  it('排序链非空：拖出来的新序下一帧就被排序键覆盖', () => {
    expect(rowReorderReason(1, 3, 3)).toBe('sorted')
  })

  it('量到的行数与数据行数对不上 = 宿主只渲了一段，窗口外的行没有矩形', () => {
    expect(rowReorderReason(0, 10, 500)).toBe('virtualized')
  })

  it('排序优先于虚拟——先报最上游那条', () => {
    expect(rowReorderReason(1, 10, 500)).toBe('sorted')
  })

  it('渲染期量不到行数，两者都不给时不判虚拟', () => {
    expect(rowReorderReason(0)).toBeNull()
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
    // 连接层给每一行都发 tabindex（锚点 0、其余 -1）；jsdom 里没有它 focus() 落不上去
    el.setAttribute('tabindex', '-1')
    box(el, top, 40)
    top += 40
    body.append(el)
    rowEls.set(row.id, el)
    // 展开着的行后面跟一条详情行，落点判定要把两者算作一整块。
    // 有子行的行展开出的是子行、不是详情行——与 flattenTableRows 同一口径
    const hasKids = (props.rows ?? []).some(r => r.parentId === row.id)
    if (!hasKids && (props.defaultExpandedValue ?? []).includes(row.id)) {
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
    expect(onRowMove).toHaveBeenCalledWith({ id: 'a', parent: null, index: 3, ids: ['b', 'c', 'd', 'a'] })
    expect(h.state()).toBe('idle')
  })

  it('落在自己身上不算落点，指示线消失', () => {
    const h = mount()
    press(h, 'b', 50)
    move(60)
    expect(h.api().dropTarget).toBeNull()
  })

  it('展开着的行按整块算：详情行不自成一个落点', () => {
    const h = mount({ defaultExpandedValue: ['b'] })
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
    const h = mount({ defaultExpandedValue: ['a'] })
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
    expect((h.api().getRowProps({ value: 'a' }) as Dict)['data-draggable']).toBeUndefined()
  })

  it('有可展开的行不算树形：详情行是跟着数据行一起搬的，不妨碍换位', () => {
    // 判据是「有行声明了 parentId」，不是「有行可展开」——后者把详情行也算了进去
    const h = mount({ rows: [{ id: 'a', expandable: true }, { id: 'b' }], defaultExpandedValue: ['a'] })
    expect(h.api().rowReorderDisabledReason).toBeNull()
    press(h, 'a', 20)
    expect(h.state()).toBe('rowDragging')
  })

  it('树形行照样拖得动——换父由 parent 与 index 说清，不再整个关停', () => {
    // 展开着 a，b 才是可见行；夹具按 rows 渲，不展开就与可见行数对不上
    const h = mount({
      rows: [{ id: 'a', expandable: true }, { id: 'b', parentId: 'a' }],
      defaultExpandedValue: ['a'],
    })
    expect(h.api().rowReorderDisabledReason).toBeNull()
    press(h, 'a', 20)
    move(60)
    expect(h.state()).toBe('rowDragging')
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
    expect(onRowMove).toHaveBeenCalledWith({ id: 'a', parent: null, index: 1, ids: ['b', 'a', 'c', 'd'] })
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
    expect(onRowMove).toHaveBeenCalledWith({ id: 'a', parent: null, index: 3, ids: ['b', 'c', 'd', 'a'] })
  })
})

describe('按 Alt + 方向键归谁管', () => {
  it('没打开换位时 Alt + 方向键放行给页面——四处拖拽同一个写法', () => {
    const h = mount({ rowReorderable: false })
    h.service.send({ type: 'ROW.FOCUS', value: 'a' })
    let prevented = false
    const body = h.api().getBodyProps() as Dict
    ;(body.onKeyDown as (e: KeyboardEvent) => void)({
      key: 'ArrowDown',
      altKey: true,
      preventDefault: () => { prevented = true },
      currentTarget: document.createElement('div'),
    } as unknown as KeyboardEvent)
    expect(prevented).toBe(false)
  })

  it('打开了但这张表此刻搬不动时照样挡住：键是认下了的', () => {
    const onRowMove = vi.fn()
    const h = mount({ defaultSort: [{ id: 'name', direction: 'asc' }], onRowMove })
    h.service.send({ type: 'ROW.FOCUS', value: 'a' })
    let prevented = false
    const body = h.api().getBodyProps() as Dict
    ;(body.onKeyDown as (e: KeyboardEvent) => void)({
      key: 'ArrowDown',
      altKey: true,
      preventDefault: () => { prevented = true },
      currentTarget: document.createElement('div'),
    } as unknown as KeyboardEvent)
    expect(prevented).toBe(true)
    expect(onRowMove).not.toHaveBeenCalled()
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
    expect((h.api().getRowProps({ value: 'a' }) as Dict)['data-draggable']).toBeUndefined()
    expect((h.api().getRowProps({ value: 'b' }) as Dict)['data-draggable']).toBe('')
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
    expect(onRowMove).toHaveBeenCalledWith({ id: 'a', parent: null, index: 1, ids: ['b', 'a', 'c', 'd'] })
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
      defaultExpandedValue: ['a'],
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

describe('拖动中版面滚走了，落点仍按指针所指算', () => {
  /** 把全部行的矩形桩整体挪 delta（正数 = 内容往上滚走）。 */
  function scrollBy(h: Harness, delta: number): void {
    for (const id of ['a', 'b', 'c', 'd']) {
      const el = h.row(id)
      if (!el)
        continue
      const before = el.getBoundingClientRect()
      const top = before.top - delta
      el.getBoundingClientRect = (): DOMRect =>
        ({ x: 0, y: top, width: 200, height: 40, top, left: 0, right: 200, bottom: top + 40, toJSON: () => ({}) }) as DOMRect
    }
  }

  it('滚过之后指针停在哪一行，落点就是哪一行', () => {
    const h = mount()
    press(h, 'a', 20)
    move(60)
    expect(h.api().dropTarget?.targetValue).toBe('b')

    // 内容往上滚 40：原来 c 占 80-120，现在占 40-80。指针不动停在 60，
    // 此刻指着的是 c。不补偿漂移的话仍会算成 b
    scrollBy(h, 40)
    move(60)
    expect(h.api().dropTarget?.targetValue).toBe('c')
  })

  it('激活距离也吃同一份补偿：光滚动不算走了距离', () => {
    const h = mount()
    press(h, 'a', 20)
    // 指针一动不动，只有内容滚走 40
    scrollBy(h, 40)
    move(20)
    expect(h.dragging()).toBeNull()
  })
})

describe('把手拖放之后焦点落在哪儿', () => {
  it('从把手起手，焦点锚点与真实焦点都交给那一行', () => {
    const h = mount()
    // 先让焦点停在第一行，再从第三行的把手起手——不接管的话锚点还在第一行，
    // 而真实焦点会停在这个 aria-hidden 的把手上
    h.service.send({ type: 'ROW.FOCUS', value: 'a' })
    const props = h.api().getRowDragTriggerProps({ value: 'c' }) as Dict
    const handle = document.createElement('span')
    handle.setAttribute('data-scope', 'table')
    handle.setAttribute('data-part', 'row-drag-trigger')
    h.row('c')?.prepend(handle)
    ;(props.onPointerDown as (e: PointerEvent) => void)({
      button: 0,
      pointerId: 1,
      pointerType: 'mouse',
      clientY: 90,
      currentTarget: handle,
      target: handle,
      preventDefault: () => {},
    } as unknown as PointerEvent)

    expect(h.service.context.get('focusedRow')).toBe('c')
    expect(document.activeElement).toBe(h.row('c'))
  })
})

// ——— 树形行：换父与同层挪位 ———

/**
 * 收件箱
 *   ├ 报价单
 *   └ 项目
 *      └ 周报
 * 归档
 * 回收站
 */
const NESTED: TableRowDef[] = [
  { id: 'inbox', expandable: true },
  { id: 'quote', parentId: 'inbox' },
  { id: 'project', parentId: 'inbox', expandable: true },
  { id: 'weekly', parentId: 'project' },
  { id: 'archive' },
  { id: 'trash' },
]

const VISIBLE = flattenTableRows(NESTED, ['inbox', 'project'])

describe('树形行 · 自己与后代', () => {
  it('自己、孩子、孙子都算', () => {
    expect(isSelfOrDescendantRow(VISIBLE, 'inbox', 'inbox')).toBe(true)
    expect(isSelfOrDescendantRow(VISIBLE, 'inbox', 'project')).toBe(true)
    expect(isSelfOrDescendantRow(VISIBLE, 'inbox', 'weekly')).toBe(true)
  })

  it('兄弟与祖先不算', () => {
    expect(isSelfOrDescendantRow(VISIBLE, 'inbox', 'archive')).toBe(false)
    expect(isSelfOrDescendantRow(VISIBLE, 'project', 'inbox')).toBe(false)
  })

  it('大纲编号按段比，不比字符串——1.1 不是 1.10 的祖先', () => {
    const wide: TableRowDef[] = [{ id: 'p', expandable: true }]
    for (let i = 1; i <= 10; i++)
      wide.push({ id: `c${i}`, parentId: 'p' })
    const rows = flattenTableRows(wide, ['p'])
    expect(rows.find(r => r.id === 'c1')?.outline).toBe('1.1')
    expect(rows.find(r => r.id === 'c10')?.outline).toBe('1.10')
    expect(isSelfOrDescendantRow(rows, 'c1', 'c10')).toBe(false)
  })
})

describe('树形行 · 落点折算成搬家', () => {
  it('落进目标的子层末尾', () => {
    expect(tableRowMoveOf(VISIBLE, 'archive', { targetValue: 'inbox', position: 'inside' }))
      .toEqual({ id: 'archive', parent: 'inbox', index: 2 })
  })

  it('落进没有孩子的行是第 0 位', () => {
    expect(tableRowMoveOf(VISIBLE, 'archive', { targetValue: 'quote', position: 'inside' }))
      .toEqual({ id: 'archive', parent: 'quote', index: 0 })
  })

  it('before / after 落进目标所在的那一层，跟着换父', () => {
    expect(tableRowMoveOf(VISIBLE, 'archive', { targetValue: 'quote', position: 'before' }))
      .toEqual({ id: 'archive', parent: 'inbox', index: 0 })
    expect(tableRowMoveOf(VISIBLE, 'weekly', { targetValue: 'archive', position: 'after' }))
      .toEqual({ id: 'weekly', parent: null, index: 2 })
  })

  it('同层往后搬吃到先摘后插的修正', () => {
    expect(tableRowMoveOf(VISIBLE, 'inbox', { targetValue: 'archive', position: 'after' }))
      .toEqual({ id: 'inbox', parent: null, index: 1 })
  })

  it('落进自己的后代不行——那会拖出一个环', () => {
    expect(tableRowMoveOf(VISIBLE, 'inbox', { targetValue: 'weekly', position: 'inside' })).toBeNull()
    expect(tableRowMoveOf(VISIBLE, 'inbox', { targetValue: 'project', position: 'before' })).toBeNull()
  })

  it('算下来还是原位时返回 null', () => {
    expect(tableRowMoveOf(VISIBLE, 'quote', { targetValue: 'project', position: 'before' })).toBeNull()
    expect(tableRowMoveOf(VISIBLE, 'project', { targetValue: 'inbox', position: 'inside' })).toBeNull()
  })
})

describe('树形行 · 搬完之后的 rows 顺序', () => {
  it('换父：挪到新同层的正确位置上', () => {
    // archive 搬进 inbox 的子层末尾（quote、project 之后）
    expect(reorderTableRows(NESTED, { id: 'archive', parent: 'inbox', index: 2 }))
      .toEqual(['inbox', 'quote', 'project', 'weekly', 'archive', 'trash'])
  })

  it('换父到子层最前面', () => {
    expect(reorderTableRows(NESTED, { id: 'archive', parent: 'inbox', index: 0 }))
      .toEqual(['inbox', 'archive', 'quote', 'project', 'weekly', 'trash'])
  })

  it('同层挪位', () => {
    expect(reorderTableRows(NESTED, { id: 'inbox', parent: null, index: 1 }))
      .toEqual(['quote', 'project', 'weekly', 'archive', 'inbox', 'trash'])
  })

  it('搬到一个还没有孩子的行下面', () => {
    expect(reorderTableRows(NESTED, { id: 'trash', parent: 'quote', index: 0 }))
      .toEqual(['inbox', 'quote', 'trash', 'project', 'weekly', 'archive'])
  })

  it('认不出的行原样返回', () => {
    expect(reorderTableRows(NESTED, { id: 'ghost', parent: null, index: 0 }))
      .toEqual(['inbox', 'quote', 'project', 'weekly', 'archive', 'trash'])
  })
})

describe('树形行 · 键盘命令', () => {
  it('上下键在同层兄弟里挪，不跨层', () => {
    expect(tableRowMoveCommand(VISIBLE, 'quote', 'next'))
      .toEqual({ targetValue: 'project', position: 'after' })
    expect(tableRowMoveCommand(VISIBLE, 'archive', 'prev'))
      .toEqual({ targetValue: 'inbox', position: 'before' })
  })

  it('到同层首末就停住', () => {
    expect(tableRowMoveCommand(VISIBLE, 'quote', 'prev')).toBeNull()
    expect(tableRowMoveCommand(VISIBLE, 'trash', 'next')).toBeNull()
  })

  it('往外一层 = 变成父行的下一个兄弟', () => {
    expect(tableRowMoveCommand(VISIBLE, 'quote', 'outdent'))
      .toEqual({ targetValue: 'inbox', position: 'after' })
  })

  it('已经在根层就没得往外', () => {
    expect(tableRowMoveCommand(VISIBLE, 'inbox', 'outdent')).toBeNull()
  })

  it('往里一层 = 认上一个兄弟当爹', () => {
    expect(tableRowMoveCommand(VISIBLE, 'project', 'indent'))
      .toEqual({ targetValue: 'quote', position: 'inside' })
  })

  it('没有上一个兄弟就没得缩进', () => {
    expect(tableRowMoveCommand(VISIBLE, 'quote', 'indent')).toBeNull()
  })
})

describe('树形行 · 端到端换父', () => {
  /**
   * 收件箱（展开）
   *   ├ 报价单
   *   └ 周报
   * 归档
   *
   * 四条可见行各占 40px。
   */
  const NESTED_ROWS: TableRowDef[] = [
    { id: 'inbox', expandable: true },
    { id: 'quote', parentId: 'inbox' },
    { id: 'weekly', parentId: 'inbox' },
    { id: 'archive', expandable: true },
  ]

  function nested(extra: Partial<Props> = {}) {
    return mount({ rows: NESTED_ROWS, defaultExpandedValue: ['inbox'], ...extra })
  }

  it('拖到一行的中段 = 落进它里面，换父', () => {
    const onRowMove = vi.fn()
    const h = nested({ onRowMove })
    // archive 占 120-160，140 是它的中段 → 落进去
    press(h, 'quote', 50)
    move(140)
    expect(h.api().dropTarget).toEqual({ targetValue: 'archive', position: 'inside' })

    release()
    expect(onRowMove).toHaveBeenCalledWith({
      id: 'quote',
      parent: 'archive',
      index: 0,
      ids: ['inbox', 'weekly', 'archive', 'quote'],
    })
  })

  it('三档落点逐档打到行上，皮肤才画得出来', () => {
    const h = nested()
    const drop = (id: string): unknown => (h.api().getRowProps({ value: id }) as Dict)['data-drop']
    press(h, 'quote', 50)

    move(140)
    expect(drop('archive')).toBe('inside')
    move(125)
    expect(drop('archive')).toBe('before')
    move(155)
    expect(drop('archive')).toBe('after')
    // 落点同一时刻只有一个，别的行身上不该留着上一次的档
    expect(drop('inbox')).toBeUndefined()
  })

  it('拖到一行的上下两端仍是前后插，跟着换到那一层', () => {
    const onRowMove = vi.fn()
    const h = nested({ onRowMove })
    // archive 占 120-160，125 在上四分之一 → 插在它前面，即根层
    press(h, 'quote', 50)
    move(125)
    expect(h.api().dropTarget).toEqual({ targetValue: 'archive', position: 'before' })
    release()
    expect(onRowMove).toHaveBeenCalledWith({
      id: 'quote',
      parent: null,
      index: 1,
      ids: ['inbox', 'weekly', 'quote', 'archive'],
    })
  })

  it('收不下孩子的行只有前后两档，不会凭空长出子层', () => {
    const h = nested()
    // weekly 既不可展开也没有孩子；它占 80-120，100 是正中
    press(h, 'quote', 50)
    move(100)
    expect(h.api().dropTarget?.position).not.toBe('inside')
  })

  it('落进自己的后代不合法，指示线消失', () => {
    const h = nested()
    press(h, 'inbox', 10)
    move(60)
    expect(h.dragging()).toBe('inbox')
    expect(h.api().dropTarget).toBeNull()
  })

  it('按 Alt + 右键缩进：认上一个兄弟当爹', () => {
    const onRowMove = vi.fn()
    const h = nested({ onRowMove })
    h.service.send({ type: 'ROW.FOCUS', value: 'weekly' })
    const body = h.api().getBodyProps() as Dict
    ;(body.onKeyDown as (e: KeyboardEvent) => void)({
      key: 'ArrowRight',
      altKey: true,
      preventDefault: () => {},
      currentTarget: document.createElement('div'),
    } as unknown as KeyboardEvent)
    expect(onRowMove).toHaveBeenCalledWith({
      id: 'weekly',
      parent: 'quote',
      index: 0,
      ids: ['inbox', 'quote', 'weekly', 'archive'],
    })
  })

  it('按 Alt + 左键往外一层：变成父行的下一个兄弟', () => {
    const onRowMove = vi.fn()
    const h = nested({ onRowMove })
    h.service.send({ type: 'ROW.FOCUS', value: 'quote' })
    const body = h.api().getBodyProps() as Dict
    ;(body.onKeyDown as (e: KeyboardEvent) => void)({
      key: 'ArrowLeft',
      altKey: true,
      preventDefault: () => {},
      currentTarget: document.createElement('div'),
    } as unknown as KeyboardEvent)
    expect(onRowMove).toHaveBeenCalledWith({
      id: 'quote',
      parent: null,
      index: 1,
      ids: ['inbox', 'weekly', 'quote', 'archive'],
    })
  })

  it('allowRowDrop 说了不行，就不发事件、只播报一句', () => {
    const onRowMove = vi.fn()
    const h = nested({ onRowMove, allowRowDrop: move => move.parent !== 'archive' })
    press(h, 'quote', 50)
    move(140)
    release()
    expect(onRowMove).not.toHaveBeenCalled()
    expect(h.service.context.get('announcement')).toContain('cannot be dropped')
  })

  it('平表下 parent 恒为 null，index 就是可见序里的第几位', () => {
    const onRowMove = vi.fn()
    const h = mount({ onRowMove })
    press(h, 'a', 20)
    move(150)
    release()
    expect(onRowMove).toHaveBeenCalledWith({
      id: 'a',
      parent: null,
      index: 3,
      ids: ['b', 'c', 'd', 'a'],
    })
  })
})
