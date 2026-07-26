import type { Direction, Orientation, PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

export interface TabsValueChangeDetails {
  value: string | null
}

/** automatic：方向键移动焦点即切换选中；manual：焦点先走，Enter/Space 才切换。 */
export type TabsActivationMode = 'automatic' | 'manual'

/**
 * 条目自报家门：值与禁用由作者在部件上声明，connect 据此产出属性。
 * connect 因此是 (context, 本条目声明) 的纯函数，不反查 DOM——
 * Vue 侧 connect 在 render 期求值（本帧 DOM 还不存在），WC 侧在 updated 后求值（DOM 已就位），
 * 连接期读 DOM 会让两个适配器的首帧快照分叉。
 */
export interface TabsTriggerProps {
  value: string
  disabled?: boolean
}

export interface TabsContentProps {
  value: string
}

export interface TabsSchema extends MachineSchema {
  props: {
    /** 选中值。给定即受控：内部不再自改，只发 onValueChange。 */
    value?: string | null
    defaultValue?: string | null
    /** 方向键轴向，默认 horizontal；不同轴的方向键放行给页面滚动与读屏。 */
    orientation?: Orientation
    /** 文字方向，默认 ltr；只影响水平轴上 ArrowLeft/ArrowRight 的前后语义。 */
    dir?: Direction
    /** 方向键移动焦点时是否顺带切换选中，默认 automatic。 */
    activationMode?: TabsActivationMode
    /** 方向键走到尽头是否回绕，默认 true。 */
    loop?: boolean
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: TabsValueChangeDetails) => void
  }
  context: {
    /** 选中值。受控（value 给定）时 cell 直读 prop，写只发 onValueChange 不改内部值。 */
    value: string | null
    /** 焦点位于组内时的瞬态锚点，焦点离组即清空。 */
    focusedValue: string | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle'
  event:
    | { type: 'VALUE.SET', value: string | null }
    | { type: 'TRIGGER.SELECT', value: string }
    | { type: 'TRIGGER.FOCUS', value: string }
    | { type: 'TRIGGER.NAVIGATE', value: string }
    | { type: 'LIST.BLUR' }
  tag: never
  guard: 'isAutomatic'
  action: 'setValue' | 'setFocusedValue' | 'clearFocusedValue'
  effect: never
}

export interface TabsApi<T extends PropTypes = PropTypes> {
  value: string | null
  /** 焦点在组外时为 null。 */
  focusedValue: string | null
  /** 传 null 清空选中：context.value 与受控 value 都能表达"无选中"，写入侧同样收得下。 */
  setValue: (next: string | null) => void
  getRootProps: () => T['element']
  getListProps: () => T['element']
  getTriggerProps: (props: TabsTriggerProps) => T['button']
  getContentProps: (props: TabsContentProps) => T['element']
}
