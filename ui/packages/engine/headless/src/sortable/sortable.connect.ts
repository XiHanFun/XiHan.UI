import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { DndDelta } from '@xihan-ui/pointer'
import type { SortableApi, SortableItemState, SortableSchema } from './sortable.types'
import { ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/kernel'
import { sortableOffsets } from '@xihan-ui/pointer'
import { VISUALLY_HIDDEN_STYLE } from '../shared/visually-hidden'
import { sortableAnatomy } from './sortable.anatomy'

const parts = sortableAnatomy.build()

const ZERO: DndDelta = { x: 0, y: 0 }

/** 方向键的语义：往列表的后面去还是前面去。 */
function stepFromKey(key: string, axis: string, rtl: boolean): number | null {
  const vertical = axis === 'vertical'
  const both = axis === 'both'

  if (key === 'ArrowDown' && (vertical || both))
    return 1
  if (key === 'ArrowUp' && (vertical || both))
    return -1
  if (key === 'ArrowRight' && (!vertical || both))
    return rtl ? -1 : 1
  if (key === 'ArrowLeft' && (!vertical || both))
    return rtl ? 1 : -1
  return null
}

export function connectSortable<T extends PropTypes>(
  service: Service<SortableSchema>,
  normalize: NormalizeProps<T>,
): SortableApi<T> {
  const { context, prop, send, state } = service

  const ids = prop('ids') ?? []
  const disabled = !!prop('disabled')
  const axis = prop('orientation') ?? 'vertical'
  const rtl = prop('dir') === 'rtl'
  const translations = prop('translations')

  const dragging = state.matches('dragging')
  const activeId = context.get('activeId')
  const from = context.get('from')
  const to = context.get('to')
  const mode = context.get('mode')

  // 让位位移由几何层算，两条路径（指针 / 键盘）共用同一套规则
  const offsets = dragging
    ? sortableOffsets({
        rects: context.get('rects'),
        from,
        to,
        dragDelta: mode === 'pointer' ? context.get('delta') : undefined,
      })
    : []

  const items: SortableItemState[] = ids.map((id, index) => ({
    id,
    index,
    dragging: dragging && id === activeId,
    offset: offsets[index] ?? ZERO,
  }))

  const itemAt = (id: string): SortableItemState | undefined => items.find(item => item.id === id)

  /** 拖动中按下的键：方向键挪一格，空格 / 回车落下，Esc 取消。 */
  const onDragKeyDown = (event: KeyboardEvent): boolean => {
    if (event.key === 'Escape') {
      event.preventDefault()
      send({ type: 'KEY.CANCEL' })
      return true
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      send({ type: 'KEY.DROP' })
      return true
    }
    // Tab 在拖动中拦下：焦点一旦移走，这一场就没有出口了
    if (event.key === 'Tab') {
      event.preventDefault()
      return true
    }
    const step = stepFromKey(event.key, axis, rtl)
    if (step != null) {
      event.preventDefault()
      send({ type: 'KEY.MOVE', step })
      return true
    }
    return false
  }

  return {
    dragging,
    activeId,
    from,
    to,
    mode,
    items,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'list',
      'aria-label': translations?.root ?? 'Sortable list',
      'aria-orientation': axis === 'both' ? undefined : axis,
      'data-orientation': axis,
      'data-disabled': dataAttr(disabled),
      'data-dragging': dataAttr(dragging),
    }),

    getItemProps: ({ id }) => {
      const item = itemAt(id)
      const isDragging = !!item?.dragging
      const offset = item?.offset ?? ZERO
      return normalize.element({
        'role': 'listitem',
        ...parts.item.attrs,
        [ITEM_VALUE_ATTR]: id,
        'data-index': String(item?.index ?? -1),
        'data-dragging': dataAttr(isDragging),
        // 让位中的项不接指针：它正在动，落点判定只看被拖的那一个
        'data-disabled': dataAttr(disabled),
        'style': {
          transform: offset.x === 0 && offset.y === 0 ? undefined : `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          // 被拖那一项要压在让位的项之上，否则跟手时会钻到别人底下
          zIndex: isDragging ? 1 : undefined,
        },
      })
    },

    getItemHandleProps: ({ id }) => {
      const item = itemAt(id)
      const isDragging = !!item?.dragging
      const position = (item?.index ?? 0) + 1
      const name = translations?.item?.(id, position, ids.length) ?? id
      return normalize.element({
        ...parts['item-handle'].attrs,
        // 宿主是 <button> 时必须显式写 type：不写默认是 submit，放进表单里一按就提交
        'type': 'button',
        'role': 'button',
        'tabindex': disabled ? undefined : 0,
        'aria-label': translations?.itemHandle?.(name) ?? `Reorder ${name}`,
        'aria-roledescription': 'sortable',
        'aria-disabled': disabled ? 'true' : 'false',
        'aria-pressed': isDragging ? 'true' : 'false',
        'data-dragging': dataAttr(isDragging),
        // 不关掉这一轴的默认手势，触屏上手指一划就被系统收走（pointercancel）
        'style': { touchAction: disabled ? undefined : 'none' },
        'onPointerDown': (event: PointerEvent) => {
          // 只认主键：右键要弹上下文菜单，中键是自动滚动
          if (disabled || event.button !== 0)
            return
          event.preventDefault()
          send({
            type: 'ITEM.POINTER_DOWN',
            id,
            point: { clientX: event.clientX, clientY: event.clientY },
            pointerId: event.pointerId,
          })
        },
        'onKeyDown': (event: KeyboardEvent) => {
          if (disabled)
            return
          if (dragging) {
            onDragKeyDown(event)
            return
          }
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault()
            send({ type: 'ITEM.PICKUP', id })
          }
        },
      })
    },

    getLiveRegionProps: () => normalize.element({
      ...parts['live-region'].attrs,
      'role': 'status',
      'aria-live': 'polite',
      'aria-atomic': 'true',
      'style': VISUALLY_HIDDEN_STYLE,
    }),
  }
}
