import type { PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

export interface SwitchCheckedChangeDetails {
  checked: boolean
}

export interface SwitchSchema extends MachineSchema {
  props: {
    checked?: boolean
    defaultChecked?: boolean
    disabled?: boolean
    /** 语气：brand / neutral / success / warning / danger / info，决定选中态轨道用哪族颜色。 */
    tone?: string
    /** 尺寸：sm / md / lg，决定轨道与滑块的几何档位。 */
    size?: string
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
  tag: never
  guard: 'isCheckedControlled'
  action: 'invokeOnCheck' | 'invokeOnUncheck' | 'syncChecked'
  effect: never
}

export interface SwitchApi<T extends PropTypes = PropTypes> {
  checked: boolean
  setChecked: (next: boolean) => void
  getRootProps: () => T['button']
  getThumbProps: () => T['element']
}
