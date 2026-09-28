/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 alert 相关实现。

import type { AlertSchema } from './alert.types'
import { setup } from '@xihan-ui/core'
import { trackPartPresence } from '../shared/part-presence'

const { createMachine } = setup<AlertSchema>()

// 受控（open 给定）时用户事件只发意图、不自改状态，由 watch 派发 CONTROLLED.* 回写。
export const alertMachine = createMachine({
  name: 'alert',
  // 提示是页面流里常驻的一块，没给任何显隐声明就是显示
  context: ({ cell, prop }) => ({
    // 按压通道：关闭按钮被 Space / Enter 或触屏按住
    pressed: cell<boolean>(() => ({ defaultValue: false })),
    rendered: cell<boolean>(() => ({ defaultValue: prop('open') ?? prop('defaultOpen') ?? true })),
    exitBlockSize: cell<number | null>(() => ({ defaultValue: null })),
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen') ?? true) ? 'open' : 'closed'),
  effects: ['trackRootPresence'],
  watch: ({ track, prop, action }) => {
    track([() => prop('open')], () => action(['syncOpen']))
    // 按住途中转成不可关闭：按钮随即 disabled 并收起、不会再来 keyup，按压面由机器自己收
    track([() => prop('closable') ?? true], () => action(['releaseWhenInert']))
  },
  // 按压通道的松开挂根级：收起后才到的 keyup / blur 也认，不留残留
  on: {
    'PRESS.END': { actions: ['endPress'] },
    'ROOT.RENDERED': { actions: ['setRendered'] },
  },
  states: {
    closed: {
      on: {
        // 受控命中 → 只发意图；非受控 → 落 target 并一并通知
        'OPEN': [
          { guard: 'isOpenControlled', actions: ['invokeOnOpen'] },
          { target: 'open', actions: ['invokeOnOpen'] },
        ],
        'CONTROLLED.OPEN': { target: 'open' },
      },
    },
    open: {
      // 收起即松开：按住 Enter 关掉提示，关闭按钮随 root 一起藏起，不会再来 keyup 或 blur
      exit: ['endPress'],
      on: {
        // 按压只在显示时进；关闭按钮原生 disabled，程序化派发由 canPress 再守一次
        'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['measureExit', 'invokeOnClose'] },
        ],
        'CONTROLLED.CLOSE': { target: 'closed', actions: ['measureExit'] },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
      canPress: ({ prop }) => prop('closable') ?? true,
    },
    actions: {
      startPress: ({ context }) => context.set('pressed', true),
      endPress: ({ context }) => context.set('pressed', false),
      releaseWhenInert: ({ context, prop }) => {
        if (!(prop('closable') ?? true))
          context.set('pressed', false)
      },
      /**
       * 收起前量下整块高度：退场收占位要从这个高度收到 0，而 auto 的高度过渡不出来。
       * 在状态翻转之前量，这一刻节点仍是显示时的样子；量不到（无 DOM）记 null，皮肤只淡出。
       */
      measureExit: ({ context, scope }) => {
        const node = scope.getById(scope.partId('alert', 'root'))
        context.set('exitBlockSize', node ? node.getBoundingClientRect().height : null)
      },
      setRendered: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'ROOT.RENDERED')
          return
        context.set('rendered', e.rendered)
        if (!e.rendered)
          context.set('exitBlockSize', null)
      },
      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop }) => prop('onOpenChange')?.({ open: false }),
      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制收起
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },
    },
    effects: {
      /**
       * 根节点的进退场：收起时不当场写 hidden，等根上的退场动画（先淡出、再收起占位）播完才藏起，
       * 下面的内容跟着一路平移上来，而不是整块跳上来。重新显示时即刻露面。
       */
      trackRootPresence: ({ state, scope, send, track, flush }) => trackPartPresence({
        scope,
        id: scope.partId('alert', 'root'),
        open: () => state.matches('open'),
        track,
        flush,
        onRenderedChange: rendered => send({ type: 'ROOT.RENDERED', rendered }),
      }),
    },
  },
})
