import type { ActionVariant, Size, Tone } from '@xihan-ui/core'
import type {
  FloatButtonApi,
  FloatButtonExpandTrigger,
  FloatButtonPlacement,
  FloatButtonProps,
  FloatButtonShape,
  FloatButtonTranslations,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { FloatButtonProvider, useFloatButtonContext } from './context'
import { useFloatButton } from './use-float-button'

/** 函数式 children 的载荷：展开的那一组此刻露不露面，以及改写展开状态的动作。 */
export interface FloatButtonRootSlotProps extends Pick<FloatButtonApi, 'open' | 'setOpen'> {}

export interface XhFloatButtonRootProps {
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  placement?: FloatButtonPlacement
  offset?: number
  shape?: FloatButtonShape
  expandTrigger?: FloatButtonExpandTrigger
  variant?: ActionVariant
  tone?: Tone
  size?: Size
  translations?: Partial<FloatButtonTranslations>
  onOpenChange?: FloatButtonProps['onOpenChange']
  children?: SlotChildren<FloatButtonRootSlotProps>
}

/** 根节点是定位壳：把整组钉在视口一角，悬停展开时进出它才算数。 */
export function XhFloatButtonRoot({ children, onOpenChange, ...props }: XhFloatButtonRootProps): ReactNode {
  const ctx = useFloatButton(withXhConfig('float-button', props) as FloatButtonProps, { onOpenChange })
  // 悬停展开挂的是 pointerenter / pointerleave，两者都不冒泡：留在 React 的合成事件上
  // 收到的是从 pointerover / pointerout 合出来的那一档，直接派到壳上的事件到不了
  const bind = useNativeEvents(
    ctx.api.getRootProps() as Record<string, unknown>,
    ['onPointerEnter', 'onPointerLeave'],
  )
  return (
    <FloatButtonProvider value={ctx}>
      <div {...bind.attrs} ref={bind.ref}>
        {renderSlot(children, { open: ctx.api.open, setOpen: ctx.api.setOpen })}
      </div>
    </FloatButtonProvider>
  )
}

XhFloatButtonRoot.xhEvents = ['open-change'] as const

export interface XhFloatButtonTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 原生 button：Enter / Space 的激活与 Tab 停靠都由平台提供。 */
export function XhFloatButtonTrigger({ children, ...rest }: XhFloatButtonTriggerProps): ReactNode {
  const ctx = useFloatButtonContext()
  return (
    <button {...mergeReactProps(ctx.api.getTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhFloatButtonListProps extends ComponentPropsWithRef<'div'> {}
/** 展开的那一组动作；收起时带 hidden，里面的按钮一并退出 Tab 序列。 */
export function XhFloatButtonList({ children, ...rest }: XhFloatButtonListProps): ReactNode {
  const ctx = useFloatButtonContext()
  return (
    <div {...mergeReactProps(ctx.api.getListProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}
