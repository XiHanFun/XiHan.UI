/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 steps 相关实现。

import type { PropFn } from '@xihan-ui/core'
import type { StepsSchema } from './steps.types'
import { setup } from '@xihan-ui/core'

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
    value: cell<number>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? 0,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 焦点锚点：不受控、不对外通知，只服务 roving tabindex 与方向键起点
    focusedStep: cell<number | null>(() => ({ defaultValue: null })),
    // 按压通道：正被按住的那一步（按下标记），与步序、焦点锚点无关
    pressedStep: cell<number | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  // 按住途中整组转入禁用：不会再来 keyup，按压面由机器自己收
  watch: ({ track, prop, action }) => {
    track([() => prop('disabled')], () => action(['releaseWhenInert']))
  },
  states: {
    idle: {
      // 省略 target：只跑 actions，不换状态
      on: {
        'VALUE.SET': { actions: ['setValue'] },
        'STEP.PREV': { actions: ['goPrev'] },
        'STEP.NEXT': { actions: ['goNext'] },
        'TRIGGER.FOCUS': { actions: ['setFocusedStep'] },
        'LIST.BLUR': { actions: ['clearFocusedStep'] },
        // 按压通道：按下标记按住的那一步；整组禁用不进，该步自身的禁用（含 linear 未解锁）由 connect 判定后随事件带入
        'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
        'PRESS.END': { actions: ['endPress'] },
      },
    },
  },
  implementations: {
    guards: {
      canPress: ({ prop, event }) => {
        const e = event.current()
        return e.type === 'PRESS.START' && !prop('disabled') && !e.disabled
      },
    },
    actions: {
      startPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.START')
          context.set('pressedStep', e.step)
      },
      // 只收自己那一下：另一步的 keyup 不该把正按着的这一步松开
      endPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.END' && context.get('pressedStep') === e.step)
          context.set('pressedStep', null)
      },
      releaseWhenInert: ({ context, prop }) => {
        if (prop('disabled'))
          context.set('pressedStep', null)
      },
      // 越界步序在写入口就夹掉，受控宿主拿到的回调值永远可用
      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type === 'VALUE.SET')
          context.set('value', clampStep(e.value, stepCount(prop)))
      },
      goPrev: ({ context, prop }) => context.set('value', walk(context.get('value'), -1, stepCount(prop))),
      goNext: ({ context, prop }) => context.set('value', walk(context.get('value'), 1, stepCount(prop))),
      setFocusedStep: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'TRIGGER.FOCUS')
          context.set('focusedStep', e.step)
      },
      clearFocusedStep: ({ context }) => context.set('focusedStep', null),
    },
  },
})
