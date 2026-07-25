import type { PresenceHandle } from '@xihan-ui/behavior/presence'
import type { Layer, PropTypes, RuntimeConfig } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

export interface DialogTranslations {
  close: string
}

// 适配器在挂载前填入 DOM 环境与元素 getter；纯逻辑测试下保持缺省（副作用不挂）。
export interface DialogRefs {
  config: RuntimeConfig | null
  layer: Layer | null
  presence: PresenceHandle | null
  getContentEl: () => HTMLElement | null
  getTriggerEl: () => HTMLElement | null
  branches: () => Element[]
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
  }
  context: Record<string, never>
  computed: Record<string, never>
  refs: DialogRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'TOGGLE' }
    | { type: 'CLOSE', src?: 'esc' | 'close-trigger' | 'interact-outside' }
  tag: never
  guard: never
  action: never
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
