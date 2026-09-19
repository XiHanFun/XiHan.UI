/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 number field 相关实现。

import type { Params } from '@xihan-ui/core'
import type { NumberCodec } from '../shared/number'
import type { NumberFieldPressedPart, NumberFieldSchema } from './number-field.types'
import { resetDeclaredValue, setIntervalEffect, setTimeoutEffect, setup } from '@xihan-ui/core'
import { decodeNumber, encodeNumber, normalizeValue, stepValue } from '../shared/number'

const { createMachine } = setup<NumberFieldSchema>()

/** 作者给的显示串换算。两个方向都缺省时就是原来的 Number() / String()。 */
function codecOf(prop: Params<NumberFieldSchema>['prop']): NumberCodec {
  return { parse: prop('parse'), format: prop('format') }
}

export const NUMBER_FIELD_STEP = 1
export const NUMBER_FIELD_CHANGE_DELAY = 300
export const NUMBER_FIELD_CHANGE_INTERVAL = 50

/**
 * 这一侧的按钮此刻能不能按：可编辑且没贴住这一侧的端点；空值时两个方向都还能走（会落到 min 或 0）。
 * 与 connect 里 canIncrement / canDecrement 同一口径——那里决定按钮是否 disabled，这里挡住按压回执。
 */
function canPressTrigger(prop: Params<NumberFieldSchema>['prop'], value: string, part: NumberFieldPressedPart): boolean {
  if (prop('disabled') || prop('readOnly'))
    return false
  const n = decodeNumber(value, codecOf(prop))
  if (!Number.isFinite(n))
    return true
  const bound = part === 'increment' ? prop('max') : prop('min')
  return bound == null || (part === 'increment' ? n < bound : n > bound)
}

export const numberFieldMachine = createMachine({
  name: 'number-field',
  context: ({ prop, cell }) => ({
    // 值住在 cell 里，由 cell 收口受控/非受控
    value: cell<string>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? '',
      onChange: value => prop('onValueChange')?.({ value, valueAsNumber: decodeNumber(value, codecOf(prop)) }),
    })),
    // 按住时的方向，逐实例存在 context 里
    pressDirection: cell<1 | -1>(() => ({ defaultValue: 1 })),
    // 按压通道：被 Space / Enter 或触屏按住的那颗钮；与 spinning（连发）互不牵连，只投影按压面
    pressed: cell<NumberFieldPressedPart | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  // 按住途中转入禁用 / 只读，或值贴到了这一侧的端点：按钮随即 disabled，浏览器不再派 pointerup / keyup，
  // 按压面由机器自己收
  watch: ({ track, prop, context, action }) => {
    track([() => prop('disabled'), () => prop('readOnly'), () => prop('min'), () => prop('max'), context.dep('value')], () => action(['releaseWhenInert']))
  },
  // 步进与取端点在 idle 与 spinning 下行为一致，挂根级
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
    // 加减钮的按压通道：只投影按压面，步进由 PRESS.*（指针按住连发）与 click（键盘激活）各走各的
    'TRIGGER.PRESS.START': { guard: 'canPressTrigger', actions: ['startTriggerPress'] },
    'TRIGGER.PRESS.END': { actions: ['endTriggerPress'] },
    'VALUE.SET': { actions: ['setValue'] },
    'VALUE.STEP': { guard: 'canStep', actions: ['stepValue'] },
    'VALUE.TO_MIN': { guard: 'canStep', actions: ['toMin'] },
    'VALUE.TO_MAX': { guard: 'canStep', actions: ['toMax'] },
    'INPUT.BLUR': { actions: ['normalize'] },
  },
  states: {
    idle: {
      on: {
        // 按下先走一步，随后进 spinning 等连发
        'PRESS.START': { guard: 'canStep', target: 'spinning', actions: ['setDirection', 'stepValue'] },
      },
    },
    spinning: {
      effects: ['spin'],
      on: {
        'PRESS.END': { target: 'idle' },
        'after.changeInterval': { guard: 'canStep', actions: ['stepValue'] },
      },
    },
  },
  implementations: {
    guards: {
      canStep: ({ prop }) => !prop('disabled') && !prop('readOnly'),
      canPressTrigger: ({ prop, context, event }) => {
        const e = event.current()
        return e.type === 'TRIGGER.PRESS.START' && canPressTrigger(prop, context.get('value'), e.part)
      },
    },
    actions: {
      resetToDefault: params => void resetDeclaredValue(params, 'value', 'value', 'defaultValue'),

      setValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'VALUE.SET')
          context.set('value', e.value)
      },
      setDirection: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.START')
          context.set('pressDirection', e.direction)
      },
      stepValue: ({ context, prop, event }) => {
        const codec = codecOf(prop)
        const e = event.current()
        const step = prop('step') ?? NUMBER_FIELD_STEP
        // 连发事件不带方向，用按下那一刻记下的
        const direction = e.type === 'VALUE.STEP' ? e.direction : context.get('pressDirection')
        const large = e.type === 'VALUE.STEP' && e.large === true
        const size = large ? (prop('largeStep') ?? step * 10) : step
        const next = stepValue(context.get('value'), direction, {
          min: prop('min'),
          max: prop('max'),
          step: size,
          ...codec,
        })
        context.set('value', encodeNumber(next, codec))
      },
      toMin: ({ context, prop }) => {
        const min = prop('min')
        if (min != null)
          context.set('value', encodeNumber(min, codecOf(prop)))
      },
      toMax: ({ context, prop }) => {
        const max = prop('max')
        if (max != null)
          context.set('value', encodeNumber(max, codecOf(prop)))
      },
      startTriggerPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'TRIGGER.PRESS.START')
          context.set('pressed', e.part)
      },
      // 只收自己那一下：另一颗钮的 keyup 不该把正按着的这颗松开
      endTriggerPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'TRIGGER.PRESS.END' && context.get('pressed') === e.part)
          context.set('pressed', null)
      },
      releaseWhenInert: ({ context, prop }) => {
        const pressed = context.get('pressed')
        if (pressed != null && !canPressTrigger(prop, context.get('value'), pressed))
          context.set('pressed', null)
      },
      // 只在失焦时规范化，避免打断输入途中的中间态（如 "1."）
      normalize: ({ context, prop }) => {
        const next = normalizeValue(context.get('value'), { min: prop('min'), max: prop('max'), ...codecOf(prop) })
        if (next !== context.get('value'))
          context.set('value', next)
      },
    },
    effects: {
      // 先等 changeDelay 再按 changeInterval 连发；两个定时器同属一个副作用，出 spinning 一并撤掉
      spin: ({ send, prop }) => {
        let stopInterval: VoidFunction | null = null
        const stopDelay = setTimeoutEffect(() => {
          stopInterval = setIntervalEffect(
            () => send({ type: 'after.changeInterval' }),
            prop('changeInterval') ?? NUMBER_FIELD_CHANGE_INTERVAL,
          )
        }, prop('changeDelay') ?? NUMBER_FIELD_CHANGE_DELAY)
        return () => {
          stopDelay()
          stopInterval?.()
        }
      },
    },
  },
})
