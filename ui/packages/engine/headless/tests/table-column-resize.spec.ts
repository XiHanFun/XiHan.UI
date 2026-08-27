// @vitest-environment jsdom
import type { TableColumnDef, TableSchema } from '../src/table'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { connectTable, TABLE_COLUMN_LARGE_STEP, TABLE_COLUMN_MIN_WIDTH, TABLE_COLUMN_STEP, tableMachine } from '../src/table'

type Props = TableSchema['props']
type Dict = Record<string, unknown>

const COLUMNS: TableColumnDef[] = [
  { id: 'name', label: '名称', width: 200, resizable: true },
  { id: 'size', label: '大小', width: 120, resizable: true, minWidth: 80, maxWidth: 300 },
  { id: 'fixed', label: '不可改', width: 100 },
]

const ROWS = [{ id: 'a' }, { id: 'b' }]

/**
 * 最小标记：表头一行，每列一个表头格 + 一个改宽把手。
 * jsdom 不排版，把手要量的那份列宽打在表头格上。
 */
function mount(initial: Partial<Props> = {}) {
  const props: Partial<Props> = { columns: COLUMNS, rows: ROWS, ...initial }
  const runtime = createVanillaRuntime()
  const service = createService(tableMachine, { props: () => props, runtime })
  runtime.start()

  const headers = new Map<string, HTMLElement>()
  const triggers = new Map<string, HTMLElement>()
  const root = document.createElement('div')
  root.setAttribute('data-scope', 'table')
  root.setAttribute('data-part', 'root')

  for (const column of props.columns ?? []) {
    const header = document.createElement('div')
    header.setAttribute('data-scope', 'table')
    header.setAttribute('data-part', 'column-header')
    header.setAttribute('data-value', column.id)
    const width = typeof column.width === 'number' ? column.width : 0
    header.getBoundingClientRect = (): DOMRect =>
      ({ x: 0, y: 0, width, height: 32, top: 0, left: 0, right: width, bottom: 32, toJSON: () => ({}) }) as DOMRect

    const trigger = document.createElement('span')
    trigger.setAttribute('data-scope', 'table')
    trigger.setAttribute('data-part', 'column-resize-trigger')
    header.append(trigger)
    root.append(header)
    headers.set(column.id, header)
    triggers.set(column.id, trigger)
  }
  document.body.append(root)

  return {
    service,
    api: () => connectTable(service, normalizeProps),
    trigger: (id: string) => triggers.get(id)!,
    state: () => service.state.get(),
    widths: () => service.context.get('columnPreference').widths ?? {},
    setProps: (next: Partial<Props>) => Object.assign(props, next),
  }
}

type Harness = ReturnType<typeof mount>

/** 在把手上按下。连接层要从它往上找表头格来量宽度，因此得挂在真实节点上。 */
function press(h: Harness, id: string, clientX: number): void {
  const props = h.api().getColumnResizeTriggerProps({ value: id }) as Dict
  ;(props.onPointerDown as (e: PointerEvent) => void)({
    button: 0,
    clientX,
    currentTarget: h.trigger(id),
    preventDefault: () => {},
  } as unknown as PointerEvent)
}

function move(clientX: number): void {
  document.dispatchEvent(new PointerEvent('pointermove', { clientX, bubbles: true }))
}

function release(): void {
  document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
}

function key(h: Harness, id: string, k: string, shiftKey = false): void {
  const props = h.api().getColumnResizeTriggerProps({ value: id }) as Dict
  ;(props.onKeyDown as (e: KeyboardEvent) => void)({ key: k, shiftKey, preventDefault: () => {} } as KeyboardEvent)
}

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('列宽 · 指针拖拽', () => {
  it('按下进拖动态，松手回 idle', () => {
    const h = mount()
    press(h, 'name', 500)
    expect(h.state()).toBe('resizing')
    release()
    expect(h.state()).toBe('idle')
  })

  it('跟手改宽：按下那一刻量到的宽度加上位移', () => {
    const h = mount()
    press(h, 'name', 500)
    move(560)
    expect(h.widths().name).toBe(260)
  })

  it('往回拖是收窄', () => {
    const h = mount()
    press(h, 'name', 500)
    move(430)
    expect(h.widths().name).toBe(130)
  })

  it('基准是按下那一刻，不是上一帧——连续移动不会累加出错', () => {
    const h = mount()
    press(h, 'name', 500)
    move(560)
    move(520)
    expect(h.widths().name).toBe(220)
  })

  it('压不过下限', () => {
    const h = mount()
    press(h, 'size', 500)
    move(-9999)
    expect(h.widths().size).toBe(80)
  })

  it('长不过上限', () => {
    const h = mount()
    press(h, 'size', 500)
    move(9999)
    expect(h.widths().size).toBe(300)
  })

  it('没写下限的列用缺省下限', () => {
    const h = mount()
    press(h, 'name', 500)
    move(-9999)
    expect(h.widths().name).toBe(TABLE_COLUMN_MIN_WIDTH)
  })

  it('rtl 下往左拖才是加宽', () => {
    const h = mount({ dir: 'rtl' })
    press(h, 'name', 500)
    move(440)
    expect(h.widths().name).toBe(260)
  })

  it('系统收走指针按取消算：宽度退回按下那一刻', () => {
    const h = mount()
    press(h, 'name', 500)
    move(560)
    expect(h.widths().name).toBe(260)
    document.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true }))
    expect(h.widths().name).toBe(200)
    expect(h.state()).toBe('idle')
  })

  it('不可改宽的列按下没反应', () => {
    const h = mount()
    press(h, 'fixed', 500)
    expect(h.state()).toBe('idle')
  })

  it('右键不开拖', () => {
    const h = mount()
    const props = h.api().getColumnResizeTriggerProps({ value: 'name' }) as Dict
    ;(props.onPointerDown as (e: PointerEvent) => void)({
      button: 2,
      clientX: 500,
      currentTarget: h.trigger('name'),
      preventDefault: () => {},
    } as unknown as PointerEvent)
    expect(h.state()).toBe('idle')
  })

  it('改宽走的是列偏好，会经 onColumnPreferenceChange 报出去', () => {
    const onColumnPreferenceChange = vi.fn()
    const h = mount({ onColumnPreferenceChange })
    press(h, 'name', 500)
    move(560)
    expect(onColumnPreferenceChange).toHaveBeenCalled()
    const last = onColumnPreferenceChange.mock.calls.at(-1)![0]
    expect(last.value.widths.name).toBe(260)
  })
})

describe('列宽 · 键盘', () => {
  it('方向键一次一步，往行尾侧推是加宽', () => {
    const h = mount()
    key(h, 'name', 'ArrowRight')
    expect(h.widths().name).toBe(200 + TABLE_COLUMN_STEP)
    key(h, 'name', 'ArrowLeft')
    expect(h.widths().name).toBe(200)
  })

  it('按住 Shift 加方向键走大步', () => {
    const h = mount()
    key(h, 'name', 'ArrowRight', true)
    expect(h.widths().name).toBe(200 + TABLE_COLUMN_LARGE_STEP)
  })

  it('rtl 下左右两键对调，语义仍是「加宽 / 收窄」', () => {
    const h = mount({ dir: 'rtl' })
    key(h, 'name', 'ArrowLeft')
    expect(h.widths().name).toBe(200 + TABLE_COLUMN_STEP)
  })

  it('键盘改宽同样吃上下限', () => {
    const h = mount()
    for (let i = 0; i < 40; i++) key(h, 'size', 'ArrowLeft', true)
    expect(h.widths().size).toBe(80)
  })

  it('键盘改宽不进拖动态：按一下改一步，没有「进行中」这回事', () => {
    const h = mount()
    key(h, 'name', 'ArrowRight')
    expect(h.state()).toBe('idle')
  })

  it('不可改宽的列不认方向键', () => {
    const h = mount()
    key(h, 'fixed', 'ArrowRight')
    expect(h.widths().fixed).toBeUndefined()
  })

  it('列宽写成字符串时算不出 px，键盘不动它', () => {
    const h = mount({ columns: [{ id: 'pct', label: '百分比', width: '40%', resizable: true }] })
    key(h, 'pct', 'ArrowRight')
    expect(h.widths().pct).toBeUndefined()
  })
})

describe('列宽 · 产出的属性', () => {
  it('把手是竖直分隔条，可聚焦', () => {
    const h = mount()
    const props = h.api().getColumnResizeTriggerProps({ value: 'name' }) as Dict
    expect(props.role).toBe('separator')
    expect(props['aria-orientation']).toBe('vertical')
    expect(props.tabindex).toBe(0)
    expect(props['aria-disabled']).toBe('false')
    expect((props.style as Dict).touchAction).toBe('none')
  })

  it('可及名字带上列名', () => {
    const h = mount()
    const props = h.api().getColumnResizeTriggerProps({ value: 'name' }) as Dict
    expect(String(props['aria-label'])).toContain('名称')
  })

  it('文案可覆盖', () => {
    const h = mount({ translations: { columnResize: label => `调整${label}列宽` } })
    const props = h.api().getColumnResizeTriggerProps({ value: 'name' }) as Dict
    expect(props['aria-label']).toBe('调整名称列宽')
  })

  it('不可改宽的列退出 Tab 序列并报 aria-disabled', () => {
    const h = mount()
    const props = h.api().getColumnResizeTriggerProps({ value: 'fixed' }) as Dict
    expect(props.tabindex).toBe(-1)
    expect(props['aria-disabled']).toBe('true')
    expect(props['data-disabled']).toBe('')
  })

  it('拖动中的那一列报 data-resizing，别的列不报', () => {
    const h = mount()
    press(h, 'name', 500)
    expect((h.api().getColumnResizeTriggerProps({ value: 'name' }) as Dict)['data-resizing']).toBe('')
    expect((h.api().getColumnResizeTriggerProps({ value: 'size' }) as Dict)['data-resizing']).toBeUndefined()
    release()
  })
})

describe('列宽 · 可聚焦的分隔条要报数值', () => {
  it('报出当前列宽与下限', () => {
    const h = mount()
    const props = h.api().getColumnResizeTriggerProps({ value: 'name' }) as Dict
    expect(props['aria-valuenow']).toBe(200)
    expect(props['aria-valuemin']).toBe(TABLE_COLUMN_MIN_WIDTH)
  })

  it('列自己写了上下限就报它自己的', () => {
    const h = mount()
    const props = h.api().getColumnResizeTriggerProps({ value: 'size' }) as Dict
    expect(props['aria-valuemin']).toBe(80)
    expect(props['aria-valuemax']).toBe(300)
  })

  it('拖过之后报的是新宽度', () => {
    const h = mount()
    press(h, 'name', 500)
    move(560)
    expect((h.api().getColumnResizeTriggerProps({ value: 'name' }) as Dict)['aria-valuenow']).toBe(260)
    release()
  })

  it('算不出 px 宽度的列不认可改宽——给不出数值就不该声称自己是可调控件', () => {
    const h = mount({ columns: [{ id: 'pct', label: '百分比', width: '40%', resizable: true }] })
    const props = h.api().getColumnResizeTriggerProps({ value: 'pct' }) as Dict
    expect(props['aria-disabled']).toBe('true')
    expect(props.tabindex).toBe(-1)
    expect(props['aria-valuenow']).toBeUndefined()
  })

  it('不可改宽的列不报上下限', () => {
    const h = mount()
    const props = h.api().getColumnResizeTriggerProps({ value: 'fixed' }) as Dict
    expect(props['aria-valuemin']).toBeUndefined()
    expect(props['aria-valuemax']).toBeUndefined()
  })
})
