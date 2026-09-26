/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 log 相关实现。

import type { StickToBottomHandle } from '@xihan-ui/core'
import type { LogSchema } from './log.types'
import { createStickToBottom, setup } from '@xihan-ui/core'
import { trackPartPresence } from '../shared/part-presence'

const { createMachine } = setup<LogSchema>()

// 机器只管粘底与「回到底部」，另承载按压通道：Space / Enter 与触屏按住期间的 context.pressed
// （scroll-to-end-trigger 投影 data-pressed），让键盘与触屏看见和指针 :active 同一副按压面。
// 按钮只在离底时在场：在底时它带 hidden，不进按压面；按住途中回到底部（Enter 在 keydown 即 click 滚回去）
// 按钮随之收起，不会再来 keyup / blur，按压面随贴底回报一并收。
export const logMachine = createMachine({
  name: 'log',
  context: ({ cell }) => ({
    // 初值为在底且粘附，真实几何由句柄的第一次回报补上
    atBottom: cell<boolean>(() => ({ defaultValue: true })),
    sticking: cell<boolean>(() => ({ defaultValue: true })),
    pressed: cell<boolean>(() => ({ defaultValue: false })),
    // 与 atBottom 的初值对上：起步在底，按钮收着
    triggerRendered: cell<boolean>(() => ({ defaultValue: false })),
  }),
  refs: () => ({
    config: null,
    getViewportEl: () => null,
    getContentEl: () => null,
    stick: null,
  }),
  initialState: () => 'idle',
  // 粘底与回到底部按钮的进退场两路副作用全程挂载
  effects: ['trackStickToBottom', 'trackTriggerPresence'],
  states: {
    idle: {
      on: {
        'STICK.CHANGE': { actions: ['setStickState'] },
        'SCROLL_TO_BOTTOM': { actions: ['invokeScrollToBottom'] },
        'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
        'PRESS.END': { actions: ['endPress'] },
        'TRIGGER.RENDERED': { actions: ['setTriggerRendered'] },
      },
    },
  },
  implementations: {
    guards: {
      // 在底时按钮带 hidden、本就不可按；程序化派发再守一次
      canPress: ({ context }) => !context.get('atBottom'),
    },
    actions: {
      setTriggerRendered: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'TRIGGER.RENDERED')
          context.set('triggerRendered', e.rendered)
      },
      setStickState: ({ event, context, prop }) => {
        const e = event.current()
        if (e.type !== 'STICK.CHANGE')
          return
        context.set('atBottom', e.atBottom)
        context.set('sticking', e.sticking)
        // 回到底部即收起按钮：被按住的那一下不会再来 keyup，按压面在这里一并收
        if (e.atBottom)
          context.set('pressed', false)
        // 句柄只在值变化时回报，此处直接转发
        prop('onStickChange')?.({ atBottom: e.atBottom, sticking: e.sticking })
      },
      startPress: ({ context }) => context.set('pressed', true),
      endPress: ({ context }) => context.set('pressed', false),

      // 句柄缺席时不做任何事
      invokeScrollToBottom: ({ refs }) => {
        refs.get('stick')?.scrollToBottom()
      },
    },
    effects: {
      /** 回到底部按钮离底时冒出来、回底时播完退场再藏起。 */
      trackTriggerPresence: ({ context, scope, send, track, flush }) => trackPartPresence({
        scope,
        id: scope.partId('log', 'scroll-to-end-trigger'),
        open: () => !context.get('atBottom'),
        track,
        flush,
        onRenderedChange: rendered => send({ type: 'TRIGGER.RENDERED', rendered }),
      }),

      /** 在 flush 时创建粘底句柄并存入 refs，卸载时释放；config 缺席则不创建。 */
      trackStickToBottom: ({ refs, prop, send, flush }) => {
        let disposed = false
        let handle: StickToBottomHandle | undefined

        flush(() => {
          if (disposed)
            return
          const config = refs.get('config')
          if (!config)
            return
          handle = createStickToBottom({
            config,
            scrollEl: refs.get('getViewportEl'),
            contentEl: refs.get('getContentEl'),
            threshold: prop('threshold'),
            onChange: s => send({ type: 'STICK.CHANGE', atBottom: s.atBottom, sticking: s.sticking }),
          })
          refs.set('stick', handle)
        })

        return () => {
          disposed = true
          handle?.dispose()
          // 句柄已释放，同时清掉 ref
          refs.set('stick', null)
        }
      },
    },
  },
})
