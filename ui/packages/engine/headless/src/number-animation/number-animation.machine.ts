import type { Scope } from '@xihan-ui/kernel'
import type { NumberAnimationSchema } from './number-animation.types'
import { setup } from '@xihan-ui/machine'
import { frameLoop, frameNow, isTweenDone, resolveMotionPreference, tweenValueAt } from '@xihan-ui/motion'

const { createMachine } = setup<NumberAnimationSchema>()

/** 时长缺省毫秒。 */
export const NUMBER_ANIMATION_DURATION = 1000

/** 时长归一：夹到非负，缺省或非有限数退回缺省值。0 表示一步到位。 */
export function resolveNumberAnimationDuration(ms: number | undefined): number {
  if (ms == null || !Number.isFinite(ms))
    return NUMBER_ANIMATION_DURATION
  return Math.max(0, ms)
}

/**
 * 本次实际用的时长。减弱动效档一律取 0，即一步到位落到终值。
 *
 * 逐帧补间是 JS 动画，皮肤那条减弱动效通道压不到它——数字照样一路滚过去。
 *
 * 应用级 override 优先于系统设置；两者都问不出结果时照常跑动画。
 */
function effectiveDuration(ms: number | undefined, scope: Scope): number {
  return resolveMotionPreference(scope.getWin()) === 'reduce' ? 0 : resolveNumberAnimationDuration(ms)
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
  refs: () => ({ origin: 0, startedAt: 0 }),
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
        // 内部转移，不重挂循环
        'FRAME': [
          { guard: 'isSettled', target: 'idle', actions: ['advance', 'invokeFinish'] },
          { actions: ['advance'] },
        ],
      },
    },
  },
  implementations: {
    guards: {
      isActive: ({ prop }) => prop('active') ?? true,
      isSettled: ({ prop, refs, scope }) => isTweenDone(
        frameNow(scope.getWin()) - refs.get('startedAt'),
        effectiveDuration(prop('duration'), scope),
      ),
    },
    actions: {
      syncActive: ({ prop, send }) => {
        send((prop('active') ?? true) ? { type: 'RUN.START' } : { type: 'RUN.STOP' })
      },
      /** 换起点：显示值先落到新起点，再让这一轮从那里重来。 */
      resetToFrom: ({ context, prop, send }) => {
        context.set('value', resolveNumberAnimationBound(prop('from')))
        send({ type: 'RUN.SYNC' })
      },
      syncRun: ({ send }) => send({ type: 'RUN.SYNC' }),
      advance: ({ context, prop, refs, scope }) => {
        const elapsed = frameNow(scope.getWin()) - refs.get('startedAt')
        context.set('value', tweenValueAt({
          from: refs.get('origin'),
          to: resolveNumberAnimationBound(prop('to')),
          duration: effectiveDuration(prop('duration'), scope),
          easing: prop('easing'),
        }, elapsed))
      },
      invokeFinish: ({ context, prop }) => {
        prop('onFinish')?.({ value: context.get('value') })
      },
    },
    effects: {
      /**
       * 逐帧循环。这一轮的基准（起点与起跑时刻）在这里取：
       * 效应的挂载与卸载正好对齐"一轮的开始与结束"，重入即自动换基准。
       */
      trackFrames: ({ context, refs, scope, send }) => {
        const win = scope.getWin()
        refs.set('origin', context.get('value'))
        refs.set('startedAt', frameNow(win))
        return frameLoop(win, () => send({ type: 'FRAME' }))
      },
    },
  },
})
