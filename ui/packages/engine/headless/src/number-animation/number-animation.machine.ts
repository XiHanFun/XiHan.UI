/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 number animation 相关实现。

import type { Scope } from '@xihan-ui/core'
import type { EasingFunction } from '@xihan-ui/motion'
import type { NumberAnimationSchema } from './number-animation.types'
import { setup } from '@xihan-ui/core'
import { frameLoop, frameNow, isTweenDone, motionDurations, motionEasings, readMotion, resolveEasing, resolveMotionPreference, tweenValueAt } from '@xihan-ui/motion'

const { createMachine } = setup<NumberAnimationSchema>()

function rootOf(scope: Scope): HTMLElement | null {
  return scope.getById(scope.partId('number-animation', 'root'))
}

/**
 * 这一轮的时长与曲线。给了 duration / easing 就用给的（duration 夹到非负，0 即一步到位）；没给按数值角色取令牌，
 * 与图表里的数字同一口径：首次滚动（挂载、换起点之后的那一轮）是入场，取 reveal 与 enter-strong；
 * 换目标是更新，取 morph 与 continuous。令牌从根节点所在的作用域读，没有渲染宿主时取令牌表的缺省值。
 */
function runTiming(
  duration: number | undefined,
  easing: NumberAnimationSchema['props']['easing'],
  scope: Scope,
  entry: boolean,
): { duration: number, ease: EasingFunction } {
  const root = rootOf(scope)
  const motion = root ? readMotion(root) : null
  const durationName = entry ? 'reveal' : 'morph'
  const easingName = entry ? 'enter-strong' : 'continuous'
  return {
    duration: duration != null && Number.isFinite(duration)
      ? Math.max(0, duration)
      : (motion?.duration(durationName) ?? motionDurations[durationName]),
    ease: easing != null
      ? resolveEasing(easing)
      : (motion?.easing(easingName) ?? resolveEasing(motionEasings[easingName])),
  }
}

/**
 * 本次实际用的时长。减弱动效档一律取 0，即一步到位落到终值。
 *
 * 逐帧补间是 JS 动画，皮肤那条减弱动效通道压不到它——数字照样一路滚过去。
 *
 * 按根节点判断：最近祖先上的 data-motion 优先，与 CSS 的作用域一致；其次应用级 override，最后系统设置。
 * 没有渲染宿主（纯逻辑驱动）时按 scope 所在窗口判断。逐帧判断：根节点晚于起跑挂进减弱档的容器也认。
 */
function effectiveDuration(duration: number, scope: Scope): number {
  return resolveMotionPreference(rootOf(scope) ?? scope.getWin()) === 'reduce' ? 0 : duration
}

/** 端点归一：非有限数与缺省一律按 0，免得 NaN 一路写进文本。 */
export function resolveNumberAnimationBound(value: number | undefined): number {
  return value != null && Number.isFinite(value) ? value : 0
}

/**
 * 数值动画机器。
 *
 * 两段状态：idle（停着）与 running（在跑）。running 挂一个逐帧循环，
 * 每帧只做一件事——按"起跑到现在过了多久"问补间要一个值，写进 context。
 * 起点与起跑时刻在效应挂载那一刻取，所以重入即换基准。
 *
 * 参数改写分两路：改 from 是"换起点"，显示值当场落到新起点再重跑；
 * 改 to / duration / easing 是"换目标"，从当前显示值接着走，不跳回起点。
 */
export const numberAnimationMachine = createMachine({
  name: 'number-animation',
  context: ({ prop, cell }) => ({
    value: cell<number>(() => ({ defaultValue: resolveNumberAnimationBound(prop('from')) })),
  }),
  refs: () => ({ origin: 0, startedAt: 0, duration: 0, ease: resolveEasing(undefined), entered: false }),
  initialState: ({ prop }) => ((prop('active') ?? true) ? 'running' : 'idle'),
  watch: ({ track, prop, action }) => {
    track([() => prop('active')], () => action(['syncActive']))
    track([() => prop('from')], () => action(['resetToFrom']))
    track(
      [() => prop('to'), () => prop('duration'), () => prop('easing')],
      () => action(['syncRun']),
    )
  },
  states: {
    // 停着。刻意不归零：停下时看到的那个数就是它该停在的地方
    idle: {
      on: {
        'RUN.START': { target: 'running' },
        // 停着时换了目标也要接着跑起来，否则"数字跟着数据走"这一条在第一轮跑完之后就失效了
        'RUN.SYNC': { guard: 'isActive', target: 'running' },
      },
    },
    running: {
      effects: ['trackFrames'],
      on: {
        'RUN.STOP': { target: 'idle' },
        // 换了参数就重入：循环重挂，起点与起跑时刻按当前显示值重取
        'RUN.SYNC': { target: 'running', reenter: true },
        // 换目标时根节点不在视口里：没人看得见的滚动不播，直接落到终点
        'RUN.SKIP': { target: 'idle', actions: ['skipToEnd', 'invokeComplete'] },
        // 内部转移，不重挂循环
        'FRAME': [
          { guard: 'isSettled', target: 'idle', actions: ['advance', 'invokeComplete'] },
          { actions: ['advance'] },
        ],
      },
    },
  },
  implementations: {
    guards: {
      isActive: ({ prop }) => prop('active') ?? true,
      isSettled: ({ refs, scope }) => isTweenDone(
        frameNow(scope.getWin()) - refs.get('startedAt'),
        effectiveDuration(refs.get('duration'), scope),
      ),
    },
    actions: {
      syncActive: ({ prop, send }) => {
        send((prop('active') ?? true) ? { type: 'RUN.START' } : { type: 'RUN.STOP' })
      },
      /** 换起点：显示值先落到新起点，再让这一轮从那里重来；这一轮按入场算。 */
      resetToFrom: ({ context, prop, refs, send }) => {
        context.set('value', resolveNumberAnimationBound(prop('from')))
        refs.set('entered', false)
        send({ type: 'RUN.SYNC' })
      },
      syncRun: ({ send }) => send({ type: 'RUN.SYNC' }),
      advance: ({ context, prop, refs, scope }) => {
        const elapsed = frameNow(scope.getWin()) - refs.get('startedAt')
        context.set('value', tweenValueAt({
          from: refs.get('origin'),
          to: resolveNumberAnimationBound(prop('to')),
          duration: effectiveDuration(refs.get('duration'), scope),
          easing: refs.get('ease'),
        }, elapsed))
      },
      skipToEnd: ({ context, prop }) => {
        context.set('value', resolveNumberAnimationBound(prop('to')))
      },
      invokeComplete: ({ context, prop }) => {
        prop('onComplete')?.({ value: context.get('value') })
      },
    },
    effects: {
      /**
       * 逐帧循环。这一轮的基准（起点、起跑时刻、时长与缓动）在这里取：
       * 效应的挂载与卸载正好对齐"一轮的开始与结束"，重入即自动换基准。
       * 缓动在起跑时解析一次，认不出的写法当场报错，不拖到逐帧推进里一帧一抛。
       *
       * 屏幕外不空转：入场那一轮根节点不在视口里时，数字停在起点等它进来再从头滚；
       * 换目标时不在视口里就直接落到终点。先照常起跑，视口判定回来之后再按它停或跳。
       */
      trackFrames: ({ context, prop, refs, scope, send }) => {
        const win = scope.getWin()
        const entry = !refs.get('entered')
        refs.set('entered', true)
        const timing = runTiming(prop('duration'), prop('easing'), scope, entry)
        refs.set('ease', timing.ease)
        refs.set('duration', timing.duration)
        const origin = context.get('value')
        refs.set('origin', origin)

        let stopLoop: (() => void) | null = null
        const start = (): void => {
          refs.set('startedAt', frameNow(win))
          stopLoop = frameLoop(win, () => send({ type: 'FRAME' }))
        }
        start()

        const root = rootOf(scope)
        const Observer = win.IntersectionObserver
        if (!root || typeof Observer !== 'function')
          return () => stopLoop?.()
        const observer = new Observer((entries) => {
          const visible = entries.some(item => item.isIntersecting)
          if (visible) {
            if (!stopLoop)
              start()
            return
          }
          if (!entry) {
            send({ type: 'RUN.SKIP' })
            return
          }
          // 入场那一轮滚出视口之前就停：数字回到起点，等进视口再从头滚
          stopLoop?.()
          stopLoop = null
          context.set('value', origin)
        })
        observer.observe(root)
        return () => {
          observer.disconnect()
          stopLoop?.()
        }
      },
    },
  },
})
