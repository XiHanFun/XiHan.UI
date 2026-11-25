/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use focus trap 相关实现。

import type { Service } from '@xihan-ui/core'
import type { FocusTrapApi, FocusTrapSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectFocusTrap, focusTrapMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface FocusTrapContext {
  api: ComputedRef<FocusTrapApi>
  service: Service<FocusTrapSchema>
  /** 根节点：焦点陷在它里面。 */
  rootRef: Ref<HTMLElement | null>
}

export function useFocusTrap(props: FocusTrapSchema['props']): FocusTrapContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(focusTrapMachine, () => ({ ...props }), scope)
  const rootRef = ref<HTMLElement | null>(null)
  service.refs.set('getRootEl', () => rootRef.value)

  // 服务端没有焦点可陷：不给 config，机器只转移状态
  if (typeof document !== 'undefined') {
    const config = createRuntimeConfig({ scope, idGenerator: idGen })
    service.refs.set('config', config)
    // 只交登记函数：激活期间由机器入栈，停用即出栈
    service.refs.set('registerLayer', () => config.layerRegistry.register({
      // 节点就在文档流里，不锁滚动、没有遮罩；只为让开在里面的浮层、压在上面的对话框暂停它
      kind: 'inline',
      node: () => rootRef.value,
      branches: () => [],
      isModal: () => false,
      surfaces: () => [],
      // 自己不消解：Escape 越过它交给下面的层
      passesEscape: true,
    }))
  }

  const api = computed(() => connectFocusTrap(service, vueNormalize))
  return { api, service, rootRef }
}
