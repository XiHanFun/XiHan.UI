/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 code view 相关实现。

import type { CodeViewSchema } from './code-view.types'
import { setup } from '@xihan-ui/core'
import { isCodeViewFoldable } from './code-view.types'

const { createMachine } = setup<CodeViewSchema>()

// 代码块没有业务状态：折叠态纯受控，着色与切行都是纯函数。
// 机器只承载按压通道——Space / Enter 与触屏按住期间的 context.pressed（fold-trigger 投影 data-pressed），
// 让键盘与触屏看见和指针 :active 同一副按压面。折叠条只在可折叠时在场：不可折叠时它带 hidden，
// 不进按压面；按住途中代码或阈值变了、折叠条随之收起的，节点转 hidden 不一定派 blur，按压面由机器自己收。无副作用。
export const codeViewMachine = createMachine({
  name: 'code-view',
  context: ({ cell }) => ({
    pressed: cell<boolean>(() => ({ defaultValue: false })),
  }),
  initialState: () => 'idle',
  watch: ({ track, prop, action }) => track([() => prop('code'), () => prop('clamp')], () => action(['releaseWhenUnfoldable'])),
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
      canPress: ({ prop }) => isCodeViewFoldable(prop('code'), prop('clamp')),
    },
    actions: {
      startPress: ({ context }) => context.set('pressed', true),
      endPress: ({ context }) => context.set('pressed', false),
      releaseWhenUnfoldable: ({ context, prop }) => {
        if (!isCodeViewFoldable(prop('code'), prop('clamp')))
          context.set('pressed', false)
      },
    },
  },
})
