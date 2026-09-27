/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 citation 相关实现。

import type { Direction, Size } from '@xihan-ui/core'
import type { CitationPreviewProps, CitationSchema, CitationSource, CitationSourceItemProps } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { citationSourceMetaText, citationSourceTitle } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { slotPaints } from '../../runtime/slot-content'
import { provideCitation, provideCitationSource, useCitationContext, useCitationSource } from './context'
import { useCitation } from './use-citation'

type CitationProps = CitationSchema['props']

export const XhCitationRoot = defineComponent({
  name: 'XhCitationRoot',
  props: {
    sources: { type: Array as PropType<CitationSource[]> },
    activeSourceId: { type: String as PropType<string | null> },
    defaultActiveSourceId: { type: String as PropType<string | null> },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    disabled: Boolean,
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction> },
    size: { type: String as PropType<Size> },
    translations: { type: Object as PropType<CitationProps['translations']> },
  },
  emits: {
    'active-source-change': (_details: PayloadOf<CitationProps, 'onActiveSourceChange'>) => true,
    'update:activeSourceId': (_sourceId: string | null) => true,
    'open-change': (_details: PayloadOf<CitationProps, 'onOpenChange'>) => true,
    'update:open': (_open: boolean) => true,
    'source-open': (_details: PayloadOf<CitationProps, 'onSourceOpen'>) => true,
  },
  setup(props, { emit, slots }) {
    const context = useCitation(withXhConfig('citation', {
      ...props,
      onActiveSourceChange: (details) => {
        emit('active-source-change', details)
        emit('update:activeSourceId', details.sourceId)
      },
      onOpenChange: (details) => {
        emit('open-change', details)
        emit('update:open', details.open)
      },
      onSourceOpen: details => emit('source-open', details),
    }) as CitationProps)
    provideCitation(context)
    return () => h('div', context.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCitationText = defineComponent({
  name: 'XhCitationText',
  setup(_, { slots }) {
    const { api } = useCitationContext()
    return () => h('span', api.value.getTextProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCitationTrigger = defineComponent({
  name: 'XhCitationTrigger',
  props: {
    sourceId: { type: String, required: true },
    citationId: String,
    anchorIndex: Number,
    disabled: Boolean,
  },
  setup(props, { slots }) {
    const { api } = useCitationContext()
    return () => h('button', api.value.getTriggerProps(props) as Record<string, unknown>, slots.default?.())
  },
})

export const XhCitationPreview = defineComponent({
  name: 'XhCitationPreview',
  props: {
    sourceId: { type: String, required: true },
    anchorIndex: Number,
  },
  setup(props, { slots }) {
    const { api } = useCitationContext()
    return () => {
      const authored = slots.default?.()
      const item: CitationPreviewProps = props
      return h('section', api.value.getPreviewProps(item) as Record<string, unknown>, slotPaints(authored)
        ? authored
        : renderPreview(api.value, item))
    }
  },
})

export const XhCitationSourceLink = defineComponent({
  name: 'XhCitationSourceLink',
  setup(_, { slots }) {
    const { api } = useCitationContext()
    const item = useCitationSource()
    return () => h('button', api.value.getSourceLinkProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhCitationSourceIndex = defineComponent({
  name: 'XhCitationSourceIndex',
  setup(_, { slots }) {
    const { api } = useCitationContext()
    const item = useCitationSource()
    return () => h('span', api.value.getSourceIndexProps(item.value) as Record<string, unknown>, slots.default?.() ?? `${api.value.sources.findIndex(source => source.sourceId === item.value.sourceId) + 1}`)
  },
})

function sourcePart(
  name: 'getSourceTitleProps' | 'getSourceMetaProps',
  slots: { default?: () => VNode[] },
): () => VNode {
  const { api } = useCitationContext()
  const item = useCitationSource()
  return () => {
    const current = api.value.sources.find(source => source.sourceId === item.value.sourceId)
    const text = name === 'getSourceTitleProps' ? citationSourceTitle(current) : citationSourceMetaText(current, 'Document')
    return h('span', api.value[name](item.value) as Record<string, unknown>, slots.default?.() ?? text)
  }
}

export const XhCitationSourceTitle = defineComponent({
  name: 'XhCitationSourceTitle',
  setup(_, { slots }) {
    return sourcePart('getSourceTitleProps', slots)
  },
})

export const XhCitationSourceMeta = defineComponent({
  name: 'XhCitationSourceMeta',
  setup(_, { slots }) {
    return sourcePart('getSourceMetaProps', slots)
  },
})

export const XhCitationSource = defineComponent({
  name: 'XhCitationSource',
  props: {
    sourceId: { type: String, required: true },
    disabled: Boolean,
  },
  setup(props, { slots }) {
    const { api } = useCitationContext()
    const item = computed<CitationSourceItemProps>(() => ({ sourceId: props.sourceId, disabled: props.disabled }))
    provideCitationSource(item)
    return () => h('li', api.value.getSourceProps(item.value) as Record<string, unknown>, slots.default?.() ?? [
      h(XhCitationSourceLink, null, () => [h(XhCitationSourceIndex), h('span', null, [h(XhCitationSourceTitle), h(XhCitationSourceMeta)])]),
    ])
  },
})

export const XhCitationList = defineComponent({
  name: 'XhCitationList',
  setup(_, { slots }) {
    const { api } = useCitationContext()
    return () => {
      const authored = slots.default?.()
      return h('ol', api.value.getListProps() as Record<string, unknown>, slotPaints(authored)
        ? authored
        : api.value.sources.map(source => h(XhCitationSource, { key: source.sourceId, sourceId: source.sourceId })))
    }
  },
})

function renderPreview(api: ReturnType<typeof useCitationContext>['api']['value'], item: CitationPreviewProps): VNode[] {
  const current = api.sources.find(source => source.sourceId === item.sourceId)
  if (!current)
    return []
  const anchorIndex = api.activeSourceId === item.sourceId ? api.activeAnchorIndex ?? item.anchorIndex ?? 0 : item.anchorIndex ?? 0
  const quote = current.anchors?.[anchorIndex]?.quote
  const linkTag = current.type === 'source-url' ? 'a' : 'button'
  return [
    h('header', api.getPreviewHeaderProps(item) as Record<string, unknown>, [
      h('span', null, [
        h('strong', api.getPreviewTitleProps(item) as Record<string, unknown>, citationSourceTitle(current)),
        h('span', api.getPreviewMetaProps(item) as Record<string, unknown>, citationSourceMetaText(current, 'Document')),
      ]),
      h('button', api.getDismissTriggerProps(item) as Record<string, unknown>),
    ]),
    h('blockquote', api.getQuoteProps(item) as Record<string, unknown>, quote),
    h(linkTag, api.getPreviewLinkProps(item) as Record<string, unknown>, current.type === 'source-url' ? 'Open source' : 'Open document'),
  ]
}
