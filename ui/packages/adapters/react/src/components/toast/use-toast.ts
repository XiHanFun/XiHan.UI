/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use toast 相关实现。

import type { Service } from '@xihan-ui/core'
import type { ToastApi, ToastSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectToast, toastMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useToastExit } from './use-toast-exit'

export interface ToastContext {
  api: ToastApi
  service: Service<ToastSchema>
  /** 根节点：退场动画从它上面探测。 */
  rootRef: RefObject<HTMLElement | null>
}

export function useToast(props: ToastSchema['props']): ToastContext {
  const service = useMachine(toastMachine, () => props)
  const api = connectToast(service, reactNormalize)
  const rootRef = useRef<HTMLElement | null>(null)
  useToastExit({ service, isOpen: () => api.status === 'visible', rootRef })
  return { api, service, rootRef }
}
