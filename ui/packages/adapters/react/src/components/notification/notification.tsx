import type {
  NotificationDedupe,
  NotificationItemApi,
  NotificationOptions,
  NotificationPlacement,
  NotificationRecord,
  NotificationSchema,
  ResolvedNotification,
  ToastSchema,
  ToastType,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { Fragment } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot, slotPaints } from '../../runtime/slot-content'
import { NotificationItemProvider, NotificationProvider, useNotificationContext, useNotificationItemContext } from './context'
import { useNotification, useNotificationItem } from './use-notification'

type NotificationProps = NotificationSchema['props']

/** 函数式 children 的载荷：当前可见的通知队列与它的落位分组，以及入队、改写、关闭的命令。 */
export interface NotificationRootSlotProps {
  items: ResolvedNotification[]
  placements: NotificationPlacement[]
  count: number
  getItemsByPlacement: (placement: NotificationPlacement) => ResolvedNotification[]
  create: (options?: NotificationOptions) => string
  update: (id: string, options: Partial<NotificationOptions>) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

export interface XhNotificationRootProps {
  items?: NotificationRecord[]
  defaultItems?: NotificationRecord[]
  placement?: NotificationPlacement
  max?: number
  dedupe?: NotificationDedupe
  gap?: number
  duration?: number
  removeDelay?: number
  pauseOnPageIdle?: boolean
  translations?: NotificationProps['translations']
  onItemsChange?: NotificationProps['onItemsChange']
  children?: SlotChildren<NotificationRootSlotProps>
}

export function XhNotificationRoot({ children, ...props }: XhNotificationRootProps): ReactNode {
  const ctx = useNotification(withXhConfig('notification', props) as NotificationProps)
  const api = ctx.api
  // 根节点是地标容器，children 的作用域里一并暴露队列与增删改命令
  return (
    <NotificationProvider value={ctx}>
      <div {...api.getRootProps() as Record<string, unknown>}>
        {renderSlot(children, {
          items: api.visibleNotifications,
          placements: api.placements,
          count: api.count,
          getItemsByPlacement: api.getItemsByPlacement,
          create: ctx.create,
          update: ctx.update,
          dismiss: ctx.dismiss,
          dismissAll: ctx.dismissAll,
        })}
      </div>
    </NotificationProvider>
  )
}

XhNotificationRoot.xhEvents = ['items-change'] as const

/** 函数式 children 的载荷：这一组里逐条铺开的通知。 */
export interface NotificationGroupSlotProps {
  item: ResolvedNotification
}

export interface XhNotificationGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 不写就用 notification 的 placement；写了就只收这个位置上的条目。 */
  placement?: NotificationPlacement
  children?: SlotChildren<NotificationGroupSlotProps>
}

export function XhNotificationGroup({ placement, children, ...rest }: XhNotificationGroupProps): ReactNode {
  const ctx = useNotificationContext()
  const api = ctx.api
  const groupProps = api.getGroupProps({ placement }) as Record<string, unknown>
  // 落位从 group 自己的产出里读回，不在这边重算缺省
  const resolved = groupProps['data-placement'] as NotificationPlacement
  const list = api.getItemsByPlacement(resolved)
  return (
    <div {...mergeReactProps(groupProps, rest as Record<string, unknown>)}>
      {/* 每条通知按队列身份 id 给 key，避免节点被就地复用 */}
      {children == null ? null : list.map(item => <Fragment key={item.id}>{renderSlot(children, { item })}</Fragment>)}
    </div>
  )
}

/** 函数式 children 的载荷：这张卡片自己的那份 api。 */
export interface NotificationItemSlotProps {
  item: NotificationItemApi
}

export interface XhNotificationItemProps {
  id?: string
  title?: string
  description?: string
  type?: ToastType
  duration?: number
  removeDelay?: number
  closable?: boolean
  pauseOnPageIdle?: boolean
  /** 由宿主整摞一起按住计时；与指针、焦点那几路并存，最后一个松开才继续走。 */
  paused?: boolean
  translations?: NotificationProps['translations']
  onStatusChange?: ToastSchema['props']['onStatusChange']
  onAction?: ToastSchema['props']['onAction']
  children?: SlotChildren<NotificationItemSlotProps>
}

/** 单条卡片。生命周期复用 toast 那台机器：会自己消失的卡片，这一行为与消息来源无关。 */
export function XhNotificationItem({ children, ...props }: XhNotificationItemProps): ReactNode {
  // 桶名写 notification 而不是 toast：卡片跑的虽然是 toast 那台机器，
  // 但它的文案该跟着通知走
  const ctx = useNotificationItem(withXhConfig('notification', props) as ToastSchema['props'])
  const api = ctx.api
  // 指针进出改装成原生监听器：pointerenter / pointerleave 不冒泡，委派在根容器上的合成事件收不到。
  // 焦点那两路留给合成事件：连接层派的是 focusin / focusout，React 的 onFocus / onBlur 挂的正是它们
  const bind = useNativeEvents(api.getItemProps() as Record<string, unknown>, ['onPointerEnter', 'onPointerLeave'])
  return (
    <NotificationItemProvider value={ctx}>
      <div {...mergeReactProps(bind.attrs, { ref: bind.ref })}>
        {renderSlot(children, { item: api })}
      </div>
    </NotificationItemProvider>
  )
}

XhNotificationItem.xhEvents = ['status-change', 'action'] as const

export interface XhNotificationItemIndicatorProps extends ComponentPropsWithRef<'span'> {}
/** 类型指示符：不给内容就由皮肤按节点上的 data-severity 画兜底字形。 */
export function XhNotificationItemIndicator({ children, ...rest }: XhNotificationItemIndicatorProps): ReactNode {
  const ctx = useNotificationItemContext()
  return <span {...mergeReactProps(ctx.api.getItemIndicatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhNotificationItemTitleProps extends ComponentPropsWithRef<'div'> {}
export function XhNotificationItemTitle({ children, ...rest }: XhNotificationItemTitleProps): ReactNode {
  const ctx = useNotificationItemContext()
  // 作者没写内容就用队列里那条记录的标题
  return (
    <div {...mergeReactProps(ctx.api.getItemTitleProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {slotPaints(children) ? children : ctx.api.title}
    </div>
  )
}

export interface XhNotificationItemDescriptionProps extends ComponentPropsWithRef<'div'> {}
export function XhNotificationItemDescription({ children, ...rest }: XhNotificationItemDescriptionProps): ReactNode {
  const ctx = useNotificationItemContext()
  return (
    <div {...mergeReactProps(ctx.api.getItemDescriptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {slotPaints(children) ? children : ctx.api.description}
    </div>
  )
}

export interface XhNotificationItemActionTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhNotificationItemActionTrigger({ children, ...rest }: XhNotificationItemActionTriggerProps): ReactNode {
  const ctx = useNotificationItemContext()
  return <button {...mergeReactProps(ctx.api.getItemActionTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhNotificationItemProgressProps extends ComponentPropsWithRef<'div'> {}
export function XhNotificationItemProgress({ children, ...rest }: XhNotificationItemProgressProps): ReactNode {
  const ctx = useNotificationItemContext()
  return <div {...mergeReactProps(ctx.api.getItemProgressProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhNotificationItemCloseTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhNotificationItemCloseTrigger({ children, ...rest }: XhNotificationItemCloseTriggerProps): ReactNode {
  const ctx = useNotificationItemContext()
  return <button {...mergeReactProps(ctx.api.getItemCloseTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}
