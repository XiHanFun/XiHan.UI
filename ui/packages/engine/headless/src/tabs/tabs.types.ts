/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 tabs 类型契约。

import type { Direction, MachineSchema, Orientation, PropTypes, Size, Tone } from '@xihan-ui/core'
import type { MultiPointerSession } from '@xihan-ui/pointer'
import type { DragRect, DragTranslations, DropTarget } from '../shared/drag'

/** 视觉变体。line 是默认档，segment 用于需要浮起选中面的主导航。 */
export type TabsVariant = 'line' | 'card' | 'segment'

export interface TabsValueChangeDetails {
  value: string | null
}

/** automatic：方向键移动焦点即切换选中；manual：焦点先走，Enter/Space 才切换。 */
export type TabsActivationMode = 'automatic' | 'manual'

/** 条目数据。提供 collection 时，标签文本与禁用以它为准。 */
export interface TabsNode {
  value: string
  /** 标签上的文本；默认回退为 value。 */
  label?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
}

/** 单个条目的元信息，由 collection 推导，不含选中态与焦点态。 */
export interface TabsNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
}

/**
 * 条目声明的身份：值必须声明，禁用可由 collection 代为声明。
 * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得反查 DOM。
 */
export interface TabsTriggerProps {
  value: string
  /** 逐条覆盖禁用；未提供时从 collection 查询，两处都未声明即为不禁用。 */
  disabled?: boolean
}

export interface TabsContentProps {
  value: string
}

/** 指示条相对 list 的位置与尺寸（px）；起始缘按逻辑方向计算，RTL 从右边缘测量。 */
export interface TabsIndicatorRect {
  blockStart: number
  blockSize: number
  inlineStart: number
  inlineSize: number
}

/** 关闭一个标签：被关闭的标签与关闭后剩余的标签。 */
export interface TabsCloseDetails {
  value: string
  /** 关闭该标签之后剩余的标签序，可直接写回数据源。 */
  values: string[]
}

export interface TabsSchema extends MachineSchema {
  props: {
    /**
     * 条目数据，标签文本与禁用的事实源。提供后 trigger 部件只需声明 value。
     * 未提供时回到文本与禁用都写在 trigger 上的方式。
     */
    collection?: TabsNode[]
    /** 选中值。提供即受控：内部不再自行修改，只发 onValueChange。 */
    value?: string | null
    defaultValue?: string | null
    /** 方向键轴向，默认 horizontal；不同轴的方向键放行给页面滚动与读屏。 */
    orientation?: Orientation
    /** 文字方向，默认 ltr；只影响水平轴上 ArrowLeft / ArrowRight 的前后语义。 */
    dir?: Direction
    /** 方向键移动焦点时是否同时切换选中，默认 automatic。 */
    activationMode?: TabsActivationMode
    /** 方向键到达末尾是否回绕，默认 true。 */
    loop?: boolean
    /** 变体：line / card / segment，决定选中态的绘制方式。默认 line。 */
    variant?: TabsVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /**
     * 标签可以拖动换位。整个标签都是拖动源，不另设把手。
     *
     * 顺序不进入状态机：collection 是 prop，库没有自己的标签序可写，只发 onTabMove。
     */
    reorderable?: boolean
    onTabMove?: (details: TabsMoveDetails) => void
    /**
     * 标签可关闭：trigger 上按 Delete / Backspace 即发 onTabClose。
     * 库不持有标签序，只发意图，是否删除由数据源决定。
     */
    closable?: boolean
    /** 标签被关闭。 */
    onTabClose?: (details: TabsCloseDetails) => void
    translations?: Partial<TabsTranslations>
    /** value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onValueChange?: (details: TabsValueChangeDetails) => void
  }
  context: {
    /** 选中值。受控（value 提供）时 cell 直读 prop，写入只发 onValueChange 不修改内部值。 */
    value: string | null
    /** 焦点位于组内时的瞬态锚点，焦点离开组即清空。 */
    focusedValue: string | null
    /** 正在拖动换位的标签；按住但尚未移动够激活距离时仍为 null。 */
    draggingTab: string | null
    /** 当前的落点；松手即落在此处。未落在任何标签上时为 null。 */
    dropTarget: DropTarget | null
    /** 读屏播报文本。写入视觉隐藏的活动区域，不进入视觉版面。 */
    announcement: string
    /** 指示条的测量结果；没有选中项或无法测量时为 null。 */
    indicator: TabsIndicatorRect | null
    /** 按压通道：Space / Enter 或触屏按住的 trigger value。抬起、失焦或指针取消即清空，与选中互相独立。 */
    pressedValue: string | null
  }
  computed: Record<string, never>
  refs: {
    /** 标签集合的查询容器（list），同时是指示条定位的参照系。 */
    getListEl: () => HTMLElement | null
    /** 跟手的会话，整个生命周期存在。调用方在按下时把该指针传入。 */
    gesture: MultiPointerSession | null
    /**
     * 正在拖动换位的标签。activated 之前只是按住，还不是拖动：
     * 整个标签都是拖动源没有把手表明意图，需要移动够激活距离才视为拖动。
     */
    tabDrag: {
      value: string
      rects: DragRect[]
      origin: number
      activated: boolean
      /** 拖动源节点。拖动中用它测量版面整体移动的距离，见 snapshotDrift。 */
      source: HTMLElement | null
    } | null
  }
  state: 'idle'
  event:
    | { type: 'VALUE.SET', value: string | null }
    | { type: 'TRIGGER.SELECT', value: string }
    | { type: 'TRIGGER.FOCUS', value: string }
    | { type: 'TRIGGER.NAVIGATE', value: string }
    | { type: 'LIST.BLUR' }
    /** 按在标签上：矩形快照与起点坐标由连接层测量后传入。此时只是按住，不视为拖动。 */
    /**
     * 从专用的拖动把手开始：按下即拖动，不再等待激活距离。
     * 把手是不占 Tab 位的独立可触区域，意图无歧义，触屏路径也只经它。
     */
    | { type: 'TAB_DRAG.START', value: string, rects: DragRect[], origin: number, activate?: boolean, source: HTMLElement | null }
    | { type: 'TAB_DRAG.MOVE', point: number }
    | { type: 'TAB_DRAG.END' }
    | { type: 'TAB_DRAG.CANCEL' }
    /** 键盘换位：按一次即一次完整提交，不进入拖动态。 */
    | { type: 'TAB.MOVE_BY', value: string, target: DropTarget }
    /** 关闭一个标签：只发意图，库不修改标签序。 */
    | { type: 'TAB.CLOSE', value: string, values: string[] }
    /** trigger 被 Space / Enter 或触屏按住；disabled 是条目自身的禁用事实，由 connect 判定后随事件带入。 */
    | { type: 'PRESS.START', value: string, disabled?: boolean }
    /** 按住的 trigger 抬起、失焦或指针取消；只松开 value 对应的那一个。 */
    | { type: 'PRESS.END', value: string }
  tag: never
  guard: 'isAutomatic' | 'canPress'
  action:
    | 'setValue'
    | 'setFocusedValue'
    | 'clearFocusedValue'
    | 'startTabDrag'
    | 'trackTabDrag'
    | 'endTabDrag'
    | 'cancelTabDrag'
    | 'moveTabBy'
    | 'invokeOnTabClose'
    | 'measureIndicator'
    | 'startPress'
    | 'endPress'
  effect: 'trackPointer' | 'trackResize'
}

export interface TabsApi<T extends PropTypes = PropTypes> {
  value: string | null
  /** 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 */
  collection: readonly TabsNodeMeta[]
  /** 焦点在组外时为 null。 */
  focusedValue: string | null
  /** 当前的落点；松手即落在此处。未落在任何标签上时为 null。 */
  dropTarget: DropTarget | null
  /** 读屏播报文本。渲染进 live-region，不进入视觉版面。 */
  announcement: string
  /** 传 null 清空选中：context.value 与受控 value 都能表达无选中，写入侧同样接受。 */
  setValue: (next: string | null) => void
  getRootProps: () => T['element']
  getListProps: () => T['element']
  getTriggerProps: (props: TabsTriggerProps) => T['button']
  /** 选中标签下的滑条；位置由状态机测量后写为内联样式，没有选中项时 hidden。 */
  getIndicatorProps: () => T['element']
  /** 标签之间的细分隔线，纯装饰。 */
  getSeparatorProps: () => T['element']
  getContentProps: (props: TabsContentProps) => T['element']
  /**
   * 拖动过程的读屏播报区。视觉隐藏，文本取自 announcement。
   * 它必须在拖动开始之前就在 DOM 上：读屏不播报后插入的节点。
   */
  /**
   * 标签拖动把手。触屏路径唯一的入口，不占 Tab 位。
   *
   * 常驻即可：reorderable 关闭或该标签禁用时它声明 data-disabled、也不再让出滚动，
   * 渲染不会出错。按是否可拖动决定是否渲染，会使 DOM 结构随状态变化。
   */
  getTabDragTriggerProps: (props: TabsTriggerProps) => T['element']
  getLiveRegionProps: () => T['element']
}

/** 读屏文案，默认英文。拖动过程在视觉上很清楚，在读屏中全部依靠这些文案。 */
export interface TabsTranslations extends Partial<DragTranslations> {}

/** 标签换位：从哪一位移到哪一位，以及重排后的整份顺序。 */
export interface TabsMoveDetails {
  value: string
  from: number
  to: number
  /** 已重排的整份标签序，可直接写回数据源。 */
  values: string[]
}
