/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use avatar 相关实现。

import type { Service } from '@xihan-ui/core'
import type { AvatarApi, AvatarSchema } from '@xihan-ui/headless'
import { avatarMachine, connectAvatar } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface AvatarContext {
  service: Service<AvatarSchema>
  api: AvatarApi
}

export function useAvatar(props: AvatarSchema['props']): AvatarContext {
  // 回退节点带 scope 派生的 id：图片载好后按它找到节点，等回退内容淡出播完再藏起
  const service = useMachine(avatarMachine, () => props, { scope: useReactScope() })
  return { service, api: connectAvatar(service, reactNormalize) }
}
