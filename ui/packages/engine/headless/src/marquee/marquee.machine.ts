/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 marquee 相关实现。

import type { MarqueeSchema } from './marquee.types'
import { setup } from '@xihan-ui/core'

const { createMachine } = setup<MarqueeSchema>()

/**
 * 跑马灯机器：只管暂停。
 *
 * 滚动整段在皮肤的 @keyframes 里，机器不排任何时间。暂停状态住在 cell 里，受控 / 非受控在 cell 收口：
 * 暂停开关与 setPaused 都写它，受控时只发 onPausedChange、由作者写回。
 * 悬停与聚焦的临时暂停是皮肤的 :hover / :focus-within，不经机器，也不改这里的状态。
 */
export const marqueeMachine = createMachine({
  name: 'marquee',
  context: ({ prop, cell }) => ({
    paused: cell<boolean>(() => ({
      value: prop('paused'),
      defaultValue: prop('defaultPaused') ?? false,
      onChange: paused => prop('onPausedChange')?.({ paused }),
    })),
    // 按压通道：暂停开关被 Space / Enter 或触屏按住期间为 true
    pressed: cell<boolean>(() => ({ defaultValue: false })),
  }),
  initialState: () => 'idle',
  on: {
    'PAUSED.SET': { actions: ['setPaused'] },
    'PAUSED.TOGGLE': { actions: ['togglePaused'] },
    'PRESS.START': { actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
  },
  states: { idle: {} },
  implementations: {
    actions: {
      setPaused: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PAUSED.SET')
          context.set('paused', e.paused)
      },
      togglePaused: ({ context }) => context.set('paused', !context.get('paused')),
      startPress: ({ context }) => context.set('pressed', true),
      endPress: ({ context }) => context.set('pressed', false),
    },
  },
})
