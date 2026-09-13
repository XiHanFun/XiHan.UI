/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use toast 相关实现。

import type { Service } from '@xihan-ui/core'
import type { ToastApi, ToastSchema } from '@xihan-ui/headless'
import { connectToast, toastMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface ToastContext {
  api: ToastApi
  service: Service<ToastSchema>
}

export function useToast(props: ToastSchema['props']): ToastContext {
  const service = useMachine(toastMachine, () => props)
  return { api: connectToast(service, reactNormalize), service }
}
