/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use back top 相关实现。

import type { Service } from '@xihan-ui/core'
import type { BackTopApi, BackTopSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { backTopMachine, connectBackTop } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface BackTopContext {
  api: ComputedRef<BackTopApi>
  service: Service<BackTopSchema>
}

/** getTargetEl 返回滚动容器，null 即整页滚动；滚动量的观察在状态机的效应中运行。 */
export function useBackTop(
  props: BackTopSchema['props'],
  onVisibilityChange?: BackTopSchema['props']['onVisibilityChange'],
  getTargetEl: () => HTMLElement | null = () => null,
): BackTopContext {
  const service = useMachine(backTopMachine, () => ({ ...props, onVisibilityChange }))

  service.refs.set('getTargetEl', getTargetEl)

  const api = computed(() => connectBackTop(service, vueNormalize))
  return { api, service }
}
