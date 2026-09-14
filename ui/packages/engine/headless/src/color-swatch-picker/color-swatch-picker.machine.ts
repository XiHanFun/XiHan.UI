/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color swatch picker 相关实现。

import type { ColorSwatchPickerSchema } from './color-swatch-picker.types'
import { resetDeclaredValue, setup } from '@xihan-ui/core'

const { createMachine } = setup<ColorSwatchPickerSchema>()

// 与 radio-group 同一副骨架：值住在 cell 里，焦点锚点不受控。
export const colorSwatchPickerMachine = createMachine({
  name: 'color-swatch-picker',
  context: ({ prop, cell }) => ({
    value: cell<string | null>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? null,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 焦点锚点，不受控
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
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
      },
    },
  },
  implementations: {
    actions: {
      // 落点即 value cell 自己的 defaultValue 表达式，不另抄一份。焦点锚点不动
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
