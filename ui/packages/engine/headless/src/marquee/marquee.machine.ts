/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 marquee 相关实现。

import type { MarqueeSchema } from './marquee.types'
import { setup } from '@xihan-ui/core'

/** 竖着滚的两个方向：量内容的块轴长度。 */
const VERTICAL: readonly string[] = ['up', 'down']

const { createMachine } = setup<MarqueeSchema>()

/**
 * 跑马灯机器：只管暂停。
 *
 * 滚动整段在皮肤的 @keyframes 里，机器不排任何时间。暂停状态住在 cell 里，受控 / 非受控在 cell 收口：
 * 暂停开关与 setPaused 都写它，受控时只发 onPausedChange、由作者写回。
 * 悬停与聚焦的临时暂停是皮肤的 :hover / :focus-within，不经机器，也不改这里的状态。
 */
export const marqueeMachine = createMachine({
  name: 'marquee',
  context: ({ prop, cell }) => ({
    paused: cell<boolean>(() => ({
      value: prop('paused'),
      defaultValue: prop('defaultPaused') ?? false,
      onChange: paused => prop('onPausedChange')?.({ paused }),
    })),
    // 按压通道：暂停开关被 Space / Enter 或触屏按住期间为 true
    pressed: cell<boolean>(() => ({ defaultValue: false })),
    span: cell<number | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  effects: ['trackSpan'],
  on: {
    'PAUSED.SET': { actions: ['setPaused'] },
    'PAUSED.TOGGLE': { actions: ['togglePaused'] },
    'PRESS.START': { actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
    'SPAN.MEASURE': { actions: ['setSpan'] },
  },
  states: { idle: {} },
  implementations: {
    actions: {
      setPaused: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PAUSED.SET')
          context.set('paused', e.paused)
      },
      togglePaused: ({ context }) => context.set('paused', !context.get('paused')),
      startPress: ({ context }) => context.set('pressed', true),
      endPress: ({ context }) => context.set('pressed', false),
      setSpan: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'SPAN.MEASURE')
          context.set('span', e.span)
      },
    },
    effects: {
      /**
       * 量一份内容在滚动轴上的长度：content 部件就是滚动的轨道，里面铺 autoFill 份。
       * 皮肤拿它除以每秒像素数换算一圈的时长，窗口宽窄不再改变速度。尺寸变化（换内容、换字体、
       * 换方向、开关 autoFill）时重量。没有布局宿主时不量，皮肤退回槽里的缺省值。
       */
      trackSpan: ({ prop, scope, send, flush }) => {
        let observer: ResizeObserver | null = null
        flush(() => {
          const content = scope.getById(scope.partId('marquee', 'content'))
          const Observer = content?.ownerDocument.defaultView?.ResizeObserver
          if (!content || typeof Observer !== 'function')
            return
          const measure = (): void => {
            const vertical = VERTICAL.includes(prop('direction') ?? 'left')
            const size = vertical ? content.offsetHeight : content.offsetWidth
            if (size > 0)
              send({ type: 'SPAN.MEASURE', span: size / (prop('autoFill') === true ? 2 : 1) })
          }
          observer = new Observer(measure)
          observer.observe(content)
          measure()
        })
        return () => observer?.disconnect()
      },
    },
  },
})
