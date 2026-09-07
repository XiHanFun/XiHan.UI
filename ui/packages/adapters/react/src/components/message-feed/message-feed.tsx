import type { Service, Size } from '@xihan-ui/core'
import type { MessageFeedApi, MessageFeedItemRole, MessageFeedSchema, MessageFeedStatus, MessageFeedTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode, RefObject } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { withXhConfig } from '../../config/config'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import {
  MessageFeedItemProvider,
  MessageFeedProvider,
  useMessageFeedContext,
  useMessageFeedItemContext,
} from './context'
import { useMessageFeed } from './use-message-feed'

type Props = MessageFeedSchema['props']

/** 函数式 children 的载荷：粘底状态、锚点，以及三个命令式入口。 */
export type MessageFeedRootSlotProps = Pick<
  MessageFeedApi,
  | 'status'
  | 'atBottom'
  | 'sticking'
  | 'focusedId'
  | 'showScrollToEndTrigger'
  | 'scrollToBottom'
  | 'scrollToItem'
  | 'focusItem'
>

/** 本条持有焦点时，id 变更重报锚点，卸载时上报整份消息流失焦。 */
function useItemFocusReport(
  service: Service<MessageFeedSchema>,
  el: RefObject<HTMLElement | null>,
  id: string,
): void {
  const previous = useRef(id)
  useEffect(() => {
    const prev = previous.current
    previous.current = id
    if (prev === id)
      return
    if (service.getStatus() !== 'Started')
      return
    if (el.current && service.scope.getActiveElement() === el.current)
      service.send({ type: 'ITEM.FOCUS', id })
  }, [service, el, id])

  // 按「本节点当下正持有焦点」判定，不按 id 比对。
  // 用 layout effect：节点从文档里摘掉之前它的清理就跑完了，此刻焦点还在它身上；
  // 排到 passive 那一档就晚了，那时节点已经离场、焦点早掉回 body
  useIsomorphicLayoutEffect(() => () => {
    // 整份消息流一起卸载时根部件先停机，此刻送事件会在 dev 下抛
    if (service.getStatus() !== 'Started')
      return
    if (el.current && service.scope.getActiveElement() === el.current)
      service.send({ type: 'FEED.BLUR' })
  }, [service, el])
}

export interface XhMessageFeedRootProps {
  /** 消息总数，由宿主声明，不从 DOM 数；aria-setsize 取它。 */
  count?: number
  /** 这一轮的运行态，只落 data-state。 */
  status?: MessageFeedStatus
  /** 距底多少 px 视为在底。 */
  threshold?: number
  /** 走到首尾是否回绕，默认 false。 */
  loop?: boolean
  /** 尺寸：sm / md / lg。 */
  size?: Size
  translations?: Partial<MessageFeedTranslations>
  onStickChange?: Props['onStickChange']
  onItemFocus?: Props['onItemFocus']
  children?: SlotChildren<MessageFeedRootSlotProps>
}

export function XhMessageFeedRoot({ children, ...props }: XhMessageFeedRootProps): ReactNode {
  const ctx = useMessageFeed(withXhConfig('message-feed', props) as Props)
  const { api } = ctx
  // 容器的 onFocus 是 DOM 的 focus（不冒泡，只在容器自己得焦时接管）。React 的同名合成事件
  // 挂的是冒泡的 focusin，条目得焦也会把它叫起来，那一下会把焦点从条目抢回锚点上。
  // 同一节点上的 onFocusOut 归到 React 的 onBlur，留在合成事件那一档不动
  const bind = useNativeEvents(api.getRootProps() as Record<string, unknown>, ['onFocus'])
  return (
    <MessageFeedProvider value={ctx}>
      <div
        {...mergeReactProps(
          bind.attrs,
          { ref: bind.ref },
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {renderSlot(children, {
          status: api.status,
          atBottom: api.atBottom,
          sticking: api.sticking,
          focusedId: api.focusedId,
          showScrollToEndTrigger: api.showScrollToEndTrigger,
          scrollToBottom: api.scrollToBottom,
          scrollToItem: api.scrollToItem,
          focusItem: api.focusItem,
        })}
      </div>
    </MessageFeedProvider>
  )
}

XhMessageFeedRoot.xhEvents = ['stick-change', 'item-focus'] as const

export interface XhMessageFeedViewportProps extends ComponentPropsWithRef<'div'> {}
/** 把视口节点交给机器，由粘底句柄监听滚动。 */
export function XhMessageFeedViewport({ children, ...rest }: XhMessageFeedViewportProps): ReactNode {
  const ctx = useMessageFeedContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getViewportProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLDivElement | null) => { ctx.viewportRef.current = el } },
      )}
    >
      {children}
    </div>
  )
}

export interface XhMessageFeedListProps extends ComponentPropsWithRef<'div'> {}
/** 把内容节点交给机器，由粘底句柄观察尺寸；条目必须是它的直接子节点。 */
export function XhMessageFeedList({ children, ...rest }: XhMessageFeedListProps): ReactNode {
  const ctx = useMessageFeedContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getListProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLDivElement | null) => { ctx.contentRef.current = el } },
      )}
    >
      {children}
    </div>
  )
}

export interface XhMessageFeedItemProps extends Omit<ComponentPropsWithRef<'article'>, 'id' | 'role'> {
  /** 这条消息的身份，落成 data-value；导航与锚点都以它为准。 */
  itemId: string
  /** 0 基下标，落成 aria-posinset = index + 1。 */
  itemIndex: number | string
  /** 这条消息是谁说的。 */
  itemRole?: MessageFeedItemRole
  /** 这条还在流式写入。 */
  itemStreaming?: boolean
}
// 属性名一律带 item- 前缀：id 与 role 是 HTML 全局属性，落到节点上会与 role=article 打架
export function XhMessageFeedItem({
  itemId,
  itemIndex,
  itemRole,
  itemStreaming,
  children,
  ...rest
}: XhMessageFeedItemProps): ReactNode {
  const ctx = useMessageFeedContext()
  const el = useRef<HTMLElement | null>(null)
  // 用状态而不是 ref：登记数要能把本条重渲一次，connect 在渲染期求值
  const [labelCount, setLabelCount] = useState(0)
  const registerLabel = useCallback(() => {
    setLabelCount(n => n + 1)
    return () => setLabelCount(n => n - 1)
  }, [])
  const item = useMemo(() => ({ id: itemId, registerLabel }), [itemId, registerLabel])
  // 条目的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(ctx.api.getItemProps({
    id: itemId,
    index: Number(itemIndex),
    role: itemRole,
    streaming: itemStreaming,
    labelled: labelCount > 0,
  }) as Record<string, unknown>, ['onFocus'])
  useItemFocusReport(ctx.service, el, itemId)
  return (
    <MessageFeedItemProvider value={item}>
      <article
        {...mergeReactProps(
          bind.attrs,
          rest as Record<string, unknown>,
          { ref: bind.ref },
          { ref: (node: HTMLElement | null) => { el.current = node } },
        )}
      >
        {children}
      </article>
    </MessageFeedItemProvider>
  )
}

export interface XhMessageFeedItemLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhMessageFeedItemLabel({ children, ...rest }: XhMessageFeedItemLabelProps): ReactNode {
  const ctx = useMessageFeedContext()
  const item = useMessageFeedItemContext()
  // 渲出来了才登记：条目的 aria-labelledby 只在这个节点真在场时才指过来
  const { registerLabel } = item
  useEffect(() => registerLabel(), [registerLabel])
  return (
    <span
      {...mergeReactProps(
        ctx.api.getItemLabelProps({ id: item.id }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </span>
  )
}

export interface XhMessageFeedScrollToEndTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhMessageFeedScrollToEndTrigger({ children, ...rest }: XhMessageFeedScrollToEndTriggerProps): ReactNode {
  const ctx = useMessageFeedContext()
  return (
    <button {...mergeReactProps(ctx.api.getScrollToEndTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhMessageFeedLiveRegionProps extends ComponentPropsWithRef<'div'> {}
/** 播报文本由宿主在一轮流结束时写进来。 */
export function XhMessageFeedLiveRegion({ children, ...rest }: XhMessageFeedLiveRegionProps): ReactNode {
  const ctx = useMessageFeedContext()
  return (
    <div {...mergeReactProps(ctx.api.getLiveRegionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}
