/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use signature pad 相关实现。

import type { Service } from '@xihan-ui/core'
import type { SignaturePadApi, SignaturePadSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectSignaturePad, signaturePadMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface SignaturePadContext {
  /**
   * 已渲染的 label 部件数量，由 XhSignaturePadLabel 在 setup 里同步登记、卸载时撤销。
   * 可聚焦部件的 aria-labelledby 据此决定指不指过去：label 排在输入之前时，首帧与服务端直出就带上名字。
   */
  labelCount: Ref<number>
  api: ComputedRef<SignaturePadApi>
  service: Service<SignaturePadSchema>
  /** 画布节点，状态机在指针事件中用它把屏幕坐标换算为画布坐标。 */
  controlRef: Ref<Element | null>
}

export function useSignaturePad(
  props: SignaturePadSchema['props'],
  callbacks: Pick<SignaturePadSchema['props'], 'onDraw' | 'onDrawEnd' | 'onValueChange'> = {},
): SignaturePadContext {
  const controlRef = ref<Element | null>(null)

  // scope id 走 Vue 的 useId，保证同页多实例的 IDREF 不相撞
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const labelCount = ref(0)
  const service = useMachine(signaturePadMachine, () => ({ ...props, labelled: labelCount.value > 0, ...callbacks }), scope)

  // 传 getter 而非节点，ref 在挂载后才有值
  service.refs.set('getControlEl', () => controlRef.value)

  const api = computed(() => connectSignaturePad(service, vueNormalize))
  return { labelCount, api, service, controlRef }
}
