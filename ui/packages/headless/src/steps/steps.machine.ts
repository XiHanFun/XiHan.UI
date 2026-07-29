import type { PropFn } from '@xihan-ui/machine'
import type { StepsSchema } from './steps.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<StepsSchema>()

/** 总步数：负数、小数、NaN 一律收成非负整数。 */
export function normalizeStepCount(value: number | undefined): number {
  if (value == null || !Number.isFinite(value))
    return 0
  return Math.max(0, Math.trunc(value))
}

/**
 * 把任意来路的步序夹进 [0, count]。
 * 上界取 count 而不是 count - 1：最后一步走完之后还有一个全部完成的位置。
 */
export function clampStep(step: number | undefined, count: number | undefined): number {
  const max = normalizeStepCount(count)
  if (step == null || !Number.isFinite(step))
    return 0
  return Math.min(Math.max(Math.trunc(step), 0), max)
}

function stepCount(prop: PropFn<StepsSchema>): number {
  return normalizeStepCount(prop('count'))
}

/**
 * 走一步。先把当前步夹回合法区间再加减：count 变小后内部值可能停在已不存在的步上，
 * 而界面显示的是夹过的那一步。
 */
function walk(current: number, direction: 1 | -1, count: number): number {
  return clampStep(clampStep(current, count) + direction, count)
}

// 步序住在 context 的 cell 里，受控/非受控在 cell 收口，不需要影子事件与受控守卫。
// linear 的可跳判定只在 connect 里做，机器里没有对应守卫。
export const stepsMachine = createMachine({
  name: 'steps',
  context: ({ prop, cell }) => ({
    step: cell<number>(() => ({
      value: prop('step'),
      defaultValue: prop('defaultStep') ?? 0,
      onChange: step => prop('onStepChange')?.({ step }),
    })),
    // 焦点锚点：不受控、不对外通知，只服务 roving tabindex 与方向键起点
    focusedStep: cell<number | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  states: {
    idle: {
      // 省略 target：只跑 actions，不换状态
      on: {
        'STEP.SET': { actions: ['setStep'] },
        'STEP.PREV': { actions: ['goPrev'] },
        'STEP.NEXT': { actions: ['goNext'] },
        'TRIGGER.FOCUS': { actions: ['setFocusedStep'] },
        'LIST.BLUR': { actions: ['clearFocusedStep'] },
      },
    },
  },
  implementations: {
    actions: {
      // 越界步序在写入口就夹掉，受控宿主拿到的回调值永远可用
      setStep: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type === 'STEP.SET')
          context.set('step', clampStep(e.step, stepCount(prop)))
      },
      goPrev: ({ context, prop }) => context.set('step', walk(context.get('step'), -1, stepCount(prop))),
      goNext: ({ context, prop }) => context.set('step', walk(context.get('step'), 1, stepCount(prop))),
      setFocusedStep: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'TRIGGER.FOCUS')
          context.set('focusedStep', e.step)
      },
      clearFocusedStep: ({ context }) => context.set('focusedStep', null),
    },
  },
})
