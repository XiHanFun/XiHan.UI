import type { PropTypes, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/**
 * 三态。半选是「由外部数据算出来的显示态」，不是用户能切进去的态——
 * 一组子项勾了一部分时父项显示半选，而点它只会走向全选或全不选。
 */
export type CheckboxCheckedState = boolean | 'indeterminate'

export interface CheckboxCheckedChangeDetails {
  /** 用户交互的落点只可能是全选或全不选，半选不在其中。 */
  checked: boolean
}

export interface CheckboxSchema extends MachineSchema {
  props: {
    checked?: CheckboxCheckedState
    defaultChecked?: CheckboxCheckedState
    disabled?: boolean
    /** 表单字段名；给了 hidden-input 才带 name 并参与提交。 */
    name?: string
    /** 提交出去的值，缺省 'on'，与原生复选框一致。 */
    value?: string
    /** 语气：brand / neutral / success / warning / danger / info，决定选中态用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定方框边长与勾的字号档位。 */
    size?: Size
    /** checked 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 */
    onCheckedChange?: (details: CheckboxCheckedChangeDetails) => void
  }
  context: Record<string, never>
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'off' | 'on' | 'indeterminate'
  event:
    // 点击那一路：off → on、on → off，半选按 APG 的父项约定一律走向全选
    | { type: 'TOGGLE' }
    // 命令式设值：setChecked 走这两条，避免半选态下 TOGGLE 表达不了「设为全不选」
    | { type: 'CHECK' }
    | { type: 'UNCHECK' }
    // 受控回写：宿主改 checked 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.ON' }
    | { type: 'CONTROLLED.OFF' }
    | { type: 'CONTROLLED.INDETERMINATE' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'isCheckedControlled' | 'defaultsToChecked' | 'defaultsToIndeterminate'
  action: 'invokeOnCheck' | 'invokeOnUncheck' | 'syncChecked' | 'invokeReset'
  effect: never
}

export interface CheckboxApi<T extends PropTypes = PropTypes> {
  checked: CheckboxCheckedState
  /** 半选只能由 checked prop 给出，这里只接受全选 / 全不选。 */
  setChecked: (next: boolean) => void
  getRootProps: () => T['button']
  getIndicatorProps: () => T['element']
  /** 表单影子：勾上才提交，半选按未勾处理。给了 name 才带 name。 */
  getHiddenInputProps: () => T['input']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface CheckboxTranslations {}
