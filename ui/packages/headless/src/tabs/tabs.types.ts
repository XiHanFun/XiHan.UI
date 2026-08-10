import type { Direction, Orientation, PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

export interface TabsValueChangeDetails {
  value: string | null
}

/** automatic：方向键移动焦点即切换选中；manual：焦点先走，Enter/Space 才切换。 */
export type TabsActivationMode = 'automatic' | 'manual'

/** 条目数据。给了 collection，标签文本与禁用就以它为准。 */
export interface TabsNode {
  value: string
  /** 标签上的文本；缺省退回 value。 */
  label?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
}

/** 单个条目的元信息，由 collection 推出，不含选中态与焦点态。 */
export interface TabsNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
}

/**
 * 条目自报家门：值必报，禁用可由 collection 代为声明。
 * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得反查 DOM。
 */
export interface TabsTriggerProps {
  value: string
  /** 逐条覆盖禁用；缺省时回 collection 里查，两处都没有即为不禁用。 */
  disabled?: boolean
}

export interface TabsContentProps {
  value: string
}

export interface TabsSchema extends MachineSchema {
  props: {
    /**
     * 条目数据，标签文本与禁用的事实源。给了它，trigger 部件只需报 value。
     * 缺省即回到「文本与禁用都写在 trigger 上」的老路。
     */
    collection?: TabsNode[]
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
    /** 形态：line / card / segment，决定选中态怎么画。缺省是 line。 */
    variant?: string
    /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 */
    tone?: string
    /** 尺寸：sm / md / lg。 */
    size?: string
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
  /** collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 */
  collection: readonly TabsNodeMeta[]
  /** 焦点在组外时为 null。 */
  focusedValue: string | null
  /** 传 null 清空选中：context.value 与受控 value 都能表达"无选中"，写入侧同样收得下。 */
  setValue: (next: string | null) => void
  getRootProps: () => T['element']
  getListProps: () => T['element']
  getTriggerProps: (props: TabsTriggerProps) => T['button']
  getContentProps: (props: TabsContentProps) => T['element']
}
