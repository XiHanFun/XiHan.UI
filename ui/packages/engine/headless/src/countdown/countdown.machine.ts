import type { CountdownSchema } from './countdown.types'
import { setup } from '@xihan-ui/machine'
import { frameLoop, frameNow } from '../shared/frame'
import { isTweenDone, tweenValueAt } from '../shared/tween'
import { resolveCountdownValue } from './countdown.format'

const { createMachine } = setup<CountdownSchema>()

/**
 * 倒计时机器。
 *
 * 剩余量走的就是一次数值补间：起点是这一轮开始时的剩余毫秒、终点是 0、
 * 时长恰好等于起点本身，缓动固定线性——时间不加速也不减速。
 * 所以这里与数值动画共用同一份补间，没有第二套算法。
 *
 * 两段状态：idle（停着）与 running（在走）。running 挂一个逐帧循环，
 * 每帧按"起跑到现在过了多久"问补间要一个剩余量。
 * 起点与起跑时刻在效应挂载那一刻取，改 value 即重入换基准。
 */
export const countdownMachine = createMachine({
  name: 'countdown',
  context: ({ prop, cell }) => ({
    remaining: cell<number>(() => ({ defaultValue: resolveCountdownValue(prop('value')) })),
  }),
  refs: () => ({ origin: 0, startedAt: 0 }),
  initialState: ({ prop }) => ((prop('active') ?? true) ? 'running' : 'idle'),
  watch: ({ track, prop, action }) => {
    track([() => prop('active')], () => action(['syncActive']))
    track([() => prop('value')], () => action(['resetToValue']))
  },
  states: {
    // 停着。刻意不归零：暂停时看到的那个剩余量就是它该停在的地方
    idle: {
      on: {
        'RUN.START': { target: 'running' },
        // 停着时换了剩余量也要走起来，否则"到点重新发一轮"要作者再拨一次 active
        'RUN.SYNC': { guard: 'isActive', target: 'running' },
      },
    },
    running: {
      effects: ['trackFrames'],
      on: {
        'RUN.STOP': { target: 'idle' },
        // 换了剩余量就重入：循环重挂，起点与起跑时刻按新值重取
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
      // 这一轮的时长就是它的起始剩余量：走满了即归零
      isSettled: ({ refs, scope }) => isTweenDone(
        frameNow(scope.getWin()) - refs.get('startedAt'),
        refs.get('origin'),
      ),
    },
    actions: {
      syncActive: ({ prop, send }) => {
        send((prop('active') ?? true) ? { type: 'RUN.START' } : { type: 'RUN.STOP' })
      },
      resetToValue: ({ context, prop, send }) => {
        context.set('remaining', resolveCountdownValue(prop('value')))
        send({ type: 'RUN.SYNC' })
      },
      advance: ({ context, refs, scope }) => {
        const origin = refs.get('origin')
        const elapsed = frameNow(scope.getWin()) - refs.get('startedAt')
        context.set('remaining', tweenValueAt({ from: origin, to: 0, duration: origin }, elapsed))
      },
      invokeFinish: ({ context, prop }) => {
        prop('onFinish')?.({ value: context.get('remaining') })
      },
    },
    effects: {
      /**
       * 逐帧循环。这一轮的基准（起始剩余量与起跑时刻）在这里取：
       * 效应的挂载与卸载正好对齐"一轮的开始与结束"，重入即自动换基准。
       */
      trackFrames: ({ context, refs, scope, send }) => {
        const win = scope.getWin()
        refs.set('origin', context.get('remaining'))
        refs.set('startedAt', frameNow(win))
        return frameLoop(win, () => send({ type: 'FRAME' }))
      },
    },
  },
})
