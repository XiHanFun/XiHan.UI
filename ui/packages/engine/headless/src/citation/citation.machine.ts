/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 citation 相关实现。

import type { CitationSchema } from './citation.types'
import { setup } from '@xihan-ui/core'

const { createMachine } = setup<CitationSchema>()

export const citationMachine = createMachine({
  name: 'citation',
  context: ({ prop, cell }) => ({
    activeSourceId: cell<string | null>(() => ({
      value: prop('activeSourceId'),
      defaultValue: prop('defaultActiveSourceId') ?? prop('sources')?.[0]?.sourceId ?? null,
      onChange: sourceId => prop('onActiveSourceChange')?.({ sourceId }),
    })),
    open: cell<boolean>(() => ({
      value: prop('open'),
      defaultValue: prop('defaultOpen') ?? false,
      onChange: open => prop('onOpenChange')?.({ open }),
    })),
    focusedSourceId: cell<string | null>(() => ({ defaultValue: null })),
    activeAnchorIndex: cell<number | null>(() => ({ defaultValue: null })),
    activeTriggerId: cell<string | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  watch: ({ track, prop, action }) => {
    track([() => prop('disabled')], () => {
      if (prop('disabled'))
        action(['clearFocus'])
    })
  },
  states: {
    idle: {
      on: {
        'CITATION.ACTIVATE': { actions: ['activateCitation'] },
        'SOURCE.ACTIVATE': { actions: ['activateSource'] },
        'SOURCE.OPEN': { actions: ['invokeSourceOpen'] },
        'SOURCE.FOCUS': { actions: ['setFocusedSource'] },
        'LIST.BLUR': { actions: ['clearFocus'] },
        'OPEN.SET': { actions: ['setOpen'] },
      },
    },
  },
  implementations: {
    actions: {
      activateCitation: ({ context, event }) => {
        const current = event.current()
        if (current.type !== 'CITATION.ACTIVATE')
          return
        const same = context.get('activeSourceId') === current.sourceId
          && context.get('activeAnchorIndex') === current.anchorIndex
        context.set('activeSourceId', current.sourceId)
        context.set('activeAnchorIndex', current.anchorIndex)
        context.set('activeTriggerId', current.triggerId)
        context.set('open', current.toggle && same ? !context.get('open') : true)
      },
      activateSource: ({ context, event }) => {
        const current = event.current()
        if (current.type !== 'SOURCE.ACTIVATE')
          return
        context.set('activeSourceId', current.sourceId)
        context.set('activeAnchorIndex', null)
        context.set('activeTriggerId', null)
        context.set('open', true)
      },
      invokeSourceOpen: ({ prop, event }) => {
        const current = event.current()
        if (current.type !== 'SOURCE.OPEN')
          return
        const source = prop('sources')?.find(item => item.sourceId === current.sourceId)
        if (!source)
          return
        prop('onSourceOpen')?.({
          sourceId: current.sourceId,
          source,
          anchor: source.anchors?.[current.anchorIndex ?? 0] ?? null,
        })
      },
      setFocusedSource: ({ context, event }) => {
        const current = event.current()
        if (current.type === 'SOURCE.FOCUS')
          context.set('focusedSourceId', current.sourceId)
      },
      clearFocus: ({ context }) => context.set('focusedSourceId', null),
      setOpen: ({ context, event }) => {
        const current = event.current()
        if (current.type === 'OPEN.SET')
          context.set('open', current.open)
      },
    },
  },
})
