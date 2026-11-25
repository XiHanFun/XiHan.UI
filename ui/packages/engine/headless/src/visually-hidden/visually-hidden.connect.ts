/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 visually hidden 相关实现。

import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { VisuallyHiddenApi, VisuallyHiddenProps } from './visually-hidden.types'
import { dataAttr } from '@xihan-ui/core'
import { visuallyHiddenAnatomy } from './visually-hidden.anatomy'

const parts = visuallyHiddenAnatomy.build()

/**
 * VisuallyHidden 无状态机：屏幕上看不见、读屏照读，仍留在布局与表单里。
 * 藏法全在皮肤里，与工具类 .xh-visually-hidden 同一组声明；这里只给身份与可聚焦时显出的开关。
 */
export function connectVisuallyHidden<T extends PropTypes>(
  props: VisuallyHiddenProps,
  normalize: NormalizeProps<T>,
): VisuallyHiddenApi<T> {
  return {
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-focusable': dataAttr(props.focusable),
    }),
  }
}
