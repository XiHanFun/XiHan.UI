/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 skeleton 相关实现。

import type { SkeletonSchema } from './skeleton.types'
import { setup } from '@xihan-ui/core'
import { trackPartPresence } from '../shared/part-presence'

const { createMachine } = setup<SkeletonSchema>()

/** 加载态缺省为真：还没说加载完，骨架就占着位。 */
export function skeletonLoading(loading: boolean | undefined): boolean {
  return loading ?? true
}

/** 让出版面时要改写、收起后要原样还回去的几条内联样式。 */
const LIFTED_PROPERTIES = ['box-sizing', 'position', 'width', 'height', 'translate'] as const

/**
 * 把骨架原地抬出文档流：钉住此刻的尺寸改成绝对定位，后面的真实内容补上它空出来的位置，
 * 骨架盖在内容之上淡出。绝对定位在弹性、网格容器里会跳到容器起点，抬出之后再量一次，
 * 用 translate 把它挪回原处。返回还原函数：作者原本写在这几条上的内联值原样还回去。
 */
function liftOut(root: HTMLElement): () => void {
  const { style } = root
  const saved = LIFTED_PROPERTIES.map(name => [name, style.getPropertyValue(name), style.getPropertyPriority(name)] as const)
  const before = root.getBoundingClientRect()
  style.setProperty('box-sizing', 'border-box')
  style.setProperty('position', 'absolute')
  style.setProperty('width', `${before.width}px`)
  style.setProperty('height', `${before.height}px`)
  const after = root.getBoundingClientRect()
  style.setProperty('translate', `${before.left - after.left}px ${before.top - after.top}px`)
  return () => {
    for (const [name, value, priority] of saved) {
      if (value)
        style.setProperty(name, value, priority)
      else
        style.removeProperty(name)
    }
  }
}

/**
 * 骨架屏机器：只分清「挂载时就已加载完」与「刚加载完」。
 * 前者首帧直接收起；后者骨架让出版面、原地盖在真实内容之上淡出，播完才收起——占位与内容交叉，
 * 不在加载结束那一帧突然换掉。形状、动效档与读屏状态仍全部由 props 算出。
 */
export const skeletonMachine = createMachine({
  name: 'skeleton',
  context: ({ prop, cell }) => ({
    rendered: cell<boolean>(() => ({ defaultValue: skeletonLoading(prop('loading')) })),
  }),
  initialState: () => 'idle',
  effects: ['trackRootPresence', 'trackExitOverlay'],
  on: {
    'ROOT.RENDERED': { actions: ['setRendered'] },
  },
  states: {
    idle: {},
  },
  implementations: {
    actions: {
      setRendered: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ROOT.RENDERED')
          context.set('rendered', e.rendered)
      },
    },
    effects: {
      /** 容器的进退场：加载中即刻露面；加载结束后等淡出播完才报「可以藏起」，没有可等的即刻报。 */
      trackRootPresence: ({ prop, scope, send, track, flush }) => trackPartPresence({
        scope,
        id: scope.partId('skeleton', 'root'),
        open: () => skeletonLoading(prop('loading')),
        track,
        flush,
        onRenderedChange: rendered => send({ type: 'ROOT.RENDERED', rendered }),
      }),

      /**
       * 淡出那一段让出版面：加载结束这一次提交之后（真实内容已排进版面、骨架还在原处）把骨架抬出文档流；
       * 收起或又开始加载时还原。没有 DOM（纯逻辑驱动）时什么也不做。
       */
      trackExitOverlay: ({ prop, context, scope, track, flush }) => {
        let restore: (() => void) | undefined
        const release = (): void => {
          restore?.()
          restore = undefined
        }
        const exiting = (): boolean => !skeletonLoading(prop('loading')) && context.get('rendered')
        track([() => skeletonLoading(prop('loading')), () => context.get('rendered')], () => {
          // 又开始加载：当场回到版面里占位
          if (skeletonLoading(prop('loading'))) {
            release()
            return
          }
          flush(() => {
            if (!exiting()) {
              // 淡出播完、容器已藏起：还原内联样式
              release()
              return
            }
            if (restore)
              return
            const root = scope.getById<HTMLElement>(scope.partId('skeleton', 'root'))
            if (root)
              restore = liftOut(root)
          })
        })
        return release
      },
    },
  },
})
