import type { OverlayBackdropVariant, Size } from '@xihan-ui/core'
import type { DrawerApi, DrawerSchema, DrawerSide } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { DrawerProvider, useDrawerContext } from './context'
import { useDrawer } from './use-drawer'

type DrawerProps = DrawerSchema['props']

/** 函数式 children 的载荷：展开状态、已解析的滑出边，与开合命令。 */
export interface DrawerRootSlotProps extends Pick<DrawerApi, 'open' | 'side' | 'setOpen'> {}

export interface XhDrawerRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  open?: boolean
  defaultOpen?: boolean
  modal?: boolean
  side?: DrawerSide
  role?: 'dialog' | 'alertdialog'
  closeOnEscape?: boolean
  closeOnInteractOutside?: boolean
  restoreFocus?: boolean
  size?: Size
  variant?: OverlayBackdropVariant
  /**
   * 浮层挂到哪个容器；不给就按全局配置，再不给挂 body。
   * 给了它就是局部抽屉：遮罩与定位层从 fixed 换成 absolute，只罩住那个容器而不是盖满整屏。
   * 那个容器要自己带 position（relative 之类），否则 absolute 会往上找到别的定位祖先。
   */
  container?: () => Element | null
  /**
   * 只把画法改成局部（遮罩与定位层从 fixed 换成 absolute），不管搬到哪儿。
   * 给了 container 就默认为真，不必再写一遍；两个都不给即铺满视口。
   */
  contained?: boolean
  translations?: DrawerProps['translations']
  onOpenChange?: DrawerProps['onOpenChange']
  onExitComplete?: DrawerProps['onExitComplete']
  children?: SlotChildren<DrawerRootSlotProps>
}

export function XhDrawerRoot({
  open,
  defaultOpen,
  modal,
  side,
  role,
  closeOnEscape,
  closeOnInteractOutside,
  restoreFocus,
  size,
  variant,
  contained,
  translations,
  onOpenChange,
  onExitComplete,
  children,
  container,
  ...rest
}: XhDrawerRootProps): ReactNode {
  const ctx = useDrawer(withXhConfig('drawer', {
    open,
    defaultOpen,
    modal,
    side,
    role,
    closeOnEscape,
    closeOnInteractOutside,
    restoreFocus,
    size,
    variant,
    contained,
    translations,
    onOpenChange,
    onExitComplete,
  }) as DrawerProps, container)
  const api = ctx.api
  // root 是真实节点，content 会被搬到浮层落点，data-side 挂在这里供页面内的部分读取
  return (
    <DrawerProvider value={ctx}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {renderSlot(children, { open: api.open, side: api.side, setOpen: api.setOpen })}
      </div>
    </DrawerProvider>
  )
}

XhDrawerRoot.xhEvents = ['open-change', 'exit-complete'] as const

export interface XhDrawerTriggerProps extends ComponentPropsWithRef<'button'>, AsChildProps {}

export function XhDrawerTrigger({ children, asChild, ...rest }: XhDrawerTriggerProps): ReactNode {
  const ctx = useDrawerContext()
  const props = mergePartProps(
    ctx.api.getTriggerProps() as Record<string, unknown>,
    rest as Record<string, unknown>,
  )
  return renderAsChild(asChild, children, props, 'drawer', (p, kids) => <button {...p}>{kids}</button>)
}

export interface XhDrawerContentProps extends ComponentPropsWithRef<'div'> {}

export function XhDrawerContent({ children, ...rest }: XhDrawerContentProps): ReactNode {
  const ctx = useDrawerContext()
  // 退场动画播完才翻假，翻假之后整棵不渲染
  if (!ctx.rendered)
    return null
  const api = ctx.api
  const backdrop = api.getBackdropProps() as Record<string, unknown>
  return (
    <XhPortal container={ctx.portalContainer}>
      {!backdrop.hidden
        ? (
            <div
              {...backdrop}
              ref={(el: HTMLDivElement | null) => { ctx.backdropRef.current = el }}
            />
          )
        : null}
      <div {...api.getPositionerProps() as Record<string, unknown>}>
        <div
          {...mergeReactProps(api.getContentProps() as Record<string, unknown>, rest as Record<string, unknown>)}
          hidden={!ctx.rendered || undefined}
          ref={(el: HTMLDivElement | null) => { ctx.contentRef.current = el }}
        >
          {children}
        </div>
      </div>
    </XhPortal>
  )
}

export interface XhDrawerHeaderProps extends ComponentPropsWithRef<'header'> {}
export function XhDrawerHeader({ children, ...rest }: XhDrawerHeaderProps): ReactNode {
  const ctx = useDrawerContext()
  return <header {...mergeReactProps(ctx.api.getHeaderProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</header>
}

export interface XhDrawerTitleProps extends ComponentPropsWithRef<'h2'> {}
export function XhDrawerTitle({ children, ...rest }: XhDrawerTitleProps): ReactNode {
  const ctx = useDrawerContext()
  return <h2 {...mergeReactProps(ctx.api.getTitleProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</h2>
}

export interface XhDrawerDescriptionProps extends ComponentPropsWithRef<'p'> {}
export function XhDrawerDescription({ children, ...rest }: XhDrawerDescriptionProps): ReactNode {
  const ctx = useDrawerContext()
  return <p {...mergeReactProps(ctx.api.getDescriptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</p>
}

export interface XhDrawerBodyProps extends ComponentPropsWithRef<'div'> {}
export function XhDrawerBody({ children, ...rest }: XhDrawerBodyProps): ReactNode {
  const ctx = useDrawerContext()
  return <div {...mergeReactProps(ctx.api.getBodyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhDrawerFooterProps extends ComponentPropsWithRef<'footer'> {}
export function XhDrawerFooter({ children, ...rest }: XhDrawerFooterProps): ReactNode {
  const ctx = useDrawerContext()
  return <footer {...mergeReactProps(ctx.api.getFooterProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</footer>
}

export interface XhDrawerCloseTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhDrawerCloseTrigger({ children, ...rest }: XhDrawerCloseTriggerProps): ReactNode {
  const ctx = useDrawerContext()
  return <button {...mergeReactProps(ctx.api.getCloseTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}
