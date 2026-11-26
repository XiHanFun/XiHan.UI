/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 popconfirm 相关实现。

import type { Direction, Placement, Size, VirtualAnchor } from '@xihan-ui/core'
import type { PopconfirmApi, PopconfirmNotifiers, PopconfirmOverlayProps, PopconfirmStructureOptions, PopconfirmTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import { popconfirmStructure } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useDescriptionPart, useTitleDescriptionPart } from '../../runtime/title-description'
import { useOverlayScrollbars } from '../../runtime/use-overlay-scrollbars'
import { PopconfirmProvider, usePopconfirmContext } from './context'
import { usePopconfirm } from './use-popconfirm'

/** 函数式 children 的载荷：开合、确认事务状态与三个动作。 */
export type PopconfirmRootSlotProps = Pick<
  PopconfirmApi,
  'open' | 'pending' | 'actionError' | 'setOpen' | 'confirm' | 'cancel'
>

/** 根上自有的取值；dir 与原生的同名属性含义不同、title 是标准结构里的标题，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'dir' | 'title'>

export interface XhPopconfirmRootProps extends RootElementProps {
  open?: boolean
  defaultOpen?: boolean
  placement?: Placement
  offset?: number
  /** 交叉轴上再挪多少（px），缺省 0；正值往结束方向，RTL 下行内轴往左。 */
  crossOffset?: number
  /** 空间不足时翻到对侧，默认 true；false 时守着 placement 那一侧。 */
  flip?: boolean
  /** 碰撞边界：浮层只在这块区域与视口的交集里摆。收元素或带 getBoundingClientRect() 的对象。 */
  boundary?: Element | VirtualAnchor | null
  /** 文字方向；浮层迁移到落点后无法继承作者子树上的方向，需要 RTL 时显式提供。 */
  dir?: Direction
  closeOnEscape?: boolean
  closeOnInteractOutside?: boolean
  /** 展开后先聚焦到 content 内匹配该选择器的元素；没给或不匹配时落到第一个可聚焦元素（标准结构里是取消钮）。 */
  initialFocus?: string
  /** 收起时把焦点归还给 trigger，默认 true。 */
  restoreFocus?: boolean
  /** 第一次打开时才挂载 content 里的内容，默认 false。 */
  lazyMount?: boolean
  /** 收起动画播完后卸载 content 里的内容，默认 false；下次打开重新挂载。 */
  unmountOnExit?: boolean
  /** 标准结构里两颗钮的缺省文字。 */
  translations?: Partial<PopconfirmTranslations>
  /** 不可打开：触发器转原生 disabled，展开途中转为禁用即收起。 */
  disabled?: boolean
  size?: Size
  onOpenChange?: PopconfirmNotifiers['onOpenChange']
  /**
   * 点击确认。返回 thenable 即挂起确认门：浮层等待它兑现后再收起、确认按钮显示加载且再次点击无效，
   * 拒绝则保持打开并经 onConfirmError 报告。同步返回照常立即收起。
   */
  onConfirm?: PopconfirmNotifiers['onConfirm']
  /** 确认动作失败；details.cause 保留同步抛出或 thenable 拒绝时的原始原因。 */
  onConfirmError?: PopconfirmNotifiers['onConfirmError']
  /** 点击取消，随后浮层收起；Escape 与层外交互只触发 onOpenChange，不触发该回调。 */
  onCancelPress?: PopconfirmNotifiers['onCancelPress']
  /** 退场动画播完、本层资源全部释放后通知；卸载和退场途中重开不通知。 */
  onExitComplete?: PopconfirmNotifiers['onExitComplete']
  // —— 不给 children 时的标准结构（popconfirmStructure）——
  /** 触发按钮的内容。 */
  trigger?: ReactNode
  /** 标题：直接问这次操作。 */
  title?: ReactNode
  /** 说明：讲后果。 */
  description?: ReactNode
  /** 确认钮的文字，缺省取语言包。 */
  confirmText?: string
  /** 取消钮的文字，缺省取语言包。 */
  cancelText?: string
  children?: SlotChildren<PopconfirmRootSlotProps>
}

export function XhPopconfirmRoot({
  open,
  defaultOpen,
  placement,
  offset,
  crossOffset,
  flip,
  boundary,
  dir,
  closeOnEscape,
  closeOnInteractOutside,
  initialFocus,
  restoreFocus,
  lazyMount,
  unmountOnExit,
  disabled,
  size,
  translations,
  onOpenChange,
  onConfirm,
  onConfirmError,
  onCancelPress,
  onExitComplete,
  trigger,
  title,
  description,
  confirmText,
  cancelText,
  children,
  ...rest
}: XhPopconfirmRootProps): ReactNode {
  const notify: PopconfirmNotifiers = { onOpenChange, onConfirm, onConfirmError, onCancelPress, onExitComplete }
  const ctx = usePopconfirm({
    open,
    defaultOpen,
    placement,
    offset,
    crossOffset,
    flip,
    boundary,
    dir,
    closeOnEscape,
    closeOnInteractOutside,
    initialFocus,
    restoreFocus,
    lazyMount,
    unmountOnExit,
    disabled,
    size,
  } as PopconfirmOverlayProps, notify)
  // 全局配置只取文案：两颗钮的缺省文字在标准结构里读
  const configured = withXhConfig('popconfirm', { translations })
  return (
    <PopconfirmProvider value={ctx}>
      <div {...mergeReactProps(ctx.api.getRootProps(), rest)}>
        {children !== undefined
          ? renderSlot(children, {
              open: ctx.api.open,
              pending: ctx.api.pending,
              actionError: ctx.api.actionError,
              setOpen: ctx.api.setOpen,
              confirm: ctx.api.confirm,
              cancel: ctx.api.cancel,
            })
          : renderDefaultStructure({ confirmText, cancelText, translations: configured.translations }, { trigger, title, description })}
      </div>
    </PopconfirmProvider>
  )
}

XhPopconfirmRoot.xhEvents = ['open-change', 'confirm-error', 'cancel-press', 'exit-complete'] as const

export interface XhPopconfirmTriggerProps extends ComponentPropsWithRef<'button'>, AsChildProps {}
export function XhPopconfirmTrigger({ children, asChild, ...rest }: XhPopconfirmTriggerProps): ReactNode {
  const ctx = usePopconfirmContext()
  const props = mergePartProps(
    mergeReactProps(
      ctx.api.getTriggerProps(),
      { ref: (el: HTMLElement | null) => { ctx.triggerRef.current = el } },
    ),
    rest,
  )
  return renderAsChild(asChild, children, props, 'popconfirm', (p, kids) => <button {...p}>{kids}</button>)
}

export interface XhPopconfirmPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 */
  container?: () => Element | null
}
/** 迁移到浮层落点：留在原地时，宿主祖先只要建立了层叠上下文就能遮住浮层。 */
export function XhPopconfirmPositioner({ children, container, ...rest }: XhPopconfirmPositionerProps): ReactNode {
  const ctx = usePopconfirmContext()
  // 面板内容的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner；浮层里走 4px 档
  const bars = useOverlayScrollbars({ present: () => ctx.rendered, scrollable: () => ctx.contentRef.current, props: () => ({ size: 'sm' }) })
  return (
    <XhPortal container={container ?? ctx.portalContainer} source={ctx.triggerRef} present={ctx.rendered}>
      <div
        {...mergeReactProps(
          ctx.api.getPositionerProps(),
          rest,
          { ref: (el: HTMLDivElement | null) => { ctx.positionerRef.current = el } },
        )}
      >
        {children}
        {bars.render()}
      </div>
    </XhPortal>
  )
}

export interface XhPopconfirmContentProps extends ComponentPropsWithRef<'div'> {}
export function XhPopconfirmContent({ children, ...rest }: XhPopconfirmContentProps): ReactNode {
  const ctx = usePopconfirmContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getContentProps(),
        rest,
        {
          // 收起跟着退场闸门走：hidden 与内联 display 都等退场播完才落。宿主的
          // [hidden]{display:none!important}（Tailwind preflight、VitePress 默认主题）压得过皮肤，hidden 跟着开合走退场就一帧都播不出来
          hidden: !ctx.rendered || undefined,
          style: ctx.rendered ? undefined : { display: 'none' },
          ref: (el: HTMLDivElement | null) => { ctx.contentRef.current = el },
        },
      )}
    >
      {ctx.api.isContentMounted(ctx.rendered) ? children : null}
    </div>
  )
}

export interface XhPopconfirmTitleProps extends ComponentPropsWithRef<'h2'> {}
export function XhPopconfirmTitle({ children, ...rest }: XhPopconfirmTitleProps): ReactNode {
  const ctx = usePopconfirmContext()
  useTitleDescriptionPart(ctx.presence, 'title')
  return <h2 {...mergeReactProps(ctx.api.getTitleProps(), rest)}>{children}</h2>
}

export interface XhPopconfirmDescriptionProps extends ComponentPropsWithRef<'p'> {}
export function XhPopconfirmDescription({ children, ...rest }: XhPopconfirmDescriptionProps): ReactNode {
  const ctx = usePopconfirmContext()
  // 读不出一句话的说明不进描述链
  const el = useDescriptionPart<HTMLParagraphElement>(ctx.presence)
  return <p {...mergeReactProps({ ...ctx.api.getDescriptionProps() as Record<string, unknown>, ref: el }, rest as Record<string, unknown>)}>{children}</p>
}

export interface XhPopconfirmConfirmTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhPopconfirmConfirmTrigger({ children, ...rest }: XhPopconfirmConfirmTriggerProps): ReactNode {
  const ctx = usePopconfirmContext()
  return <button {...mergeReactProps(ctx.api.getConfirmTriggerProps(), rest)}>{children}</button>
}

export interface XhPopconfirmCancelTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhPopconfirmCancelTrigger({ children, ...rest }: XhPopconfirmCancelTriggerProps): ReactNode {
  const ctx = usePopconfirmContext()
  return <button {...mergeReactProps(ctx.api.getCancelTriggerProps(), rest)}>{children}</button>
}

export interface XhPopconfirmArrowProps extends ComponentPropsWithRef<'div'> {}
export function XhPopconfirmArrow({ children, ...rest }: XhPopconfirmArrowProps): ReactNode {
  const ctx = usePopconfirmContext()
  return <div {...mergeReactProps(ctx.api.getArrowProps(), rest)}>{children}</div>
}

/** 标准结构里各部件对应的组件。 */
const POPCONFIRM_PARTS = {
  'trigger': XhPopconfirmTrigger,
  'positioner': XhPopconfirmPositioner,
  'content': XhPopconfirmContent,
  'title': XhPopconfirmTitle,
  'description': XhPopconfirmDescription,
  'cancel-trigger': XhPopconfirmCancelTrigger,
  'confirm-trigger': XhPopconfirmConfirmTrigger,
  'arrow': XhPopconfirmArrow,
}

type PopconfirmSections = Readonly<Record<'trigger' | 'title' | 'description', ReactNode>>

/**
 * 未给 children 时铺开的整套结构：照 headless 的 popconfirmStructure 渲，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 触发器、标题与说明是字符串时作文字，是别的节点时由对应部件装着；取消与确认两颗钮的文字缺省取语言包。
 */
function renderDefaultStructure(options: Pick<PopconfirmStructureOptions, 'confirmText' | 'cancelText' | 'translations'>, { trigger, title, description }: PopconfirmSections): ReactNode[] {
  const text = (value: ReactNode): string | undefined => (typeof value === 'string' ? value : undefined)
  const sections: Readonly<Record<string, ReactNode>> = {
    trigger: typeof trigger === 'string' ? undefined : trigger,
    title: typeof title === 'string' ? undefined : title,
    description: typeof description === 'string' ? undefined : description,
  }
  return renderStructure(
    popconfirmStructure({ ...options, triggerText: text(trigger), title: text(title), description: text(description), slotted: name => sections[name] != null }),
    POPCONFIRM_PARTS,
    node => (node.slot ? sections[node.slot.name] : undefined),
  )
}
