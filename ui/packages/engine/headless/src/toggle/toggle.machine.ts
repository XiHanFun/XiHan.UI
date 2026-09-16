/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toggle 相关实现。

import type { ToggleSchema } from './toggle.types'
import { setup } from '@xihan-ui/core'

const { createMachine } = setup<ToggleSchema>()

// 受控（pressed 给定）时用户事件只发意图、不自改状态；宿主写回 pressed 后
// 由 watch 派发影子事件 CONTROLLED.* 无条件回写。无副作用。
// 按压通道（context.pressed）与开关态无关：两个状态都认 PRESS.*，禁用中途按住的一律松开。
export const toggleMachine = createMachine({
  name: 'toggle',
  context: ({ cell }) => ({
    pressed: cell<boolean>(() => ({ defaultValue: false })),
  }),
  initialState: ({ prop }) => ((prop('pressed') ?? prop('defaultPressed')) ? 'on' : 'off'),
  watch: ({ track, prop, action }) => {
    track([() => prop('pressed')], () => action(['syncPressed']))
    track([() => prop('disabled')], () => action(['releaseWhenDisabled']))
  },
  on: {
    'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
  },
  states: {
    off: {
      on: {
        'TOGGLE': [
          { guard: 'isPressedControlled', actions: ['invokeOnPress'] },
          { target: 'on', actions: ['invokeOnPress'] },
        ],
        'CONTROLLED.ON': { target: 'on' },
      },
    },
    on: {
      on: {
        'TOGGLE': [
          { guard: 'isPressedControlled', actions: ['invokeOnUnpress'] },
          { target: 'off', actions: ['invokeOnUnpress'] },
        ],
        'CONTROLLED.OFF': { target: 'off' },
      },
    },
  },
  implementations: {
    guards: {
      isPressedControlled: ({ prop }) => prop('pressed') !== undefined,
      canPress: ({ prop }) => !prop('disabled'),
    },
    actions: {
      invokeOnPress: ({ prop }) => prop('onPressedChange')?.({ pressed: true }),
      invokeOnUnpress: ({ prop }) => prop('onPressedChange')?.({ pressed: false }),
      startPress: ({ context }) => context.set('pressed', true),
      endPress: ({ context }) => context.set('pressed', false),
      // 按住途中被禁用：原生 disabled 的按钮不再派 keyup / blur，按压面得由机器自己收
      releaseWhenDisabled: ({ context, prop }) => {
        if (prop('disabled'))
          context.set('pressed', false)
      },
      syncPressed: ({ prop, send }) => {
        const pressed = prop('pressed')
        if (pressed === undefined)
          return
        send(pressed ? { type: 'CONTROLLED.ON' } : { type: 'CONTROLLED.OFF' })
      },
    },
  },
})
