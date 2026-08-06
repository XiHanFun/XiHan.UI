import type { PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

/** 提示的语气。决定读屏的打断级别与皮肤配色。 */
export type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

export interface AlertOpenChangeDetails {
  open: boolean
}

/** 读屏用的文案。默认英文，与 dialog / toast 的 translations 同一套写法。 */
export interface AlertTranslations {
  close: string
}

export interface AlertSchema extends MachineSchema {
  props: {
    /** 语气，默认 info。danger / warning 走 role="alert"，其余走 role="status"。 */
    variant?: AlertVariant
    /** 关闭按钮是否可用，默认 true。false 时该按钮同时被禁用与收起。 */
    closable?: boolean
    /** 受控显隐；缺省该 prop 即非受控。 */
    open?: boolean
    /** 非受控初始显隐，默认显示。 */
    defaultOpen?: boolean
    /** open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 */
    onOpenChange?: (details: AlertOpenChangeDetails) => void
    translations?: Partial<AlertTranslations>
  }
  context: Record<string, never>
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'CLOSE' }
    // 受控回写：宿主改 open 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
  tag: never
  guard: 'isOpenControlled'
  action: 'invokeOnOpen' | 'invokeOnClose' | 'syncOpen'
  effect: never
}

export interface AlertApi<T extends PropTypes = PropTypes> {
  open: boolean
  variant: AlertVariant
  closable: boolean
  setOpen: (next: boolean) => void
  getRootProps: () => T['element']
  getIconProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getCloseTriggerProps: () => T['button']
}
