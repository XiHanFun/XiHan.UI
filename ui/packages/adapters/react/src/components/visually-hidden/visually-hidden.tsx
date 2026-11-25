/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 visually hidden 相关实现。

import type { VisuallyHiddenProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectVisuallyHidden } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'

export interface XhVisuallyHiddenProps extends ComponentPropsWithRef<'span'> {
  /** 获得焦点时显出来：给「跳到正文」这类跳转链接用。缺省一直藏着。 */
  focusable?: boolean
}

/**
 * 把 children 包进一个 span：屏幕上看不见、读屏照读，仍留在布局与表单里。
 *
 * 藏法全在皮肤里；`focusable` 打开后，里面的链接或按钮获得焦点时整段显出来，焦点离开再藏回去。
 */
export function XhVisuallyHidden({ focusable, children, ...rest }: XhVisuallyHiddenProps): ReactNode {
  // 没有状态机，全局配置（组件级缺省）在这里并进来
  const configured = withXhConfig('visually-hidden', { focusable })
  const api = connectVisuallyHidden({
    focusable: configured.focusable,
  } satisfies VisuallyHiddenProps, reactNormalize)
  return (
    <span {...mergeReactProps(api.getRootProps(), rest)}>
      {children}
    </span>
  )
}
