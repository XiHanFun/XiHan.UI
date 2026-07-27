import type { NumberFieldSchema } from './number-field.types'
import { setIntervalEffect, setTimeoutEffect, setup } from '@xihan-ui/machine'
import { normalizeValue, parseValue, stepValue } from '../shared/number'

const { createMachine } = setup<NumberFieldSchema>()

export const NUMBER_FIELD_STEP = 1
export const NUMBER_FIELD_CHANGE_DELAY = 300
export const NUMBER_FIELD_CHANGE_INTERVAL = 50

export const numberFieldMachine = createMachine({
  name: 'number-field',
  context: ({ prop, cell }) => ({
    // 值住在 cell 里：受控/非受控的收口点就是它，因此不需要 CONTROLLED.* 影子事件
    value: cell<string>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? '',
      onChange: value => prop('onValueChange')?.({ value, valueAsNumber: parseValue(value) }),
    })),
    // 按住时的方向。放 context 而不是模块变量：同页两个数字框各按各的，
    // 共用一个模块变量会让后按下的那个把先按下的方向改掉。
    pressDirection: cell<1 | -1>(() => ({ defaultValue: 1 })),
  }),
  initialState: () => 'idle',
  // 步进与取端点从哪个状态发出都一样（键盘在 idle、连发在 spinning），因此挂根级
  on: {
    'VALUE.SET': { actions: ['setValue'] },
    'VALUE.STEP': { guard: 'canStep', actions: ['stepValue'] },
    'VALUE.TO_MIN': { guard: 'canStep', actions: ['toMin'] },
    'VALUE.TO_MAX': { guard: 'canStep', actions: ['toMax'] },
    'INPUT.BLUR': { actions: ['normalize'] },
  },
  states: {
    idle: {
      on: {
        // 按下先走一步，随后进 spinning 等连发：不这样的话轻点一下什么都不会发生
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
        })
        context.set('value', String(next))
      },
      toMin: ({ context, prop }) => {
        const min = prop('min')
        if (min != null)
          context.set('value', String(min))
      },
      toMax: ({ context, prop }) => {
        const max = prop('max')
        if (max != null)
          context.set('value', String(max))
      },
      // 只在失焦时规范化：输入途中把 "1." 收成 "1" 会把用户正在打的小数点吃掉
      normalize: ({ context, prop }) => {
        const next = normalizeValue(context.get('value'), { min: prop('min'), max: prop('max') })
        if (next !== context.get('value'))
          context.set('value', next)
      },
    },
    effects: {
      // 先等一段再连发：轻点一下只走一步（那一步在 PRESS.START 上已经走过），
      // 按住不放才进入连发。两个定时器同属一个副作用，出 spinning 一并撤掉。
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
