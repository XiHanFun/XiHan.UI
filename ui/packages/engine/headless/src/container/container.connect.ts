/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 container 相关实现。

import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { ContainerApi, ContainerProps } from './container.types'
import { containerAnatomy } from './container.anatomy'

const parts = containerAnatomy.build()

/**
 * Container 无状态机：页面居中限宽的版心。最大宽度档显式写出，缺省档 lg 也写，
 * 皮肤据它取宽度，不靠缺省档不写属性的约定。根上不写 role：它只是排版用的盒子。
 */
export function connectContainer<T extends PropTypes>(
  props: ContainerProps,
  normalize: NormalizeProps<T>,
): ContainerApi<T> {
  const maxWidth = props.maxWidth ?? 'lg'
  return {
    maxWidth,
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-max-width': maxWidth,
    }),
  }
}
