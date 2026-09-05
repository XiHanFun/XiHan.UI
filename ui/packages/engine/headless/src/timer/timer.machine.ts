import type { PropFn } from '@xihan-ui/machine'
import type { TimerRun } from './timer.format'
import type { TimerSchema } from './timer.types'
import { setIntervalEffect, setTimeoutEffect, setup } from '@xihan-ui/machine'
import { frameNow } from '@xihan-ui/motion'
import { resolveTimerInterval, timerElapsedAt, timerRunOf, timerRunsOnMount, timerTotalMs, timerValueAt } from './timer.format'

const { createMachine } = setup<TimerSchema>()

/** 这一轮的起止与方向；受控剩余量在场时由它接管。 */
function runOf(prop: PropFn<TimerSchema>): TimerRun {
  return timerRunOf({
    value: prop('value'),
    startMs: prop('startMs'),
    targetMs: prop('targetMs'),
    countdown: prop('countdown'),
  })
}

/** 这一轮要跑多久，undefined 即没有终点。 */
function totalOf(prop: PropFn<TimerSchema>): number | undefined {
  const run = runOf(prop)
  return timerTotalMs(run.startMs, run.targetMs, run.countdown)
}

/** 累计走了 elapsed 毫秒时该显示的值。 */
function valueOf(prop: PropFn<TimerSchema>, elapsed: number): number {
  const run = runOf(prop)
  return timerValueAt(elapsed, run.startMs, run.targetMs, run.countdown)
}

/**
 * 计时机器。
 *
 * 时间只有一个来源：单调时钟的两个时刻相减。累计量存在 context 里，
 * 每一段连续走动开始时把它抄进 refs 当基准，此后所有取值都是「基准 + (现在 - 起跑时刻)」。
 * 累加间隔会一拍拍地漂，这里一拍都不累加。
 *
 * running 挂两个定时器：一个按 interval 跳数字，一个精确落在终点上。
 * 只靠前者判终点的话，终点落在两拍之间就要多等一拍才结束，倒计时会明显走过头。
 */
export const timerMachine = createMachine({
  name: 'timer',
  context: ({ cell }) => ({
    elapsed: cell<number>(() => ({ defaultValue: 0 })),
  }),
  refs: () => ({ baseElapsed: 0, startedAt: 0 }),
  // autoStart 只在这里读一次：它说的是「挂载时开不开跑」，不是一个能来回拨的开关。
  // 受控通道在场时由 active 说了算，缺省真——给了剩余量就是要它走起来
  initialState: ({ prop }) => (timerRunsOnMount(prop('value'), prop('active'), prop('autoStart')) ? 'running' : 'idle'),
  watch: ({ track, prop, action }) => {
    track(
      [() => prop('startMs'), () => prop('targetMs'), () => prop('countdown'), () => prop('interval')],
      () => action(['syncClock']),
    )
    // 受控通道：剩余量改写即重新计时，开关翻转即停走
    track([() => prop('value')], () => action(['restartFromValue']))
    track([() => prop('active')], () => action(['syncActive']))
  },
  states: {
    // 没起步。累计恒为 0，显示的就是起始值
    idle: {
      on: {
        'RUN.START': { target: 'running' },
        // 累计已经是 0，继续与从头开跑在这里是同一件事
        'RUN.RESUME': { target: 'running' },
      },
    },
    running: {
      effects: ['runClock'],
      // 离开时先把这一段走了多久落进累计，暂停、归零与到点都靠它收尾
      exit: ['settleElapsed'],
      on: {
        'RUN.PAUSE': { target: 'paused' },
        'RUN.RESET': { target: 'idle', actions: ['clearElapsed'] },
        'RUN.START': { target: 'running', reenter: true, actions: ['clearElapsed'] },
        'CLOCK.SYNC': { target: 'running', reenter: true },
        'CLOCK.TICK': [
          // 到点由 CLOCK.SETTLE 精确落点，这条只兜后台标签页里被压慢的那一拍
          { guard: 'isSettled', target: 'completed' },
          { actions: ['settleElapsed', 'invokeTick'] },
        ],
        'CLOCK.SETTLE': { target: 'completed' },
      },
    },
    // 停在半路。累计留着，继续时从这里接着走
    paused: {
      on: {
        'RUN.RESUME': { target: 'running' },
        'RUN.START': { target: 'running', actions: ['clearElapsed'] },
        'RUN.RESET': { target: 'idle', actions: ['clearElapsed'] },
      },
    },
    completed: {
      entry: ['invokeComplete'],
      on: {
        'RUN.START': { target: 'running', actions: ['clearElapsed'] },
        'RUN.RESET': { target: 'idle', actions: ['clearElapsed'] },
      },
    },
  },
  implementations: {
    guards: {
      isSettled: ({ prop, refs, scope }) => {
        const total = totalOf(prop)
        // 没有终点的正计时永远不算走完
        if (total == null)
          return false
        return timerElapsedAt(refs.get('baseElapsed'), refs.get('startedAt'), frameNow(scope.getWin()), undefined) >= total
      },
    },
    actions: {
      clearElapsed: ({ context }) => context.set('elapsed', 0),
      settleElapsed: ({ context, prop, refs, scope }) => {
        context.set('elapsed', timerElapsedAt(
          refs.get('baseElapsed'),
          refs.get('startedAt'),
          frameNow(scope.getWin()),
          totalOf(prop),
        ))
      },
      invokeTick: ({ context, prop }) => {
        const elapsed = context.get('elapsed')
        prop('onTick')?.({ value: valueOf(prop, elapsed), elapsed })
      },
      invokeComplete: ({ context, prop }) => {
        const elapsed = context.get('elapsed')
        prop('onComplete')?.({ value: valueOf(prop, elapsed), elapsed })
      },
      syncClock: ({ send }) => send({ type: 'CLOCK.SYNC' }),
      // 受控剩余量换了一个数：累计清零，按 active 决定这一轮走不走
      restartFromValue: ({ context, prop, send }) => {
        context.set('elapsed', 0)
        send((prop('active') ?? true) ? { type: 'RUN.START' } : { type: 'RUN.RESET' })
      },
      syncActive: ({ prop, send }) => {
        send((prop('active') ?? true) ? { type: 'RUN.RESUME' } : { type: 'RUN.PAUSE' })
      },
    },
    effects: {
      /**
       * 本段连续走动的时钟。基准在这里取：效应的挂载与卸载正好对齐这一段的开始与结束，
       * 重入即自动换基准。
       */
      runClock: ({ context, prop, refs, scope, send }) => {
        const win = scope.getWin()
        refs.set('baseElapsed', context.get('elapsed'))
        refs.set('startedAt', frameNow(win))

        const stopTicks = setIntervalEffect(() => send({ type: 'CLOCK.TICK' }), resolveTimerInterval(prop('interval')))
        const total = totalOf(prop)
        if (total == null)
          return stopTicks

        // 终点单独排一次：剩下的路程按累计值算，暂停后接着走也落在同一个终点上
        const stopSettle = setTimeoutEffect(
          () => send({ type: 'CLOCK.SETTLE' }),
          Math.max(total - refs.get('baseElapsed'), 0),
        )
        return () => {
          stopTicks()
          stopSettle()
        }
      },
    },
  },
})
