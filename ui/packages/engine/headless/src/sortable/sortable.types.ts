import type { Direction, PropTypes } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'
import type { DndDelta, DndRect, SortableAxis } from '@xihan-ui/pointer'

/** 拖动是谁发起的。键盘那条路没有指针位移，让位量另算。 */
export type SortableMode = 'pointer' | 'keyboard'

export interface SortableSortDetails {
  /** 从第几位。 */
  from: number
  /** 到第几位。 */
  to: number
  /** 被拖那一项的标识。 */
  id: string
  /** 已经重排好的顺序，可直接拿去写回数据源。 */
  ids: string[]
}

export interface SortableDragStartDetails {
  id: string
  from: number
  mode: SortableMode
}

export interface SortableDragEndDetails {
  id: string
  from: number
  to: number
  mode: SortableMode
  /** 中途取消（Escape 或系统收走指针）时为 true，此时顺序没有变。 */
  canceled: boolean
}

/** 读屏用的文案，默认英文。拖动过程在视觉上很清楚，在读屏里全靠这几句。 */
export interface SortableTranslations {
  /** 整个可排序区域的名字。 */
  root: string
  /** 一项的名字。不给就取该项屏幕上写着的字——id 是内部标识，念出来没人听得懂。 */
  item: (id: string, position: number, total: number) => string
  /** 拖拽手柄的名字。 */
  itemHandle: (name: string) => string
  /** 拾起时的播报。 */
  picked: (name: string, position: number, total: number) => string
  /** 移动一格后的播报。 */
  moved: (name: string, position: number, total: number) => string
  /** 放下后的播报。 */
  dropped: (name: string, position: number) => string
  /** 取消后的播报。 */
  canceled: (name: string, position: number) => string
}

export interface SortableRefs {
  getRootEl: () => HTMLElement | null
  /** 按下那一刻的指针位置。跟手位移一律相对它算，不是相对上一帧。 */
  origin: { clientX: number, clientY: number } | null
}

export interface SortableSchema extends MachineSchema {
  props: {
    /**
     * 项的稳定标识，数组顺序就是当前顺序。这是顺序的唯一真源。
     * DOM 里项的先后必须与它一致——几何按 DOM 量，回调按它算。
     */
    ids: string[]
    /** 排序沿哪根轴走。换行网格用 `both`。 */
    orientation?: SortableAxis
    disabled?: boolean
    /** 按下之后走多远才算开始拖，默认 5px。给 0 表示按下即拖。 */
    activationDistance?: number
    /** 拖到容器边缘时自动滚动，默认开。 */
    autoScroll?: boolean
    dir?: Direction
    translations?: Partial<SortableTranslations>
    /** 顺序变化意图。取消的那次不发。 */
    onSort?: (details: SortableSortDetails) => void
    onDragStart?: (details: SortableDragStartDetails) => void
    onDragEnd?: (details: SortableDragEndDetails) => void
  }
  context: {
    /** 正在拖的那一项，没在拖是 null。 */
    activeId: string | null
    /** 拾起时它在第几位；没在拖是 -1。 */
    from: number
    /** 此刻松手会落到第几位；没在拖是 -1。 */
    to: number
    mode: SortableMode | null
    /** 指针相对按下点的位移。键盘拖动恒是零。 */
    delta: DndDelta
    /** 拾起那一刻各项的矩形快照，下标与 DOM 顺序对齐。 */
    rects: DndRect[]
    /** 送进 aria-live 的那句话。 */
    announcement: string
  }
  refs: SortableRefs
  state: 'idle' | 'pending' | 'dragging'
  event:
    | { type: 'ITEM.POINTER_DOWN', id: string, point: { clientX: number, clientY: number }, pointerId: number }
    | { type: 'POINTER.MOVE', point: { clientX: number, clientY: number } }
    | { type: 'POINTER.END' }
    | { type: 'POINTER.CANCEL' }
    | { type: 'ITEM.PICKUP', id: string }
    | { type: 'KEY.MOVE', step: number }
    | { type: 'KEY.DROP' }
    | { type: 'KEY.CANCEL' }
  guard: 'canSort' | 'passedActivation'
  action:
    | 'setPending'
    | 'clearSession'
    | 'trackDelta'
    | 'startPointerDrag'
    | 'startKeyboardDrag'
    | 'stepTo'
    | 'commit'
    | 'cancel'
    | 'invokeDragEnd'
  effect: 'trackPointer' | 'trackAutoScroll'
  computed: Record<string, never>
  tag: string
}

export interface SortableItemProps {
  /** 项标识，与 `ids` 里的值一一对应。 */
  id: string
  /**
   * 单独禁掉这一项。整份 `disabled` 是列表级的开关，这条是项级的——
   * 固定标签不许拖、其余照拖，就是这个形状。
   */
  disabled?: boolean
}

/** 一项在此刻的呈现状态，适配器据此渲染。 */
export interface SortableItemState {
  id: string
  index: number
  /** 就是它被拖着。 */
  dragging: boolean
  /** 让位位移，直接写进 transform。 */
  offset: DndDelta
}

export interface SortableApi<T extends PropTypes = PropTypes> {
  /** 正在拖（含键盘拖动）。 */
  dragging: boolean
  activeId: string | null
  from: number
  to: number
  mode: SortableMode | null
  /** 逐项的呈现状态，顺序与 `ids` 一致。 */
  items: SortableItemState[]
  getRootProps: () => T['element']
  getItemProps: (props: SortableItemProps) => T['element']
  getItemHandleProps: (props: SortableItemProps) => T['element']
  getLiveRegionProps: () => T['element']
}
