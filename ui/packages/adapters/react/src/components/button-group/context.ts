/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { ActionVariant, Size, Tone } from '@xihan-ui/core'
import { createContext, useContext } from 'react'

/** 整组下发给每一段的值：禁用与三个视觉轴，段自己写了的优先。 */
export interface ButtonGroupContext {
  disabled: boolean
  variant: ActionVariant
  tone: Tone | undefined
  size: Size | undefined
}

const Ctx = createContext<ButtonGroupContext | undefined>(undefined)

/** 把整组的禁用与三轴放进子树，组内的按钮据此把自己也禁用、并补上未自写的 variant / tone / size。 */
export const ButtonGroupProvider = Ctx

/** 读取外层按钮组下发的值；不在组内时为 undefined。 */
export function useButtonGroupContext(): ButtonGroupContext | undefined {
  return useContext(Ctx)
}
