/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 drawer 相关实现。

import type { OverlayBackdropVariant, Size } from '@xihan-ui/core'
import type { DrawerActionIntents, DrawerApi, DrawerSchema, DrawerSide, DrawerStructureActions } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import { drawerStructure, withoutPanelShell } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useDescriptionPart, useTitleDescriptionPart } from '../../runtime/title-description'
import { OVERLAY_STOWED_PROPS } from '../../runtime/use-overlay-exit'
import { DrawerProvider, useDrawerContext } from './context'
import { useDrawer } from './use-drawer'

type DrawerProps = DrawerSchema['props']

/** 函数式 children 的载荷：展开状态、已解析的滑出边，与开合命令。 */
export interface DrawerRootSlotProps extends Pick<DrawerApi, 'open' | 'side' | 'setOpen'> {}

export interface XhDrawerRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'title'> {
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
  // —— 不给 children 时的标准结构（drawerStructure）——
  /** 触发按钮的内容。不给时不铺触发器，开合交给受控的 open。 */
  trigger?: ReactNode
  /** 标题。 */
  title?: ReactNode
  /** 标题下的说明。 */
  description?: ReactNode
  /** 正文：面板里唯一会滚动的段。 */
  body?: ReactNode
  /** 整段页脚：给了它，取消与确定两颗钮不再代铺。 */
  footer?: ReactNode
  /** 页脚铺哪几颗钮：confirm（取消 + 确定，缺省）、alert（只有确定）、none。 */
  actions?: DrawerStructureActions
  /** 确定钮的文字，缺省取语言包。 */
  confirmText?: string
  /** 取消钮的文字，缺省取语言包。 */
  cancelText?: string
  /**
   * 点了确定钮。返回 thenable 即挂起：抽屉等它兑现才收起、确定钮转圈，
   * 拒绝则保持打开并经 onConfirmError 报告。同步返回照常立即收起。
   */
  onConfirm?: DrawerActionIntents['onConfirm']
  /** 确认回调同步抛出或 thenable 拒绝；details.cause 是原始原因。 */
  onConfirmError?: DrawerActionIntents['onConfirmError']
  /** 点了取消钮，随后抽屉收起。Escape、层外交互与关闭钮不发它。 */
  onCancelPress?: DrawerActionIntents['onCancelPress']
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
  trigger,
  title,
  description,
  body,
  footer,
  actions,
  confirmText,
  cancelText,
  onConfirm,
  onConfirmError,
  onCancelPress,
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
  }) as DrawerProps, container, { onConfirm, onConfirmError, onCancelPress })
  const api = ctx.api
  // root 是真实节点，content 会被搬到浮层落点，data-side 挂在这里供页面内的部分读取
  return (
    <DrawerProvider value={ctx}>
      <div {...mergeReactProps(api.getRootProps(), rest)}>
        {children !== undefined
          ? renderSlot(children, { open: api.open, side: api.side, setOpen: api.setOpen })
          : renderDefaultStructure({ actions, confirmText, cancelText, resizable, translations: ctx.service.prop('translations') }, { trigger, title, description, body, footer })}
      </div>
    </DrawerProvider>
  )
}

XhDrawerRoot.xhEvents = ['open-change', 'exit-complete', 'panel-size-change', 'confirm-error', 'cancel-press'] as const

export interface XhDrawerTriggerProps extends ComponentPropsWithRef<'button'>, AsChildProps {}

export function XhDrawerTrigger({ children, asChild, ...rest }: XhDrawerTriggerProps): ReactNode {
  const ctx = useDrawerContext()
  const props = mergePartProps(
    ctx.api.getTriggerProps(),
    rest,
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
  const backdrop = api.getBackdropProps()
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
      <div {...mergeReactProps(api.getPositionerProps(), shown ? {} : OVERLAY_STOWED_PROPS)}>
        <div
          {...mergeReactProps(api.getContentProps(), rest)}
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
  return <header {...mergeReactProps(ctx.api.getHeaderProps(), rest)}>{children}</header>
}

export interface XhDrawerTitleProps extends ComponentPropsWithRef<'h2'> {}
export function XhDrawerTitle({ children, ...rest }: XhDrawerTitleProps): ReactNode {
  const ctx = useDrawerContext()
  useTitleDescriptionPart(ctx.presence, 'title')
  return <h2 {...mergeReactProps(ctx.api.getTitleProps(), rest)}>{children}</h2>
}

export interface XhDrawerDescriptionProps extends ComponentPropsWithRef<'p'> {}
export function XhDrawerDescription({ children, ...rest }: XhDrawerDescriptionProps): ReactNode {
  const ctx = useDrawerContext()
  // 读不出一句话的说明不进描述链
  const el = useDescriptionPart<HTMLParagraphElement>(ctx.presence)
  return <p {...mergeReactProps({ ...ctx.api.getDescriptionProps() as Record<string, unknown>, ref: el }, rest as Record<string, unknown>)}>{children}</p>
}

export interface XhDrawerBodyProps extends ComponentPropsWithRef<'div'> {}
export function XhDrawerBody({ children, ...rest }: XhDrawerBodyProps): ReactNode {
  const ctx = useDrawerContext()
  return <div {...mergeReactProps(ctx.api.getBodyProps(), rest)}>{children}</div>
}

export interface XhDrawerFooterProps extends ComponentPropsWithRef<'footer'> {}
export function XhDrawerFooter({ children, ...rest }: XhDrawerFooterProps): ReactNode {
  const ctx = useDrawerContext()
  return <footer {...mergeReactProps(ctx.api.getFooterProps(), rest)}>{children}</footer>
}

export interface XhDrawerConfirmTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 确定钮：页脚的主动作；点了调 onConfirm，异步确认挂起时转圈。 */
export function XhDrawerConfirmTrigger({ children, ...rest }: XhDrawerConfirmTriggerProps): ReactNode {
  const ctx = useDrawerContext()
  return <button {...mergeReactProps(ctx.api.getConfirmTriggerProps(), rest)}>{children}</button>
}

export interface XhDrawerCancelTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 取消钮：页脚的次要出口；点了调 onCancelPress 并收起。 */
export function XhDrawerCancelTrigger({ children, ...rest }: XhDrawerCancelTriggerProps): ReactNode {
  const ctx = useDrawerContext()
  return <button {...mergeReactProps(ctx.api.getCancelTriggerProps(), rest)}>{children}</button>
}

export interface XhDrawerCloseTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhDrawerCloseTrigger({ children, ...rest }: XhDrawerCloseTriggerProps): ReactNode {
  const ctx = useDrawerContext()
  return <button {...mergeReactProps(ctx.api.getCloseTriggerProps(), rest)}>{children}</button>
}

export interface XhDrawerResizeTriggerProps extends ComponentPropsWithRef<'div'> {}
/** 改尺把手：role=separator，落在朝向页面的那条边上；放在 XhDrawerContent 里。 */
export function XhDrawerResizeTrigger(props: XhDrawerResizeTriggerProps): ReactNode {
  const ctx = useDrawerContext()
  // 得焦量厚度挂在 focus 上：它不冒泡，委派在根容器上的合成事件收不到，装成原生监听器
  const bind = useNativeEvents(ctx.api.getResizeTriggerProps(), ['onFocus'])
  return <div {...mergeReactProps(bind.attrs, { ref: bind.ref }, props as Record<string, unknown>)} />
}

const DRAWER_PARTS = {
  'trigger': XhDrawerTrigger,
  'content': XhDrawerContent,
  'header': XhDrawerHeader,
  'title': XhDrawerTitle,
  'description': XhDrawerDescription,
  'body': XhDrawerBody,
  'footer': XhDrawerFooter,
  'cancel-trigger': XhDrawerCancelTrigger,
  'confirm-trigger': XhDrawerConfirmTrigger,
  'close-trigger': XhDrawerCloseTrigger,
  'resize-trigger': XhDrawerResizeTrigger,
}

type DrawerSections = Readonly<Partial<Record<'trigger' | 'title' | 'description' | 'body' | 'footer', ReactNode>>>
type DrawerTextOptions = Omit<NonNullable<Parameters<typeof drawerStructure>[0]>, 'slotted'>

/**
 * 未写 children 时铺开的整套结构：照 headless 的 drawerStructure 渲；遮罩与定位层由 XhDrawerContent 自己装配，摘掉。
 * 给了哪段内容才铺哪一段。
 */
function renderDefaultStructure(options: DrawerTextOptions, sections: DrawerSections): ReactNode[] {
  const nodes = withoutPanelShell(drawerStructure({ ...options, slotted: name => sections[name as keyof DrawerSections] != null }))
  return renderStructure(nodes, DRAWER_PARTS, node => (node.slot ? sections[node.slot.name as keyof DrawerSections] : undefined))
}
