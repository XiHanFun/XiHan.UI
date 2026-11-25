/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 presence 相关实现。

import type { RuntimeConfig } from '@xihan-ui/core'
import type { PresenceProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { createRuntimeConfig } from '@xihan-ui/core'
import { connectPresence } from '@xihan-ui/headless'
import { useEffect, useMemo, useRef, useState } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { useOverlayExit } from '../../runtime/use-overlay-exit'

export interface XhPresenceProps extends ComponentPropsWithRef<'div'> {
  /** 是否在场，缺省 false。变 false 时等退场动画播完才撤下内容。 */
  present?: boolean
  /** 第一次在场之前不挂内容，缺省 true。 */
  lazyMount?: boolean
  /** 退场播完后卸掉内容，缺省 true；写 false 时内容留着、根上带 hidden。 */
  unmountOnExit?: boolean
  /** 退场动画播完、内容撤下之后通知；初始就不在场时不通知。 */
  onExitComplete?: PresenceProps['onExitComplete']
  children?: ReactNode
}

/**
 * 让 children 按 present 进场与退场：退场动画播完才撤下，撤下之后通知 onExitComplete。
 *
 * 只管「在不在」与等动画，不带角色、不接按键；里面是什么、怎么读，由内容自己决定。
 */
export function XhPresence({ present, lazyMount, unmountOnExit, onExitComplete, children, ...rest }: XhPresenceProps): ReactNode {
  // 没有状态机，全局配置（组件级缺省）在这里并进来
  const configured = withXhConfig('presence', { present, lazyMount, unmountOnExit })
  const api = connectPresence({
    present: configured.present,
    lazyMount: configured.lazyMount,
    unmountOnExit: configured.unmountOnExit,
  } satisfies PresenceProps, reactNormalize)

  // 服务端没有 DOM、也就没有退场：config 传 null 时闸门退化成「跟着 present」
  const config = useMemo<RuntimeConfig | null>(() => (typeof document === 'undefined' ? null : createRuntimeConfig()), [])
  const rootRef = useRef<HTMLElement | null>(null)
  // 退场播完之前保持为真：hidden、内联 display 与内容的卸载都跟着它落
  const visible = useOverlayExit({ config, isOpen: () => api.present, contentRef: rootRef })

  // present 变过没有：交给 connect 判首帧就在场的那一段直接呈现
  const [initialPresent] = useState(api.present)
  const [moved, setMoved] = useState(false)
  const changed = moved || api.present !== initialPresent
  if (changed && !moved)
    setMoved(true)
  // 在场过一次：lazyMount 只拦第一次在场之前那一段
  const [mountedOnce, setMountedOnce] = useState(api.present)
  const once = mountedOnce || api.present
  if (once && !mountedOnce)
    setMountedOnce(true)

  // 退场播完、这一帧把内容撤下之后才通知：等提交之后再调
  const notify = useRef(onExitComplete)
  notify.current = onExitComplete
  const wasVisible = useRef(visible)
  useEffect(() => {
    if (wasVisible.current && !visible)
      notify.current?.()
    wasVisible.current = visible
  }, [visible])

  return (
    <div
      {...mergeReactProps(
        api.getRootProps(visible, changed),
        rest,
        {
          // 宿主的 [hidden]{display:none!important} 之外再写一道内联 display：作者给根声明过 display 时，hidden 压不住
          style: visible ? undefined : { display: 'none' },
          ref: (el: HTMLDivElement | null) => { rootRef.current = el },
        },
      )}
    >
      {api.isContentMounted(visible, once) ? children : null}
    </div>
  )
}

XhPresence.xhEvents = ['exit-complete'] as const
