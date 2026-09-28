/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 sortable 类型契约。

import type { Direction, MachineSchema, PropTypes } from '@xihan-ui/core'
import type { SpringValue } from '@xihan-ui/motion'
import type { DndDelta, DndRect, SortableAxis } from '@xihan-ui/pointer'

/** 拖动的发起方式。键盘路径没有指针位移，让位量另行计算。 */
export type SortableMode = 'pointer' | 'keyboard'

export interface SortableSortDetails {
  /** 从第几位。 */
  from: number
  /** 到第几位。 */
  to: number
  /** 被拖动项的标识。 */
  id: string
  /** 已重排的顺序，可直接写回数据源。 */
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
  /** 落点的位次；落进同组别的列表时是它在那个列表里的位次。 */
  to: number
  mode: SortableMode
  /** 中途取消（Escape 或系统收回指针）时为 true，此时顺序未变。 */
  canceled: boolean
  /** 源列表的标识：列表入了组才有。 */
  fromList?: string
  /** 落点所在列表的标识：列表入了组才有，落回源列表或取消时与 `fromList` 相同。 */
  toList?: string
}

/** 一项从组里的一个列表落进了另一个列表。两个列表各自的新顺序都算好了，写不写回归宿主。 */
export interface SortableTransferDetails {
  /** 被拖动项的标识。 */
  id: string
  /** 源列表的标识。 */
  fromList: string
  /** 目标列表的标识。 */
  toList: string
  /** 在源列表里的位次。 */
  from: number
  /** 在目标列表里的位次。 */
  to: number
  /** 源列表移出这一项之后的顺序。 */
  fromIds: string[]
  /** 目标列表放入这一项之后的顺序。 */
  toIds: string[]
}

/**
 * 同组别的列表的一项此刻悬在这个列表上方（指针拖进来，或键盘挪进来）。几何都是拖动开始那一刻的快照，
 * 由源列表量好带过来：让位、落点线与落位都按它算，拖动途中不重量。
 */
export interface SortableIncoming {
  /** 被拖进来的那一项的标识。 */
  id: string
  /** 源列表的标识。 */
  fromList: string
  mode: SortableMode
  /** 松手会插在第几位：0 到这个列表的项数。 */
  index: number
  /** 被拖项的尺寸：让位按它加一个间距。 */
  size: { width: number, height: number }
  /** 这个列表各项的矩形，下标与 DOM 顺序对齐。 */
  rects: DndRect[]
  /** 这个列表的内容盒：列表为空时落点线与落位都在它的起点上。 */
  box: DndRect
  /** 这个列表相邻两项之间的间距。 */
  gap: number
  /** 容器左上角在视口中的位置，已减去容器自身的滚动量（落点线换算用）。 */
  rootOrigin: DndDelta
}

/** 读屏文案，默认英文。拖动过程在视觉上很清楚，在读屏中全部依靠这些文案。 */
export interface SortableTranslations {
  /** 整个可排序区域的名字。 */
  root: string
  /** 一项的名字。未提供时取该项屏幕上的文字：id 是内部标识，朗读出来无法理解。 */
  item: (id: string, position: number, total: number) => string
  /** 拖拽手柄的名字。 */
  itemDragTrigger: (name: string) => string
  /** 拾起时的播报。 */
  picked: (name: string, position: number, total: number) => string
  /** 移动一格后的播报。 */
  moved: (name: string, position: number, total: number) => string
  /** 放下后的播报。 */
  dropped: (name: string, position: number) => string
  /** 取消后的播报。 */
  canceled: (name: string, position: number) => string
  /**
   * 挪进同组另一个列表后的播报：列表名、它在组里排第几（从 1 数起）、组里共几个列表，与在那个列表里的第几位、共几项。
   * 列表名取那个列表容器的可及名（aria-labelledby 指向的文字，或 aria-label，即 translations.root）。
   */
  movedToList: (listName: string, listPosition: number, listTotal: number, position: number, total: number) => string
  /** 落进同组另一个列表后的播报。 */
  droppedInList: (name: string, listName: string, listPosition: number, position: number) => string
}

export interface SortableRefs {
  getRootEl: () => HTMLElement | null
  /** 按下时的指针位置。跟手位移一律相对它计算，不相对上一帧。 */
  origin: { clientX: number, clientY: number } | null
  /** 放下那一刻被拖项在视口里的位置与松手速度：宿主按新顺序重排之后，拿它量出离新位置还差多少。 */
  drop: { id: string, left: number, top: number, velocity: { x: number, y: number } } | null
  /** 放下后把那一项收进新位置的两支弹簧；落定、再次拾起或卸载时撤下。 */
  settle: { x: SpringValue, y: SpringValue } | null
  /**
   * 一场拖动收尾之前各项在屏幕上的位置（含拖动时写的位移），与不必由它归位的那一项（弹簧收进的被拖项）：
   * 宿主重排、位移撤掉之后，其余各项按它从原处滑回自己的排布位。归位排上之后即撤。
   */
  layout: { rects: Map<string, { left: number, top: number }>, skip: string | null } | null
  /**
   * 跨列表拖动的会话：拖动开始那一刻量下的组里各列表（含自己，按文档序），与此刻悬着的那个别的列表。
   * 只在源列表上、且列表入了组时存在；收尾即撤。
   */
  group: { peers: SortableGroupPeer[], target: SortableGroupPeer | null } | null
}

/** 组里一个列表在拖动开始那一刻的样子。 */
export interface SortableGroupPeer {
  listId: string
  /** 是不是发起拖动的这个列表自己。 */
  self: boolean
  /** 列表容器节点。 */
  root: HTMLElement
  axis: 'horizontal' | 'vertical'
  /** 水平反向排布（rtl）时为 -1。 */
  direction: 1 | -1
  /** 容器在视口里的矩形：指针拖到哪个列表上方按它判。 */
  bounds: DndRect
  rects: DndRect[]
  box: DndRect
  gap: number
  rootOrigin: DndDelta
  /** 这个列表此刻的 ids（现读）：落进来之后的新顺序按它算。 */
  ids: () => string[]
  /** 把事件交给这个列表的机器。 */
  send: (event: SortableSchema['event']) => void
}

export interface SortableSchema extends MachineSchema {
  props: {
    /**
     * 项的稳定标识，数组顺序即当前顺序。这是顺序的唯一真源。
     * DOM 中项的先后必须与它一致：几何按 DOM 测量，回调按它计算。
     */
    ids: string[]
    /** 排序沿哪根轴进行。换行网格使用 `both`。 */
    orientation?: SortableAxis
    disabled?: boolean
    /** 按下之后移动多远才视为开始拖动，默认 5px。提供 0 表示按下即拖动。 */
    activationDistance?: number
    /** 拖到容器边缘时自动滚动，默认开启。 */
    autoScroll?: boolean
    dir?: Direction
    translations?: Partial<SortableTranslations>
    /**
     * 所在的组。同一文档里 group 相同的几个列表组成一组，条目能从一个列表拖进另一个列表并落在指定位置；
     * 键盘拖动中另一条轴上的方向键在相邻列表间移动。不写时列表只在自身内排序。
     * 入组的列表只能是单轴排布（vertical / horizontal）。
     */
    group?: string
    /** 这个列表在组里的标识，写了 group 就必须写，且组内不重复：transfer 事件用它说明从哪来、到哪去。 */
    listId?: string
    /** 顺序变化意图。取消的一次不发出。 */
    onSort?: (details: SortableSortDetails) => void
    /**
     * 一项落进了同组另一个列表的意图，由源列表发出一次；取消、落回源列表时不发。
     * 两个列表的新顺序都在载荷里，写不写回归宿主：不写回时那一项收回原位。
     */
    onTransfer?: (details: SortableTransferDetails) => void
    onDragStart?: (details: SortableDragStartDetails) => void
    onDragEnd?: (details: SortableDragEndDetails) => void
  }
  context: {
    /** 正在拖动的项，未拖动时为 null。 */
    activeId: string | null
    /** 拾起时它所在的位次；未拖动时为 -1。 */
    from: number
    /** 当前松手会落到的位次；悬在同组别的列表上方时是它在那个列表里的位次。未拖动时为 -1。 */
    to: number
    /** 悬在同组别的列表上方时是那个列表的标识；落点在自己这里、或未拖动时为 null。 */
    toList: string | null
    /**
     * 键盘拖到同组别的列表时，被拖项要落进的那一格的左上角（视口坐标）：被拖项仍在自己的容器里，
     * 按它平移过去。指针拖动时被拖项跟手，不用它。落点在自己这里、或未拖动时为 null。
     */
    slot: DndDelta | null
    /** 同组别的列表的一项正悬在这个列表上方；没有时为 null。 */
    incoming: SortableIncoming | null
    mode: SortableMode | null
    /** 指针相对按下点的位移。键盘拖动恒为零。 */
    delta: DndDelta
    /**
     * 放下后正在归位的那一项，以及它离重排后的新位置还差的位移：弹簧带着松手速度把它收到零。
     * 没有在归位时为 null。
     */
    settle: { id: string, x: number, y: number } | null
    /** 拾起时各项的矩形快照，下标与 DOM 顺序对齐。 */
    rects: DndRect[]
    /**
     * 拾起时容器左上角在视口中的位置，已减去容器自身的滚动量。
     * 落点线据此把项的矩形换算为容器内坐标；未拖动时为 null。
     */
    rootOrigin: DndDelta | null
    /** 送入 aria-live 的文案。 */
    announcement: string
    /**
     * 按压通道：正被 Space / Enter 或触屏手指按住的把手所属项的 id，该把手投影 data-pressed；没有按住时为 null。
     * 抬起、失焦、指针取消即撤下；拖动一开始（键盘拾起、触屏走够激活距离）也撤下——拖动中的回执是 data-dragging，
     * 不再叠着按压面。
     */
    pressedId: string | null
  }
  refs: SortableRefs
  state: 'idle' | 'pending' | 'dragging'
  event:
    | { type: 'ITEM.POINTER_DOWN', id: string, point: { clientX: number, clientY: number }, pointerId: number }
    | { type: 'POINTER.MOVE', point: { clientX: number, clientY: number } }
    /** 指针抬起。velocity 是松手速度（像素每秒），放下归位的弹簧从它起步。 */
    | { type: 'POINTER.END', velocity?: { x: number, y: number } }
    | { type: 'POINTER.CANCEL' }
    | { type: 'ITEM.PICKUP', id: string }
    | { type: 'KEY.MOVE', step: number }
    /** 键盘拖动中挪到组里相邻的列表：1 为文档序的下一个，-1 为上一个。 */
    | { type: 'KEY.MOVE_LIST', step: number }
    | { type: 'KEY.DROP' }
    | { type: 'KEY.CANCEL' }
    /** 组里别的列表把它的一项拖到了这个列表上方，或在这里换了落点。 */
    | { type: 'GROUP.OVER', incoming: SortableIncoming }
    /** 那一项离开了这个列表的上方（挪去别处、或拖动取消）：让位撤掉，各项滑回原位。 */
    | { type: 'GROUP.LEAVE' }
    /**
     * 那一项落在了这个列表里。drop 是它松手那一刻在视口里的位置与松手速度：宿主接了这次转移、
     * 在这里渲出它之后，由这边把它从松手处收进新位置。
     */
    | { type: 'GROUP.DROP', drop: { id: string, left: number, top: number, velocity: { x: number, y: number } } | null }
    /**
     * 按压通道（shared/press）：某项的把手被 Space / Enter 或触屏按住；disabled 是该项自己的禁用，
     * 由 connect 随事件带来。
     */
    | { type: 'PRESS.START', id: string, disabled?: boolean }
    /** 按住的把手抬起、失焦或指针取消；只收自己那一下。 */
    | { type: 'PRESS.END', id: string }
  guard: 'canSort' | 'passedActivation' | 'canPress'
  action:
    | 'setPending'
    | 'clearSession'
    | 'trackDelta'
    | 'startPointerDrag'
    | 'startKeyboardDrag'
    | 'stepTo'
    | 'stepList'
    | 'measureGroup'
    | 'setIncoming'
    | 'clearIncoming'
    | 'receiveDrop'
    | 'commit'
    | 'cancel'
    | 'invokeDragEnd'
    | 'captureDrop'
    | 'settleDrop'
    | 'captureLayout'
    | 'glideLayout'
    | 'startPress'
    | 'endPress'
    | 'releasePress'
    | 'releaseWhenInert'
  effect: 'trackPointer' | 'trackAutoScroll' | 'trackSettle' | 'trackGroup'
  computed: Record<string, never>
  tag: string
}

export interface SortableItemProps {
  /** 项标识，与 `ids` 中的值一一对应。 */
  id: string
  /**
   * 单独禁用该项。整份 `disabled` 是列表级的开关，该条是项级的：
   * 固定标签不允许拖动、其余照常拖动，即为这一形态。
   */
  disabled?: boolean
}

/** 一项当前的呈现状态，适配器据此渲染。 */
export interface SortableItemState {
  id: string
  index: number
  /** 该项正被拖动。 */
  dragging: boolean
  /** 让位位移，直接写入 translate。 */
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
  getItemDragTriggerProps: (props: SortableItemProps) => T['element']
  /** 落点线：拖动中且落点与起点不同位时才存在，位置由内联样式给出。 */
  getDropIndicatorProps: () => T['element']
  getLiveRegionProps: () => T['element']
}
