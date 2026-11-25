/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 focus trap 相关实现。

import type { ComponentPropsWithRef, ReactNode } from 'react'
import { mergeReactProps } from '../../runtime/merge-props'
import { useFocusTrap } from './use-focus-trap'

export interface XhFocusTrapProps extends ComponentPropsWithRef<'div'> {
  /** 是否陷住焦点，缺省 true。由 true 变 false 时停用，按 restoreFocus 归还焦点。 */
  active?: boolean
  /** Tab 走过最后一个可聚焦元素时回到第一个、Shift+Tab 反之，缺省 true。 */
  loop?: boolean
  /** 激活时把焦点移进来，缺省 true。 */
  autoFocus?: boolean
  /** 停用或卸载时把焦点还给激活前的持有者，缺省 true。 */
  restoreFocus?: boolean
  children?: ReactNode
}

export function XhFocusTrap({
  active,
  loop,
  autoFocus,
  restoreFocus,
  children,
  ...rest
}: XhFocusTrapProps): ReactNode {
  const { api, rootRef } = useFocusTrap({ active, loop, autoFocus, restoreFocus })
  return (
    <div {...mergeReactProps(api.getRootProps(), rest, { ref: rootRef })}>
      {children}
    </div>
  )
}
