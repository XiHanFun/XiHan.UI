/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { ActionVariant, Size, Tone } from '@xihan-ui/core'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

/** 整组下发给每一段的值：禁用与三个视觉轴，段自己写了的优先。 */
export interface ButtonGroupContext {
  disabled: boolean
  variant: ActionVariant
  tone: Tone | undefined
  size: Size | undefined
}

const CONTEXT_KEY: InjectionKey<ComputedRef<ButtonGroupContext>> = Symbol.for('xh-button-group')

/** 把整组的禁用与三轴放进子树，组内的按钮据此把自己也禁用、并补上未自写的 variant / tone / size。 */
export function provideButtonGroupContext(context: ComputedRef<ButtonGroupContext>): void {
  provide(CONTEXT_KEY, context)
}

/** 读取外层按钮组下发的值；不在组内时为 null。 */
export function useButtonGroupContext(): ComputedRef<ButtonGroupContext> | null {
  return inject(CONTEXT_KEY, null)
}
