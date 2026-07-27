import type { Orientation, PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

export interface CheckboxGroupValueChangeDetails {
  value: string[]
}

/**
 * 全选态：作者拿它去驱动一个 indeterminate 的父复选框。
 * - all  组内声明的条目全部选中
 * - some 选中了一部分（读屏侧对应 aria-checked="mixed"）
 * - none 一个都没选中
 */
export type CheckboxGroupCheckedState = 'all' | 'some' | 'none'

/**
 * 条目自报家门：值与禁用由作者在部件上声明，connect 据此产出属性。
 * connect 因此是 (context, 本条目声明) 的纯函数，不反查 DOM——
 * Vue 侧 connect 在 render 期求值（本帧 DOM 还不存在），WC 侧在 updated 后求值（DOM 已就位），
 * 连接期读 DOM 会让两个适配器的首帧快照分叉。
 */
export interface CheckboxGroupItemProps {
  value: string
  disabled?: boolean
}

export interface CheckboxGroupSchema extends MachineSchema {
  props: {
    /** 选中值集合。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 */
    value?: string[]
    defaultValue?: string[]
    /**
     * 组内全部条目的值，按书写顺序声明。
     *
     * 渲染期算不出这份集合：connect 不许读 DOM，而条目是作者写在子树里的节点，
     * 根部件的 props 里看不见它们。checkedState 要分得清 all 与 some 就必须有一份"全集"，
     * 所以让作者显式说出来。不给也能用，只是 checkedState 退化成 none / some 两态
     * ——trigger 的全选动作不依赖它（那一步在事件发生时现查活 DOM）。
     */
    itemValues?: string[]
    /** 整组禁用：每一项都跟着禁用，且隐藏输入不参与提交。 */
    disabled?: boolean
    /** 只读：仍可聚焦与朗读，但改不动。 */
    readOnly?: boolean
    /** 校验失败标注，落到每个条目的 aria-invalid 上。 */
    invalid?: boolean
    /** 表单字段名；给定后每个条目的隐藏输入才带 name，同名多值一并提交。 */
    name?: string
    /** 视觉排布，默认 vertical。只出 data-orientation，不出 aria-orientation。 */
    orientation?: Orientation
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: CheckboxGroupValueChangeDetails) => void
  }
  context: {
    /** 选中值。受控（value 给定）时 cell 直读 prop，写只发 onValueChange 不改内部值。 */
    value: string[]
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle'
  event:
    | { type: 'VALUE.SET', value: string[] }
    | { type: 'ITEM.TOGGLE', value: string }
    /** values 是事件发生那一刻现查到的可用条目值，机器自己不记账。 */
    | { type: 'ALL.TOGGLE', values: string[] }
  tag: never
  guard: 'editable'
  action: 'setValue' | 'toggleItem' | 'toggleAll'
  effect: never
}

export interface CheckboxGroupApi<T extends PropTypes = PropTypes> {
  value: string[]
  checkedState: CheckboxGroupCheckedState
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  isChecked: (value: string) => boolean
  /** 整体替换选中集合。程序化入口，不受 readOnly 拦截。 */
  setValue: (next: string[]) => void
  /** 翻转某个值；整组禁用或只读时无效。 */
  toggleValue: (value: string) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getItemProps: (props: CheckboxGroupItemProps) => T['element']
  getItemControlProps: (props: CheckboxGroupItemProps) => T['element']
  getItemTextProps: (props: CheckboxGroupItemProps) => T['element']
  /**
   * 条目的表单影子：一份视觉隐藏的原生 checkbox，由条目内部渲染。
   * 与其它条目 getter 一样按条目取值——name 全组共用，value/checked 逐条目不同，
   * 零参签名产不出这些差异。
   */
  getItemHiddenInputProps: (props: CheckboxGroupItemProps) => T['input']
  /** 全选/半选的父复选框。必须写在 root 之内，它靠祖先链找到本组。 */
  getTriggerProps: () => T['element']
}
