import type { Params } from '@xihan-ui/core'
import type { NumberCodec } from '../shared/number'
import type { NumberFieldSchema } from './number-field.types'
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
  }),
  initialState: () => 'idle',
  // 步进与取端点在 idle 与 spinning 下行为一致，挂根级
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
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
