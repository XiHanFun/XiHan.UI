import type { PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

export interface CheckboxCheckedChangeDetails {
  checked: boolean
}

export interface CheckboxSchema extends MachineSchema {
  props: {
    checked?: boolean
    defaultChecked?: boolean
    disabled?: boolean
    /** checked 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 */
    onCheckedChange?: (details: CheckboxCheckedChangeDetails) => void
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
  tag: never
  guard: 'isCheckedControlled'
  action: 'invokeOnCheck' | 'invokeOnUncheck' | 'syncChecked'
  effect: never
}

export interface CheckboxApi<T extends PropTypes = PropTypes> {
  checked: boolean
  setChecked: (next: boolean) => void
  getRootProps: () => T['button']
  getIndicatorProps: () => T['element']
}
