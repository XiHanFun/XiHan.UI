import type {
  TableColumnPreference,
  TableRowDef,
  TableSchema,
  TableSelection,
  TableSelectionMode,
  TableSortDescriptor,
} from './table.types'
import { applySelection } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'
import { clampSize, createPointerSession, resolveSessionDoc } from '@xihan-ui/pointer'
import { orderColumnIds } from './table.columns'
import { tableSelectableRowIds, tableSelectionIds, tableToggleRowSelection, tableToggleSelectAll } from './table.rows'
import { tableNormalizeSort, tableToggleSort } from './table.sort'

/** 拖动改列宽时的缺省下限（px）。列定义可用 minWidth 覆盖。 */
export const TABLE_COLUMN_MIN_WIDTH = 48

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
    selectionAnchor: cell<string | null>(() => ({ defaultValue: null })),
    selectionBaseline: cell<string[] | null>(() => ({ defaultValue: null })),
    columnPreference: cell<TableColumnPreference>(() => ({
      value: prop('columnPreference'),
      defaultValue: prop('defaultColumnPreference') ?? {},
      onChange: value => prop('onColumnPreferenceChange')?.({ value }),
    })),
    resizingColumn: cell<string | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    resize: null,
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
        // 键盘改宽不进拖动态：按一下改一步，没有「进行中」这回事
        'COLUMN_RESIZE.STEP': { actions: ['stepColumnWidth'] },
        'COLUMN_RESIZE.START': { target: 'resizing', actions: ['startColumnResize'] },
      },
    },
    resizing: {
      effects: ['trackResizePointer'],
      on: {
        'COLUMN_RESIZE.MOVE': { actions: ['trackColumnResize'] },
        'COLUMN_RESIZE.END': { target: 'idle', actions: ['endColumnResize'] },
        // 系统收走指针按取消算：宽度退回按下那一刻
        'COLUMN_RESIZE.CANCEL': { target: 'idle', actions: ['cancelColumnResize'] },
      },
    },
  },
  implementations: {
    effects: {
      /** 跟手交给指针会话：拖出表头仍要跟，系统收走指针也会收尾。 */
      trackResizePointer: ({ scope, send }) => {
        const session = createPointerSession({
          doc: resolveSessionDoc(scope.getDoc().documentElement),
          onMove: ({ point }) => send({ type: 'COLUMN_RESIZE.MOVE', clientX: point.clientX }),
          onEnd: ({ reason }) => send({ type: reason === 'pointercancel' ? 'COLUMN_RESIZE.CANCEL' : 'COLUMN_RESIZE.END' }),
        })
        return () => session.dispose()
      },
    },
    actions: {
      startColumnResize: ({ context, refs, event }) => {
        const e = event.current()
        if (e.type !== 'COLUMN_RESIZE.START')
          return
        refs.set('resize', { columnId: e.columnId, startWidth: e.startWidth, originX: e.originX })
        // 先把全部列此刻的宽度钉成基线。单元格默认按 flex 分配剩余空间，
        // 只钉一列会让其余列跟着重排——拖一列、整排都在动。
        // 已经有覆盖的列不碰：那是用户先前调过的，比这一刻量到的更权威
        const current = context.get('columnPreference')
        const widths = { ...current.widths }
        let added = false
        for (const [id, width] of Object.entries(e.snapshot)) {
          if (widths[id] == null && Number.isFinite(width)) {
            widths[id] = width
            added = true
          }
        }
        if (added)
          context.set('columnPreference', { ...current, widths })
        context.set('resizingColumn', e.columnId)
      },

      trackColumnResize: ({ context, prop, refs, event }) => {
        const e = event.current()
        const session = refs.get('resize')
        if (e.type !== 'COLUMN_RESIZE.MOVE' || !session)
          return
        // rtl 下往左拖才是加宽：位移的正负跟着文字方向翻
        const towards = prop('dir') === 'rtl' ? session.originX - e.clientX : e.clientX - session.originX
        writeColumnWidth(context, prop, session.columnId, session.startWidth + towards)
      },

      stepColumnWidth: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'COLUMN_RESIZE.STEP')
          return
        const current = currentColumnWidth(context, prop, e.columnId)
        if (current == null)
          return
        writeColumnWidth(context, prop, e.columnId, current + e.delta)
      },

      endColumnResize: ({ context, refs }) => {
        refs.set('resize', null)
        context.set('resizingColumn', null)
      },

      cancelColumnResize: ({ context, prop, refs }) => {
        const session = refs.get('resize')
        if (session)
          writeColumnWidth(context, prop, session.columnId, session.startWidth)
        refs.set('resize', null)
        context.set('resizingColumn', null)
      },

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
        const anchor = context.get('selectionAnchor')

        // 按住 Shift：锚点到这一行那一段并进当前选中。表格是复选框语义，
        // 不像文件管理器那样整份替换——用户先前勾的不该被这一下清掉
        if (e.extend && mode === 'multiple' && anchor != null) {
          // 第一次按住 Shift 时把当下的选中集拍下来当基线，后面每一下都从它重算
          const baseline = context.get('selectionBaseline') ?? tableSelectionIds(context.get('selection'), ids)
          context.set('selectionBaseline', baseline)
          const next = applySelection({
            state: { selected: baseline, anchor },
            mode: 'multiple',
            value: e.value,
            extend: true,
            additive: true,
            items: rows.map(item => item.id),
            isDisabled: id => !ids.includes(id),
          })
          context.set('selection', [...next.selected])
          // 锚点不动：连着按 Shift 能从同一行反复改这一段的长短
          return
        }

        context.set('selection', tableToggleRowSelection(context.get('selection'), e.value, mode, ids))
        context.set('selectionAnchor', e.value)
        // 非 Shift 的这一下作废基线：下一段 Shift 从这里重新拍
        context.set('selectionBaseline', null)
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

/** 这一列眼下的宽度（px）。列定义写的是字符串（如 `40%`）时算不出数，返回 null。 */
function currentColumnWidth(
  context: { get: (k: 'columnPreference') => TableColumnPreference },
  prop: <K extends keyof TableSchema['props']>(k: K) => TableSchema['props'][K],
  columnId: string,
): number | null {
  const override = context.get('columnPreference').widths?.[columnId]
  const raw = override ?? prop('columns')?.find(c => c.id === columnId)?.width
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : null
}

/**
 * 把新宽度夹进这一列的上下限再写回偏好。
 * 夹取走 pointer 的 resize 层，与面板、可调容器同一份实现。
 */
function writeColumnWidth(
  context: {
    get: (k: 'columnPreference') => TableColumnPreference
    set: (k: 'columnPreference', v: TableColumnPreference) => void
  },
  prop: <K extends keyof TableSchema['props']>(k: K) => TableSchema['props'][K],
  columnId: string,
  next: number,
): void {
  const def = prop('columns')?.find(c => c.id === columnId)
  const { width } = clampSize({ width: next, height: 0 }, {
    minWidth: def?.minWidth ?? TABLE_COLUMN_MIN_WIDTH,
    maxWidth: def?.maxWidth,
  })
  const current = context.get('columnPreference')
  context.set('columnPreference', { ...current, widths: { ...current.widths, [columnId]: width } })
}

/** 键盘改宽的步长（px）。 */
export const TABLE_COLUMN_STEP = 8
/** Shift + 方向键的步长（px）。 */
export const TABLE_COLUMN_LARGE_STEP = 40
