/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 radio group 相关实现。

import type { RadioGroupSchema } from './radio-group.types'
import { resetDeclaredValue, setup } from '@xihan-ui/core'

const { createMachine } = setup<RadioGroupSchema>()

export const radioGroupMachine = createMachine({
  name: 'radio-group',
  context: ({ prop, cell }) => ({
    value: cell<string | null>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? null,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 焦点锚点，不受控
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    // 按压通道：正被按住的条目（按 value 记），与选中、焦点锚点无关
    pressedValue: cell<string | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  // 按住途中整组转入禁用或只读：不会再来 keyup，按压面由机器自己收
  watch: ({ track, prop, action }) => {
    track([() => prop('disabled'), () => prop('readOnly')], () => action(['releaseWhenInert']))
  },
  // 表单重置从任何状态都要认，所以挂根级。不设禁用/只读守卫：原生表单的重置算法
  // 不看这两个标志，禁用的字段一样回落点；要拦是表单那侧 preventDefault 的事
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
  },
  states: {
    idle: {
      on: {
        'VALUE.SET': { actions: ['setValue'] },
        'ITEM.SELECT': { actions: ['setValue', 'setFocusedValue'] },
        'ITEM.FOCUS': { actions: ['setFocusedValue'] },
        'GROUP.BLUR': { actions: ['clearFocusedValue'] },
        // 按压通道：条目按 value 记按住的那一个；整组禁用或只读不进，条目自身的禁用由 connect 判定后随事件带入
        'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
        'PRESS.END': { actions: ['endPress'] },
      },
    },
  },
  implementations: {
    guards: {
      // 整组禁用或只读一票否决；条目自身的禁用随事件带入
      canPress: ({ prop, event }) => {
        const e = event.current()
        return e.type === 'PRESS.START' && !prop('disabled') && !prop('readOnly') && !e.disabled
      },
    },
    actions: {
      startPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.START')
          context.set('pressedValue', e.value)
      },
      // 只收自己那一下：另一个条目的 keyup 不该把正按着的这个松开
      endPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.END' && context.get('pressedValue') === e.value)
          context.set('pressedValue', null)
      },
      releaseWhenInert: ({ context, prop }) => {
        if (prop('disabled') || prop('readOnly'))
          context.set('pressedValue', null)
      },
      // 落点即 value cell 自己的 defaultValue 表达式，不另抄一份。
      // 焦点锚点不动：原生重置不碰非表单的 UI 状态
      resetToDefault: params => void resetDeclaredValue(params, 'value', 'value', 'defaultValue'),

      setValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'VALUE.SET' || e.type === 'ITEM.SELECT')
          context.set('value', e.value)
      },
      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.SELECT' || e.type === 'ITEM.FOCUS')
          context.set('focusedValue', e.value)
      },
      clearFocusedValue: ({ context }) => context.set('focusedValue', null),
    },
  },
})
