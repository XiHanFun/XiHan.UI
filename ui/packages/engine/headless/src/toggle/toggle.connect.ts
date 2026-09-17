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
  // 缺省中性淡底（真源 §7.2 第 2 条：只有 Button 缺省品牌实心）
  const variant = prop('variant') ?? 'subtle'
  // 家族形态矩阵按 data-xh-action-variant 给未选中的面：solid 只在按下（on）时才是品牌实心，
  // 未按下时投 ghost（透明底、白底承载 hover 100 → pressed 200）；其余三档原样投影，
  // 选中面（品牌淡底 + fg-on-brand-subtle，§7.3 无滑块开关）由皮肤在 data-state='on' 上桥接
  const actionVariant = variant === 'solid' ? (pressed ? 'solid' : 'ghost') : variant
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
      'data-xh-action-variant': actionVariant,
      'data-variant': variant,
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
