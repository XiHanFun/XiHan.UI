/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 badge 相关实现。

import type { BadgeProps, BadgeSchema } from './badge.types'
import { setup } from '@xihan-ui/core'
import { trackPartPresence } from '../shared/part-presence'

const { createMachine } = setup<BadgeSchema>()

/** 计数上限缺省：超过时只显示「99+」，避免角标变形。 */
export const BADGE_DEFAULT_MAX = 99

/** 该不该露面：没有未读就不该有角标；显式要求显示 0 的除外。 */
export function badgeVisible(props: Pick<BadgeProps, 'count' | 'showZero'>): boolean {
  return props.count == null || props.count !== 0 || !!props.showZero
}

/** 计数文本：超过上限写成「上限+」；圆点模式只表示「有」，不表示「有几个」。 */
export function badgeText(props: Pick<BadgeProps, 'count' | 'dot' | 'max'>): string {
  const max = props.max ?? BADGE_DEFAULT_MAX
  if (props.dot || props.count == null)
    return ''
  return props.count > max ? `${max}+` : `${props.count}`
}

/**
 * 角标机器：显隐与计数都由 props 算出，机器只管出现与消失的进退场——
 * 清零时不当场藏起，等 indicator 的退场动画播完；退场那几帧照清零前的数字写。
 */
export const badgeMachine = createMachine({
  name: 'badge',
  context: ({ prop, cell }) => {
    const shown = badgeVisible({ count: prop('count'), showZero: prop('showZero') })
    return {
      rendered: cell<boolean>(() => ({ defaultValue: shown })),
      shown: cell<boolean>(() => ({ defaultValue: shown })),
      moved: cell<boolean>(() => ({ defaultValue: false })),
      shownText: cell<string>(() => ({ defaultValue: badgeText({ count: prop('count'), dot: prop('dot'), max: prop('max') }) })),
    }
  },
  initialState: () => 'idle',
  effects: ['trackIndicatorPresence'],
  watch: ({ track, prop, action }) => {
    track([() => prop('count'), () => prop('showZero'), () => prop('dot'), () => prop('max')], () => action(['syncShown']))
  },
  on: {
    'INDICATOR.RENDERED': { actions: ['setRendered'] },
  },
  states: {
    idle: {},
  },
  implementations: {
    actions: {
      // 露面期间每一版文本都记下来；显隐一换即算挂载后动过，此后的出现与消失照常播
      syncShown: ({ context, prop }) => {
        const visible = badgeVisible({ count: prop('count'), showZero: prop('showZero') })
        if (visible)
          context.set('shownText', badgeText({ count: prop('count'), dot: prop('dot'), max: prop('max') }))
        if (visible !== context.get('shown')) {
          context.set('shown', visible)
          context.set('moved', true)
        }
      },
      setRendered: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'INDICATOR.RENDERED')
          context.set('rendered', e.rendered)
      },
    },
    effects: {
      /** indicator 的进退场：露面即刻；收起时等它身上起播的退场动画播完才报「可以藏起」，没有可等的即刻报。 */
      trackIndicatorPresence: ({ prop, scope, send, track, flush }) => trackPartPresence({
        scope,
        id: scope.partId('badge', 'indicator'),
        open: () => badgeVisible({ count: prop('count'), showZero: prop('showZero') }),
        track,
        flush,
        onRenderedChange: rendered => send({ type: 'INDICATOR.RENDERED', rendered }),
      }),
    },
  },
})
