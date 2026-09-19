/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 alert 相关实现。

import type { AlertSchema } from './alert.types'
import { setup } from '@xihan-ui/core'

const { createMachine } = setup<AlertSchema>()

// 受控（open 给定）时用户事件只发意图、不自改状态，由 watch 派发 CONTROLLED.* 回写。
export const alertMachine = createMachine({
  name: 'alert',
  // 提示是页面流里常驻的一块，没给任何显隐声明就是显示
  context: ({ cell }) => ({
    // 按压通道：关闭按钮被 Space / Enter 或触屏按住
    pressed: cell<boolean>(() => ({ defaultValue: false })),
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen') ?? true) ? 'open' : 'closed'),
  watch: ({ track, prop, action }) => {
    track([() => prop('open')], () => action(['syncOpen']))
    // 按住途中转成不可关闭：按钮随即 disabled 并收起、不会再来 keyup，按压面由机器自己收
    track([() => prop('closable') ?? true], () => action(['releaseWhenInert']))
  },
  // 按压通道的松开挂根级：收起后才到的 keyup / blur 也认，不留残留
  on: {
    'PRESS.END': { actions: ['endPress'] },
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
          { target: 'closed', actions: ['invokeOnClose'] },
        ],
        'CONTROLLED.CLOSE': { target: 'closed' },
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
  },
})
