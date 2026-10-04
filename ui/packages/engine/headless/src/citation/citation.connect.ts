/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 citation 相关实现。

import type { NavIntent, NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type {
  CitationApi,
  CitationPreviewProps,
  CitationSchema,
  CitationSource,
  CitationSourceItemProps,
  CitationTriggerProps,
  CitationTriggerTarget,
} from './citation.types'
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
import { CITATION_EN_US } from '../locale/en-US'
import { overlayAvailableSpaceVars, overlayFixedStyle, overlayPositioned } from '../shared/overlay'
import { resolveTranslations } from '../shared/translations'
import { citationAnatomy, citationSourceQuery } from './citation.anatomy'
import { CITATION_DEFAULT_PLACEMENT, citationPreviewId, citationSourceLinkId } from './citation.machine'

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

/** 一处行内引用引到的来源：sourceId 与 sourceIds 只写一个，至少一个来源。 */
function triggerSourceIds(item: CitationTriggerProps): readonly string[] {
  if (item.sourceId !== undefined && item.sourceIds !== undefined)
    throw new Error('[xh] Citation trigger 的 sourceId 与 sourceIds 只能写一个')
  const ids = item.sourceIds ?? (item.sourceId === undefined ? [] : [item.sourceId])
  if (ids.length === 0)
    throw new Error('[xh] Citation trigger 至少要引一个来源：写 sourceId 或 sourceIds')
  return ids
}

export function connectCitation<T extends PropTypes>(
  service: Service<CitationSchema>,
  normalize: NormalizeProps<T>,
): CitationApi<T> {
  const { context, prop, scope, send, refs } = service
  const previewMode = prop('previewMode') ?? 'inline'
  const hover = previewMode === 'hover'
  // null 缺省的 cell 读出来是 undefined，这里统一成 null
  const activeGroup = context.get('activeGroup') ?? null
  const shownSourceId = context.get('shownSourceId')
  const position = context.get('position') ?? null
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
  const labels = resolveTranslations(CITATION_EN_US, prop('translations'))
  const indexOf = (sourceId: string): number => sources.findIndex(source => source.sourceId === sourceId)
  const previewId = (sourceId: string): string => citationPreviewId(scope, sourceId)
  const sourceLinkId = (sourceId: string): string => citationSourceLinkId(scope, sourceId)
  const triggerId = (item: CitationTriggerProps): string => scope.partId(
    citationAnatomy.name,
    `trigger:${item.citationId ?? `${triggerSourceIds(item).join('+')}:${item.anchorIndex ?? 0}`}`,
  )
  const targetOf = (item: CitationTriggerProps): CitationTriggerTarget => ({
    sourceIds: triggerSourceIds(item),
    anchorIndex: item.anchorIndex ?? null,
    triggerId: triggerId(item),
  })
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

  /** 引到的来源里有一个在 sources 里就算可用。 */
  const usable = (item: CitationTriggerProps): boolean =>
    !disabled && !item.disabled && triggerSourceIds(item).some(id => sourceOf.has(id))

  const activateCitation = (item: CitationTriggerProps): void => {
    if (!usable(item))
      return
    send({ type: 'CITATION.ACTIVATE', target: targetOf(item), toggle: true })
  }

  /**
   * 焦点是否仍在悬停卡片这一侧（引用编号或卡片里）。
   * 只在事件回调里调用：connect 在渲染期求值，那一刻节点还不存在。
   */
  const staysInHover = (related: EventTarget | null): boolean => {
    const node = related as Node | null
    if (node === null)
      return false
    const floating = refs.get('getFloatingEl')()
    if (contains(floating, node))
      return true
    const el = node.nodeType === 1 ? node as Element : node.parentElement
    return el?.closest(parts.trigger.selector) != null
  }

  const onHoverBlur = (event: FocusEvent): void => {
    if (!staysInHover(event.relatedTarget))
      send({ type: 'HOVER.BLUR' })
  }

  /** 该预览在一处多源里的位置；不在当前那组里时为 null。 */
  const positionOf = (item: CitationPreviewProps): { index: number, total: number } | null => {
    if (activeGroup === null || !activeGroup.includes(item.sourceId))
      return null
    return { index: activeGroup.indexOf(item.sourceId) + 1, total: activeGroup.length }
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

  const placement = position?.placement ?? prop('placement') ?? CITATION_DEFAULT_PLACEMENT
  // hover 档卡片在场：有一份预览露面，或收起的那一份退场还没播完
  const cardRendered = hover && (shownSourceId != null || leavingSourceId != null)

  const pager = (item: CitationPreviewProps, delta: 1 | -1): T['button'] => {
    const at = positionOf(item)
    const edge = at !== null && !loop && (delta < 0 ? at.index === 1 : at.index === at.total)
    return normalize.button({
      ...parts[delta < 0 ? 'prev-trigger' : 'next-trigger'].attrs,
      'type': 'button',
      'hidden': at === null || undefined,
      'disabled': edge || undefined,
      'aria-label': delta < 0 ? labels.previousSource : labels.nextSource,
      'aria-controls': previewId(item.sourceId),
      'data-disabled': dataAttr(edge),
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-size': 'xs',
      'data-xh-action-display': 'always',
      'onClick': () => send({ type: 'GROUP.STEP', delta }),
    })
  }

  return {
    sources,
    activeSource,
    activeSourceId,
    activeAnchorIndex,
    activeGroup: activeGroup !== null && activeGroup.length > 1 ? activeGroup : null,
    previewMode,
    open,
    focusedSourceId,
    setOpen: next => send({ type: 'OPEN.SET', open: next }),
    setActiveSource: sourceId => send({ type: 'SOURCE.ACTIVATE', sourceId }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'dir': prop('dir'),
      'data-preview-mode': previewMode,
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
      const ids = triggerSourceIds(item)
      const id = triggerId(item)
      const off = !usable(item)
      // 展开的是这一处：当前来源在它引的来源里，且打开它的正是这一处（从来源列表打开时同来源的引用都算）
      const expanded = open && activeSourceId != null && ids.includes(activeSourceId)
        && (activeTriggerId == null || activeTriggerId === id)
      const controls = expanded ? activeSourceId! : ids[0]!
      const label = ids.length > 1
        ? labels.citations(ids.map(sourceId => indexOf(sourceId) + 1))
        : labels.citation(indexOf(ids[0]!) + 1, citationSourceTitle(source(ids[0]!)))
      // hover 档：指针停留与聚焦打开卡片；触屏没有悬停，交给点按
      const hoverTarget = hover && !off
      return normalize.button({
        ...parts.trigger.attrs,
        'id': id,
        'type': 'button',
        'disabled': off || undefined,
        'aria-expanded': expanded ? 'true' : 'false',
        'aria-controls': previewId(controls),
        'aria-label': label,
        'data-state': expanded ? 'open' : 'closed',
        'data-disabled': dataAttr(off),
        'data-xh-action-control': '',
        'data-xh-action-profile': 'text',
        'data-xh-action-variant': 'subtle',
        'data-xh-action-size': 'xs',
        'data-xh-action-display': 'always',
        'onClick': () => activateCitation(item),
        'onPointerEnter': hoverTarget
          ? (event: PointerEvent) => {
              if (event.pointerType !== 'touch')
                send({ type: 'TRIGGER.ENTER', target: targetOf(item) })
            }
          : undefined,
        'onPointerLeave': hoverTarget
          ? (event: PointerEvent) => {
              if (event.pointerType !== 'touch')
                send({ type: 'POINTER.LEAVE' })
            }
          : undefined,
        'onFocus': hoverTarget ? () => send({ type: 'TRIGGER.FOCUS', target: targetOf(item) }) : undefined,
        'onBlur': hoverTarget ? onHoverBlur : undefined,
      })
    },
    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      // 定位层被搬到 portal 落点，继承不到作者子树上的方向；作者没给就不写
      'dir': prop('dir'),
      'data-preview-mode': previewMode,
      // 被搬到 portal 落点后继承不到根上的尺寸档，壳上自己带一份
      'data-size': prop('size'),
      'data-state': hover && open ? 'open' : 'closed',
      'data-placement': hover ? placement : undefined,
      'data-hidden': dataAttr(hover && position?.hidden),
      // 落位才露；inline 档不定位、始终算落位，皮肤把这一层排成 display: contents
      'data-positioned': dataAttr(!hover || overlayPositioned(position)),
      'hidden': (hover && !cardRendered) || undefined,
      'style': hover
        ? { ...overlayFixedStyle(position), ...overlayAvailableSpaceVars('citation', position) }
        : {},
      'onPointerEnter': hover
        ? (event: PointerEvent) => {
            if (event.pointerType !== 'touch')
              send({ type: 'FLOATING.ENTER' })
          }
        : undefined,
      'onPointerLeave': hover
        ? (event: PointerEvent) => {
            if (event.pointerType !== 'touch')
              send({ type: 'POINTER.LEAVE' })
          }
        : undefined,
      'onFocusIn': hover ? () => send({ type: 'FLOATING.FOCUS' }) : undefined,
      'onFocusOut': hover ? onHoverBlur : undefined,
    }),
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
        'data-preview-mode': previewMode,
        // hover 档是锚定瞬态浮层：材质家族配方画 frosted 面
        'data-xh-material': hover ? 'frosted' : undefined,
        // 首帧就开着（或收着）的预览直接呈现：露面的那一份换过之后才播展开与收起；
        // hover 档在卡片里轮换来源时就地换内容，不再播一次出现
        'data-instant': dataAttr(!moved || (hover && context.get('swapped'))),
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
    previewLinkText: item => (source(item.sourceId)?.type === 'source-document' ? labels.previewLinkDocument : labels.previewLinkSource),
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
    getPrevTriggerProps: item => pager(item, -1),
    getNextTriggerProps: item => pager(item, 1),
    getPreviewIndexProps: item => normalize.element({
      ...parts['preview-index'].attrs,
      // 位置是给眼睛看的；换来源后预览的可及名跟着换，读屏由此知道换到了哪一个
      'aria-hidden': true,
      'hidden': positionOf(item) === null || undefined,
    }),
    getPreviewPosition: positionOf,
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
