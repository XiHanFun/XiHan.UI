/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 citation 相关实现。

import type { NavIntent, NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { CitationApi, CitationPreviewProps, CitationSchema, CitationSource, CitationSourceItemProps, CitationTriggerProps } from './citation.types'
import {
  contains,
  dataAttr,
  focusItem,
  isItemDisabled,
  ITEM_VALUE_ATTR,
  itemValue,
  navigateItems,
  navIntentFromKey,
  queryItems,
} from '@xihan-ui/core'
import { citationAnatomy, citationSourceQuery } from './citation.anatomy'
import { citationPreviewId } from './citation.machine'

const parts = citationAnatomy.build()

function citationSourceTitle(source: CitationSource | undefined): string {
  if (!source)
    return ''
  if (source.title)
    return source.title
  return source.type === 'source-url' ? source.url : source.sourceId
}

function citationSourceMetaText(source: CitationSource | undefined, documentLabel: string): string {
  if (!source)
    return ''
  if (source.type === 'source-url') {
    try {
      return new URL(source.url).host
    }
    catch {
      return source.url
    }
  }
  return source.mediaType ?? documentLabel
}

export function connectCitation<T extends PropTypes>(
  service: Service<CitationSchema>,
  normalize: NormalizeProps<T>,
): CitationApi<T> {
  const { context, prop, scope, send } = service
  const sources = prop('sources') ?? []
  const sourceOf = new Map(sources.map(source => [source.sourceId, source]))
  const activeSourceId = context.get('activeSourceId')
  const activeSource = activeSourceId == null ? null : sourceOf.get(activeSourceId) ?? null
  const activeAnchorIndex = context.get('activeAnchorIndex')
  const activeTriggerId = context.get('activeTriggerId')
  const focusedSourceId = context.get('focusedSourceId')
  const leavingSourceId = context.get('leavingSourceId')
  const moved = context.get('moved')
  const previewBlockSizes = context.get('previewBlockSizes')
  const open = context.get('open')
  const disabled = !!prop('disabled')
  const loop = prop('loop') ?? true
  const translations = prop('translations')
  const labels = {
    sources: translations?.sources ?? 'Sources',
    preview: translations?.preview ?? 'Source preview',
    closePreview: translations?.closePreview ?? 'Close source preview',
    openSource: translations?.openSource ?? ((title: string) => `Open ${title}`),
    citation: translations?.citation ?? ((index: number, title: string) => `Source ${index}: ${title}`),
    source: translations?.source ?? ((index: number, title: string) => `Source ${index}: ${title}`),
    document: translations?.document ?? 'Document',
  }
  const indexOf = (sourceId: string): number => sources.findIndex(source => source.sourceId === sourceId)
  const previewId = (sourceId: string): string => citationPreviewId(scope, sourceId)
  const sourceLinkId = (sourceId: string): string => scope.partId(citationAnatomy.name, `source-link:${sourceId}`)
  const triggerId = (item: CitationTriggerProps): string => scope.partId(
    citationAnatomy.name,
    `trigger:${item.citationId ?? `${item.sourceId}:${item.anchorIndex ?? 0}`}`,
  )
  const source = (sourceId: string): CitationSource | undefined => sourceOf.get(sourceId)
  const quote = (item: CitationPreviewProps): string => {
    const current = source(item.sourceId)
    const index = item.sourceId === activeSourceId ? activeAnchorIndex ?? item.anchorIndex ?? 0 : item.anchorIndex ?? 0
    return current?.anchors?.[index]?.quote ?? ''
  }
  const isActive = (sourceId: string): boolean => sourceId === activeSourceId
  const isVisible = (sourceId: string): boolean => open && isActive(sourceId)
  const listItems = (list: HTMLElement): HTMLElement[] => queryItems(list, citationSourceQuery)
  const anchor = focusedSourceId ?? activeSourceId

  const activateCitation = (item: CitationTriggerProps): void => {
    if (disabled || item.disabled || !sourceOf.has(item.sourceId))
      return
    send({
      type: 'CITATION.ACTIVATE',
      sourceId: item.sourceId,
      anchorIndex: item.anchorIndex ?? null,
      triggerId: triggerId(item),
      toggle: true,
    })
  }

  const activateSource = (item: CitationSourceItemProps): void => {
    if (disabled || item.disabled || !sourceOf.has(item.sourceId))
      return
    send({ type: 'SOURCE.ACTIVATE', sourceId: item.sourceId })
  }

  const focusBy = (list: HTMLElement, intent: NavIntent): void => {
    const target = navigateItems(listItems(list), anchor, intent, { loop })
    const next = itemValue(target)
    if (next == null)
      return
    focusItem(target)
    send({ type: 'SOURCE.FOCUS', sourceId: next })
  }

  const restoreFocus = (root: HTMLElement): void => {
    const candidate = activeTriggerId ? root.ownerDocument.getElementById(activeTriggerId) : null
    const trigger = candidate && root.contains(candidate) ? candidate : null
    const sourceLink = activeSourceId == null
      ? null
      : queryItems(root, citationSourceQuery).find(item => itemValue(item) === activeSourceId) ?? null
    focusItem(trigger ?? sourceLink)
  }

  return {
    sources,
    activeSource,
    activeSourceId,
    activeAnchorIndex,
    open,
    focusedSourceId,
    setOpen: next => send({ type: 'OPEN.SET', open: next }),
    setActiveSource: sourceId => send({ type: 'SOURCE.ACTIVATE', sourceId }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'dir': prop('dir'),
      'data-disabled': dataAttr(disabled),
      'data-size': prop('size'),
      'onKeyDown': (event: KeyboardEvent) => {
        if (event.key !== 'Escape' || !open)
          return
        event.preventDefault()
        const root = event.currentTarget as HTMLElement
        const target = event.target as HTMLElement
        send({ type: 'OPEN.SET', open: false })
        if (target.closest(parts.preview.selector))
          restoreFocus(root)
      },
    }),
    getTextProps: () => normalize.element({
      ...parts.text.attrs,
    }),
    getTriggerProps: (item) => {
      const current = source(item.sourceId)
      const index = indexOf(item.sourceId)
      const off = disabled || !!item.disabled || !current
      const expanded = isVisible(item.sourceId)
      return normalize.button({
        ...parts.trigger.attrs,
        'id': triggerId(item),
        'type': 'button',
        'disabled': off || undefined,
        'aria-expanded': expanded ? 'true' : 'false',
        'aria-controls': previewId(item.sourceId),
        'aria-label': labels.citation(index + 1, citationSourceTitle(current)),
        'data-state': expanded ? 'open' : 'closed',
        'data-disabled': dataAttr(off),
        'data-xh-action-control': '',
        'data-xh-action-profile': 'text',
        'data-xh-action-variant': 'subtle',
        'data-xh-action-size': 'xs',
        'data-xh-action-display': 'always',
        'onClick': () => activateCitation(item),
      })
    },
    getPreviewProps: (item) => {
      const visible = isVisible(item.sourceId)
      // 收起后先播完退场（收回 0）才藏起：这几帧里预览还留着，但已不接交互
      const leaving = !visible && leavingSourceId === item.sourceId
      const blockSize = previewBlockSizes[item.sourceId]
      return normalize.element({
        ...parts.preview.attrs,
        'id': previewId(item.sourceId),
        'role': 'region',
        'aria-label': activeTriggerId == null ? labels.preview : undefined,
        'aria-labelledby': visible ? (activeTriggerId ?? sourceLinkId(item.sourceId)) : undefined,
        'data-state': visible ? 'open' : 'closed',
        // 首帧就开着（或收着）的预览直接呈现：露面的那一份换过之后才播展开与收起
        'data-instant': dataAttr(!moved),
        'hidden': (!visible && !leaving) || undefined,
        'inert': leaving || undefined,
        // 展开从 0 长到、收起从它收回 0 的内容区高度
        'style': {
          '--xh-_citation-preview-block-size': (visible || leaving) && blockSize != null ? `${blockSize}px` : '',
        },
      })
    },
    getPreviewHeaderProps: _item => normalize.element({
      ...parts['preview-header'].attrs,
    }),
    getPreviewTitleProps: _item => normalize.element({
      ...parts['preview-title'].attrs,
    }),
    getPreviewMetaProps: _item => normalize.element({
      ...parts['preview-meta'].attrs,
    }),
    getQuoteProps: item => normalize.element({
      ...parts.quote.attrs,
      hidden: quote(item).length === 0 || undefined,
    }),
    getPreviewLinkProps: (item) => {
      const current = source(item.sourceId)
      const title = citationSourceTitle(current)
      const anchorIndex = item.sourceId === activeSourceId ? activeAnchorIndex ?? item.anchorIndex ?? 0 : item.anchorIndex ?? 0
      return normalize.element({
        ...parts['preview-link'].attrs,
        'href': current?.type === 'source-url' ? current.url : undefined,
        'type': current?.type === 'source-document' ? 'button' : undefined,
        'aria-label': labels.openSource(title),
        'data-xh-action-control': '',
        'data-xh-action-profile': current?.type === 'source-document' ? 'text' : undefined,
        'data-xh-action-variant': current?.type === 'source-document' ? 'ghost' : undefined,
        'data-xh-action-size': current?.type === 'source-document' ? 'sm' : undefined,
        'data-xh-action-display': current?.type === 'source-document' ? 'always' : undefined,
        'onClick': () => {
          if (current)
            send({ type: 'SOURCE.OPEN', sourceId: item.sourceId, anchorIndex })
        },
      })
    },
    getDismissTriggerProps: _item => normalize.button({
      ...parts['dismiss-trigger'].attrs,
      'type': 'button',
      'aria-label': labels.closePreview,
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-size': 'xs',
      'data-xh-action-display': 'always',
      'onClick': (event: MouseEvent) => {
        send({ type: 'OPEN.SET', open: false })
        const root = (event.currentTarget as HTMLElement).closest<HTMLElement>(parts.root.selector)
        if (root)
          restoreFocus(root)
      },
    }),
    getListProps: () => normalize.element({
      ...parts.list.attrs,
      'role': 'list',
      'aria-label': labels.sources,
      'data-disabled': dataAttr(disabled),
      // 列表只作编程聚焦的兜底；真正的唯一 Tab 位始终在 source-link 上。
      'tabindex': -1,
      'onKeyDown': (event: KeyboardEvent) => {
        if (disabled)
          return
        const list = event.currentTarget as HTMLElement
        const intent = navIntentFromKey(event.key, { axis: 'vertical', dir: prop('dir') ?? 'ltr' })
        if (intent) {
          event.preventDefault()
          focusBy(list, intent)
          return
        }
        if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
          const item = (event.target as HTMLElement).closest<HTMLElement>(parts['source-link'].selector)
          const sourceId = itemValue(item)
          if (sourceId == null || !item || isItemDisabled(item))
            return
          event.preventDefault()
          activateSource({ sourceId })
        }
      },
      'onFocus': (event: FocusEvent) => {
        const list = event.currentTarget as HTMLElement
        if (event.target !== list || contains(list, event.relatedTarget as Node | null))
          return
        const items = listItems(list)
        focusItem(items.find(item => itemValue(item) === anchor && !isItemDisabled(item)) ?? navigateItems(items, null, 'first', { loop }))
      },
      'onFocusOut': (event: FocusEvent) => {
        const list = event.currentTarget as HTMLElement
        if (!contains(list, event.relatedTarget as Node | null))
          send({ type: 'LIST.BLUR' })
      },
    }),
    getSourceProps: item => normalize.element({
      ...parts.source.attrs,
      'role': 'listitem',
      'data-state': isActive(item.sourceId) ? 'active' : 'inactive',
      'data-disabled': dataAttr(disabled || !!item.disabled),
    }),
    getSourceLinkProps: (item) => {
      const current = source(item.sourceId)
      const index = indexOf(item.sourceId)
      const off = disabled || !!item.disabled || !current
      const expanded = isVisible(item.sourceId)
      return normalize.button({
        ...parts['source-link'].attrs,
        [ITEM_VALUE_ATTR]: item.sourceId,
        'id': sourceLinkId(item.sourceId),
        'type': 'button',
        'disabled': off || undefined,
        'aria-label': labels.source(index + 1, citationSourceTitle(current)),
        'aria-expanded': expanded ? 'true' : 'false',
        'aria-controls': previewId(item.sourceId),
        'aria-current': isActive(item.sourceId) ? 'true' : undefined,
        'data-current': dataAttr(isActive(item.sourceId)),
        'tabindex': anchor === item.sourceId ? 0 : -1,
        'data-state': isActive(item.sourceId) ? 'active' : 'inactive',
        'data-disabled': dataAttr(off),
        'data-xh-action-control': '',
        'data-xh-action-profile': 'row',
        'data-xh-action-variant': 'ghost',
        'data-xh-action-size': prop('size') ?? 'md',
        'data-xh-action-display': 'always',
        'onClick': () => activateSource(item),
        'onFocus': (event: FocusEvent) => {
          if (event.target === event.currentTarget)
            send({ type: 'SOURCE.FOCUS', sourceId: item.sourceId })
        },
      })
    },
    getSourceIndexProps: _item => normalize.element({
      ...parts['source-index'].attrs,
      'aria-hidden': true,
    }),
    getSourceTitleProps: _item => normalize.element({
      ...parts['source-title'].attrs,
    }),
    getSourceMetaProps: _item => normalize.element({
      ...parts['source-meta'].attrs,
    }),
  }
}

export { citationSourceMetaText, citationSourceTitle }
