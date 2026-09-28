// 分页的整组禁用与首页 / 末页钮：禁用压过一切（翻页钮、页码、省略位、跳页、每页条数都不可操作，已摊开的省略位收起），
// 首页 / 末页钮一步跳到头，到头那一侧原生 disabled。
import type { Service } from '@xihan-ui/core'
import type { PaginationSchema } from '../src/pagination/pagination.types'
import type { SelectSchema } from '../src/select'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { connectPagination, paginationAnatomy, paginationMachine, paginationPageSizeSelectProps } from '../src/pagination'
import { connectSelect, selectMachine } from '../src/select'

type Props = PaginationSchema['props']
type Dict = Record<string, unknown>

function make(initial: Props) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const root = createService(paginationMachine, { props: () => props.get(), runtime })
  const pageSizeSelect: Service<SelectSchema> = createService(selectMachine, {
    props: () => paginationPageSizeSelectProps(root),
    runtime,
  })
  runtime.start()
  return {
    root,
    api: () => connectPagination({ root, pageSizeSelect }, normalizeProps),
    select: () => connectSelect(pageSizeSelect, normalizeProps),
    setProps: (next: Partial<Props>) => props.set(prev => ({ ...prev, ...next })),
  }
}

function click(props: Dict): void {
  (props.onClick as () => void)()
}

describe('分页 · 首页 / 末页钮', () => {
  it('解剖里排在上一页之前、下一页之后', () => {
    const parts = paginationAnatomy.parts as readonly string[]
    expect(parts.indexOf('first-trigger')).toBe(parts.indexOf('prev-trigger') - 1)
    expect(parts.indexOf('last-trigger')).toBe(parts.indexOf('next-trigger') + 1)
  })

  it('一步跳到头，到头那一侧原生 disabled；接 Action Control text 档 ghost 面', () => {
    const onPageChange = vi.fn()
    const t = make({ count: 100, defaultPage: 5, onPageChange })
    const first = t.api().getFirstTriggerProps() as Dict
    expect(first.type).toBe('button')
    expect(first['aria-label']).toBe('First page')
    expect(first['data-xh-action-profile']).toBe('text')
    expect(first['data-xh-action-variant']).toBe('ghost')
    click(first)
    expect(t.api().page).toBe(1)
    expect((t.api().getFirstTriggerProps() as Dict).disabled).toBe(true)

    const last = t.api().getLastTriggerProps() as Dict
    expect(last['aria-label']).toBe('Last page')
    click(last)
    expect(t.api().page).toBe(10)
    expect((t.api().getLastTriggerProps() as Dict).disabled).toBe(true)
    expect((t.api().getLastTriggerProps() as Dict)['data-disabled']).toBe('')
    expect(onPageChange.mock.calls.map(([d]) => d.page)).toEqual([1, 10])
  })

  it('translations 覆盖两枚钮的可及名；无数据时两枚都禁用', () => {
    const t = make({ count: 0, translations: { firstTrigger: '首页', lastTrigger: '末页' } })
    expect((t.api().getFirstTriggerProps() as Dict)['aria-label']).toBe('首页')
    expect((t.api().getLastTriggerProps() as Dict)['aria-label']).toBe('末页')
    expect((t.api().getFirstTriggerProps() as Dict).disabled).toBe(true)
    expect((t.api().getLastTriggerProps() as Dict).disabled).toBe(true)
  })
})

describe('分页 · 整组禁用', () => {
  it('每一类按钮都是原生 disabled；跳页输入框与每页条数下拉一并禁用；根上投影 data-disabled', () => {
    const t = make({ count: 100, defaultPage: 5, disabled: true })
    const api = t.api()
    expect(api.disabled).toBe(true)
    expect((api.getRootProps() as Dict)['data-disabled']).toBe('')
    for (const props of [api.getFirstTriggerProps(), api.getPrevTriggerProps(), api.getNextTriggerProps(), api.getLastTriggerProps(), api.getItemProps({ page: 3 }), api.getEllipsisTriggerProps({ side: 'end' })]) {
      expect((props as Dict).disabled).toBe(true)
      expect((props as Dict)['data-disabled']).toBe('')
    }
    expect((api.getJumperProps() as Dict).disabled).toBe(true)
    expect((t.select().getTriggerProps() as Dict).disabled).toBe(true)
  })

  it('当前页照常标出；上一页 / 下一页页码照常报出', () => {
    const api = make({ count: 100, defaultPage: 5, disabled: true }).api()
    expect((api.getItemProps({ page: 5 }) as Dict)['aria-current']).toBe('page')
    expect(api.previousPage).toBe(4)
    expect(api.nextPage).toBe(6)
  })

  it('点页码不翻页；省略位不摊开；按压不进', () => {
    const t = make({ count: 100, defaultPage: 5, disabled: true })
    click(t.api().getItemProps({ page: 3 }) as Dict)
    expect(t.api().page).toBe(5)
    click(t.api().getEllipsisTriggerProps({ side: 'end' }) as Dict)
    expect(t.api().openEllipsis).toBeNull()
    t.root.send({ type: 'PRESS.START', key: 'item:3' })
    expect(t.root.context.get('pressed') ?? null).toBeNull()
  })

  it('摊开途中转为禁用：省略位收起，按住的那一格松开', () => {
    const t = make({ count: 100, defaultPage: 5 })
    click(t.api().getEllipsisTriggerProps({ side: 'end' }) as Dict)
    expect(t.api().openEllipsis).toBe('end')
    t.root.send({ type: 'PRESS.START', key: 'item:8' })
    expect(t.root.context.get('pressed')).toBe('item:8')
    t.setProps({ disabled: true })
    expect(t.api().openEllipsis).toBeNull()
    expect(t.root.context.get('pressed') ?? null).toBeNull()
  })

  it('命令式 setPage 不受整组禁用约束', () => {
    const t = make({ count: 100, disabled: true })
    t.api().setPage(4)
    expect(t.api().page).toBe(4)
  })
})
