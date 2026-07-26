import type { Direction, Orientation, PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

export interface RadioGroupValueChangeDetails {
  value: string | null
}

/**
 * 条目自报家门：值与禁用由作者在部件上声明，connect 据此产出属性。
 * connect 因此是 (context, 本条目声明) 的纯函数，不反查 DOM——
 * Vue 侧 connect 在 render 期求值（本帧 DOM 还不存在），WC 侧在 updated 后求值（DOM 已就位），
 * 连接期读 DOM 会让两个适配器的首帧快照分叉。
 */
export interface RadioGroupItemProps {
  value: string
  disabled?: boolean
}

export interface RadioGroupSchema extends MachineSchema {
  props: {
    value?: string | null
    defaultValue?: string | null
    disabled?: boolean
    orientation?: Orientation
    /**
     * 文字方向，缺省 'ltr'。只改写左右方向键的语义（rtl 下 ArrowLeft 走下一项），
     * 上下方向键与之无关。
     */
    dir?: Direction
    /** 表单字段名。给定后隐藏输入才带 name，整组的值随表单一并提交。 */
    name?: string
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: RadioGroupValueChangeDetails) => void
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
    | { type: 'VALUE.SET', value: string }
    | { type: 'ITEM.SELECT', value: string }
    | { type: 'ITEM.FOCUS', value: string }
    | { type: 'GROUP.BLUR' }
  tag: never
  guard: never
  action: 'setValue' | 'setFocusedValue' | 'clearFocusedValue'
  effect: never
}

export interface RadioGroupApi<T extends PropTypes = PropTypes> {
  value: string | null
  /** 焦点在组外时为 null。 */
  focusedValue: string | null
  setValue: (next: string) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getItemProps: (props: RadioGroupItemProps) => T['element']
  getItemTextProps: (props: RadioGroupItemProps) => T['element']
  getIndicatorProps: (props: RadioGroupItemProps) => T['element']
  /**
   * 条目的表单影子：一份视觉隐藏的原生 radio 输入，由条目内部渲染。
   * 与其它条目 getter 一样按条目取值——name 全组共用，value/checked 逐条目不同，
   * 零参签名产不出这些差异。
   */
  getHiddenInputProps: (props: RadioGroupItemProps) => T['input']
}
