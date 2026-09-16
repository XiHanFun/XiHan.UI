/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 button 相关实现。

import type { ButtonSchema } from './button.types'
import { setup } from '@xihan-ui/core'

const { createMachine } = setup<ButtonSchema>()

// 按钮没有业务状态：激活（click）交给平台，禁用 / 加载由 props 与原生伪类表达。
// 机器只承载按压通道——Space / Enter 与触屏按住期间的 context.pressed（投影 data-pressed），
// 让键盘与触屏看见和指针 :active 同一副按压面。禁用或进入加载途中按住的一律松开。无副作用。
export const buttonMachine = createMachine({
  name: 'button',
  context: ({ cell }) => ({
    pressed: cell<boolean>(() => ({ defaultValue: false })),
  }),
  initialState: () => 'idle',
  watch: ({ track, prop, action }) => track([() => prop('disabled'), () => prop('loading')], () => action(['releaseWhenInert'])),
  states: {
    idle: {
      on: {
        'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
        'PRESS.END': { actions: ['endPress'] },
      },
    },
  },
  implementations: {
    guards: {
      canPress: ({ prop }) => !prop('disabled') && !prop('loading'),
    },
    actions: {
      startPress: ({ context }) => context.set('pressed', true),
      endPress: ({ context }) => context.set('pressed', false),
      // 按住途中被禁用或转入加载：原生 disabled 的按钮不再派 keyup / blur，按压面得由机器自己收
      releaseWhenInert: ({ context, prop }) => {
        if (prop('disabled') || prop('loading'))
          context.set('pressed', false)
      },
    },
  },
})
