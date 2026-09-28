/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 code view 相关实现。

import type { CodeViewSchema } from './code-view.types'
import { setup } from '@xihan-ui/core'
import { isCodeViewFoldable } from './code-view.types'

const { createMachine } = setup<CodeViewSchema>()

function sameLines(a: readonly number[], b: readonly number[] | undefined): boolean {
  return b !== undefined && a.length === b.length && a.every((line, i) => line === b[i])
}

// 代码块没有业务状态：整段收起纯受控，着色与切行都是纯函数。
// 机器承载两件事：一是按压通道——Space / Enter 与触屏按住期间的 context.pressed（fold-trigger 投影 data-pressed），
// 让键盘与触屏看见和指针 :active 同一副按压面。折叠条只在可折叠时在场：不可折叠时它带 hidden，
// 不进按压面；按住途中代码或阈值变了、折叠条随之收起的，节点转 hidden 不一定派 blur，按压面由机器自己收。
// 二是语法块的折叠集合（可受控）与行首折叠钮组的 Tab 停靠点。无副作用。
export const codeViewMachine = createMachine({
  name: 'code-view',
  context: ({ cell, prop }) => ({
    pressed: cell<boolean>(() => ({ defaultValue: false })),
    folded: cell<readonly number[]>(() => ({
      value: prop('folded'),
      defaultValue: prop('defaultFolded') ?? [],
      // 每次翻转都产出新数组，逐项比内容，不给 isEqual 会重复通知宿主
      isEqual: sameLines,
      onChange: folded => prop('onFoldedChange')?.({ folded: [...folded] }),
    })),
    foldFocus: cell<number | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  watch: ({ track, prop, action }) => track([() => prop('code'), () => prop('clamp')], () => action(['releaseWhenUnfoldable'])),
  states: {
    idle: {
      on: {
        'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
        'PRESS.END': { actions: ['endPress'] },
        'FOLD.TOGGLE': { actions: ['toggleFold'] },
        'FOLD.FOCUS': { actions: ['setFoldFocus'] },
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
      toggleFold: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'FOLD.TOGGLE')
          return
        const current = context.get('folded')
        const next = current.includes(e.line)
          ? current.filter(line => line !== e.line)
          : [...current, e.line].sort((a, b) => a - b)
        context.set('folded', next)
      },
      setFoldFocus: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'FOLD.FOCUS')
          context.set('foldFocus', e.line)
      },
    },
  },
})
