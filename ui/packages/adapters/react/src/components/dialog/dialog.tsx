/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 dialog 相关实现。

import type { OverlayBackdropVariant, Size } from '@xihan-ui/core'
import type { DialogActionIntents, DialogApi, DialogSchema, DialogStructureActions } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import { dialogStructure, withoutPanelShell } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useDescriptionPart, useTitleDescriptionPart } from '../../runtime/title-description'
import { OVERLAY_STOWED_PROPS } from '../../runtime/use-overlay-exit'
import { DialogProvider, useDialogContext } from './context'
import { useDialog } from './use-dialog'

type DialogProps = DialogSchema['props']

/** 函数式 children 的载荷：展开态与修改展开的动作。 */
export interface DialogRootSlotProps extends Pick<DialogApi, 'open' | 'setOpen'> {}

export interface XhDialogRootProps {
  open?: boolean
  defaultOpen?: boolean
  modal?: boolean
  role?: 'dialog' | 'alertdialog'
  closeOnEscape?: boolean
  closeOnInteractOutside?: boolean
  restoreFocus?: boolean
  initialFocus?: string
  size?: Size
  variant?: OverlayBackdropVariant
  /** 可拖动：按住标题栏或拖动把手挪走面板，方向键在把手上挪一步；面板始终夹在视口内。 */
  draggable?: boolean
  /** 收起动画播完后卸载内容，默认 true；false 时第一次打开才挂载、此后收起只隐藏，再打开不重挂。 */
  unmountOnExit?: boolean
  translations?: DialogProps['translations']
  onOpenChange?: DialogProps['onOpenChange']
  onExitComplete?: DialogProps['onExitComplete']
  // —— 不给 children 时的标准结构（dialogStructure）——
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
  actions?: DialogStructureActions
  /** 确定钮的文字，缺省取语言包。 */
  confirmText?: string
  /** 取消钮的文字，缺省取语言包。 */
  cancelText?: string
  /**
   * 点了确定钮。返回 thenable 即挂起：面板等它兑现才收起、确定钮转圈，
   * 拒绝则保持打开并经 onConfirmError 报告。同步返回照常立即收起。
   */
  onConfirm?: DialogActionIntents['onConfirm']
  /** 确认回调同步抛出或 thenable 拒绝；details.cause 是原始原因。 */
  onConfirmError?: DialogActionIntents['onConfirmError']
  /** 点了取消钮，随后面板收起。Escape、层外交互与关闭钮不发它。 */
  onCancelPress?: DialogActionIntents['onCancelPress']
  children?: SlotChildren<DialogRootSlotProps>
}

export function XhDialogRoot({
  children,
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
  ...props
}: XhDialogRootProps): ReactNode {
  const ctx = useDialog(withXhConfig('dialog', props) as DialogProps, { onConfirm, onConfirmError, onCancelPress })
  return (
    <DialogProvider value={ctx}>
      {children !== undefined
        ? renderSlot(children, { open: ctx.api.open, setOpen: ctx.api.setOpen })
        : renderDefaultStructure({ actions, confirmText, cancelText, translations: ctx.service.prop('translations') }, { trigger, title, description, body, footer })}
    </DialogProvider>
  )
}

XhDialogRoot.xhEvents = ['open-change', 'exit-complete', 'confirm-error', 'cancel-press'] as const

export interface XhDialogTriggerProps extends ComponentPropsWithRef<'button'>, AsChildProps {}

export function XhDialogTrigger({ children, asChild, ...rest }: XhDialogTriggerProps): ReactNode {
  const ctx = useDialogContext()
  const props = mergePartProps(
    ctx.api.getTriggerProps(),
    rest,
  )
  return renderAsChild(asChild, children, props, 'dialog', (p, kids) => <button {...p}>{kids}</button>)
}

export interface XhDialogContentProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 */
  container?: () => Element | null
}

export function XhDialogContent({ children, container, ...rest }: XhDialogContentProps): ReactNode {
  const ctx = useDialogContext()
  const api = ctx.api
  const shown = ctx.rendered
  // 没打开过、或退场播完且要卸载时整棵不渲染
  if (!api.isContentMounted(shown))
    return null
  const backdrop = api.getBackdropProps()
  // 收起后常驻（unmountOnExit 为 false）：遮罩不留，定位层以内联 display 收起，视觉桥随之断开
  return (
    <XhPortal container={container ?? ctx.portalContainer} present={shown}>
      {shown && !backdrop.hidden
        ? (
            <div
              {...backdrop}
              ref={(el: HTMLDivElement | null) => {
                ctx.backdropRef.current = el
              }}
            />
          )
        : null}
      <div {...mergeReactProps(api.getPositionerProps(), shown ? {} : OVERLAY_STOWED_PROPS)}>
        <div
          {...mergeReactProps(api.getContentProps(), rest)}
          hidden={!shown || undefined}
          ref={(el: HTMLDivElement | null) => {
            ctx.contentRef.current = el
          }}
        >
          {children}
        </div>
      </div>
    </XhPortal>
  )
}

export interface XhDialogHeaderProps extends ComponentPropsWithRef<'header'> {}
export function XhDialogHeader({ children, ...rest }: XhDialogHeaderProps): ReactNode {
  const ctx = useDialogContext()
  return <header {...mergeReactProps(ctx.api.getHeaderProps(), rest)}>{children}</header>
}

export interface XhDialogDragTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 拖动把手：键盘挪动面板的入口；放在 XhDialogHeader 里时铺满标题栏。 */
export function XhDialogDragTrigger({ children, ...rest }: XhDialogDragTriggerProps): ReactNode {
  const ctx = useDialogContext()
  return <button {...mergeReactProps(ctx.api.getDragTriggerProps(), rest)}>{children}</button>
}

export interface XhDialogIndicatorProps extends ComponentPropsWithRef<'span'> {}
/** 语气徽记：未提供内容时由皮肤按节点上的 data-tone 绘制兜底字形，放入节点即整个替换。 */
export function XhDialogIndicator({ children, ...rest }: XhDialogIndicatorProps): ReactNode {
  const ctx = useDialogContext()
  return <span {...mergeReactProps(ctx.api.getIndicatorProps(), rest)}>{children}</span>
}

export interface XhDialogTitleProps extends ComponentPropsWithRef<'h2'> {}
export function XhDialogTitle({ children, ...rest }: XhDialogTitleProps): ReactNode {
  const ctx = useDialogContext()
  useTitleDescriptionPart(ctx.presence, 'title')
  return <h2 {...mergeReactProps(ctx.api.getTitleProps(), rest)}>{children}</h2>
}

export interface XhDialogDescriptionProps extends ComponentPropsWithRef<'p'> {}
export function XhDialogDescription({ children, ...rest }: XhDialogDescriptionProps): ReactNode {
  const ctx = useDialogContext()
  // 读不出一句话的说明不进描述链
  const el = useDescriptionPart<HTMLParagraphElement>(ctx.presence)
  return <p {...mergeReactProps({ ...ctx.api.getDescriptionProps() as Record<string, unknown>, ref: el }, rest as Record<string, unknown>)}>{children}</p>
}

export interface XhDialogBodyProps extends ComponentPropsWithRef<'div'> {}
export function XhDialogBody({ children, ...rest }: XhDialogBodyProps): ReactNode {
  const ctx = useDialogContext()
  return <div {...mergeReactProps(ctx.api.getBodyProps(), rest)}>{children}</div>
}

export interface XhDialogFooterProps extends ComponentPropsWithRef<'footer'> {}
export function XhDialogFooter({ children, ...rest }: XhDialogFooterProps): ReactNode {
  const ctx = useDialogContext()
  return <footer {...mergeReactProps(ctx.api.getFooterProps(), rest)}>{children}</footer>
}

export interface XhDialogConfirmTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 确定钮：页脚的主动作；点了调 onConfirm，异步确认挂起时转圈。 */
export function XhDialogConfirmTrigger({ children, ...rest }: XhDialogConfirmTriggerProps): ReactNode {
  const ctx = useDialogContext()
  return <button {...mergeReactProps(ctx.api.getConfirmTriggerProps(), rest)}>{children}</button>
}

export interface XhDialogCancelTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 取消钮：页脚的次要出口；点了调 onCancelPress 并收起。 */
export function XhDialogCancelTrigger({ children, ...rest }: XhDialogCancelTriggerProps): ReactNode {
  const ctx = useDialogContext()
  return <button {...mergeReactProps(ctx.api.getCancelTriggerProps(), rest)}>{children}</button>
}

export interface XhDialogCloseTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhDialogCloseTrigger({ children, ...rest }: XhDialogCloseTriggerProps): ReactNode {
  const ctx = useDialogContext()
  return <button {...mergeReactProps(ctx.api.getCloseTriggerProps(), rest)}>{children}</button>
}

const DIALOG_PARTS = {
  'trigger': XhDialogTrigger,
  'content': XhDialogContent,
  'header': XhDialogHeader,
  'title': XhDialogTitle,
  'description': XhDialogDescription,
  'body': XhDialogBody,
  'footer': XhDialogFooter,
  'cancel-trigger': XhDialogCancelTrigger,
  'confirm-trigger': XhDialogConfirmTrigger,
  'close-trigger': XhDialogCloseTrigger,
}

type DialogSections = Readonly<Partial<Record<'trigger' | 'title' | 'description' | 'body' | 'footer', ReactNode>>>
type DialogTextOptions = Omit<NonNullable<Parameters<typeof dialogStructure>[0]>, 'slotted'>

/**
 * 未写 children 时铺开的整套结构：照 headless 的 dialogStructure 渲；遮罩与定位层由 XhDialogContent 自己装配，摘掉。
 * 给了哪段内容才铺哪一段。
 */
function renderDefaultStructure(options: DialogTextOptions, sections: DialogSections): ReactNode[] {
  const nodes = withoutPanelShell(dialogStructure({ ...options, slotted: name => sections[name as keyof DialogSections] != null }))
  return renderStructure(nodes, DIALOG_PARTS, node => (node.slot ? sections[node.slot.name as keyof DialogSections] : undefined))
}
