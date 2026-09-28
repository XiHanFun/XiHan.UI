/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 avatar 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { AvatarApi, AvatarSchema } from './avatar.types'
import { avatarAnatomy } from './avatar.anatomy'
import { avatarFallbackVisible } from './avatar.machine'

const parts = avatarAnatomy.build()

export function connectAvatar<T extends PropTypes>(
  service: Service<AvatarSchema>,
  normalize: NormalizeProps<T>,
): AvatarApi<T> {
  const { state, prop, send, context, scope } = service
  const status = state.get()
  const loaded = status === 'loaded'
  const fallbackVisible = avatarFallbackVisible(status, context.get('fallbackDue'))
  // 回退内容撤下时先淡出、与图片的淡入交叉，播完才藏起
  const fallbackExiting = !fallbackVisible && context.get('fallbackRendered')

  return {
    status,
    loaded,
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': status,
      // 缺省档不写属性：皮肤的基础规则就是缺省档
      'data-size': prop('size'),
      'data-tone': prop('tone'),
    }),
    getImageProps: () => normalize.img({
      ...parts.image.attrs,
      'src': prop('src'),
      'alt': prop('alt'),
      'data-state': status,
      'hidden': !loaded || undefined,
      'onLoad': () => send({ type: 'IMAGE.LOAD' }),
      'onError': () => send({ type: 'IMAGE.ERROR' }),
    }),
    getFallbackProps: () => normalize.element({
      ...parts.fallback.attrs,
      'id': scope.partId('avatar', 'fallback'),
      'data-state': status,
      // 载入中等过 fallbackDelay 才露面；载好后淡出播完才藏起
      'hidden': (!fallbackVisible && !fallbackExiting) || undefined,
    }),
  }
}
