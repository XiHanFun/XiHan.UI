/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 spinner 相关实现。

import type { SpinnerSchema } from './spinner.types'
import { setTimeoutEffect, setup } from '@xihan-ui/core'

const { createMachine } = setup<SpinnerSchema>()

/** 露面前的等待时长归一：没写、0、负数与非有限数都算不等，挂载即露面。 */
export function resolveSpinnerDelay(delay: number | undefined): number {
  return delay != null && Number.isFinite(delay) && delay > 0 ? delay : 0
}

/** 是否在等待：没写即在等，只有显式的 false 算没在等。 */
export function isSpinnerLoading(loading: boolean | undefined): boolean {
  return loading !== false
}

/**
 * 转圈只有一件与时间有关的事：开始等待后等 delay 毫秒才露面。
 * 加载在这之前就结束（宿主卸掉转圈，或把 loading 改成 false）时，它从头到尾不出现，快请求不会闪一下。
 * 露面之后不再回到等待；等待途中把 delay 改成 0 即刻露面；loading 由 false 变回 true 时重新计时。
 */
export const spinnerMachine = createMachine({
  name: 'spinner',
  initialState: ({ prop }) => {
    if (!isSpinnerLoading(prop('loading')))
      return 'idle'
    return resolveSpinnerDelay(prop('delay')) > 0 ? 'waiting' : 'visible'
  },
  watch: ({ track, prop, action }) => {
    track([() => prop('delay')], () => action(['revealWhenUndelayed']))
    track([() => prop('loading')], () => action(['syncLoading']))
  },
  states: {
    idle: {
      on: {
        START: [{ guard: 'hasDelay', target: 'waiting' }, { target: 'visible' }],
      },
    },
    waiting: {
      effects: ['trackDelay'],
      on: {
        REVEAL: { target: 'visible' },
        STOP: { target: 'idle' },
      },
    },
    visible: {
      on: {
        STOP: { target: 'idle' },
      },
    },
  },
  implementations: {
    guards: {
      hasDelay: ({ prop }) => resolveSpinnerDelay(prop('delay')) > 0,
    },
    actions: {
      revealWhenUndelayed: ({ prop, state, send }) => {
        if (state.get() === 'waiting' && resolveSpinnerDelay(prop('delay')) === 0)
          send({ type: 'REVEAL' })
      },
      syncLoading: ({ prop, state, send }) => {
        const loading = isSpinnerLoading(prop('loading'))
        if (loading && state.get() === 'idle')
          send({ type: 'START' })
        else if (!loading && state.get() !== 'idle')
          send({ type: 'STOP' })
      },
    },
    effects: {
      trackDelay: ({ prop, send }) => {
        const ms = resolveSpinnerDelay(prop('delay'))
        // 等待途中 delay 被改成 0 时由 watch 直接放行，这里不起零时长的计时器
        if (ms === 0)
          return undefined
        return setTimeoutEffect(() => send({ type: 'REVEAL' }), ms)
      },
    },
  },
})
