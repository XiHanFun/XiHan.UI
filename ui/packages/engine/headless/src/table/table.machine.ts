import type { DragAnnounceKind } from '../shared/drag'
import type {
  TableColumnPreference,
  TableDropTarget,
  TableRowDef,
  TableRowReorderReason,
  TableSchema,
  TableSelection,
  TableSelectionMode,
  TableSortDescriptor,
} from './table.types'
import { applySelection } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'
import { clampSize, createPointerSession, resolveSessionDoc, shouldActivate } from '@xihan-ui/pointer'
import { dragAnnouncement, hitAlong, hitAlongNested, insertionIndex } from '../shared/drag'
import { snapshotDrift } from '../shared/drag-drift'
import { orderColumnIds, resolveTableColumns } from './table.columns'
import { canOwnChildren, draggableColumnIds, reorderTableRows, tableRowMoveOf, toColumnPreferenceIndex } from './table.drag'
import { flattenTableRows, tableSelectableRowIds, tableSelectionIds, tableToggleRowSelection, tableToggleSelectAll } from './table.rows'
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
    expandedValue: cell<string[]>(() => ({
      value: prop('expandedValue'),
      defaultValue: prop('defaultExpandedValue') ?? [],
      isEqual: sameValues,
      onChange: value => prop('onExpandedValueChange')?.({ value }),
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
    draggingColumn: cell<string | null>(() => ({ defaultValue: null })),
    draggingRow: cell<string | null>(() => ({ defaultValue: null })),
    rowReorderBlocked: cell<TableRowReorderReason | null>(() => ({ defaultValue: null })),
    dropTarget: cell<TableDropTarget | null>(() => ({ defaultValue: null })),
    announcement: cell<string>(() => ({ defaultValue: '' })),
  }),
  refs: () => ({
    resize: null,
    columnDrag: null,
    rowDrag: null,
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
        // 键盘换位同理不进拖动态：按一下就是一次已过守卫的完整提交
        'COLUMN.MOVE_BY': { actions: ['moveColumnBy'] },
        'COLUMN_DRAG.START': { target: 'columnDragging', actions: ['startColumnDrag'] },
        'ROW.MOVE_BY': { actions: ['moveRowBy'] },
        'ROW.REORDER_BLOCKED': { actions: ['blockRowReorder'] },
        'ROW_DRAG.START': { target: 'rowDragging', actions: ['startRowDrag'] },
      },
    },
    // 按下即进这个状态，但「按住」还不是拖动：激活之前 draggingRow 恒是 null，
    // 界面上一点变化都没有。这么挂是为了让指针会话与长按计时器一次挂好，
    // 激活时不必拆了重挂
    rowDragging: {
      effects: ['trackRowDragPointer'],
      on: {
        'ROW_DRAG.MOVE': { actions: ['trackRowDrag'] },
        'ROW_DRAG.END': { target: 'idle', actions: ['endRowDrag'] },
        'ROW_DRAG.CANCEL': { target: 'idle', actions: ['cancelRowDrag'] },
      },
    },
    columnDragging: {
      effects: ['trackColumnDragPointer'],
      on: {
        'COLUMN_DRAG.MOVE': { actions: ['trackColumnDrag'] },
        'COLUMN_DRAG.END': { target: 'idle', actions: ['endColumnDrag'] },
        // 系统收走指针按取消算：列序一步不动
        'COLUMN_DRAG.CANCEL': { target: 'idle', actions: ['cancelColumnDrag'] },
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

      /** 换行位跟手。整行可拖，按下即挂会话——激活与否由动作层判。 */
      trackRowDragPointer: ({ refs, scope, send }) => {
        const session = createPointerSession({
          doc: resolveSessionDoc(scope.getDoc().documentElement),
          pointerId: refs.get('rowDrag')?.pointerId,
          onMove: ({ point }) => send({ type: 'ROW_DRAG.MOVE', clientY: point.clientY }),
          onEnd: ({ reason }) => send({ type: reason === 'pointercancel' ? 'ROW_DRAG.CANCEL' : 'ROW_DRAG.END' }),
        })
        return () => session.dispose()
      },

      /** 换列位同样跟手：只认按下那一根指针，触屏上第二根落下不劫持这一场。 */
      trackColumnDragPointer: ({ refs, scope, send }) => {
        const session = createPointerSession({
          doc: resolveSessionDoc(scope.getDoc().documentElement),
          pointerId: refs.get('columnDrag')?.pointerId,
          onMove: ({ point }) => send({ type: 'COLUMN_DRAG.MOVE', clientX: point.clientX }),
          onEnd: ({ reason }) => send({ type: reason === 'pointercancel' ? 'COLUMN_DRAG.CANCEL' : 'COLUMN_DRAG.END' }),
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

      startColumnDrag: ({ context, refs, event }) => {
        const e = event.current()
        if (e.type !== 'COLUMN_DRAG.START')
          return
        refs.set('columnDrag', { columnId: e.columnId, rects: e.rects, originX: e.originX, pointerId: e.pointerId, source: e.source })
        context.set('draggingColumn', e.columnId)
        // 按下那一刻还没挪，落点先空着：指示线要等指针真的走到某一列上才出现
        context.set('dropTarget', null)
        context.set('announcement', '')
      },

      trackColumnDrag: ({ context, prop, refs, event }) => {
        const e = event.current()
        const session = refs.get('columnDrag')
        if (e.type !== 'COLUMN_DRAG.MOVE' || !session)
          return
        // 快照是按下那一刻量的；拖动中版面整体挪了多远，拿拖动源自己量出来减掉
        const drift = snapshotDrift(session.source, session.rects, session.columnId, 'x')
        // 列是横排的：rtl 下几何左右与逻辑前后相反
        const hit = hitAlong(session.rects, e.clientX - drift, prop('dir') === 'rtl')
        // 落在自己身上不算落点：那不是一次移动，指示线该消失
        context.set('dropTarget', hit && hit.targetValue !== session.columnId ? hit : null)
      },

      endColumnDrag: ({ context, prop, refs, send }) => {
        const session = refs.get('columnDrag')
        const target = context.get('dropTarget')
        clearColumnDrag(context, refs)
        if (!session)
          return
        if (!target) {
          // 松手时没有合法落点：视觉上「那条线没出现」已经说明了，读屏里得有人说一句
          announceColumnDrag(context, prop, 'rejected', session.columnId)
          return
        }
        commitColumnMove(context, prop, send, session.columnId, target, 'dropped')
      },

      cancelColumnDrag: ({ context, prop, refs }) => {
        const session = refs.get('columnDrag')
        clearColumnDrag(context, refs)
        if (session)
          announceColumnDrag(context, prop, 'canceled', session.columnId)
      },

      startRowDrag: ({ context, refs, event }) => {
        const e = event.current()
        if (e.type !== 'ROW_DRAG.START')
          return
        refs.set('rowDrag', {
          rowId: e.rowId,
          rects: e.rects,
          originY: e.originY,
          pointerId: e.pointerId,
          activated: !!e.activate,
          source: e.source,
        })
        // 从把手起手即刻算拖；整行起手时按下还不算拖，要等走够激活距离
        context.set('draggingRow', e.activate ? e.rowId : null)
        context.set('dropTarget', null)
        context.set('announcement', '')
      },

      trackRowDrag: ({ context, prop, refs, event }) => {
        const e = event.current()
        const session = refs.get('rowDrag')
        if (e.type !== 'ROW_DRAG.MOVE' || !session)
          return
        // 两件事在两个坐标系里判：
        // 激活看的是「手指动没动」，用原始视口坐标——内容滚过去了但手没动，不算拖了一段；
        // 命中看的是「指针此刻指着哪一项」，要减掉版面漂移换算回快照那一刻的坐标
        if (!session.activated) {
          if (!shouldActivate({ x: 0, y: e.clientY - session.originY }))
            return
          refs.set('rowDrag', { ...session, activated: true })
          context.set('draggingRow', session.rowId)
        }
        const drift = snapshotDrift(session.source, session.rects, session.rowId, 'y')
        const rects = refs.get('rowDrag')?.rects ?? []
        const point = e.clientY - drift
        // 树形表多一档「落进去」：能收孩子的行才给这一档，平表只有前后两档
        const rows = prop('rows') ?? []
        const nested = rows.some((row: TableRowDef) => row.parentId != null)
        const hit = nested
          ? hitAlongNested(rects, point, value => canOwnChildren(rows, value))
          : hitAlong(rects, point)
        // 落不下去的地方不该出现指示线：落在自己身上、落进自己的后代、
        // 算下来还是原位、以及作者的 allowRowDrop 说了不行
        context.set('dropTarget', hit && rowDropAllowed(context, prop, session.rowId, hit) ? hit : null)
      },

      endRowDrag: ({ context, prop, refs, send }) => {
        const session = refs.get('rowDrag')
        const target = context.get('dropTarget')
        clearRowDrag(context, refs)
        // 没激活过就只是按了一下：不是拖动，什么都不做也不播报
        if (!session?.activated)
          return
        if (!target) {
          announceRowMove(context, prop, 'rejected', session.rowId)
          return
        }
        commitRowMove(context, prop, send, session.rowId, target, 'dropped')
      },

      cancelRowDrag: ({ context, prop, refs }) => {
        const session = refs.get('rowDrag')
        clearRowDrag(context, refs)
        if (session?.activated)
          announceRowMove(context, prop, 'canceled', session.rowId)
      },

      blockRowReorder: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ROW.REORDER_BLOCKED')
          context.set('rowReorderBlocked', e.reason)
      },

      moveRowBy: ({ context, prop, event, send }) => {
        const e = event.current()
        if (e.type !== 'ROW.MOVE_BY')
          return
        commitRowMove(context, prop, send, e.rowId, e.target, 'moved')
      },

      moveColumnBy: ({ context, prop, event, send }) => {
        const e = event.current()
        if (e.type !== 'COLUMN.MOVE_BY')
          return
        commitColumnMove(context, prop, send, e.columnId, e.target, 'moved')
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
        context.set('expandedValue', unique(e.value))
      },
      expandRow: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'ROW.EXPAND')
          return
        if (!canExpand(prop('rows') ?? [], e.value))
          return
        const current = context.get('expandedValue')
        if (current.includes(e.value))
          return
        context.set('expandedValue', [...current, e.value])
      },
      collapseRow: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'ROW.COLLAPSE')
          return
        // 收起不查 rows，能摘就摘干净
        context.set('expandedValue', context.get('expandedValue').filter(v => v !== e.value))
      },
      toggleExpandRow: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'ROW.EXPAND_TOGGLE')
          return
        const current = context.get('expandedValue')
        if (current.includes(e.value)) {
          context.set('expandedValue', current.filter(v => v !== e.value))
          return
        }
        if (!canExpand(prop('rows') ?? [], e.value))
          return
        context.set('expandedValue', [...current, e.value])
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

/** 行拖拽那一路的最小接口。 */
interface RowDragContext {
  get: (k: 'expandedValue') => string[]
  set: (k: 'announcement', v: string) => void
}

/** 播报与落点两处都要写 announcement，抽一个最小接口，别把整个 service 拖进来。 */
interface ColumnDragContext {
  get: (k: 'columnPreference') => TableColumnPreference
  set: (k: 'announcement', v: string) => void
}

/** 可拖的那一段列。落点、位置播报与键盘命令三处都以它为准，口径必须是同一份。 */
function draggableSegment(
  context: { get: (k: 'columnPreference') => TableColumnPreference },
  prop: <K extends keyof TableSchema['props']>(k: K) => TableSchema['props'][K],
): string[] {
  return draggableColumnIds(resolveTableColumns(
    prop('columns') ?? [],
    prop('prefixColumns') ?? [],
    context.get('columnPreference'),
  ))
}

/** 播报一句。位置说的是「可拖的这一段里第几个」——用户能挪到的范围就是这一段。 */
function announceColumnDrag(
  context: ColumnDragContext,
  prop: <K extends keyof TableSchema['props']>(k: K) => TableSchema['props'][K],
  kind: DragAnnounceKind,
  columnId: string,
  position?: number,
): void {
  const segment = draggableSegment(context, prop)
  const t = prop('translations')
  context.set('announcement', dragAnnouncement(kind, {
    value: columnId,
    position: position ?? segment.indexOf(columnId) + 1,
    total: segment.length,
    // 列名比列 id 好听。作者没给 translations.item 时退回列的 label
    translations: {
      item: (value: string) => (prop('columns') ?? []).find(c => c.id === value)?.label ?? value,
      ...t,
    },
  }))
}

/**
 * 落点折算成一次列序改写，并播报改完之后的位置。
 *
 * 写偏好走既有的 COLUMN_PREF.PATCH 那一条路（列序只有一处在改）；播报的位置自己算，
 * 因为嵌套发出去的事件要排到队尾，这一刻还读不到改完的偏好。
 */
function commitColumnMove(
  context: ColumnDragContext,
  prop: <K extends keyof TableSchema['props']>(k: K) => TableSchema['props'][K],
  send: (event: { type: 'COLUMN_PREF.PATCH', columnId: string, toIndex: number }) => void,
  columnId: string,
  target: TableDropTarget,
  kind: DragAnnounceKind,
): void {
  const segment = draggableSegment(context, prop)
  const within = insertionIndex(segment, columnId, target)
  const toIndex = toColumnPreferenceIndex(
    (prop('columns') ?? []).map(column => column.id),
    context.get('columnPreference').order,
    columnId,
    target,
  )
  if (within == null || toIndex == null) {
    announceColumnDrag(context, prop, 'rejected', columnId)
    return
  }
  send({ type: 'COLUMN_PREF.PATCH', columnId, toIndex })
  announceColumnDrag(context, prop, kind, columnId, within + 1)
}

/** 收尾：拖动态的三样一起清干净，别留半截。 */
function clearColumnDrag(
  context: { set: (k: 'draggingColumn' | 'dropTarget', v: null) => void },
  refs: { set: (k: 'columnDrag', v: null) => void },
): void {
  refs.set('columnDrag', null)
  context.set('draggingColumn', null)
  context.set('dropTarget', null)
}

/** 可见数据行的 id 序列。落点、位置播报与键盘命令三处都以它为准。 */
function visibleRowIds(
  context: { get: (k: 'expandedValue') => string[] },
  prop: <K extends keyof TableSchema['props']>(k: K) => TableSchema['props'][K],
): string[] {
  return flattenTableRows(prop('rows') ?? [], context.get('expandedValue'))
    .filter(row => row.kind === 'data')
    .map(row => row.id)
}

/** 播报一句。位置说的是可见数据行里的第几行。 */
function announceRowMove(
  context: RowDragContext,
  prop: <K extends keyof TableSchema['props']>(k: K) => TableSchema['props'][K],
  kind: DragAnnounceKind,
  rowId: string,
  position?: number,
): void {
  const ids = visibleRowIds(context, prop)
  context.set('announcement', dragAnnouncement(kind, {
    value: rowId,
    position: position ?? ids.indexOf(rowId) + 1,
    total: ids.length,
    translations: prop('translations'),
  }))
}

/**
 * 把落点折算成一次行序改写，报给宿主并播报改完之后的位置。
 *
 * 行序不进机器：rows 是 prop，库没有一份自己的行序可写。这里只发意图，
 * 写回归宿主——它本来就是那份数组的主人。
 */
/**
 * 落点折算成一次搬家，报给宿主并播报。
 *
 * 平表与树形表走同一条： 算出「搬到哪个父下面的第几位」，
 * 平表下 parent 恒为 null、index 就是可见序里的第几位。
 *
 * 行序不进机器：rows 是 prop，库没有一份自己的行序可写。这里只发意图，
 * 写回归宿主——按 ids 重排，再把这一行的 parentId 设成 parent。
 */
function commitRowMove(
  context: RowDragContext,
  prop: <K extends keyof TableSchema['props']>(k: K) => TableSchema['props'][K],
  send: (event: { type: 'ROW.FOCUS', value: string }) => void,
  rowId: string,
  target: TableDropTarget,
  kind: DragAnnounceKind,
): void {
  const rows = prop('rows') ?? []
  const move = tableRowMoveOf(flattenTableRows(rows, context.get('expandedValue')), rowId, target)
  if (!move) {
    announceRowMove(context, prop, 'rejected', rowId)
    return
  }
  const details = { id: rowId, parent: move.parent, index: move.index, ids: reorderTableRows(rows, move) }
  const allow = prop('allowRowDrop')
  if (allow && !allow(details)) {
    announceRowMove(context, prop, 'rejected', rowId)
    return
  }
  prop('onRowMove')?.(details)
  // 焦点锚点跟着搬走的那一行，键盘连着挪几格才不会挪一次就丢了起点
  send({ type: 'ROW.FOCUS', value: rowId })
  announceRowMove(context, prop, kind, rowId, move.index + 1)
}

/** 收尾：拖动态的三样一起清干净，别留半截。 */
function clearRowDrag(
  context: { set: (k: 'draggingRow' | 'dropTarget', v: null) => void },
  refs: { set: (k: 'rowDrag', v: null) => void },
): void {
  refs.set('rowDrag', null)
  context.set('draggingRow', null)
  context.set('dropTarget', null)
}

/**
 * 这个落点落不落得下去。
 *
 * 库自己兜住三条：落在自己身上、落进自己的后代、算下来还是原位。
 * 第四条是作者的 allowRowDrop——它收到的是折算好的搬家，与提交时那份一模一样。
 */
function rowDropAllowed(
  context: { get: (k: 'expandedValue') => string[] },
  prop: <K extends keyof TableSchema['props']>(k: K) => TableSchema['props'][K],
  rowId: string,
  target: TableDropTarget,
): boolean {
  const rows = prop('rows') ?? []
  const move = tableRowMoveOf(flattenTableRows(rows, context.get('expandedValue')), rowId, target)
  if (!move)
    return false
  const allow = prop('allowRowDrop')
  if (!allow)
    return true
  return allow({ id: rowId, parent: move.parent, index: move.index, ids: reorderTableRows(rows, move) })
}
