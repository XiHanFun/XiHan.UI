/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 citation 相关实现。

import type { Direction, Placement, Size } from '@xihan-ui/core'
import type { CitationPreviewMode, CitationPreviewProps, CitationSchema, CitationSource, CitationTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { PortalContainer } from '../../runtime/portal'
import { citationSourceTitle } from '@xihan-ui/headless'
import { useMemo } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { slotPaints } from '../../runtime/slot-content'
import { CitationProvider, CitationSourceProvider, useCitationContext, useCitationSource } from './context'
import { useCitation } from './use-citation'

type CitationProps = CitationSchema['props']

export interface XhCitationRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'dir'> {
  sources?: readonly CitationSource[]
  activeSourceId?: string | null
  defaultActiveSourceId?: string | null
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  loop?: boolean
  dir?: Direction
  size?: Size
  /** 预览怎样出现，缺省 inline；hover 档把预览放进 XhCitationPositioner。 */
  previewMode?: CitationPreviewMode
  /** hover 档：指针停在引用上到卡片出现的等待毫秒，缺省 700。 */
  openDelay?: number
  /** hover 档：指针离开到收起的等待毫秒，缺省 300。 */
  closeDelay?: number
  /** hover 档：卡片刚收起的这么久里指向另一处引用直接接替，缺省 300。 */
  skipDelayDuration?: number
  /** hover 档：卡片相对引用编号的朝向，缺省 bottom。 */
  placement?: Placement
  /** hover 档：卡片与引用编号的间距（px）。 */
  offset?: number
  translations?: Partial<CitationTranslations>
  onActiveSourceChange?: CitationProps['onActiveSourceChange']
  onOpenChange?: CitationProps['onOpenChange']
  onSourceOpen?: CitationProps['onSourceOpen']
  children?: ReactNode
}

export function XhCitationRoot({
  sources,
  activeSourceId,
  defaultActiveSourceId,
  open,
  defaultOpen,
  disabled,
  loop,
  dir,
  size,
  previewMode,
  openDelay,
  closeDelay,
  skipDelayDuration,
  placement,
  offset,
  translations,
  onActiveSourceChange,
  onOpenChange,
  onSourceOpen,
  children,
  ...rest
}: XhCitationRootProps): ReactNode {
  const context = useCitation(withXhConfig('citation', {
    sources,
    activeSourceId,
    defaultActiveSourceId,
    open,
    defaultOpen,
    disabled,
    loop,
    dir,
    size,
    previewMode,
    openDelay,
    closeDelay,
    skipDelayDuration,
    placement,
    offset,
    translations,
    onActiveSourceChange,
    onOpenChange,
    onSourceOpen,
  }) as CitationProps)
  return (
    <CitationProvider value={context}>
      <div {...mergeReactProps(context.api.getRootProps() as Record<string, unknown>, { ref: context.rootRef }, rest as Record<string, unknown>)}>{children}</div>
    </CitationProvider>
  )
}

XhCitationRoot.xhEvents = ['active-source-change', 'open-change', 'source-open'] as const

export interface XhCitationTextProps extends ComponentPropsWithRef<'span'> {}
export function XhCitationText({ children, ...rest }: XhCitationTextProps): ReactNode {
  const { api } = useCitationContext()
  return <span {...mergeReactProps(api.getTextProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhCitationTriggerProps extends ComponentPropsWithRef<'button'> {
  /** 这一处引用的来源；一处引多个来源时改写 sourceIds，两者只写一个。 */
  sourceId?: string
  /** 一处引用多个来源，预览里可以在它们之间轮换。 */
  sourceIds?: readonly string[]
  citationId?: string
  anchorIndex?: number
}
export function XhCitationTrigger({ sourceId, sourceIds, citationId, anchorIndex, disabled, children, ...rest }: XhCitationTriggerProps): ReactNode {
  const { api } = useCitationContext()
  // hover 档的指针进出与聚焦装成原生监听器：这三个事件不冒泡，委派在根容器上的合成事件收不到
  const bind = useNativeEvents(
    api.getTriggerProps({ sourceId, sourceIds, citationId, anchorIndex, disabled }) as Record<string, unknown>,
    ['onFocus', 'onPointerEnter', 'onPointerLeave'],
  )
  return (
    <button {...mergeReactProps(bind.attrs, { ref: bind.ref }, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhCitationPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 本实例的 Portal 容器；优先于应用级配置。 */
  container?: PortalContainer
}
/**
 * hover 档的浮层定位壳：预览放进它里面，锚定到当前那处引用旁并搬到 portal 落点。
 * inline 档不搬家，皮肤把它排成 display: contents，里面的预览照常在正文流里。
 */
export function XhCitationPositioner({ container, children, ...rest }: XhCitationPositionerProps): ReactNode {
  const ctx = useCitationContext()
  // 只摘指针进出：焦点那两个处理器挂的是冒泡的 focusin / focusout，落在 React 的 onFocus / onBlur 上正好
  const positioner = ctx.api.getPositionerProps() as Record<string, unknown>
  const bind = useNativeEvents(positioner, ['onPointerEnter', 'onPointerLeave'])
  const shell = (
    <div {...mergeReactProps(bind.attrs, { ref: bind.ref }, { ref: ctx.positionerRef }, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
  if (ctx.api.previewMode !== 'hover')
    return shell
  // 卡片没渲染（没展开，退场也播完）时定位壳是 hidden，不建视觉桥：正文里引用多，每处一台
  return <XhPortal container={container} source={ctx.rootRef} present={positioner.hidden !== true}>{shell}</XhPortal>
}

export interface XhCitationPreviewProps extends ComponentPropsWithRef<'section'> {
  sourceId: string
  anchorIndex?: number
}
export function XhCitationPreview({ sourceId, anchorIndex, children, ...rest }: XhCitationPreviewProps): ReactNode {
  const { api } = useCitationContext()
  const item = { sourceId, anchorIndex }
  return (
    <section {...mergeReactProps(api.getPreviewProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {slotPaints(children) ? children : <DefaultPreview item={item} />}
    </section>
  )
}

export interface XhCitationListProps extends ComponentPropsWithRef<'ol'> {}
export function XhCitationList({ children, ...rest }: XhCitationListProps): ReactNode {
  const { api } = useCitationContext()
  const bind = useNativeEvents(api.getListProps() as Record<string, unknown>, ['onFocus'])
  return (
    <ol {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
      {slotPaints(children) ? children : api.sources.map(source => <XhCitationSource key={source.sourceId} sourceId={source.sourceId} />)}
    </ol>
  )
}

export interface XhCitationSourceProps extends Omit<ComponentPropsWithRef<'li'>, 'value'> {
  sourceId: string
  disabled?: boolean
}
export function XhCitationSource({ sourceId, disabled, children, ...rest }: XhCitationSourceProps): ReactNode {
  const { api } = useCitationContext()
  const item = useMemo(() => ({ sourceId, disabled }), [sourceId, disabled])
  return (
    <CitationSourceProvider value={item}>
      <li {...mergeReactProps(api.getSourceProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children ?? (
          <XhCitationSourceLink>
            <XhCitationSourceIndex />
            <span>
              <XhCitationSourceTitle />
              <XhCitationSourceMeta />
            </span>
          </XhCitationSourceLink>
        )}
      </li>
    </CitationSourceProvider>
  )
}

export interface XhCitationSourceLinkProps extends ComponentPropsWithRef<'button'> {}
export function XhCitationSourceLink({ children, ...rest }: XhCitationSourceLinkProps): ReactNode {
  const { api } = useCitationContext()
  const item = useCitationSource()
  const bind = useNativeEvents(api.getSourceLinkProps(item) as Record<string, unknown>, ['onFocus'])
  return <button {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>{children}</button>
}

export interface XhCitationSourcePartProps extends ComponentPropsWithRef<'span'> {}
export function XhCitationSourceIndex({ children, ...rest }: XhCitationSourcePartProps): ReactNode {
  const { api } = useCitationContext()
  const item = useCitationSource()
  const index = api.sources.findIndex(source => source.sourceId === item.sourceId) + 1
  return <span {...mergeReactProps(api.getSourceIndexProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children ?? index}</span>
}

export function XhCitationSourceTitle({ children, ...rest }: XhCitationSourcePartProps): ReactNode {
  const { api } = useCitationContext()
  const item = useCitationSource()
  const current = api.sources.find(source => source.sourceId === item.sourceId)
  return <span {...mergeReactProps(api.getSourceTitleProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children ?? citationSourceTitle(current)}</span>
}

export function XhCitationSourceMeta({ children, ...rest }: XhCitationSourcePartProps): ReactNode {
  const { api } = useCitationContext()
  const item = useCitationSource()
  const current = api.sources.find(source => source.sourceId === item.sourceId)
  return <span {...mergeReactProps(api.getSourceMetaProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children ?? api.sourceMetaText(current)}</span>
}

function DefaultPreview({ item }: { item: CitationPreviewProps }): ReactNode {
  const { api } = useCitationContext()
  const current = api.sources.find(source => source.sourceId === item.sourceId)
  if (!current)
    return null
  const anchorIndex = api.activeSourceId === item.sourceId ? api.activeAnchorIndex ?? item.anchorIndex ?? 0 : item.anchorIndex ?? 0
  const quote = current.anchors?.[anchorIndex]?.quote
  const linkProps = api.getPreviewLinkProps(item) as Record<string, unknown>
  const at = api.getPreviewPosition(item)
  return (
    <>
      <header {...api.getPreviewHeaderProps(item)}>
        <span>
          <strong {...api.getPreviewTitleProps(item)}>{citationSourceTitle(current)}</strong>
          <span {...api.getPreviewMetaProps(item)}>{api.sourceMetaText(current)}</span>
        </span>
        {/* 一处多源的轮换：只有一个来源时这三件带 hidden */}
        <button {...api.getPrevTriggerProps(item)} />
        <span {...api.getPreviewIndexProps(item)}>{at ? `${at.index} / ${at.total}` : ''}</span>
        <button {...api.getNextTriggerProps(item)} />
        <button {...api.getDismissTriggerProps(item)} />
      </header>
      <blockquote {...api.getQuoteProps(item)}>{quote}</blockquote>
      {current.type === 'source-url'
        ? <a {...linkProps}>{api.previewLinkText(item)}</a>
        : <button {...linkProps}>{api.previewLinkText(item)}</button>}
    </>
  )
}
