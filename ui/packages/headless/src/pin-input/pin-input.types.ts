import type { PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

/**
 * 每格接受的字符类别。同时决定两件事：
 * 过滤规则（不接受的字符直接丢弃，既不进值也不留在框里）与移动端弹哪种键盘。
 */
export type PinInputType = 'numeric' | 'alphanumeric' | 'alphabetic'

export interface PinInputValueChangeDetails {
  /** 逐格的值。长度恒等于 length，未填的格子是空串，每格至多一个字符。 */
  value: string[]
  /** 同一份值拼成的串；表单提交与"填满了没有"的判断都用它。 */
  valueAsString: string
}

/**
 * 格子自报家门：下标由作者在部件上声明，connect 据此产出属性。
 * connect 因此是 (context/prop, 本格声明) 的纯函数，不在连接期反查 DOM——
 * Vue 侧 connect 在 render 期求值（本帧 DOM 还不存在），WC 侧在 updated 后求值（DOM 已就位），
 * 连接期读 DOM 会让两个适配器的首帧快照分叉。
 */
export interface PinInputInputProps {
  index: number
}

export interface PinInputSchema extends MachineSchema {
  props: {
    /** 逐格的值。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 */
    value?: string[]
    defaultValue?: string[]
    /** 格数，默认 6。值的长度恒被归一到它。 */
    length?: number
    /** 接受的字符类别，默认 numeric。 */
    type?: PinInputType
    /** 遮蔽显示：输入框转 type=password。 */
    mask?: boolean
    /** 一次性验证码：补 autocomplete=one-time-code，短信验证码才能被系统自动填入。 */
    otp?: boolean
    /** 空格子的占位字符。 */
    placeholder?: string
    /** 禁用：每格都带原生 disabled（不可聚焦、不可输入），隐藏输入不参与提交。 */
    disabled?: boolean
    /** 校验失败标注。 */
    invalid?: boolean
    /** 填满即把焦点撤走，常用于"填满就自动提交"的表单。 */
    blurOnComplete?: boolean
    /** 表单字段名；给了隐藏输入才带 name，整串值随表单一并提交。 */
    name?: string
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: PinInputValueChangeDetails) => void
    /** 每格都填满的那一刻触发；值没真变时不重复触发。 */
    onValueComplete?: (details: PinInputValueChangeDetails) => void
  }
  context: {
    /** 逐格的值。受控（value 给定）时 cell 直读 prop。 */
    value: string[]
    /** 焦点所在格；焦点离开整组时为 -1。只服务 data-focus 标记，不参与值的计算。 */
    focusedIndex: number
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle'
  event:
    /** 整份替换（外部 setValue）。 */
    | { type: 'VALUE.SET', value: string[] }
    /** 从 index 起把 value 逐字符铺开，超出末格的部分截断。单字符输入与整串粘贴走同一条。 */
    | { type: 'VALUE.FILL', index: number, value: string }
    /** 清掉某一格。 */
    | { type: 'VALUE.CLEAR_AT', index: number }
    /** 清空整组。 */
    | { type: 'VALUE.CLEAR' }
    | { type: 'INPUT.FOCUS', index: number }
    | { type: 'INPUT.BLUR' }
  tag: never
  guard: 'canEdit'
  action: 'setValue' | 'fillValue' | 'clearValueAt' | 'clearValue' | 'setFocusedIndex' | 'clearFocusedIndex'
  effect: never
}

export interface PinInputApi<T extends PropTypes = PropTypes> {
  /** 逐格的值，长度恒等于 length。 */
  value: string[]
  valueAsString: string
  /** 每格都填满了。作者据此点亮提交按钮。 */
  complete: boolean
  length: number
  /** 焦点所在格；焦点在组外时为 -1。 */
  focusedIndex: number
  disabled: boolean
  invalid: boolean
  setValue: (next: string[]) => void
  clear: () => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getInputProps: (props: PinInputInputProps) => T['input']
  /** 整份验证码的表单出口：一份 type=hidden 的原生输入，随表单提交拼好的串。 */
  getHiddenInputProps: () => T['input']
}
