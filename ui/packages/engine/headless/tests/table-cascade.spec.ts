// @vitest-environment jsdom
import type { TableSchema } from '../src/table'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectTable, tableCascadeRoots, tableMachine } from '../src/table'

type Props = TableSchema['props']

// 两级树：部门 → 小组，研发下面还有一个禁用的小组
const ROWS: NonNullable<Props['rows']> = [
  { id: 'rd', expandable: true },
  { id: 'rd-web', parentId: 'rd' },
  { id: 'rd-app', parentId: 'rd' },
  { id: 'rd-lab', parentId: 'rd', disabled: true },
  { id: 'ops', expandable: true },
  { id: 'ops-sre', parentId: 'ops' },
]

function mount(initial: Partial<Props>) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Partial<Props>>({
    columns: [{ id: 'name' }],
    rows: ROWS,
    selectionMode: 'multiple',
    cascade: true,
    ...initial,
  })
  const service = createService(tableMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    api: () => connectTable(service, normalizeProps),
    selection: () => service.context.get('selection'),
    trigger: (id: string) => connectTable(service, normalizeProps).getRowSelectTriggerProps({ value: id }) as Record<string, unknown>,
  }
}

describe('tableCascadeRoots', () => {
  it('按 parentId 摊回树：指向不存在的父行按根行算', () => {
    const roots = tableCascadeRoots([{ id: 'a' }, { id: 'b', parentId: 'a' }, { id: 'c', parentId: 'ghost' }])
    expect(roots.map(node => node.value)).toEqual(['a', 'c'])
    expect(roots[0]!.children?.map(node => node.value)).toEqual(['b'])
  })
})

describe('树形表的级联勾选', () => {
  it('勾父行整枝传导，禁用的子行冻结不动；对外值缺省只收叶行', () => {
    const t = mount({})
    t.api().selectRow('rd')
    expect(t.selection()).toEqual(['rd-web', 'rd-app'])
    // 禁用子行没勾上，父行因此是半选，不是全勾
    expect(t.api().isSelected('rd')).toBe(false)
    expect(t.trigger('rd')['data-indeterminate']).toBe('')
    // 方框里的记号由勾选标记配方画：半选画横杠
    expect(t.trigger('rd')['data-xh-check-mark']).toBe('indeterminate')
    expect(t.trigger('rd-web')['data-xh-check-mark']).toBe('checked')
    expect(t.trigger('ops')['data-xh-check-mark']).toBe('unchecked')
    expect(t.api().isSelected('rd-web')).toBe(true)
  })

  it('子行全勾上时父行跟着勾中；勾掉一个回到半选', () => {
    const t = mount({})
    t.api().selectRow('ops-sre')
    expect(t.api().isSelected('ops')).toBe(true)
    expect(t.trigger('ops')['data-indeterminate']).toBeUndefined()
    t.api().selectRow('ops-sre')
    expect(t.api().isSelected('ops')).toBe(false)
    expect(t.selection()).toEqual([])
  })

  it('checkedStrategy: parent 收到最高的整枝', () => {
    const t = mount({ checkedStrategy: 'parent' })
    t.api().selectRow('ops')
    expect(t.selection()).toEqual(['ops'])
  })

  it('级联下全选同样按收敛策略折叠，全选把手三态按勾中集算', () => {
    const t = mount({})
    t.api().toggleSelectAll()
    expect(t.selection()).toEqual(['rd-web', 'rd-app', 'ops-sre'])
    // 禁用子行冻结着，研发那一枝永远勾不满；全选的基数只算够得着的叶行
    expect(t.api().selectionState).toBe('checked')
    t.api().toggleSelectAll()
    expect(t.selection()).toEqual([])
    expect(t.api().selectionState).toBe('unchecked')
  })

  it('级联下不接 Shift 范围选：按住 Shift 仍是整枝切换', () => {
    const t = mount({})
    t.api().selectRow('rd-web')
    t.api().selectRow('ops-sre', { extend: true })
    expect(t.selection()).toEqual(['rd-web', 'ops-sre'])
  })

  it('平表与单选下 cascade 不生效', () => {
    const flat = mount({ rows: [{ id: 'a' }, { id: 'b' }] })
    flat.api().selectRow('a')
    expect(flat.selection()).toEqual(['a'])
    const single = mount({ selectionMode: 'single' })
    single.api().selectRow('rd')
    expect(single.selection()).toEqual(['rd'])
  })
})
