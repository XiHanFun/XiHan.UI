/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use code view 相关实现。

import type { Service } from '@xihan-ui/core'
import type { CodeViewApi, CodeViewProps, CodeViewSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { codeViewMachine, connectCodeView } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface CodeViewContext {
  api: ComputedRef<CodeViewApi>
  service: Service<CodeViewSchema>
  /**
   * 作者渲染的 filename 部件数量，由 XhCodeViewFilename 自行登记。
   * pre 的可访问名据此决定指向它还是使用文案兜底：只检查 filename 这个 prop 是否有值并不够，
   * 传了值却未写节点时 aria-labelledby 会指向一个不存在的 id。
   */
  filenameCount: Ref<number>
}

// 机器只承载按压通道；实例级 scope 派生 part id，props 与登记数变了由 computed 重算属性
export function useCodeView(props: CodeViewProps): CodeViewContext {
  const scope = createScope(null, createVueIdGenerator())
  const filenameCount = ref(0)
  const service = useMachine(codeViewMachine, () => ({
    ...props,
    labelled: filenameCount.value > 0,
  }), scope)
  const api = computed(() => connectCodeView(service, vueNormalize))
  return { api, service, filenameCount }
}
