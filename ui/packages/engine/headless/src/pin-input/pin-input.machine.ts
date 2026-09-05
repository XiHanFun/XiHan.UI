import type { Params } from '@xihan-ui/core'
import type { PinInputSchema, PinInputType } from './pin-input.types'
import { resetDeclaredValue, setup } from '@xihan-ui/core'

const { createMachine } = setup<PinInputSchema>()

/** 默认格数。 */
export const PIN_INPUT_LENGTH = 6

/**
 * 每类字符的准入表。刻意用不带 g 标志的单字符正则：
 * 带 g 的正则在 test 之间会带着 lastIndex 走，同一份实例被复用时结果时对时错。
 */
const PIN_PATTERNS: Record<PinInputType, RegExp> = {
  numeric: /^\d$/,
  alphabetic: /^[a-z]$/i,
  alphanumeric: /^[a-z0-9]$/i,
}

/**
 * 一格接受哪些字符。给了 pattern 就用它：补上首尾锚与 u 标志后整格匹配，
 * 于是作者写 `[0-9A-Fa-f]` 这样一段就够，不必自己写锚点。
 * 写坏了（编不成正则）退回 type 的准入表——准入判据编不出来时收紧到默认档，
 * 比放行一切安全。
 */
export function pinCharPattern(type: PinInputType = 'numeric', pattern?: string): RegExp {
  const fallback = PIN_PATTERNS[type] ?? PIN_PATTERNS.numeric
  if (!pattern)
    return fallback
  try {
    // u 标志：sanitizePin 按码点切分，一个"字符"可能是代理对，不带 u 匹不上
    return new RegExp(`^(?:${pattern})$`, 'u')
  }
  catch {
    return fallback
  }
}

/** 按准入表过滤字符：不接受的直接丢弃，按码点展开后保序拼回（代理对不会被劈成半个字符）。 */
export function sanitizePin(raw: string, type: PinInputType = 'numeric', pattern?: string): string {
  const accept = pinCharPattern(type, pattern)
  return [...raw].filter(char => accept.test(char)).join('')
}

/** 格数归一：非正数与非整数都退回默认值。 */
export function pinLength(length: number | undefined): number {
  if (length == null || !Number.isFinite(length) || length < 1)
    return PIN_INPUT_LENGTH
  return Math.floor(length)
}

/**
 * 值归一到 length：短了补空串、长了截断，且每格只留首字符（读写两侧都过这一道）。
 * 这里不按 type 过滤——受控值是宿主说了算的，读的时候擅自改写会让界面与宿主各说各话。
 */
export function padPinValue(value: readonly string[] | undefined, length: number): string[] {
  const out: string[] = []
  for (let i = 0; i < length; i++)
    out.push((value?.[i] ?? '').slice(0, 1))
  return out
}

/** 每格都填上了。空数组不算填满。 */
export function isPinComplete(value: readonly string[]): boolean {
  return value.length > 0 && value.every(char => char !== '')
}

/** 逐格比内容，供 cell 的 isEqual 用。数组每次都是新引用，不比内容的话值没变也会通知一遍。 */
export function samePinValue(a: readonly string[], b: readonly string[] | undefined): boolean {
  return !!b && a.length === b.length && a.every((char, i) => char === b[i])
}

function detailsOf(value: string[]): { value: string[], valueAsString: string } {
  return { value, valueAsString: value.join('') }
}

/**
 * 值的唯一写入口：与旧值不同才落，落完再判是否刚好填满。
 * 完成回调挂在这里而不是单独一个动作，是为了拿得到"写之前"的值——没有它就分不清
 * "这一次填满了"与"本来就满着又写了一遍同样的值"，blurOnComplete 会因此在用户每敲一下末格时都把焦点抢走。
 */
function commitValue(params: Params<PinInputSchema>, next: string[]): void {
  const { context, prop } = params
  const length = pinLength(prop('length'))
  const prev = padPinValue(context.get('value'), length)
  if (samePinValue(prev, next))
    return
  context.set('value', next)
  if (isPinComplete(next))
    prop('onValueComplete')?.(detailsOf(next))
}

/** 值存在 context 的 cell 里由其收口受控/非受控；机器只有一个状态，逻辑全在 context 与 actions。 */
export const pinInputMachine = createMachine({
  name: 'pin-input',
  context: ({ prop, cell }) => ({
    value: cell<string[]>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? [],
      // 逐格比内容而不是比引用，值原样不动时不通知宿主
      isEqual: samePinValue,
      onChange: value => prop('onValueChange')?.(detailsOf(value)),
    })),
    // 焦点锚点，只服务 data-focus 标记
    focusedIndex: cell<number>(() => ({ defaultValue: -1 })),
  }),
  initialState: () => 'idle',
  // 表单重置从任何状态都要认，所以挂根级。不设禁用/只读守卫：原生表单的重置算法
  // 不看这两个标志，禁用的字段一样回落点；要拦是表单那侧 preventDefault 的事
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
  },
  states: {
    idle: {
      // 省略 target：只跑 actions，不换状态
      on: {
        'VALUE.SET': { actions: ['setValue'] },
        'VALUE.FILL': { guard: 'canEdit', actions: ['fillValue'] },
        'VALUE.CLEAR_AT': { guard: 'canEdit', actions: ['clearValueAt'] },
        'VALUE.CLEAR': { actions: ['clearValue'] },
        'INPUT.FOCUS': { actions: ['setFocusedIndex'] },
        'INPUT.BLUR': { actions: ['clearFocusedIndex'] },
      },
    },
  },
  implementations: {
    guards: {
      // 挡住绕过原生 disabled、直接派事件那一路
      canEdit: ({ prop }) => !prop('disabled'),
    },
    actions: {
      resetToDefault: params => void resetDeclaredValue(params, 'value', 'value', 'defaultValue'),

      setValue: (params) => {
        const e = params.event.current()
        if (e.type !== 'VALUE.SET')
          return
        const length = pinLength(params.prop('length'))
        const type = params.prop('type') ?? 'numeric'
        const pattern = params.prop('pattern')
        // 整份替换按准入表过滤，不接受的字符留下空格子
        const next = padPinValue(e.value, length).map(char => sanitizePin(char, type, pattern))
        commitValue(params, next)
      },
      fillValue: (params) => {
        const e = params.event.current()
        if (e.type !== 'VALUE.FILL')
          return
        const length = pinLength(params.prop('length'))
        const type = params.prop('type') ?? 'numeric'
        const next = padPinValue(params.context.get('value'), length)
        // 从落点起逐格铺到末格，多出来的字符丢掉
        const chars = [...sanitizePin(e.value, type, params.prop('pattern'))]
        for (let i = 0; i < chars.length && e.index + i < length; i++)
          next[e.index + i] = chars[i]!
        commitValue(params, next)
      },
      clearValueAt: (params) => {
        const e = params.event.current()
        if (e.type !== 'VALUE.CLEAR_AT')
          return
        const length = pinLength(params.prop('length'))
        const next = padPinValue(params.context.get('value'), length)
        if (e.index < 0 || e.index >= length)
          return
        next[e.index] = ''
        commitValue(params, next)
      },
      clearValue: (params) => {
        commitValue(params, padPinValue([], pinLength(params.prop('length'))))
      },
      setFocusedIndex: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'INPUT.FOCUS')
          context.set('focusedIndex', e.index)
      },
      clearFocusedIndex: ({ context }) => context.set('focusedIndex', -1),
    },
  },
})
