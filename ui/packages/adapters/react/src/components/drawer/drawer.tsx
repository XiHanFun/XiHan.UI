/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 drawer 相关实现。

import type { OverlayBackdropVariant, Size } from '@xihan-ui/core'
import type { DrawerApi, DrawerSchema, DrawerSide } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { OVERLAY_STOWED_PROPS } from '../../runtime/use-overlay-exit'
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
   * 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。
   * 提供后即为局部抽屉：遮罩与定位层从 fixed 换为 absolute，只覆盖该容器而不是整屏。
   * 该容器要自带 position（relative 等），否则 absolute 会向上找到其他定位祖先。
   */
  container?: () => Element | null
  /**
   * 只把绘制方式改为局部（遮罩与定位层从 fixed 换为 absolute），不改变迁移位置。
   * 提供 container 后默认为真，不必再写一遍；两个都未提供即铺满视口。
   */
  contained?: boolean
  /** 可调厚度：朝向页面那条边上的把手拖动或用方向键推。 */
  resizable?: boolean
  /** 受控厚度（像素）；未提供即非受控。 */
  panelSize?: number
  defaultPanelSize?: number
  minPanelSize?: number
  maxPanelSize?: number
  /** 收起动画播完后卸载内容，默认 true；false 时第一次打开才挂载、此后收起只隐藏，再打开不重挂。 */
  unmountOnExit?: boolean
  translations?: DrawerProps['translations']
  onOpenChange?: DrawerProps['onOpenChange']
  onExitComplete?: DrawerProps['onExitComplete']
  /** 厚度变化意图：拖动途中连续发出，键盘每推一步发一次。 */
  onPanelSizeChange?: DrawerProps['onPanelSizeChange']
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
  resizable,
  panelSize,
  defaultPanelSize,
  minPanelSize,
  maxPanelSize,
  unmountOnExit,
  translations,
  onOpenChange,
  onExitComplete,
  onPanelSizeChange,
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
    resizable,
    panelSize,
    defaultPanelSize,
    minPanelSize,
    maxPanelSize,
    unmountOnExit,
    translations,
    onOpenChange,
    onExitComplete,
    onPanelSizeChange,
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

XhDrawerRoot.xhEvents = ['open-change', 'exit-complete', 'panel-size-change'] as const

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
  const api = ctx.api
  // 退场动画播完才翻假；没打开过、或播完且要卸载时整棵不渲染
  const shown = ctx.rendered
  if (!api.isContentMounted(shown))
    return null
  const backdrop = api.getBackdropProps() as Record<string, unknown>
  // 收起后常驻（unmountOnExit 为 false）：遮罩不留，定位层以内联 display 收起，视觉桥随之断开
  return (
    <XhPortal container={ctx.portalContainer} present={shown}>
      {shown && !backdrop.hidden
        ? (
            <div
              {...backdrop}
              ref={(el: HTMLDivElement | null) => { ctx.backdropRef.current = el }}
            />
          )
        : null}
      <div {...mergeReactProps(api.getPositionerProps() as Record<string, unknown>, shown ? {} : OVERLAY_STOWED_PROPS)}>
        <div
          {...mergeReactProps(api.getContentProps() as Record<string, unknown>, rest as Record<string, unknown>)}
          hidden={!shown || undefined}
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

export interface XhDrawerResizeTriggerProps extends ComponentPropsWithRef<'div'> {}
/** 改尺把手：role=separator，落在朝向页面的那条边上；放在 XhDrawerContent 里。 */
export function XhDrawerResizeTrigger(props: XhDrawerResizeTriggerProps): ReactNode {
  const ctx = useDrawerContext()
  // 得焦量厚度挂在 focus 上：它不冒泡，委派在根容器上的合成事件收不到，装成原生监听器
  const bind = useNativeEvents(ctx.api.getResizeTriggerProps() as Record<string, unknown>, ['onFocus'])
  return <div {...mergeReactProps(bind.attrs, { ref: bind.ref }, props as Record<string, unknown>)} />
}
