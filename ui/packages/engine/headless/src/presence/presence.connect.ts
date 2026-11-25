/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 presence 相关实现。

import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { PresenceApi, PresenceProps } from './presence.types'
import { dataAttr } from '@xihan-ui/core'
import { presenceAnatomy } from './presence.anatomy'

const parts = presenceAnatomy.build()

/**
 * Presence 无状态机：在场与否由 present 决定，退场要等多久由适配器的退场闸门量
 * （与浮层、披露内容同一套），这里把两件事合成根上的 data-state、data-instant、inert、hidden 与内容的挂载判定。
 * 根上不写 role：里面是什么由作者决定，它只管进出场。
 */
export function connectPresence<T extends PropTypes>(
  props: PresenceProps,
  normalize: NormalizeProps<T>,
): PresenceApi<T> {
  const present = !!props.present
  const lazyMount = props.lazyMount ?? true
  const unmountOnExit = props.unmountOnExit ?? true
  return {
    present,
    isContentMounted: (visible, mountedOnce) => {
      if (visible)
        return true
      if (lazyMount && !mountedOnce)
        return false
      return !unmountOnExit
    },
    getRootProps: (visible, presentChanged) => normalize.element({
      ...parts.root.attrs,
      'data-state': present ? 'open' : 'closed',
      'data-instant': dataAttr(present && !presentChanged),
      // 退场那一段内容还看得见，但已经不在场：焦点与读屏一并让开，不止挡指针
      'inert': !present || undefined,
      'hidden': visible ? undefined : true,
    }),
  }
}
