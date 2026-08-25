import type {
  TableColumnPreference,
  TableRowDef,
  TableSchema,
  TableSelection,
  TableSelectionMode,
  TableSortDescriptor,
} from './table.types'
import { setup } from '@xihan-ui/machine'
import { orderColumnIds } from './table.columns'
import { tableSelectableRowIds, tableToggleRowSelection, tableToggleSelectAll } from './table.rows'
import { tableNormalizeSort, tableToggleSort } from './table.sort'

const { createMachine } = setup<TableSchema>()

/**
 * 生效的选择模式，缺省 none：不声明就没有选择这回事。
 * 缺省 multiple 会让普通数据表都报出 aria-multiselectable=true 而实际一行也选不动。
 */
export function tableSelectionMode(mode: TableSelectionMode | undefined): TableSelectionMode {
  return mode ?? 'none'
}

/** 去重且保序：展开集合是一个集合，重复元素没有意义。 */
function unique(values: readonly string[]): string[] {
  return [...new Set(values)]
}

/**
 * 选中集合的不变量：单选恒为长度 ≤ 1，复选去重。
 * 单选下的裸 'all' 自相矛盾（一次只中一行），落成空集合。
 */
function normalizeSelection(next: TableSelection, mode: TableSelectionMode): TableSelection {
  if (next === 'all')
    return mode === 'single' ? [] : 'all'
  const uniq = unique(next)
  return mode === 'single' ? uniq.slice(0, 1) : uniq
}

/** 数组按元素比：受控时 cell 每次读都产出新数组，默认的 Object.is 恒不相等。 */
function sameValues(a: string[], b: string[] | undefined): boolean {
  return !!b && a.length === b.length && a.every((v, i) => v === b[i])
}

/** 选中集合多一个裸 'all' 形态：它与「恰好列全了同一批 id」不是一回事，不能互判相等。 */
function sameSelection(a: TableSelection, b: TableSelection | undefined): boolean {
  if (b === undefined)
    return false
  if (a === 'all' || b === 'all')
    return a === b
  return sameValues(a, b)
}

/** 排序链按 id 与方向逐环比，顺序也算——链序就是排序优先级。 */
function sameSort(a: TableSortDescriptor[], b: TableSortDescriptor[] | undefined): boolean {
  return !!b && a.length === b.length
    && a.every((item, i) => item.id === b[i]!.id && item.direction === b[i]!.direction)
}

/** 这一行能不能被用户展开：禁用行、不可展开的行、不在 rows 里的行都不行。 */
function canExpand(rows: readonly TableRowDef[], id: string): boolean {
  const row = rows.find(item => item.id === id)
  return !!row?.expandable && !row.disabled
}

// 排序、选中与展开都住在 context 的 cell 里，受控/非受控在 cell 收口，
// 不需要影子事件与受控守卫。
export const tableMachine = createMachine({
  name: 'table',
  context: ({ prop, cell }) => ({
    sort: cell<TableSortDescriptor[]>(() => ({
      value: prop('sort'),
      defaultValue: prop('defaultSort') ?? [],
      isEqual: sameSort,
      onChange: value => prop('onSortChange')?.({ value }),
    })),
    selection: cell<TableSelection>(() => ({
      value: prop('selection'),
      defaultValue: prop('defaultSelection') ?? [],
      isEqual: sameSelection,
      onChange: value => prop('onSelectionChange')?.({ value }),
    })),
    expanded: cell<string[]>(() => ({
      value: prop('expanded'),
      defaultValue: prop('defaultExpanded') ?? [],
      isEqual: sameValues,
      onChange: value => prop('onExpandedChange')?.({ value }),
    })),
    // 焦点锚点不受控、不对外通知：它只服务行级 roving tabindex 与方向键起点
    focusedRow: cell<string | null>(() => ({ defaultValue: null })),
    columnPreference: cell<TableColumnPreference>(() => ({
      value: prop('columnPreference'),
      defaultValue: prop('defaultColumnPreference') ?? {},
      onChange: value => prop('onColumnPreferenceChange')?.({ value }),
    })),
  }),
  initialState: () => 'idle',
  states: {
    idle: {
      // 省略 target：只跑 actions，不换状态
      on: {
        'COLUMN_PREF.SET': { actions: ['setColumnPreference'] },
        'COLUMN_PREF.PATCH': { actions: ['patchColumnPreference'] },
        'SORT.SET': { actions: ['setSort'] },
        'SORT.TOGGLE': { actions: ['toggleSort'] },
        'SELECTION.SET': { actions: ['setSelection'] },
        'ROW.SELECT': { actions: ['selectRow'] },
        'SELECTION.ALL_TOGGLE': { actions: ['toggleSelectAll'] },
        'EXPANDED.SET': { actions: ['setExpanded'] },
        'ROW.EXPAND': { actions: ['expandRow'] },
        'ROW.COLLAPSE': { actions: ['collapseRow'] },
        'ROW.EXPAND_TOGGLE': { actions: ['toggleExpandRow'] },
        'ROW.FOCUS': { actions: ['setFocusedRow'] },
        'TABLE.BLUR': { actions: ['clearFocusedRow'] },
      },
    },
  },
  implementations: {
    actions: {
      setColumnPreference: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'COLUMN_PREF.SET')
          context.set('columnPreference', e.value ?? {})
      },
      /**
       * 逐列增改。三件事互不相干，各自缺席即不动那一项。
       *
       * order 每次都写成一份完整列序而不是「只记挪动过的那几个」：
       * 只记一部分的话，作者改了 columns 的原始顺序之后，两份顺序拼起来的结果
       * 依赖于合并算法的细节，谁也说不清最终是什么样。
       */
      patchColumnPreference: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'COLUMN_PREF.PATCH')
          return
        const current = context.get('columnPreference')
        const next: TableColumnPreference = { ...current }

        if (e.hidden !== undefined) {
          const hidden = new Set(current.hidden ?? [])
          if (e.hidden)
            hidden.add(e.columnId)
          else
            hidden.delete(e.columnId)
          next.hidden = [...hidden]
        }

        if (e.width !== undefined)
          next.widths = { ...current.widths, [e.columnId]: e.width }

        if (e.toIndex !== undefined) {
          // 基线取「当下的列序」：没有偏好时就是作者给的原顺序
          const ids = (prop('columns') ?? []).map(column => column.id)
          const ordered = orderColumnIds(ids, current.order)
          const from = ordered.indexOf(e.columnId)
          if (from >= 0) {
            ordered.splice(from, 1)
            ordered.splice(Math.max(0, Math.min(e.toIndex, ordered.length)), 0, e.columnId)
            next.order = ordered
          }
        }

        context.set('columnPreference', next)
      },
      setSort: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'SORT.SET')
          return
        context.set('sort', tableNormalizeSort(e.value))
      },
      toggleSort: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'SORT.TOGGLE')
          return
        // 没声明 sortable 的列不进排序链，否则那一列的表头不报 aria-sort
        const column = (prop('columns') ?? []).find(item => item.id === e.value)
        if (!column?.sortable)
          return
        context.set('sort', tableToggleSort(context.get('sort'), e.value, { append: e.append }))
      },
      setSelection: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'SELECTION.SET')
          return
        const mode = tableSelectionMode(prop('selectionMode'))
        if (mode === 'none')
          return
        context.set('selection', normalizeSelection(e.value, mode))
      },
      selectRow: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'ROW.SELECT')
          return
        const mode = tableSelectionMode(prop('selectionMode'))
        if (mode === 'none')
          return
        const rows = prop('rows') ?? []
        const row = rows.find(item => item.id === e.value)
        // 禁用行选不动；不在 rows 里的行也不认，那种选中值算不出行号
        if (!row || row.disabled)
          return
        const ids = tableSelectableRowIds(rows)
        context.set('selection', tableToggleRowSelection(context.get('selection'), e.value, mode, ids))
      },
      toggleSelectAll: ({ context, prop }) => {
        // 全选只在复选下成立
        if (tableSelectionMode(prop('selectionMode')) !== 'multiple')
          return
        const ids = tableSelectableRowIds(prop('rows') ?? [])
        context.set('selection', tableToggleSelectAll(context.get('selection'), ids))
      },
      setExpanded: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'EXPANDED.SET')
          return
        // 只去重不筛可不可展开：数据晚到时先记下意愿，摊平那一步会拦住不可展开的行
        context.set('expanded', unique(e.value))
      },
      expandRow: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'ROW.EXPAND')
          return
        if (!canExpand(prop('rows') ?? [], e.value))
          return
        const current = context.get('expanded')
        if (current.includes(e.value))
          return
        context.set('expanded', [...current, e.value])
      },
      collapseRow: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'ROW.COLLAPSE')
          return
        // 收起不查 rows，能摘就摘干净
        context.set('expanded', context.get('expanded').filter(v => v !== e.value))
      },
      toggleExpandRow: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'ROW.EXPAND_TOGGLE')
          return
        const current = context.get('expanded')
        if (current.includes(e.value)) {
          context.set('expanded', current.filter(v => v !== e.value))
          return
        }
        if (!canExpand(prop('rows') ?? [], e.value))
          return
        context.set('expanded', [...current, e.value])
      },
      setFocusedRow: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ROW.FOCUS')
          context.set('focusedRow', e.value)
      },
      // 焦点离场只清焦点锚点，排序、选中与展开留着
      clearFocusedRow: ({ context }) => {
        context.set('focusedRow', null)
      },
    },
  },
})
