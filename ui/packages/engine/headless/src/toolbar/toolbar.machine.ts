/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toolbar 相关实现。

import type { ToolbarSchema } from './toolbar.types'
import { setup } from '@xihan-ui/core'

const { createMachine } = setup<ToolbarSchema>()

// 工具条没有自己的值，条目的按下态、选中值、展开态都归条目自己。
// 机器只记焦点当下停在哪个条目上，它同时是 roving tabindex 的锚点与方向键的起点。
// 锚点不受控、不对外通知，只有一个状态，transition 省略 target 即只跑 actions。
export const toolbarMachine = createMachine({
  name: 'toolbar',
  context: ({ cell }) => ({
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    // 按压通道：正被按住的条目，与焦点锚点互相独立（锚点跨条目移动，按压面只跟按住的那一个走）
    pressedValue: cell<string | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  // 按住途中整条转禁用：条目只是 aria-disabled、仍有焦点，但按压面不该留在禁用面上
  watch: ({ track, prop, action }) => {
    track([() => prop('disabled')], () => action(['releaseWhenInert']))
  },
  states: {
    idle: {
      on: {
        'ITEM.FOCUS': { actions: ['setFocusedValue'] },
        'TOOLBAR.BLUR': { actions: ['clearFocusedValue'] },
        'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
        'PRESS.END': { actions: ['endPress'] },
      },
    },
  },
  implementations: {
    guards: {
      // 整条禁用一票否决；条目自己的禁用只有 connect 知道，随 PRESS.START 带进来
      canPress: ({ prop, event }) => {
        const e = event.current()
        return e.type === 'PRESS.START' && !prop('disabled') && !e.disabled
      },
    },
    actions: {
      startPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.START')
          context.set('pressedValue', e.value)
      },
      // 只收自己那一下：别的条目的 keyup 不该把正按着的这个松开
      endPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.END' && context.get('pressedValue') === e.value)
          context.set('pressedValue', null)
      },
      releaseWhenInert: ({ context, prop }) => {
        if (prop('disabled'))
          context.set('pressedValue', null)
      },
      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.FOCUS')
          context.set('focusedValue', e.value)
      },
      // 焦点离场即清锚点，root 据此重新认领 Tab 位
      clearFocusedValue: ({ context }) => context.set('focusedValue', null),
    },
  },
})
