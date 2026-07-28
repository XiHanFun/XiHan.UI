import type { Direction, Orientation, PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

/** 读屏用的文案。默认英文，与 breadcrumb / anchor 的 translations 同一套写法。 */
export interface NavigationMenuTranslations {
  /**
   * 根节点的 aria-label。
   * 一页上常同时有多个 nav 地标（站点导航、面包屑、页内目录），不给名字读屏念出来全是"导航"，
   * 用户分不出跳到了哪一个。
   */
  root: string
}

export interface NavigationMenuValueChangeDetails {
  /** 当前展开的那一项；都收起时为 null。 */
  value: string | null
}

/**
 * 部件自报家门：身份与禁用由作者在部件上声明，connect 据此产出属性。
 * connect 因此是 (state/context/prop, 本部件声明) 的纯函数，不反查 DOM——
 * Vue 侧 connect 在 render 期求值（本帧 DOM 还不存在），WC 侧在 updated 后求值（DOM 已就位），
 * 连接期读 DOM 会让两个适配器的首帧快照分叉。
 */
export interface NavigationMenuTriggerProps {
  value: string
  disabled?: boolean
}

export interface NavigationMenuContentProps {
  /** 与同一项的 trigger 配对；两者靠这一个值互相认领。 */
  value: string
}

export interface NavigationMenuLinkProps {
  /** 指向当前页面的那一条：输出 aria-current="page"。 */
  current?: boolean
}

/**
 * 指示条相对 list 的位置与尺寸（px）。由机器在 DOM 里量好写进 context，
 * connect 只读它并铺成内联样式——量 DOM 不能发生在连接期。
 *
 * 起始缘按逻辑方向算（RTL 下从右边缘量起），指示条因此不会在 RTL 下跑到另一头。
 */
export interface NavigationMenuIndicatorRect {
  blockStart: number
  blockSize: number
  inlineStart: number
  inlineSize: number
}

/**
 * 适配器在挂载前填入 DOM 侧的取值口；纯逻辑测试与 SSR 下保持缺省，
 * 此时状态照常转移，只是量不到指示条的位置。
 */
export interface NavigationMenuRefs {
  /** trigger 集合的查询容器，同时是指示条定位的参照系。 */
  getListEl: () => HTMLElement | null
}

export interface NavigationMenuSchema extends MachineSchema {
  props: {
    /**
     * 当前展开的那一项。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。
     * null 表示都收起。
     */
    value?: string | null
    defaultValue?: string | null
    /** 方向键轴向，默认 horizontal；不同轴的方向键放行给页面滚动与读屏。 */
    orientation?: Orientation
    /**
     * 悬停/聚焦到 trigger 后等多久才展开，默认 200ms。
     * 防的是指针横穿整条导航栏时一路闪出四五个面板。
     */
    delayDuration?: number
    /**
     * 收起之后的静默窗口，默认 300ms。窗口内再碰任意 trigger 直接展开、不再等延时——
     * 用户已经在这套导航里了，让他每换一项都重等一遍延时是折磨。
     */
    skipDelayDuration?: number
    /** 文字方向，默认 ltr；只影响水平轴上 ArrowLeft/ArrowRight 的前后语义。 */
    dir?: Direction
    /** 方向键走到尽头是否回绕，默认 true。 */
    loop?: boolean
    translations?: Partial<NavigationMenuTranslations>
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: NavigationMenuValueChangeDetails) => void
  }
  context: {
    /** 当前展开的那一项。受控（value 给定）时 cell 直读 prop。 */
    value: string | null
    /** 等待展开的那一项：延时跑完才落到 value 上。 */
    pendingValue: string | null
    /**
     * 最近一次被"自动"展开（悬停或聚焦，而非显式激活）的那一项；没有就是 null。
     * 自动弹出来的面板，紧接着的那一下 Enter / 点击不该把它收起——
     * 用户的意思是"我要用它"，不是"我要关掉它"。
     *
     * 记的是值而不是一个布尔标记：受控时 value 直读宿主 prop，宿主还没写回来之前
     * 它仍是旧值，拿它去认领"刚自动展开的是哪一项"必然认错，那一下激活于是被当成
     * 换项，同一个意图会连发两遍。这个 cell 不受控，任何时候都记得住真正的落点。
     */
    autoValue: string | null
    /** 指示条的量测结果；都收起或量不到时为 null。 */
    indicator: NavigationMenuIndicatorRect | null
  }
  computed: Record<string, never>
  refs: NavigationMenuRefs
  /**
   * 三个状态只管计时，展开与否一律看 context.value：
   * - idle 没有计时器在跑（此时 value 可能有也可能没有）
   * - opening 展开延时进行中，落点记在 pendingValue 上
   * - skipping 刚收起，静默窗口进行中
   */
  state: 'idle' | 'opening' | 'skipping'
  event:
    /** 指针进入某个 trigger。 */
    | { type: 'TRIGGER.POINTER', value: string }
    /** 某个 trigger 获得焦点。与指针分开：静默窗口里这两者的待遇不一样。 */
    | { type: 'TRIGGER.FOCUS', value: string }
    /** 显式激活：点击、Enter、Space。不走延时。 */
    | { type: 'TRIGGER.TOGGLE', value: string }
    /** 收起：指针离开整个导航、Escape、焦点离场、选中面板里的链接。 */
    | { type: 'DISMISS' }
    /** 程序化改写。 */
    | { type: 'VALUE.SET', value: string | null }
    // 定时器到点：名称与对应的 delay prop 同名
    | { type: 'after.delayDuration' }
    | { type: 'after.skipDelayDuration' }
  tag: never
  guard: 'hasValue' | 'isCurrent' | 'shouldKeepOpen'
  action:
    | 'setValue'
    | 'clearValue'
    | 'setPendingValue'
    | 'commitPendingValue'
    | 'clearPendingValue'
    | 'clearAutoValue'
    | 'measureIndicator'
  effect: 'waitForOpenDelay' | 'waitForSkipDelay' | 'trackResize'
}

export interface NavigationMenuApi<T extends PropTypes = PropTypes> {
  /** 当前展开的那一项；都收起时为 null。 */
  value: string | null
  /** 有没有面板展开着。 */
  open: boolean
  isOpen: (value: string) => boolean
  setValue: (next: string | null) => void
  getRootProps: () => T['element']
  getListProps: () => T['element']
  getItemProps: () => T['element']
  getTriggerProps: (props: NavigationMenuTriggerProps) => T['button']
  getContentProps: (props: NavigationMenuContentProps) => T['element']
  getLinkProps: (props: NavigationMenuLinkProps) => T['element']
  getIndicatorProps: () => T['element']
  getViewportProps: () => T['element']
}
