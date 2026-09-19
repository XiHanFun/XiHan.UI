/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 collapsible 相关实现。

import type { CollapsibleSchema } from './collapsible.types'
import { setup } from '@xihan-ui/core'

const { createMachine } = setup<CollapsibleSchema>()

// 受控（open 给定）时用户事件只发意图、不自改状态，由 watch 派发 CONTROLLED.* 回写。
export const collapsibleMachine = createMachine({
  name: 'collapsible',
  context: ({ cell }) => ({
    // 按压通道：trigger 被 Space / Enter 或触屏按住，与开合互相独立（Enter 在 keydown 即翻面，按压面不能随之丢）
    pressed: cell<boolean>(() => ({ defaultValue: false })),
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  watch: ({ track, prop, action }) => {
    track([() => prop('open')], () => action(['syncOpen']))
    // 按住途中转禁用：trigger 随即原生 disabled、不会再来 keyup，按压面由机器自己收
    track([() => prop('disabled')], () => action(['releaseWhenInert']))
  },
  // 按压通道挂根级：trigger 在两个状态下都在场；原生 disabled，程序化派发由 canPress 再守一次
  on: {
    'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
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
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['invokeOnOpen'] },
          { target: 'open', actions: ['invokeOnOpen'] },
        ],
        'CONTROLLED.OPEN': { target: 'open' },
      },
    },
    open: {
      on: {
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnClose'] },
        ],
        'TOGGLE': [
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
      canPress: ({ prop }) => !prop('disabled'),
    },
    actions: {
      startPress: ({ context }) => context.set('pressed', true),
      endPress: ({ context }) => context.set('pressed', false),
      releaseWhenInert: ({ context, prop }) => {
        if (prop('disabled'))
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
