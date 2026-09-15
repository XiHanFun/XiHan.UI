/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 input group 相关实现。

import type { Size } from '@xihan-ui/core'
import type { InputGroupProps, InputGroupVariant } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectInputGroup } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { InputGroupProvider, useInputGroupContext } from './context'

export interface XhInputGroupRootProps extends ComponentPropsWithRef<'div'> {
  /** 视觉变体：primary 是默认输入面，secondary 用于已有表面。 */
  variant?: InputGroupVariant
  /** 档位：落到根上，皮肤据此为前后缀块更换高度与字号。 */
  size?: Size
}

/** 一排控件拼为一段：组内每一段由作者自行写进 children，中缝合并与首尾圆角由皮肤按身份给出。 */
export function XhInputGroupRoot({ variant, size, children, ...rest }: XhInputGroupRootProps): ReactNode {
  const api = connectInputGroup(withXhConfig('input-group', { variant, size } as InputGroupProps), reactNormalize)
  return (
    <InputGroupProvider value={{ api }}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </InputGroupProvider>
  )
}

export interface XhInputGroupItemProps extends ComponentPropsWithRef<'span'> {}

/** 前后缀块：文本由作者写，高度、描边与圆角由皮肤按该身份给出。 */
export function XhInputGroupItem({ children, ...rest }: XhInputGroupItemProps): ReactNode {
  const ctx = useInputGroupContext()
  return (
    <span {...mergeReactProps(ctx.api.getItemProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}
