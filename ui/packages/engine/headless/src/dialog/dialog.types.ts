import type { PresenceHandle } from '@xihan-ui/behavior/presence'
import type { Cleanup, Layer, OverlayBackdropVariant, OverlayCloseReason, PropTypes, RuntimeConfig, Size } from '@xihan-ui/kernel'
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
  /**
   * 这一次是怎么关的；展开时不带。
   * 用它区分「用户主动取消」与「确认后收起」，前者常要回滚草稿。
   */
  reason?: OverlayCloseReason
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
    /** 展开后先聚焦到 content 内匹配此选择器的元素；选择器不匹配时回落默认聚焦顺序。 */
    initialFocus?: string
    /** 尺寸：sm / md / lg。只换 content 的最大宽度，落在 content 上（本组件没有 root 部件）。 */
    size?: Size
    /** 遮罩形态：opaque / blur / transparent。落在 backdrop 上，只换那一层的底色与模糊。 */
    variant?: OverlayBackdropVariant
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
