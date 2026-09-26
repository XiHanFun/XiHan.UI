/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 empty state 相关实现。

import type { EmptyStateSchema } from './empty-state.types'
import { setup, trackAppearance } from '@xihan-ui/core'

const { createMachine } = setup<EmptyStateSchema>()

/**
 * 空状态机器：只管开幕播不播。
 *
 * 空状态多半是筛选、搜索、删除之后结果区被换掉的产物，那一下该有开幕；随页面首屏就在的空状态
 * （首次进入还没建过任何东西的列表页）直接呈现。首帧一律投影 data-instant，服务端与水合两侧一致；
 * 挂载后按根节点的出现放开，放开赶在首帧绘制之前或根节点不可见期间，开幕从第一帧起播。
 */
export const emptyStateMachine = createMachine({
  name: 'empty-state',
  context: ({ cell }) => ({
    instant: cell<boolean>(() => ({ defaultValue: true })),
  }),
  refs: () => ({
    getRootEl: () => null,
    adopted: false,
  }),
  initialState: () => 'idle',
  effects: ['trackAppearance'],
  on: {
    'APPEARANCE.RELEASE': { actions: ['release'] },
  },
  states: { idle: {} },
  implementations: {
    actions: {
      release: ({ context }) => context.set('instant', false),
    },
    effects: {
      /**
       * 根节点交给出现追踪。React 的祖先 ref 在子组件 layout effect 之后才附着、Web Components
       * 的角色节点在首轮接线时才认领，延到提交后的微任务再取，仍在首帧绘制之前。
       * 没有 DOM 的宿主里也能跑，这里不经 Scope 取窗口：没有根节点就不追踪，保持首帧呈现。
       */
      trackAppearance: ({ refs, send, flush }) => {
        let disposed = false
        let stop: (() => void) | undefined
        flush(() => {
          queueMicrotask(() => {
            if (disposed)
              return
            const root = refs.get('getRootEl')()
            if (!root)
              return
            stop = trackAppearance(root, () => send({ type: 'APPEARANCE.RELEASE' }), { adopted: refs.get('adopted') })
          })
        })
        return () => {
          disposed = true
          stop?.()
        }
      },
    },
  },
})
