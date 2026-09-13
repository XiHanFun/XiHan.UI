/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use text field 相关实现。

import type { TextFieldApi, TextFieldSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectTextField, textFieldMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface TextFieldContext {
  api: ComputedRef<TextFieldApi>
}

export function useTextField(
  props: TextFieldSchema['props'],
  onValueChange?: TextFieldSchema['props']['onValueChange'],
): TextFieldContext {
  const service = useMachine(textFieldMachine, () => ({ ...props, onValueChange }))
  const api = computed(() => connectTextField(service, vueNormalize))
  return { api }
}
