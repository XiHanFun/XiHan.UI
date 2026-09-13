/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use alert 相关实现。

import type { Service } from '@xihan-ui/core'
import type { AlertApi, AlertSchema } from '@xihan-ui/headless'
import { alertMachine, connectAlert } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface AlertContext {
  api: AlertApi
  service: Service<AlertSchema>
}

export function useAlert(props: AlertSchema['props']): AlertContext {
  const scope = useReactScope()
  const service = useMachine(alertMachine, () => props, { scope })
  return { api: connectAlert(service, reactNormalize), service }
}
