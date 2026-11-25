/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use focus trap 相关实现。

import type { Service } from '@xihan-ui/core'
import type { FocusTrapApi, FocusTrapSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { createRuntimeConfig } from '@xihan-ui/core'
import { connectFocusTrap, focusTrapMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface FocusTrapContext {
  api: FocusTrapApi
  service: Service<FocusTrapSchema>
  /** 根节点：焦点陷在它里面。 */
  rootRef: RefObject<HTMLElement | null>
}

export function useFocusTrap(props: FocusTrapSchema['props']): FocusTrapContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const service = useMachine(focusTrapMachine, () => props, {
    scope,
    // 每次（重）建机器都要重注：refs 属于机器实例，StrictMode 重建的新机器不会继承旧的
    onCreate: (svc) => {
      svc.refs.set('getRootEl', () => rootRef.current)
      // 服务端没有焦点可陷：不给 config，机器只转移状态
      if (typeof document === 'undefined')
        return
      const config = createRuntimeConfig({ scope, idGenerator })
      svc.refs.set('config', config)
      // 只交登记函数：激活期间由机器入栈，停用即出栈
      svc.refs.set('registerLayer', () => config.layerRegistry.register({
        // 节点就在文档流里，不锁滚动、没有遮罩；只为让开在里面的浮层、压在上面的对话框暂停它
        kind: 'inline',
        node: () => rootRef.current,
        branches: () => [],
        isModal: () => false,
        surfaces: () => [],
        // 自己不消解：Escape 越过它交给下面的层
        passesEscape: true,
      }))
    },
  })
  return { api: connectFocusTrap(service, reactNormalize), service, rootRef }
}
