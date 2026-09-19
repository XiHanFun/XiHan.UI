/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 breadcrumb 相关实现。

import type { BreadcrumbSchema } from './breadcrumb.types'
import { setup } from '@xihan-ui/core'

const { createMachine } = setup<BreadcrumbSchema>()

// 面包屑没有业务状态：跟随链接交给原生 <a href>，当前页由 props 表达。
// 机器只承载按压通道——Space / Enter 与触屏按住期间的 context.pressedValue（按链接 value 记，投影
// data-pressed），让键盘与触屏看见和指针 :active 同一副按压面。当前页那条不可点，不进按压面。
// 没有整组禁用，也就没有要盯的 props，不设 watch。无副作用。
export const breadcrumbMachine = createMachine({
  name: 'breadcrumb',
  context: ({ cell }) => ({
    pressedValue: cell<string | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
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
      // 当前页那条带 aria-current 与 aria-disabled，是不可点的终点：它的当前页事实随 PRESS.START 带进来
      canPress: ({ event }) => {
        const e = event.current()
        return e.type === 'PRESS.START' && !e.current
      },
    },
    actions: {
      startPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.START')
          context.set('pressedValue', e.value)
      },
      // 只收自己那一下：另一条链接的 keyup 不该把正按着的这条松开
      endPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.END' && context.get('pressedValue') === e.value)
          context.set('pressedValue', null)
      },
    },
  },
})
