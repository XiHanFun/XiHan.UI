/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 card 相关实现。

import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { CardApi, CardProps } from './card.types'
import { cardAnatomy } from './card.anatomy'

const parts = cardAnatomy.build()

// Card 无状态机：卡片不持有任何交互状态，属性全部由 props 算出。
// 根上不写 role：卡片是不是地标、要不要可及名字，由里面放了什么内容决定，作者自己声明。
export function connectCard<T extends PropTypes>(
  props: CardProps,
  normalize: NormalizeProps<T>,
): CardApi<T> {
  const variant = props.variant ?? 'outline'
  const rootAttrs = {
    ...parts.root.attrs,
    'data-variant': variant,
  }

  return {
    getRootProps: () => normalize.element(rootAttrs),
    getHeaderProps: () => normalize.element(parts.header.attrs),
    getTitleProps: () => normalize.element(parts.title.attrs),
    getDescriptionProps: () => normalize.element(parts.description.attrs),
    getContentProps: () => normalize.element(parts.content.attrs),
    getFooterProps: () => normalize.element(parts.footer.attrs),
  }
}
