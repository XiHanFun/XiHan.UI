import type { Direction, Orientation, PropTypes, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/** 读屏用的文案，默认英文。 */
export interface NavigationMenuTranslations {
  /** 根节点的 aria-label，用于区分同页的多个 nav 地标。 */
  root: string
}

export interface NavigationMenuValueChangeDetails {
  /** 当前展开的那一项；都收起时为 null。 */
  value: string | null
}

/** 入口数据。给了 collection，入口文本、禁用与直达去处就以它为准。 */
export interface NavigationMenuNode {
  value: string
  /** 入口文本；缺省退回 value。 */
  label?: string
  /** 入口禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
  /** 直达去处。给了它这一项就是一条链接，没有面板。 */
  href?: string
  /** 指向当前页面的直达入口：输出 aria-current="page"。 */
  current?: boolean
}

/** 单个入口的元信息，由 collection 推出，不含展开态。 */
export interface NavigationMenuNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
  /** 直达去处；缺省即这一项带面板。 */
  href?: string
  current: boolean
}

/**
 * 触发器属性：身份必报，禁用可由 collection 代为声明。
 * connect 据此产出属性，不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface NavigationMenuTriggerProps {
  value: string
  /** 逐条覆盖禁用；缺省时回 collection 里查，两处都没有即为不禁用。 */
  disabled?: boolean
}

export interface NavigationMenuContentProps {
  /** 与同一项的 trigger 靠该值配对。 */
  value: string
}

export interface NavigationMenuLinkProps {
  /** 指向当前页面的那一条：输出 aria-current="page"。 */
  current?: boolean
}

/** 指示条相对 list 的位置与尺寸（px）；起始缘按逻辑方向算，RTL 从右边缘量起。 */
export interface NavigationMenuIndicatorRect {
  blockStart: number
  blockSize: number
  inlineStart: number
  inlineSize: number
}

/** 适配器在挂载前填入 DOM 侧的取值口，缺省时量不到指示条的位置。 */
export interface NavigationMenuRefs {
  /** trigger 集合的查询容器，同时是指示条定位的参照系。 */
  getListEl: () => HTMLElement | null
}

export interface NavigationMenuSchema extends MachineSchema {
  props: {
    /**
     * 入口数据，入口文本与禁用的事实源。给了它，trigger 部件只需报 value。
     * 缺省即回到「文本与禁用都写在部件上」的老路。
     */
    collection?: NavigationMenuNode[]
    /** 当前展开项，给定即受控；null 表示都收起。 */
    value?: string | null
    defaultValue?: string | null
    /** 方向键轴向，默认 horizontal。 */
    orientation?: Orientation
    /** 悬停/聚焦到 trigger 后等多久才展开，默认 200ms。 */
    delayDuration?: number
    /** 收起之后的静默窗口，默认 300ms；窗口内再碰任意 trigger 直接展开。 */
    skipDelayDuration?: number
    /** 文字方向，默认 ltr。 */
    dir?: Direction
    /** 方向键走到尽头是否回绕，默认 true。 */
    loop?: boolean
    translations?: Partial<NavigationMenuTranslations>
    /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /** value 变化回调。 */
    onValueChange?: (details: NavigationMenuValueChangeDetails) => void
  }
  context: {
    /** 当前展开项，受控时 cell 直读 prop。 */
    value: string | null
    /** 等待展开的那一项，延时跑完才落到 value 上。 */
    pendingValue: string | null
    /** 最近一次由悬停/聚焦自动展开的项，用于判定紧随其后的激活是保持展开还是收起。 */
    autoValue: string | null
    /** 指示条的量测结果；都收起或量不到时为 null。 */
    indicator: NavigationMenuIndicatorRect | null
  }
  computed: Record<string, never>
  refs: NavigationMenuRefs
  /**
   * 三个状态只管计时，展开与否看 context.value：
   * - idle 没有计时器在跑
   * - opening 展开延时进行中，落点记在 pendingValue 上
   * - skipping 刚收起，静默窗口进行中
   */
  state: 'idle' | 'opening' | 'skipping'
  event:
    /** 指针进入某个 trigger。 */
    | { type: 'TRIGGER.POINTER', value: string }
    /** 某个 trigger 获得焦点；静默窗口内不认这一路。 */
    | { type: 'TRIGGER.FOCUS', value: string }
    /** 显式激活：点击、Enter、Space。不走延时。 */
    | { type: 'TRIGGER.TOGGLE', value: string }
    /** 收起：指针离开整个导航、Escape、焦点离场、选中面板里的链接。 */
    | { type: 'DISMISS' }
    /** 程序化改写。 */
    | { type: 'VALUE.SET', value: string | null }
    // 定时器到点，名称与对应的 delay prop 同名
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
  /** collection 推出的入口元信息，按数据顺序排列；没给 collection 即空数组。 */
  collection: readonly NavigationMenuNodeMeta[]
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
