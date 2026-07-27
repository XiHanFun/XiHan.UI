import type { PropFn } from '@xihan-ui/machine'
import type { StepsSchema } from './steps.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<StepsSchema>()

/** 总步数：负数、小数、NaN 一律收成非负整数。这些值都来自作者的 props，进算术前必须先落地。 */
export function normalizeStepCount(value: number | undefined): number {
  if (value == null || !Number.isFinite(value))
    return 0
  return Math.max(0, Math.trunc(value))
}

/**
 * 把任意来路的步序夹进 [0, count]。
 *
 * 上界取 count 而不是 count - 1：最后一步走完之后还有一个"全部完成"的位置。
 * 少了它，"完成"就只能用"停在最后一步"来表示，而那两件事对作者不是一回事——
 * 完成页该显示什么、下一步按钮该不该禁用，全指着这一格。
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
 * 走一步。先把当前步夹回合法区间再加减：count 变小之后内部值可能停在一个已不存在的步上，
 * 而界面显示的是夹过的那一步（connect 同样夹）。此时按"上一步"该从看得见的那一步往回走，
 * 从那个越界的旧值往回走的话，用户得连点好几下才看得到反应。
 */
function walk(current: number, direction: 1 | -1, count: number): number {
  return clampStep(clampStep(current, count) + direction, count)
}

// 步序住在 context 的 cell 里，不编码进状态：cell 本身就是受控/非受控的收口点
// （step prop 给定即受控，读直取 prop，写只发 onStepChange 不落内部值），
// 因此不需要影子事件与受控守卫。机器只有一个状态，逻辑全在 context + actions。
//
// 机器里没有 linear 守卫：能不能跳到某一步，取决于那一步自己的声明（作者标的 disabled）
// 与它和当前步的相对位置，这两件事只有 connect 手上齐全。在机器里再判一遍等于把同一条
// 边界写两遍，而且哪一份都没法单独验——删掉任意一份，行为一模一样。
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
      // 越界步序在写入口就夹掉：受控宿主拿到的回调值永远是可用的步
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
