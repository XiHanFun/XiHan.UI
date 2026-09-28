/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 infinite scroll 相关实现。

import type { Disposable } from '@xihan-ui/core'
import type { InfiniteScrollPhase, InfiniteScrollSchema } from './infinite-scroll.types'
import { createViewportEntry, setup } from '@xihan-ui/core'

const { createMachine } = setup<InfiniteScrollSchema>()

/** 由两个开关算出该落在哪一段：关掉优先于取数中。 */
export function resolveInfiniteScrollPhase(disabled: boolean | undefined, loading: boolean | undefined): InfiniteScrollPhase {
  if (disabled)
    return 'paused'
  return loading ? 'loading' : 'idle'
}

/**
 * 无限滚动机器。
 *
 * 观察器只在 idle 挂着：取数中与关掉两段都不观察，哨兵留在可视区里也不会连着触发第二次。
 * 取数的进度归宿主：loading 由宿主写入，写回 false 才回到 idle 重新挂上观察器。
 */
export const infiniteScrollMachine = createMachine({
  name: 'infinite-scroll',
  context: ({ cell }) => ({
    // 按压通道：取下一页的按钮被 Space / Enter 或触屏按住
    pressed: cell<boolean>(() => ({ defaultValue: false })),
  }),
  refs: () => ({
    getSentinelEl: () => null,
    getTargetEl: () => null,
  }),
  initialState: ({ prop }) => resolveInfiniteScrollPhase(prop('disabled'), prop('loading')),
  watch: ({ track, prop, action }) => {
    track([() => prop('disabled'), () => prop('loading')], () => action(['syncMode']))
  },
  on: {
    'MODE.SYNC': [
      { guard: 'isPaused', target: 'paused' },
      { guard: 'isLoading', target: 'loading' },
      { target: 'idle' },
    ],
    // 按压通道挂根级：按钮原生 disabled 时不派事件，程序化派发由 canPress 再守一次
    'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
  },
  states: {
    idle: {
      effects: ['observeSentinel'],
      on: {
        // 只报意图，不自己切到 loading：取不取、什么时候取完，宿主说了算
        'SENTINEL.ENTER': { actions: ['invokeOnLoad'] },
        // 按钮与哨兵是同一条通路的两个入口，取数中与关掉两段同样不响应
        'LOAD': { actions: ['invokeOnLoad'] },
      },
    },
    // 这两段都不挂观察器，哨兵进出可视区一律不响应。
    // 进段即松开：按住 Enter 把「取下一页」报出去、宿主随即写回 loading，按钮转原生 disabled 不会再来 keyup
    loading: { entry: ['releasePress'], effects: ['keepScrollPosition'] },
    paused: { entry: ['releasePress'] },
  },
  implementations: {
    guards: {
      isPaused: ({ prop }) => !!prop('disabled'),
      isLoading: ({ prop }) => !!prop('loading'),
      canPress: ({ prop }) => !prop('disabled') && !prop('loading'),
    },
    actions: {
      syncMode: ({ send }) => send({ type: 'MODE.SYNC' }),
      invokeOnLoad: ({ prop }) => prop('onLoad')?.(),
      startPress: ({ context }) => context.set('pressed', true),
      endPress: ({ context }) => context.set('pressed', false),
      releasePress: ({ context }) => context.set('pressed', false),
    },
    effects: {
      /**
       * 哨兵观察器。推迟一拍再挂：挂载这一刻哨兵节点未必就位。
       * 无 DOM 环境（宿主没有 IntersectionObserver）建不出观察器，这一段就整个让位，不抛错也不轮询。
       */
      observeSentinel: ({ refs, prop, scope, send, flush }) => {
        let disposed = false
        let entry: Disposable | null = null

        flush(() => {
          if (disposed)
            return
          entry = createViewportEntry({
            scope,
            target: () => refs.get('getSentinelEl')(),
            // 提前量扩的是这块可视区，滚在容器里就得把容器交出来
            container: () => refs.get('getTargetEl')(),
            distance: prop('distance'),
            onEnter: () => send({ type: 'SENTINEL.ENTER' }),
          })
        })

        return () => {
          disposed = true
          entry?.dispose()
        }
      },

      /**
       * 往前取数时保住视口：取数期间盯住滚动容器的子树，内容一插进来就把滚动量补上插入的那截高度，
       * 保持可视区离内容底部的距离不变。补在 MutationObserver 的回调里：它排在绘制之前，插入与补偿落在同一帧，不闪。
       * 用户在取数期间自己滚了，就以新的位置为准。
       * 宿主往往在同一轮里写回 loading=false 并插入新内容，框架的 DOM 提交可能晚于状态转移，离开 loading 后再守两帧。
       */
      keepScrollPosition: ({ prop, refs, scope }) => {
        if (prop('edge') !== 'start')
          return
        const doc = scope.getDoc()
        const win = scope.getWin()
        const target = refs.get('getTargetEl')() ?? (doc.scrollingElement as HTMLElement | null)
        if (!target || typeof win.MutationObserver !== 'function')
          return
        let distance = target.scrollHeight - target.scrollTop
        const restore = (): void => {
          const next = target.scrollHeight - distance
          if (Math.abs(next - target.scrollTop) >= 1)
            target.scrollTop = next
        }
        const onScroll = (): void => {
          distance = target.scrollHeight - target.scrollTop
        }
        // 整页滚动时 scroll 事件派在窗口上
        const scroller: EventTarget = target === doc.scrollingElement ? win : target
        scroller.addEventListener('scroll', onScroll, { passive: true })
        const observer = new win.MutationObserver(restore)
        observer.observe(target, { childList: true, subtree: true, characterData: true })
        const stop = (): void => {
          observer.disconnect()
          scroller.removeEventListener('scroll', onScroll)
        }
        return () => {
          if (typeof win.requestAnimationFrame !== 'function') {
            stop()
            return
          }
          win.requestAnimationFrame(() => win.requestAnimationFrame(() => {
            restore()
            stop()
          }))
        }
      },
    },
  },
})
