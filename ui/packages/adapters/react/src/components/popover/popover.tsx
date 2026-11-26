/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 popover 相关实现。

import type { Direction, Placement, Size, VirtualAnchor } from '@xihan-ui/core'
import type { PopoverApi, PopoverSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { useDescriptionPart, useTitleDescriptionPart } from '../../runtime/title-description'
import { useOverlayScrollbars } from '../../runtime/use-overlay-scrollbars'
import { PopoverProvider, usePopoverContext } from './context'
import { usePopover } from './use-popover'

type PopoverProps = PopoverSchema['props']

/** 函数式 children 的载荷：浮层的展开态与开合命令。 */
export interface PopoverRootSlotProps extends Pick<PopoverApi, 'open' | 'setOpen'> {}

export interface XhPopoverRootProps {
  open?: boolean
  defaultOpen?: boolean
  /**
   * 外部锚点：给了就锚在它上面、收起时焦点归还到它，不再取 trigger。
   * 也收带 getBoundingClientRect() 的虚拟锚点（指针落点、文本选区），这时焦点归还给 trigger。
   */
  anchor?: HTMLElement | VirtualAnchor | null
  placement?: Placement
  offset?: number
  /** 空间不足时翻到对侧，默认 true；false 时守着 placement 那一侧。 */
  flip?: boolean
  /** 碰撞边界：浮层只在这块区域与视口的交集里摆。收元素或带 getBoundingClientRect() 的对象。 */
  boundary?: Element | VirtualAnchor | null
  /** 文字方向；浮层迁移到落点后无法继承作者子树上的方向，需要 RTL 时显式提供。 */
  dir?: Direction
  modal?: boolean
  /** 展开后先聚焦到 content 内匹配该选择器的元素；没给或不匹配时落到第一个可聚焦元素。 */
  initialFocus?: string
  /** 收起时把焦点归还给 trigger（或元素锚点），默认 true。 */
  restoreFocus?: boolean
  /** 第一次打开时才挂载 content 里的内容，默认 false。 */
  lazyMount?: boolean
  /** 收起动画播完后卸载 content 里的内容，默认 false；下次打开重新挂载。 */
  unmountOnExit?: boolean
  closeOnEscape?: boolean
  closeOnInteractOutside?: boolean
  /** 浮层不可打开：触发器转原生 disabled。 */
  disabled?: boolean
  translations?: PopoverProps['translations']
  size?: Size
  onOpenChange?: PopoverProps['onOpenChange']
  /** 退场动画播完、本层资源全部释放后通知；卸载和退场途中重开不通知。 */
  onExitComplete?: PopoverProps['onExitComplete']
  children?: SlotChildren<PopoverRootSlotProps>
}

export function XhPopoverRoot({ children, ...props }: XhPopoverRootProps): ReactNode {
  // disabled 写成自有键：作者没写时，字段集压下来的作用域禁用也要落得进来
  const ctx = usePopover(withXhConfig('popover', { ...props, disabled: props.disabled }) as PopoverProps)
  return (
    <PopoverProvider value={ctx}>
      {renderSlot(children, { open: ctx.api.open, setOpen: ctx.api.setOpen })}
    </PopoverProvider>
  )
}

XhPopoverRoot.xhEvents = ['open-change', 'exit-complete'] as const

export interface XhPopoverTriggerProps extends ComponentPropsWithRef<'button'>, AsChildProps {}

export function XhPopoverTrigger({ children, asChild, ...rest }: XhPopoverTriggerProps): ReactNode {
  const ctx = usePopoverContext()
  const props = mergePartProps(
    mergeReactProps(
      ctx.api.getTriggerProps(),
      { ref: (el: HTMLElement | null) => { ctx.triggerRef.current = el } },
    ),
    rest,
  )
  return renderAsChild(asChild, children, props, 'popover', (p, kids) => <button {...p}>{kids}</button>)
}

export interface XhPopoverPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 */
  container?: () => Element | null
}
/** 迁移到浮层落点：留在原地时，宿主祖先只要建立了层叠上下文就能遮住浮层。 */
export function XhPopoverPositioner({ children, container, ...rest }: XhPopoverPositionerProps): ReactNode {
  const ctx = usePopoverContext()
  // 面板内容的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner；浮层里走 4px 档
  const bars = useOverlayScrollbars({ present: () => ctx.rendered, scrollable: () => ctx.contentRef.current, props: () => ({ size: 'sm' }) })
  return (
    <XhPortal container={container ?? ctx.portalContainer} source={ctx.portalSource} present={ctx.rendered}>
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

export interface XhPopoverContentProps extends ComponentPropsWithRef<'div'> {}
export function XhPopoverContent({ children, ...rest }: XhPopoverContentProps): ReactNode {
  const ctx = usePopoverContext()
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

export interface XhPopoverTitleProps extends ComponentPropsWithRef<'h2'> {}
export function XhPopoverTitle({ children, ...rest }: XhPopoverTitleProps): ReactNode {
  const ctx = usePopoverContext()
  useTitleDescriptionPart(ctx.presence, 'title')
  return <h2 {...mergeReactProps(ctx.api.getTitleProps(), rest)}>{children}</h2>
}

export interface XhPopoverDescriptionProps extends ComponentPropsWithRef<'p'> {}
export function XhPopoverDescription({ children, ...rest }: XhPopoverDescriptionProps): ReactNode {
  const ctx = usePopoverContext()
  // 读不出一句话的说明不进描述链
  const el = useDescriptionPart<HTMLParagraphElement>(ctx.presence)
  return <p {...mergeReactProps({ ...ctx.api.getDescriptionProps() as Record<string, unknown>, ref: el }, rest as Record<string, unknown>)}>{children}</p>
}

export interface XhPopoverCloseTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhPopoverCloseTrigger({ children, ...rest }: XhPopoverCloseTriggerProps): ReactNode {
  const ctx = usePopoverContext()
  return <button {...mergeReactProps(ctx.api.getCloseTriggerProps(), rest)}>{children}</button>
}

export interface XhPopoverArrowProps extends ComponentPropsWithRef<'div'> {}
export function XhPopoverArrow({ children, ...rest }: XhPopoverArrowProps): ReactNode {
  const ctx = usePopoverContext()
  return <div {...mergeReactProps(ctx.api.getArrowProps(), rest)}>{children}</div>
}
