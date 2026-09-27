/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 citation 相关实现。

import type { Direction, Size } from '@xihan-ui/core'
import type { CitationPreviewProps, CitationSchema, CitationSource, CitationTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { citationSourceMetaText, citationSourceTitle } from '@xihan-ui/headless'
import { useMemo } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
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
    translations,
    onActiveSourceChange,
    onOpenChange,
    onSourceOpen,
  }) as CitationProps)
  return (
    <CitationProvider value={context}>
      <div {...mergeReactProps(context.api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
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
  sourceId: string
  citationId?: string
  anchorIndex?: number
}
export function XhCitationTrigger({ sourceId, citationId, anchorIndex, disabled, children, ...rest }: XhCitationTriggerProps): ReactNode {
  const { api } = useCitationContext()
  return (
    <button {...mergeReactProps(api.getTriggerProps({ sourceId, citationId, anchorIndex, disabled }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
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
  return <span {...mergeReactProps(api.getSourceMetaProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children ?? citationSourceMetaText(current, 'Document')}</span>
}

function DefaultPreview({ item }: { item: CitationPreviewProps }): ReactNode {
  const { api } = useCitationContext()
  const current = api.sources.find(source => source.sourceId === item.sourceId)
  if (!current)
    return null
  const anchorIndex = api.activeSourceId === item.sourceId ? api.activeAnchorIndex ?? item.anchorIndex ?? 0 : item.anchorIndex ?? 0
  const quote = current.anchors?.[anchorIndex]?.quote
  const linkProps = api.getPreviewLinkProps(item) as Record<string, unknown>
  return (
    <>
      <header {...api.getPreviewHeaderProps(item)}>
        <span>
          <strong {...api.getPreviewTitleProps(item)}>{citationSourceTitle(current)}</strong>
          <span {...api.getPreviewMetaProps(item)}>{citationSourceMetaText(current, 'Document')}</span>
        </span>
        <button {...api.getDismissTriggerProps(item)} />
      </header>
      <blockquote {...api.getQuoteProps(item)}>{quote}</blockquote>
      {current.type === 'source-url'
        ? <a {...linkProps}>Open source</a>
        : <button {...linkProps}>Open document</button>}
    </>
  )
}
