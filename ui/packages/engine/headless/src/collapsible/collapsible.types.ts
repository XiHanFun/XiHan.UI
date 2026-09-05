import type { Direction, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

export interface CollapsibleOpenChangeDetails {
  open: boolean
}

export interface CollapsibleSchema extends MachineSchema {
  props: {
    open?: boolean
    defaultOpen?: boolean
    disabled?: boolean
    /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /** 文字方向，只作用于排版；作者没给就不写。 */
    dir?: Direction
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
  getHeaderProps: () => T['element']
  getTriggerProps: () => T['button']
  getContentProps: () => T['element']
  getIndicatorProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface CollapsibleTranslations {}
