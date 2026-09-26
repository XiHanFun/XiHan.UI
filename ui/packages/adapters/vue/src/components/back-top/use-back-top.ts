/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use back top 相关实现。

import type { Service } from '@xihan-ui/core'
import type { BackTopApi, BackTopSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { backTopMachine, connectBackTop } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

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
  // 按钮带 id（机器按它等退场、接液态面）：用 Vue 的 useId 派生的 scope，服务端与水合两侧同号
  const service = useMachine(backTopMachine, () => ({ ...props, onVisibilityChange }), createScope(null, createVueIdGenerator()))

  service.refs.set('getTargetEl', getTargetEl)

  const api = computed(() => connectBackTop(service, vueNormalize))
  return { api, service }
}
