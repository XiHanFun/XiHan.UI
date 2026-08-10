import type { PropTypes } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

export interface CollapsibleOpenChangeDetails {
  open: boolean
}

export interface CollapsibleSchema extends MachineSchema {
  props: {
    open?: boolean
    defaultOpen?: boolean
    disabled?: boolean
    /** 尺寸：sm / md / lg。 */
    size?: string
    /** open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 */
    onOpenChange?: (details: CollapsibleOpenChangeDetails) => void
  }
  context: Record<string, never>
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'CLOSE' }
    | { type: 'TOGGLE' }
    // 受控回写：宿主改 open 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
  tag: never
  guard: 'isOpenControlled'
  action: 'invokeOnOpen' | 'invokeOnClose' | 'syncOpen'
  effect: never
}

export interface CollapsibleApi<T extends PropTypes = PropTypes> {
  open: boolean
  setOpen: (next: boolean) => void
  getRootProps: () => T['element']
  getTriggerProps: () => T['button']
  getContentProps: () => T['element']
}
