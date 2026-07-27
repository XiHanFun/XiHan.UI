import type { PresenceHandle } from '@xihan-ui/behavior/presence'
import type { Cleanup, Layer, PropTypes, RuntimeConfig } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

export interface DialogTranslations {
  close: string
}

// 适配器在挂载前填入 DOM 环境与元素 getter；纯逻辑测试下保持缺省（副作用不挂）。
export interface DialogRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  presence: PresenceHandle | null
  getContentEl: () => HTMLElement | null
  getTriggerEl: () => HTMLElement | null
  branches: () => Element[]
}

export interface DialogOpenChangeDetails {
  open: boolean
}

export interface DialogSchema extends MachineSchema {
  props: {
    open?: boolean
    defaultOpen?: boolean
    modal?: boolean
    role?: 'dialog' | 'alertdialog'
    closeOnEscape?: boolean
    closeOnInteractOutside?: boolean
    restoreFocus?: boolean
    translations?: Partial<DialogTranslations>
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: DialogOpenChangeDetails) => void
  }
  context: Record<string, never>
  computed: Record<string, never>
  refs: DialogRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'TOGGLE' }
    | { type: 'CLOSE', src?: 'esc' | 'close-trigger' | 'interact-outside' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
  tag: never
  guard: 'isOpenControlled'
  action: 'invokeOnOpen' | 'invokeOnClose' | 'syncOpen'
  effect: 'trackOverlay'
}

export interface DialogApi<T extends PropTypes = PropTypes> {
  open: boolean
  setOpen: (next: boolean) => void
  getTriggerProps: () => T['button']
  getBackdropProps: () => T['element']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getCloseTriggerProps: () => T['button']
}
