import type { ActionVariant, PropTypes, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

export interface TogglePressedChangeDetails {
  pressed: boolean
}

export interface ToggleSchema extends MachineSchema {
  props: {
    pressed?: boolean
    defaultPressed?: boolean
    disabled?: boolean
    /** 形态：solid / subtle / outline / ghost，决定颜色怎么用 */
    variant?: ActionVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 */
    tone?: Tone
    /** 尺寸：sm / md / lg */
    size?: Size
    /** pressed 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 */
    onPressedChange?: (details: TogglePressedChangeDetails) => void
  }
  context: Record<string, never>
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'off' | 'on'
  event:
    | { type: 'TOGGLE' }
    // 受控回写：宿主改 pressed 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.ON' }
    | { type: 'CONTROLLED.OFF' }
  tag: never
  guard: 'isPressedControlled'
  action: 'invokeOnPress' | 'invokeOnUnpress' | 'syncPressed'
  effect: never
}

export interface ToggleApi<T extends PropTypes = PropTypes> {
  pressed: boolean
  setPressed: (next: boolean) => void
  getRootProps: () => T['button']
}
