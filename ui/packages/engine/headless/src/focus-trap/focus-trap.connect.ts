/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 focus trap 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { FocusTrapApi, FocusTrapSchema } from './focus-trap.types'
import { focusTrapAnatomy } from './focus-trap.anatomy'

const parts = focusTrapAnatomy.build()

/**
 * 根上不写 role：里面是什么由作者决定，它只管焦点。激活期间根带 tabindex=-1，
 * 里面一个可聚焦元素都没有时焦点落到根上，不至于掉回 body。
 */
export function connectFocusTrap<T extends PropTypes>(
  service: Service<FocusTrapSchema>,
  normalize: NormalizeProps<T>,
): FocusTrapApi<T> {
  const active = service.state.get() === 'active'
  return {
    active,
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'tabindex': active ? -1 : undefined,
      'data-state': active ? 'active' : 'inactive',
    }),
  }
}
