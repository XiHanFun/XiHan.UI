import type { PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

/** 侧栏挂在行首还是行尾。 */
export type LayoutSiderPlacement = 'start' | 'end'

export interface LayoutSiderCollapsedChangeDetails {
  collapsed: boolean
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
    /** 头吸顶：滚动时头钉在滚动容器的上沿。只落标记，钉住的实现归皮肤。 */
    headerFixed?: boolean
    /** 侧栏吸附：滚动时侧栏钉在滚动容器的上沿，头也吸顶时让开头那一条。只落标记，钉住的实现归皮肤。 */
    siderFixed?: boolean
    /** 在头、侧栏、脚与内容之间画分隔线。 */
    bordered?: boolean
    /** 折叠态变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 */
    onSiderCollapsedChange?: (details: LayoutSiderCollapsedChangeDetails) => void
  }
  context: Record<string, never>
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
  effect: never
}

export interface LayoutApi<T extends PropTypes = PropTypes> {
  /** 侧栏当前是否折叠。 */
  siderCollapsed: boolean
  setSiderCollapsed: (next: boolean) => void
  getRootProps: () => T['element']
  getHeaderProps: () => T['element']
  getSiderProps: () => T['element']
  getContentProps: () => T['element']
  getFooterProps: () => T['element']
  getSiderTriggerProps: () => T['button']
}
