/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use checkbox 相关实现。

import type { Service } from '@xihan-ui/core'
import type { CheckboxApi, CheckboxSchema } from '@xihan-ui/headless'
import { checkboxMachine, connectCheckbox } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface CheckboxContext {
  api: CheckboxApi
  service: Service<CheckboxSchema>
}

export function useCheckbox(props: CheckboxSchema['props']): CheckboxContext {
  const service = useMachine(checkboxMachine, () => props)
  return { api: connectCheckbox(service, reactNormalize), service }
}
