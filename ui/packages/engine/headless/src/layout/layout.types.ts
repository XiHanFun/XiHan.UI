import type { MachineSchema, PropTypes } from '@xihan-ui/core'

/** 侧栏挂在行首还是行尾。 */
export type LayoutSiderPlacement = 'start' | 'end'

/** 断点档位名，与栅格、瀑布流同一套，逐字对应断点令牌。 */
export type LayoutBreakpoint = 'sm' | 'md' | 'lg' | 'xl'

/** 侧栏的呈现形态：inline 在骨架里占一列；sheet 移出画外、展开时盖在内容之上。 */
export type LayoutSiderPresentation = 'inline' | 'sheet'

export interface LayoutSiderCollapsedChangeDetails {
  collapsed: boolean
}

export interface LayoutSiderBreakpointDetails {
  /** 视口宽度是否已达到 siderBreakpoint 那一档；为假即窄屏，侧栏已按折叠宽显示。 */
  matched: boolean
}

export interface LayoutSchema extends MachineSchema {
  props: {
    /** 受控折叠态：给了值就由宿主说了算。 */
    siderCollapsed?: boolean
    /** 非受控初始折叠态。 */
    defaultSiderCollapsed?: boolean
    /** 展开时侧栏的宽度，任意 CSS 长度；不写则用皮肤里的档位。 */
    siderWidth?: string
    /** 折叠时侧栏的宽度，任意 CSS 长度；不写则用皮肤里的档位。 */
    siderCollapsedWidth?: string
    /** 侧栏挂在行首还是行尾，缺省 start。 */
    siderPlacement?: LayoutSiderPlacement
    /**
     * 侧栏的自适应断点：视口窄于这一档时侧栏按折叠宽显示。
     * 只换宽度不改折叠态——折叠态归 siderCollapsed 那条通道，两者互不干扰。
     */
    siderBreakpoint?: LayoutBreakpoint
    /**
     * 侧栏呈现形态，缺省 inline（在骨架里占一列）。
     *
     * sheet 是覆盖档：侧栏移出画外，展开时盖在内容之上并铺一层遮罩，内容因此占满整宽。
     * 同时写了 siderBreakpoint 时它只在未达那一档时成立——宽屏照旧占一列，窄屏才覆盖，
     * 且跨档时侧栏跟着开合（进覆盖档收起、回占位档展开），走的是 siderCollapsed 那条通道。
     *
     * 覆盖档不锁焦点、不把背后的内容标成惰性：它是骨架里的一段，不是模态浮层。
     */
    siderPresentation?: LayoutSiderPresentation
    /** 头吸顶：滚动时头钉在滚动容器的上沿。只落标记，钉住的实现归皮肤。 */
    headerFixed?: boolean
    /** 侧栏吸附：滚动时侧栏钉在滚动容器的上沿，头也吸顶时让开头那一条。只落标记，钉住的实现归皮肤。 */
    siderFixed?: boolean
    /** 在头、侧栏、脚与内容之间画分隔线。 */
    bordered?: boolean
    /** 折叠态变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 */
    onSiderCollapsedChange?: (details: LayoutSiderCollapsedChangeDetails) => void
    /**
     * 断点跨过去时发一次，挂载时也发一次当前值。
     * 窄屏要把侧栏换成抽屉的，接这条：组件自己只换宽度。
     */
    onSiderBreakpoint?: (details: LayoutSiderBreakpointDetails) => void
  }
  context: {
    /** 视口是否窄于 siderBreakpoint 那一档；没写断点时恒为 false。 */
    siderNarrow: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'expanded' | 'collapsed'
  event:
    | { type: 'SIDER.COLLAPSE' }
    | { type: 'SIDER.EXPAND' }
    | { type: 'SIDER.TOGGLE' }
    // 受控回写：宿主改 siderCollapsed 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.COLLAPSE' }
    | { type: 'CONTROLLED.EXPAND' }
  tag: never
  guard: 'isSiderCollapsedControlled'
  action: 'invokeOnCollapse' | 'invokeOnExpand' | 'syncSiderCollapsed'
  effect: 'trackSiderBreakpoint' | 'dismissSiderSheet'
}

export interface LayoutApi<T extends PropTypes = PropTypes> {
  /** 侧栏当前是否折叠。 */
  siderCollapsed: boolean
  /** 已解析的侧栏呈现形态：写了断点时，覆盖档只在未达那一档时成立。 */
  siderPresentation: LayoutSiderPresentation
  setSiderCollapsed: (next: boolean) => void
  getRootProps: () => T['element']
  getHeaderProps: () => T['element']
  /**
   * 覆盖档铺在内容之上的那一层遮罩：点它收起侧栏。
   * 占位档下它带 hidden，不占位也不吃指针。渲染时排在侧栏之前——两层同一个层号，谁盖谁看文档序。
   */
  getSiderBackdropProps: () => T['element']
  getSiderProps: () => T['element']
  getContentProps: () => T['element']
  getFooterProps: () => T['element']
  getSiderTriggerProps: () => T['button']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface LayoutTranslations {}
