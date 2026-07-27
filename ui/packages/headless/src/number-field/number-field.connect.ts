import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { NumberFieldApi, NumberFieldSchema } from './number-field.types'
import { dataAttr } from '@xihan-ui/core'
import { parseValue } from '../shared/number'
import { numberFieldAnatomy } from './number-field.anatomy'

const parts = numberFieldAnatomy.build()

export function connectNumberField<T extends PropTypes>(
  service: Service<NumberFieldSchema>,
  normalize: NormalizeProps<T>,
): NumberFieldApi<T> {
  const { prop, send, context, scope } = service
  const ids = scope.ids('number-field', 'label', 'input')

  const value = context.get('value')
  const valueAsNumber = parseValue(value)
  const empty = !Number.isFinite(valueAsNumber)
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const min = prop('min')
  const max = prop('max')

  // 空值时两个方向都还能走（会落到 min 或 0），所以只在"已经贴着边界"时才关掉。
  // 关掉的是按钮的 disabled，不是机器的守卫——守卫只管 disabled/readOnly。
  const editable = !disabled && !readOnly
  const canIncrement = editable && (empty || max == null || valueAsNumber < max)
  const canDecrement = editable && (empty || min == null || valueAsNumber > min)

  const stepBy = (direction: 1 | -1, large = false): void => {
    send({ type: 'VALUE.STEP', direction, large })
  }

  // 按住不放要连发，所以加减按钮走 pointerdown 而不是 click。
  // 只认主键：右键与中键不该触发步进，右键还会顺带弹出上下文菜单。
  const pressProps = (direction: 1 | -1, enabled: boolean): Record<string, unknown> => ({
    'onPointerDown': (event: PointerEvent) => {
      if (!enabled || event.button !== 0)
        return
      // 焦点留在输入框：按钮抢走焦点后，用户按完还想接着打字就得再点回去。
      // 同时挡掉浏览器把按钮设为 activeElement 的默认行为
      event.preventDefault()
      send({ type: 'PRESS.START', direction })
    },
    // 松手、指针移出、以及按住时窗口失焦，三条都要收尾：
    // 少一条就会出现"手已经松了，数字还在自己涨"
    'onPointerUp': () => send({ type: 'PRESS.END' }),
    'onPointerLeave': () => send({ type: 'PRESS.END' }),
    'onPointerCancel': () => send({ type: 'PRESS.END' }),
    // 键盘走 click：Enter/Space 激活按钮时不会有 pointerdown
    'onClick': (event: MouseEvent) => {
      // detail 为 0 代表这次 click 来自键盘而非指针；指针那一路已经由 pointerdown 走过一步了
      if (enabled && event.detail === 0)
        stepBy(direction)
    },
    'tabindex': -1,
    'aria-hidden': true,
  })

  return {
    value,
    valueAsNumber,
    empty,
    disabled,
    readOnly,
    invalid,
    canIncrement,
    canDecrement,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    increment: () => stepBy(1),
    decrement: () => stepBy(-1),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-empty': dataAttr(empty),
    }),

    getLabelProps: () => normalize.label({
      ...parts.label.attrs,
      'id': ids.label,
      'for': ids.input,
      'data-disabled': dataAttr(disabled),
    }),

    getInputProps: () => normalize.input({
      ...parts.input.attrs,
      'id': ids.input,
      // role=spinbutton 让读屏念出当前值与区间；type 仍是 text，
      // type=number 会带来各家浏览器自己的一套上下箭头与滚轮行为，与这里的实现打架
      'type': 'text',
      'role': 'spinbutton',
      'inputmode': 'decimal',
      'autocomplete': 'off',
      'name': prop('name'),
      'value': value,
      'disabled': disabled || undefined,
      'readonly': readOnly || undefined,
      'required': prop('required') || undefined,
      'aria-labelledby': ids.label,
      // 三个 aria-value* 显式给：省略时读屏只能念出输入框里的字面量，念不出区间
      'aria-valuenow': empty ? undefined : valueAsNumber,
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-invalid': invalid ? 'true' : 'false',
      'data-disabled': dataAttr(disabled),
      'data-invalid': dataAttr(invalid),
      'onInput': (event: Event) => {
        send({ type: 'VALUE.SET', value: (event.target as HTMLInputElement).value })
      },
      'onBlur': () => send({ type: 'INPUT.BLUR' }),
      'onKeyDown': (event: KeyboardEvent) => {
        if (!editable || event.ctrlKey || event.metaKey || event.altKey)
          return
        // 没给 min/max 时 Home/End 一律不接：光标跳到行首/行尾是输入框的原生行为，
        // 这里既没有端点可取，就不该把它吞掉
        const handlers: Record<string, (() => void) | undefined> = {
          ArrowUp: () => stepBy(1),
          ArrowDown: () => stepBy(-1),
          PageUp: () => stepBy(1, true),
          PageDown: () => stepBy(-1, true),
          Home: min == null ? undefined : () => send({ type: 'VALUE.TO_MIN' }),
          End: max == null ? undefined : () => send({ type: 'VALUE.TO_MAX' }),
        }
        const run = handlers[event.key]
        if (!run)
          return
        // 方向键在输入框里默认是移动光标，翻页键会滚整个页面——都得拦下
        event.preventDefault()
        run()
      },
    }),

    getIncrementTriggerProps: () => normalize.button({
      ...parts['increment-trigger'].attrs,
      'type': 'button',
      'disabled': !canIncrement || undefined,
      'data-disabled': dataAttr(!canIncrement),
      ...pressProps(1, canIncrement),
    }),

    getDecrementTriggerProps: () => normalize.button({
      ...parts['decrement-trigger'].attrs,
      'type': 'button',
      'disabled': !canDecrement || undefined,
      'data-disabled': dataAttr(!canDecrement),
      ...pressProps(-1, canDecrement),
    }),
  }
}
