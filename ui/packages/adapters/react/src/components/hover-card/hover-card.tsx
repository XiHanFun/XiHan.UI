import type { Direction, Placement, Size } from '@xihan-ui/core'
import type { HoverCardApi, HoverCardSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import { renderAsChild } from '../../runtime/as-child'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { HoverCardProvider, useHoverCardContext } from './context'
import { useHoverCard } from './use-hover-card'

type HoverCardProps = HoverCardSchema['props']

/** 函数式 children 的载荷：卡片的展开态与开合命令。 */
export interface HoverCardRootSlotProps extends Pick<HoverCardApi, 'open' | 'setOpen'> {}

export interface XhHoverCardRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'dir'> {
  open?: boolean
  defaultOpen?: boolean
  placement?: Placement
  offset?: number
  /** 悬停进入到展开的等待毫秒。 */
  openDelay?: number
  /** 指针离开到收起的等待毫秒。 */
  closeDelay?: number
  /** 文字方向；浮层搬到落点后继承不到作者子树上的方向，要 RTL 就显式给。 */
  dir?: Direction
  /** 只关掉卡片本身，trigger 元素照常可聚焦。 */
  disabled?: boolean
  size?: Size
  onOpenChange?: HoverCardProps['onOpenChange']
  children?: SlotChildren<HoverCardRootSlotProps>
}

export function XhHoverCardRoot({
  open,
  defaultOpen,
  placement,
  offset,
  openDelay,
  closeDelay,
  dir,
  disabled,
  size,
  onOpenChange,
  children,
  ...rest
}: XhHoverCardRootProps): ReactNode {
  const ctx = useHoverCard({
    open,
    defaultOpen,
    placement,
    offset,
    openDelay,
    closeDelay,
    dir,
    disabled,
    size,
    onOpenChange,
  } as HoverCardProps)
  return (
    <HoverCardProvider value={ctx}>
      <div {...mergeReactProps(ctx.api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {renderSlot(children, { open: ctx.api.open, setOpen: ctx.api.setOpen })}
      </div>
    </HoverCardProvider>
  )
}

XhHoverCardRoot.xhEvents = ['open-change'] as const

export interface XhHoverCardTriggerProps extends ComponentPropsWithRef<'button'>, AsChildProps {}

export function XhHoverCardTrigger({ children, asChild, ...rest }: XhHoverCardTriggerProps): ReactNode {
  const ctx = useHoverCardContext()
  // 指针进出与聚焦装成原生监听器：这三个事件不冒泡，委派在根容器上的合成事件收不到。
  // onBlur 不动——connect 挂的是失焦离场判定，React 的 onBlur 收的正是冒泡的 focusout
  const bind = useNativeEvents(
    ctx.api.getTriggerProps() as Record<string, unknown>,
    ['onFocus', 'onPointerEnter', 'onPointerLeave'],
  )
  const props = mergePartProps(
    mergeReactProps(
      bind.attrs,
      { ref: bind.ref },
      { ref: (el: HTMLElement | null) => { ctx.triggerRef.current = el } },
    ),
    rest as Record<string, unknown>,
  )
  return renderAsChild(asChild, children, props, 'hover-card', (p, kids) => <button {...p}>{kids}</button>)
}

export interface XhHoverCardPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂到哪个容器；不给就按全局配置，再不给挂 body。 */
  container?: () => Element | null
}
/** 搬到浮层落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层。 */
export function XhHoverCardPositioner({ children, container, ...rest }: XhHoverCardPositionerProps): ReactNode {
  const ctx = useHoverCardContext()
  // 卡片内容的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner
  const bars = useScrollbars({ scrollable: () => ctx.contentRef.current })
  return (
    <XhPortal container={container ?? ctx.portalContainer} source={ctx.triggerRef}>
      <div
        {...mergeReactProps(
          ctx.api.getPositionerProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.positionerRef.current = el } },
        )}
      >
        {children}
        {bars.render()}
      </div>
    </XhPortal>
  )
}

export interface XhHoverCardContentProps extends ComponentPropsWithRef<'div'> {}
export function XhHoverCardContent({ children, ...rest }: XhHoverCardContentProps): ReactNode {
  const ctx = useHoverCardContext()
  // 只摘指针进出：content 上那两个焦点处理器挂的是冒泡的 focusin / focusout，
  // 归一化后正好落在 React 的 onFocus / onBlur 上，改装成原生监听器反而收不到后代
  const bind = useNativeEvents(
    ctx.api.getContentProps() as Record<string, unknown>,
    ['onPointerEnter', 'onPointerLeave'],
  )
  return (
    <div
      {...mergeReactProps(
        bind.attrs,
        rest as Record<string, unknown>,
        { ref: bind.ref },
        {
          // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
          // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
          style: ctx.rendered ? undefined : { display: 'none' },
          ref: (el: HTMLDivElement | null) => { ctx.contentRef.current = el },
        },
      )}
    >
      {children}
    </div>
  )
}

export interface XhHoverCardTitleProps extends ComponentPropsWithRef<'h2'> {}
export function XhHoverCardTitle({ children, ...rest }: XhHoverCardTitleProps): ReactNode {
  const ctx = useHoverCardContext()
  return (
    <h2
      {...mergeReactProps(
        ctx.api.getTitleProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: ctx.setTitleEl },
      )}
    >
      {children}
    </h2>
  )
}

export interface XhHoverCardDescriptionProps extends ComponentPropsWithRef<'p'> {}
export function XhHoverCardDescription({ children, ...rest }: XhHoverCardDescriptionProps): ReactNode {
  const ctx = useHoverCardContext()
  return (
    <p
      {...mergeReactProps(
        ctx.api.getDescriptionProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: ctx.setDescriptionEl },
      )}
    >
      {children}
    </p>
  )
}

export interface XhHoverCardArrowProps extends ComponentPropsWithRef<'div'> {}
export function XhHoverCardArrow({ children, ...rest }: XhHoverCardArrowProps): ReactNode {
  const ctx = useHoverCardContext()
  return <div {...mergeReactProps(ctx.api.getArrowProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}
