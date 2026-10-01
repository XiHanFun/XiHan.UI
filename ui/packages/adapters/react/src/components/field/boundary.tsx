/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 field boundary 相关实现。

import type { ReactNode } from 'react'
import { FormFieldProvider } from '../form/context'
import { FieldProvider } from './context'

export interface XhFieldBoundaryProps {
  children?: ReactNode
}

/**
 * 字段边界：子树里的控件不再继承外层字段的标签、说明、状态与控件 id，表单字段组也一并断开。
 * 组合控件把自己的内部输入（图标选择器里的搜索框、筛选框）包进来，它们就不会被读成外层字段的名字，
 * 两个封装同处一个字段时也不会拿到同一个 id。本身不渲染节点；浮层内容经 Portal 搬走时已自动断开。
 */
export function XhFieldBoundary({ children }: XhFieldBoundaryProps): ReactNode {
  return (
    <FieldProvider value={undefined}>
      <FormFieldProvider value={undefined}>{children}</FormFieldProvider>
    </FieldProvider>
  )
}
