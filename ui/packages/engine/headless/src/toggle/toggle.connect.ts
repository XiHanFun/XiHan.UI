/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toggle 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { ToggleApi, ToggleSchema } from './toggle.types'
import { dataAttr } from '@xihan-ui/core'
import { pressHandlers } from '../shared/press'
import { toggleAnatomy } from './toggle.anatomy'

const parts = toggleAnatomy.build()

export function connectToggle<T extends PropTypes>(
  service: Service<ToggleSchema>,
  normalize: NormalizeProps<T>,
): ToggleApi<T> {
  const { state, context, prop, send } = service
  const pressed = state.get() === 'on'
  const disabled = !!prop('disabled')
  // 键盘 / 触屏按住期间的按压面；指针按住由 :active 表出，皮肤两者同一档
  const press = pressHandlers(service)

  const setPressed = (next: boolean): void => {
    if (next !== pressed)
      send({ type: 'TOGGLE' })
  }

  return {
    pressed,
    setPressed,
    getRootProps: () => normalize.button({
      ...parts.root.attrs,
      'type': 'button',
      'aria-pressed': pressed ? 'true' : 'false',
      'disabled': disabled || undefined,
      'data-state': pressed ? 'on' : 'off',
      'data-xh-action-control': '',
      'data-xh-action-profile': prop('iconOnly') ? 'icon' : 'text',
      'data-xh-action-display': 'always',
      'data-xh-action-size': prop('size') ?? 'md',
      'data-variant': prop('variant'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-icon-only': dataAttr(!!prop('iconOnly')),
      'data-full-width': dataAttr(!!prop('fullWidth')),
      'data-disabled': dataAttr(disabled),
      'data-pressed': dataAttr(context.get('pressed')),
      'onClick': () => {
        if (!disabled)
          send({ type: 'TOGGLE' })
      },
      'onKeyDown': press.onKeyDown,
      'onKeyUp': press.onKeyUp,
      'onBlur': press.onBlur,
      'onPointerDown': press.onPointerDown,
      'onPointerUp': press.onPointerUp,
      'onPointerCancel': press.onPointerCancel,
    }),
  }
}
