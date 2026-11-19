/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 badge 相关实现。

import type { Params } from '@xihan-ui/core'
import type { BadgeGlyph, BadgeProps, BadgeRoll, BadgeSchema } from './badge.types'
import { setup } from '@xihan-ui/core'
import { resolveMotionPreference } from '@xihan-ui/motion'
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

/** 计数文本拆成数字部分与末尾的「+」。 */
function splitText(text: string): { digits: string, plus: boolean } {
  return text.endsWith('+') ? { digits: text.slice(0, -1), plus: true } : { digits: text, plus: false }
}

/** 一位在这一轮里的写法：前后两版的字相同（或没在换数）就不动，键只带位次。 */
function glyphOf(base: string, prev: string, next: string, roll: BadgeRoll | null): BadgeGlyph {
  if (!roll || prev === next)
    return { key: base, char: next }
  const key = `${base}:${roll.serial}`
  if (!prev)
    return { key, char: next, change: 'enter' }
  if (!next)
    return { key, char: prev, change: 'leave' }
  return { key, char: next, from: prev, change: 'swap' }
}

/**
 * 计数逐位排出：数字按个位对齐比较前后两版，变了的位滚过去；多出来的高位与「+」从无到有，
 * 少掉的从有到无、播完才摘掉
 */
export function badgeGlyphs(text: string, roll: BadgeRoll | null): { glyphs: BadgeGlyph[], suffix: BadgeGlyph | null } {
  const next = splitText(text)
  const prev = roll ? splitText(roll.from) : next
  const glyphs: BadgeGlyph[] = []
  for (let place = Math.max(next.digits.length, prev.digits.length) - 1; place >= 0; place--) {
    const at = (digits: string): string => digits[digits.length - 1 - place] ?? ''
    glyphs.push(glyphOf(`n${place}`, at(prev.digits), at(next.digits), roll))
  }
  const suffix = next.plus || prev.plus ? glyphOf('suffix', prev.plus ? '+' : '', next.plus ? '+' : '', roll) : null
  return { glyphs, suffix }
}

/**
 * 这一次换数要不要滚：前后都在露面、写的是数字、文本变了，而且宿主的角标节点能播 CSS 动画、没开减弱动效。
 * 减弱动效下数值直接换（动效规范「数值」一角）；没有 DOM 动画的宿主（jsdom、SSR）也直接换
 */
function shouldRoll({ scope }: Params<BadgeSchema>, prev: string, next: string): boolean {
  if (!prev || !next || prev === next)
    return false
  const node = scope.getById(scope.partId('badge', 'indicator'))
  return !!node && typeof node.getAnimations === 'function' && resolveMotionPreference(node) !== 'reduce'
}

/** 宿主提交这一轮之后，等各位身上起播的滚动播完（或被下一轮换掉的节点撤掉）再报「这一轮播完了」。 */
function settleWhenDone({ scope, send, flush }: Params<BadgeSchema>, serial: number): void {
  flush(() => {
    const node = scope.getById(scope.partId('badge', 'indicator'))
    const moving = node ? Array.from(node.querySelectorAll<HTMLElement>('[data-roll]')) : []
    const animations = moving.flatMap(glyph => glyph.getAnimations?.() ?? [])
    void Promise.allSettled(animations.map(animation => animation.finished)).then(() => send({ type: 'ROLL.SETTLED', serial }))
  })
}

/**
 * 角标机器：显隐与计数都由 props 算出，机器只管两段动效——
 * 出现与消失：清零时不当场藏起，等 indicator 的退场动画播完；退场那几帧照清零前的数字写。
 * 换数：露面期间计数变了，记下换之前那一版与方向，变了的位滚过去，播完清空
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
      shownCount: cell<number | undefined>(() => ({ defaultValue: prop('count') })),
      roll: cell<BadgeRoll | null>(() => ({ defaultValue: null })),
    }
  },
  initialState: () => 'idle',
  effects: ['trackIndicatorPresence'],
  watch: ({ track, prop, action }) => {
    track([() => prop('count'), () => prop('showZero'), () => prop('dot'), () => prop('max')], () => action(['syncShown']))
  },
  on: {
    'INDICATOR.RENDERED': { actions: ['setRendered'] },
    'ROLL.SETTLED': { actions: ['settleRoll'] },
  },
  states: {
    idle: {},
  },
  implementations: {
    actions: {
      // 露面期间每一版文本都记下来；一直露着时换了数就滚过去。显隐一换即算挂载后动过，此后的出现与消失照常播
      syncShown: (params) => {
        const { context, prop } = params
        const visible = badgeVisible({ count: prop('count'), showZero: prop('showZero') })
        if (visible) {
          const prev = context.get('shownText')
          const next = badgeText({ count: prop('count'), dot: prop('dot'), max: prop('max') })
          if (context.get('shown') && shouldRoll(params, prev, next)) {
            const serial = (context.get('roll')?.serial ?? 0) + 1
            context.set('roll', { from: prev, up: (prop('count') ?? 0) >= (context.get('shownCount') ?? 0), serial })
            settleWhenDone(params, serial)
          }
          context.set('shownText', next)
          context.set('shownCount', prop('count'))
        }
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
      // 只认最近那一轮：被下一轮换掉的那一轮迟到的「播完」不作数
      settleRoll: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ROLL.SETTLED' && context.get('roll')?.serial === e.serial)
          context.set('roll', null)
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
