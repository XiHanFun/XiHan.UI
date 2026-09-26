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
  to: number
  mode: SortableMode
  /** 中途取消（Escape 或系统收回指针）时为 true，此时顺序未变。 */
  canceled: boolean
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
}

export interface SortableRefs {
  getRootEl: () => HTMLElement | null
  /** 按下时的指针位置。跟手位移一律相对它计算，不相对上一帧。 */
  origin: { clientX: number, clientY: number } | null
  /** 放下那一刻被拖项在视口里的位置与松手速度：宿主按新顺序重排之后，拿它量出离新位置还差多少。 */
  drop: { id: string, left: number, top: number, velocity: { x: number, y: number } } | null
  /** 放下后把那一项收进新位置的两支弹簧；落定、再次拾起或卸载时撤下。 */
  settle: { x: SpringValue, y: SpringValue } | null
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
    /** 顺序变化意图。取消的一次不发出。 */
    onSort?: (details: SortableSortDetails) => void
    onDragStart?: (details: SortableDragStartDetails) => void
    onDragEnd?: (details: SortableDragEndDetails) => void
  }
  context: {
    /** 正在拖动的项，未拖动时为 null。 */
    activeId: string | null
    /** 拾起时它所在的位次；未拖动时为 -1。 */
    from: number
    /** 当前松手会落到的位次；未拖动时为 -1。 */
    to: number
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
    | { type: 'KEY.DROP' }
    | { type: 'KEY.CANCEL' }
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
    | 'commit'
    | 'cancel'
    | 'invokeDragEnd'
    | 'captureDrop'
    | 'settleDrop'
    | 'startPress'
    | 'endPress'
    | 'releasePress'
    | 'releaseWhenInert'
  effect: 'trackPointer' | 'trackAutoScroll' | 'trackSettle'
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
