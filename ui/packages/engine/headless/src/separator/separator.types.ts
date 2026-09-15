/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 separator 类型契约。

import type { PropTypes } from '@xihan-ui/core'

/** 线的绘制方式：材质自适应默认线 / 低对比弱线 / 高对比强线。与业务语气无关。 */
export type SeparatorVariant = 'default' | 'strong' | 'subtle'

/** 分节文字的位置。仅在渲染了 content 时生效。 */
export type SeparatorAlign = 'center' | 'end' | 'start'

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  /** 装饰性分隔：仅视觉分组，root 通过 role=none + aria-hidden 完整退出无障碍树。 */
  decorative?: boolean
  /** 线的绘制方式，默认 default；默认档不输出 data-variant。 */
  variant?: SeparatorVariant
  /** 绘制为虚线；实线段与空白段的长度使用 --xh-separator-dash-length / -dash-gap 两个槽。 */
  dashed?: boolean
  /** 分节文字的位置，默认居中；默认档不输出 data-align。 */
  align?: SeparatorAlign
}

export interface SeparatorApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getLineProps: () => T['element']
  getContentProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface SeparatorTranslations {}
