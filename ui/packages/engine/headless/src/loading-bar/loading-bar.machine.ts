/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 loading bar 相关实现。

import type { Scope } from '@xihan-ui/core'
import type { LoadingBarSchema } from './loading-bar.types'
import { setTimeoutEffect, setup } from '@xihan-ui/core'
import { waitForTransition } from '../shared/part-presence'
import {
  clampLoadingBarValue,
  isLoadingBarDeterminate,
  LOADING_BAR_MAX,
  nextLoadingBarValue,
  resolveLoadingBarMinimum,
} from './loading-bar.trickle'

const { createMachine } = setup<LoadingBarSchema>()

/** 爬升节拍缺省毫秒。 */
export const LOADING_BAR_TRICKLE_SPEED = 200
/** 条子厚度缺省，由连接层写进内联样式。 */
export const LOADING_BAR_HEIGHT = '2px'

/** 节拍归一。返回 0 表示不起计时器：<=0 与非有限数都按不自行爬升处理。 */
export function resolveLoadingBarTrickleSpeed(speed: number | undefined): number {
  const ms = speed ?? LOADING_BAR_TRICKLE_SPEED
  return Number.isFinite(ms) && ms > 0 ? ms : 0
}

/**
 * 淡出时长归一：夹到非负；没给或给了非有限数时为 undefined，皮肤按退场令牌淡出。
 * 不放行 Infinity：「永远停在淡出态」意味着条子再也回不到 idle，下一次加载连起点都没有。
 */
export function resolveLoadingBarFadeDuration(ms: number | undefined): number | undefined {
  return ms !== undefined && Number.isFinite(ms) ? Math.max(0, ms) : undefined
}

/**
 * 宿主把这一帧提交出去之后，按 id 取部件，等它身上某个属性正在播的过渡播完再回调。
 * 过渡在样式提交之后才起播，所以先等 flush；返回的清理函数撤掉还没落定的等待。
 */
function waitForPartTransition(
  scope: Scope,
  flush: (fn: () => void) => void,
  part: 'root' | 'range',
  property: string,
  done: () => void,
): () => void {
  let stop: (() => void) | undefined
  let disposed = false
  flush(() => {
    if (disposed)
      return
    stop = waitForTransition(scope.getById(scope.partId('loading-bar', part)), property, done)
  })
  return () => {
    disposed = true
    stop?.()
  }
}

/**
 * 顶部加载条机器。
 *
 * 四段状态：idle（收起）→ loading（走着）→ complete（冲向 100）→ finishing（满格停一拍后淡出）→ idle。
 * 走满与淡出分两段：同一拍里一边冲一边淡，条子还没到头就看不见了。
 * 爬升的每一拍都重入 loading，重入时计时器按最新参数重挂。
 * 进度值走 cell 受控（value / defaultValue / onValueChange），loading 由 watch 同步。
 */
export const loadingBarMachine = createMachine({
  name: 'loading-bar',
  context: ({ prop, cell }) => ({
    value: cell<number>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? 0,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
  }),
  initialState: ({ prop }) => (prop('loading') ? 'loading' : 'idle'),
  watch: ({ track, prop, action }) => {
    track([() => prop('loading')], () => action(['syncLoading']))
    // 爬升参数被改写要重挂计时器：换节拍当场生效、关掉即当场停，
    // 从确定进度切回不确定时也要把爬升重新支起来（否则条子就此冻住）
    track(
      [() => prop('trickle'), () => prop('trickleSpeed'), () => prop('value')],
      () => action(['syncTrickle']),
    )
  },
  states: {
    // 收起态。刻意不在这里归零：归零只发生在淡出走完那一步，
    // 挂载时若作者给了 defaultValue，这条位置的值得原样留着
    idle: {
      on: {
        'LOADING.START': { target: 'loading' },
      },
    },
    loading: {
      entry: ['primeValue'],
      effects: ['trackTrickle'],
      on: {
        'LOADING.END': { target: 'complete' },
        // 到点爬一格，reenter 重挂计时器
        'after.trickleSpeed': { target: 'loading', reenter: true, actions: ['advanceValue'] },
        // 爬升参数改了，重入把计时器按新参数重挂
        'TRICKLE.SYNC': { target: 'loading', reenter: true },
      },
    },
    // 冲向 100：根节点保持不透明，进度段的平移真正播完才进淡出
    complete: {
      entry: ['completeValue'],
      effects: ['waitForFill'],
      on: {
        'FILL.DONE': { target: 'finishing' },
        // 收尾途中又开始加载：整条重来，primeValue 把冲到头的值拉回起步值
        'LOADING.START': { target: 'loading' },
      },
    },
    // 满格停一拍再淡出：停留与淡出都由皮肤的过渡给出，这里只等它播完
    finishing: {
      effects: ['waitForFade'],
      on: {
        // 淡出走完才归零：早一步归零，用户会看见条子在淡出途中先缩回左边再消失
        'FADE.DONE': { target: 'idle', actions: ['resetValue'] },
        'LOADING.START': { target: 'loading' },
      },
    },
  },
  implementations: {
    actions: {
      syncLoading: ({ prop, send }) => {
        send(prop('loading') ? { type: 'LOADING.START' } : { type: 'LOADING.END' })
      },
      syncTrickle: ({ send }) => send({ type: 'TRICKLE.SYNC' }),

      /**
       * 保底：值不低于起步值。每次进入 loading（含爬升重入）都会跑，取 max 保证幂等；
       * 上一轮冲到过 100 的值会被拉回起步值。
       */
      primeValue: ({ context, prop }) => {
        if (isLoadingBarDeterminate(prop('value')))
          return
        const current = clampLoadingBarValue(context.get('value'))
        const alive = current > 0 && current < LOADING_BAR_MAX ? current : 0
        context.set('value', Math.max(alive, resolveLoadingBarMinimum(prop('minimum'))))
      },
      advanceValue: ({ context, prop }) => {
        if (isLoadingBarDeterminate(prop('value')))
          return
        context.set('value', nextLoadingBarValue(context.get('value')))
      },
      completeValue: ({ context, prop }) => {
        if (isLoadingBarDeterminate(prop('value')))
          return
        context.set('value', LOADING_BAR_MAX)
      },
      resetValue: ({ context, prop }) => {
        if (isLoadingBarDeterminate(prop('value')))
          return
        context.set('value', 0)
      },
    },
    effects: {
      /**
       * 爬升计时器：只在 loading 存在，每次进入都从整个节拍重新计。
       * 确定进度、trickle 关掉、节拍 <=0 三种情况不起计时器。
       */
      trackTrickle: ({ prop, send }) => {
        if (isLoadingBarDeterminate(prop('value')))
          return undefined
        if (!(prop('trickle') ?? true))
          return undefined
        const speed = resolveLoadingBarTrickleSpeed(prop('trickleSpeed'))
        if (speed <= 0)
          return undefined
        return setTimeoutEffect(() => send({ type: 'after.trickleSpeed' }), speed)
      },
      /**
       * 等进度段冲向 100 的平移过渡播完：按浏览器实际起播的那一段等，不按毫秒猜——作者改了皮肤的
       * 推进时长槽照样对得上。已经在满格、没装皮肤、没渲染进度段时即刻进淡出。
       */
      waitForFill: ({ scope, send, flush }) =>
        waitForPartTransition(scope, flush, 'range', 'translate', () => send({ type: 'FILL.DONE' })),
      /**
       * 等根节点上的淡出过渡播完（含满格停留的那段延迟）：同样按实际起播的过渡等，
       * 作者改了皮肤的淡出时长槽照样对得上。没装皮肤、没有在播的过渡时即刻收尾。
       */
      waitForFade: ({ scope, send, flush }) =>
        waitForPartTransition(scope, flush, 'root', 'opacity', () => send({ type: 'FADE.DONE' })),
    },
  },
})
