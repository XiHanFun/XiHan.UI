/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 checkbox 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { CheckboxApi, CheckboxCheckedState, CheckboxSchema } from './checkbox.types'
import { dataAttr } from '@xihan-ui/core'
import { pressHandlers } from '../shared/press'
import { checkboxAnatomy } from './checkbox.anatomy'

const parts = checkboxAnatomy.build()

export function connectCheckbox<T extends PropTypes>(
  service: Service<CheckboxSchema>,
  normalize: NormalizeProps<T>,
): CheckboxApi<T> {
  const { state, prop, send, context } = service
  const current = state.get()
  const checked: CheckboxCheckedState = current === 'indeterminate' ? 'indeterminate' : current === 'on'
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const required = !!prop('required')
  const stateAttr = current === 'indeterminate' ? 'indeterminate' : current === 'on' ? 'checked' : 'unchecked'

  // 半选态下 TOGGLE 只表达得了「走向全选」，所以命令式设值走 CHECK / UNCHECK
  const setChecked = (next: boolean): void => {
    if (next !== checked)
      send({ type: next ? 'CHECK' : 'UNCHECK' })
  }

  // 键盘 / 触屏按住期间的按压面；指针按住由 :active 表出，皮肤两者同一档。方框是原生按钮，
  // Space 与 Enter 都是激活键（平台翻成 click），两键都进按压通道；与勾选态互相独立
  const press = pressHandlers(service)

  return {
    checked,
    setChecked,
    getRootProps: () => normalize.button({
      ...parts.root.attrs,
      'type': 'button',
      'role': 'checkbox',
      // 三态：勾了一部分的父项报 mixed，读屏才念得出「部分选中」
      'aria-checked': checked === 'indeterminate' ? 'mixed' : checked ? 'true' : 'false',
      'disabled': disabled || undefined,
      // 只读不能用原生 disabled 表达：那会连焦点一起拿掉，且不再提交值
      'aria-readonly': readOnly ? 'true' : 'false',
      'aria-invalid': invalid ? 'true' : 'false',
      'aria-required': required ? 'true' : 'false',
      // 方框是定尺的独立动作控件（§9.1「方框」）：接 Action Control icon 档、outline 形态——盒型、悬停 / 按下 / 禁用面、
      // 0.97 缩放与换底、粗指针 44px 热区、焦点环由家族配方给，皮肤只把使用者槽映射到桥接槽；
      // 边长仍按 --xh-control-indicator-* 走（皮肤覆盖 --xh-action-visual-size），data-xh-action-size 只定字形档
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-variant': 'outline',
      'data-xh-action-display': 'always',
      'data-xh-action-size': prop('size') ?? 'md',
      'data-state': stateAttr,
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-required': dataAttr(required),
      'data-pressed': dataAttr(context.get('pressed')),
      'onClick': () => {
        if (!disabled && !readOnly)
          send({ type: 'TOGGLE' })
      },
      'onKeyDown': press.onKeyDown,
      'onKeyUp': press.onKeyUp,
      'onBlur': press.onBlur,
      'onPointerDown': press.onPointerDown,
      'onPointerUp': press.onPointerUp,
      'onPointerCancel': press.onPointerCancel,
    }),
    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      'data-state': stateAttr,
      'aria-hidden': true,
    }),

    getHiddenInputProps: () => normalize.input({
      // type 先于 value 写入：改 type 会重置输入的值
      type: 'hidden',
      ...parts['hidden-input'].attrs,
      // 半选按未勾处理：原生里 indeterminate 只是外观，提交与否看 checked
      name: checked === true ? prop('name') : undefined,
      value: prop('value') ?? 'on',
      // 单体控件用原生 disabled，禁用时不提交值
      disabled: disabled || undefined,
    }),
    // <label> 包住 <button>：button 是 labelable 元素，点文字即激活它，可及名也从这里取
    getLabelProps: () => normalize.label({
      ...parts.label.attrs,
      'data-state': stateAttr,
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
    }),
    getTextProps: () => normalize.element({
      ...parts.text.attrs,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-invalid': dataAttr(invalid),
    }),
  }
}
