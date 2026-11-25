/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 container 相关实现。

import type { ContainerMaxWidth, ContainerProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectContainer } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'

export interface XhContainerProps extends ComponentPropsWithRef<'div'> {
  /** 最大宽度档：sm / md / lg / xl 与同名断点同宽，full 不限宽；缺省 lg。 */
  maxWidth?: ContainerMaxWidth
}

/**
 * 页面居中限宽的版心：根是一个 div，最大宽度档落成 data-max-width，
 * 宽度、居中与左右内衬由皮肤按档位与视口给出。根上不写 role：它只是排版用的盒子。
 */
export function XhContainer({ maxWidth, children, ...rest }: XhContainerProps): ReactNode {
  // 没有状态机，全局配置（组件级缺省）在这里并进来
  const configured = withXhConfig('container', { maxWidth })
  const api = connectContainer({
    maxWidth: configured.maxWidth,
  } satisfies ContainerProps, reactNormalize)
  return (
    <div {...mergeReactProps(api.getRootProps(), rest)}>
      {children}
    </div>
  )
}
