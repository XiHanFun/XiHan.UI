import type { PropTypes, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

export interface SwitchCheckedChangeDetails {
  checked: boolean
}

export interface SwitchSchema extends MachineSchema {
  props: {
    checked?: boolean
    defaultChecked?: boolean
    disabled?: boolean
    /** 提交中：交互挂起、滑块转圈，但不呈现为禁用（仍可聚焦、对比度不降）。 */
    loading?: boolean
    /** 表单字段名；给了 hidden-input 才带 name 并参与提交。 */
    name?: string
    /** 提交出去的值，缺省 'on'，与原生复选框一致。 */
    value?: string
    /** 语气：brand / neutral / success / warning / danger / info，决定选中态轨道用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定轨道与滑块的几何档位。 */
    size?: Size
    /** checked 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 */
    onCheckedChange?: (details: SwitchCheckedChangeDetails) => void
  }
  context: Record<string, never>
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'off' | 'on'
  event:
    | { type: 'TOGGLE' }
    // 受控回写：宿主改 checked 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.ON' }
    | { type: 'CONTROLLED.OFF' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'isCheckedControlled' | 'defaultsToChecked'
  action: 'invokeOnCheck' | 'invokeOnUncheck' | 'syncChecked' | 'invokeReset'
  effect: never
}

export interface SwitchApi<T extends PropTypes = PropTypes> {
  checked: boolean
  /** 提交中。 */
  loading: boolean
  setChecked: (next: boolean) => void
  getRootProps: () => T['button']
  getThumbProps: () => T['element']
  /** 表单影子：勾上才提交。给了 name 才带 name，不给就不参与提交。 */
  getHiddenInputProps: () => T['input']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface SwitchTranslations {}
