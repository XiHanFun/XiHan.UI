/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 switch 相关实现。

import type { SwitchSchema } from './switch.types'
import { setup } from '@xihan-ui/core'

const { createMachine } = setup<SwitchSchema>()

// 受控（checked 给定）与 dialog 同构：用户事件只发意图、不自改状态；宿主写回 checked 后
// 由 watch 派发影子事件 CONTROLLED.* 无条件回写。无副作用（switch 不挂 DOM effect）。
export const switchMachine = createMachine({
  name: 'switch',
  context: ({ cell }) => ({
    // 按压通道：Space / Enter 与触屏按住期间为 true，与开关态无关（两个状态下都认 PRESS.*）
    pressed: cell<boolean>(() => ({ defaultValue: false })),
  }),
  initialState: ({ prop }) => ((prop('checked') ?? prop('defaultChecked')) ? 'on' : 'off'),
  watch: ({ track, prop, action }) => {
    track([() => prop('checked')], () => action(['syncChecked']))
    // 按住途中转入禁用、提交中或只读：原生 disabled 的按钮不再派 keyup / blur，提交中的轨道也不该停在按下面
    track([() => prop('disabled'), () => prop('loading'), () => prop('readOnly')], () => action(['releaseWhenInert']))
  },
  // 表单重置从两个状态都要认，所以挂根级。状态就是值，回落靠转移而不是写 context：
  // 受控时只发意图（前两条命中即止），非受控才真的转过去。
  // 按压通道同样挂根级：按住途中开关态会翻（Enter 在 keydown 那一刻就 click），按压面不能随状态丢
  on: {
    'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
    'FORM.RESET': [
      { guard: 'isCheckedControlled', actions: ['invokeReset'] },
      { guard: 'defaultsToChecked', target: 'on', actions: ['invokeReset'] },
      { target: 'off', actions: ['invokeReset'] },
    ],
  },
  states: {
    off: {
      on: {
        'TOGGLE': [
          { guard: 'isCheckedControlled', actions: ['invokeOnCheck'] },
          { target: 'on', actions: ['invokeOnCheck'] },
        ],
        'CONTROLLED.ON': { target: 'on' },
      },
    },
    on: {
      on: {
        'TOGGLE': [
          { guard: 'isCheckedControlled', actions: ['invokeOnUncheck'] },
          { target: 'off', actions: ['invokeOnUncheck'] },
        ],
        'CONTROLLED.OFF': { target: 'off' },
      },
    },
  },
  implementations: {
    guards: {
      isCheckedControlled: ({ prop }) => prop('checked') !== undefined,
      defaultsToChecked: ({ prop }) => !!prop('defaultChecked'),
      // 禁用、提交中与只读都不进按压面：后两者仍可聚焦，但按下去什么都不会发生，也就不该有按下的回执
      canPress: ({ prop }) => !prop('disabled') && !prop('loading') && !prop('readOnly'),
    },
    actions: {
      startPress: ({ context }) => context.set('pressed', true),
      endPress: ({ context }) => context.set('pressed', false),
      releaseWhenInert: ({ context, prop }) => {
        if (prop('disabled') || prop('loading') || prop('readOnly'))
          context.set('pressed', false)
      },
      invokeOnCheck: ({ prop }) => prop('onCheckedChange')?.({ checked: true }),
      invokeOnUncheck: ({ prop }) => prop('onCheckedChange')?.({ checked: false }),
      // 受控且宿主没声明 defaultChecked 时不发：那句兜底的 false 是组件的空值、不是宿主说过的默认值
      invokeReset: ({ prop, state }) => {
        if (prop('checked') !== undefined && prop('defaultChecked') === undefined)
          return
        const next = !!prop('defaultChecked')
        // 已经停在默认态就不白发一次：原生重置也不会为没变的控件派事件
        if (state.matches(next ? 'on' : 'off'))
          return
        prop('onCheckedChange')?.({ checked: next })
      },
      syncChecked: ({ prop, send }) => {
        const checked = prop('checked')
        if (checked === undefined)
          return
        send(checked ? { type: 'CONTROLLED.ON' } : { type: 'CONTROLLED.OFF' })
      },
    },
  },
})
