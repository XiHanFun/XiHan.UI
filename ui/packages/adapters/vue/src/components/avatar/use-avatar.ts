/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use avatar 相关实现。

import type { Service } from '@xihan-ui/core'
import type { AvatarApi, AvatarSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { avatarMachine, connectAvatar } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface AvatarContext {
  service: Service<AvatarSchema>
  api: ComputedRef<AvatarApi>
}

export function useAvatar(
  props: AvatarSchema['props'],
  onStatusChange?: AvatarSchema['props']['onStatusChange'],
): AvatarContext {
  // 回退节点带 scope 派生的 id：图片载好后按它找到节点，等回退内容淡出播完再藏起
  const service = useMachine(avatarMachine, () => ({ ...props, onStatusChange }), createScope(null, createVueIdGenerator()))
  const api = computed(() => connectAvatar(service, vueNormalize))
  return { service, api }
}
