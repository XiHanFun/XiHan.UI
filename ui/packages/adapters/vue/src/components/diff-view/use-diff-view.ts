/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use diff view 相关实现。

import type { DiffViewApi, DiffViewSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectDiffView, diffViewMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

type Props = DiffViewSchema['props']

export interface DiffViewContext {
  api: ComputedRef<DiffViewApi>
  /**
   * 作者渲染的 header 部件数量，由 XhDiffViewHeader 自行登记。
   * 表格的可访问名据此决定指向头部还是直接用路径：没渲头部时指过去就是一个不存在的 id。
   */
  headerCount: Ref<number>
}

export function useDiffView(
  props: Props,
  onExpandedValueChange?: Props['onExpandedValueChange'],
  onCommentRequest?: Props['onCommentRequest'],
): DiffViewContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const headerCount = ref(0)
  const service = useMachine(diffViewMachine, () => ({
    ...props,
    labelled: headerCount.value > 0,
    onExpandedValueChange,
    onCommentRequest,
  }), scope)
  const api = computed(() => connectDiffView(service, vueNormalize))
  return { api, headerCount }
}
