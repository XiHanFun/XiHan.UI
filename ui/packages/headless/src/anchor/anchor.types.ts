import type { Direction, Orientation, PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

/** 读屏用的文案。默认英文，与 breadcrumb / pagination 的 translations 同一套写法。 */
export interface AnchorTranslations {
  /**
   * 根节点的 aria-label。
   * 一页上常同时有多个 nav 地标（主导航、面包屑、页内目录），不给名字读屏念出来全是"导航"，
   * 用户分不出跳到了哪一个。
   */
  root: string
}

export interface AnchorValueChangeDetails {
  /** 当前激活的锚点 id；一个都没越过判定线时为 null。 */
  value: string | null
}

/**
 * 链接自报家门：指向哪个区块由作者在部件上声明，connect 据此产出属性。
 * connect 因此是 (context/prop, 本部件声明) 的纯函数，不反查 DOM——
 * Vue 侧 connect 在 render 期求值（本帧 DOM 还不存在），WC 侧在 updated 后求值（DOM 已就位），
 * 连接期读 DOM 会让两个适配器的首帧快照分叉。
 */
export interface AnchorLinkProps {
  /** 目标区块的元素 id。href 由 connect 按它派生成 `#id`，作者不必再写一遍。 */
  value: string
}

/**
 * 指示条相对 list 的位置与尺寸（px）。由机器在 DOM 里量好写进 context，
 * connect 只读它并铺成内联样式——量 DOM 不能发生在连接期。
 *
 * 起始缘按逻辑方向算（RTL 下从右边缘量起），指示条因此不会在 RTL 下跑到列的另一侧。
 */
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

/**
 * 适配器在挂载前填入 DOM 侧的取值口；纯逻辑测试与 SSR 下保持缺省，
 * 此时副作用照常挂载，只是量不到东西（状态转移不受影响）。
 */
export interface AnchorRefs {
  /**
   * 判定线所依附的滚动容器。返回 null 即挂在窗口上（整页滚动的常规情形）。
   * 内容区自带滚动条的布局要把那个容器交进来，否则滚动事件根本传不到窗口上。
   */
  getScrollEl: () => HTMLElement | null
  /** 链接集合的查询容器（list），同时是指示条定位的参照系。 */
  getListEl: () => HTMLElement | null
}

export interface AnchorSchema extends MachineSchema {
  props: {
    /**
     * 当前激活的锚点 id。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。
     * 观察器算出的结果同样走这条路——受控时它也只是"意图"。
     */
    value?: string | null
    defaultValue?: string | null
    /**
     * 目标区块的 id 清单，按文档序给。
     * 不给就按渲染出来的 link 自己算：目录本来就是照着区块写的，
     * 让作者把同一份 id 再抄一遍只会抄漏。
     */
    targets?: readonly string[]
    /**
     * 判定线距滚动容器视口顶边的距离（px），默认 0。
     * 页面顶部压着吸顶导航栏时要把它设成导航栏的高度，否则区块刚滑到栏底下就被判成"当前"。
     */
    offset?: number
    /** 点链接时平滑滚动到目标，默认 false（走原生的瞬时跳转）。 */
    smooth?: boolean
    /** 文字方向。只作用于排版与指示条的起始缘；作者没给就不写。 */
    dir?: Direction
    /** 列表轴向，默认 vertical。只影响样式，不改键盘行为（锚点导航不接管方向键）。 */
    orientation?: Orientation
    translations?: Partial<AnchorTranslations>
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: AnchorValueChangeDetails) => void
  }
  context: {
    /** 当前激活的锚点 id。受控（value 给定）时 cell 直读 prop。 */
    value: string | null
    /** 指示条的量测结果；没有激活项或量不到时为 null。 */
    indicator: AnchorIndicatorRect | null
  }
  computed: Record<string, never>
  refs: AnchorRefs
  /**
   * scrolling 是平滑滚动进行中的短暂锁：这段路上观察器会连着扫过好几节，
   * 采信它就会把用户刚点的那条冲掉（高亮一路乱跳到目标才停）。
   */
  state: 'idle' | 'scrolling'
  event:
    /** 观察器结算出的当前区块；null 表示一节都还没越过判定线。 */
    | { type: 'SPY.RESOLVE', value: string | null }
    /** 用户点了某条链接：当场切过去，不等观察器。 */
    | { type: 'LINK.CLICK', value: string }
    /** 程序化改写。 */
    | { type: 'VALUE.SET', value: string | null }
    /** 平滑滚动的兜底解锁：浏览器不保证一定滚得到（目标被删、容器到底了）。 */
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
