import type { Direction, Orientation, PropTypes, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

export interface RadioGroupValueChangeDetails {
  value: string | null
}

/** 条目数据。给了 collection，显示文本与禁用就以它为准。 */
export interface RadioGroupNode {
  value: string
  /** 展示文本；缺省退回 value。 */
  label?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
}

/** 单个条目的元信息，由 collection 推出，不含选中态与焦点态。 */
export interface RadioGroupNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
}

/**
 * 条目声明：值必报，禁用可由 collection 代为声明。
 * connect 据此产出属性，不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface RadioGroupItemProps {
  value: string
  /** 逐条覆盖禁用；缺省时回 collection 里查，两处都没有即为不禁用。 */
  disabled?: boolean
}

export interface RadioGroupSchema extends MachineSchema {
  props: {
    /**
     * 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value。
     * 缺省即回到「文本与禁用都写在条目部件上」的老路。
     */
    collection?: RadioGroupNode[]
    value?: string | null
    defaultValue?: string | null
    disabled?: boolean
    orientation?: Orientation
    /** 文字方向，缺省 'ltr'。 */
    dir?: Direction
    /** 表单字段名。 */
    name?: string
    /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /** value 变化回调。 */
    onValueChange?: (details: RadioGroupValueChangeDetails) => void
  }
  context: {
    /** 选中值。 */
    value: string | null
    /** 焦点锚点，离组时为 null。 */
    focusedValue: string | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle'
  event:
    | { type: 'VALUE.SET', value: string }
    | { type: 'ITEM.SELECT', value: string }
    | { type: 'ITEM.FOCUS', value: string }
    | { type: 'GROUP.BLUR' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: never
  action: 'setValue' | 'setFocusedValue' | 'clearFocusedValue' | 'resetToDefault'
  effect: never
}

export interface RadioGroupApi<T extends PropTypes = PropTypes> {
  value: string | null
  /** collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 */
  collection: readonly RadioGroupNodeMeta[]
  /** 焦点在组外时为 null。 */
  focusedValue: string | null
  setValue: (next: string) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getItemProps: (props: RadioGroupItemProps) => T['element']
  getItemTextProps: (props: RadioGroupItemProps) => T['element']
  getIndicatorProps: (props: RadioGroupItemProps) => T['element']
  /** 条目对应的隐藏原生 radio 输入，用于表单提交。 */
  getHiddenInputProps: (props: RadioGroupItemProps) => T['input']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface RadioGroupTranslations {}
