/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use toast 相关实现。

import type { ToastApi, ToastSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { connectToast, toastMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useToastExit } from './use-toast-exit'

export interface ToastContext {
  api: ComputedRef<ToastApi>
  /** 根节点：退场动画从它上面探测。 */
  rootRef: Ref<HTMLElement | null>
}

export function useToast(
  props: ToastSchema['props'],
  onStatusChange?: ToastSchema['props']['onStatusChange'],
  onAction?: ToastSchema['props']['onAction'],
): ToastContext {
  const service = useMachine(toastMachine, () => ({ ...props, onStatusChange, onAction }))
  const api = computed(() => connectToast(service, vueNormalize))
  const rootRef = ref<HTMLElement | null>(null)
  useToastExit({ service, isOpen: () => api.value.status === 'visible', rootRef })
  return { api, rootRef }
}
