import type { Direction, Orientation, PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

/** 读屏用的文案，默认英文。 */
export interface AnchorTranslations {
  /** 根节点的 aria-label，用于区分页面上的多个 nav 地标。 */
  root: string
}

export interface AnchorValueChangeDetails {
  /** 当前激活的锚点 id；一个都没越过判定线时为 null。 */
  value: string | null
}

/**
 * 链接指向哪个区块，由作者在部件上声明。
 * connect 据此产出属性，不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface AnchorLinkProps {
  /** 目标区块的元素 id，href 由 connect 派生成 `#id`。 */
  value: string
}

/** 指示条相对 list 的位置与尺寸（px），起始缘按逻辑方向算。 */
export interface AnchorIndicatorRect {
  blockStart: number
  blockSize: number
  inlineStart: number
  inlineSize: number
}

/** 结算"当前是哪一节"的输入：一个目标区块量好的顶边位置。 */
export interface AnchorTargetOffset {
  /** 目标区块的元素 id。 */
  value: string
  /** 区块顶边相对判定原点（滚动容器视口顶边）的距离，可以为负。 */
  top: number
}

/** 适配器在挂载前填入的 DOM 取值口。 */
export interface AnchorRefs {
  /** 判定线所依附的滚动容器，返回 null 即挂在窗口上。 */
  getScrollEl: () => HTMLElement | null
  /** 链接集合的查询容器（list），同时是指示条定位的参照系。 */
  getListEl: () => HTMLElement | null
}

export interface AnchorSchema extends MachineSchema {
  props: {
    /** 当前激活的锚点 id，给定即受控。 */
    value?: string | null
    defaultValue?: string | null
    /** 目标区块的 id 清单，按文档序给；不给则按渲染出来的 link 现查。 */
    targets?: readonly string[]
    /** 判定线距滚动容器视口顶边的距离（px），默认 0。 */
    offset?: number
    /** 点链接时平滑滚动到目标，默认 false。 */
    smooth?: boolean
    /** 文字方向，作用于排版与指示条的起始缘。 */
    dir?: Direction
    /** 列表轴向，默认 vertical，只影响样式。 */
    orientation?: Orientation
    translations?: Partial<AnchorTranslations>
    /** value 变化意图回调。 */
    onValueChange?: (details: AnchorValueChangeDetails) => void
  }
  context: {
    /** 当前激活的锚点 id。 */
    value: string | null
    /** 指示条的量测结果；没有激活项或量不到时为 null。 */
    indicator: AnchorIndicatorRect | null
  }
  computed: Record<string, never>
  refs: AnchorRefs
  /** scrolling 是平滑滚动进行中的短暂锁，其间不采信观察器结果。 */
  state: 'idle' | 'scrolling'
  event:
    /** 观察器结算出的当前区块；null 表示一节都还没越过判定线。 */
    | { type: 'SPY.RESOLVE', value: string | null }
    /** 用户点了某条链接。 */
    | { type: 'LINK.CLICK', value: string }
    /** 程序化改写。 */
    | { type: 'VALUE.SET', value: string | null }
    /** 平滑滚动的兜底解锁。 */
    | { type: 'after.scrollLock' }
  tag: never
  guard: 'isSmooth' | 'isTargetReached'
  action: 'setValue' | 'scrollToTarget' | 'measureIndicator'
  effect: 'trackScroll' | 'waitForScrollLock'
}

export interface AnchorApi<T extends PropTypes = PropTypes> {
  /** 当前激活的锚点 id；一个都没越过判定线时为 null。 */
  value: string | null
  isActive: (value: string) => boolean
  setValue: (next: string | null) => void
  getRootProps: () => T['element']
  getListProps: () => T['element']
  getItemProps: () => T['element']
  getLinkProps: (props: AnchorLinkProps) => T['element']
  getIndicatorProps: () => T['element']
}
