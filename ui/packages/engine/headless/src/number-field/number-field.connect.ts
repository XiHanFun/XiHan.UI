/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 number field 相关实现。

import type { NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { NumberFieldApi, NumberFieldPressedPart, NumberFieldSchema } from './number-field.types'
import { createPressTracker, dataAttr, isComposingEvent } from '@xihan-ui/core'
import { decodeNumber } from '../shared/number'
import { numberFieldAnatomy } from './number-field.anatomy'

const parts = numberFieldAnatomy.build()

export function connectNumberField<T extends PropTypes>(
  service: Service<NumberFieldSchema>,
  normalize: NormalizeProps<T>,
): NumberFieldApi<T> {
  const { prop, send, context, scope } = service
  const ids = scope.ids('number-field', 'label', 'input')

  const value = context.get('value')
  const valueAsNumber = decodeNumber(value, { parse: prop('parse'), format: prop('format') })
  const empty = !Number.isFinite(valueAsNumber)
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const min = prop('min')
  const max = prop('max')
  // 形态默认落 outline：不写时 root 与 control 都如实投影，皮肤不再依赖缺省档
  const variant = prop('variant') ?? 'outline'

  // 只在已经贴着边界时关掉按钮的 disabled；空值时两个方向都还能走（会落到 min 或 0）
  const editable = !disabled && !readOnly
  const canIncrement = editable && (empty || max == null || valueAsNumber < max)
  const canDecrement = editable && (empty || min == null || valueAsNumber > min)

  const stepBy = (direction: 1 | -1, large = false): void => {
    send({ type: 'VALUE.STEP', direction, large })
  }

  // 加减钮的按压通道：真源是机器 context 里「正被按住的那颗」，两颗各自合成一份跟踪器；
  // Space / Enter 与触屏按住投影 data-pressed，指针按住由 :active 表出，家族配方两者同一档。
  // 事件名带 TRIGGER. 前缀：PRESS.* 已是指针按住连发的事件，这一路只投影按压面、不碰步进
  const pressed = context.get('pressed')
  const press = (part: NumberFieldPressedPart): PressHandlers => createPressTracker({
    isPressed: () => context.get('pressed') === part,
    onChange: down => send(down ? { type: 'TRIGGER.PRESS.START', part } : { type: 'TRIGGER.PRESS.END', part }),
  })

  // 加减按钮走 pointerdown 而不是 click，按住不放要连发；只认主键。同一处理器先走连发再交给按压跟踪器
  const pressProps = (direction: 1 | -1, enabled: boolean, part: NumberFieldPressedPart): Record<string, unknown> => {
    const held = press(part)
    return {
      'onPointerDown': (event: PointerEvent) => {
        if (enabled && event.button === 0) {
          // 挡掉浏览器把按钮设为 activeElement 的默认行为，焦点留在输入框
          event.preventDefault()
          send({ type: 'PRESS.START', direction })
        }
        // 触屏按下同时进按压通道；按不了的那侧由机器守卫挡下
        held.onPointerDown(event)
      },
      // 松手、指针移出、按住时窗口失焦，三条都收尾；按压面随抬起 / 取消一并撤下
      'onPointerUp': () => {
        send({ type: 'PRESS.END' })
        held.onPointerUp()
      },
      'onPointerLeave': () => send({ type: 'PRESS.END' }),
      'onPointerCancel': () => {
        send({ type: 'PRESS.END' })
        held.onPointerCancel()
      },
      'onKeyDown': held.onKeyDown,
      'onKeyUp': held.onKeyUp,
      'onBlur': held.onBlur,
      // 键盘走 click：Enter/Space 激活按钮时不会有 pointerdown
      'onClick': (event: MouseEvent) => {
        // detail 为 0 代表这次 click 来自键盘而非指针，指针那一路已由 pointerdown 走过一步
        if (enabled && event.detail === 0)
          stepBy(direction)
      },
      'tabindex': -1,
      'aria-hidden': true,
    }
  }

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
      // 三个视觉轴只落在 root，子部件从这里继承皮肤声明的私有槽；形态默认落 outline，皮肤不再依赖缺省档
      'data-variant': variant,
      'data-tone': prop('tone'),
      'data-size': prop('size'),
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

    // control 是纯视觉包裹：盒子的描边/底色/聚焦环由 Field Chrome 家族画在它身上，
    // 三个状态属性供家族按禁用/只读/校验切换盒观感；size 缺省 md，variant 与 root 同源
    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      'data-xh-field-chrome': '',
      'data-xh-field-size': prop('size') ?? 'md',
      'data-variant': variant,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
    }),

    // 装饰段：货币符、单位、图标。名字由 label 部件给，这两段一律不进名字链
    getPrefixProps: () => normalize.element({
      ...parts.prefix.attrs,
      'data-xh-field-affix': 'prefix',
      'aria-hidden': true,
      'data-disabled': dataAttr(disabled),
    }),

    getSuffixProps: () => normalize.element({
      ...parts.suffix.attrs,
      'data-xh-field-affix': 'suffix',
      'aria-hidden': true,
      'data-disabled': dataAttr(disabled),
    }),

    getInputProps: () => normalize.input({
      ...parts.input.attrs,
      'id': ids.input,
      // role=spinbutton 让读屏念出当前值与区间；type 仍是 text，避开 type=number 的原生箭头与滚轮行为
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
      // 三个 aria-value* 显式给，读屏据此念出区间
      'aria-valuenow': empty ? undefined : valueAsNumber,
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-invalid': invalid ? 'true' : 'false',
      // Field Chrome 不读取 number-field anatomy；原生输入角色与单行布局由 Headless 明确投影
      'data-xh-field-input': '',
      'data-xh-field-layout': 'single-line',
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'onInput': (event: Event) => {
        send({ type: 'VALUE.SET', value: (event.target as HTMLInputElement).value })
      },
      'onBlur': () => send({ type: 'INPUT.BLUR' }),
      'onKeyDown': (event: KeyboardEvent) => {
        if (!editable || event.ctrlKey || event.metaKey || event.altKey)
          return
        // 组合期间的按键属于输入法候选框，组件一律不接
        if (isComposingEvent(event))
          return
        // 没给 min/max 时 Home/End 不接，放行输入框的原生光标行为
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
        // 拦下方向键的移动光标与翻页键的滚动页面
        event.preventDefault()
        run()
      },
    }),

    // 加减钮走 Action Control 的 field-inset ghost 档：正方视觉盒、inset 圆角、悬停 100 / 按下 200
    getIncrementTriggerProps: () => normalize.button({
      ...parts['increment-trigger'].attrs,
      'data-xh-action-control': '',
      'data-xh-action-profile': 'field-inset',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': prop('size') ?? 'md',
      'type': 'button',
      'disabled': !canIncrement || undefined,
      'data-disabled': dataAttr(!canIncrement),
      // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active
      'data-pressed': dataAttr(pressed === 'increment'),
      ...pressProps(1, canIncrement, 'increment'),
    }),

    getDecrementTriggerProps: () => normalize.button({
      ...parts['decrement-trigger'].attrs,
      'data-xh-action-control': '',
      'data-xh-action-profile': 'field-inset',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': prop('size') ?? 'md',
      'type': 'button',
      'disabled': !canDecrement || undefined,
      'data-disabled': dataAttr(!canDecrement),
      'data-pressed': dataAttr(pressed === 'decrement'),
      ...pressProps(-1, canDecrement, 'decrement'),
    }),
  }
}
