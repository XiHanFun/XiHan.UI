/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 citation 相关实现。

import type { Scope } from '@xihan-ui/core'
import type { CitationSchema } from './citation.types'
import { setup } from '@xihan-ui/core'
import { citationAnatomy } from './citation.anatomy'

const { createMachine } = setup<CitationSchema>()

/** 某份预览的 id：连接层按它发 id，机器按它找节点量高度、等退场。 */
export function citationPreviewId(scope: Scope, sourceId: string): string {
  return scope.partId(citationAnatomy.name, `preview:${sourceId}`)
}

/**
 * 预览内容区的高度：滚动高度扣掉此刻的上下内缩。展开动画的首帧内缩是 0、滚动高度就是内容高度；
 * 静止时两边都带着内缩——两种情形算出来都是内容区本身的高度。没排版（收起、不在文档里）时量不到。
 */
function contentBlockSize(scope: Scope, node: HTMLElement): number | null {
  if (!node.getClientRects().length)
    return null
  const style = scope.getComputedStyle(node)
  return node.scrollHeight - Number.parseFloat(style.paddingTop) - Number.parseFloat(style.paddingBottom)
}

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
    // 首帧就露面的那一份：开着且是当前来源
    shownSourceId: cell<string | null>(() => ({
      defaultValue: (prop('open') ?? prop('defaultOpen') ?? false)
        ? prop('activeSourceId') ?? prop('defaultActiveSourceId') ?? prop('sources')?.[0]?.sourceId ?? null
        : null,
    })),
    leavingSourceId: cell<string | null>(() => ({ defaultValue: null })),
    moved: cell<boolean>(() => ({ defaultValue: false })),
    previewBlockSizes: cell<Readonly<Record<string, number>>>(() => ({ defaultValue: {} })),
  }),
  initialState: () => 'idle',
  watch: ({ track, prop, action, context }) => {
    track([() => prop('disabled')], () => {
      if (prop('disabled'))
        action(['clearFocus'])
    })
    // 露面的预览换了（开、关、换来源，含宿主受控写回）：旧的一份退场，新的一份展开
    track([context.dep('open'), context.dep('activeSourceId')], () => action(['syncPreview']))
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
        'PREVIEW.MEASURED': { actions: ['setPreviewBlockSize'] },
        'PREVIEW.LEFT': { actions: ['clearLeaving'] },
      },
    },
  },
  implementations: {
    actions: {
      /**
       * 露面的预览换了：旧的一份进退场、新的一份展开。
       * 宿主把这一帧提交出去之后，量下新露面那一份的内容区高度（展开从 0 长到它）；
       * 收起的那一份等它身上在播的退场动画播完才报「可以藏起」，没有可等的动画即刻报。
       */
      syncPreview: ({ context, scope, send, flush }) => {
        const next = context.get('open') ? context.get('activeSourceId') : null
        const prev = context.get('shownSourceId')
        if (prev === next)
          return
        context.set('moved', true)
        if (prev != null) {
          // 收起前量下内容区高度：此刻节点还是露面时的样子；宿主已先一步藏起时沿用展开时量下的那一版
          const node = scope.getById(citationPreviewId(scope, prev))
          const blockSize = node ? contentBlockSize(scope, node) : null
          if (blockSize != null)
            context.set('previewBlockSizes', { ...context.get('previewBlockSizes'), [prev]: blockSize })
          context.set('leavingSourceId', prev)
        }
        // 退场途中又露面：当场展开，不再等那一段退场
        if (next != null && context.get('leavingSourceId') === next)
          context.set('leavingSourceId', null)
        context.set('shownSourceId', next)

        const leaving = context.get('leavingSourceId')
        flush(() => {
          if (next != null && context.get('shownSourceId') === next) {
            const node = scope.getById(citationPreviewId(scope, next))
            const blockSize = node ? contentBlockSize(scope, node) : null
            if (blockSize != null)
              send({ type: 'PREVIEW.MEASURED', sourceId: next, blockSize })
          }
          if (leaving == null || context.get('leavingSourceId') !== leaving)
            return
          const node = scope.getById(citationPreviewId(scope, leaving))
          const animations = node && typeof node.getAnimations === 'function'
            ? node.getAnimations().filter((animation) => {
                const end = animation.effect?.getComputedTiming().endTime
                return Number.isFinite(Number(end)) && Number(end) > 0 && animation.playState !== 'finished'
              })
            : []
          void Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
            send({ type: 'PREVIEW.LEFT', sourceId: leaving })
          })
        })
      },
      setPreviewBlockSize: ({ context, event }) => {
        const current = event.current()
        if (current.type === 'PREVIEW.MEASURED')
          context.set('previewBlockSizes', { ...context.get('previewBlockSizes'), [current.sourceId]: current.blockSize })
      },
      clearLeaving: ({ context, event }) => {
        const current = event.current()
        if (current.type === 'PREVIEW.LEFT' && context.get('leavingSourceId') === current.sourceId)
          context.set('leavingSourceId', null)
      },
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
