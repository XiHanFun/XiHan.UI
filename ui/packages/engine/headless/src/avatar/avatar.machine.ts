/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 avatar 相关实现。

import type { AvatarSchema } from './avatar.types'
import { setTimeoutEffect, setup } from '@xihan-ui/core'
import { trackPartPresence } from '../shared/part-presence'

const { createMachine } = setup<AvatarSchema>()

/** 回退内容露面前的等待（毫秒），属性 fallbackDelay 的缺省值。 */
export const AVATAR_FALLBACK_DELAY = 300

/** 回退内容该不该露面：载好了不露；失败或没有 src 立即露；载入中等过了 fallbackDelay 才露。 */
export function avatarFallbackVisible(status: AvatarSchema['state'], fallbackDue: boolean): boolean {
  if (status === 'loaded')
    return false
  if (status === 'error')
    return true
  return fallbackDue
}

// 状态由 <img> 的 load / error 事件驱动
export const avatarMachine = createMachine({
  name: 'avatar',
  context: ({ cell }) => ({
    fallbackDue: cell<boolean>(() => ({ defaultValue: false })),
    fallbackRendered: cell<boolean>(() => ({ defaultValue: false })),
  }),
  // 首帧停在 idle，来源决议推迟到宿主提交一帧之后
  initialState: () => 'idle',
  effects: ['trackFallbackPresence'],
  watch: ({ track, prop, action }) => track([() => prop('src')], () => action(['syncSrc'])),
  // 换图在任意状态都重走一轮
  on: {
    'SRC.CHANGE': [
      { guard: 'hasSrc', target: 'loading' },
      { target: 'error' },
    ],
    'FALLBACK.DUE': { actions: ['markFallbackDue'] },
    'FALLBACK.RENDERED': { actions: ['setFallbackRendered'] },
  },
  states: {
    idle: {
      effects: ['resolveSrc', 'waitFallbackDelay'],
      // 决议落地前图片已就绪（缓存命中）时不丢事件
      on: {
        'IMAGE.LOAD': { target: 'loaded' },
        'IMAGE.ERROR': { target: 'error' },
      },
    },
    loading: {
      // 通知写在 entry，重复回写同一 src 不重复通知
      entry: ['invokeLoading'],
      effects: ['waitFallbackDelay'],
      on: {
        'IMAGE.LOAD': { target: 'loaded' },
        'IMAGE.ERROR': { target: 'error' },
      },
    },
    loaded: {
      entry: ['invokeLoaded'],
    },
    // 加载失败与没有 src 共用此落点
    error: {
      entry: ['invokeError'],
    },
  },
  implementations: {
    guards: {
      hasSrc: ({ prop }) => !!prop('src'),
    },
    actions: {
      invokeLoading: ({ prop }) => prop('onStatusChange')?.({ status: 'loading' }),
      invokeLoaded: ({ prop }) => prop('onStatusChange')?.({ status: 'loaded' }),
      invokeError: ({ prop }) => prop('onStatusChange')?.({ status: 'error' }),
      syncSrc: ({ send }) => send({ type: 'SRC.CHANGE' }),
      markFallbackDue: ({ context }) => context.set('fallbackDue', true),
      setFallbackRendered: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'FALLBACK.RENDERED')
          context.set('fallbackRendered', e.rendered)
      },
    },
    effects: {
      /** 载入中的回退内容等过 fallbackDelay 才露面；等过一次就一直算过。 */
      waitFallbackDelay: ({ context, prop, send }) => {
        if (context.get('fallbackDue'))
          return
        const delay = prop('fallbackDelay') ?? AVATAR_FALLBACK_DELAY
        if (!(delay > 0)) {
          send({ type: 'FALLBACK.DUE' })
          return
        }
        return setTimeoutEffect(() => send({ type: 'FALLBACK.DUE' }), delay)
      },
      /** 回退内容露面即刻显出；图片载好后先淡出（与图片淡入交叉），播完才写 hidden。 */
      trackFallbackPresence: ({ state, context, scope, send, track, flush }) => trackPartPresence({
        scope,
        id: scope.partId('avatar', 'fallback'),
        open: () => avatarFallbackVisible(state.get(), context.get('fallbackDue')),
        track,
        flush,
        onRenderedChange: rendered => send({ type: 'FALLBACK.RENDERED', rendered }),
      }),
      // 推迟到宿主提交一帧之后再决议，离开 idle 后回调作废
      resolveSrc: ({ send, flush }) => {
        let disposed = false

        flush(() => {
          if (!disposed)
            send({ type: 'SRC.CHANGE' })
        })

        return () => {
          disposed = true
        }
      },
    },
  },
})
